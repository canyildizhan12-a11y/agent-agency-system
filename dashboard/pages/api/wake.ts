import type { NextApiRequest, NextApiResponse } from 'next';
import { 
  queueSpawnRequest, 
  isAgentAwake, 
  getAgentSession,
  registerSpawnedSession,
  buildIdentityContext,
  AGENT_IDENTITIES,
  MAX_SESSION_MINUTES
} from '../../lib/subagentManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { task, sessionKey, spawnComplete } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Agent ID required' });
  }

  const agentId = id.toLowerCase();
  const identity = AGENT_IDENTITIES[agentId];

  if (!identity) {
    return res.status(400).json({ error: `Unknown agent: ${agentId}` });
  }

  // Check if already awake
  if (isAgentAwake(agentId)) {
    const existingSession = getAgentSession(agentId);
    return res.status(200).json({
      success: true,
      agentId,
      agentName: identity.name,
      agentEmoji: identity.emoji,
      status: 'already_awake',
      message: `${identity.name} is already awake`,
      session: existingSession
    });
  }

  // If spawnComplete flag is set, this is a callback from the main agent
  // after sessions_spawn has been called
  if (spawnComplete && sessionKey) {
    const session = registerSpawnedSession(agentId, sessionKey, task || 'General task');
    
    return res.status(200).json({
      success: true,
      agentId,
      agentName: identity.name,
      agentEmoji: identity.emoji,
      status: 'awake',
      message: `${identity.name} has been spawned successfully`,
      session
    });
  }

  // Otherwise, queue a spawn request
  const defaultTask = task || 'Check in and report status';
  const request = queueSpawnRequest(agentId, defaultTask);

  // Return immediate response that request is queued
  // The main agent will process this and call back with spawnComplete
  res.status(202).json({
    success: true,
    agentId,
    agentName: identity.name,
    agentEmoji: identity.emoji,
    status: 'spawn_queued',
    message: `${identity.name} spawn request queued. Main agent will spawn the subagent shortly.`,
    requestId: request.id,
    task: defaultTask,
    maxSessionMinutes: MAX_SESSION_MINUTES,
    identityContext: buildIdentityContext(agentId)
  });
}