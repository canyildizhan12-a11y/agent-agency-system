import type { NextApiRequest, NextApiResponse } from 'next';

// Cron jobs configuration
let cronJobs = [
  { 
    id: '1', 
    name: 'Morning Standup', 
    schedule: '0 9 * * 1-5', 
    action: 'meeting',
    payload: { type: 'standup', time: '09:00' },
    enabled: true,
    lastRun: '2026-02-20T09:00:00Z',
    nextRun: '2026-02-21T09:00:00Z',
  },
  { 
    id: '2', 
    name: 'Evening Standup', 
    schedule: '0 17 * * 1-5', 
    action: 'meeting',
    payload: { type: 'standup', time: '17:00' },
    enabled: true,
    lastRun: '2026-02-20T17:00:00Z',
    nextRun: '2026-02-21T17:00:00Z',
  },
  { 
    id: '3', 
    name: 'Health Check', 
    schedule: '0 * * * *', 
    action: 'healthcheck',
    payload: { type: 'system' },
    enabled: true,
    lastRun: '2026-02-20T17:00:00Z',
    nextRun: '2026-02-20T18:00:00Z',
  },
  { 
    id: '4', 
    name: 'Weekly Report', 
    schedule: '0 10 * * 5', 
    action: 'report',
    payload: { type: 'weekly' },
    enabled: false,
    lastRun: null,
    nextRun: null,
  },
];

type ResponseData = {
  success: boolean;
  data?: typeof cronJobs;
  job?: typeof cronJobs[0];
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

  // GET: List cron jobs
  if (req.method === 'GET') {
    const { enabled } = req.query;
    let filtered = [...cronJobs];

    if (enabled !== undefined) {
      filtered = filtered.filter(j => j.enabled === (enabled === 'true'));
    }

    res.status(200).json({ success: true, data: filtered });
    return;
  }

  // POST: Create cron job
  if (req.method === 'POST') {
    const { name, schedule, action, payload, enabled = true } = req.body;

    if (!name || !schedule || !action) {
      res.status(400).json({ success: false, error: 'Name, schedule, and action required' });
      return;
    }

    const newJob = {
      id: String(cronJobs.length + 1),
      name,
      schedule,
      action,
      payload: payload || {},
      enabled,
      lastRun: null,
      nextRun: null, // Would be calculated
    };

    cronJobs.push(newJob);
    res.status(201).json({ success: true, job: newJob });
    return;
  }

  // PUT: Update cron job
  if (req.method === 'PUT') {
    const { id, name, schedule, action, payload, enabled } = req.body;

    const jobIndex = cronJobs.findIndex(j => j.id === id);
    if (jobIndex === -1) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }

    if (name) cronJobs[jobIndex].name = name;
    if (schedule) cronJobs[jobIndex].schedule = schedule;
    if (action) cronJobs[jobIndex].action = action;
    if (payload) cronJobs[jobIndex].payload = payload;
    if (enabled !== undefined) cronJobs[jobIndex].enabled = enabled;

    res.status(200).json({ success: true, job: cronJobs[jobIndex] });
    return;
  }

  // DELETE: Remove cron job
  if (req.method === 'DELETE') {
    const { id } = req.body;
    const jobIndex = cronJobs.findIndex(j => j.id === id);

    if (jobIndex === -1) {
      res.status(404).json({ success: false, error: 'Job not found' });
      return;
    }

    cronJobs.splice(jobIndex, 1);
    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
