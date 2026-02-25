# Wapple - Mobile AI Agent Superapp
## Technical Architecture & Implementation Document

**Version:** 1.1  
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
9. [Data Models & Schemas](#9-data-models--schemas)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

# 1. Executive Summary

## 1.1 Project Overview

**Wapple** is a mobile superapp that transforms Openclaw from a technical Telegram-based tool into a mainstream, 24/7 autonomous personal AI ecosystem accessible from a smartphone.

## 1.2 Core Value Proposition

> "A 24/7 active AI agent environment that lives in your pocket and executes tasks on your behalf."

## 1.3 Key Statistics

| Metric | Value |
|--------|-------|
| Target Users | Individual professionals, entrepreneurs, small teams |
| Platform | iOS & Android (React Native) |
| Deployment | Per-user dedicated VPS instances |
| AI Engine | OpenRouter (multi-provider) |

## 1.4 What This Document Covers

This document provides a comprehensive blueprint for building Wapple, a mobile wrapper around Openclaw. It explains:
- How Openclaw works (for AI agents unfamiliar with it)
- How the mobile app communicates with Openclaw instances
- How to provision and manage user VPS instances
- How credit systems and billing work
- How to build the mobile interface

---

# 2. Understanding Openclaw

This section provides a comprehensive explanation of Openclaw for any AI agent or developer who may not be familiar with it.

## 2.1 What is Openclaw?

Openclaw is a multi-agent AI orchestration framework that allows multiple specialized AI agents to work together on complex tasks. Think of it as an "AI team" where each agent has a specific role, and they collaborate to accomplish goals.

## 2.2 Openclaw's Architecture

### 2.2.1 The Agent Model

Openclaw operates with **8 distinct agents**, each with a specialized role:

| Agent | Role | What They Do |
|-------|------|--------------|
| **Henry** | Team Lead | Coordinates other agents, runs meetings, facilitates collaboration |
| **Scout** | Research | Finds information, monitors trends, gathers intelligence |
| **Pixel** | Creative | Handles visual design, UI/UX, aesthetics |
| **Echo** | Developer | Writes code, implements features, fixes bugs |
| **Quill** | Documentation | Writes docs, maintains knowledge base, creates guides |
| **Codex** | Architecture | Designs systems, plans technical approaches |
| **Alex** | Security | Monitors safety, enforces policies, handles compliance |
| **Vega** | Data Analysis | Analyzes metrics, tracks KPIs, generates insights |

### 2.2.2 How Agents Communicate

Agents in Openclaw communicate through several mechanisms:

1. **Direct Messaging** - One agent can send messages to another directly
2. **Standup Meetings** - Scheduled bi-daily meetings (morning and evening) where all agents discuss progress
3. **Shared Memory** - All agents can access a shared consciousness system where information is stored
4. **Sub-agents** - Agents can spawn smaller focused agents for specific tasks

### 2.2.3 The File System Structure

Each Openclaw instance has a standardized workspace structure:

```
/home/ubuntu/.openclaw/
├── workspace/
│   ├── agent-workspaces/
│   │   ├── henry/      # Henry's personal workspace
│   │   ├── scout/      # Scout's personal workspace
│   │   ├── pixel/      # Pixel's personal workspace
│   │   ├── echo/       # Echo's personal workspace
│   │   ├── quill/      # Quill's personal workspace
│   │   ├── codex/      # Codex's personal workspace
│   │   ├── alex/       # Alex's personal workspace
│   │   └── vega/       # Vega's personal workspace
│   │
│   ├── agent-agency/   # Core system files
│   │   ├── AGENCY_HANDBOOK.md    # Operating standards
│   │   ├── immune-system/         # Security policies
│   │   │   └── policies/
│   │   │       └── core-policies.yaml
│   │   ├── feedback-loop.md       # User feedback integration
│   │   ├── laziness-engine.md     # Self-correction system
│   │   └── routine-verification.md
│   │
│   └── memory/         # Long-term storage
│
└── skillbank/          # Skill reinforcement system
    └── skills.json     # Defines available skills
```

### 2.2.4 Configuration Files

Each agent's behavior is defined by markdown files in their workspace:

| File | Purpose |
|------|---------|
| **SOUL.md** | Defines the agent's persona, communication style |
| **USER.md** | Information about the human user |
| **IDENTITY.md** | Technical identity (name, role, expertise) |
| **AGENTS.md** | Reference to team structure and protocols |
| **HEARTBEAT.md** | Proactive task checklist |
| **MEMORY.md** | Historical context and past interactions |
| **SKILLRL.md** | Skill reinforcement learning settings |

### 2.2.5 How Tasks Get Done

A typical task flow in Openclaw:

1. **User Request** - Human gives a task (e.g., "Research AI coding tools")
2. **Wake** - Relevant agent wakes up (Scout for research)
3. **Skill Selection** - Agent checks skills.json for relevant approaches
4. **Execution** - Agent performs the task using available tools
5. **Memory** - Results are stored in shared memory
6. **Sleep** - Agent returns to idle state

### 2.2.6 The Skill System (SkillRL)

Openclaw uses a **Skill Reinforcement Learning** system where skills improve through usage:

- **General Skills** - Apply to any task (e.g., "Break Down Complex Tasks", "Verify Before Acting")
- **Task-Specific Skills** - Apply to specific domains (e.g., research skills, coding skills)

Each skill tracks:
- Usage count (how often applied)
- Success count (how often effective)
- Failure count (how often didn't work)

### 2.2.7 Security (The Immune System)

Openclaw has a built-in security system called the "Immune System" that operates on three zones:

| Zone | Risk Level | Behavior |
|------|-------------|----------|
| **GREEN** | Low | Agent can proceed with just logging |
| **YELLOW** | Medium | Agent proceeds but must alert and monitor |
| **RED** | High | Agent is BLOCKED, must escalate to human |

### 2.2.8 Automation (Cron Jobs)

Openclaw supports scheduled tasks through cron jobs:

- Morning standup at 09:00 TRT
- Evening standup at 17:00 TRT
- Intelligence monitoring at 08:00 TRT
- Security reports at 20:00 TRT

### 2.2.9 How Mobile Apps Connect to Openclaw

To connect a mobile app to Openclaw:

1. **API Server** - Openclaw exposes an API (typically on port 3000)
2. **WebSocket** - Real-time updates via WebSocket connections
3. **File Access** - SSH/SCP to access workspace files
4. **Agent Communication** - Send messages to agents via the API

The mobile app acts as a **remote control and display layer** for Openclaw - it doesn't replace Openclaw's internal architecture, it provides a friendlier interface to it.

---

# 3. System Architecture & Flow

## 3.1 High-Level Architecture

Wapple consists of multiple layers working together:

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
- A Docker container with Openclaw
- Their personalized configuration files
- Isolated from other users

### 3.1.4 External Services
- **OpenRouter** - Provides AI LLM capabilities
- **Stripe** - Payment processing
- **Cloud Providers** - DigitalOcean/AWS for VPS hosting

## 3.2 Communication Flows

### 3.2.1 User Sends a Message

When a user types a message in the mobile app:

1. The mobile app sends the message to the backend API
2. The backend validates the user's identity and credit balance
3. The backend forwards the message to the user's Openclaw VPS via SSH/API
4. Openclaw routes the message to the appropriate agent
5. The agent processes the task and generates a response
6. The response flows back through the VPS → backend → mobile app

### 3.2.2 Real-Time Updates

The mobile app maintains a WebSocket connection to receive:
- Agent status changes (idle → working → idle)
- Task completion notifications
- New file alerts
- Credit balance updates

### 3.2.3 Credit Consumption

Every time an AI agent generates a response:
- The backend calculates token usage (input + output)
- Credits are deducted from the user's balance
- The transaction is logged for billing history

---

# 4. Infrastructure & Provisioning

## 4.1 VPS Architecture

### 4.1.1 Why Per-User VPS?

Each Wapple subscriber gets a dedicated VPS because:
- **Isolation** - One user's issues don't affect others
- **Customization** - Each user can have unique agent configurations
- **Security** - Full control over their data and agents
- **Performance** - Guaranteed resources, no shared contention

### 4.1.2 Tier Specifications

| Tier | Provider | CPU | RAM | Storage | Monthly Cost |
|------|----------|-----|-----|---------|--------------|
| **Starter** | DigitalOcean | 1 vCPU | 1GB | 25GB | $5 |
| **Pro** | DigitalOcean | 2 vCPU | 4GB | 50GB | $15 |
| **Premium** | AWS | 2 vCPU | 4GB | 100GB | $25 |

## 4.2 Provisioning Process

When a new user subscribes:

1. **Payment** - Stripe confirms payment
2. **VPS Creation** - Backend creates a new droplet/instance
3. **Docker Setup** - Install Docker on the VPS
4. **Openclaw Deployment** - Pull and run Openclaw container
5. **Configuration** - Generate user-specific .md files based on onboarding
6. **API Key Generation** - Create unique key for the user
7. **Testing** - Verify the instance is reachable
8. **Activation** - Mark user as "ready" in the database

This entire process takes approximately 5-10 minutes.

## 4.3 Teardown Process

When a user cancels:

1. **Grace Period** - 30 days before actual deletion (configurable)
2. **Backup** - Offer to download user data
3. **Container Stop** - Gracefully stop Openclaw
4. **Instance Destroy** - Delete the VPS
5. **Database Cleanup** - Mark as terminated

## 4.4 Infrastructure Management

The backend uses Infrastructure as Code principles:
- VPS creation/deletion is automated
- Configuration is versioned
- Health checks run continuously
- Failed provisioning auto-retries

---

# 5. Backend Architecture

## 5.1 Service Architecture

The backend consists of five main services:

### 5.1.1 Auth Service
Handles:
- User registration and login
- JWT token generation and validation
- OAuth integration (Google, Apple)
- Session management

### 5.1.2 Provisioning Service
Handles:
- Creating and destroying VPS instances
- Monitoring VPS health
- Managing Docker containers
- Running Openclaw initialization scripts

### 5.1.3 Credit Manager
Handles:
- Tracking credit balances
- Monitoring API usage
- Enforcing tier limits
- Processing Stripe payments

### 5.1.4 File Sync Service
Handles:
- Polling user VPS for new files
- Streaming files to mobile app
- Generating file previews
- Managing file metadata

### 5.1.5 Agent Manager
Handles:
- Listing user's agents
- Managing agent configurations
- Scheduling cron jobs
- Tracking agent status

## 5.2 Database Schema

The system uses PostgreSQL with the following core tables:

- **users** - User accounts and profiles
- **subscriptions** - Tier, billing status, credit limits
- **vps_instances** - VPS details, status, provider info
- **agents** - User's Openclaw agent configurations
- **cron_jobs** - Scheduled tasks
- **credit_transactions** - Purchase and usage history
- **api_usage_logs** - Detailed AI API usage
- **conversations** - Chat threads
- **messages** - Individual messages
- **files** - Synced project files
- **user_preferences** - Onboarding and settings

---

# 6. Frontend Architecture

## 6.1 Technology Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | React Native (Expo) | Cross-platform, faster development |
| **Language** | TypeScript | Type safety reduces bugs |
| **State** | Zustand | Simpler than Redux, excellent performance |
| **Navigation** | React Navigation | Supports tabs and stacks |
| **UI Components** | React Native Paper | Material Design 3 components |
| **HTTP** | Axios | Great interceptors and error handling |
| **Real-time** | Socket.io | WebSocket connections |
| **Storage** | MMKV | Very fast key-value storage |

## 6.2 App Structure

The mobile app is organized into these main screens:

### Home (Mission Control)
The main dashboard showing:
- Personalized greetings ("Good morning, [Name]")
- Quick action buttons (Research, Create, Analyze, Chat)
- AI-generated insights and recommendations
- List of active tasks with status

### Chats
Conversational interface featuring:
- List of conversations with agents
- Real-time messaging with typing indicators
- Agent avatars and status
- Message history

### Projects
File management interface with:
- Grid/list view of project files
- File previews and thumbnails
- Download and sync status
- Search and filter options

### Agents
Agent management hub displaying:
- All 8 agents with their status
- Ability to create new agents
- Configuration options per agent
- Task assignment interface
- Cron job scheduling

## 6.3 Real-Time Updates

The app maintains a persistent WebSocket connection to receive:
- Agent status changes
- New messages
- Task completion alerts
- File sync notifications
- Credit balance updates

---

# 7. Core Algorithms & Logic

## 7.1 Credit Management

### 7.1.1 How Credits Work

Each subscription tier includes a monthly credit allowance:

| Tier | Monthly Credits | Cost |
|------|-----------------|------|
| Starter | 10,000 | $9.99 |
| Pro | 25,000 | $39.99 |
| Premium | 100,000 | $129.99 |

### 7.1.2 Credit Deduction

When an AI agent responds to a user:

1. Count input tokens (user's message)
2. Count output tokens (AI's response)
3. Look up the model's price per million tokens
4. Calculate cost: (total tokens / 1,000,000) × price
5. Subtract from user's balance
6. Log the transaction

### 7.1.3 Credit Alerts

- At 80% usage: Show warning banner
- At 100%: Block new AI requests until purchase

### 7.1.4 Purchasing Credits

Users can buy additional credit packs through Stripe:
- Starter Pack: $9.99 for 5,000 credits
- Pro Pack: $39.99 for 25,000 credits
- Premium Pack: $129.99 for 100,000 credits

## 7.2 Cron Job Execution

### 7.2.1 How Cron Jobs Work

Users can schedule recurring tasks:

1. User defines task and schedule (e.g., "Research AI news daily at 8am")
2. Backend calculates next run time
3. Background worker checks every minute for due jobs
4. When due, connects to user's VPS via SSH
5. Executes Openclaw command with the task
6. Logs completion and schedules next run

### 7.2.2 Built-in Cron Jobs

Openclaw includes default scheduled tasks:
- Morning standup (09:00)
- Evening standup (17:00)
- Intelligence sweep (08:00)
- Security report (20:00)

## 7.3 File Synchronization

### 7.3.1 How File Sync Works

The app needs to show files from the user's VPS:

1. Backend SSHs into VPS every few minutes
2. Lists files modified in workspace
3. Compares with database records
4. For new files: add to database, notify app
5. For changed files: update checksum, notify app

### 7.3.2 File Downloads

When user wants to download a file:
1. App requests file from backend
2. Backend streams via SCP through SSH
3. Progress updates sent to app
4. File saved to device storage

---

# 8. Security Architecture

## 8.1 Authentication

### 8.1.1 JWT-Based Auth

The system uses JSON Web Tokens:
- **Access Token** - Short-lived (15 minutes), used for API requests
- **Refresh Token** - Long-lived (7 days), used to get new access tokens

### 8.1.2 OAuth Support

Users can sign in with:
- Email and password
- Google account
- Apple ID

## 8.2 API Security

### 8.2.1 Rate Limiting

Different endpoints have different limits:

| Endpoint | Requests/Minute |
|----------|-----------------|
| Chat messages | 60 |
| Agent operations | 30 |
| File operations | 20 |
| Credit operations | 10 |

### 8.2.2 Input Validation

All user input is validated:
- Message length limits
- Proper data types
- SQL injection prevention
- XSS protection

## 8.3 VPS Security

Each user's VPS has:
- Firewall only allowing SSH and HTTPS
- All access through the mobile app API
- No direct user SSH access
- Docker container isolation

---

# 9. Data Models

## 9.1 User Data

The system stores:
- Profile information (name, email, avatar)
- Subscription details (tier, status, period)
- Credit balance and usage history
- Onboarding preferences

## 9.2 Agent Data

Each user's Openclaw agents store:
- Agent name and role
- System prompt customization
- Model preferences
- Temperature and token settings
- Current status

## 9.3 Conversation Data

Chat history includes:
- Messages with timestamps
- Token counts per message
- Agent attribution
- Context for continuity

## 9.4 File Data

Project files track:
- File name and path
- Size and type
- Sync status
- Agent that created it

---

# 10. Implementation Roadmap

## Phase 1: MVP (Weeks 1-4)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Foundation | Project setup, Auth service, Database |
| 2 | Infrastructure | VPS provisioning, Openclaw Docker setup |
| 3 | Mobile Core | Auth screens, navigation, basic UI |
| 4 | Chat | Messaging interface, agent communication |

## Phase 2: Core Features (Weeks 5-8)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 5 | Payments | Credit system, Stripe integration |
| 6 | Files | File sync, Projects screen |
| 7 | Automation | Cron jobs, Agent management |
| 8 | Real-time | Push notifications, live updates |

## Phase 3: Polish (Weeks 9-12)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 9 | Onboarding | Preference collection, personalization |
| 10 | Performance | Optimization, caching |
| 11 | Security | Audit, penetration testing |
| 12 | Launch | Beta testing, bug fixes, release |

---

# Appendix A: Environment Variables

The system requires these environment variables:

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
AWS_SECRET_ACCESS_KEY=...

# AI
OPENROUTER_API_KEY=...

# Mobile App
EXPO_PUBLIC_API_URL=https://api.wapple.io
EXPO_PUBLIC_WS_URL=wss://api.wapple.io
```

---

# Appendix B: Error Handling

| Error Code | Meaning | Resolution |
|------------|---------|-------------|
| AUTH_INVALID | Wrong credentials | User should reset password |
| AUTH_EXPIRED | Token expired | Re-authenticate |
| CREDITS_INSUFFICIENT | No credits left | Purchase more credits |
| VPS_NOT_READY | Still provisioning | Wait 10 minutes |
| AGENT_BUSY | Agent is working | Try again later |
| FILE_TOO_LARGE | Exceeds limit | Use smaller file |

---

# Appendix C: API Endpoints Summary

## Authentication
- POST /api/auth/register - Create account
- POST /api/auth/login - Sign in
- POST /api/auth/refresh - Get new token
- GET /api/auth/me - Get current user

## Chat
- POST /api/chat/:id/messages - Send message
- GET /api/chat/:id/messages - Get history

## Agents
- GET /api/agents - List agents
- POST /api/agents - Create agent
- PUT /api/agents/:id - Update agent
- POST /api/agents/:id/task - Assign task

## Credits
- GET /api/credits/balance - Check balance
- GET /api/credits/usage - View history
- POST /api/credits/purchase - Buy credits

## Files
- GET /api/files - List files
- GET /api/files/:id/download - Download file

---

**Document Status:** Ready for Implementation  
**Version:** 1.1 (Explanation-Based)  
**Next Review:** After Phase 1 completion
