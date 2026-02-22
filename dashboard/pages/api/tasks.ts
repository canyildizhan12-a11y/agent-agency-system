import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

const AGENTS_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency/agents';

type Task = {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
};

type ResponseData = {
  success: boolean;
  data?: Task[];
  error?: string;
};

// Get real tasks from agent memory files
function getRealTasks(): Task[] {
  const tasks: Task[] = [];

  try {
    const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const agentId = file.replace('.json', '');
      const configPath = path.join(AGENTS_DIR, file);
      
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        
        // Get action_items from agent memory
        const actionItems = config.memory?.personal?.action_items || [];
        
        for (const item of actionItems) {
          tasks.push({
            id: item.id || `task-${Date.now()}-${agentId}`,
            title: item.task || 'Untitled task',
            assignee: agentId,
            priority: item.priority || 'medium',
            status: item.status || 'pending',
            createdAt: item.completed_at || new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(`Error reading agent ${agentId}:`, err);
      }
    }
  } catch (err) {
    console.error('Error reading agents directory:', err);
  }

  return tasks;
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

  // GET: List tasks from real agent data
  if (req.method === 'GET') {
    const { status, assignee, priority } = req.query;
    let tasks = getRealTasks();

    if (status) tasks = tasks.filter(t => t.status === status);
    if (assignee) tasks = tasks.filter(t => t.assignee === assignee);
    if (priority) tasks = tasks.filter(t => t.priority === priority);

    res.status(200).json({ success: true, data: tasks });
    return;
  }

  // POST: Create a task (would need to write to file in production)
  if (req.method === 'POST') {
    const { title, assignee, priority = 'medium' } = req.body;

    if (!title || !assignee) {
      res.status(400).json({ success: false, error: 'Title and assignee required' });
      return;
    }

    // In production, this would write to the agent's memory file
    const newTask: Task = {
      id: `task-${Date.now()}-${assignee}`,
      title,
      assignee,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, data: [newTask] });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
