#!/bin/bash
# Disk Space Cleanup Script - Managed by Alex (Immune System)
# Auto-runs when disk usage > 85%

LOG_FILE="/home/ubuntu/.openclaw/workspace/agent-agency/immune-system/logs/disk-cleanup.log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Get current disk usage
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
log "Current disk usage: ${DISK_USAGE}%"

# Check if cleanup needed
if [ "$DISK_USAGE" -lt 85 ]; then
    log "Disk usage below threshold (85%). No cleanup needed."
    exit 0
fi

log "WARNING: Disk usage ${DISK_USAGE}% exceeds threshold. Starting cleanup..."

FREED_TOTAL=0

# 1. Clean npm cache
if command -v npm &> /dev/null; then
    NPM_CACHE_SIZE=$(du -sm /home/ubuntu/.npm/_cacache 2>/dev/null | cut -f1 || echo "0")
    if [ "$NPM_CACHE_SIZE" -gt 0 ]; then
        npm cache clean --force 2>/dev/null
        log "Cleaned npm cache: ${NPM_CACHE_SIZE}MB freed"
        FREED_TOTAL=$((FREED_TOTAL + NPM_CACHE_SIZE))
    fi
fi

# 2. Remove build artifacts (but keep current)
DASHBOARD_DIR="/home/ubuntu/.openclaw/workspace/agent-agency/dashboard"
if [ -d "$DASHBOARD_DIR/.next" ]; then
    BUILD_SIZE=$(du -sm "$DASHBOARD_DIR/.next" 2>/dev/null | cut -f1 || echo "0")
    rm -rf "$DASHBOARD_DIR/.next"
    log "Removed Next.js build artifacts: ${BUILD_SIZE}MB freed"
    FREED_TOTAL=$((FREED_TOTAL + BUILD_SIZE))
fi

# 3. Clean old log files (> 7 days)
OLD_LOGS_SIZE=0
for logfile in $(find /tmp -name "*.log" -type f -mtime +7 2>/dev/null); do
    FILE_SIZE=$(du -sm "$logfile" 2>/dev/null | cut -f1 || echo "0")
    rm -f "$logfile"
    OLD_LOGS_SIZE=$((OLD_LOGS_SIZE + FILE_SIZE))
done
if [ "$OLD_LOGS_SIZE" -gt 0 ]; then
    log "Cleaned old log files: ${OLD_LOGS_SIZE}MB freed"
    FREED_TOTAL=$((FREED_TOTAL + OLD_LOGS_SIZE))
fi

# 4. Clean temporary files
TEMP_SIZE=0
for temp in /tmp/*.tmp /tmp/.temp* /var/tmp/*.tmp; do
    if [ -f "$temp" 2>/dev/null ]; then
        FILE_SIZE=$(du -sm "$temp" 2>/dev/null | cut -f1 || echo "0")
        rm -f "$temp" 2>/dev/null
        TEMP_SIZE=$((TEMP_SIZE + FILE_SIZE))
    fi
done
if [ "$TEMP_SIZE" -gt 0 ]; then
    log "Cleaned temporary files: ${TEMP_SIZE}MB freed"
    FREED_TOTAL=$((FREED_TOTAL + TEMP_SIZE))
fi

# 5. Git garbage collection
cd /home/ubuntu/.openclaw/workspace/agent-agency 2>/dev/null
if [ -d ".git" ]; then
    git gc --auto --quiet 2>/dev/null
    log "Ran git garbage collection"
fi

# Check disk usage after cleanup
NEW_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
log "Cleanup complete. Total freed: ${FREED_TOTAL}MB"
log "Disk usage: ${DISK_USAGE}% → ${NEW_USAGE}%"

# Critical threshold check
if [ "$NEW_USAGE" -gt 95 ]; then
    log "CRITICAL: Disk still at ${NEW_USAGE}%. Immediate attention required!"
    # Notify Can (this would integrate with messaging system)
    exit 1
fi

exit 0
