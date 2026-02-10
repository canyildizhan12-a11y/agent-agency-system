# OpenClaw Integration Options
## Real Action, No Fake Buttons

---

## The Goal

Every button click in the dashboard ACTUALLY does something:
- **Wake Agent** → Actually spawns Kimi K2.5 sub-agent
- **Send Message** → Actually sends to agent session
- **Schedule Task** → Actually creates cron job
- **Assign Work** → Actually gives task to agent

---

## Option A: Direct Tool Import (Best if available)

Import OpenClaw's tools directly into the dashboard.

**Files needed:**
- `dashboard/lib/openclaw.ts` - Tool wrapper ✅ Created
- `dashboard/pages/api/*.ts` - API routes using tools ✅ Created

**How it works:**
```typescript
import { sessions_spawn } from 'openclaw/tools';

// In API route:
await sessions_spawn({
  task: 'Build this feature',
  model: 'kimi-coding/k2p5'
});
```

**Status:** Partially implemented. Need to verify import path.

---

## Option B: CLI Wrapper (Most Reliable)

Create a script that OpenClaw CLI executes.

**How it works:**
```bash
# Dashboard calls:
openclaw sessions:spawn --task "..." --model kimi-k2

# Or via Node:
execSync('openclaw sessions:spawn ...');
```

**Files needed:**
- CLI wrapper script
- API routes that call CLI

**Status:** Needs CLI access verification.

---

## Option C: HTTP Bridge (Safest)

Create a small bridge server that OpenClaw and dashboard both talk to.

**Architecture:**
```
Dashboard (port 3001) ←→ Bridge (port 3002) ←→ OpenClaw
```

**How it works:**
1. Dashboard POSTs to bridge
2. Bridge has access to OpenClaw tools
3. Bridge executes and returns result

**Files needed:**
- `bridge-server.js` - HTTP bridge
- Dashboard API calls bridge

**Status:** Not implemented yet.

---

## Recommended Approach: Start with Option A + Fallback

I've created `dashboard/lib/openclaw.ts` that:
1. Tries to import tools directly
2. Falls back to CLI if import fails
3. Falls back to child process spawn

This gives you the best chance of success.

---

## Quick Test

To verify which method works:

```bash
# SSH to EC2
ssh ubuntu@YOUR_EC2_IP

# Test if OpenClaw CLI is available
which openclaw
openclaw --version

# Test if tools are importable
cd /home/ubuntu/.openclaw/workspace/agent-agency/dashboard
node -e "console.log(require.resolve('openclaw'))" 2>&1 || echo "Not in node_modules"

# Check if there's a tools directory
ls /home/ubuntu/.npm-global/lib/node_modules/openclaw/ 2>/dev/null || echo "Check global install"
ls /home/ubuntu/.openclaw/ 2>/dev/null || echo "Check .openclaw dir"
```

---

## What I've Built

### Backend (API Routes):
- ✅ `pages/api/agents.ts` - Get status + spawn agents
- ✅ `pages/api/chat.ts` - Send messages to agents
- ✅ `pages/api/work.ts` - Get work history
- ✅ `pages/api/schedule.ts` - Create cron jobs

### Integration Layer:
- ✅ `lib/openclaw.ts` - Tool wrapper with fallbacks

### These try to:
1. Import OpenClaw tools directly
2. Use CLI if import fails
3. Use child process if CLI fails

---

## Next Steps

**To make this work, you need to:**

1. **Tell me how OpenClaw exposes its tools**
   - Is there a CLI? `openclaw --help`
   - Can tools be imported? `require('openclaw')`
   - Is there an HTTP API? `curl http://localhost:...`

2. **I'll adjust the integration** to match how OpenClaw actually works

3. **Test** - Click a button, see if agent actually spawns

---

## Immediate Test

Run this on your EC2:

```bash
# Check what OpenCLaw commands are available
openclaw help 2>/dev/null || echo "No 'openclaw' command"

# Check if there's a way to spawn sessions
ls /home/ubuntu/.npm-global/bin/ | grep -i claw

# Check OpenClaw installation
ls -la /home/ubuntu/.npm-global/lib/node_modules/ | grep openclaw
```

**Paste the output here** and I'll configure the exact integration method that works.

---

## Summary

- ✅ Dashboard UI is ready
- ✅ API routes are ready
- ✅ Integration layer has 3 fallback methods
- ⏳ Need to verify which method OpenClaw supports
- ⏳ Then test a real spawn

**No fake buttons. Once configured, every click = real OpenClaw action.**