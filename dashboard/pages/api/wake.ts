import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnAgent, isAgentActive } from '../../lib/openclaw';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }

  const { task, message } = req.body;

  try {
    // Check if agent is already active
    const wasActive = isAgentActive(id);
    
    // Spawn/wake the agent
    const result = await spawnAgent(id, task || message || 'Wake up and report for duty');
    
    // Update sleeping_agents status file
    const sleepFile = path.join(AGENCY_DIR, 'sleeping_agents', `${id}.json`);
    if (fs.existsSync(sleepFile)) {
      const data = JSON.parse(fs.readFileSync(sleepFile, 'utf8'));
      data.status = 'awake';
      data.woken_at = new Date().toISOString();
      data.woken_by = 'dashboard';
      data.current_task = task || message;
      fs.writeFileSync(sleepFile, JSON.stringify(data, null, 2));
    }

    res.status(200).json({ 
      success: true, 
      message: wasActive 
        ? `📨 Message sent to ${id}` 
        : `🚀 ${id} is now awake and working`,
      agentId: id,
      wasActive,
      agentName: result.name,
      agentEmoji: result.emoji,
      wokenAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error waking agent:', err);
    res.status(500).json({ error: err.message });
  }
}
