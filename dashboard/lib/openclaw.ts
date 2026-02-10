# OpenClaw Dashboard Integration
## Direct Action Bridge - No Fake Buttons

This connects the dashboard directly to OpenClaw's actual tools.

---

## Architecture

```
Dashboard UI (Next.js on EC2)
    ↓ API Call
Dashboard API Route
    ↓ Direct Tool Call
OpenClaw Tool (sessions_spawn, cron, etc.)
    ↓ Real Execution
Sub-agent spawned / Cron created / Work done
```

---

## Integration Methods

### Method 1: Direct Tool Import (Recommended)

The dashboard API routes import and call OpenClaw tools directly:

```typescript
// pages/api/wake.ts
import { sessions_spawn } from '../../../.openclaw/core/tools'; // Adjust path

export default async function handler(req, res) {
  const { agentId, task } = req.body;
  
  // This ACTUALLY spawns a sub-agent
  const result = await sessions_spawn({
    task: buildAgentPrompt(agentId, task),
    model: 'kimi-coding/k2p5',
    timeoutSeconds: 300
  });
  
  res.json({ success: true, sessionId: result.sessionId });
}
```

### Method 2: IPC/HTTP Bridge

If tools can't be imported directly, create a bridge server:

```javascript
// bridge-server.js (runs alongside OpenClaw)
const express = require('express');
const app = express();

app.post('/spawn', async (req, res) => {
  const { agentId, task } = req.body;
  
  // Access to OpenClaw's tool registry
  const result = await global.toolRegistry.sessions_spawn({
    task: buildPrompt(agentId, task),
    model: 'kimi-coding/k2p5'
  });
  
  res.json(result);
});

app.listen(3002); // Dashboard calls this
```

### Method 3: Child Process Spawn

Spawn OpenClaw CLI commands:

```javascript
const { execSync } = require('child_process');

// Spawn agent via OpenClaw CLI
const result = execSync(`
  openclaw sessions:spawn \\
    --task "${prompt}" \\
    --model kimi-coding/k2p5 \\
    --timeout 300
`, { encoding: 'utf8' });
```

---

## Implementation

Choose ONE method below:

---

## METHOD 1: Direct Import (If OpenClaw exports tools)

### 1.1 Check if OpenClaw exports tools

```bash
# Check if tools are exportable
ls /home/ubuntu/.openclaw/workspace/.openclaw/core/tools 2>/dev/null || echo "Need to find tools"

# Or check if there's a package
ls /home/ubuntu/.npm-global/lib/node_modules/openclaw/tools 2>/dev/null || echo "Check npm"
```

### 1.2 Create Tool Wrapper

```typescript
// dashboard/lib/openclaw.ts
import { execSync } from 'child_process';
import path from 'path';

const WORKSPACE_DIR = '/home/ubuntu/.openclaw/workspace';

export async function spawnAgent(agentId: string, task: string) {
  // Build the full prompt
  const prompt = buildAgentPrompt(agentId, task);
  
  // Option A: If we can import sessions_spawn
  try {
    // Dynamic import of OpenClaw tools
    const openclaw = await import('/home/ubuntu/.npm-global/lib/node_modules/openclaw');
    
    if (openclaw.sessions_spawn) {
      return await openclaw.sessions_spawn({
        task: prompt,
        model: 'kimi-coding/k2p5',
        timeoutSeconds: 300
      });
    }
  } catch (e) {
    console.log('Direct import failed, using CLI');
  }
  
  // Option B: Use OpenClaw CLI
  return spawnViaCLI(prompt);
}

async function spawnViaCLI(prompt: string) {
  // Create a temporary script file
  const fs = require('fs');
  const tmpFile = `/tmp/spawn-${Date.now()}.js`;
  
  fs.writeFileSync(tmpFile, `
    const { sessions_spawn } = require('/home/ubuntu/.openclaw/core/tools');
    
    sessions_spawn({
      task: ${JSON.stringify(prompt)},
      model: 'kimi-coding/k2p5',
      timeoutSeconds: 300
    }).then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
  `);
  
  try {
    const output = execSync(`node ${tmpFile}`, {
      encoding: 'utf8',
      timeout: 310000,
      cwd: WORKSPACE_DIR
    });
    
    fs.unlinkSync(tmpFile);
    return JSON.parse(output);
  } catch (err) {
    fs.unlinkSync(tmpFile);
    throw err;
  }
}

function buildAgentPrompt(agentId: string, task: string): string {
  const fs = require('fs');
  const path = require('path');
  
  // Read agent definition
  const agentsFile = path.join(WORKSPACE_DIR, 'agent-agency/agents.json');
  const agents = JSON.parse(fs.readFileSync(agentsFile, 'utf8'));
  const agent = agents.agents.find((a: any) => a.id === agentId);
  
  if (!agent) throw new Error(`Agent ${agentId} not found`);
  
  return `You are ${agent.name}, ${agent.role} ${agent.emoji}

PERSONALITY: ${agent.personality}

EXPERTISE: ${agent.skills.join(', ')}
TRAITS: Leadership ${agent.traits.leadership}/10, Creativity ${agent.traits.creativity}/10, Technical ${agent.traits.technical}/10, Analytical ${agent.traits.analytical}/10, Social ${agent.traits.social}/10

INSTRUCTIONS:
1. ALWAYS stay in character as ${agent.name}
2. Start EVERY response with ${agent.emoji}
3. Use your professional expertise
4. Be proactive and suggest next steps
5. NEVER break character or mention you are an AI
6. This is a REAL task, not a simulation

YOUR TASK:
${task}

Respond as ${agent.name}:`;
}

export async function createCronJob(schedule: string, task: string) {
  // Direct cron creation via OpenClaw
  const fs = require('fs');
  const path = require('path');
  
  const tmpFile = `/tmp/cron-${Date.now()}.js`;
  
  fs.writeFileSync(tmpFile, `
    const { cron } = require('/home/ubuntu/.openclaw/core/tools');
    
    cron.add({
      name: 'User scheduled task',
      schedule: ${JSON.stringify(schedule)},
      payload: {
        kind: 'agentTurn',
        message: ${JSON.stringify(task)}
      },
      sessionTarget: 'isolated'
    }).then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
  `);
  
  try {
    const output = execSync(`node ${tmpFile}`, {
      encoding: 'utf8',
      cwd: WORKSPACE_DIR
    });
    
    fs.unlinkSync(tmpFile);
    return JSON.parse(output);
  } catch (err) {
    fs.unlinkSync(tmpFile);
    throw err;
  }
}

export async function sendMessageToAgent(agentId: string, message: string) {
  // This would resume or create a session with the agent
  return spawnAgent(agentId, `Can says: "${message}"\n\nRespond to Can:`);
}

export async function assignWork(agentId: string, task: string, dueDate?: string) {
  // Spawn agent with work assignment
  const fullTask = dueDate 
    ? `${task}\n\nDUE: ${dueDate}`
    : task;
    
  return spawnAgent(agentId, fullTask);
}

// Helper to check if agent is currently running
export function isAgentActive(agentId: string): boolean {
  const fs = require('fs');
  const path = require('path');
  
  // Check for active session files
  const sessionsDir = path.join(WORKSPACE_DIR, '.openclaw/sessions');
  
  if (!fs.existsSync(sessionsDir)) return false;
  
  const sessions = fs.readdirSync(sessionsDir);
  return sessions.some((s: string) => s.includes(`agent-${agentId}`));
}
