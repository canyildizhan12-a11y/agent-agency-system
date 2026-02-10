import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = path.join(process.cwd(), '..');

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: 'awake' | 'sleeping' | 'working';
  color: string;
  lastTask?: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const agents: Agent[] = [
    { id: 'henry', name: 'Henry', emoji: '🦉', role: 'Team Lead', status: 'sleeping', color: '#FFD700' },
    { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Researcher', status: 'sleeping', color: '#87CEEB' },
    { id: 'pixel', name: 'Pixel', emoji: '🎨', role: 'Creative', status: 'sleeping', color: '#FF69B4' },
    { id: 'echo', name: 'Echo', emoji: '💻', role: 'Developer', status: 'sleeping', color: '#00CED1' },
    { id: 'quill', name: 'Quill', emoji: '✍️', role: 'Copywriter', status: 'sleeping', color: '#DDA0DD' },
    { id: 'codex', name: 'Codex', emoji: '🏗️', role: 'Architect', status: 'sleeping', color: '#F4A460' },
    { id: 'alex', name: 'Alex', emoji: '📊', role: 'Analyst', status: 'sleeping', color: '#98FB98' }
  ];

  const sleepingDir = path.join(AGENCY_DIR, 'sleeping_agents');
  const activeDir = path.join(AGENCY_DIR, 'active_sessions');

  const agentsWithStatus = agents.map(agent => {
    const sleepFile = path.join(sleepingDir, `${agent.id}.json`);
    
    if (fs.existsSync(sleepFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(sleepFile, 'utf8'));
        return { ...agent, status: data.status || 'sleeping', lastTask: data.last_task };
      } catch (e) {
        return agent;
      }
    }
    
    const activeDirContents = fs.existsSync(activeDir) ? fs.readdirSync(activeDir) : [];
    const isActive = activeDirContents.some(f => f.includes(agent.id));
    
    if (isActive) {
      return { ...agent, status: 'awake' };
    }
    
    return agent;
  });

  res.status(200).json(agentsWithStatus);
}