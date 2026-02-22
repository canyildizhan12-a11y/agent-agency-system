import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

const STATE_FILE = '/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/.agent-states.json';

type AgentState = Record<string, 'awake' | 'asleep'>;

type ResponseData = {
  success: boolean;
  message?: string;
  agentId?: string;
  data?: AgentState;
  error?: string;
};

// Load or initialize agent states (shared with wake.ts)
function getAgentStates(): AgentState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading agent states:', err);
  }

  return {
    henry: 'asleep',
    scout: 'asleep',
    pixel: 'asleep',
    echo: 'asleep',
    quill: 'asleep',
    codex: 'asleep',
    alex: 'asleep',
    vega: 'asleep',
  };
}

// Save agent states
function saveAgentStates(states: AgentState): void {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2));
  } catch (err) {
    console.error('Error saving agent states:', err);
  }
}

const VALID_AGENTS = ['henry', 'scout', 'pixel', 'echo', 'quill', 'codex', 'alex', 'vega'];

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

  // GET: Get current agent states
  if (req.method === 'GET') {
    const states = getAgentStates();
    res.status(200).json({ success: true, data: states });
    return;
  }

  // POST: Sleep agent(s)
  if (req.method === 'POST') {
    const { agentId, all } = req.body;
    let states = getAgentStates();

    if (all) {
      for (const agent of VALID_AGENTS) {
        states[agent] = 'asleep';
      }
      saveAgentStates(states);
      res.status(200).json({ success: true, message: 'All agents put to sleep' });
      return;
    }

    if (!agentId) {
      res.status(400).json({ success: false, error: 'agentId required' });
      return;
    }

    if (!VALID_AGENTS.includes(agentId)) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    states[agentId] = 'asleep';
    saveAgentStates(states);
    
    res.status(200).json({ 
      success: true, 
      agentId, 
      message: `Agent ${agentId} put to sleep` 
    });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
