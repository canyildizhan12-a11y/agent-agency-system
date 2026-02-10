import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }

  try {
    // Update agent status to awake
    const { error } = await supabase
      .from('agent_status')
      .update({
        status: 'awake',
        woken_at: new Date().toISOString(),
        woken_by: 'dashboard',
        updated_at: new Date().toISOString()
      })
      .eq('agent_id', id);

    if (error) throw error;

    // In a full implementation, you would also spawn a sub-agent here
    // using sessions_spawn or similar

    res.status(200).json({ 
      success: true, 
      message: `Woke up ${id}`,
      agentId: id,
      wokenAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Error waking agent:', err);
    res.status(500).json({ error: err.message });
  }
}