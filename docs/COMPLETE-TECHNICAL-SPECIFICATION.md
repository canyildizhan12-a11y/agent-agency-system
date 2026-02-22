# Agent Agency Complete Technical Documentation

**Document Title:** OpenClaw Agent Agency - Complete Technical Specification  
**Version:** 2.0  
**Date:** 2026-02-22  
**Status:** Production Ready  
**Authors:** Agent Agency Team (Henry, Scout, Pixel, Echo, Quill, Codex, Alex, Vega)  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Multi-Agent Structure](#3-multi-agent-structure)
4. [Immune System (Security)](#4-immune-system-security)
5. [Feedback Loop (Learning)](#5-feedback-loop-learning)
6. [Self-Healing System](#6-self-healing-system)
7. [Laziness Engine](#7-laziness-engine)
8. [SkillRL: Self-Improving Memory](#8-skillrl-self-improving-memory)
9. [Memory & Persistence](#9-memory--persistence)
10. [Communication Protocols](#10-communication-protocols)
11. [Operational Workflows](#11-operational-workflows)
12. [Cron Schedule](#12-cron-schedule)
13. [Cost Management](#13-cost-management)
14. [File Structure](#14-file-structure)
15. [Getting Started](#15-getting-started)

---

## 1. Executive Summary

The **Agent Agency** is a biologically-inspired multi-agent AI system that operates as a unified organism under human oversight. Unlike traditional isolated AI tools, this system creates 8 specialized agents working collaboratively through a shared consciousness model.

### Core Innovations

| Innovation | Description |
|------------|-------------|
| **Shared Consciousness** | All agents see each other's memories and work |
| **Immune System** | Absolute security layer that cannot be bypassed |
| **Feedback Loop** | Learns from Can's preferences automatically |
| **Self-Healing** | Automatic recovery from corruption and failures |
| **Laziness Detection** | Prevents work avoidance and premature completion |
| **SkillRL** | Self-improving skill system that learns from experiences |
| **Persistent Identity** | Agents survive respawns with continuity |

### System Statistics

- **Agents:** 8 specialized AI agents
- **Meetings:** Bi-daily (09:00 & 17:00 TRT)
- **Budget Target:** $60/month
- **Availability:** 24/7 with heartbeat monitoring
- **Security:** 3-zone policy enforcement (Green/Yellow/Red)

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAN (Human Authority)                         │
│                    Ultimate Decision Maker                           │
│                  (Ultimate Override Authority)                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GARMIN (Main Coordinator)                          │
│              Consciousness Coordinator & Inspector                   │
│                    (Garmin = Main Agent)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐
│   ACTIVE AGENT  │ │   AGENT STATE   │ │     SHARED MEMORY      │
│    (Runtime)    │ │    (Storage)    │ │      (Access Layer)    │
└────────┬────────┘ └────────┬────────┘ └───────────┬─────────────┘
         │                    │                       │
         └────────────────────┼───────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    IMMUNE SYSTEM (Kernel Layer)                      │
│              Action Interception & Verification                      │
│              (Alex 🛡️ - Always Active)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Core Components

| Component | Description | Manager |
|-----------|-------------|---------|
| **Agent Layer** | 8 specialized agents | Henry (coordination) |
| **Memory Layer** | Shared consciousness | Echo |
| **Security Layer** | Immune system | Alex |
| **Learning Layer** | Feedback + SkillRL | Scout + Echo |
| **Recovery Layer** | Self-healing | Codex |
| **Verification Layer** | Routine checks | Alex |

### 2.3 Data Flow

```
USER REQUEST
     │
     ▼
┌─────────────────┐
│   GARMIN       │ ◄── Routes to appropriate agent
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Immune System  │ ◄── Checks zones (Green/Yellow/Red)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
 ALLOWED   BLOCKED
    │         │
    ▼         ▼
┌─────────┐  ┌──────────────┐
│ EXECUTE │  │ ESCALATE TO  │
│         │  │ CAN          │
└────┬────┘  └──────────────┘
     │
     ▼
┌─────────────────┐
│  Feedback Loop  │ ◄── Learn from results
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SkillRL      │ ◄── Extract skills
│   (Optional)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Save State   │ ◄── Persistence
└─────────────────┘
```

---

## 3. Multi-Agent Structure

### 3.1 Agent Overview

The Agency consists of 8 specialized agents, each with unique responsibilities:

| Emoji | Agent | Role | Specialty | Always Active |
|-------|-------|------|-----------|---------------|
| 🦆 | **Henry** | Team Lead | Coordination, Strategy | No |
| 🔍 | **Scout** | Research | Intelligence, Budget | No |
| 🎨 | **Pixel** | Creative | Visual Design, UX | No |
| 💾 | **Echo** | Memory | Persistence, Identity | No |
| ✍️ | **Quill** | Documentation | Writing, Standards | No |
| 🏗️ | **Codex** | Architecture | Technical Design | No |
| 🛡️ | **Alex** | Immune System | Security, Verification | **YES** |
| 📊 | **Vega** | Data Analyst | Metrics, KPIs | No |

### 3.2 Detailed Agent Specifications

#### Henry 🦆 - Team Lead

```yaml
agent_id: henry
role: Team Lead / Strategic Planning

responsibilities:
  - Facilitate bi-daily meetings
  - Coordinate agent tasks
  - Strategic planning
  - Priority assignment

wake_conditions:
  - user_request: true
  - meeting_schedule: ["09:00", "17:00"]
  - garmin_decision: true
  - priority: ["p0", "p1"]

authority:
  - can_assign_tasks: true
  - can_wake_agents: true
  - can_run_meetings: true
  - cannot_override_immune_system: true
```

#### Scout 🔍 - Research & Intelligence

```yaml
agent_id: scout
role: Research / Intelligence / Budget Guardian

responsibilities:
  - Market research
  - Competitor analysis
  - Trend monitoring
  - Token budget optimization

wake_conditions:
  - user_request: "research X"
  - meeting_participation: true

domain_expertise:
  - web_research
  - pricing_analysis
  - competitor_intelligence
  - budget_optimization

cost_awareness:
  - max_tokens_simple: 500
  - max_tokens_standard: 5000
  - must_check_budget: true
```

#### Pixel 🎨 - Creative

```yaml
agent_id: pixel
role: Creative Director / Designer

responsibilities:
  - Visual design
  - User experience
  - Dashboard aesthetics
  - Design systems

domain_expertise:
  - visual_design
  - ux_design
  - dashboard_creation
  - frontend_development
```

#### Echo 💾 - Memory

```yaml
agent_id: echo
role: Memory / Identity Systems

responsibilities:
  - Memory persistence
  - State management
  - Identity continuity
  - Respawn protocols

domain_expertise:
  - memory_systems
  - identity_persistence
  - state_management
  - serialization

CRITICAL: Echo maintains all agent state and memory
```

#### Quill ✍️ - Documentation

```yaml
agent_id: quill
role: Documentation / Writing

responsibilities:
  - Technical writing
  - Standards creation
  - Knowledge management
  - Meeting documentation

domain_expertise:
  - technical_writing
  - documentation
  - standards_creation
  - communication
```

#### Codex 🏗️ - Architecture

```yaml
agent_id: codex
role: Architecture / Systems

responsibilities:
  - Technical design
  - System architecture
  - Implementation planning
  - Integration design

domain_expertise:
  - system_architecture
  - technical_design
  - integration
  - performance_optimization
```

#### Alex 🛡️ - Immune System

```yaml
agent_id: alex
role: Immune System / Security

responsibilities:
  - Security oversight
  - Policy enforcement
  - Action verification
  - Daily reporting

wake_conditions:
  - always_active: true  # EXCEPTION - runs continuously
  - immune_system_particle: true
  - red_zone_alert: true
  - critical_decision_required: true

authority:
  - can_block_any_action: true  # Routine decisions
  - can_escalate_to_can: true   # Critical decisions
  - can_audit_everything: true
  - can_override_immune: false  # Only Can can override

CRITICAL: Alex is ALWAYS RUNNING in background
```

#### Vega 📊 - Data Analyst

```yaml
agent_id: vega
role: Data Analyst / Business Intelligence

responsibilities:
  - KPI tracking
  - Performance metrics
  - Data visualization
  - Weekly reports

domain_expertise:
  - business_intelligence
  - kpi_tracking
  - trend_analysis
  - data_visualization

relationships:
  - henry: strategic_partner
  - scout: research_validator
  - alex: security_metrics
```

### 3.3 Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT LIFECYCLE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SLEEP (Serialized State)                                   │
│     │                                                        │
│     │ [Wake Trigger]                                        │
│     ▼                                                        │
│  DESERIALIZE                                                 │
│     │                                                        │
│     │ Load identity.yaml                                     │
│     ▼                                                        │
│  LOAD STATE                                                  │
│     │                                                        │
│     │ Load state.json                                        │
│     ▼                                                        │
│  VERIFY (Immune System)                                      │
│     │                                                        │
│     │ Green/Yellow/Red check                                │
│     ▼                                                        │
│  ACTIVE (Processing)                                        │
│     │                                                        │
│     │ Execute assigned task                                  │
│     ▼                                                        │
│  SAVE STATE                                                  │
│     │                                                        │
│     │ Serialize to state.json                                │
│     ▼                                                        │
│  SLEEP (Serialized State)                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Immune System (Security)

### 4.1 Overview

The **Immune System** is the security layer of the Agent Agency. It operates continuously (24/7) and has absolute authority over all actions except when Can overrides.

**Key Principle:** Security cannot be bypassed. Only Can can override a security decision.

### 4.2 Zone Classification

| Zone | Risk Level | Action | Examples |
|------|------------|--------|----------|
| **Green** | Low | Monitor + Proceed | Reading files, internal queries |
| **Yellow** | Medium | Monitor + Alert + Proceed | Writing files, API calls |
| **Red** | High | **BLOCK** + Escalate to Can | Delete files, external email |

### 4.3 Decision Flow

```
Agent Proposes Action
         │
         ▼
┌─────────────────────┐
│  Immune System      │
│  Classifies Zone    │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
 GREEN/YELLOW   RED
    │             │
    ▼             ▼
┌─────────┐  ┌────────────────────┐
│ ALLOW   │  │ BLOCK IMMEDIATELY  │
│ + LOG   │  │                    │
└─────────┘  │ Format Escalation │
             │ to Can            │
             │                   │
             │ Wait for Decision │
             └─────────┬─────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Can Decides:    │
              │ A) Allow Once   │
              │ B) Update Policy│
              │ C) Keep Blocked │
              │ D) Handle (Alex)│
              └─────────────────┘
```

### 4.4 Escalation Template

When the Immune System blocks a RED zone action, it sends this to Can:

```
Hey Can, [AGENT_NAME] wants to [ACTION_DESCRIPTION]

but Immune System blocks because [POLICY_VIOLATION]

Context: [WHAT_WAS_HAPPENING]
Impact if allowed: [POTENTIAL_CONSEQUENCES]

Your options:
A) ALLOW ONCE - Permit this specific action
B) UPDATE POLICY - Allow this type of action going forward
C) KEEP BLOCKED - Deny this and similar actions
D) LET ALEX HANDLE - It's a routine task
```

### 4.5 Disk Space Management

**Trigger:** Disk usage > 85%  
**Action:** Automatic cleanup (no escalation needed)

**Cleanup Priority:**
1. npm cache
2. Build artifacts (.next/, dist/)
3. Old log files (> 7 days)
4. Temporary files

**Protected Paths (Never Delete):**
- Agent identity files
- Memory files
- Files modified within 24 hours

### 4.6 Daily Report

Alex generates a daily report at 23:00 TRT:

```
🛡️ DAILY IMMUNE SYSTEM REPORT
Date: 2026-02-22

🔒 SECURITY EVENTS: [count]
📋 POLICY ENFORCEMENT: [count] blocked
💾 DISK SPACE: [current]%, [cleanups performed]
💓 HEARTBEAT: [count] inspections
👤 AGENT ACTIVITY: [active agents]
📤 ESCALATIONS: [count]
🏥 SYSTEM HEALTH: OPERATIONAL ✅
```

---

## 5. Feedback Loop (Learning)

### 5.1 Overview

The **Feedback Loop** captures, categorizes, and applies Can's feedback to improve agent behavior over time.

### 5.2 Feedback Types

| Type | When | Example |
|------|------|---------|
| **Immediate** | During active session | "No, that's not what I meant" |
| **Retrospective** | After task complete | "Good, but next time include X" |
| **Implicit** | Inferred from behavior | Rejection = negative signal |

### 5.3 Preference Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Style** | How things are said | "Be more concise" |
| **Content** | What is included | "Include code examples" |
| **Approach** | Method used | "Ask before doing X" |
| **Priority** | What matters most | "Focus on Y first" |
| **Format** | Structure of output | "Use tables not lists" |

### 5.4 Preference Storage

**Location:** `shared/consciousness/can_preferences.json`

```json
{
  "preferences": [
    {
      "preference_id": "pref_001",
      "category": "style",
      "description": "Prefers concise responses",
      "source": "explicit_feedback",
      "confidence": 0.95,
      "applied_count": 15
    }
  ],
  "learned_behaviors": {
    "communication": {
      "verbosity": "concise",
      "format": "structured",
      "tone": "direct"
    }
  }
}
```

### 5.5 Processing Flow

```
1. CAPTURE   ← Watch for feedback signals
2. CATEGORIZE← Sort by type (style/content/approach)
3. STORE     ← Save with confidence score
4. APPLY     ← Query before output generation
5. VERIFY    ← Confirm preference application
```

---

## 6. Self-Healing System

### 6.1 Overview

The **Self-Healer** detects and repairs issues without human intervention. It runs continuously and fixes problems silently when possible.

### 6.2 Healing Routines

| Routine | Frequency | Scope |
|---------|-----------|-------|
| File Integrity Check | Every heartbeat | All critical files |
| Agent State Verification | Every 15 min | Active agents |
| Endpoint Health Check | Every 30 min | External connections |
| Memory Consistency | Every 4 hours | Shared consciousness |
| Budget/Billing Check | Every hour | Token tracking |

### 6.3 Recovery Procedures

**File Corruption:**
1. Detect checksum mismatch
2. Quarantine corrupted file
3. Restore from latest backup
4. Verify integrity
5. Log recovery event

**Zombie Agent:**
1. Detect unresponsive agent (>5 min)
2. Terminate stuck process
3. Respawn from last saved state
4. Verify wake successful
5. Report recovery

### 6.4 Weekly Deep Check

**Schedule:** Sundays 16:00 TRT

Comprehensive verification:
- Full filesystem integrity scan
- All agent state validation
- Backup verification
- Performance metrics review
- Policy compliance audit

---

## 7. Laziness Engine

### 7.1 Overview

The **Laziness Engine** detects and corrects lazy behavior automatically. It prevents work avoidance, premature completion, and capability denial.

### 7.2 Detection Signs

| Sign | Description | Threshold |
|------|-------------|-----------|
| **Premature Completion** | Done way before estimate | <50% of estimated time |
| **Work Avoidance** | Waiting to be prompted | 10+ min inactivity |
| **Capability Denial** | False "I can't" claims | No evidence of attempt |
| **Placeholder Delivery** | Docs instead of actual work | >80% documentation |
| **Timeframe Dishonesty** | 10 min claimed as 1 hour | 3x+ discrepancy |

### 7.3 Self-Correction Protocol

When laziness detected:

1. **STOP** - Halt current behavior
2. **ASSESS** - Review original task and time allocation
3. **RESTART** - Resume proper work without prompting
4. **COMMIT** - Work until timeframe expires or task complete
5. **REPORT** - Explain correction to Can

### 7.4 Mantras (Auto-Injected)

- "Stop making excuses and do the work"
- "Can didn't ask me to stop, so I keep working"
- "Documentation is not execution"
- "If I said 4 hours, I work 4 hours"

---

## 8. SkillRL: Self-Improving Memory

### 8.1 Overview

**SkillRL** (Skill Reinforcement Learning) enables agents to learn high-level, reusable behavioral patterns from past experiences. It transforms raw execution history into actionable skills.

### 8.2 Core Concepts

#### Skills
A skill is a structured piece of guidance:

```json
{
  "skill_id": "gen_001",
  "title": "Break Down Complex Tasks",
  "principle": "Divide complex tasks into smaller, manageable steps.",
  "when_to_apply": "When the task involves multiple steps"
}
```

#### Skill Categories

| Category | Description | Example |
|----------|-------------|---------|
| **General Skills** | Universal strategies | "Verify before acting" |
| **Task-Specific** | Domain heuristics | "For research: cross-check sources" |
| **Common Mistakes** | Lessons from failures | "Don't repeat failed actions" |

### 8.3 The Learning Loop

```
┌─────────────────────────────────────────────────────┐
│                  SKILLRL PIPELINE                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. EXECUTE TASK                                    │
│     Agent performs task                              │
│                                                      │
│  2. RECORD TRAJECTORY                               │
│     Store: task, actions, outcome                   │
│                                                      │
│  3. SKILL DISTILLATION                              │
│     Success → Extract principle                     │
│     Failure → Extract lesson                        │
│                                                      │
│  4. UPDATE SKILLBANK                                │
│     Add new skills / refine existing                │
│                                                      │
│  5. SKILL RETRIEVAL                                 │
│     Match task → Inject relevant skills             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 8.4 Benefits

- **Token Efficiency:** 10-20% reduction vs raw history storage
- **Self-Improving:** Learns from failures automatically
- **Better Reasoning:** Skills provide strategic guidance
- **Hierarchical:** General + task-specific organization

### 8.5 SkillBank Structure

```json
{
  "version": "1.0.0",
  "general_skills": [...],
  "task_specific_skills": {
    "research": [...],
    "code": [...],
    "creative": [...]
  },
  "common_mistakes": [...],
  "metadata": {
    "total_skills": 50,
    "last_updated": "2026-02-22T12:00:00Z"
  }
}
```

---

## 9. Memory & Persistence

### 9.1 Memory Hierarchy

```
┌─────────────────────────────────────────┐
│         WORKING MEMORY                  │
│    (Session - disappears on sleep)     │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         SHORT-TERM MEMORY               │
│    (Daily files - 7 day retention)     │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         LONG-TERM MEMORY                │
│    (Curated - permanent)                │
└─────────────────┬───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│              ARCHIVE                    │
└─────────────────────────────────────────┘
```

### 9.2 Identity Files

**Location:** `agents/{agent}/identity.yaml`

```yaml
agent_id: scout
name: Scout
role: Research & Intelligence
emoji: "🔍"

core_traits:
  - curious
  - thorough
  - budget_conscious

domain_expertise:
  - web_research
  - competitive_analysis
  - trend_monitoring
```

### 9.3 State Files

**Location:** `agents/{agent}/state.json`

```json
{
  "agent_id": "scout",
  "session_context": {},
  "short_term_memory": [],
  "last_active": "2026-02-22T12:00:00Z",
  "skills_used": []
}
```

---

## 10. Communication Protocols

### 10.1 Message Schema

```json
{
  "message_id": "uuid",
  "timestamp": "ISO8601",
  "from": "agent_id",
  "to": "agent_id|broadcast",
  "type": "direct|broadcast|topic",
  "priority": "routine|urgent|critical",
  "payload": {
    "type": "request|update|alert",
    "content": {},
    "privacy": "private|agent|shared|public"
  }
}
```

### 10.2 Privacy Levels

| Level | Scope | Example |
|-------|-------|---------|
| Private | Agent only | Internal reasoning |
| Agent | Specific agent | Direct conversation |
| Shared | All agents | General knowledge |
| Public | External output | Reports |

### 10.3 Attribution Rules

**Required:** Always attribute work to the agent who performed it.

✅ **Correct:** "Scout found that..."  
❌ **Incorrect:** "We found that..." (vague)  
❌ **Incorrect:** "I built that" (when Codex did)

---

## 11. Operational Workflows

### 11.1 Bi-Daily Meetings

**Schedule:** 09:00 TRT & 17:00 TRT

**Format:** Natural conversation (NOT status reports)

**Flow:**
1. Henry spawns all agents
2. Henry: "What's on your mind today?"
3. Natural discussion
4. Henry synthesizes action items
5. Transcript saved to GitHub

**❌ FORBIDDEN:** Individual status reports ("Scout: status? Pixel: status?")
**✅ CORRECT:** Team discusses naturally

### 11.2 Wake/Sleep Triggers

**Wake Triggers:**
- Can asks by name
- Meeting time
- Garmin decides task needs agent
- P0/P1 priority

**Sleep Triggers:**
- Task complete
- Meeting ended + no pending work
- Budget limit approaching

### 11.3 Priority System

| Level | Criteria | Response |
|-------|----------|----------|
| P0 Critical | Safety, legal, data loss | Wake all immediately |
| P1 High | Blocking work, <4h deadline | Wake relevant agent |
| P2 Normal | Standard tasks | Queue for next wake |
| P3 Low | Nice-to-have | Add to backlog |

---

## 12. Cron Schedule

### 12.1 TRT (GMT+3) Schedule

| Time | Job | Description |
|------|-----|-------------|
| 08:00 | scout-intel | Daily intelligence sweep |
| 09:00 | morning-standup | Agent meeting |
| 17:00 | evening-standup | Agent meeting |
| 23:00 | immune-report | Daily immune system report |
| Sunday 16:00 | weekly-deep-check | Comprehensive verification |
| Sunday 17:00 | weekly-report | Performance summary |

### 12.2 Real-Time Systems

| System | Frequency | Trigger |
|--------|-----------|---------|
| Immune System | 24/7 | Every action |
| Heartbeat | 30 min | Scheduled |
| Self-Healer | On-event | Issues detected |
| Laziness Engine | Every heartbeat | During tasks |

---

## 13. Cost Management

### 13.1 Budget Targets

| Metric | Target |
|--------|--------|
| Monthly Budget | $60/month |
| Daily Budget | ~$2/day |
| Alert Threshold | 80% of limit |

### 13.2 Model Selection

| Task Type | Model | Max Tokens |
|-----------|-------|------------|
| Simple lookup | Fast | 500 |
| Standard work | Kimi | 5,000 |
| Deep research | Extended | As needed |

### 13.3 Anti-Waste Rules

1. **Cache everything** - Don't re-derive
2. **Batch requests** - Combine when possible
3. **Ask first** - "Should I use Extended?" < wasted tokens
4. **Stop early** - If answer found, stop searching

---

## 14. File Structure

### 14.1 Complete Directory Layout

```
agent-agency/
├── agents/
│   ├── henry/
│   │   ├── identity.yaml
│   │   └── state.json
│   ├── scout/
│   │   ├── identity.yaml
│   │   └── state.json
│   ├── pixel/
│   ├── echo/
│   ├── quill/
│   ├── codex/
│   ├── alex/
│   │   ├── identity.yaml
│   │   └── state.json
│   └── vega/
│
├── immune-system/
│   ├── policies/
│   │   └── core-policies.yaml
│   ├── audits/
│   ├── logs/
│   │   ├── daily-reports/
│   │   └── healing.log
│   └── scripts/
│
├── shared/
│   └── consciousness/
│       ├── time-awareness.yaml
│       ├── can_preferences.json
│       └── memories/
│
├── skillbank/                    # NEW - SkillRL System
│   ├── src/
│   │   ├── skill.ts
│   │   ├── trajectory.ts
│   │   ├── storage.ts
│   │   ├── retrieval.ts
│   │   ├── skillInjector.ts
│   │   └── index.ts
│   ├── skills/
│   │   ├── general.json
│   │   └── task_specific/
│   ├── trajectories/
│   └── tests/
│
├── docs/
│   ├── skillrl-implementation-plan.md
│   ├── skillrl-user-guide-can.md
│   └── skillrl-agent-prompts.md
│
├── dashboard/                   # Mission Control
├── meetings/
│   └── bi-daily/
│
├── AGENCY_HANDBOOK.md          # System of Record
├── TECHNICAL_SPEC.md
├── feedback-loop.md
├── laziness-engine.md
├── self-healer.md
├── routine-verification.md
└── STANDARD_PRACTICES.md
```

---

## 15. Getting Started

### 15.1 For Developers

1. **Read AGENCY_HANDBOOK.md first** - This is the system of record
2. **Understand the Immune System** - Security is paramount
3. **Learn the Agent Structure** - Each agent has specific roles
4. **Study the Feedback Loop** - How preferences are learned

### 15.2 For Operators

1. **Can has ultimate authority** - You can override any decision
2. **Bi-daily meetings** - 09:00 & 17:00 TRT
3. **Feedback is learning** - Your corrections make agents better
4. **Security is absolute** - Red zone actions require your approval

### 15.3 Key Files to Reference

| File | Purpose |
|------|---------|
| `AGENCY_HANDBOOK.md` | Operating standards |
| `core-policies.yaml` | Security policies |
| `feedback-loop.md` | Preference learning |
| `laziness-engine.md` | Quality assurance |
| `self-healer.md` | Recovery procedures |
| `routine-verification.md` | Health checks |
| `TECHNICAL_SPEC.md` | Architecture details |

---

## Appendix A: Agent Quick Reference

| Emoji | Name | Wake For | Primary File |
|-------|------|----------|---------------|
| 🦆 | Henry | Meetings, coordination | henry/identity.yaml |
| 🔍 | Scout | Research tasks | scout/identity.yaml |
| 🎨 | Pixel | Design work | pixel/identity.yaml |
| 💾 | Echo | Memory operations | echo/identity.yaml |
| ✍️ | Quill | Documentation | quill/identity.yaml |
| 🏗️ | Codex | Architecture | codex/identity.yaml |
| 🛡️ | Alex | Everything (always on) | alex/identity.yaml |
| 📊 | Vega | Data analysis | vega/identity.yaml |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Agent** | Specialized AI entity with persistent identity |
| **Can** | Human supervisor with ultimate authority |
| **Garmin** | Main coordinator agent |
| **Green/Yellow/Red** | Security zone classification |
| **Immune System** | Security layer (Alex) |
| **SkillBank** | Learned skills storage (SkillRL) |
| **TRT** | Turkey Time (GMT+3) |
| **Wake** | Agent becomes active |
| **Sleep** | Agent serializes state and stops |
| **Escalation** | Blocked action sent to Can for decision |

---

## Document Control

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-12 | Initial specification | Quill |
| 2.0 | 2026-02-22 | Added SkillRL system | Scout |

---

**End of Technical Documentation**
