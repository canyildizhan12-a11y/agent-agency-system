import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: workItems, error } = await supabase
      .from('work_items')
      .select(`
        *,
        agents (
          agent_id,
          name,
          emoji
        )
      `)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Transform data
    const transformedWork = workItems?.map(item => ({
      agent: item.agents?.agent_id,
      agentName: item.agents?.name,
      agentEmoji: item.agents?.emoji,
      task: item.task,
      description: item.description,
      status: item.status,
      time: item.completed_at || item.created_at,
      file: item.file_path,
      linesOfCode: item.lines_of_code
    })) || [];

    res.status(200).json(transformedWork);
  } catch (err: any) {
    console.error('Error fetching work:', err);
    res.status(500).json({ error: err.message });
  }
}