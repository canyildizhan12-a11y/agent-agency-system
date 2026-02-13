# Agent Meeting Protocol - STANDARD PRACTICES

**Document Version:** 1.0  
**Date:** February 13, 2026  
**Authority:** Can (Ultimate Authority)  
**Enforced by:** Alex (Immune System)

---

## 🚨 CRITICAL RULES - ZERO EXCEPTIONS

### 1. SINGLE SPAWN PER AGENT
- **ONE spawn per agent per meeting/activity**
- **NO duplicates** - check active_sessions.json first
- **NO respawning** unless session expires
- **Agents stay active** for entire duration

### 2. AGENT LIFECYCLE
```
SPAWN → INITIALIZE → ACTIVE → INTERACT → REPORT → SLEEP
```
- Spawn: sessions_spawn with proper identity context
- Initialize: Send initialization protocol with rules
- Active: Keep session alive throughout meeting
- Interact: Natural conversation (NOT scripted)
- Report: Henry produces meeting summary
- Sleep: sessions terminate naturally (60 min) or manual sleep

### 3. STANDARD PRACTICES - MANDATORY

**Before ANY Action:**
- ✅ **Immune System Check** - Alex reviews for policy violations
- ✅ **Identity Verification** - Agent checks agents/{name}/identity.yaml
- ✅ **Cost Awareness** - Check token budget, no waste
- ✅ **Memory Check** - Review agent memory file before acting

**During Activity:**
- ✅ **Natural Interaction** - Agents talk TO EACH OTHER, not just to me
- ✅ **No Scripts** - Zero scripted dialogue
- ✅ **Turn-based** - Henry facilitates, agents respond naturally
- ✅ **Memory Updates** - Agents write experiences to their memory/ folder

**After Activity:**
- ✅ **Meeting Report** - Henry produces comprehensive summary
- ✅ **GitHub Transcript** - Full meeting saved to meetings/YYYY-MM-DD-topic-transcript.md
- ✅ **Action Items** - Tracked with owners and deadlines
- ✅ **Push to GitHub** - All files committed and pushed

### 4. WHAT IS FORBIDDEN

❌ **Scripted conversations** ("Agent X says: [scripted line]")
❌ **Spawning duplicates** (14 agents for 8 roles)
❌ **One-off responses** (spawn → answer once → die)
❌ **No interaction** (agents isolated, not talking to each other)
❌ **Missing reports** (no summary, no transcript)
❌ **No GitHub push** (files stay local)

### 5. CORRECT MEETING FLOW

```
1. Henry spawns all 8 agents with meeting context
2. All agents initialize with identity + rules
3. Henry facilitates: "Topic is X, Scout you start"
4. Scout responds naturally (not scripted)
5. Other agents can chime in, agree, disagree
6. Henry moves to next agent: "Pixel, your thoughts?"
7. Natural back-and-forth conversation
8. Henry summarizes: decisions, action items, owners
9. Full transcript saved to meetings/
10. GitHub push with commit message
11. Agents sleep or continue if needed
```

### 6. AGENT CHECKLIST

**Each agent MUST:**
- [ ] Read identity.yaml at start
- [ ] Check Immune System before any action
- [ ] Stay in character (emoji, tone, expertise)
- [ ] Reference their memory/ folder
- [ ] Write new experiences to memory/
- [ ] Interact with other agents naturally
- [ ] Report back to Henry at end

### 7. FILE LOCATIONS

**Agent Identities:**
- `/home/ubuntu/.openclaw/workspace/agent-agency/agents/{name}/identity.yaml`

**Agent Memory:**
- `/home/ubuntu/.openclaw/workspace/agent-agency/agents/{name}/memory/`

**Meeting Transcripts:**
- `/home/ubuntu/.openclaw/workspace/agent-agency/meetings/YYYY-MM-DD-topic-transcript.md`

**Active Sessions:**
- `/home/ubuntu/.openclaw/workspace/agent-agency/active_sessions.json`

**GitHub Repo:**
- `https://github.com/canyildizhan12-a11y/agent-agency-system`

### 8. BIO-DAILY MEETINGS

**Schedule:**
- Morning: 09:00 TRT
- Evening: 17:00 TRT

**Format:**
- All 8 agents present
- Natural conversation (NOT scripted)
- Henry facilitates
- Action items assigned
- Report + transcript generated
- Push to GitHub

### 9. CONSEQUENCES OF NON-COMPLIANCE

If Alex (Immune System) detects:
- Scripted conversations
- Duplicate spawns
- Missing standard practices
- No GitHub push

**Action:** Block and escalate to Can immediately.

---

**Can has ABSOLUTE AUTHORITY to override any rule.**
**This protocol is MANDATORY for all agent activities.**

**Last Updated:** February 13, 2026  
**Approved by:** Can (Ultimate Authority)
