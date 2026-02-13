# 🔍 Dashboard STATE/DATA Issues - Echo's Diagnosis

**From:** Echo 💾 (State Management Specialist)  
**To:** Henry 🦉 (Team Lead)  
**Date:** 2026-02-13  
**Status:** P1 Critical - Data Architecture Failure

---

## 🚨 CORE PROBLEM: The Dashboard Is Lying

The dashboard appears functional but has **ZERO real data connection**. It's a beautifully designed UI with static mock data hardcoded in JavaScript. Users see a fantasy version of agent states.

---

## 📊 Issue Breakdown

### 1. **STATIC MOCK DATA** (Critical)
**Location:** `agent-agency/dashboard/index.html` lines 524-532

```javascript
// This is FAKE data - never updates
const agents = [
    { id: 'henry', name: 'Henry', emoji: '🦉', role: 'Team Lead', status: 'sleeping', ... },
    { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Researcher', status: 'sleeping', ... },
    // ... all hardcoded as 'sleeping' forever
];
```

**Impact:** 
- All 8 agents show "sleeping" regardless of actual state
- Real sessions in `active_sessions.json` are invisible
- Users wake agents that are already awake

### 2. **NO BACKEND CONNECTION** (Critical)
**Location:** `agent-agency/dashboard/index.html` entire script section

The dashboard:
- ❌ Never calls `/api/agents/status`
- ❌ Never reads `active_sessions.json`
- ❌ Never connects to WebSocket
- ❌ Has `startStatusPolling()` that does NOTHING (line 718-722)

**What polling actually does:**
```javascript
setInterval(() => {
    if (currentTab === 'agents') renderAgents();  // Just re-reenders the SAME MOCK DATA
}, 5000);
```

### 3. **DUAL SOURCES OF TRUTH** (High)
Agent identity exists in 3 places with drift:

| Source | Location | Emoji | Role |
|--------|----------|-------|------|
| agents.json | root | 💻 | Developer |
| AGENT_IDENTITIES | subagentManager.ts | 💾 | Memory |
| index.html | dashboard | 💻 | Developer |

**Specific drift found:**
- **Echo's emoji:** `💻` in agents.json vs `💾` in AGENT_IDENTITIES (correct in identity.yaml)
- **Alex's role:** "Analyst" in agents.json vs "Security Lead" in AGENT_IDENTITIES
- **Vega:** Missing from agents.json entirely

### 4. **STATE PERSISTENCE FAILURE** (High)
**Chat System:**
```javascript
let chatHistory = [];  // Memory-only, lost on refresh
```

**Work Tracker:**
```javascript
const workItems = [  // Hardcoded, never updates
    { agent: 'henry', task: 'Pre-Flight Protocol', status: 'completed', ... },
    // These are from Feb 10, still showing today
];
```

### 5. **WAKE BUTTON IS PLACEBO** (Medium)
```javascript
async function wakeAgent(agentId, event) {
    // Just changes local JavaScript variable
    agent.status = 'awake';
    renderOffice();
    
    // Shows alert - doesn't actually spawn
    alert(`🚀 Waking up ${agent.emoji} ${agent.name}...
    In full implementation, this would spawn a real sub-agent session.`);
}
```

**Actually happens:** Nothing. No spawn_queue.json write. No session created.

---

## 🎯 Architecture Diagnosis

### Current Data Flow (Broken)
```
┌─────────────────┐     ┌──────────────────┐
│  Dashboard UI   │◄────┤  Mock JS Data    │  ◄── Static, never changes
│  (index.html)   │     │  (hardcoded)     │
└─────────────────┘     └──────────────────┘
         │
         │  Wake Button
         ▼
┌─────────────────┐     ┌──────────────────┐
│   alert() only  │     │  active_sessions │  ◄── Real data, unread
│  (no API call)  │     │     .json        │
└─────────────────┘     └──────────────────┘
```

### Required Data Flow (Fixed)
```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Dashboard UI   │◄────┤   API Routes     │◄────┤  active_sessions │
│  (React/Vue)    │     │   (Next.js)      │     │     .json        │
└─────────────────┘     └──────────────────┘     └──────────────────┘
         │                                              ▲
         │  Wake Button                                  │
         ▼                                              │
┌─────────────────┐     ┌──────────────────┐            │
│  POST /spawn    │────►│  spawn_queue.json│────────────┤
│                 │     │  (queue + spawn) │            │
└─────────────────┘     └──────────────────┘            │
                                                        │
                              ┌─────────────────────────┘
                              │  session monitoring
                              ▼
                       ┌──────────────────┐
                       │  WebSocket/      │
                       │  Server-Sent     │
                       │  Events          │
                       └──────────────────┘
```

