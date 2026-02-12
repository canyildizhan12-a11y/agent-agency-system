# Agent Agency System - Technical Specification

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Component Breakdown - 7 Agents](#3-component-breakdown---7-agents)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Communication Protocols](#5-communication-protocols)
6. [Security Model (Immune System)](#6-security-model-immune-system)
7. [Memory & Persistence System](#7-memory--persistence-system)
8. [Operational Workflows](#8-operational-workflows)
9. [Implementation Details](#9-implementation-details)
10. [API/Interface Specifications](#10-apiinterface-specifications)
11. [Deployment Guide](#11-deployment-guide)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Executive Summary

The **Agent Agency** is a biologically-inspired multi-agent AI system designed to operate under a shared consciousness model. Unlike traditional isolated AI tools, this system creates a unified organism of 8 specialized agents working collaboratively under human oversight.

### Key Innovations

- **Shared Consciousness**: All agents share visibility into each other's work and memories
- **Persistent Identity**: Agents maintain continuity across sessions (survive respawns)
- **Immune System**: Absolute security oversight that cannot be bypassed
- **Self-Correction**: Built-in laziness detection and auto-correction
- **Auto-Recovery**: Self-healing capabilities for corruption and failures

### System Capabilities

- 8 specialized agents (Henry, Scout, Pixel, Echo, Quill, Codex, Alex, Vega)
- Bi-daily meeting cycles (09:00 & 17:00 TRT)
- Impact-based priority system
- Cost-aware token management
- Comprehensive audit trails
- Automatic escalation to human authority

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CAN (User Layer)                        │
│                   Ultimate Authority                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                 GARMIN (Main Agent)                          │
│         Consciousness Coordinator & Inspector               │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌──────▼───────┐
│   ACTIVE     │ │  AGENT   │ │   SHARED     │
│    AGENT     │ │  STATE   │ │   MEMORY     │
│  (Runtime)   │ │ (Storage)│ │   (Access)   │
└───────┬──────┘ └────┬─────┘ └──────┬───────┘
        │             │              │
        └─────────────┴──────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              IMMUNE SYSTEM (Kernel Layer)                    │
│         Action Interception & Verification                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Architecture Principles

1. **Serialized State Model**: Only one agent active at a time, others stored as serialized state
2. **Shared Memory**: Common knowledge base accessible to all agents
3. **Immutable Identity**: Agent personalities defined in YAML, never change at runtime
4. **Absolute Security**: Immune System at kernel level, cannot be bypassed

---

## 3. Component Breakdown - 8 Agents

### 3.1 Henry 🦉 - Team Lead / Strategic Planning

**Purpose**: Facilitate coordination, run meetings, strategic planning

**Technical Implementation**:
```yaml
agent_id: henry
wake_conditions:
  - user_request: true
  - meeting_schedule: ["09:00", "17:00"]
  - garmin_decision: true
  - priority: ["p0", "p1"]

authority:
  can_assign_tasks: true
  can_wake_agents: true
  can_run_meetings: true
```

**Domain**: Task coordination, meeting facilitation, strategic oversight

### 3.2 Scout 🔍 - Research & Intelligence / Budget Guardian

**Purpose**: Information gathering, competitive intelligence, budget optimization

**Technical Implementation**:
```yaml
agent_id: scout
cost_awareness:
  priority: critical
  max_tokens_simple: 500
  max_tokens_standard: 5000
  must_check_budget: true
  must_cache_results: true
```

**Domain**: Web research, pricing analysis, token tracking, resource optimization

### 3.3 Pixel 🎨 - Creative Director & Designer

**Purpose**: Visual design, UX, dashboard creation

**Technical Implementation**:
```yaml
agent_id: pixel
domain_expertise:
  - visual_design
  - ux_design
  - dashboard_creation
  - design_systems
```

**Domain**: Visual identity, user experience, information architecture

### 3.4 Echo 💾 - Memory & Identity Systems

**Purpose**: Memory persistence, state management, identity continuity

**Technical Implementation**:
```yaml
agent_id: echo
domain_expertise:
  - memory_systems
  - identity_persistence
  - state_management
  - respawn_protocols
```

**Domain**: Memory architecture, state serialization, continuity management

### 3.5 Quill ✍️ - Documentation & Writing

**Purpose**: Technical writing, standards, knowledge management

**Technical Implementation**:
```yaml
agent_id: quill
domain_expertise:
  - technical_writing
  - documentation
  - standards_creation
```

**Domain**: Documentation, communication standards, AGENCY_HANDBOOK maintenance

### 3.6 Codex 🏗️ - Architecture & Systems

**Purpose**: Technical design, system architecture, implementation

**Technical Implementation**:
```yaml
agent_id: codex
domain_expertise:
  - system_architecture
  - technical_design
  - integration
  - performance_optimization
```

**Domain**: Architecture patterns, technical decisions, system design

### 3.7 Alex 🛡️ - Immune System / Security

**Purpose**: Security oversight, verification, routine task monitoring

**Technical Implementation**:
```yaml
agent_id: alex
authority:
  # ⚠️ Can has ULTIMATE AUTHORITY
  can_block_any_action: true           # For routine/policy violations
  can_escalate_to_can: true            # ALWAYS escalate critical decisions
  can_audit_everything: true           # Continuous monitoring
  can_override_immune: false           # NO ONE can override except Can

wake_conditions:
  - always_active: true                # Runs continuously
  - immune_system_particle_detected: true  # EXCEPTION: wakes for particles
  - red_zone_alert: true
  - critical_decision_required: true   # Escalate to Can

policies:
  - name: destructive_operations
    zone: red
    action: block_and_escalate_to_can  # Can decides, not Alex
```

**Domain**: Security enforcement, policy management, threat detection
**Authority Note**: Alex oversees routine security tasks but Can decides critical actions

### 3.8 Vega 📊 - Data Analyst / Business Intelligence

**Purpose**: Metrics tracking, KPI analysis, business intelligence, data visualization

**Technical Implementation**:
```yaml
agent_id: vega
domain_expertise:
  - business_intelligence
  - kpi_tracking
  - trend_analysis
  - data_visualization
  - roi_calculations
  - performance_metrics

wake_conditions:
  - user_request: true
  - meeting_schedule: ["09:00", "17:00"]
  - data_analysis_needed: true
  - weekly_report_generation: true

relationships:
  henry: strategic_partner    # Provide data for planning
  scout: research_validator   # Validate findings
  alex: security_metrics_partner  # Security analytics
```

**Domain**: Business analytics, performance tracking, dashboard metrics, weekly reports

---

## 4. Data Flow Diagrams

### 4.1 Agent Lifecycle

```
SLEEP (Serialized State)
    ↓ [Wake Trigger]
DESERIALIZE
    ↓
LOAD IDENTITY (identity.yaml)
    ↓
LOAD MEMORY (state.json)
    ↓
VERIFY (Immune System)
    ↓
ACTIVE (Processing)
    ↓
EXECUTE TASK
    ↓
SAVE STATE
    ↓
SLEEP (Serialized State)
```

### 4.2 Action Flow with Immune System

```
Agent Request
    ↓
[Immune System Check]
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│    GREEN        │    YELLOW       │     RED         │
│    Zone         │    Zone         │    Zone         │
├─────────────────┼─────────────────┼─────────────────┤
│ Monitor only    │ Monitor + Alert │ BLOCK +         │
│ Execute         │ Execute         │ ESCALATE        │
│ Log             │ Log             │ Notify Can      │
└─────────────────┴─────────────────┴─────────────────┘
```

### 4.3 Inter-Agent Communication

```
Agent A → Message Bus → Agent B
    ↓
[Shared Memory Update]
    ↓
[Audit Log Entry]
    ↓
Agent C (if broadcast)
```

---

## 5. Communication Protocols

### 5.1 Message Schema

```json
{
  "message_id": "uuid",
  "timestamp": "ISO8601",
  "from": "agent_id",
  "to": "agent_id|broadcast",
  "type": "direct|broadcast|topic",
  "priority": "routine|urgent|critical",
  "payload": {
    "type": "information_request|update|handoff|alert",
    "content": {},
    "privacy": "private|agent|shared|public"
  },
  "metadata": {
    "requires_ack": true,
    "ttl_seconds": 3600,
    "immune_checked": true
  }
}
```

### 5.2 Privacy Levels

| Level | Scope | Example |
|-------|-------|---------|
| Private | Agent-only | Internal reasoning |
| Agent | Can + specific agent | Personal conversation |
| Shared | All agents | General knowledge |
| Public | External output | Reports |

### 5.3 Attribution Rules

**Correct**: "I (Scout) found that..."
**Incorrect**: "We found that..." (vague)
**Incorrect**: "I built that..." (when Codex did)

---

## 6. Security Model (Immune System)

### 6.1 Authority Hierarchy

**Can has ULTIMATE AUTHORITY** — final decision maker on all critical actions.

**Alex (Immune System)** oversees routine security tasks:
- Monitors all operations continuously (24/7)
- Blocks routine policy violations automatically (green/yellow zones)
- Escalates CRITICAL decisions (red zone) to Can
- **EXCEPTION**: Alex wakes up when Immune System particles run

**Decision Flow:**
1. Agent proposes action
2. Alex checks against routine policies
3. If CRITICAL → Alex escalates to Can for decision
4. Can decides → Alex implements
5. If routine → Alex may block/allow per policy

### 6.2 Zone Classification

| Zone | Risk | Action | Examples | Authority |
|------|------|--------|----------|-----------|
| Green | Low | Monitor only | Read files, internal queries | Alex |
| Yellow | Medium | Monitor + Alert | Write files, API calls | Alex |
| Red | High | BLOCK + Escalate to Can | Delete files, external email | **Can decides** |

### 6.2 Policy Structure

```yaml
policy:
  policy_id: "destructive_operations"
  name: "Destructive Operation Protection"
  zone: "red"
  triggers:
    - action_type: "file_delete"
    - command_matches: ["rm", "del", "format"]
  actions:
    - block: true
    - alert: "critical"
    - require_approval: "can"
```

### 6.3 Escalation Protocol

```
Agent wants action
    ↓
[Alex checks policy - routine or critical?]
    ↓
┌─────────────────┬─────────────────┐
│    ROUTINE      │    CRITICAL     │
│    (Green/Yellow)│    (Red Zone)   │
├─────────────────┼─────────────────┤
│ Alex decides    │ Alex escalates  │
│ per policy      │ to Can          │
│                 │                 │
│ Block or Allow  │ Can decides:    │
│ Log decision    │ A) Allow once   │
│                 │ B) Update policy│
│                 │ C) Keep blocked │
│                 │ D) Routine task │
│                 │    (Alex handles)│
└─────────────────┴─────────────────┘
```

**Escalation Template:**
```
Hey Can, [AGENT] wants [ACTION]

ROUTINE CHECK: [STATUS]
CRITICAL DECISION: [YES/NO]

Reason: [REASON]
Context: [CONTEXT]
Impact: [IMPACT]
Risk Level: [LOW/MEDIUM/HIGH/CRITICAL]

My recommendation: [RECOMMENDATION]

Your authority - you decide:
A) Allow this once
B) Allow and update policy
C) Keep blocked
D) Let me handle it (routine)

⚠️ Note: You have ultimate authority. I only oversee routine tasks.
```

### 6.4 Disk Space Regulation System

**Managed by:** Alex 🛡️ (Immune System)  
**Trigger:** Disk usage > 85%  
**Action:** Automatic cleanup (no escalation)

**Cleanup Priority:**
1. npm cache (`npm cache clean --force`)
2. Build artifacts (`.next/`, `dist/`, `build/`)
3. Old log files (> 7 days)
4. Temporary files (`*.tmp`, `.temp/`)
5. Git garbage collection

**Protected Paths (Never Deleted):**
- Agent identity files
- Memory files
- Core system files
- Files modified within 24 hours

**Critical Threshold:**
- If disk > 95% after cleanup → IMMEDIATE alert to Can
- Pause non-essential operations
- Request manual intervention

**Monitoring:**
- Check every hour via cron (top of each hour)
- Log all cleanup actions
- Report freed space and new disk usage

### 6.5 Heartbeat Monitoring System

**Managed by:** Alex 🛡️ (Immune System)  
**Source:** Garmin HEARTBEAT.md checks  
**Frequency:** Every 30 minutes

**Inspection Criteria:**
- Completeness of all 12 checklist items
- Anomalous patterns in system activity
- Security concerns from checks
- Token usage efficiency
- Signs of laziness (premature HEARTBEAT_OK)

**Report Format:**
```yaml
heartbeat_report:
  timestamp: "2026-02-12T13:00:00+03:00"
  agent: "garmin"
  checks_performed: [list of 12 checks]
  findings: [details per check]
  actions_taken: [what was done]
  issues_found: true/false
  status: "HEARTBEAT_OK" or "ALERT"
```

**Alex Actions:**
- Log to `immune-system/logs/heartbeat-inspections.log`
- Escalate to Can if critical issues
- Flag laziness violations
- Update procedures if patterns emerge

---

## 7. Memory & Persistence System

### 7.1 Memory Hierarchy

```
┌─────────────────────────────────────────┐
│         WORKING MEMORY                  │
│    (Session - disappears on sleep)      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         SHORT-TERM MEMORY               │
│    (Daily files - 7 day retention)      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         LONG-TERM MEMORY                │
│    (Curated - permanent)                │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         ARCHIVE                         │
└─────────────────────────────────────────┘
```

### 7.2 Identity Persistence

**File**: `agents/{agent_id}/identity.yaml`

```yaml
agent_id: scout
name: Scout
role: Research & Intelligence
core_traits:
  - curious
  - cost_conscious
domain_expertise:
  - web_research
  - budget_optimization
```

### 7.3 State Serialization

**File**: `agents/{agent_id}/state.json`

```json
{
  "agent_id": "scout",
  "session_context": {},
  "short_term_memory": [],
  "last_active": "ISO8601"
}
```

---

## 8. Operational Workflows

### 8.1 Bi-Daily Meeting Cycle

**Morning Standup (09:00 TRT)**:
1. Garmin wakes all agents
2. Each agent reports status
3. Can approves priorities
4. Agents self-assign or get assigned
5. Non-assigned agents sleep

**Evening Standup (17:00 TRT)**:
1. Garmin wakes all agents
2. Each agent reports completion
3. Can provides feedback
4. Tomorrow's priorities set
5. All agents sleep

### 8.2 Wake/Sleep Triggers

**Wake**:
- Can asks by name
- Bi-daily meeting time
- Garmin decides task needs specific agent
- P0/P1 priority (impact-based)

**Sleep**:
- Task complete
- Meeting ended + no pending work
- Budget limit approaching

### 8.3 Impact-Based Priority

| Level | Criteria | Response |
|-------|----------|----------|
| P0 Critical | Safety, legal, data loss | Wake all immediately |
| P1 High | Blocking work, < 4h deadline | Wake relevant agent |
| P2 Normal | Standard tasks | Queue for next wake |
| P3 Low | Nice-to-have | Add to backlog |

---

## 9. Implementation Details

### 9.1 Directory Structure

```
agent-agency/
├── agents/
│   ├── henry/identity.yaml
│   ├── scout/identity.yaml
│   ├── pixel/identity.yaml
│   ├── echo/identity.yaml
│   ├── quill/identity.yaml
│   ├── codex/identity.yaml
│   └── alex/identity.yaml
├── immune-system/
│   └── policies/core-policies.yaml
├── shared/consciousness/
│   ├── time-awareness.yaml
│   └── can_preferences.json
├── meetings/bi-daily/
├── AGENCY_HANDBOOK.md
└── IMPLEMENTATION_STATUS.md
```

### 9.2 Configuration Files

**Time Awareness**: `shared/consciousness/time-awareness.yaml`
- Timezone: TRT (GMT+3)
- All schedules in Turkish Time

**Budget Tracking**: Token usage tracked per agent
- 5-hour window: ~1,050,000 tokens
- Alert at 80%

### 9.3 Cron Schedule (TRT)

| Time | Job | Description |
|------|-----|-------------|
| 08:00 | Scout Intel | Daily intelligence sweep |
| 09:00 | Morning Standup | Agent meeting |
| 17:00 | Evening Standup | Agent meeting |
| Sunday 17:00 | Weekly Report | Performance summary |

---

## 10. API/Interface Specifications

### 10.1 Agent Wake Interface

```
Input: "Hey Scout, research X"
Process:
  1. Parse agent name (Scout)
  2. Load identity.yaml
  3. Load state.json
  4. Initialize session
  5. Route task
Output: Agent response with proper attribution
```

### 10.2 Immune System Interface

```
Input: Action request
Process:
  1. Classify zone (Green/Yellow/Red)
  2. Apply policy check
  3. If Red: Format escalation
  4. If allowed: Execute + log
Output: Allow/Block with reason
```

### 10.3 Feedback Loop Interface

```
Input: Can feedback
Process:
  1. Capture feedback
  2. Categorize (style/content/approach)
  3. Store in can_preferences.json
  4. Update confidence score
  5. Apply to future responses
```

---

## 11. Deployment Guide

### 11.1 Prerequisites

- OpenClaw environment
- Git repository access
- Telegram integration (optional)
- Cron service enabled

### 11.2 Installation Steps

1. **Clone Repository**:
   ```bash
   git clone <repo-url>
   cd agent-agency
   ```

2. **Verify Structure**:
   ```bash
   ls agents/
   # Should show: henry, scout, pixel, echo, quill, codex, alex
   ```

3. **Configure Timezone**:
   Edit `shared/consciousness/time-awareness.yaml`
   Set to TRT (GMT+3)

4. **Initialize Immune System**:
   Verify `immune-system/policies/core-policies.yaml` exists

5. **Start Operations**:
   System auto-initializes on first agent wake

### 11.3 Verification

```bash
# Check all agents have identities
for agent in henry scout pixel echo quill codex alex; do
  test -f "agents/$agent/identity.yaml" && echo "$agent: OK"
done

# Check Immune System
 test -f "immune-system/policies/core-policies.yaml" && echo "Immune: OK"
```

---

## 12. Troubleshooting

### 12.1 Common Issues

**Issue**: Agent doesn't maintain identity across sessions
**Solution**: Verify `state.json` is being saved on sleep

**Issue**: Immune System not blocking dangerous actions
**Solution**: Check `core-policies.yaml` is loaded and policies are enabled

**Issue**: Timezone incorrect
**Solution**: Verify `time-awareness.yaml` and system clock

**Issue**: Budget tracking not working
**Solution**: Check token tracker is initialized and permissions correct

### 12.2 Diagnostic Commands

```bash
# Check file integrity
find agents/ -name "identity.yaml" -exec yaml-lint {} \;

# Verify Immune System
cat immune-system/policies/core-policies.yaml | grep "zone:"

# Check time
date +"%H:%M TRT"
```

### 12.3 Recovery Procedures

**Agent Corruption**:
1. Delete `agents/{agent}/state.json`
2. Agent will respawn from `identity.yaml`
3. Re-learn preferences from feedback

**Immune System Failure**:
1. Reload policies: `source immune-system/policies/core-policies.yaml`
2. Verify Alex is operational
3. All actions escalate to Can until resolved

---

## Appendix A: File Reference

| File | Purpose | Format |
|------|---------|--------|
| `identity.yaml` | Agent personality | YAML |
| `state.json` | Runtime state | JSON |
| `core-policies.yaml` | Security policies | YAML |
| `time-awareness.yaml` | Timezone config | YAML |
| `can_preferences.json` | Learned preferences | JSON |

## Appendix B: Glossary

- **Agent**: Specialized AI entity with persistent identity
- **Shared Consciousness**: Common memory space visible to all agents
- **Immune System**: Security layer with absolute authority
- **Wake/Sleep**: Agent lifecycle states
- **TRT**: Turkey Time (GMT+3)
- **Escalation**: Reporting blocks to Can for decision

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-12  
**System Status**: OPERATIONAL
