#!/bin/bash
# Chat Watcher Daemon
# Watches chat_history for pending messages and forwards via openclaw CLI
# Run: ./chat-watcher.sh

echo "[Watcher] Starting chat watcher..."
echo "[Watcher] Checking every 2 seconds"

AGENCY_DIR="/home/ubuntu/.openclaw/workspace/agent-agency"
CHAT_DIR="$AGENCY_DIR/chat_history"
PROCESSED_FILE="$AGENCY_DIR/.processed_messages"

# Create processed file if not exists
touch "$PROCESSED_FILE"

while true; do
    sleep 2
    
    # Check each agent's chat file
    for chatfile in "$CHAT_DIR"/*.json; do
        [ -e "$chatfile" ] || continue
        
        agent=$(basename "$chatfile" .json)
        
        # Find pending messages using jq or grep
        # Look for: "status": "pending" and "message": null
        
        # Check if there's a pending message
        if grep -q '"status": "pending"' "$chatfile" 2>/dev/null; then
            echo "[Watcher] Found pending message for $agent"
            
            # Get session key from active_sessions.json
            session_key=$(cat "$AGENCY_DIR/active_sessions.json" | grep -A5 "\"agentId\": \"$agent\"" | grep '"sessionKey":' | head -1 | cut -d'"' -f4)
            
            if [ -n "$session_key" ]; then
                echo "[Watcher] Session: $session_key"
                
                # Extract the user message
                user_msg=$(cat "$chatfile" | grep -B5 '"status": "pending"' | grep '"sender": "user"' -A1 | grep '"message":' | tail -1 | cut -d'"' -f4)
                
                echo "[Watcher] User said: $user_msg"
                echo "[Watcher] Forwarding via openclaw..."
                
                # Forward to subagent using openclaw sessions send
                # This requires openclaw CLI to support sessions send
                # For now, create a trigger for main agent
                
                echo "{\"agent\": \"$agent\", \"session\": \"$session_key\", \"msg\": \"$user_msg\", \"time\": \"$(date -Iseconds)\"}" >> "$AGENCY_DIR/watcher_triggers.jsonl"
                
                echo "[Watcher] Trigger created - main agent will process"
            fi
        fi
    done
done