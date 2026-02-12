import type { NextApiRequest, NextApiResponse } from 'next';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';

const AGENT_IDENTITIES: Record<string, { name: string; emoji: string }> = {
  henry: { name: 'Henry', emoji: '🦉' },
  scout: { name: 'Scout', emoji: '🔍' },
  pixel: { name: 'Pixel', emoji: '🎨' },
  echo: { name: 'Echo', emoji: '💾' },
  quill: { name: 'Quill', emoji: '✍️' },
  codex: { name: 'Codex', emoji: '🏗️' },
  alex: { name: 'Alex', emoji: '🛡️' },
  vega: { name: 'Vega', emoji: '📊' }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return handleChat(req, res);
  } else if (req.method === 'GET') {
    return handleGetHistory(req, res);
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleChat(req: NextApiRequest, res: NextApiResponse) {
  const { agentId, message } = req.body;
  
  if (!agentId || !message) {
    return res.status(400).json({ error: 'Agent ID and message required' });
  }

  const identity = AGENT_IDENTITIES[agentId.toLowerCase()];
  if (!identity) {
    return res.status(400).json({ error: `Unknown agent: ${agentId}` });
  }

  try {
    const session = getAgentSession(agentId);
    if (!session || session.status !== 'active') {
      return res.status(400).json({
        error: `${identity.name} is sleeping. Wake them up first.`,
        status: 'sleeping'
      });
    }

    const messageId = generateUUID();
    const timestamp = new Date().toISOString();
    
    // Save user message
    const chatFile = path.join(AGENCY_DIR, 'chat_history', `${agentId}.json`);
    const history = loadHistory(chatFile);
    
    history.push({
      sender: 'user',
      message,
      timestamp,
      messageId,
      sessionKey: session.sessionKey
    });

    // === CALL OPENCLAW CLI DIRECTLY ===
    const fullMessage = `${identity.emoji} [${identity.name}] Can says: "${message}"`;
    const uuid = session.sessionKey.split(':').pop(); // Extract UUID from session key
    
    console.log(`[Chat] Calling openclaw agent --session-id ${uuid} -m "${message.substring(0, 50)}..."`);
    
    const response = await callOpenClawCLI(uuid, fullMessage);
    
    // Save agent response
    history.push({
      sender: 'agent',
      message: response,
      timestamp: new Date().toISOString(),
      messageId,
      sessionKey: session.sessionKey,
      status: 'completed'
    });
    
    saveHistory(chatFile, history);

    // Return immediately with response
    res.status(200).json({
      success: true,
      agentId,
      agentName: identity.name,
      agentEmoji: identity.emoji,
      message,
      response,
      sessionKey: session.sessionKey,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('Error in chat:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Failed to process message'
    });
  }
}

function callOpenClawCLI(sessionUuid: string, message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`[CLI] openclaw agent --session-id ${sessionUuid} -m "${message.substring(0, 50)}..."`);
      
      const result = execSync(
        `openclaw agent --session-id ${sessionUuid} --message "${message.replace(/"/g, '\\"')}" --json`,
        {
          encoding: 'utf8',
          timeout: 70000, // 70 second timeout
          cwd: '/home/ubuntu/.openclaw/workspace'
        }
      );
      
      // Parse JSON response
      const data = JSON.parse(result);
      
      if (data.status === 'ok' && data.result && data.result.payloads) {
        // Extract text from first payload
        const text = data.result.payloads[0]?.text || 'No response';
        resolve(text);
      } else {
        resolve('Error: Unexpected response format');
      }
      
    } catch (err: any) {
      console.error('CLI error:', err);
      reject(new Error(`CLI failed: ${err.message}`));
    }
  });
}

async function handleGetHistory(req: NextApiRequest, res: NextApiResponse) {
  const { agentId } = req.query;
  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }

  const chatFile = path.join(AGENCY_DIR, 'chat_history', `${agentId}.json`);
  const history = loadHistory(chatFile);
  const session = getAgentSession(agentId);
  
  res.status(200).json({
    success: true,
    agentId,
    history: history.slice(-50),
    session
  });
}

function getAgentSession(agentId: string): any {
  const sessionsFile = path.join(AGENCY_DIR, 'active_sessions.json');
  if (!fs.existsSync(sessionsFile)) return null;
  try {
    const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
    return sessions.find((s: any) => s.agentId === agentId.toLowerCase() && s.status === 'active');
  } catch { return null; }
}

function loadHistory(chatFile: string): any[] {
  if (!fs.existsSync(chatFile)) return [];
  try { return JSON.parse(fs.readFileSync(chatFile, 'utf8')); } catch { return []; }
}

function saveHistory(chatFile: string, history: any[]): void {
  const dir = path.dirname(chatFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}