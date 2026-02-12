import type { NextApiRequest, NextApiResponse } from 'next';
import { sleepSubagent, isAgentAwake } from '../../lib/subagentManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }

  const agentId = id.toLowerCase();

  // Check if already sleeping
  if (!isAgentAwake(agentId)) {
    return res.status(200).json({
      success: true,
      agentId,
      agentName: capitalize(agentId),
      agentEmoji: getAgentEmoji(agentId),
      status: 'already_sleeping',
      message: `${capitalize(agentId)} is already sleeping`
    });
  }

  // Put agent to sleep (terminate session)
  const result = await sleepSubagent(agentId);

  res.status(200).json({
    success: result.success,
    agentId,
    agentName: capitalize(agentId),
    agentEmoji: getAgentEmoji(agentId),
    status: 'sleeping',
    message: result.message
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getAgentEmoji(agentId: string): string {
  const emojis: Record<string, string> = {
    henry: '🦉',
    scout: '🔍',
    pixel: '🎨',
    echo: '💾',
    quill: '✍️',
    codex: '🏗️',
    alex: '🛡️',
    vega: '📊'
  };
  return emojis[agentId] || '🤖';
}