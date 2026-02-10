import type { NextApiRequest, NextApiResponse } from 'next';
import { createCronJob } from '../../lib/openclaw';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentId, task, schedule, naturalLanguage } = req.body;
  
  if (!agentId || !task) {
    return res.status(400).json({ error: 'Agent ID and task required' });
  }
  
  try {
    let cronSchedule = schedule;
    
    // Parse natural language if provided
    if (naturalLanguage) {
      cronSchedule = parseNaturalLanguage(naturalLanguage);
    }
    
    if (!cronSchedule) {
      return res.status(400).json({ error: 'Invalid schedule' });
    }
    
    // ACTUALLY create cron job via OpenClaw
    const result = await createCronJob(cronSchedule, task);
    
    res.status(200).json({
      success: true,
      agentId,
      schedule: cronSchedule,
      task,
      message: `📅 Scheduled: "${task}" at ${naturalLanguage || cronSchedule}`,
      openclawResult: result
    });
  } catch (err: any) {
    console.error('Error creating cron:', err);
    res.status(500).json({ error: err.message });
  }
}

function parseNaturalLanguage(text: string): string | null {
  const now = new Date();
  
  // "in X minutes"
  const minutesMatch = text.match(/in (\d+) minutes?/i);
  if (minutesMatch) {
    const mins = parseInt(minutesMatch[1]);
    const target = new Date(now.getTime() + mins * 60000);
    return `${target.getMinutes()} ${target.getHours()} * * *`;
  }
  
  // "in X hours"
  const hoursMatch = text.match(/in (\d+) hours?/i);
  if (hoursMatch) {
    const hrs = parseInt(hoursMatch[1]);
    const target = new Date(now.getTime() + hrs * 3600000);
    return `${target.getMinutes()} ${target.getHours()} * * *`;
  }
  
  // "daily at X"
  const dailyMatch = text.match(/daily at (\d+)(?::(\d+))?\s*(am|pm)?/i);
  if (dailyMatch) {
    let hours = parseInt(dailyMatch[1]);
    const mins = dailyMatch[2] ? parseInt(dailyMatch[2]) : 0;
    const ampm = dailyMatch[3];
    
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    return `${mins} ${hours} * * *`;
  }
  
  // "every X minutes"
  const everyMinMatch = text.match(/every (\d+) minutes?/i);
  if (everyMinMatch) {
    const mins = parseInt(everyMinMatch[1]);
    return `*/${mins} * * * *`;
  }
  
  // Assume it's already a cron expression
  return text;
}