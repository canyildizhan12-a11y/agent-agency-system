/**
 * API Route: /api/cron
 * Returns scheduled cron jobs
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  nextRun: string;
  description: string;
}

interface CronData {
  jobs: CronJob[];
  timestamp: string;
}

const cronJobs: CronJob[] = [
  { 
    id: '1', 
    name: 'Morning Standup', 
    schedule: '0 9 * * 1-5', 
    status: 'active', 
    lastRun: '2026-02-18T06:00:00Z', 
    nextRun: '2026-02-19T06:00:00Z',
    description: 'Daily morning standup at 09:00 TRT'
  },
  { 
    id: '2', 
    name: 'Evening Standup', 
    schedule: '0 17 * * 1-5', 
    status: 'active', 
    lastRun: '2026-02-18T14:00:00Z', 
    nextRun: '2026-02-18T14:00:00Z',
    description: 'Daily evening standup at 17:00 TRT'
  },
  { 
    id: '3', 
    name: 'Intelligence Sweep', 
    schedule: '0 */6 * * *', 
    status: 'active', 
    lastRun: '2026-02-18T12:00:00Z', 
    nextRun: '2026-02-18T18:00:00Z',
    description: 'Scout intelligence monitoring every 6 hours'
  },
  { 
    id: '4', 
    name: 'Disk Monitor', 
    schedule: '0 */4 * * *', 
    status: 'active', 
    lastRun: '2026-02-18T10:00:00Z', 
    nextRun: '2026-02-18T14:00:00Z',
    description: 'Alex disk space monitoring every 4 hours'
  },
  { 
    id: '5', 
    name: 'Security Scan', 
    schedule: '0 22 * * 0', 
    status: 'paused', 
    lastRun: '2026-02-16T19:00:00Z', 
    nextRun: 'Paused',
    description: 'Weekly security audit scan'
  },
  { 
    id: '6', 
    name: 'Token Usage Check', 
    schedule: '0 * * * *', 
    status: 'active', 
    lastRun: '2026-02-18T12:00:00Z', 
    nextRun: '2026-02-18T13:00:00Z',
    description: 'Hourly token usage monitoring'
  },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CronData>
) {
  res.status(200).json({
    jobs: cronJobs,
    timestamp: new Date().toISOString()
  });
}
