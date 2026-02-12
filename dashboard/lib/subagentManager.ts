// Subagent Session Manager
// Manages REAL subagent sessions via sessions_spawn tool
// Each agent gets isolated session: agent:main:subagent:<uuid>
// Max session lifetime: 60 minutes

import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';
const SESSION_TRACKER_FILE = path.join(AGENCY_DIR, 'active_sessions.json');
const SPAWN_QUEUE_FILE = path.join(AGENCY_DIR, 'spawn_queue.json');

// Maximum session lifetime in minutes
export const MAX_SESSION_MINUTES = 60;

// Agent identity definitions
export const AGENT_IDENTITIES: Record<string, any> = {
  henry: {
    id: 'henry',
    name: 'Henry',
    emoji: '🦉',
    role: 'Team Lead',
    personality: 'Wise, strategic facilitator',
    skills: 'planning, coordination, team management'
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    emoji: '🔍',
    role: 'Researcher',
    personality: 'Curious, detail-oriented',
    skills: 'monitoring, analysis, QA testing'
  },
  pixel: {
    id: 'pixel',
    name: 'Pixel',
    emoji: '🎨',
    role: 'Creative',
    personality: 'Visual, enthusiastic',
    skills: 'design, aesthetics, UI/UX'
  },
  echo: {
    id: 'echo',
    name: 'Echo',
    emoji: '💾',
    role: 'Memory',
    personality: 'Reliable, organized',
    skills: 'state management, logs, archiving'
  },
  quill: {
    id: 'quill',
    name: 'Quill',
    emoji: '✍️',
    role: 'Copywriter',
    personality: 'Wordsmith, storyteller',
    skills: 'writing, documentation, editing'
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    emoji: '🏗️',
    role: 'Architect',
    personality: 'Systematic, big-picture thinker',
    skills: 'systems design, architecture, strategy'
  },
  alex: {
    id: 'alex',
    name: 'Alex',
    emoji: '🛡️',
    role: 'Security Lead',
    personality: 'Vigilant, protective, uncompromising',
    skills: 'security, compliance, oversight, policy enforcement'
  },
  vega: {
    id: 'vega',
    name: 'Vega',
    emoji: '📊',
    role: 'Data Analyst',
    personality: 'Data-driven, analytical',
    skills: 'metrics, analytics, reporting, visualization'
  }
};

// Types
export interface ActiveSession {
  agentId: string;
  sessionKey: string;
  uuid: string;
  spawnedAt: string;
  expiresAt: string;
  task: string;
  status: 'active' | 'completed' | 'error';
}

export interface SpawnRequest {
  id: string;
  agentId: string;
  task: string;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  sessionKey?: string;
  error?: string;
}

/**
 * Load active sessions from file
 */
