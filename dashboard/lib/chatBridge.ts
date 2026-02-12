#!/usr/bin/env node
/**
 * Chat Message Bridge
 * Polls for pending chat messages and sends them to subagent sessions
 * Called by main agent via heartbeat or manually
 */

import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';
const CHAT_BRIDGE_FILE = path.join(AGENCY_DIR, 'chat_bridge.json');

interface PendingMessage {
  id: string;
  agentId: string;
  sessionKey: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'responded';
  response?: string;
}

/**
 * Load pending messages
 */
export function loadPendingMessages(): PendingMessage[] {
  if (!fs.existsSync(CHAT_BRIDGE_FILE)) {
    return [];
  }
  try {
    const data = JSON.parse(fs.readFileSync(CHAT_BRIDGE_FILE, 'utf8'));
    return data.filter((m: PendingMessage) => m.status === 'pending');
  } catch {
    return [];
  }
}

/**
 * Save message status
 */
export function updateMessageStatus(messageId: string, status: 'sent' | 'responded', response?: string) {
  if (!fs.existsSync(CHAT_BRIDGE_FILE)) {
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(CHAT_BRIDGE_FILE, 'utf8'));
  const msg = data.find((m: PendingMessage) => m.id === messageId);
  
  if (msg) {
    msg.status = status;
    if (response) msg.response = response;
    fs.writeFileSync(CHAT_BRIDGE_FILE, JSON.stringify(data, null, 2));
  }
}

/**
 * Queue a message to be sent to subagent
 */
export function queueMessageForSubagent(
  agentId: string,
  sessionKey: string,
  message: string
): PendingMessage {
  const pending: PendingMessage = {
    id: generateUUID(),
    agentId,
    sessionKey,
    message,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  let data = [];
  if (fs.existsSync(CHAT_BRIDGE_FILE)) {
    data = JSON.parse(fs.readFileSync(CHAT_BRIDGE_FILE, 'utf8'));
  }
  
  data.push(pending);
  fs.writeFileSync(CHAT_BRIDGE_FILE, JSON.stringify(data, null, 2));
  
  return pending;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// If called directly, output pending messages
if (require.main === module) {
  const pending = loadPendingMessages();
  console.log(JSON.stringify(pending, null, 2));
}

export default {
  loadPendingMessages,
  updateMessageStatus,
  queueMessageForSubagent
};