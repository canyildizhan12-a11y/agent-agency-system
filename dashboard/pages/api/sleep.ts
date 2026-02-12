import type { NextApiRequest, NextApiResponse } from 'next';
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

  try {
    const sleepFile = path.join(AGENCY_DIR, 'sleeping_agents', `${id.toLowerCase()}.json`);
    
    // Update agent status to sleeping
    const agentData = {
      agent_id: id.toLowerCase(),
      name: id.charAt(0).toUpperCase() + id.slice(1),
      status: 'sleeping',
      current_task: null,
      last_active: new Date().toISOString(),
      sleep_reason: 'User requested',
      updated_at: new Date().toISOString()
    };

    fs.writeFileSync(sleepFile, JSON.stringify(agentData, null, 2));

    // Get agent emoji
    const emojis: Record<string, string> = {
      henry: '🦉', scout: '🔍', pixel: '🎨', echo: '💾',
      quill: '✍️', codex: '🏗️', alex: '🛡️', vega: '📊'
    };

    res.status(200).json({
      success: true,
      agentId: id,
      agentName: id.charAt(0).toUpperCase() + id.slice(1),
      agentEmoji: emojis[id.toLowerCase()] || '🤖',
      status: 'sleeping',
      message: `${id.charAt(0).toUpperCase() + id.slice(1)} is now sleeping`
    });
  } catch (err: any) {
    console.error('Error putting agent to sleep:', err);
    res.status(500).json({ error: err.message });
  }
}
