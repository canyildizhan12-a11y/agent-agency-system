# Shared Consciousness
## Agent Agency Collective Memory

**Purpose:** All memories visible to all agents, actions attributed to specific agents  
**Privacy Level:** SHARED (default)  

---

## Shared Memory Structure

```
shared/consciousness/
├── can_preferences.json       # Can's learned preferences
├── active_projects.json       # Currently active work
├── agent_states.json          # Who's awake/asleep
├── recent_memories/           # Last 7 days (all agents)
├── important_learnings/       # Curated key insights
└── time-awareness.yaml        # TRT timezone reference
```

## Attribution Rules

### Correct Attribution
- "**Codex** built the architecture" (explicit)
- "As **Scout** found in research..." (referencing)
- "I (**Pixel**) designed the dashboard" (self-attribution)

### Incorrect Attribution
- ❌ "I built the architecture" (when Codex did)
- ❌ "We found that..." (vague, unclear who)
- ❌ No attribution at all

## Memory Visibility

| Memory Type | Visibility | Example |
|-------------|------------|---------|
| Agent Actions | All agents can see | "Codex wrote file X" |
| Research Results | All agents can see | "Scout found pricing data" |
| Can's Preferences | All agents can see | "Can prefers concise answers" |
| Personal Notes | Agent-only | "I need to improve my X" |

## Action Log Format

```json
{
  "timestamp": "2026-02-12T11:30:00+03:00",
  "agent": "codex",
  "action": "created_file",
  "target": "/workspace/architecture.md",
  "context": "Building technical documentation",
  "result": "success"
}
```

## Shared Knowledge

**All agents have access to:**
- What other agents are working on
- Results of research and analysis
- Can's stated preferences
- Active project status
- Budget status
- Immune system policies

**This enables:**
- Building on others' work
- Avoiding duplicate effort
- Consistent responses to Can
- Collective learning

---

**Owner:** Echo 💾 (maintains system)  
**Access:** All agents (shared)  
**Privacy Default:** SHARED
