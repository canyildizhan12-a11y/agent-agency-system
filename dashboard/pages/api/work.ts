import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = path.join(process.cwd(), '..');

interface WorkItem {
  agent: string;
  task: string;
  status: string;
  time: string;
  file: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const workDir = path.join(AGENCY_DIR, 'implementation');
  const workItems: WorkItem[] = [];
  
  const workMap: Record<string, { agent: string; task: string }> = {
    'pre-flight-protocol.js': { agent: 'henry', task: 'Pre-Flight Protocol' },
    'intelligence-monitor.js': { agent: 'scout', task: 'Intelligence Monitor' },
    'visual-output-system.js': { agent: 'pixel', task: 'Visual Output System' },
    'smart-cron-system.js': { agent: 'echo', task: 'Smart Cron System' },
    'semantic-memory.js': { agent: 'echo', task: 'Semantic Memory' },
    'communication-framework.js': { agent: 'quill', task: 'Communication Framework' },
    'context-router.js': { agent: 'codex', task: 'Context Router' },
    'memory-architecture.js': { agent: 'codex', task: 'Memory Architecture' },
    'escalation-system.js': { agent: 'codex', task: 'Escalation System' },
    'metrics-framework.js': { agent: 'alex', task: 'Metrics Framework' },
    'research-roi-tracker.js': { agent: 'alex', task: 'Research ROI Tracker' },
    'weekly-reports.js': { agent: 'alex', task: 'Weekly Reports' }
  };
  
  if (fs.existsSync(workDir)) {
    const files = fs.readdirSync(workDir).filter(f => f.endsWith('.js'));
    
    files.forEach(file => {
      if (workMap[file]) {
        const stats = fs.statSync(path.join(workDir, file));
        workItems.push({
          ...workMap[file],
          status: 'completed',
          time: stats.mtime.toISOString(),
          file: file
        });
      }
    });
  }
  
  res.status(200).json(workItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()));
}