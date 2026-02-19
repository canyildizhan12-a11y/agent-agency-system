/**
 * API Route: /api/tasks
 * Returns task queue
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface Task {
  id: string;
  agent: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface TasksData {
  tasks: Task[];
  timestamp: string;
}

const tasks: Task[] = [
  { id: '1', agent: 'Scout', description: 'Research competitor analysis', status: 'completed', priority: 'high', createdAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-18T11:30:00Z' },
  { id: '2', agent: 'Echo', description: 'Fix dashboard API', status: 'in_progress', priority: 'high', createdAt: '2026-02-18T09:00:00Z', updatedAt: '2026-02-18T12:00:00Z' },
  { id: '3', agent: 'Vega', description: 'Generate metrics report', status: 'pending', priority: 'medium', createdAt: '2026-02-18T08:00:00Z', updatedAt: '2026-02-18T08:00:00Z' },
  { id: '4', agent: 'Pixel', description: 'Design mockups', status: 'in_progress', priority: 'medium', createdAt: '2026-02-18T07:00:00Z', updatedAt: '2026-02-18T12:00:00Z' },
  { id: '5', agent: 'Alex', description: 'Security audit', status: 'pending', priority: 'low', createdAt: '2026-02-17T20:00:00Z', updatedAt: '2026-02-17T20:00:00Z' },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TasksData>
) {
  res.status(200).json({
    tasks,
    timestamp: new Date().toISOString()
  });
}
