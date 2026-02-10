import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = path.join(process.cwd(), '..');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }

  const sleepFile = path.join(AGENCY_DIR, 'sleeping_agents', `${id}.json`);
  
  if (!fs.existsSync(sleepFile)) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(sleepFile, 'utf8'));
    data.status = 'awake';
    data.woken_at = new Date().toISOString();
    data.woken_by = 'dashboard';
    fs.writeFileSync(sleepFile, JSON.stringify(data, null, 2));
    
    res.status(200).json({ success: true, message: `Woke up ${id}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to wake agent' });
  }
}