import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

const AGENTS_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency/agents';

type Agent = {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: 'active' | 'idle' | 'sleeping';
  lastActivity?: string;
};

type ResponseData = {
  success: boolean;
  data?: Agent[];
  error?: string;
};

// Get agent emoji from identity files
function getAgentEmoji(agentId: string): string {
  const emojiMap: Record<string, string> = {
    henry: '🦆',
    scout: '🔍',
    pixel: '🎨',
    echo: '💾',
    quill: '✍️',
    codex: '🏗️',
    alex: '🛡️',
    vega: '📊',
  };
  return emojiMap[agentId] || '❓';
}

// Get agent role from identity files
function getAgentRole(agentId: string): string {
  const roleMap: Record<string, string> = {
    henry: 'Team Lead',
    scout: 'Research',
    pixel: 'Creative',
    echo: 'Developer',
    quill: 'Documentation',
    codex: 'Architecture',
    alex: 'Immune System',
    vega: 'Data Analyst',
  };
  return roleMap[agentId] || 'Unknown';
}

// Read real agent data from filesystem
function getRealAgents(): Agent[] {
  const agentIds = ['henry', 'scout', 'pixel', 'echo', 'quill', 'codex', 'alex', 'vega'];
  const agents: Agent[] = [];

  for (const agentId of agentIds) {
    const configPath = path.join(AGENTS_DIR, `${agentId}.json`);
    
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        
        // Check for active sessions in cron jobs or recent activity
        const cronJobsPath = '/home/ubuntu/.openclaw/cron/jobs.json';
        let status: 'active' | 'idle' | 'sleeping' = 'sleeping';
        let lastActivity: string | undefined;

        if (fs.existsSync(cronJobsPath)) {
          const cronData = JSON.parse(fs.readFileSync(cronJobsPath, 'utf-8'));
          const recentJob = cronData.jobs?.find((j: any) => 
            j.agentId === agentId && 
            j.state?.lastRunAtMs &&
            Date.now() - j.state.lastRunAtMs < 3600000 // Within last hour
          );
          
          if (recentJob) {
            status = 'active';
            lastActivity = new Date(recentJob.state.lastRunAtMs).toISOString();
          }
        }

        agents.push({
          id: agentId,
          name: config.name || agentId.charAt(0).toUpperCase() + agentId.slice(1),
          emoji: getAgentEmoji(agentId),
          role: getAgentRole(agentId),
          status,
          lastActivity,
        });
      }
    } catch (err) {
      // Fallback for agents without config
      agents.push({
        id: agentId,
        name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
        emoji: getAgentEmoji(agentId),
        role: getAgentRole(agentId),
        status: 'sleeping',
      });
    }
  }

  return agents;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: List all agents from real data
  if (req.method === 'GET') {
    const agents = getRealAgents();
    res.status(200).json({ success: true, data: agents });
    return;
  }

  // POST: Get single agent or update status
  if (req.method === 'POST') {
    const { agentId, action } = req.body;

    if (action === 'status') {
      const agents = getRealAgents();
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        res.status(200).json({ success: true, data: [agent] });
        return;
      }
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    res.status(400).json({ success: false, error: 'Invalid action' });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
