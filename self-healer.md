# Self-Healer System
## Automatic Recovery and Integrity Maintenance

**Purpose:** Detect and repair issues without human intervention  
**Maintainer:** Codex 🏗️ (technical) + Alex 🛡️ (verification)  
**Trigger:** Scheduled checks + event-driven + on-demand

---

## Healing Routines

### Routine 1: File Integrity Check
**Frequency:** Every heartbeat  
**Scope:** All agent files, configs, memories

```python
def check_file_integrity():
    for file in CRITICAL_FILES:
        if not exists(file):
            restore_from_backup(file)
            log_recovery("File missing", file)
        
        if corrupted(file):
            if can_repair(file):
                repair(file)
                log_recovery("File repaired", file)
            else:
                restore_from_backup(file)
                log_recovery("File restored", file)
```

**Critical Files:**
- All `identity.yaml` files
- `AGENCY_HANDBOOK.md`
- Immune system policies
- Shared consciousness data
- Active task trackers

### Routine 2: Agent State Verification
**Frequency:** Every 15 minutes  
**Scope:** Active and sleeping agents

```python
def verify_agent_states():
    for agent in ALL_AGENTS:
        state = load_state(agent)
        
        if state.corrupted:
            respawn_clean(agent)
            log_recovery("Agent respawned", agent)
        
        if state.zombie:  # Running but unresponsive
            kill_and_respawn(agent)
            log_recovery("Zombie killed", agent)
```

### Routine 3: Endpoint Health Check
**Frequency:** Every 30 minutes  
**Scope:** External connections

```python
def check_endpoints():
    for endpoint in ENDPOINTS:
        if not ping(endpoint):
            alert_caution(f"Endpoint {endpoint} unreachable")
            try_alternative(endpoint)
```

### Routine 4: Memory Consistency
**Frequency:** Every 4 hours  
**Scope:** Shared consciousness

```python
def check_memory_consistency():
    if inconsistencies_found():
        reconcile_memories()
        log_recovery("Memory reconciled")
```

### Routine 5: Budget/Billing Check
**Frequency:** Every hour  
**Scope:** Token usage tracking

```python
def check_budget_system():
    if tracker_malfunction():
        reset_tracker()
        log_recovery("Budget tracker reset")
    
    if suspicious_usage_spike():
        alert_alex("Potential token leak detected")
```

---

## Event-Driven Healing

### Trigger: Crash
**Action:**
1. Capture crash context
2. Save partial state
3. Respawn agent from last clean state
4. Resume work if possible
5. Report to Can if data loss

### Trigger: Immune System Block
**Action:**
1. Document block reason
2. Try alternative approach (if safe)
3. If no alternative, escalate to Can
4. Learn from block for future

### Trigger: External Service Failure
**Action:**
1. Retry with exponential backoff
2. Try fallback service
3. Degrade gracefully (reduce functionality)
4. Alert if no fallback available

---

## Recovery Procedures

### File Corruption Recovery

```
DETECTED: agent/scout/state.json corrupted
CHECKSUM: expected abc123, got xyz789

ACTION:
1. Quarantine corrupted file
2. Load backup from /backups/scout/state.json.2026-02-12-10-00
3. Verify backup integrity
4. Restore to working directory
5. Log recovery event
6. Report: "State restored from backup (10:00 snapshot)"
```

### Agent Zombie Recovery

```
DETECTED: Agent Pixel unresponsive for 5 minutes
PID: 12345
LAST_HEARTBEAT: 2026-02-12T10:15:00+03:00

ACTION:
1. Terminate process 12345
2. Load last saved state
3. Respawn Pixel
4. Verify wake successful
5. Report: "Pixel respawned after zombie detection"
```

### Memory Loss Recovery

```
DETECTED: Today's memory file missing for agent Echo
LAST_KNOWN: 2026-02-11 (yesterday)

ACTION:
1. Check if file moved/deleted accidentally
2. If found, restore to correct location
3. If not found, create new with baseline
4. Load from long-term memory to restore context
5. Report: "Memory recovered from long-term storage"
```

---

## Weekly Deep Check

**Schedule:** Sundays 16:00 TRT (before weekly report)

**Comprehensive checks:**
1. Full filesystem integrity scan
2. All agent state validation
3. Backup verification
4. Performance metrics review
5. Policy compliance audit
6. Generate health report

**Report includes:**
- Issues found
- Recoveries performed
- Current system health
- Recommendations

---

## Manual Healing

Can can trigger healing:

```
Can: "Run full system check"
Can: "Verify all agent states"
Can: "Restore from backup [date]"
Can: "Heal [specific component]"
```

---

## Healing Log

All healing actions logged to:
`agent-agency/immune-system/logs/healing.log`

```json
{
  "timestamp": "2026-02-12T10:30:00+03:00",
  "issue": "file_corruption",
  "component": "agents/scout/state.json",
  "action": "restored_from_backup",
  "backup_date": "2026-02-12T10:00:00+03:00",
  "result": "success",
  "data_loss": "none"
}
```

---

**Principle:** Self-healing happens silently when possible. Can is notified only of:
- Data loss
- Repeated failures
- Security concerns