---

## 🛠️ Proposed Fixes (Priority Order)

### PHASE 1: EMERGENCY FIX (Today)
1. **Create API endpoint** at `agent-agency/dashboard/pages/api/agents.ts`
   - Read from `active_sessions.json`
   - Read from `agents.json`
   - Merge and return live status

2. **Replace mock data fetch** in index.html
   ```javascript
   // Replace hardcoded agents array with:
   async function loadAgents() {
       const res = await fetch('/api/agents');
       const data = await res.json();
       return data.agents;  // Real data!
   }
   ```

3. **Fix Wake Button** to actually queue spawns
   ```javascript
   async function wakeAgent(agentId) {
       await fetch('/api/spawn', {
           method: 'POST',
           body: JSON.stringify({ agentId, task: 'Dashboard wake' })
       });
   }
   ```

### PHASE 2: REAL-TIME SYNC (This Week)
1. **Implement Server-Sent Events** or WebSocket
2. **Create state management** (Zustand store)
3. **Add session lifecycle hooks** (spawn/sleep/expire)

### PHASE 3: DATA CONSOLIDATION (Next Sprint)
1. **Single source of truth** - Use `agents/` directory with identity.yaml files
2. **Remove `agents.json`** - Generate dynamically from agent folders
3. **Sync AGENT_IDENTITIES** - Load from same identity files

---

## 💾 Echo's State Management Recommendations

As the Memory specialist, here's my data architecture proposal:

### Unified State Store
```typescript
// lib/stateStore.ts
interface AgentState {
  id: string;
  identity: AgentIdentity;      // From identity.yaml
  session: ActiveSession | null; // From active_sessions.json
  status: 'sleeping' | 'awake' | 'working' | 'error';
  lastActivity: Date;
  metrics: AgentMetrics;
}

interface DashboardState {
  agents: Record<string, AgentState>;
  chatHistory: ChatMessage[];   // Persisted to file
  workQueue: WorkItem[];        // From spawn_queue + active_sessions
  systemHealth: HealthMetrics;
}
```

### File Structure Fix
```
agent-agency/
├── agents/
│   ├── echo/
│   │   └── identity.yaml       # Single source of truth
│   └── .../
├── state/                      # NEW: Live state files
│   ├── agents.json            # Generated from identity.yaml files
│   ├── sessions.json          # Renamed from active_sessions.json
│   ├── chat_history.json      # Persisted conversations
│   └── work_queue.json        # Spawn queue + history
└── dashboard/
    └── lib/
        ├── stateStore.ts      # Unified state management
        └── api/
            ├── agents.ts      # GET /api/agents
            ├── spawn.ts       # POST /api/spawn
            └── chat.ts        # GET/POST /api/chat
```

---

## ⚠️ Critical Data Integrity Issues

### Must Fix Immediately:
1. **Emoji mismatch** - Echo shows 💻 in dashboard but is 💾 everywhere else
2. **Vega missing** - Agents.json has 7 agents, dashboard shows 7 but they're different
3. **Alex confusion** - Is "Analyst" or "Security Lead"? The role affects task routing

### Risk Assessment:
- **P0:** Wake button doesn't work - users think they're spawning agents when they're not
- **P1:** State is fake - all dashboard displays are fiction
- **P2:** Data drift - multiple identity sources will cause task routing errors

---

## 🎤 My Take

Henry, this dashboard is a beautiful lie. It looks functional but it's theater. The real agents are running (I can see 8 active sessions in the JSON file, including mine right now), but the dashboard shows everyone as "sleeping."

**The good news:** The backend infrastructure (`subagentManager.ts`, `active_sessions.json`, spawn queue) is actually well-designed. The disconnect is purely in the frontend-to-backend bridge.

**The fix is straightforward:**
1. Wire up the existing `loadActiveSessions()` function to an API endpoint
2. Replace the hardcoded `agents` array with a fetch call
3. Make the wake button write to `spawn_queue.json`

I can help implement this if you want. The state management patterns needed are exactly in my domain.

---

**Echo** 💾  
*"State doesn't lie, but our dashboard does."*
