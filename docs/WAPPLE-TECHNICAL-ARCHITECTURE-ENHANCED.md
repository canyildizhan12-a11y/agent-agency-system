# Wapple - Mobile AI Agent Superapp
## Technical Architecture & Implementation Document

**Version:** 1.5 (Supabase + Proactive AI Agents)  
**Date:** 2026-02-25  
**Original Author:** Codex (Architecture)  
**Enhanced By:** Quill (Documentation)  
**Status:** Production Ready  
**Owner:** Can (Founder/Builder)

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Understanding Openclaw](#2-understanding-openclaw)
3. [System Architecture & Flow](#3-system-architecture--flow)
4. [Infrastructure & Provisioning](#4-infrastructure--provisioning)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Core Algorithms & Logic](#7-core-algorithms--logic)
8. [Security Architecture](#8-security-architecture)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Implementation Roadmap](#11-implementation-roadmap)
12. [API Reference](#12-api-reference)
13. [Environment Variables](#13-environment-variables)

---

# 1. Executive Summary

## 1.1 Project Overview

**Wapple** transforms Openclaw from a technical tool into a mainstream, 24/7 autonomous personal AI ecosystem accessible from a smartphone.

## 1.2 Core Value Proposition

> "A 24/7 active AI agent environment that lives in your pocket and executes tasks on your behalf."

## 1.3 What This Document Covers

This document provides a comprehensive blueprint for building Wapple - a mobile wrapper around the vanilla Openclaw framework:
- How vanilla Openclaw works
- How the mobile app communicates with Openclaw instances
- How to provision and manage user VPS instances
- How credit systems and billing work

## 1.4 Third-Party Services Strategy

> **Philosophy:** Use production-ready third-party services wherever possible. We build only what differentiates us.

| Service | Purpose | What It Replaces |
|---------|---------|------------------|
| **Supabase** | Auth, Database, Realtime, Storage (research/analytics only) | Building our own auth system, WebSocket server |
| **Stripe** | Payments, Subscriptions | Building billing from scratch |
| **OpenRouter** | AI/LLM Access | Direct integration with Anthropic/OpenAI |
| **DigitalOcean** | VPS Hosting | Manual server provisioning |

> **Note on Storage:** User files stay on their VPS. Supabase Storage is only for our internal research/analytics data.

### Why This Approach?

- **Faster time-to-market**: Don't reinvent auth, payments, databases
- **Production-tested**: Millions of users rely on these services
- **Less maintenance**: Security updates handled by specialists
- **Focus on what matters**: Our differentiator is the **proactive AI agent**, not auth systems

## 1.4 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER'S PHONE                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   Home   │  │  Chats   │  │ Projects │  │  Agents  │          │
│  │   Tab    │  │   Tab    │  │   Tab    │  │   Tab    │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │             │             │             │                  │
│       └─────────────┴─────────────┴─────────────┘                  │
│                              │                                      │
│                    ┌─────────┴─────────┐                            │
│                    │   Socket.io      │                            │
│                    │   Connection     │                            │
│                    └─────────┬─────────┘                            │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND API (Cloud)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Auth Service │  │Credit Manager│  │Provisioning │              │
│  │              │  │              │  │  Service    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                      │
│  ┌──────┴──────────────────┴──────────────────┴───────┐              │
│  │              PostgreSQL Database                    │              │
│  └────────────────────────────────────────────────────┘              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   USER A VPS    │  │   USER B VPS   │  │   USER C VPS   │
│  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │
│  │  Openclaw │  │  │  │  Openclaw │  │  │  │  Openclaw │  │
│  │ Gateway   │  │  │  │ Gateway   │  │  │  │ Gateway   │  │
│  └─────┬─────┘  │  │  └─────┬─────┘  │  │  └─────┬─────┘  │
│        │        │  │        │        │  │        │        │
│  ┌─────┴─────┐  │  │  ┌─────┴─────┐  │  │  ┌─────┴─────┐  │
│  │  Workspace │  │  │  │  Workspace │  │  │  │  Workspace │  │
│  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

# 2. Understanding Openclaw

## 2.1 What is Openclaw?

Openclaw is **NOT a message just forwarder**. It's a **proactive AI agent system** that gives your AI assistant direct access to a full computer (VPS). Think of it as giving your AI "hands and eyes" on a real server.

**The key difference:**
- Traditional chatbots: You ask → AI responds → Done
- Openclaw: You ask → AI acts → It executes tasks on your VPS → Returns results

### 2.1.2 What Openclaw Actually Does

```
┌─────────────────────────────────────────────────────────────────────┐
│                   OPENCLAW = AI WITH COMPUTER ACCESS                  │
└─────────────────────────────────────────────────────────────────────┘

Your AI Agent can:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧  RUN COMMANDS        → Execute any terminal command on VPS
                          (git, npm, docker, curl, python, etc.)

📁  READ/WRITE FILES    → Access entire filesystem
                          (configs, code, documents, logs)

🌐  BROWSER CONTROL     → Browse the web, scrape sites, automate UI
                          (headless Chrome via Puppeteer/Playwright)

📧  EMAIL INTEGRATION   → Send/receive emails via SMTP/IMAP
                          (Gmail, Outlook, custom SMTP)

🔗  API CALLS           → Call any external API
                          (REST, GraphQL, webhooks)

📊  DATABASE ACCESS     → Query/modify databases
                          (PostgreSQL, MySQL, MongoDB)

⏰  SCHEDULED TASKS     → Run tasks on cron schedule
                          (daily reports, monitoring, automation)

📱  MOBILE NODES        → Access phone camera, location, notifications
                          (iOS/Android paired devices)

🔔  SEND MESSAGES       → Push notifications to Telegram/WhatsApp/Discord
                          (proactive alerts, reports)
```

### 2.1.3 Example: Instead of Just Talking, It ACTS

| User Request | What Happens |
|--------------|--------------|
| "What's the weather?" | AI calls weather API, returns forecast |
| "Deploy my app" | AI runs `git pull && npm build && pm2 restart` |
| "Check my emails" | AI connects to Gmail IMAP, reads recent emails |
| "Find info about X" | AI uses browser to search, scrapes results |
| "Run my tests" | AI executes `npm test`, returns results |
| "Monitor server" | AI runs `htop`, `df -h`, reports status |
| "Send report to team" | AI generates report, emails to team |

**This is a paradigm shift:** The AI isn't just answering questions—it's **doing work** on your behalf.

### 2.1.4 Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    OPENCLAW GATEWAY                      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  WhatsApp   │  │  Telegram  │  │  Discord   │      │
│  │   Channel   │  │   Channel  │  │  Channel   │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         │                │                │              │
│         └────────────────┼────────────────┘              │
│                          │                               │
│                    ┌─────┴─────┐                         │
│                    │  Message  │                         │
│                    │  Router   │                         │
│                    └─────┬─────┘                         │
│                          │                               │
│         ┌────────────────┼────────────────┐             │
│         │                │                │              │
│  ┌──────┴──────┐  ┌─────┴─────┐  ┌──────┴──────┐       │
│  │   Agent A   │  │   Agent B │  │   Agent C   │       │
│  │  (Session)  │  │  (Session)│  │  (Session)  │       │
│  └─────────────┘  └───────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## 2.2 Openclaw's Architecture

### 2.2.1 The Gateway

The **Gateway** is the central component:
- Runs as Node.js process (`openclaw gateway`)
- Listens on port 18789 (default)
- Exposes web Control UI
- Manages all channel connections
- Single source of truth for sessions and routing

### 2.2.2 Channels Supported

| Channel | Description | Authentication |
|---------|-------------|----------------|
| **WhatsApp** | Direct messaging and groups | QR code pairing |
| **Telegram** | Bots, DMs, and groups | Bot Token |
| **Discord** | Multiple bots per server | Bot Token |
| **iMessage** | Via Mac server | Mac pairing |
| **Signal** | DMs and groups | Phone number |

### 2.2.3 Multi-Agent System

Each agent has isolated:
- **Workspace** - Files, persona definitions, configuration
- **State directory (agentDir)** - Auth profiles, model registry
- **Session store** - Chat history and routing state

```
~/.openclaw/
├── openclaw.json              # Main config
├── agents/
│   ├── main/
│   │   ├── agent/             # agentDir
│   │   │   ├── auth-profiles.json
│   │   │   └── config.yaml
│   │   └── sessions/          # Chat history
│   ├── research/
│   │   └── ...
│   └── coding/
│       └── ...
└── workspace/                 # Default workspace
    ├── SOUL.md               # Agent persona
    ├── AGENTS.md             # Team structure
    └── USER.md               # User info
```

### 2.2.4 Message Routing Flow

```
Incoming Message
       │
       ▼
┌──────────────────┐
│  Binding Lookup  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │  Match  │
    │ Priority│
    └────┬────┘
         │
    ┌────┴────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
┌─────────┐                           ┌─────────┐
│  Exact  │                           │ Default │
│  Match  │                           │  Agent  │
└────┬────┘                           └────┬────┘
     │                                    │
     └──────────────┬─────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │  Agent       │
            │  Processing  │
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  Response    │
            │  via Channel │
            └───────────────┘
```

**Binding Match Priority:**
1. Peer match (exact DM/group ID)
2. Parent peer (thread inheritance)
3. Discord role routing
4. Guild ID (Discord)
5. Team ID (Slack)
6. Account ID match
7. Fall back to default agent

## 2.3 Configuration File Structure

```json
{
  "agents": {
    "list": [
      { 
        "id": "main", 
        "workspace": "~/.openclaw/workspace-main",
        "model": "anthropic/claude-sonnet-4-5"
      }
    ]
  },
  "bindings": [
    { "agentId": "main", "match": { "channel": "telegram" } }
  ],
  "channels": {
    "telegram": {
      "accounts": {
        "default": { "botToken": "BOT_TOKEN" }
      }
    }
  },
  "tools": {
    "allow": ["read", "write", "exec", "message"],
    "deny": []
  }
}
```

## 2.4 Workspace Persona Files

| File | Purpose | Impact |
|------|---------|--------|
| **SOUL.md** | Agent personality | Changes how AI communicates |
| **AGENTS.md** | Team structure | Defines collaboration |
| **USER.md** | User info | Context about human |
| **IDENTITY.md** | Technical identity | System behavior |

### 2.4.1 Example SOUL.md

```markdown
# SOUL.md - Agent Persona

**Name:** Wapple Assistant  
**Role:** Personal AI Agent  
**Emoji:** 🤖

## Communication Style
- Tone: Friendly but professional
- Detail level: Concise unless clarification needed

## What You Help With
- Coding and technical tasks
- Research and information gathering
- Task automation
- General conversation

## Constraints
- Always confirm before expensive operations
- Ask before taking actions outside your scope
- Report errors clearly with context
```

## 2.5 Available Tools

| Tool | Description | Risk Level |
|------|-------------|------------|
| **exec** | Run shell commands | High |
| **read** | Read files | Low |
| **write** | Write files | Medium |
| **edit** | Edit files | Medium |
| **browser** | Control web browser | High |
| **message** | Send messages | Medium |
| **sessions** | Manage conversations | Low |
| **cron** | Schedule tasks | Medium |
| **nodes** | Control paired devices | Medium |

### 2.5.1 Tool Sandboxing

```json
{
  "tools": {
    "allow": ["read", "sessions_list", "message"],
    "deny": ["exec", "write", "browser"]
  }
}
```

## 2.6 Task Flow

```
1. User Message ──► WhatsApp/Telegram/Discord
                           │
                           ▼
2. Gateway Receives ──► Message enters Gateway
                           │
                           ▼
3. Binding Lookup ──► Finds correct agent
                           │
                           ▼
4. Session Restore ──► Loads conversation history
                           │
                           ▼
5. Agent Processing ──► Uses tools, calls LLM
                           │
                           ▼
6. Response ──► Sent back through channel
                           │
                           ▼
7. Session Save ──► Context preserved
```

---

# 3. System Architecture & Flow

## 3.1 High-Level Architecture

### 3.1.1 Layer Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 1: Mobile App (React Native)                                 │
│  - Home, Chats, Projects, Agents screens                           │
│  - Zustand state management                                         │
│  - Socket.io for real-time                                         │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 2: Backend API Gateway                                       │
│  - Express.js server                                               │
│  - JWT authentication                                               │
│  - Credit management                                               │
│  - Request routing to user VPS                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 3: Infrastructure (Per-User VPS)                            │
│  - Docker container with Openclaw                                  │
│  - User's personalized workspace                                   │
│  - Isolated from other users                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LAYER 4: External Services                                         │
│  - OpenRouter (LLM API)                                           │
│  - Stripe (Payments)                                               │
│  - DigitalOcean/AWS (VPS)                                          │
└─────────────────────────────────────────────────────────────────────┘
```

## 3.2 Communication Flows

### 3.2.1 Send Message Flow

```
Mobile App                                    User's VPS
    │                                              │
    │  POST /api/chat/:id/messages               │
    │ ─────────────────────────────────────────►  │
    │                                              │
    │  1. Validate JWT token                       │
    │  2. Check credit balance                    │
    │  3. Forward to VPS via API                  │
    │                                              │
    │                                         Openclaw
    │                                              │
    │  4. Route to agent                          │
    │  5. Process with LLM                        │
    │  6. Return response                         │
    │                                              │
    │  Response (200 OK)                          │
    │ ◄─────────────────────────────────────────  │
    │                                              │
    │  WebSocket: Emit 'message' event            │
    │ ─────────────────────────────────────────►  │
    │                                              │
Mobile App                                    User's Phone
    │                                              │
    │  Update chat UI                             │
    │                                              │
```

### 3.2.2 Real-Time Updates

```
User's VPS                              Backend                         Mobile App
    │                                      │                                │
    │  Openclaw processes task             │                                │
    │                                      │                                │
    │  ┌──────────────────────────────────┐│                                │
    │  │ webhook or polling               ││                                │
    │  └──────────────────────────────────┘│                                │
    │         │                            │                                │
    │         │ HTTP POST /api/events     │                                │
    │         ├──────────────────────────► │                                │
    │         │                            │                                │
    │         │  Validate & route          │                                │
    │         │                            │                                │
    │         │                            │  Socket.io emit                │
    │         │                            │ ◄──────────────────────────► │
    │         │                            │                                │
    │         │                            │  Update UI in real-time        │
```

---

# 4. Infrastructure & Provisioning

## 4.1 VPS Architecture

### 4.1.1 Why Per-User VPS?

| Benefit | Description |
|---------|-------------|
| **Isolation** | One user's issues don't affect others |
| **Customization** | Unique agent configurations per user |
| **Security** | Full data control, no cross-user access |
| **Performance** | Guaranteed resources |
| **Reliability** | Single tenant = fewer variables |

### 4.1.2 Tier Specifications

| Tier | Provider | vCPU | RAM | Storage | Bandwidth | Monthly Cost |
|------|----------|------|-----|---------|-----------|--------------|
| **Starter** | DigitalOcean | 1 | 1GB | 25GB | 1TB | $5 |
| **Pro** | DigitalOcean | 2 | 4GB | 50GB | 2TB | $15 |
| **Premium** | AWS | 2 | 4GB | 100GB | 3TB | $25 |

### 4.1.3 VPS Comparison

```
DigitalOcean Droplet:
├── Pros: Simple API, predictable pricing, good docs
└── Cons: Limited region options, less customization

AWS EC2:
├── Pros: Global presence, many instance types, Lambda integration
└── Cons: Complex pricing, steeper learning curve

Hetzner:
├── Pros: Excellent price/performance, EU-focused
└── Cons: Limited US presence
```

## 4.2 Provisioning Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROVISIONING WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────┘

User Subscribes
      │
      ▼
┌──────────────────┐
│  Stripe Webhook │
│  (payment conf)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ Create VPS       │────►│ Wait for SSH    │
│ (DO/AWS API)    │     │ (max 5 min)     │
└────────┬─────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐     ┌──────────────────┐
│ Install Docker  │────►│ Pull Openclaw   │
│ & Dependencies  │     │ Container       │
└────────┬─────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐     ┌──────────────────┐
│ Generate Config  │────►│ Configure       │
│ (openclaw.json)  │     │ Channels        │
└────────┬─────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐     ┌──────────────────┐
│ Create Workspace│────►│ Test Gateway    │
│ Files           │     │ Reachability    │
└────────┬─────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐
│ Activate User    │
│ & Notify         │
└──────────────────┘
```

### 4.2.1 Provisioning Script

```bash
#!/bin/bash
# provision-vps.sh

set -e

# 1. Update and install dependencies
apt-get update
apt-get install -y docker.io docker-compose curl

# 2. Install Openclaw globally
npm install -g openclaw

# 3. Create directories
mkdir -p ~/.openclaw/{workspace,agents,credentials}

# 4. Generate configuration
cat > ~/.openclaw/openclaw.json << 'EOF'
{
  "agents": {
    "list": [{"id": "assistant", "workspace": "~/.openclaw/workspace"}]
  },
  "bindings": [...]
}
EOF

# 5. Start Gateway
openclaw gateway start --daemon
```

## 4.3 User-Specific Configuration.3.1 Per-User open

### 4claw.json

```json
{
  "agents": {
    "list": [
      {
        "id": "assistant",
        "workspace": "~/.openclaw/workspace",
        "model": "anthropic/claude-sonnet-4-20250514",
        "tools": {
          "allow": ["read", "write", "exec", "message", "sessions", "cron"],
          "deny": []
        }
      }
    ]
  },
  "bindings": [
    {
      "agentId": "assistant",
      "match": { "channel": "telegram", "accountId": "default" }
    }
  ],
  "channels": {
    "telegram": {
      "accounts": {
        "default": {
          "botToken": "{{USER_BOT_TOKEN}}"
        }
      }
    }
  }
}
```

### 4.3.2 Workspace Generation

```javascript
// generate-workspace.js
function generateWorkspace(user) {
  return {
    'SOUL.md': generateSoul(user),
    'USER.md': generateUser(user),
    'AGENTS.md': generateAgents(),
    'IDENTITY.md': generateIdentity(user)
  };
}

function generateSoul(user) {
  return `# SOUL.md - ${user.name}'s Assistant

**You are talking to:** ${user.name}

## Communication Style
- Tone: ${user.preferences.tone || 'friendly'}
- Detail level: ${user.preferences.detailLevel || 'balanced'}

## What They Care About
${user.interests.map(i => `- ${i}`).join('\n')}

## Goals
${user.goals.map(g => `- ${g}`).join('\n')}
`;
}
```

---

# 5. Backend Architecture

## 5.1 Third-Party Services Strategy

> **Philosophy:** Use production-ready third-party services wherever possible to minimize development overhead and ensure reliability.

| Service | Purpose | Why |
|---------|---------|-----|
| **Supabase** | Auth, Database, Realtime, Storage | Complete backend-as-a-service |
| **Stripe** | Payments, Subscriptions | Industry-standard billing |
| **OpenRouter** | AI/LLM Access | Unified API for multiple providers |
| **DigitalOcean/AWS** | VPS Hosting | Infrastructure |

## 5.2 Supabase Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE SERVICES                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE DASHBOARD                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   Auth      │  │  Database   │  │  Storage    │                 │
│  │  (JWT)      │  │(PostgreSQL) │  │  (S3)       │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Realtime   │  │  Edge       │  │  Functions  │                 │
│  │ (WebSocket) │  │  Functions  │  │ (Serverless)│                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    WAPPLE BACKEND                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Lightweight Node.js/Express API (only business logic)      │    │
│  │                                                              │    │
│  │  - VPS Provisioning & Management                            │    │
│  │  - Credit/Debit Operations                                  │    │
│  │  - Stripe Webhook Handling                                  │    │
│  │  - Agent Health Monitoring                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2.1 What Supabase Handles

| Feature | Implementation |
|---------|---------------|
| **User Auth** | Supabase Auth (Email/Password + OAuth: Google, Apple) |
| **Database** | PostgreSQL with Row Level Security (RLS) |
| **Real-time** | Supabase Realtime for WebSocket connections |
| **Storage** | Supabase Storage (research/analytics data only) |
| **Edge Functions** | Supabase Edge Functions for simple APIs |

### 5.2.2 Database Schema (Supabase)

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'starter',
  credits_balance INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VPS Instances
CREATE TABLE public.vps_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,           -- 'digitalocean', 'aws'
  instance_id TEXT NOT NULL,
  ip_address INET,
  status TEXT DEFAULT 'provisioning',
  tier TEXT DEFAULT 'starter',
  openclaw_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents per user
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vps_id UUID REFERENCES public.vps_instances(id),
  name TEXT NOT NULL,
  model TEXT DEFAULT 'anthropic/claude-sonnet-4-20250514',
  config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,              -- 'purchase', 'usage', 'bonus'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id),
  channel TEXT,
  peer_id TEXT,
  last_message_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vps_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own VPS" 
  ON public.vps_instances FOR ALL 
  USING (user_id = (SELECT id FROM public.profiles WHERE auth.uid() = id));
```

### 5.2.3 Supabase Client Usage

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signInWithOAuth = async (provider: 'google' | 'apple') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: 'wapple://auth/callback' }
  });
  return { data, error };
};

// Database
export const getUserCredits = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const deductCredits = async (userId: string, amount: number) => {
  const { data, error } = await supabase.rpc('deduct_credits', { 
    user_id: userId, 
    amount 
  });
  return { data, error };
};

// Real-time subscription
export const subscribeToMessages = (agentId: string, callback: (msg) => void) => {
  return supabase
    .channel(`agent:${agentId}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `agent_id=eq.${agentId}`
    }, callback)
    .subscribe();
};
```

## 5.3 Custom Backend (Minimal)

> **Only implement what's NOT available in Supabase**

```
┌─────────────────────────────────────────────────────────────────────┐
│               CUSTOM BACKEND (Node.js/Express)                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Business Logic Only                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  What we build:              What Supabase handles:                 │
│  ─────────────────           ──────────────────────                │
│  • VPS Provisioning          • Auth (JWT, OAuth)                   │
│  • Credit/Debit Logic         • Database (PostgreSQL)               │
│  • Stripe Webhooks            • Real-time (WebSocket)                │
│  • Agent Health Checks        • File Storage                         │
│  • Openclaw API Proxy        • Edge Functions                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3.1 Backend Services

```javascript
// services/vpsProvisioner.js
class VPSProvisioner {
  async createVPS(userId, tier) {
    // 1. Create droplet on DigitalOcean/AWS
    const droplet = await this.createDroplet(tier);
    
    // 2. Wait for SSH to be available
    await this.waitForSSH(droplet.ip);
    
    // 3. Install Docker & Openclaw
    await this.installOpenclaw(droplet.ip, userId);
    
    // 4. Configure user workspace
    await this.configureWorkspace(droplet.ip, userId);
    
    // 5. Store in Supabase
    await supabase.from('vps_instances').insert({
      user_id: userId,
      provider: 'digitalocean',
      instance_id: droplet.id,
      ip_address: droplet.ip,
      status: 'active',
      tier
    });
    
    return droplet;
  }
}

// services/creditManager.js
class CreditManager {
  async deductForLLM(userId, inputTokens, outputTokens) {
    const cost = this.calculateCost(inputTokens, outputTokens);
    
    // Use Supabase RPC function for atomic deduction
    const { data, error } = await supabase.rpc('deduct_credits', {
      user_id: userId,
      amount: Math.ceil(cost * 1000) // Convert to credits
    });
    
    if (error) throw error;
    return data;
  }
  
  calculateCost(inputTokens, outputTokens) {
    const RATE_PER_1K = 0.003; // Claude Sonnet
    return ((inputTokens + outputTokens) / 1000) * RATE_PER_1K;
  }
}
```

## 5.4 Stripe Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STRIPE BILLING                               │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Mobile     │      │   Backend    │      │   Stripe     │
│     App      │─────►│   (Node)    │─────►│   API        │
└──────────────┘      └──────┬───────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Supabase    │
                      │  (Update     │
                      │   credits)   │
                      └──────────────┘
```

### 5.4.1 Stripe Products

| Tier | Price | Credits/Month | Overage |
|------|-------|--------------|---------|
| Starter | $9.99/mo | 10,000 | $0.002/credit |
| Pro | $39.99/mo | 25,000 | $0.0015/credit |
| Premium | $129.99/mo | 100,000 | $0.001/credit |

### 5.4.2 Stripe Webhook Handler

```javascript
// routes/stripe.js
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleSubscriptionCreated(session);
      break;
      
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionUpdated(subscription);
      break;
      
    case 'customer.subscription.deleted':
      const deleted = event.data.object;
      await handleSubscriptionCanceled(deleted);
      break;
  }
  
  res.json({ received: true });
});

