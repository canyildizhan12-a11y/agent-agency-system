import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  agentId?: string;
  error?: string;
};

// Agent states (shared with wake.ts in production, use database)
const agentStates: Record<string, 'awake' | 'asleep'> = {
  henry: 'awake',
  scout: 'awake',
  pixel: 'awake',
  echo: 'awake',
  quill: 'awake',
  codex: 'awake',
  alex: 'awake',
  vega: 'awake',
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST: Sleep agent(s)
  if (req.method === 'POST') {
    const { agentId, all } = req.body;

    if (all) {
      Object.keys(agentStates).forEach(id => {
        agentStates[id] = 'asleep';
      });
      res.status(200).json({ success: true, message: 'All agents put to sleep' });
      return;
    }

    if (!agentId) {
      res.status(400).json({ success: false, error: 'agentId required' });
      return;
    }

    if (!agentStates[agentId]) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    agentStates[agentId] = 'asleep';
    res.status(200).json({ success: true, agentId, message: `Agent ${agentId} put to sleep` });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