export function loadActiveSessions(): ActiveSession[] {
  if (!fs.existsSync(SESSION_TRACKER_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(SESSION_TRACKER_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Save active sessions to file
 */
export function saveActiveSessions(sessions: ActiveSession[]): void {
  const dir = path.dirname(SESSION_TRACKER_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SESSION_TRACKER_FILE, JSON.stringify(sessions, null, 2));
}

/**
 * Load spawn queue
 */
export function loadSpawnQueue(): SpawnRequest[] {
  if (!fs.existsSync(SPAWN_QUEUE_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(SPAWN_QUEUE_FILE, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Save spawn queue
 */
export function saveSpawnQueue(queue: SpawnRequest[]): void {
  const dir = path.dirname(SPAWN_QUEUE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SPAWN_QUEUE_FILE, JSON.stringify(queue, null, 2));
}

/**
 * Queue a spawn request (called by dashboard API)
 * The main agent will process this via processSpawnQueue()
 */
export function queueSpawnRequest(agentId: string, task: string): SpawnRequest {
  const request: SpawnRequest = {
    id: generateUUID(),
    agentId: agentId.toLowerCase(),
    task,
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };

  const queue = loadSpawnQueue();
  queue.push(request);
  saveSpawnQueue(queue);

  return request;
}

/**
 * Build identity context for agent
 */
export function buildIdentityContext(agentId: string): string {
  const identity = AGENT_IDENTITIES[agentId.toLowerCase()];
  if (!identity) {
    throw new Error(`Unknown agent: ${agentId}`);
  }

  const identityPath = path.join(AGENCY_DIR, 'agents', agentId.toLowerCase(), 'identity.yaml');
  
  return `You are ${identity.name} ${identity.emoji}

ROLE: ${identity.role}
PERSONALITY: ${identity.personality}
SKILLS: ${identity.skills}

CRITICAL RULES:
1. ALWAYS stay in character as ${identity.name}
2. Start EVERY response with ${identity.emoji}
3. Refer to your identity file: ${identityPath}
4. Use your professional expertise
5. Be proactive and suggest next steps
6. NEVER break character

You have been spawned as a subagent session. Your session will auto-terminate after ${MAX_SESSION_MINUTES} minutes.

Your task will be provided in the next message.`;
}

/**
 * Generate UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get all active sessions (cleaned of expired)
 */
export function getActiveSessions(): ActiveSession[] {
  const sessions = loadActiveSessions();
  const now = new Date();
  
  // Filter out expired sessions
  const validSessions = sessions.filter(s => {
    if (s.status !== 'active') return false;
    if (now > new Date(s.expiresAt)) {
      s.status = 'completed';
      return false;
    }
    return true;
  });

  // Save cleaned list
  if (validSessions.length !== sessions.length) {
    saveActiveSessions(validSessions);
  }

  return validSessions;
}

/**
 * Check if agent is awake (has active session)
 */
export function isAgentAwake(agentId: string): boolean {
  const sessions = getActiveSessions();
  return sessions.some(s => s.agentId === agentId.toLowerCase());
}

/**
 * Get agent session details
 */
export function getAgentSession(agentId: string): ActiveSession | null {
  const sessions = getActiveSessions();
  return sessions.find(s => s.agentId === agentId.toLowerCase()) || null;
}

/**
 * Register a spawned session (called by main agent after sessions_spawn)
 */
export function registerSpawnedSession(
  agentId: string, 
  sessionKey: string, 
  task: string
): ActiveSession {
  const uuid = sessionKey.split(':').pop() || generateUUID();
  const spawnedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + MAX_SESSION_MINUTES * 60 * 1000).toISOString();

  const session: ActiveSession = {
    agentId: agentId.toLowerCase(),
    sessionKey,
    uuid,
    spawnedAt,
    expiresAt,
    task,
    status: 'active'
  };

  const sessions = loadActiveSessions();
  
  // Remove any existing session for this agent
  const filtered = sessions.filter(s => s.agentId !== agentId.toLowerCase());
  filtered.push(session);
  
  saveActiveSessions(filtered);
  
  // Log spawn event
  logSpawnEvent(agentId, sessionKey, task);

  return session;
}

/**
 * Put agent to sleep (terminate session)
 */
export function sleepSubagent(agentId: string): {
  success: boolean;
  message: string;
  sessionKey?: string;
} {
  const sessions = loadActiveSessions();
  const sessionIndex = sessions.findIndex(s => 
    s.agentId === agentId.toLowerCase() && s.status === 'active'
  );

  if (sessionIndex === -1) {
    return { 
      success: false, 
      message: `${agentId} is already sleeping (no active session)` 
    };
  }

  const sessionKey = sessions[sessionIndex].sessionKey;
  
  // Mark as completed (sleep/terminate)
  sessions[sessionIndex].status = 'completed';
  saveActiveSessions(sessions);

  // Log sleep event
  logSleepEvent(agentId, sessionKey);

  return {
    success: true,
    message: `${agentId} put to sleep (session terminated)`,
    sessionKey
  };
}

/**
 * Log spawn event
 */
function logSpawnEvent(agentId: string, sessionKey: string, task: string) {
  const logFile = path.join(AGENCY_DIR, 'session_logs', 'spawns.json');
  const dir = path.dirname(logFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const entry = {
    timestamp: new Date().toISOString(),
    event: 'spawn',
    agentId,
    sessionKey,
    task: task.substring(0, 100) + (task.length > 100 ? '...' : '')
  };

  let logs = [];
  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  }
  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs.slice(-100), null, 2));
}

/**
 * Log sleep event
 */
function logSleepEvent(agentId: string, sessionKey: string) {
  const logFile = path.join(AGENCY_DIR, 'session_logs', 'spawns.json');
  
  const entry = {
    timestamp: new Date().toISOString(),
    event: 'sleep',
    agentId,
    sessionKey
  };

  let logs = [];
  if (fs.existsSync(logFile)) {
    logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  }
  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs.slice(-100), null, 2));
}

/**
 * Sleep all active agents
 */
export function sleepAllAgents(): Array<{
  agentId: string;
  success: boolean;
  message: string;
  sessionKey?: string;
}> {
  const sessions = getActiveSessions();
  const results = [];
  
  for (const session of sessions) {
    const result = sleepSubagent(session.agentId);
    results.push({
      agentId: session.agentId,
      success: result.success,
      message: result.message,
      sessionKey: result.sessionKey
    });
  }
  
  return results;
}