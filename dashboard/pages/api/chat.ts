import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnAgent } from '../../lib/openclaw';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentId, message } = req.body;
  
  if (!agentId || !message) {
    return res.status(400).json({ error: 'Agent ID and message required' });
  }
  
  try {
    // ACTUALLY send message to agent via OpenClaw
    const result = await spawnAgent(
      agentId, 
      `Can says: "${message}"\n\nRespond to Can as yourself. Be natural and helpful.`
    );
    
    // Store chat message
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
      timestamp: new Date().toISOString()
    });
    
    // The agent's response will come through OpenClaw's session
    // For now, we'll add a placeholder that gets updated
    history.push({
      sender: 'agent',
      message: '[Processing...]', // Will be updated when agent responds
      timestamp: new Date().toISOString(),
      sessionId: result.sessionId || result.childSessionKey
    });
    
    fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
    
    res.status(200).json({
      success: true,
      agentId,
      message: 'Message sent to agent',
      openclawResult: result
    });
  } catch (err: any) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
}