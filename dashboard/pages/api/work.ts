import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';

const CRON_JOBS_PATH = '/home/ubuntu/.openclaw/cron/jobs.json';
const CRON_RUNS_DIR = '/home/ubuntu/.openclaw/cron/runs';

type WorkItem = {
  id: string;
  agentId: string;
  task: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  result?: string;
  duration?: number;
};

type ResponseData = {
  success: boolean;
  data?: WorkItem[];
  taskId?: string;
  message?: string;
  error?: string;
};

// Get real work from cron job runs
function getRealWork(): WorkItem[] {
  const work: WorkItem[] = [];

  try {
    // Read cron jobs to get task info
    if (fs.existsSync(CRON_JOBS_PATH)) {
      const cronData = JSON.parse(fs.readFileSync(CRON_JOBS_PATH, 'utf-8'));
      
      for (const job of cronData.jobs || []) {
        const lastRun = job.state?.lastRunAtMs;
        const status = job.state?.lastStatus === 'ok' ? 'completed' : 
                      job.state?.lastStatus === 'error' ? 'failed' : 
                      'pending';

        work.push({
          id: job.id,
          agentId: job.agentId,
          task: job.name || `Run ${job.agentId} task`,
          status,
          createdAt: lastRun ? new Date(lastRun).toISOString() : new Date().toISOString(),
          duration: job.state?.lastDurationMs,
          result: job.state?.lastStatus === 'ok' ? 'Success' : 
                  job.state?.lastStatus === 'error' ? 'Failed' : undefined,
        });
      }
    }

    // Also check cron runs directory for more details
    if (fs.existsSync(CRON_RUNS_DIR)) {
      const runFiles = fs.readdirSync(CRON_RUNS_DIR).filter(f => f.endsWith('.json'));
      
      for (const file of runFiles.slice(-10)) { // Last 10 runs
        try {
          const runData = JSON.parse(fs.readFileSync(path.join(CRON_RUNS_DIR, file), 'utf-8'));
          
          work.push({
            id: runData.jobId || file,
            agentId: runData.agentId || 'unknown',
            task: runData.task || 'Cron job execution',
            status: runData.status || 'completed',
            createdAt: runData.startedAt || new Date().toISOString(),
            duration: runData.durationMs,
            result: runData.result || runData.error,
          });
        } catch (err) {
          // Skip malformed files
        }
      }
    }
  } catch (err) {
    console.error('Error reading work data:', err);
  }

  // Sort by most recent first
  return work.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Need path for the runs directory
import * as path from 'path';

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

  // GET: Get work from real cron runs
  if (req.method === 'GET') {
    const { agentId, status } = req.query;
    let work = getRealWork();

    if (agentId) work = work.filter(w => w.agentId === agentId);
    if (status) work = work.filter(w => w.status === status);

    res.status(200).json({ success: true, data: work });
    return;
  }

  // POST: Submit new work (would trigger agent in production)
  if (req.method === 'POST') {
    const { agentId, task } = req.body;

    if (!agentId || !task) {
      res.status(400).json({ success: false, error: 'agentId and task required' });
      return;
    }

    const validAgents = ['henry', 'scout', 'pixel', 'echo', 'quill', 'codex', 'alex', 'vega'];
    if (!validAgents.includes(agentId)) {
      res.status(404).json({ success: false, error: 'Agent not found' });
      return;
    }

    // In production, this would trigger the agent via sessions_spawn
    const taskId = `task_${Date.now()}`;
    
    res.status(201).json({ 
      success: true, 
      taskId, 
      message: `Task assigned to ${agentId}: ${task}` 
    });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
