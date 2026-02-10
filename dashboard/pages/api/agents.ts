import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: agents, error } = await supabase
      .from('agents')
      .select(`
        *,
        agent_status (
          status,
          last_task,
          woken_at,
          woken_by,
          sleep_started_at,
          updated_at
        )
      `)
      .order('name');

    if (error) throw error;

    // Transform data to match expected format
    const transformedAgents = agents?.map(agent => ({
      id: agent.agent_id,
      name: agent.name,
      emoji: agent.emoji,
      role: agent.role,
      status: agent.agent_status?.[0]?.status || 'sleeping',
      color: agent.color,
      lastTask: agent.agent_status?.[0]?.last_task,
      wokenAt: agent.agent_status?.[0]?.woken_at,
      wokenBy: agent.agent_status?.[0]?.woken_by,
      sleepStartedAt: agent.agent_status?.[0]?.sleep_started_at,
      updatedAt: agent.agent_status?.[0]?.updated_at
    })) || [];

    res.status(200).json(transformedAgents);
  } catch (err: any) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ error: err.message });
  }
}