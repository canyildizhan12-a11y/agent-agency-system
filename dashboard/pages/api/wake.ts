import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  message?: string;
  agentId?: string;
  error?: string;
};

// Agent states (in production, store in database)
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

  // POST: Wake agent(s)
  if (req.method === 'POST') {
    const { agentId, all } = req.body;

    if (all) {
      Object.keys(agentStates).forEach(id => {
        agentStates[id] = 'awake';
      });
      res.status(200).json({ success: true, message: 'All agents awakened' });
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

    agentStates[agentId] = 'awake';
    res.status(200).json({ success: true, agentId, message: `Agent ${agentId} awakened` });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
