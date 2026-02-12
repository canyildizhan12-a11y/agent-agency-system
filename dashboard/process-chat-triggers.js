#!/usr/bin/env node
/**
 * Chat Trigger Processor
 * Watches for chat triggers and forwards to subagents
 * Run this: node process-chat-triggers.js
 * Or call it every few seconds via cron
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';
const TRIGGER_FILE = path.join(AGENCY_DIR, 'chat_triggers.json');
const CHAT_HISTORY_DIR = path.join(AGENCY_DIR, 'chat_history');

function loadTriggers() {
  if (!fs.existsSync(TRIGGER_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TRIGGER_FILE, 'utf8'));
  } catch { return []; }
}

function saveTriggers(triggers) {
  fs.writeFileSync(TRIGGER_FILE, JSON.stringify(triggers, null, 2));
}

function loadHistory(chatFile) {
  if (!fs.existsSync(chatFile)) return [];
  try { return JSON.parse(fs.readFileSync(chatFile, 'utf8')); } catch { return []; }
}

function saveHistory(chatFile, history) {
  const dir = path.dirname(chatFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
}

// Forward message to subagent using sessions_send via CLI
// Since CLI doesn't have sessions_send, we write to a file that main agent processes
function forwardToSubagent(trigger) {
  console.log(`[Processor] Forwarding to ${trigger.agentName}: ${trigger.message.substring(0, 50)}...`);
  
  const fullMessage = `${trigger.agentEmoji} [${trigger.agentName}] Can says: "${trigger.message}"`;
  
  // Write to forward queue for main agent to pick up
  const forwardFile = path.join(AGENCY_DIR, 'forward_queue.json');
  const queue = fs.existsSync(forwardFile) ? JSON.parse(fs.readFileSync(forwardFile, 'utf8')) : [];
  
  queue.push({
    id: trigger.id,
    agentId: trigger.agentId,
    agentName: trigger.agentName,
    sessionKey: trigger.sessionKey,
    message: fullMessage,
    timestamp: new Date().toISOString(),
    status: 'needs_send'
  });
  
  fs.writeFileSync(forwardFile, JSON.stringify(queue, null, 2));
  
  console.log(`[Processor] Queued for main agent to send via sessions_send`);
  
  // Update trigger status
  trigger.status = 'forwarded';
  
  return true;
}

// Main processing loop
function processTriggers() {
  const triggers = loadTriggers();
  const pending = triggers.filter(t => t.status === 'needs_forward');
  
  if (pending.length === 0) {
    console.log('[Processor] No pending triggers');
    return;
  }
  
  console.log(`[Processor] Found ${pending.length} pending triggers`);
  
  for (const trigger of pending) {
    forwardToSubagent(trigger);
  }
  
  saveTriggers(triggers);
  console.log(`[Processor] Forwarded ${pending.length} messages`);
}

// Run immediately
processTriggers();

// Export for use as module
module.exports = { processTriggers };