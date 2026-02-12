import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get cron jobs
    const cronJobs = await getCronJobs();
    
    // Get token usage
    const tokenUsage = await getTokenUsage();
    
    // Get immune system status
    const immuneStatus = await getImmuneStatus();
    
    // Get recent work
    const recentWork = await getRecentWork();
    
    // Get system health
    const systemHealth = await getSystemHealth();

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        cronJobs,
        tokenUsage,
        immuneStatus,
        recentWork,
        systemHealth
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

async function getCronJobs() {
  // Read from OpenClaw cron list
  try {
    const { execSync } = require('child_process');
    const result = execSync('openclaw cron list --json 2>/dev/null || echo "[]"', { 
      encoding: 'utf8',
      timeout: 5000 
    });
    return JSON.parse(result);
  } catch {
    return [];
  }
}

async function getTokenUsage() {
  const tokenFile = path.join(AGENCY_DIR, 'token_logs', `${new Date().toISOString().split('T')[0]}.json`);
  
  if (!fs.existsSync(tokenFile)) {
    return { today: 0, sessions: [] };
  }
  
  try {
    const logs = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
    const total = logs.reduce((sum: number, entry: any) => sum + (entry.totalTokens || 0), 0);
    
    return {
      today: total,
      sessions: logs.slice(-10) // Last 10 entries
    };
  } catch {
    return { today: 0, sessions: [] };
  }
}

async function getImmuneStatus() {
  const statusFile = path.join(AGENCY_DIR, 'immune-system', 'status.json');
  
  if (!fs.existsSync(statusFile)) {
    return {
      lastCheck: null,
      status: 'unknown',
      alerts: []
    };
  }
  
  try {
    return JSON.parse(fs.readFileSync(statusFile, 'utf8'));
  } catch {
    return {
      lastCheck: null,
      status: 'unknown',
      alerts: []
    };
  }
}

async function getRecentWork() {
  const workFile = path.join(AGENCY_DIR, 'work_tracker.json');
  
  if (!fs.existsSync(workFile)) {
    return [];
  }
  
  try {
    const work = JSON.parse(fs.readFileSync(workFile, 'utf8'));
    return work.slice(-20); // Last 20 work items
  } catch {
    return [];
  }
}

async function getSystemHealth() {
  const healthFile = path.join(AGENCY_DIR, 'system_health.json');
  
  if (!fs.existsSync(healthFile)) {
    return {
      status: 'unknown',
      lastCheck: null,
      diskUsage: null,
      memoryUsage: null
    };
  }
  
  try {
    return JSON.parse(fs.readFileSync(healthFile, 'utf8'));
  } catch {
    return {
      status: 'unknown',
      lastCheck: null,
      diskUsage: null,
      memoryUsage: null
    };
  }
}