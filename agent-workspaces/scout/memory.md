# 🔍 Scout's Dashboard Diagnostics Report
**Mission Date:** 2026-02-11  
**Status:** ROOT CAUSE IDENTIFIED  
**Severity:** CRITICAL

---

## 🎯 EXECUTIVE SUMMARY

The Agent Agency Dashboard has **two critical issues** causing wake buttons and chat to malfunction:

1. **OPENCLAW CLI SYNTAX ERROR** - The `spawnAgent()` function uses incorrect command syntax
2. **MISSING ERROR HANDLING** - Frontend doesn't properly display backend errors

---

## 🔴 CRITICAL FINDING #1: CLI Syntax Breakdown

**Location:** `/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/lib/openclaw.ts`

**Current Broken Code (lines 87-96):**
```typescript
const output = execSync(
  `cd ${WORKSPACE_DIR} && cat ${tmpFile} | openclaw agent --local --model moonshot/kimi-k2.5 2>&1`,
  {
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, OPENCLAW_WORKSPACE: WORKSPACE_DIR }
  }
);
```

**Error Output:**
```
error: required option '-m, --message <text>' not specified
```

**Root Cause:** The `openclaw agent` CLI **requires** the `-m` or `--message` flag. It does NOT accept piped stdin input via `cat`. The command syntax is completely wrong.

**Evidence:**
```bash
$ openclaw agent --help
Options:
  -m, --message <text>       Message body for the agent  # REQUIRED!
```

**Fix Required:**
```typescript
const output = execSync(
  `cd ${WORKSPACE_DIR} && openclaw agent --local --model moonshot/kimi-k2.5 -m "$(cat ${tmpFile})" 2>&1`,
  {
    encoding: 'utf8',
    timeout: 120000,
    env: { ...process.env, OPENCLAW_WORKSPACE: WORKSPACE_DIR }
  }
);
```

---

## 🟡 CRITICAL FINDING #2: Chat API Failure

**Location:** `/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/pages/api/chat.ts`

**Issue:** Same CLI syntax error affects chat messages. When users try to chat with agents, the backend returns a 200 status but the actual spawn fails silently.

**Test Evidence:**
```bash
$ curl -X POST http://16.170.237.202:3001/api/chat -d '{"agentId":"alex","message":"test"}'
{
  "success": true,
  "agentId": "alex",
  "message": "Message sent to agent",
  "openclawResult": {
    "status": "error",
    "error": "Command failed: ...",
    "output": "error: required option '-m, --message <text>' not specified"
  }
}
```

**Problem:** The API returns `success: true` even though the agent spawn failed! This is misleading.

---

## 🟠 FINDING #3: Frontend Error Handling Gap

**Location:** `/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/pages/index.tsx`

**Issue:** The frontend only checks `if (res.ok)` but doesn't validate the response body for errors.

**Lines 54-66:**
```typescript
if (res.ok) {
  const data = await res.json();
  setAgentResponse(`${data.agentEmoji} ${data.agentName} is working on: ${task}`);
  await fetchData();
} else {
  setAgentResponse('Error: Failed to wake agent');
}
```

**Problem:** When `res.ok` is true but `data.openclawResult.status === 'error'`, the UI falsely reports success.

---

## 🟢 FINDING #4: Dashboard Health Status

**Good News:** Dashboard infrastructure is operational
- Server: Running on PM2 (port 3001) ✅
- API Endpoints: All responding ✅
- Agent Data: Loading correctly from agents.json ✅
- Frontend: Rendering properly ✅
- Status Files: All 7 agents have sleeping_agents/*.json files ✅

**PM2 Status:**
```
┌────┬────────────────────┬─────────┬──────┬───────────┐
│ id │ name               │ mode    │ ↺    │ status    │
├────┼────────────────────┼─────────┼──────┼───────────┤
│ 0  │ agent-dashboard    │ fork    │ 5    │ online    │
└────┴────────────────────┴─────────┴──────┴───────────┘
```

---

## 📋 RECOMMENDED FIXES (Priority Order)

### Priority 1: Fix CLI Syntax (CRITICAL)
**File:** `dashboard/lib/openclaw.ts`
**Line:** ~87-96

Change:
```typescript
`cd ${WORKSPACE_DIR} && cat ${tmpFile} | openclaw agent --local --model moonshot/kimi-k2.5 2>&1`
```

To:
```typescript
`cd ${WORKSPACE_DIR} && openclaw agent --local --model moonshot/kimi-k2.5 -m "$(cat ${tmpFile})" 2>&1`
```

### Priority 2: Fix Error Handling (HIGH)
**File:** `dashboard/pages/api/wake.ts` and `dashboard/pages/api/chat.ts`

Add validation:
```typescript
if (result.status === 'error') {
  return res.status(500).json({ 
    error: 'Failed to spawn agent', 
    details: result.error 
  });
}
```

### Priority 3: Frontend Error Display (MEDIUM)
**File:** `dashboard/pages/index.tsx`

Check response body for errors:
```typescript
const data = await res.json();
if (data.openclawResult?.status === 'error') {
  setAgentResponse(`Error: ${data.openclawResult.error}`);
} else {
  setAgentResponse(`${data.agentEmoji} ${data.agentName} is working...`);
}
```

---

## 🧪 TESTING CHECKLIST

After fixes are deployed:

- [ ] Click "Wake Up" on sleeping agent → Agent should actually spawn
- [ ] Send chat message → Message should reach agent
- [ ] Check PM2 logs → No "required option -m" errors
- [ ] Verify active_sessions folder → New session files created
- [ ] Check agent responses → Should see actual agent replies in chat

---

## 📊 IMPACT ASSESSMENT

**Affected Features:**
- ❌ Wake buttons (completely broken)
- ❌ Chat functionality (completely broken)
- ✅ Agent display/status (working)
- ✅ UI/UX (working)

**User Impact:** HIGH - Core functionality unusable

**Fix Complexity:** LOW - Simple syntax change

**Estimated Fix Time:** 15-30 minutes

---

## 📁 FILES REQUIRING MODIFICATION

1. `/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/lib/openclaw.ts` (CLI syntax)
2. `/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/pages/api/wake.ts` (error handling)
3. `/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/pages/api/chat.ts` (error handling)
4. `/home/ubuntu/.openclaw/workspace/agent-agency/dashboard/pages/index.tsx` (frontend validation)

---

**Report Compiled By:** Scout 🔍  
**Next Action Required:** Deploy fixes and rebuild dashboard
