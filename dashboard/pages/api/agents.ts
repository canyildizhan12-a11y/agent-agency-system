import type { NextApiRequest, NextApiResponse } from 'next';

// Mock agent data - in production, fetch from OpenClaw gateway
const agents = [
  { id: 'henry', name: 'Henry', role: 'Team Lead', status: 'active', emoji: '🦆' },
  { id: 'scout', name: 'Scout', role: 'Research', status: 'active', emoji: '🔍' },
  { id: 'pixel', name: 'Pixel', role: 'Creative', status: 'active', emoji: '🎨' },
  { id: 'echo', name: 'Echo', role: 'Developer', status: 'active', emoji: '💾' },
  { id: 'quill', name: 'Quill', role: 'Documentation', status: 'active', emoji: '✍️' },
  { id: 'codex', name: 'Codex', role: 'Architecture', status: 'active', emoji: '🏗️' },
  { id: 'alex', name: 'Alex', role: 'Immune System', status: 'active', emoji: '🛡️' },
  { id: 'vega', name: 'Vega', role: 'Data Analyst', status: 'active', emoji: '📊' },
];

type ResponseData = {
  success: boolean;
  data?: typeof agents;
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Security: Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: List all agents
  if (req.method === 'GET') {
    res.status(200).json({ success: true, data: agents });
    return;
  }

  // POST: Get single agent or update status
  if (req.method === 'POST') {
    const { agentId, action } = req.body;

    if (action === 'status') {
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
