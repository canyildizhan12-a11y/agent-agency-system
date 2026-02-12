// Chat Message Queue System
// Async message processing with polling-based responses

import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';
const QUEUE_DIR = path.join(AGENCY_DIR, 'chat_queue');
const RESPONSE_DIR = path.join(AGENCY_DIR, 'chat_responses');

export interface QueuedMessage {
  id: string;
  agentId: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  response?: string;
  error?: string;
  processedAt?: string;
}

/**
 * Add message to processing queue
 */
export function queueMessage(agentId: string, message: string): QueuedMessage {
  const id = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const queuedMessage: QueuedMessage = {
    id,
    agentId,
    message,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  const queueFile = path.join(QUEUE_DIR, `${id}.json`);
  fs.writeFileSync(queueFile, JSON.stringify(queuedMessage, null, 2));
  
  return queuedMessage;
}

/**
 * Get next pending message from queue
 */
export function getNextPendingMessage(): QueuedMessage | null {
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const filepath = path.join(QUEUE_DIR, file);
    const message: QueuedMessage = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    if (message.status === 'pending') {
      return message;
    }
  }
  
  return null;
}

/**
 * Update message status
 */
export function updateMessageStatus(
  id: string, 
  status: QueuedMessage['status'], 
  response?: string,
  error?: string
): void {
  const queueFile = path.join(QUEUE_DIR, `${id}.json`);
  
  if (!fs.existsSync(queueFile)) return;
  
  const message: QueuedMessage = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  message.status = status;
  message.processedAt = new Date().toISOString();
  
  if (response) message.response = response;
  if (error) message.error = error;
  
  fs.writeFileSync(queueFile, JSON.stringify(message, null, 2));
  
  // Also write to responses directory for quick lookup
  if (status === 'completed' || status === 'error') {
    const responseFile = path.join(RESPONSE_DIR, `${message.agentId}.json`);
    fs.writeFileSync(responseFile, JSON.stringify({
      messageId: id,
      agentId: message.agentId,
      response: response || error,
      timestamp: message.processedAt,
      status
    }, null, 2));
  }
}

/**
 * Get latest response for agent
 */
export function getLatestResponse(agentId: string): { response: string; timestamp: string; status: string } | null {
  const responseFile = path.join(RESPONSE_DIR, `${agentId}.json`);
  
  if (!fs.existsSync(responseFile)) return null;
  
  return JSON.parse(fs.readFileSync(responseFile, 'utf8'));
}

/**
 * Get all pending messages for an agent
 */
export function getPendingMessages(agentId: string): QueuedMessage[] {
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json'));
  const messages: QueuedMessage[] = [];
  
  for (const file of files) {
    const message: QueuedMessage = JSON.parse(
      fs.readFileSync(path.join(QUEUE_DIR, file), 'utf8')
    );
    
    if (message.agentId === agentId && message.status === 'pending') {
      messages.push(message);
    }
  }
  
  return messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Clean up old messages (keep last 24h)
 */
export function cleanupOldMessages(): void {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000);
  const files = fs.readdirSync(QUEUE_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const filepath = path.join(QUEUE_DIR, file);
    const message: QueuedMessage = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const msgTime = new Date(message.timestamp).getTime();
    
    if (msgTime < cutoff) {
      fs.unlinkSync(filepath);
    }
  }
}

export default {
  queueMessage,
  getNextPendingMessage,
  updateMessageStatus,
  getLatestResponse,
  getPendingMessages,
  cleanupOldMessages
};