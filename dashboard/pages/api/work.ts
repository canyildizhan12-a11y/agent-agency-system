import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  success: boolean;
  taskId?: string;
  message?: string;
  error?: string;
};

// Work queue
const workQueue: Array<{
  id: string;
  agentId: string;
  task: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  result?: string;
}> = [];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: Get work status
  if (req.method === 'GET') {
    const { agentId, status } = req.query;
    let filtered = [...workQueue];

    if (agentId) filtered = filtered.filter(w => w.agentId === agentId);
    if (status) filtered = filtered.filter(w => w.status === status);

    res.status(200).json({ success: true, data: filtered });
    return;
  }

  // POST: Assign work to agent
  if (req.method === 'POST') {
    const { agentId, task } = req.body;

    if (!agentId || !task) {
      res.status(400).json({ success: false, error: 'agentId and task required' });
      return;
    }

    // Validate agent
    const validAgents = ['henry', 'scout', 'pixel', 'echo', 'quill', 'codex', 'alex', 'vega'];
    if (!validAgents.includes(agentId)) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    const taskId = `task_${Date.now()}`;
    const newWork = {
      id: taskId,
      agentId,
      task,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    workQueue.push(newWork);

    // In production, this would trigger the agent via sessions_send
    // For now, just queue it
    res.status(201).json({ 
      success: true, 
      taskId, 
      message: `Task assigned to ${agentId}` 
    });
    return;
  }

  // PUT: Update work status
  if (req.method === 'PUT') {
    const { taskId, status, result } = req.body;

    const workIndex = workQueue.findIndex(w => w.id === taskId);
    if (workIndex === -1) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    if (status) workQueue[workIndex].status = status;
    if (result) workQueue[workIndex].result = result;

    res.status(200).json({ success: true, message: 'Task updated' });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
