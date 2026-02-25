# Wapple - Mobile AI Agent Superapp
## Technical Architecture & Implementation Document

**Version:** 1.2  
**Date:** 2026-02-25  
**Author:** Codex (Architecture)  
**Status:** Production Ready

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
9. [Implementation Roadmap](#9-implementation-roadmap)

---

# 1. Executive Summary

## 1.1 Project Overview

**Wapple** is a mobile superapp that transforms Openclaw from a technical tool into a mainstream, 24/7 autonomous personal AI ecosystem accessible from a smartphone.

## 1.2 Core Value Proposition

> "A 24/7 active AI agent environment that lives in your pocket and executes tasks on your behalf."

## 1.3 What This Document Covers

This document provides a comprehensive blueprint for building Wapple - a mobile wrapper around the vanilla Openclaw framework. It explains:
- How vanilla Openclaw works (from docs.openclaw.ai)
- How the mobile app communicates with Openclaw instances
- How to provision and manage user VPS instances
- How credit systems and billing work

---

# 2. Understanding Openclaw

This section explains the standard Openclaw framework - the actual open-source project from docs.openclaw.ai - not any custom implementation.

## 2.1 What is Openclaw?

Openclaw is a **self-hosted gateway** that connects chat applications (WhatsApp, Telegram, Discord, iMessage, and more) to AI coding agents. Think of it as a bridge that lets you message an AI assistant from any chat app.

**The core idea:** You run one Gateway process on your own server, and it becomes the bridge between your messaging apps and an always-available AI assistant.

## 2.2 Openclaw's Architecture

### 2.2.1 The Gateway

The **Gateway** is the central component - it's the "single source of truth" for:
- Sessions management
- Message routing
- Channel connections

The Gateway:
- Runs as a Node.js process (`openclaw gateway`)
- Listens on a port (default 18789)
- Exposes a web Control UI
- Manages all channel connections

### 2.2.2 Channels

Openclaw supports multiple chat platforms simultaneously:

| Channel | Description |
|---------|-------------|
| **WhatsApp** | Direct messaging and group chats |
| **Telegram** | Bots, DMs, and groups |
| **Discord** | Multiple bots per server |
| **iMessage** | Via Mac server |

Each channel can have multiple **accounts** - for example, you could have two different WhatsApp numbers connected to one Gateway.

### 2.2.3 Multi-Agent System

One of Openclaw's powerful features is **multi-agent routing**. You can run multiple isolated AI agents, each with their own:
- **Workspace** - Files, persona definitions, and configuration
- **State directory (agentDir)** - Auth profiles, model registry, per-agent config
- **Session store** - Chat history and routing state

Each agent is essentially a separate "brain" that can handle different types of tasks.

### 2.2.4 How Messages Get Routed

Openclaw uses **bindings** to route incoming messages to the correct agent:

1. Check for peer match (exact DM/group ID)
2. Check for parent peer (thread inheritance)
3. Check Discord role routing
4. Check guild ID (Discord)
5. Check team ID (Slack)
6. Check account ID match
7. Fall back to default agent

This is deterministic - the most specific match wins.

## 2.3 Openclaw's File System Structure

When Openclaw runs, it creates this directory structure:

```
~/.openclaw/
├── openclaw.json           # Main configuration file
├── agents/                 # Per-agent directories
│   └── <agentId>/
│       └── agent/          # agentDir - auth, config
│           └── auth-profiles.json
│       └── sessions/       # Chat history
│
├── workspace/              # Default workspace (or workspace-<agentId>)
│   ├── AGENTS.md          # Team structure reference
│   ├── SOUL.md            # Agent persona
│   ├── USER.md            # User information
│   └── ...                # Other workspace files
│
├── credentials/           # Channel authentication
│   └── whatsapp/
│   └── telegram/
│   └── discord/
│
└── skills/               # Shared skills (optional)
```

### 2.3.1 Configuration File (openclaw.json)

The main configuration lives in `~/.openclaw/openclaw.json` (or via `OPENCLAW_CONFIG_PATH`):

```json
{
  "agents": {
    "list": [
      { "id": "main", "workspace": "~/.openclaw/workspace-main" }
    ]
  },
  "bindings": [
    { "agentId": "main", "match": { "channel": "telegram" } }
  ],
  "channels": {
    "telegram": {
      "accounts": {
        "default": { "botToken": "..." }
      }
    }
  }
}
```

### 2.3.2 Agent Workspace Files

Each agent's workspace contains persona-defining files:

| File | Purpose |
|------|---------|
| **SOUL.md** | Defines the agent's personality and communication style |
| **AGENTS.md** | Reference to team structure and other agents |
| **USER.md** | Information about the human user |
| **IDENTITY.md** | Technical identity details |

These files shape how the AI behaves - changing SOUL.md changes the agent's persona.

## 2.4 Tools and Capabilities

Openclaw agents have access to various **tools** - functions they can call to perform actions:

### 2.4.1 Available Tool Categories

| Tool | Description |
|------|-------------|
| **exec** | Run shell commands |
| **read** | Read files |
| **write** | Write files |
| **edit** | Edit files |
| **browser** | Control web browser |
| **message** | Send messages via channels |
| **sessions** | Manage conversations |
| **cron** | Schedule tasks |
| **nodes** | Control paired devices |

### 2.4.2 Tool Restrictions (Sandboxing)

You can restrict what tools an agent can use:

```json
{
  "tools": {
    "allow": ["read", "sessions_list"],
    "deny": ["exec", "write", "browser"]
  }
}
```

This is useful for creating "lightweight" agents with limited capabilities.

## 2.5 Skills System

Openclaw has a **skills** system where agents can use predefined approaches:

- Skills can be **per-agent** (in workspace's skills folder)
- Or **shared** (in ~/.openclaw/skills)

Skills help agents approach problems systematically - for example, a "Research" skill might guide the agent through structured information gathering.

## 2.6 How Tasks Flow in Openclaw

A typical interaction:

1. **User messages** via WhatsApp/Telegram/Discord
2. **Gateway receives** the message
3. **Binding lookup** finds the right agent
4. **Session restored** - agent sees conversation history
5. **Agent processes** - uses tools, calls LLM
6. **Response sent** back through the channel
7. **Session saved** for context continuity

## 2.7 API and Control

Openclaw provides multiple control interfaces:

| Interface | Access | Purpose |
|-----------|--------|---------|
| **Control UI** | Browser at 127.0.0.1:18789 | Dashboard for chat and config |
| **CLI** | `openclaw` command | Terminal management |
| **REST API** | HTTP endpoints | Programmatic access |
| **WebSocket** | ws://... | Real-time updates |

## 2.8 Mobile Nodes

Openclaw supports **mobile nodes** - iOS and Android devices that can pair with the Gateway. This enables:
- Push notifications
- Camera access
- Location services
- Canvas (interactive UI)

Users can pair their phone using a QR code flow.

---

# 3. System Architecture & Flow

## 3.1 High-Level Architecture

Wapple consists of multiple layers:

### 3.1.1 User Layer (Mobile App)
The mobile application provides four main interfaces:
- **Home (Mission Control)** - Dashboard with AI insights, active tasks, recommendations
- **Chats** - Direct conversation with agents
- **Projects** - File management from the VPS
- **Agents** - Monitor and manage individual agents

### 3.1.2 Backend Layer (API Gateway)
A central API server that:
- Authenticates users
- Manages subscriptions and credits
- Routes requests to the correct user VPS
- Handles billing through Stripe

### 3.1.3 Infrastructure Layer (Per-User VPS)
Each user gets their own VPS running:
- Docker container with Openclaw Gateway
- Their personalized workspace files
- Isolated from other users

### 3.1.4 External Services
- **OpenRouter** - Provides AI LLM capabilities
- **Stripe** - Payment processing
- **Cloud Providers** - DigitalOcean/AWS for VPS hosting

## 3.2 Communication Flows

### 3.2.1 User Sends a Message

1. Mobile app sends message to backend API
2. Backend validates user identity and credit balance
3. Backend forwards message to user's Openclaw VPS
4. Openclaw Gateway routes to appropriate agent
5. Agent processes and generates response
6. Response flows back: VPS → backend → mobile app

### 3.2.2 Real-Time Updates

The mobile app maintains a WebSocket connection to receive:
- Agent status changes
- Task completion notifications
- New file alerts
- Credit balance updates

---

# 4. Infrastructure & Provisioning

## 4.1 VPS Architecture

### 4.1.1 Why Per-User VPS?

Each Wapple subscriber gets a dedicated VPS because:
- **Isolation** - One user's issues don't affect others
- **Customization** - Each user can have unique agent configurations
- **Security** - Full control over their data
- **Performance** - Guaranteed resources

### 4.1.2 Tier Specifications

| Tier | Provider | CPU | RAM | Storage | Monthly Cost |
|------|----------|-----|-----|---------|--------------|
| **Starter** | DigitalOcean | 1 vCPU | 1GB | 25GB | $5 |
| **Pro** | DigitalOcean | 2 vCPU | 4GB | 50GB | $15 |
| **Premium** | AWS | 2 vCPU | 4GB | 100GB | $25 |

## 4.2 Provisioning Process

When a new user subscribes:

1. **Payment** - Stripe confirms payment
2. **VPS Creation** - Backend creates droplet/instance
3. **Docker Setup** - Install Docker on the VPS
4. **Openclaw Deployment** - Install Openclaw globally
5. **Configuration** - Generate user's openclaw.json with their agents
6. **Channel Setup** - (Optional) Configure Telegram/WhatsApp bots
7. **API Key Generation** - Create OpenRouter keys
8. **Testing** - Verify Gateway is reachable
9. **Activation** - Mark user as "ready"

This takes approximately 5-10 minutes.

## 4.3 User-Specific Openclaw Configuration

Each user's VPS gets a customized `openclaw.json`:

```json
{
  "agents": {
    "list": [
      {
        "id": "assistant",
        "workspace": "~/.openclaw/workspace",
        "model": "anthropic/claude-sonnet-4-5"
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
          "botToken": "user-unique-bot-token"
        }
      }
    }
  },
  "messages": {
    "groupChat": {
      "mentionPatterns": ["@assistant"]
    }
  }
}
```

### 4.3.1 User Workspace Files

The backend also generates workspace files based on onboarding:

**SOUL.md:**
```markdown
# SOUL.md - User Persona

**You are talking to:** [User Name]

## Communication Style
- Tone: [friendly/professional/casual]
- Detail level: [brief/detailed]

## What They Care About
- [Interest 1]
- [Interest 2]

## Goals
- [Goal 1]
- [Goal 2]
```

---

# 5. Backend Architecture

## 5.1 Service Architecture

The backend consists of five main services:

### 5.1.1 Auth Service
Handles:
- User registration and login
- JWT token generation and validation
- OAuth integration (Google, Apple)

### 5.1.2 Provisioning Service
Handles:
- Creating and destroying VPS instances
- Installing and configuring Openclaw
- Managing Gateway lifecycle

### 5.1.3 Credit Manager
Handles:
- Tracking credit balances
- Monitoring OpenRouter API usage
- Enforcing tier limits

### 5.1.4 File Sync Service
Handles:
- Polling user VPS for workspace files
- Streaming files to mobile app
- Managing file metadata

### 5.1.5 Agent Manager
Handles:
- Listing user's agents
- Managing agent configurations
- Viewing agent status

## 5.2 Database Schema

Core tables:
- **users** - User accounts
- **subscriptions** - Tier and billing
- **vps_instances** - VPS details
- **agents** - Agent configurations
- **credit_transactions** - Usage history
- **conversations** - Chat threads
- **files** - Synced workspace files

---

# 6. Frontend Architecture

## 6.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React Native (Expo) |
| **Language** | TypeScript |
| **State** | Zustand |
| **Navigation** | React Navigation |
| **Real-time** | Socket.io |

## 6.2 App Screens

### Home (Mission Control)
- Personalized greeting
- Quick action buttons
- AI insights and recommendations
- Active tasks list

### Chats
- Conversation list with agents
- Real-time messaging
- Message history

### Projects
- File browser for workspace
- Download and sync status
- Search and filter

### Agents
- Agent list with status
- Create new agents
- Configure agent settings

---

# 7. Core Algorithms & Logic

## 7.1 Credit Management

### 7.1.1 How Credits Work

Each subscription tier includes monthly credits:

| Tier | Monthly Credits | Cost |
|------|-----------------|------|
| Starter | 10,000 | $9.99 |
| Pro | 25,000 | $39.99 |
| Premium | 100,000 | $129.99 |

### 7.1.2 Credit Deduction Flow

When an AI agent responds:
1. Count input tokens (user message)
2. Count output tokens (AI response)
3. Look up model pricing per million tokens
4. Calculate cost and subtract from balance
5. Log transaction

### 7.1.3 Alerts
- At 80% usage: Show warning
- At 100%: Block requests until purchase

## 7.2 File Synchronization

The app syncs workspace files from user's VPS:

1. Backend SSHs into VPS periodically
2. Lists modified files in workspace
3. Compares with database
4. Notifies app of new/changed files
5. User can download files on demand

---

# 8. Security Architecture

## 8.1 Authentication

JWT-based auth with:
- Access tokens (15 min expiry)
- Refresh tokens (7 days)

## 8.2 VPS Security

Each user's VPS has:
- Firewall (SSH + HTTPS only)
- No direct user SSH access
- All access through app API

## 8.3 Rate Limiting

| Endpoint | Requests/Minute |
|----------|-----------------|
| Chat | 60 |
| Agents | 30 |
| Files | 20 |

---

# 9. Implementation Roadmap

## Phase 1: MVP (Weeks 1-4)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Foundation | Project setup, Auth, Database |
| 2 | Infrastructure | VPS provisioning, Openclaw setup |
| 3 | Mobile Core | Auth screens, navigation |
| 4 | Chat | Messaging interface |

## Phase 2: Core Features (Weeks 5-8)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 5 | Payments | Credit system, Stripe |
| 6 | Files | File sync, Projects |
| 7 | Agents | Agent management |
| 8 | Real-time | Push notifications |

## Phase 3: Polish (Weeks 9-12)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 9 | Onboarding | Preferences |
| 10 | Performance | Optimization |
| 11 | Security | Audit |
| 12 | Launch | Beta, release |

---

# Appendix A: Environment Variables

```bash
# Backend
NODE_ENV=production
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Cloud Providers
DO_API_TOKEN=...
AWS_ACCESS_KEY_ID=...

# AI
OPENROUTER_API_KEY=...

# Mobile
EXPO_PUBLIC_API_URL=https://api.wapple.io
EXPO_PUBLIC_WS_URL=wss://api.wapple.io
```

---

# Appendix B: API Endpoints Summary

## Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh

## Chat
- POST /api/chat/:id/messages

## Agents
- GET /api/agents
- POST /api/agents
- POST /api/agents/:id/task

## Credits
- GET /api/credits/balance
- POST /api/credits/purchase

## Files
- GET /api/files
- GET /api/files/:id/download

---

**Document Status:** Ready for Implementation  
**Version:** 1.2 (Vanilla Openclaw-based)  
**Next Review:** After Phase 1 completion
