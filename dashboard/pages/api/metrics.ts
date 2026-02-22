import type { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import * as path from 'path';

const CRON_JOBS_PATH = '/home/ubuntu/.openclaw/cron/jobs.json';
const AGENTS_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency/agents';

type ResponseData = {
  success: boolean;
  data?: any;
  error?: string;
};

// Get real metrics from OpenClaw
function getRealMetrics() {
  // Get cron job stats
  let totalJobs = 0;
  let activeJobs = 0;
  let okJobs = 0;
  let errorJobs = 0;

  try {
    if (fs.existsSync(CRON_JOBS_PATH)) {
      const cronData = JSON.parse(fs.readFileSync(CRON_JOBS_PATH, 'utf-8'));
      totalJobs = cronData.jobs?.length || 0;
      activeJobs = cronData.jobs?.filter((j: any) => j.enabled).length || 0;
      okJobs = cronData.jobs?.filter((j: any) => j.state?.lastStatus === 'ok').length || 0;
      errorJobs = cronData.jobs?.filter((j: any) => j.state?.lastStatus === 'error').length || 0;
    }
  } catch (err) {
    console.error('Error reading cron jobs:', err);
  }

  // Get agent stats
  let totalAgents = 0;
  let activeAgents = 0;
  const agentList: any[] = [];

  try {
    const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.json'));
    totalAgents = files.length;

    if (fs.existsSync(CRON_JOBS_PATH)) {
      const cronData = JSON.parse(fs.readFileSync(CRON_JOBS_PATH, 'utf-8'));
      
      for (const file of files) {
        const agentId = file.replace('.json', '');
        const recentJob = cronData.jobs?.find((j: any) => 
          j.agentId === agentId && 
          j.state?.lastRunAtMs &&
          Date.now() - j.state.lastRunAtMs < 3600000
        );
        
        agentList.push({
          id: agentId,
          status: recentJob ? 'active' : 'sleeping',
          lastRun: recentJob?.state?.lastRunAtMs || null,
        });
        
        if (recentJob) activeAgents++;
      }
    }
  } catch (err) {
    console.error('Error reading agents:', err);
  }

  // Calculate performance metrics from cron runs
  let avgResponseTime = '0s';
  let totalRuns = 0;
  let successfulRuns = 0;

  try {
    if (fs.existsSync(CRON_JOBS_PATH)) {
      const cronData = JSON.parse(fs.readFileSync(CRON_JOBS_PATH, 'utf-8'));
      
      for (const job of cronData.jobs || []) {
        if (job.state?.lastDurationMs) {
          totalRuns++;
          if (job.state.lastStatus === 'ok') successfulRuns++;
        }
      }

      if (totalRuns > 0) {
        const avgMs = (cronData.jobs || []).reduce((sum: number, j: any) => 
          sum + (j.state?.lastDurationMs || 0), 0) / totalRuns;
        avgResponseTime = (avgMs / 1000).toFixed(1) + 's';
      }
      if (successfulRuns === 0 && totalRuns > 0) {
        successfulRuns = okJobs;
      }
    }
  } catch (err) {
    console.error('Error calculating metrics:', err);
  }

  const successRate = totalRuns > 0 
    ? ((successfulRuns / totalRuns) * 100).toFixed(1) 
    : '0';

  return {
    overview: {
      activeAgents,
      totalAgents,
      totalCronJobs: totalJobs,
      activeCronJobs: activeJobs,
    },
    performance: {
      avgResponseTime,
      uptime: totalJobs > 0 ? ((okJobs / totalJobs) * 100).toFixed(1) + '%' : '0%',
      successRate: successRate + '%',
    },
    agents: agentList,
    kpis: [
      { name: 'Cron Success Rate', value: successRate + '%', target: '90%', trend: okJobs > errorJobs ? 'up' : 'down' },
      { name: 'Active Agents', value: String(activeAgents), target: String(totalAgents), trend: 'stable' },
      { name: 'Active Jobs', value: String(activeJobs), target: String(totalJobs), trend: 'stable' },
      { name: 'Avg Response', value: avgResponseTime, target: '5s', trend: parseFloat(avgResponseTime) < 5 ? 'up' : 'down' },
    ],
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { type } = req.query;
    const metrics = getRealMetrics();
    
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
    
    res.status(200).json({ success: true, data: metrics });
    return;
  }

  res.status(405).json({ success: false, error: 'Method not allowed' });
}
