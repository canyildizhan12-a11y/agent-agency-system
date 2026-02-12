#!/usr/bin/env node
/**
 * Complete Spawn Registration
 * Called by main agent after sessions_spawn succeeds
 * Registers the spawned session in the tracking system
 * 
 * Usage: node completeSpawn.js <requestId> <sessionKey>
 */

import { 
  loadSpawnQueue, 
  saveSpawnQueue,
  registerSpawnedSession
} from './lib/subagentManager';

const args = process.argv.slice(2);
const requestId = args[0];
const sessionKey = args[1];

if (!requestId || !sessionKey) {
  console.error('Usage: node completeSpawn.js <requestId> <sessionKey>');
  process.exit(1);
}

// Find the request
const queue = loadSpawnQueue();
const requestIndex = queue.findIndex(r => r.id === requestId);

if (requestIndex === -1) {
  console.error(`Request ${requestId} not found`);
  process.exit(1);
}

const request = queue[requestIndex];

// Register the session
const session = registerSpawnedSession(request.agentId, sessionKey, request.task);

// Update request status
queue[requestIndex].status = 'completed';
queue[requestIndex].sessionKey = sessionKey;
saveSpawnQueue(queue);

console.log(JSON.stringify({
  success: true,
  agentId: request.agentId,
  sessionKey,
  uuid: session.uuid,
  expiresAt: session.expiresAt
}, null, 2));