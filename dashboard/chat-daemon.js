#!/usr/bin/env node
/**
 * Chat Daemon - Watches for new messages and forwards to subagents
 * Runs 24/7, no cron jobs, no triggers needed
 * Usage: node chat-daemon.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';
const CHAT_HISTORY_DIR = path.join(AGENCY_DIR, 'chat_history');
const ACTIVE_SESSIONS_FILE = path.join(AGENCY_DIR, 'active_sessions.json');

// Track which messages we've processed
const processedMessages = new Set();

console.log('[Daemon] Chat watcher started');
console.log('[Daemon] Watching:', CHAT_HISTORY_DIR);

// Check every 500ms for new messages
setInterval(checkForNewMessages, 500);

async function checkForNewMessages() {
  try {
    if (!fs.existsSync(CHAT_HISTORY_DIR)) return;
    
    const files = fs.readdirSync(CHAT_HISTORY_DIR).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const agentId = file.replace('.json', '');
      const chatFile = path.join(CHAT_HISTORY_DIR, file);
      
      try {
        const history = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
        
        // Find pending messages (user sent, agent response is null)
        for (let i = 0; i < history.length; i++) {
          const msg = history[i];
          
          if (msg.sender === 'user' && msg.messageId && !processedMessages.has(msg.messageId)) {
            // Check if next message is pending agent response
            const nextMsg = history[i + 1];
            
            if (nextMsg && 
                nextMsg.sender === 'agent' && 
                nextMsg.messageId === msg.messageId &&
                (nextMsg.status === 'pending' || nextMsg.status === 'forwarding') &&
                nextMsg.message === null) {
              
              console.log(`[Daemon] Found pending message for ${agentId}: ${msg.message}`);
              
              // Mark as processed
              processedMessages.add(msg.messageId);
              
              // Forward to subagent via CLI
              await forwardToSubagent(agentId, msg.message, msg.messageId, nextMsg.sessionKey, chatFile, i + 1);
            }
          }
        }
      } catch (err) {
        console.error(`[Daemon] Error reading ${file}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[Daemon] Error:', err.message);
  }
}

async function forwardToSubagent(agentId, message, messageId, sessionKey, chatFile, responseIndex) {
  try {
    // Get agent identity
    const identities = {
      henry: { name: 'Henry', emoji: '🦉' },
      scout: { name: 'Scout', emoji: '🔍' },
      pixel: { name: 'Pixel', emoji: '🎨' },
      echo: { name: 'Echo', emoji: '💾' },
      quill: { name: 'Quill', emoji: '✍️' },
      codex: { name: 'Codex', emoji: '🏗️' },
      alex: { name: 'Alex', emoji: '🛡️' },
      vega: { name: 'Vega', emoji: '📊' }
    };
    
    const identity = identities[agentId.toLowerCase()] || { name: agentId, emoji: '🤖' };
    const fullMessage = `${identity.emoji} [${identity.name}] Can says: "${message}"`;
    
    console.log(`[Daemon] Forwarding to ${sessionKey}: ${message.substring(0, 50)}...`);
    
    // Create trigger file for main agent to process
    const triggerFile = path.join(AGENCY_DIR, 'daemon_triggers.json');
    const triggers = fs.existsSync(triggerFile) ? JSON.parse(fs.readFileSync(triggerFile, 'utf8')) : [];
    
    triggers.push({
      id: messageId,
      agentId,
      sessionKey,
      message,
      fullMessage,
      timestamp: new Date().toISOString(),
      status: 'needs_forward'
    });
    
    fs.writeFileSync(triggerFile, JSON.stringify(triggers, null, 2));
    console.log(`[Daemon] Trigger created for ${agentId}`);
    
  } catch (err) {
    console.error(`[Daemon] Error forwarding:`, err.message);
  }
}

console.log('[Daemon] Running... (Press Ctrl+C to stop)');