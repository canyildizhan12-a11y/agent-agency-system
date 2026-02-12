#!/usr/bin/env node
/**
 * Chat Auto-Processor
 * Watches chat history for new messages and automatically forwards them to subagents
 * Main agent (Garmin) runs this to handle dashboard chat seamlessly
 */

import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';
const CHAT_HISTORY_DIR = path.join(AGENCY_DIR, 'chat_history');
const PROCESSED_LOG = path.join(AGENCY_DIR, 'processed_messages.json');

interface ChatMessage {
  sender: 'user' | 'agent';
  message: string | null;
  timestamp: string;
  messageId?: string;
  sessionKey?: string;
  status?: 'pending' | 'completed' | 'error';
  queuedId?: string;
}

interface ProcessedEntry {
  messageId: string;
  agentId: string;
  processedAt: string;
  forwarded: boolean;
  responseReceived: boolean;
}

/**
 * Find pending messages that need forwarding to subagents
 */
export function findPendingMessages(): Array<{
  agentId: string;
  message: string;
  messageId: string;
  sessionKey: string;
}> {
  const pending: Array<{
    agentId: string;
    message: string;
    messageId: string;
    sessionKey: string;
  }> = [];

  // Check each agent's chat history
  if (!fs.existsSync(CHAT_HISTORY_DIR)) {
    return pending;
  }

  const files = fs.readdirSync(CHAT_HISTORY_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const agentId = file.replace('.json', '');
    const chatFile = path.join(CHAT_HISTORY_DIR, file);
    
    try {
      const history: ChatMessage[] = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
      
      // Find user messages that don't have a completed agent response
      for (let i = 0; i < history.length; i++) {
        const msg = history[i];
        
        if (msg.sender === 'user' && msg.messageId && msg.sessionKey) {
          // Check if next message is a pending agent response
          const nextMsg = history[i + 1];
          
          if (nextMsg && 
              nextMsg.sender === 'agent' && 
              nextMsg.messageId === msg.messageId &&
              nextMsg.status === 'pending' &&
              nextMsg.message === null) {
            
            pending.push({
              agentId,
              message: msg.message || '',
              messageId: msg.messageId || '',
              sessionKey: msg.sessionKey || ''
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error reading ${file}:`, err);
    }
  }

  return pending;
}

/**
 * Mark message as processed
 */
export function markMessageProcessed(
  agentId: string,
  messageId: string,
  response: string
): void {
  const chatFile = path.join(CHAT_HISTORY_DIR, `${agentId}.json`);
  
  if (!fs.existsSync(chatFile)) {
    return;
  }

  try {
    const history: ChatMessage[] = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
    
    // Find and update the pending agent message
    const msg = history.find(m => 
      m.sender === 'agent' && 
      m.messageId === messageId && 
      m.status === 'pending'
    );
    
    if (msg) {
      msg.message = response;
      msg.status = 'completed';
      fs.writeFileSync(chatFile, JSON.stringify(history, null, 2));
      console.log(`[Chat] Updated ${agentId}'s response for message ${messageId}`);
    }
  } catch (err) {
    console.error(`Error updating ${chatFile}:`, err);
  }
}

/**
 * Main function - call this to process pending messages
 * Returns list of messages that need forwarding
 */
export function getMessagesToForward(): Array<{
  agentId: string;
  message: string;
  messageId: string;
  sessionKey: string;
}> {
  return findPendingMessages();
}

// If called directly, output pending messages
if (require.main === module) {
  const pending = findPendingMessages();
  console.log(JSON.stringify(pending, null, 2));
}

export default {
  findPendingMessages,
  markMessageProcessed,
  getMessagesToForward
};