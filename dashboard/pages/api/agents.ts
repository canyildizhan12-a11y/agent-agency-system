import type { NextApiRequest, NextApiResponse } from 'next';
import { getActiveSessions, isAgentAwake, getAgentSession } from '../../lib/subagentManager';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';

// Agent definitions with their details
const AGENTS = [
  { id: 'henry', name: 'Henry', emoji: '🦉', role: 'Team Lead' },
  { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Research' },
  { id: 'pixel', name: 'Pixel', emoji: '🎨', role: 'Creative' },
  { id: 'echo', name: 'Echo', emoji: '💾', role: 'Memory' },
  { id: 'quill', name: 'Quill', emoji: '✍️', role: 'Documentation' },
  { id: 'codex', name: 'Codex', emoji: '🏗️', role: 'Architecture' },
  { id: 'alex', name: 'Alex', emoji: '🛡️', role: 'Security Lead' },
  { id: 'vega', name: 'Vega', emoji: '📊', role: 'Data Analyst' }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get real active sessions
    const activeSessions = getActiveSessions();
    
    // Map agents with their real session status
    const agentsWithStatus = AGENTS.map(agent => {
      const isAwake = isAgentAwake(agent.id);
      const session = getAgentSession(agent.id);
      
      return {
        ...agent,
        status: isAwake ? 'awake' : 'sleeping',
        session: session ? {
          sessionKey: session.sessionKey,
          uuid: session.uuid,
          spawnedAt: session.spawnedAt,
          expiresAt: session.expiresAt,
          task: session.task
        } : null
      };
    });

    res.status(200).json(agentsWithStatus);
  } catch (err: any) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: err.message });
  }
}