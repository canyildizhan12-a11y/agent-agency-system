# Routine Verification System
## Regular Self-Checks and Health Monitoring

**Purpose:** Verify integrity, check files/endpoints, heal if needed  
**Maintainer:** Alex 🛡️ (verification) + All agents (compliance)  
**Schedule:** Every heartbeat + Weekly deep check

---

## Heartbeat Checks (Every 30 minutes)

### Check 1: Time Awareness
**Verify:** All times correctly in TRT (GMT+3)
```
Status: ✅ Current time 11:30 TRT
Action if fail: Alert, sync with system clock
```

### Check 2: File Integrity
**Verify:** Critical files exist and are valid
```
Files to check:
- agent-agency/AGENCY_HANDBOOK.md
- All agent identity.yaml files
- Immune system policies
- Shared consciousness data

Status: ✅ All files valid
Action if fail: Restore from backup
```

### Check 3: Agent State Consistency
**Verify:** All agents have valid states
```
Status: ✅ 7 agents, 2 awake, 5 sleeping
Action if fail: Respawn corrupted agents
```

### Check 4: Budget Tracking
**Verify:** Token tracker functioning
```
Status: ✅ Tracker active, 22% used
Action if fail: Reset tracker, recalculate
```

### Check 5: Immune System Health
**Verify:** Alex operational, policies loaded
```
Status: ✅ Immune system active
Action if fail: Reload policies, notify Can
```

### Check 6: Laziness Check
**Verify:** No stalled work, no avoidance
```
Active tasks: 1 (Henry - coordinating)
Time elapsed: 15 min / estimate 30 min
Progress: 50% ✓
Status: ✅ No laziness detected
Action if fail: Auto-correct, report
```

### Check 7: Memory Consistency
**Verify:** No corruption in shared memory
```
Status: ✅ Memory consistent
Action if fail: Reconcile, restore from backup
```

---

## Weekly Deep Check (Sundays 16:00 TRT)

### Comprehensive Audit

**1. Full Filesystem Scan**
```
Scan all: /workspace/agent-agency/
Check: Permissions, integrity, consistency
Report: Issues found and fixed
```

**2. Agent Identity Verification**
```
Verify: All 7 identity.yaml files
Check: No unauthorized modifications
Check: Consistency with AGENCY_HANDBOOK
Report: Identity drift if any
```

**3. Memory Audit**
```
Review: Short-term memories (last 7 days)
Check: Proper aging and consolidation
Check: Privacy levels correct
Action: Archive old, promote important
```

**4. Immune System Audit**
```
Review: All blocks from past week
Check: False positive rate
Check: Policy effectiveness
Action: Recalibrate if needed
```

**5. Budget Review**
```
Analyze: Token usage patterns
Check: Budget adherence
Forecast: Next week projection
Action: Adjust routing if needed
```

**6. Feedback Loop Review**
```
Review: Preferences learned
Check: Application rate
Verify: No conflicting preferences
Action: Consolidate, clarify with Can
```

**7. Self-Healing Review**
```
Review: All healings performed
Check: Success rate
Check: Root causes
Action: Prevent recurrence
```

**8. Endpoint Health**
```
Test: All external endpoints
Verify: Response times
Check: Fallbacks functional
```

---

## Verification Report Format

### Daily (Heartbeat Summary)
```
ROUTINE CHECK - 2026-02-12 11:30 TRT

✅ Time awareness: TRT (GMT+3) correct
✅ File integrity: All critical files valid
✅ Agent states: 7 agents consistent
✅ Budget tracking: 22% used, tracker OK
✅ Immune system: Active, policies loaded
✅ Laziness check: No issues detected
✅ Memory consistency: Shared memory valid

Status: ALL SYSTEMS HEALTHY
Next check: 12:00 TRT
```

### Weekly (Deep Check Summary)
```
WEEKLY VERIFICATION - 2026-02-09 to 2026-02-15

FILES:        ✅ 100% integrity
AGENTS:       ✅ All identities verified
MEMORY:       ✅ 234 memories consolidated
IMMUNE:       ✅ 12 blocks, 0 false positives
BUDGET:       ✅ $52 of $60 used (87%)
FEEDBACK:     ✅ 15 preferences learned
HEALING:      ✅ 3 auto-recoveries
ENDPOINTS:    ✅ All responsive

Issues Found: 2 minor (auto-resolved)
Recommendations: Update backup schedule

Overall Health: EXCELLENT
```

---

## Auto-Healing Triggers

During verification, if issues found:

| Issue | Auto-Action | Notify Can? |
|-------|-------------|-------------|
| Missing file | Restore from backup | No |
| Corrupted file | Repair or restore | No |
| Zombie agent | Respawn | Yes |
| Token tracker error | Reset | No |
| Policy load failure | Retry + alert | Yes |
| Memory inconsistency | Reconcile | No |
| Stalled work | Auto-correct | Yes |
| Budget overrun | Block + alert | Yes |

---

## Manual Verification

Can can request verification:

```
Can: "Run full system check"
→ Execute all heartbeat checks immediately

Can: "Verify agent [name]"
→ Check specific agent state

Can: "Check file integrity"
→ Run filesystem scan

Can: "Weekly report"
→ Generate comprehensive summary
```

---

## "Heal Yourself If Needed"

When issues detected:

1. **Assess severity**
   - Minor: Fix silently
   - Major: Fix + log
   - Critical: Fix + notify Can

2. **Apply healing**
   - Use Self-Healer procedures
   - Follow recovery protocols
   - Verify fix successful

3. **Document**
   - Log all actions
   - Update healing history
   - Note patterns

4. **Prevent recurrence**
   - Update monitoring
   - Adjust thresholds
   - Improve resilience

---

**Last Updated:** 2026-02-12  
**Next Weekly Check:** Sunday 16:00 TRT  
**Maintainer:** Alex 🛡️
