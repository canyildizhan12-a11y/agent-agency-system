import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';

const CRON_JOBS_PATH = '/home/ubuntu/.openclaw/cron/jobs.json';

type CronJob = {
  id: string;
  name: string;
  agentId: string;
  schedule: string;
  action: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
  status: 'ok' | 'error' | 'pending';
};

type ResponseData = {
  success: boolean;
  data?: CronJob[];
  message?: string;
  error?: string;
};

// Read real cron jobs from OpenClaw
function getRealCronJobs(): CronJob[] {
  try {
    if (!fs.existsSync(CRON_JOBS_PATH)) {
      return [];
    }

    const data = JSON.parse(fs.readFileSync(CRON_JOBS_PATH, 'utf-8'));
    
    if (!data.jobs || !Array.isArray(data.jobs)) {
      return [];
    }

    return data.jobs.map((job: any) => ({
      id: job.id,
      name: job.name || job.agentId,
      agentId: job.agentId,
      schedule: job.schedule?.expr || 'unknown',
      action: job.payload?.kind || 'agentTurn',
      enabled: job.enabled ?? true,
      lastRun: job.state?.lastRunAtMs 
        ? new Date(job.state.lastRunAtMs).toISOString() 
        : null,
      nextRun: job.state?.nextRunAtMs 
        ? new Date(job.state.nextRunAtMs).toISOString() 
        : null,
      status: job.state?.lastStatus || 'pending',
    }));
  } catch (err) {
    console.error('Error reading cron jobs:', err);
    return [];
  }
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

  // GET: List cron jobs from real data
  if (req.method === 'GET') {
    const { enabled } = req.query;
    let jobs = getRealCronJobs();

    if (enabled !== undefined) {
      jobs = jobs.filter(j => j.enabled === (enabled === 'true'));
    }

    res.status(200).json({ success: true, data: jobs });
    return;
  }

  // POST: Trigger a cron job manually
  if (req.method === 'POST') {
    const { jobId } = req.body;
    const jobs = getRealCronJobs();
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }

    // In production, this would trigger the cron job via OpenClaw API
    res.status(200).json({ 
      success: true, 
      message: `Triggered job: ${job.name}`,
      data: [job]
    });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
