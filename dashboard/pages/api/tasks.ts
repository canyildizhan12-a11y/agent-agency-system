import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory task store (use database in production)
let tasks = [
  { id: '1', title: 'Wire up API data to dashboard', assignee: 'echo', priority: 'high', status: 'pending', createdAt: '2026-02-20T09:00:00Z' },
  { id: '2', title: 'Fix security vulnerabilities', assignee: 'alex', priority: 'high', status: 'in_progress', createdAt: '2026-02-20T09:00:00Z' },
  { id: '3', title: 'Update API documentation', assignee: 'quill', priority: 'medium', status: 'pending', createdAt: '2026-02-20T09:00:00Z' },
  { id: '4', title: 'Design Research Module UI', assignee: 'pixel', priority: 'high', status: 'pending', createdAt: '2026-02-20T09:00:00Z' },
  { id: '5', title: 'Build Research Module', assignee: 'echo', priority: 'high', status: 'pending', createdAt: '2026-02-20T09:00:00Z' },
  { id: '6', title: 'Define intelligence scope', assignee: 'scout', priority: 'medium', status: 'pending', createdAt: '2026-02-20T09:00:00Z' },
];

type ResponseData = {
  success: boolean;
  data?: typeof tasks;
  task?: typeof tasks[0];
  error?: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: List tasks
  if (req.method === 'GET') {
    const { status, assignee, priority } = req.query;
    let filtered = [...tasks];

    if (status) filtered = filtered.filter(t => t.status === status);
    if (assignee) filtered = filtered.filter(t => t.assignee === assignee);
    if (priority) filtered = filtered.filter(t => t.priority === priority);

    res.status(200).json({ success: true, data: filtered });
    return;
  }

  // POST: Create task
  if (req.method === 'POST') {
    const { title, assignee, priority = 'medium' } = req.body;

    if (!title || !assignee) {
      res.status(400).json({ success: false, error: 'Title and assignee required' });
      return;
    }

    const newTask = {
      id: String(tasks.length + 1),
      title,
      assignee,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    res.status(201).json({ success: true, task: newTask });
    return;
  }

  // PUT: Update task
  if (req.method === 'PUT') {
    const { id, status, priority, assignee } = req.body;

    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    if (status) tasks[taskIndex].status = status;
    if (priority) tasks[taskIndex].priority = priority;
    if (assignee) tasks[taskIndex].assignee = assignee;

    res.status(200).json({ success: true, task: tasks[taskIndex] });
    return;
  }

  // DELETE: Remove task
  if (req.method === 'DELETE') {
    const { id } = req.body;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    tasks.splice(taskIndex, 1);
    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