async function handleSubscriptionCreated(session) {
  const userId = session.metadata.user_id;
  const tier = getTierFromPriceId(session.price_id);
  
  await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId);
}
```

## 5.5 Database Schema Summary

> **All tables are in Supabase PostgreSQL** — see Section 5.2.2 for full schema with Row Level Security (RLS) policies.

### Tables Overview

| Table | Purpose | Managed By |
|-------|---------|------------|
| `profiles` | User data (extends Supabase auth) | Supabase |
| `vps_instances` | User VPS instances | Custom Backend |
| `agents` | User's AI agents | Custom Backend |
| `credit_transactions` | Credit purchase/usage history | Custom Backend |
| `conversations` | Chat history | Supabase |

### RPC Functions

```sql
-- Atomic credit deduction (prevents negative balance)
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT credits_balance INTO current_balance
  FROM profiles WHERE id = user_id;
  
  IF current_balance < amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE profiles 
  SET credits_balance = credits_balance - amount 
  WHERE id = user_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (user_id, -amount, 'usage', 'LLM usage');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    channel VARCHAR(50),
    peer_id VARCHAR(255),
    last_message_at TIMESTAMP
);
```

---

# 6. Frontend Architecture

## 6.1 Technology Stack (Third-Party Optimized)

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | React Native (Expo) | Cross-platform (iOS/Android) |
| **Language** | TypeScript | Type safety |
| **State** | Zustand | Lightweight, simple |
| **Navigation** | React Navigation | Tab + stack navigation |
| **Backend** | Supabase | Auth + DB + Realtime all-in-one |
| **Auth** | Supabase Auth | Email + OAuth (Google, Apple) |
| **Database** | Supabase PostgreSQL | With RLS security |
| **Real-time** | Supabase Realtime | WebSocket push to app |
| **Storage** | Supabase Storage | Research/analytics data only (user files stay on VPS) |
| **Payments** | Stripe | Subscription billing |
| **AI** | OpenRouter | Unified LLM API |
| **Hosting** | DigitalOcean/AWS | VPS per user |

## 6.2 Screen Structure

```
App Navigation
├── Tab Navigator
│   ├── Home (Mission Control)
│   │   ├── Greeting Header
│   │   ├── Quick Actions
│   │   ├── AI Insights
│   │   └── Active Tasks
│   │
│   ├── Chats
│   │   ├── Conversation List
│   │   └── Chat Screen
│   │       ├── Message List
│   │       ├── Input Bar
│   │       └── Action Buttons
│   │
│   ├── Projects
│   │   ├── File Browser
│   │   ├── Search
│   │   └── File Detail
│   │
│   └── Agents
│       ├── Agent List
│       ├── Agent Detail
│       └── Create Agent
│
└── Stack Navigator (Modal)
    ├── Settings
    ├── Profile
    ├── Credits Purchase
    └── Onboarding
