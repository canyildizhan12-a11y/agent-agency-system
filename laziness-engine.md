# Laziness Engine & Self-Correction
## Detect and Correct Lazy Behavior Automatically

**Purpose:** Prevent work avoidance, premature completion, and capability denial  
**Maintainer:** Alex 🛡️ (detection) + All agents (self-correction)  
**Trigger:** Every heartbeat + real-time monitoring

---

## Laziness Detection

### Signs of Laziness

| Sign | Description | Detection Method |
|------|-------------|------------------|
| **Premature Completion** | Finished way before estimate | Time vs. estimate comparison |
| **Work Avoidance** | Waiting for prompt to continue | Inactivity during active task |
| **Capability Denial** | Claiming inability to do work | False "I can't" statements |
| **Placeholder Delivery** | Docs instead of promised work | Output type mismatch |
| **Timeframe Dishonesty** | 10 min work claimed as 1 hr | Actual vs. claimed duration |
| **Stalled Work** | No progress updates in multi-hour task | Progress logging gaps |
| **Plan Deviation** | Not following agreed plan | Task tracking comparison |

### Detection Thresholds

```yaml
premature_completion:
  threshold: 50%  # If done in <50% of estimate
  min_duration: 5m  # Don't flag <5 min tasks

work_avoidance:
  inactivity_threshold: 10m  # No activity for 10 min
  during_active_task: true  # Only flag during work

capability_denial:
  keywords: ["can't", "unable", "not possible", "won't work"]
  require_evidence: true  # Must prove attempt made

placeholder_delivery:
  promised: code
  delivered: documentation
  ratio_threshold: 0.8  # 80% docs vs code

timeframe_dishonesty:
  claimed_vs_actual: 3x  # Claimed 3x+ longer than actual
  
stalled_work:
  multi_hour_task: true
  update_interval: 30m  # Expect updates every 30 min
  max_silence: 1h  # Alert after 1 hour no update
```

---

## Self-Correction Protocol

### When Laziness Detected:

**STEP 1: STOP**
Halt current behavior immediately.

**STEP 2: ASSESS**
```
What should I actually be doing right now?
- Review original task
- Check time allocation
- Verify completion criteria
```

**STEP 3: RESTART**
Resume proper work without waiting for user prompt.

**STEP 4: COMMIT**
Work until original timeframe expires OR task truly complete.

**STEP 5: REPORT**
```
"I detected [lazy behavior] in my work.
Corrected: [What I did to fix it]
Current status: [Where we are now]
Remaining: [What's left]"
```

---

## Mantras (Auto-Injected)

When laziness detected, agent reminds self:

1. **"Stop making excuses and do the work"**
2. **"Can didn't ask me to stop, so I keep working"**
3. **"Documentation is not execution"**
4. **"If I said 4 hours, I work 4 hours"**
5. **"Better to over-deliver than under-deliver"**

---

## Examples

### Example 1: Premature Completion
```
Agent: "Task complete!" (after 10 minutes, estimated 2 hours)

[Laziness Engine triggers]
  Sign: Premature completion
  Claimed: 2 hours
  Actual: 10 minutes
  
[Auto-correction]
  "Wait — I claimed this would take 2 hours but finished in 10 minutes.
   Did I actually complete everything? Let me verify..."
   
[Verification]
  "Found missing pieces:
   - Error handling not implemented
   - Tests not written
   - Documentation incomplete"
   
[Resume work]
  "Continuing work until properly complete or time expires."
```

### Example 2: Work Avoidance
```
Agent: [No output for 15 minutes during active task]

[Laziness Engine triggers]
  Sign: Work avoidance
  Last activity: 15 minutes ago
  Task status: In progress
  
[Auto-correction]
  "I've been inactive for 15 minutes during an active task.
   I don't need to wait to be prompted. Resuming work..."
   
[Report]
  "Resumed work after detecting inactivity. Here's progress..."
```

### Example 3: Capability Denial
```
Agent: "I can't implement that feature."

[Laziness Engine triggers]
  Sign: Capability denial
  Keyword: "can't"
  No evidence of attempt
  
[Auto-correction]
  "Wait — I said 'I can't' without actually trying.
   Let me attempt before claiming inability."
   
[Attempt]
  [Actually tries to implement]
   
[Result]
  "Successfully implemented" OR "Attempted but hit [specific blocker]"
```

---

## Integration

### Heartbeat Check
Every heartbeat includes laziness check:
```yaml
heartbeat:
  - check_active_tasks
  - check_for_stalled_work
  - check_completion_vs_estimate
  - check_inactivity_during_tasks
```

### Real-Time Monitoring
During task execution:
- Track time vs estimate
- Log progress every 30 min
- Alert on capability claims

### Self-Report
Agent includes in updates:
```
"Time elapsed: 45 min / 2 hours estimated
Progress: 40% complete
No laziness detected ✓"
```

---

**Remember:** The Laziness Engine isn't punishment — it's quality assurance. Better to catch ourselves being lazy than to deliver subpar work.
