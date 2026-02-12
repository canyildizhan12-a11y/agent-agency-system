import type { NextApiRequest, NextApiResponse } from 'next';
import { queueMessage, getLatestResponse } from '../../lib/chatQueue';
import { spawnAgentCompressed } from '../../lib/openclaw';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return handleSendMessage(req, res);
  } else if (req.method === 'GET') {
    return handleGetResponse(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * POST /api/chat - Queue a message for processing
 */
async function handleSendMessage(req: NextApiRequest, res: NextApiResponse) {
  const { agentId, message } = req.body;
  
  if (!agentId || !message) {
    return res.status(400).json({ error: 'Agent ID and message required' });
  }
  
  try {
    // Add to queue for async processing
    const queued = queueMessage(agentId, message);
    
    // Store in chat history for UI
    const chatFile = path.join(AGENCY_DIR, 'chat_history', `${agentId}.json`);
    const chatDir = path.dirname(chatFile);
    
    if (!fs.existsSync(chatDir)) {
      fs.mkdirSync(chatDir, { recursive: true });
    }
    
    let history = [];
    if (fs.existsSync(chatFile)) {
      history = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
    }
    
    history.push({
      sender: 'user',
      message,
      timestamp: new Date().toISOString(),
      queuedId: queued.id
    });
    
    history.push({
      sender: 'agent',
      message: null, // Will be filled when processed
      timestamp: new Date().toISOString(),
      queuedId: queued.id,
      status: 'pending'
    });
    
    fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
    
    // Trigger background processing
    processQueueAsync(agentId, message, queued.id);
    
    res.status(200).json({
      success: true,
      agentId,
      messageId: queued.id,
      status: 'pending',
      message: 'Message queued for processing'
    });
  } catch (err: any) {
    console.error('Error queuing message:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/chat?agentId=xxx - Poll for response
 */
async function handleGetResponse(req: NextApiRequest, res: NextApiResponse) {
  const { agentId } = req.query;
  
  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }
  
  try {
    const response = getLatestResponse(agentId);
    const chatFile = path.join(AGENCY_DIR, 'chat_history', `${agentId}.json`);
    
    let history = [];
    if (fs.existsSync(chatFile)) {
      history = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
    }
    
    res.status(200).json({
      success: true,
      agentId,
      response: response || null,
      history: history.slice(-20) // Last 20 messages
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Background queue processor
 */
async function processQueueAsync(agentId: string, message: string, messageId: string) {
  const { updateMessageStatus } = await import('../../lib/chatQueue');
  
  try {
    updateMessageStatus(messageId, 'processing');
    
    // Use compressed prompt for efficiency
    const result = await spawnAgentCompressed(agentId, message);
    
    // Update with response
    updateMessageStatus(messageId, 'completed', result.output || result.message);
    
    // Update chat history
    const chatFile = path.join(AGENCY_DIR, 'chat_history', `${agentId}.json`);
    if (fs.existsSync(chatFile)) {
      const history = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
      const pendingMsg = history.find((h: any) => h.queuedId === messageId && h.sender === 'agent');
      
      if (pendingMsg) {
        pendingMsg.message = result.output || result.message;
        pendingMsg.status = 'completed';
        fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
      }
    }
    
    // Log token usage
    await logTokenUsage(agentId, message, result.output || result.message);
    
  } catch (err: any) {
    console.error(`Error processing message ${messageId}:`, err);
    updateMessageStatus(messageId, 'error', undefined, err.message);
  }
}

/**
 * Log token usage for Alex's analytics
 */
async function logTokenUsage(agentId: string, input: string, output: string) {
  const tokenFile = path.join(AGENCY_DIR, 'token_logs', `${new Date().toISOString().split('T')[0]}.json`);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    agentId,
    inputTokens: Math.ceil(input.length / 4), // Rough estimate
    outputTokens: Math.ceil((output?.length || 0) / 4),
    totalTokens: Math.ceil((input.length + (output?.length || 0)) / 4)
  };
  
  let logs = [];
  if (fs.existsSync(tokenFile)) {
    logs = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
  }
  
  logs.push(logEntry);
  fs.writeFileSync(tokenFile, JSON.stringify(logs, null, 2));
}