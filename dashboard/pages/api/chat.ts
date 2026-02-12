import type { NextApiRequest, NextApiResponse } from 'next';
import { queueMessage, getLatestResponse } from '../../lib/chatQueue';
import { getAgentSession } from '../../lib/subagentManager';
import { queueMessageForSubagent } from '../../lib/chatBridge';
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
 * POST /api/chat - Send message to agent
 * If subagent session exists, route to it. Otherwise queue for main agent.
 */
async function handleSendMessage(req: NextApiRequest, res: NextApiResponse) {
  const { agentId, message } = req.body;
  
  if (!agentId || !message) {
    return res.status(400).json({ error: 'Agent ID and message required' });
  }
  
  try {
    // Check if there's an active subagent session
    const session = getAgentSession(agentId);
    
    if (session && session.status === 'active') {
      // Route to active subagent session
      const chatFile = path.join(AGENCY_DIR, 'chat_history', `${agentId}.json`);
      const chatDir = path.dirname(chatFile);
      
      if (!fs.existsSync(chatDir)) {
        fs.mkdirSync(chatDir, { recursive: true });
      }
      
      let history = [];
      if (fs.existsSync(chatFile)) {
        history = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
      }
      
      const messageId = generateUUID();
      
      history.push({
        sender: 'user',
        message,
        timestamp: new Date().toISOString(),
        messageId,
        sessionKey: session.sessionKey
      });
      
      history.push({
        sender: 'agent',
        message: null,
        timestamp: new Date().toISOString(),
        messageId,
        sessionKey: session.sessionKey,
        status: 'pending'
      });
      
      fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
      
      // Send to subagent session
      sendToSubagentSession(session.sessionKey, agentId, message, messageId);
      
      res.status(200).json({
        success: true,
        agentId,
        messageId,
        sessionKey: session.sessionKey,
        status: 'sent_to_subagent',
        message: `Message sent to ${agentId} via subagent session`
      });
    } else {
      // No active subagent - queue for main agent to spawn
      const queued = queueMessage(agentId, message);
      
      res.status(202).json({
        success: true,
        agentId,
        messageId: queued.id,
        status: 'queued_for_spawn',
        message: `${agentId} is sleeping. Message queued - wake the agent to process.`
      });
    }
  } catch (err: any) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Send message to subagent session
 */
async function sendToSubagentSession(
  sessionKey: string, 
  agentId: string, 
  message: string,
  messageId: string
) {
  try {
    const identity = getAgentIdentity(agentId);
    const fullMessage = `${identity.emoji} [${identity.name}] Can says: "${message}"`;
    
    // Queue message for the bridge (main agent will poll and send via sessions_send)
    queueMessageForSubagent(agentId, sessionKey, fullMessage);
    
    // Update status
    const { updateMessageStatus } = await import('../../lib/chatQueue');
    updateMessageStatus(messageId, 'processing');
    
    console.log(`[Chat] Queued message for ${sessionKey}: ${message.substring(0, 50)}...`);
    
  } catch (err) {
    console.error('Error sending to subagent:', err);
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
    const session = getAgentSession(agentId);
    
    let history = [];
    if (fs.existsSync(chatFile)) {
      history = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
    }
    
    res.status(200).json({
      success: true,
      agentId,
      response: response || null,
      history: history.slice(-20),
      session: session ? {
        sessionKey: session.sessionKey,
        status: session.status,
        initialized: session.initialized
      } : null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

function getAgentIdentity(agentId: string): { name: string; emoji: string } {
  const identities: Record<string, { name: string; emoji: string }> = {
    henry: { name: 'Henry', emoji: '🦉' },
    scout: { name: 'Scout', emoji: '🔍' },
    pixel: { name: 'Pixel', emoji: '🎨' },
    echo: { name: 'Echo', emoji: '💾' },
    quill: { name: 'Quill', emoji: '✍️' },
    codex: { name: 'Codex', emoji: '🏗️' },
    alex: { name: 'Alex', emoji: '🛡️' },
    vega: { name: 'Vega', emoji: '📊' }
  };
  
  return identities[agentId.toLowerCase()] || { name: agentId, emoji: '🤖' };
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}