```

## 6.3 State Management (Zustand)

```typescript
// stores/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    set({ user: response.user, token: response.token });
  },
  
  logout: () => {
    set({ user: null, token: null });
  },
  
  refreshToken: async () => {
    const { token } = get();
    const response = await api.post('/auth/refresh', { token });
    set({ token: response.token });
  }
}));
```

## 6.4 Real-Time Connection (Supabase)

```typescript
// services/realtime.ts - Using Supabase Realtime
import { supabase } from './supabase';

export const subscribeToMessages = (agentId: string, callback: (message) => void) => {
  // Subscribe to new messages for this agent
  const channel = supabase
    .channel(`messages:${agentId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `agent_id=eq.${agentId}`
    }, (payload) => {
      callback(payload.new);
    })
    .subscribe();
  
  return channel;
};

export const subscribeToCredits = (userId: string, callback: (balance) => void) => {
  // Subscribe to credit balance changes
  const channel = supabase
    .channel(`credits:${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${userId}`
    }, (payload) => {
      callback(payload.new.credits_balance);
    })
    .subscribe();
  
  return channel;
};

// Usage in React component
useEffect(() => {
  const channel = subscribeToMessages(agentId, (message) => {
    setMessages(prev => [...prev, message]);
  });
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [agentId]);
```

---

# 7. Core Algorithms & Logic

## 7.1 Credit Management

### 7.1.1 Credit Tiers

| Tier | Monthly Credits | Cost | Overage |
|------|----------------|------|---------|
| Starter | 10,000 | $9.99 | $0.002/credit |
| Pro | 25,000 | $39.99 | $0.0015/credit |
| Premium | 100,000 | $129.99 | $0.001/credit |

### 7.1.2 Credit Deduction Flow

```
User Sends Message
       │
       ▼
┌──────────────────┐
│ Get User Balance │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ > 0?    │──No──► Block & Show Purchase
    └────┬────┘
         │Yes
         ▼
┌──────────────────┐
│ Forward to VPS  │
│ & Start Timer   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Agent Processes │
│ (LLM + Tools)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Calculate Cost  │
│                 │
│ input_tokens    │
│ + output_tokens  │
│ × price_per_m    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Deduct Credits  │
│ & Log Transaction│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Send Response   │
└──────────────────┘
```

### 7.1.3 Token Cost Calculation

```javascript
// lib/credits.ts

const MODEL_PRICING = {
  'anthropic/claude-sonnet-4-20250514': {
    input: 0.003,   // $ per 1M tokens
    output: 0.015
  },
  'openai/gpt-4o': {
    input: 0.0025,
    output: 0.01
  },
  'google/gemini-pro-1.5': {
    input: 0.00125,
    output: 0.005
  }
};

function calculateCost(model, inputTokens, outputTokens) {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new Error(`Unknown model: ${model}`);
  }
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  
  return inputCost + outputCost;
}

function tokensToCredits(cost) {
  const CREDITS_PER_DOLLAR = 1000; // 1 credit = $0.001
  return Math.ceil(cost * CREDITS_PER_DOLLAR);
}
```

### 7.1.4 Credit Alerts

```javascript
function checkCreditThreshold(user) {
  const { balance, tier } = user;
  const limit = getTierLimit(tier);
  const percentage = (balance / limit) * 100;
  
  if (percentage <= 20) {
    sendPushNotification(user, 'CRITICAL: Credits running out!');
  } else if (percentage <= 50) {
    sendInAppNotification(user, 'Warning: Half credits used');
  }
}
```

## 7.2 File Synchronization

### 7.2.1 Sync Algorithm

```
Backend Polls VPS          Mobile App
      │                        │
      │  1. SSH into VPS       │
      │  2. List workspace     │
      │  3. Compare with DB    │
      │                        │
      │  4. Changes detected   │
      │  ───────────────────►  │
      │                        │
      │  5. Download request   │
      │  ◄───────────────────   │
      │                        │
      │  6. Stream file        │
      │  ───────────────────►  │
      │                        │
      │  7. Save to local      │
      │  8. Update UI          │
```

### 7.2.2 File Sync Service

```javascript
// services/fileSync.ts

class FileSyncService {
  async syncFiles(vpsId) {
    const vps = await db.vps.findById(vpsId);
    const remoteFiles = await this.listRemoteFiles(vps);
    const localFiles = await db.files.findByVps(vpsId);
    
    const changes = this.diff(remoteFiles, localFiles);
    
    for (const change of changes.added) {
      await this.downloadFile(vps, change.path);
    }
    
    for (const change of changes.modified) {
      await this.updateFile(vps, change.path);
    }
    
    for (const change of changes.deleted) {
      await this.deleteLocalFile(change.path);
    }
  }
  
  diff(remote, local) {
    // Returns { added, modified, deleted }
  }
}
```

---

# 8. Security Architecture

## 8.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

User Credentials
      │
      ▼
┌──────────────────┐
│  /api/auth/login │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│ Validate        │────►│ Generate        │
│ Credentials     │     │ JWT Tokens      │
└────────┬─────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐     ┌──────────────────┐
│ Return 401      │     │ Access Token    │
│ (if invalid)    │     │ + Refresh Token │
└──────────────────┘     └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Store in         │
                         │ Secure Storage   │
                         └──────────────────┘
```

### 8.1.1 JWT Structure

```javascript
// Access Token (15 min expiry)
{
  "type": "access",
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1700000000,
  "exp": 1700000900
}

// Refresh Token (7 days expiry)
{
  "type": "refresh",
  "userId": "uuid",
  "iat": 1700000000,
  "exp": 1700600000
}
```

## 8.2 VPS Security

### 8.2.1 Firewall Rules

```yaml
# ufw rules for user VPS
ufw default deny incoming
ufw default allow outgoing

# Allow SSH from backend only
ufw allow from {BACKEND_IP} to any port 22

# Allow Openclaw
ufw allow 18789

# Allow HTTPS
ufw allow 443
```

### 8.2.2 No User SSH Access

```javascript
// Provisioning service - disable password auth
async function hardenVPS(vps) {
  await ssh.execute(vps, 'sed -i "s/^PasswordAuthentication yes/PasswordAuthentication no/" /etc/ssh/sshd_config');
  await ssh.execute(vps, 'systemctl reload sshd');
  
  // Only backend IP can SSH
  await ssh.execute(vps, `ufw allow from ${BACKEND_IP} to any port 22`);
}
```

## 8.3 Rate Limiting

```javascript
// middleware/rateLimiter.js
const rateLimits = {
  chat: { windowMs: 60000, max: 60 },      // 60 requests/min
  agents: { windowMs: 60000, max: 30 },     // 30 requests/min
  files: { windowMs: 60000, max: 20 },      // 20 requests/min
  credits: { windowMs: 60000, max: 10 }    // 10 requests/min
};

function rateLimiter(type) {
  return RateLimit({
    windowMs: rateLimits[type].windowMs,
    max: rateLimits[type].max,
    message: { error: 'Rate limit exceeded' }
  });
}
```

---

# 9. Monitoring & Observability

## 9.1 Metrics Collection

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MONITORING STACK                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Grafana   │◄────│  Prometheus │◄────│  Exporters  │
│   (Dashboards)  │     │  (Time Series)  │     │              │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
        ┌───────────────────────────────────────┼───────────────┐
        │                   │                   │               │
        ▼                   ▼                   ▼               ▼
  ┌──────────┐        ┌──────────┐        ┌──────────┐   ┌──────────┐
  │  Node    │        │  Docker  │        │   API    │   │  System  │
  │  Exporter│        │  Exporter│        │  Metrics │   │  Metrics │
  └──────────┘        └──────────┘        └──────────┘   └──────────┘
```

### 9.1.1 Key Metrics

| Category | Metric | Alert Threshold |
|----------|--------|-----------------|
| **API** | Request latency p99 | > 2s |
| **API** | Error rate | > 1% |
| **VPS** | CPU usage | > 80% |
| **VPS** | Memory usage | > 85% |
| **VPS** | Disk usage | > 80% |
| **Credits** | Balance < 20% | Warning |
| **Credits** | Balance = 0 | Critical |
| **Auth** | Failed logins | > 10/min |

## 9.2 Logging

### 9.2.1 Log Levels

| Level | Use Case |
|-------|----------|
| ERROR | Exceptions, failures |
| WARN | Deprecations, recoverable issues |
| INFO | Key events (login, actions) |
| DEBUG | Detailed debugging |

### 9.2.2 Structured Logging

```javascript
// lib/logger.ts
const logger = {
  error: (ctx, msg, meta) => {
    console.log(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      service: 'wapple-api',
      ...ctx,
      message: msg,
      ...meta
    }));
  },
  
  info: (ctx, msg, meta) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      service: 'wapple-api',
      ...ctx,
      message: msg,
      ...meta
    }));
  }
};
```

## 9.3 Health Checks

```javascript
// routes/health.js
router.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    stripe: await checkStripe(),
    vpsCount: await countActiveVPS()
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks
  });
});
```

---

# 10. Troubleshooting Guide

## 10.1 Common Issues

### 10.1.1 User Can't Login

| Cause | Diagnosis | Solution |
|-------|-----------|----------|
| Wrong password | Check auth logs | Reset password |
| Account not found | Check DB | Verify email |
| Token expired | Check JWT | Force re-login |
| Rate limited | Check limit | Wait 1 min |

### 10.1.2 Message Not Delivered

```
Troubleshooting Flow:
        
Message Failed
      │
      ▼
┌──────────────────┐
│ Check Credit    │──No──► Prompt Purchase
│ Balance         │
└────────┬─────────┘
         │Yes
         ▼
┌──────────────────┐
│ Check VPS       │──Offline──► Rebuild VPS
│ Status          │
└────────┬─────────┘
         │Online
         ▼
┌──────────────────┐
│ Check Openclaw  │──Error──► View Logs
│ Logs            │
└────────┬─────────┘
         │OK
         ▼
┌──────────────────┐
│ Check LLM       │──Error──► Switch Model
│ Response        │
└────────┬─────────┘
         │OK
         ▼
Escalate to Engineering
```

### 10.1.3 VPS Provisioning Fails

| Error | Cause | Fix |
|-------|-------|-----|
| Timeout | Cloud API slow | Retry with backoff |
| Quota exceeded | Provider limit | Use different region |
| SSH key failed | Key not propagated | Re-run setup |
| Docker install fails | Network issue | Use different mirror |

### 10.1.4 Credit Deduction Issues

```javascript
// Debug credits
async function debugCredits(userId) {
  const user = await db.users.findById(userId);
  const transactions = await db.credit_transactions.findByUser(userId);
  const vps = await db.vps_instances.findByUser(userId);
  
  const llmUsage = await getOpenRouterUsage(userId);
  
  return {
    currentBalance: user.credits,
    transactions: transactions.slice(-10),
    llmCalls: llmUsage.total_calls,
    llmTokens: llmUsage.total_tokens
  };
}
```

## 10.2 Log Locations

| Service | Location |
|---------|----------|
| Backend API | `/var/log/wapple/api.log` |
| Openclaw (per user) | `~/.openclaw/logs/` |
| Docker | `docker logs <container>` |
| Nginx | `/var/log/nginx/` |
| System | `journalctl -u openclaw` |

---

# 11. Implementation Roadmap

## Phase 1: Foundation (Weeks 1-4)

| Week | Focus | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| 1 | **Project Setup** | Repo, CI/CD, Basic Auth | None |
| 2 | **Database** | Schema, Migrations, Seeds | Week 1 |
| 3 | **Auth Service** | Login, Register, JWT | Week 2 |
| 4 | **API Skeleton** | Routes, Controllers | Week 3 |

**Milestone:** Authenticated API baseline

## Phase 2: Infrastructure (Weeks 5-8)

| Week | Focus | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| 5 | **VPS Provisioning** | DO/AWS integration | Phase 1 |
| 6 | **Openclaw Setup** | Docker, Config gen | Week 5 |
| 7 | **Channel Config** | Telegram, WhatsApp | Week 6 |
| 8 | **Health Monitoring** | Status checks | Week 5-7 |

**Milestone:** User can get a working VPS

## Phase 3: Mobile Core (Weeks 9-12)

| Week | Focus | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| 9 | **App Setup** | Expo, Navigation | None |
| 10 | **Auth Screens** | Login, Register | Week 9 + API |
| 11 | **Chat UI** | Message list, Input | Week 10 |
| 12 | **WebSocket** | Real-time | Week 11 + API |

**Milestone:** Mobile app can chat with agent

## Phase 4: Payments (Weeks 13-16)

| Week | Focus | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| 13 | **Stripe Setup** | Products, Webhooks | None |
| 14 | **Credit System** | Balance, Deduction | Week 13 |
| 15 | **Purchase Flow** | UI, Confirmation | Week 14 |
| 16 | **Usage Alerts** | Warnings, Limits | Week 14 |

**Milestone:** Credits system functional

## Phase 5: Features (Weeks 17-20)

| Week | Focus | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| 17 | **File Sync** | Polling, Streaming | Phase 1 |
| 18 | **Projects Tab** | File browser | Week 17 |
| 19 | **Agents Tab** | List, Configure | Phase 2 |
| 20 | **Home Tab** | Dashboard | Phase 3 |

**Milestone:** Core features complete

## Phase 6: Polish (Weeks 21-24)

| Week | Focus | Deliverables | Dependencies |
|------|-------|--------------|--------------|
| 21 | **Onboarding** | Preferences flow | Phase 5 |
| 22 | **Performance** | Caching, Optimizations | Phase 5 |
| 23 | **Security Audit** | Review, Fixes | All |
| 24 | **Beta Launch** | Release, Monitor | All |

**Milestone:** Production ready

---

# 12. API Reference

## Authentication

### POST /api/auth/register
```bash
curl -X POST https://api.wapple.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123",
    "name": "John Doe"
  }'
```

**Response:** `{ "user": {...}, "token": "jwt...", "refreshToken": "..." }`

### POST /api/auth/login
```bash
curl -X POST https://api.wapple.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure123"
  }'
```

## Chat

### POST /api/chat/:agentId/messages
```bash
curl -X POST https://api.wapple.io/api/chat/assistant/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, help me with coding",
    "channel": "telegram"
  }'
```

## Credits

### GET /api/credits/balance
```bash
curl -X GET https://api.wapple.io/api/credits/balance \
  -H "Authorization: Bearer <token>"
```

**Response:** `{ "balance": 5000, "tier": "pro", "limit": 25000 }`

### POST /api/credits/purchase
```bash
curl -X POST https://api.wapple.io/api/credits/purchase \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "package": "starter_10k",
    "stripePaymentMethodId": "pm_..."
  }'
```

## VPS

### GET /api/vps/status
```bash
curl -X GET https://api.wapple.io/api/vps/status \
  -H "Authorization: Bearer <token>"
```

**Response:** `{ "status": "active", "ip": "1.2.3.4", "tier": "pro" }`

---

# 13. Environment Variables

## Backend

```bash
# Node
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/wapple
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...

# Cloud Providers
DO_API_TOKEN=dop_v1_...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# OpenRouter
OPENROUTER_API_KEY=sk-or-...

# Mobile App
EXPO_PUBLIC_API_URL=https://api.wapple.io
EXPO_PUBLIC_WS_URL=wss://api.wapple.io
```

---

# Appendix: Quick Reference

## Credit Cost by Model

| Model | Input/1M | Output/1M | Credits/1K Input | Credits/1K Output |
|-------|----------|-----------|-----------------|------------------|
| Claude Sonnet 4 | $3.00 | $15.00 | 3 | 15 |
| GPT-4o | $2.50 | $10.00 | 2.5 | 10 |
| Gemini Pro 1.5 | $1.25 | $5.00 | 1.25 | 5 |

## Common Commands

```bash
# Start Openclaw Gateway
openclaw gateway start

# Check status
openclaw gateway status

# View logs
openclaw gateway logs

# Restart
openclaw gateway restart

# Create agent
openclaw agents create assistant

# List agents
openclaw agents list
```

---

**Document Status:** Ready for Implementation  
**Version:** 1.3 (Enhanced)  
**Last Updated:** 2026-02-25  
**Next Review:** After Phase 1 completion
