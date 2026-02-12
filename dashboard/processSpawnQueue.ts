#!/usr/bin/env node
/**
 * Subagent Spawn Processor
 * Called by main agent (Garmin) to process spawn queue
 * Uses sessions_spawn tool to create REAL subagent sessions
 * 
 * Usage: node processSpawnQueue.js
 */

import { 
  loadSpawnQueue, 
  saveSpawnQueue,
  registerSpawnedSession,
  buildIdentityContext,
  AGENT_IDENTITIES
} from './lib/subagentManager';

// This file is called by the main agent via exec
// The main agent will call sessions_spawn for each pending request

interface SpawnRequest {
  id: string;
  agentId: string;
  task: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  sessionKey?: string;
  error?: string;
}

function processQueue() {
  const queue = loadSpawnQueue();
  const pending = queue.filter(r => r.status === 'pending');
  
  if (pending.length === 0) {
    console.log('No pending spawn requests');
    return [];
  }

  console.log(`Found ${pending.length} pending spawn request(s)`);
  
  // Return the pending requests for the main agent to process
  return pending.map(request => {
    const identity = AGENT_IDENTITIES[request.agentId];
    const identityContext = buildIdentityContext(request.agentId);
    
    return {
      requestId: request.id,
      agentId: request.agentId,
      agentName: identity?.name || request.agentId,
      agentEmoji: identity?.emoji || '🤖',
      task: request.task,
      identityContext,
      fullTask: `${identityContext}\n\n[TASK FROM CAN]\n${request.task}\n\nExecute this task as ${identity?.name || request.agentId}. Provide your response in character. When complete, report back to the main session.`
    };
  });
}

// If called directly, output the pending requests as JSON
if (require.main === module) {
  const pending = processQueue();
  console.log(JSON.stringify(pending, null, 2));
}

export { processQueue };