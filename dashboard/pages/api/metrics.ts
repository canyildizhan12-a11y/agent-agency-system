import type { NextApiRequest, NextApiResponse } from 'next';

// Mock metrics data
const metrics = {
  overview: {
    activeAgents: 8,
    totalTasks: 24,
    completedToday: 7,
    pendingTasks: 12,
  },
  performance: {
    avgResponseTime: '2.3s',
    uptime: '99.8%',
    tasksPerDay: 15,
  },
  agents: [
    { id: 'henry', tasksCompleted: 3, avgResponseTime: '1.2s', status: 'active' },
    { id: 'scout', tasksCompleted: 5, avgResponseTime: '3.1s', status: 'active' },
    { id: 'pixel', tasksCompleted: 4, avgResponseTime: '2.0s', status: 'active' },
    { id: 'echo', tasksCompleted: 4, avgResponseTime: '2.5s', status: 'active' },
    { id: 'quill', tasksCompleted: 2, avgResponseTime: '1.8s', status: 'active' },
    { id: 'codex', tasksCompleted: 3, avgResponseTime: '2.2s', status: 'active' },
    { id: 'alex', tasksCompleted: 2, avgResponseTime: '1.5s', status: 'active' },
    { id: 'vega', tasksCompleted: 1, avgResponseTime: '2.8s', status: 'active' },
  ],
  kpis: [
    { name: 'Task Completion Rate', value: '87%', target: '90%', trend: 'up' },
    { name: 'Agent Uptime', value: '99.8%', target: '99%', trend: 'stable' },
    { name: 'Avg Response Time', value: '2.3s', target: '3s', trend: 'down' },
    { name: 'User Satisfaction', value: '4.5/5', target: '4/5', trend: 'up' },
  ],
};

type ResponseData = {
  success: boolean;
  data?: typeof metrics;
  error?: string;
};

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

  if (req.method === 'GET') {
    const { type } = req.query;
    
    if (type === 'overview') {
      res.status(200).json({ success: true, data: metrics.overview });
      return;
    }
    if (type === 'performance') {
      res.status(200).json({ success: true, data: metrics.performance });
      return;
    }
    if (type === 'kpis') {
      res.status(200).json({ success: true, data: metrics.kpis });
      return;
    }
    
    // Return all metrics
    res.status(200).json({ success: true, data: metrics });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
