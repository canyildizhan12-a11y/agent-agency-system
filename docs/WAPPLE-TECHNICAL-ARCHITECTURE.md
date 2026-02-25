# Wapple - Mobile AI Agent Superapp
## Technical Architecture & Implementation Document

**Version:** 1.0  
**Date:** 2026-02-25  
**Author:** Codex (Architecture)  
**Status:** Production Ready

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture & Flow](#2-system-architecture--flow)
3. [Infrastructure & Provisioning](#3-infrastructure--provisioning)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Core Algorithms & Logic](#6-core-algorithms--logic)
7. [Security Architecture](#7-security-architecture)
8. [Data Models & Schemas](#8-data-models--schemas)
9. [API Reference](#9-api-reference)
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

---

# 2. System Architecture & Flow

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER LAYER                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Home      │  │   Chats     │  │  Projects   │  │   Agents    │       │
│  │ (Mission    │  │ (Conver-    │  │  (File      │  │  (Manage-   │       │
│  │  Control)   │  │  sation)    │  │  Manager)   │  │   ment)     │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                 │                 │                 │              │
│         └─────────────────┴────────┬────────┴─────────────────┘              │
│                                    │                                        │
│                           ┌────────▼────────┐                                │
│                           │   React Native  │                                │
│                           │     Mobile      │                                │
│                           │      App        │                                │
│                           └────────┬────────┘                                │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │ HTTPS/WSS
┌────────────────────────────────────┼────────────────────────────────────────┐
│                           ┌────────▼────────┐       BACKEND LAYER          │
│                           │  API Gateway    │                               │
│                           │  (Node.js/      │                               │
│                           │   Express)      │                               │
│                           └────────┬────────┘                               │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │            │
│  ┌──────▼──────┐          ┌───────▼───────┐         ┌───────▼───────┐    │
│  │  Auth Svc   │          │ Provisioning   │         │   Credit      │    │
│  │  (JWT)      │          │    Service     │         │   Manager     │    │
│  └──────┬──────┘          └───────┬───────┘         └───────┬───────┘    │
│         │                          │                          │            │
│         │         ┌────────────────┼────────────────┐        │            │
│         │         │                │                │        │            │
│  ┌──────▼──────┐  │      ┌────────▼────────┐      │  ┌──────▼──────┐   │
│  │  Database   │◄─┼──────│   VPS Manager   │◄─────┼─►│  OpenRouter  │   │
│  │ (PostgreSQL)│  │      │   (Terraform)   │      │  │     API      │   │
│  └─────────────┘  │      └────────┬────────┘      │  └─────────────┘   │
│                   │               │                │                    │
│                   │      ┌────────▼────────┐      │                    │
│                   │      │  File Sync      │      │                    │
│                   │      │   Service       │      │                    │
│                   │      └────────┬────────┘      │                    │
│                   │               │                │                    │
│                   └───────────────┼────────────────┘                    │
│                                   │                                     │
│                          ┌────────▼────────┐                            │
│                          │   User's VPS    │◄─ Dedicated Openclaw       │
│                          │   (Per-User)    │◄─ Instance                 │
│                          │   DigitalOcean/ │                            │
│                          │   AWS           │                            │
│                          └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Communication Flows

### 2.2.1 User → Mobile App → Backend

```
User Action
    │
    ▼
Mobile App (React Native)
    │
    ├──► Local State (Zustand/Redux)
    │
    └──► API Gateway (HTTPS REST)
            │
            ├──► Auth Service (validate JWT)
            │
            ├──► Credit Manager (check/quota)
            │
            └──► VPS Manager (proxy to user instance)
                    │
                    └──► User's Openclaw VPS (SSH/API)
```

### 2.2.2 Real-Time Agent Updates

```
User's Openclaw VPS
    │
    ├──► WebSocket Connection (Socket.io)
    │
    ├──► Mobile App receives:
    │       ├── Agent status updates
    │       ├── Task completion notifications
    │       └── File sync alerts
    │
    └──► Backend stores session state
```

### 2.2.3 Credit Consumption Flow

```
User invokes AI agent
    │
    ▼
Mobile App → API: /api/chat/message
    │
    ▼
Backend validates:
    ├── JWT token (valid?)
    ├── Subscription (active?)
    └── Credits (sufficient?)
    │
    ├──► YES: Forward to Openclaw VPS
    │           │
    │           ├──► OpenRouter API (LLM)
    │           │
    │           ├──► Track token usage
    │           │
    │           └──► Deduct credits
    │
    └──► NO: Return error + upsell
```

---

# 3. Infrastructure & Provisioning

## 3.1 VPS Architecture

### 3.1.1 Per-User Isolation Model

Each subscriber gets a **dedicated VPS** running:
- Openclaw instance
- Docker container for isolation
- Pre-configured with user's preferences
- SSH/API access for management

### 3.1.2 VPS Specifications by Tier

| Tier | VPS Spec | CPU | RAM | Storage | Cost/Mo |
|------|----------|-----|-----|---------|---------|
| **Starter** | DigitalOcean Basic | 1 vCPU | 1GB | 25GB | $5 |
| **Pro** | DigitalOcean Standard | 2 vCPU | 4GB | 50GB | $15 |
| **Premium** | AWS t3.medium | 2 vCPU | 4GB | 100GB | $25 |

## 3.2 Provisioning Workflow

### 3.2.1 User Subscription Flow

```
1. User subscribes in app
       │
2. Payment processed (Stripe)
       │
3. Backend triggers provisioning:
   ┌─────────────────────────────────────────┐
   │  Provisioning Service                   │
   │  ├── 1. Select VPS provider (config)    │
   │  ├── 2. Create droplet/instance          │
   │  ├── 3. Install Docker                  │
   │  ├── 4. Pull Openclaw image             │
   │  ├── 5. Configure environment vars      │
   │  ├── 6. Generate unique API key         │
   │  ├── 7. Initialize .md configs           │
   │  ├── 8. Start Openclaw container        │
   │  └── 9. Test connectivity              │
   └─────────────────────────────────────────┘
       │
4. Store VPS details in database
       │
5. Send welcome email + VPN credentials
       │
6. Mobile app updates UI → "Ready"
```

### 3.2.2 VPS Teardown (Cancellation)

```
User cancels subscription
       │
30-day grace period (configurable)
       │
On expiration:
   ├── Stop Openclaw container
   ├── Backup user data (optional)
   ├── Destroy VPS instance
   ├── Release IP addresses
   └── Update database (status: terminated)
```

## 3.3 Infrastructure as Code

### 3.3.1 Terraform Configuration

```hcl
# main.tf (per-user module)
module "user_vps" {
  source = "./modules/vps"
  
  tier           = var.tier
  region         = var.region
  openclaw_version = var.openclaw_version
  
  tags = {
    Environment = "production"
    ManagedBy   = "wapple"
    Tenant      = var.user_id
  }
}

# modules/vps/main.tf (DigitalOcean provider)
resource "digitalocean_droplet" "openclaw" {
  image    = "docker-20-04"
  name     = "wapple-${var.user_id}"
  region   = var.region
  size     = var.tier == "starter" ? "s-1vcpu-1gb" : "s-2vcpu-4gb"
  
  user_data = <<-EOF
    #!/bin/bash
    docker run -d \
      --name openclaw-${var.user_id} \
      -p ${var.ssh_port}:22 \
      -e API_KEY=${var.openclaw_api_key} \
      -e USER_ID=${var.user_id} \
      openclaw/server:latest
  EOF
}
```

---

# 4. Backend Architecture

## 4.1 Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Express)                       │
│  - Rate limiting                                                  │
│  - Request validation                                            │
│  - JWT authentication                                            │
│  - SSL/TLS termination                                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
┌───▼────┐            ┌──────▼──────┐           ┌──────▼──────┐
│  Auth  │            │Provisioning │           │   Credit    │
│ Service│            │  Service     │           │  Manager    │
└───┬────┘            └──────┬───────┘           └──────┬──────┘
    │                         │                         │
    │            ┌────────────┼────────────┐            │
    │            │            │            │            │
┌───▼───────────▼────────────▼────────────▼────────────▼──────┐
│                     PostgreSQL Database                         │
│  - users, subscriptions, credits, vps_instances, agents       │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2 Key Services

### 4.2.1 Auth Service

**Responsibilities:**
- JWT token generation/validation
- User registration/login
- OAuth integration (Google, Apple)
- Session management

**Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

### 4.2.2 Provisioning Service

**Responsibilities:**
- VPS lifecycle management
- Docker container orchestration
- Openclaw initialization
- Health monitoring

**Endpoints:**
```
POST   /api/provisioning/create
GET    /api/provisioning/status/:userId
POST   /api/provisioning/rebuild
POST   /api/provisioning/stop
POST   /api/provisioning/start
DELETE /api/provisioning/terminate
```

### 4.2.3 Credit Manager

**Responsibilities:**
- Track credit balances
- Monitor API usage
- Tier quota enforcement
- Billing integration

**Endpoints:**
```
GET    /api/credits/balance
GET    /api/credits/usage
POST   /api/credits/purchase
GET    /api/credits/tiers
```

### 4.2.4 File Sync Service

**Responsibilities:**
- Poll user's VPS for new files
- Stream files to mobile app
- Manage file metadata
- Handle file previews

**Endpoints:**
```
GET    /api/files/list
GET    /api/files/:id/download
GET    /api/files/:id/metadata
DELETE /api/files/:id
```

### 4.2.5 Agent Manager

**Responsibilities:**
- List user's agents
- Create/update agent configs
- Cron job management
- Real-time status

**Endpoints:**
```
GET    /api/agents
GET    /api/agents/:id
POST   /api/agents
PUT    /api/agents/:id
DELETE /api/agents/:id
GET    /api/agents/:id/status
POST   /api/agents/:id/task
```

## 4.3 Database Schema

### 4.3.1 Core Tables

```sql
-- Users table
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    name            VARCHAR(100),
    avatar_url      TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    
    -- Auth
    provider        VARCHAR(20) DEFAULT 'email', -- 'google', 'apple', 'email'
    provider_id     VARCHAR(255),
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    tier            VARCHAR(20) NOT NULL, -- 'starter', 'pro', 'premium'
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Limits
    monthly_credits INTEGER DEFAULT 10000,
    credits_used    INTEGER DEFAULT 0,
    
    -- Period
    current_period_start TIMESTAMP,
    current_period_end   TIMESTAMP,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'active',
    created_at      TIMESTAMP DEFAULT NOW(),
    cancelled_at    TIMESTAMP
);

-- VPS Instances table
CREATE TABLE vps_instances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Provider details
    provider        VARCHAR(20) NOT NULL, -- 'digitalocean', 'aws'
    provider_id     VARCHAR(255), -- droplet ID / instance ID
    ip_address      INET,
    region          VARCHAR(20),
    
    -- Specs
    tier            VARCHAR(20),
    vcpus           INTEGER,
    memory_gb       INTEGER,
    storage_gb      INTEGER,
    
    -- Openclaw config
    openclaw_api_key    VARCHAR(255),
    ssh_port        INTEGER,
    container_id    VARCHAR(255),
    
    -- Status
    status          VARCHAR(20) DEFAULT 'provisioning', -- 'provisioning', 'running', 'stopped', 'terminated'
    
    created_at      TIMESTAMP DEFAULT NOW(),
    started_at      TIMESTAMP,
    terminated_at   TIMESTAMP
);

-- Agents table (user's Openclaw agents)
CREATE TABLE agents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    vps_id          UUID REFERENCES vps_instances(id) ON DELETE CASCADE,
    
    -- Agent definition
    name            VARCHAR(50) NOT NULL,
    role            VARCHAR(50), -- 'research', 'developer', 'creative', etc.
    emoji           VARCHAR(10),
    system_prompt   TEXT,
    
    -- Configuration
    model_preference VARCHAR(50),
    temperature     FLOAT DEFAULT 0.7,
    max_tokens      INTEGER DEFAULT 2048,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'idle', -- 'idle', 'working', 'sleeping'
    last_active_at  TIMESTAMP,
    
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Cron Jobs table
CREATE TABLE cron_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id        UUID REFERENCES agents(id) ON DELETE CASCADE,
    
    -- Job definition
    name            VARCHAR(100),
    schedule        VARCHAR(100), -- cron expression
    task            TEXT NOT NULL,
    
    -- Status
    enabled         BOOLEAN DEFAULT TRUE,
    last_run_at     TIMESTAMP,
    next_run_at     TIMESTAMP,
    status          VARCHAR(20) DEFAULT 'active',
    
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Credit Transactions table
CREATE TABLE credit_transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction details
    type            VARCHAR(20) NOT NULL, -- 'purchase', 'usage', 'refund', 'bonus'
    amount          INTEGER NOT NULL,
    balance_after   INTEGER NOT NULL,
    
    -- Source
    stripe_payment_id VARCHAR(255),
    
    -- Metadata
    description     TEXT,
    
    created_at      TIMESTAMP DEFAULT NOW()
);

-- API Usage Log table
CREATE TABLE api_usage_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Usage details
    provider        VARCHAR(20) NOT NULL, -- 'openrouter'
    model           VARCHAR(50) NOT NULL,
    input_tokens    INTEGER DEFAULT 0,
    output_tokens   INTEGER DEFAULT 0,
    total_tokens    INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
    
    -- Cost
    cost_cents      INTEGER DEFAULT 0,
    
    -- Context
    agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
    conversation_id UUID,
    
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
    
    -- Chat details
    title           VARCHAR(200),
    message_count   INTEGER DEFAULT 0,
    
    -- Context
    context         JSONB,
    
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content         TEXT NOT NULL,
    tokens          INTEGER,
    
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Files table (user's project files)
CREATE TABLE files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    vps_id          UUID REFERENCES vps_instances(id) ON DELETE CASCADE,
    
    -- File details
    name            VARCHAR(255) NOT NULL,
    path            TEXT NOT NULL,
    size_bytes      BIGINT,
    mime_type       VARCHAR(100),
    
    -- Metadata
    agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
    checksum        VARCHAR(64),
    
    -- Sync status
    synced_at       TIMESTAMP,
    local_path      TEXT,
    
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- User Preferences table
CREATE TABLE user_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Onboarding completed
    onboarding_complete BOOLEAN DEFAULT FALSE,
    
    -- Preference categories (JSONB)
    communication   JSONB DEFAULT '{"tone": "balanced", "format": "mixed"}',
    ai_behavior     JSONB DEFAULT '{"creativity": 0.7, "verbosity": "medium"}',
    notifications   JSONB DEFAULT '{"push": true, "email": true, "frequency": "instant"}',
    privacy         JSONB DEFAULT '{"share_analytics": true, "data_retention": "90_days"}',
    
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

## 4.4 Openclaw .md File Management

### 4.4.1 Dynamic Configuration Files

When a user completes onboarding, the backend generates these files on their VPS:

```
/home/ubuntu/.openclaw/workspace/
├── USER.md          # User identity & preferences
├── SOUL.md          # User persona & communication style
├── AGENTS.md        # Agent team structure
└── config/
    ├── tier.json    # Credit limits & quotas
    └── providers.json # API providers enabled
```

### 4.4.2 File Generation Service

```typescript
// services/config-generator.ts
class ConfigGenerator {
    
    async generateUserFiles(userId: string, preferences: UserPreferences): Promise<void> {
        const files = {
            'USER.md': this.generateUSERMd(preferences),
            'SOUL.md': this.generateSOULMd(preferences),
            'AGENTS.md': this.generateAGENTSMd(preferences),
            'config/tier.json': this.generateTierJson(userId),
            'config/providers.json': this.generateProvidersJson(userId)
        };
        
        // Upload to user's VPS via SSH
        for (const [filename, content] of Object.entries(files)) {
            await this.scpToVps(userId, filename, content);
        }
    }
    
    private generateUSERMd(prefs: UserPreferences): string {
        return `# USER.md - User Profile
        
**Name:** ${prefs.name}
**Timezone:** ${prefs.timezone}
**Language:** ${prefs.language}

## Communication Preferences
- Tone: ${pref.communication.tone}
- Detail level: ${pref.communication.verbosity}
- Format: ${pref.communication.format}

## Interests
${prefs.interests.map(i => `- ${i}`).join('\n')}

## Goals
${prefs.goals.map(g => `- ${g}`).join('\n')}

_Last Updated: ${new Date().toISOString()}_
`;
    }
    
    private generateSOULMd(prefs: UserPreferences): string {
        return `# SOUL.md - User Persona

**You are talking to:** ${prefs.name}

## Communication Style
- Tone: ${pref.tone}
- Be ${pref.detailLevel}
- Use ${pref.format}

## What They Care About
${prefs.careAbout.map(c => `- ${c}`).join('\n')}

## What They Don't Like
${prefs.dislike.map(d => `- ${d}`).join('\n')}

_Last Updated: ${new Date().toISOString()}_
`;
    }
}
```

---

# 5. Frontend Architecture

## 5.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React Native (Expo) | Cross-platform, faster dev |
| **Language** | TypeScript | Type safety |
| **State** | Zustand | Simpler than Redux, performant |
| **Navigation** | React Navigation 6 | Tab + Stack hybrid |
| **UI Components** | React Native Paper | Material Design 3 |
| **HTTP Client** | Axios | Interceptors, error handling |
| **WebSocket** | Socket.io-client | Real-time updates |
| **Storage** | MMKV | Fast key-value storage |
| **Forms** | React Hook Form | Performance |

## 5.2 App Structure

```
src/
├── App.tsx                    # Root component
├── navigation/
│   ├── RootNavigator.tsx      # Main navigation
│   ├── MainTabs.tsx           # Bottom tab navigator
│   └── types.ts               # Navigation types
├── screens/
│   ├── onboarding/
│   │   ├── WelcomeScreen.tsx
│   │   ├── PreferencesScreen.tsx
│   │   └── CompleteScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx     # Mission Control
│   ├── chats/
│   │   ├── ChatsListScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── projects/
│   │   ├── ProjectsListScreen.tsx
│   │   └── ProjectDetailScreen.tsx
│   └── agents/
│       ├── AgentsListScreen.tsx
│       ├── AgentDetailScreen.tsx
│       └── CreateAgentScreen.tsx
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   ├── agents/
│   │   ├── AgentCard.tsx
│   │   ├── AgentStatusBadge.tsx
│   │   └── TaskInput.tsx
│   ├── chats/
│   │   ├── MessageBubble.tsx
│   │   └── TypingIndicator.tsx
│   └── home/
│       ├── TaskCard.tsx
│       ├── InsightCard.tsx
│       └── QuickAction.tsx
├── services/
│   ├── api.ts                 # Axios instance
│   ├── auth.ts                # Auth methods
│   ├── socket.ts             # WebSocket manager
│   └── credits.ts             # Credit operations
├── stores/
│   ├── authStore.ts           # User auth state
│   ├── chatStore.ts           # Chat messages
│   ├── agentsStore.ts         # Agent list/status
│   ├── creditsStore.ts       # Credit balance
│   └── filesStore.ts          # Project files
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useCredits.ts
│   └── useAgents.ts
├── utils/
│   ├── format.ts
│   ├── validators.ts
│   └── constants.ts
└── types/
    ├── user.ts
    ├── agent.ts
    ├── message.ts
    └── file.ts
```

## 5.3 State Management (Zustand)

```typescript
// stores/chatStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
}

interface ChatState {
  conversations: Map<string, Message[]>;
  activeConversationId: string | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  receiveMessage: (message: Message) => void;
  loadConversation: (id: string) => Promise<void>;
  clearConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: new Map(),
  activeConversationId: null,
  
  sendMessage: async (content: string) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;
    
    // Add user message locally
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    set(state => {
      const conv = state.conversations.get(activeConversationId) || [];
      state.conversations.set(activeConversationId, [...conv, userMessage]);
    });
    
    // Send to API
    await api.post(`/chat/${activeConversationId}/messages`, { content });
  },
  
  receiveMessage: (message: Message) => {
    set(state => {
      const { activeConversationId } = state;
      if (!activeConversationId) return state;
      
      const conv = state.conversations.get(activeConversationId) || [];
      state.conversations.set(activeConversationId, [...conv, message]);
    });
  },
  
  loadConversation: async (id: string) => {
    const messages = await api.get(`/chat/${id}/messages`);
    set(state => {
      state.conversations.set(id, messages);
      state.activeConversationId = id;
    });
  },
  
  clearConversation: (id: string) => {
    set(state => state.conversations.delete(id));
  }
}));
```

## 5.4 Real-Time Updates (Socket.io)

```typescript
// services/socket.ts
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../stores/chatStore';
import { useAgentsStore } from '../stores/agentsStore';

class SocketManager {
  private socket: Socket | null = null;
  
  connect(userId: string, token: string): void {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      query: { userId }
    });
    
    this.setupListeners();
  }
  
  private setupListeners(): void {
    if (!this.socket) return;
    
    // Agent status updates
    this.socket.on('agent:status', (data) => {
      useAgentsStore.getState().updateAgentStatus(data);
    });
    
    // New messages
    this.socket.on('chat:message', (message) => {
      useChatStore.getState().receiveMessage(message);
    });
    
    // Task completion
    this.socket.on('task:completed', (task) => {
      // Show notification
      Notifications.show({
        title: 'Task Complete',
        body: task.description
      });
    });
    
    // File synced
    this.socket.on('file:synced', (file) => {
      useFilesStore.getState().addFile(file);
    });
  }
  
  disconnect(): void {
    this.socket?.disconnect();
  }
}

export const socketManager = new SocketManager();
```

## 5.5 UI Mockup Analysis

Based on the attached mockups, the app has these key screens:

### Screen 1: Home (Mission Control)
- **Header:** "Good morning, [Name]" with date
- **Greeting:** "How can I help you today?"
- **Action buttons:** Quick actions (Research, Create, Analyze, Chat)
- **Cards:** AI-powered insights and recommendations
- **Active tasks:** List of ongoing agent tasks with status
- **Bottom nav:** Home, Chats, Projects, Agents icons

### Screen 2: Chats
- **Header:** "Chats" with search icon
- **Chat list:** Avatar, name, last message preview, timestamp, unread badge
- **FAB:** New chat button (bottom right)
- **Agent icons:** Each agent has distinct emoji/avatar

### Screen 3: Projects
- **Header:** "Projects" with filter/sort options
- **Project cards:** Thumbnail, title, description, file count, last modified
- **Status indicators:** Syncing, synced, error states
- **FAB:** Create new project

### Screen 4: Agents
- **Header:** "Agents" with add button
- **Agent cards:** Avatar/emoji, name, role, status (active/idle/sleeping)
- **Status colors:** Green (active), Yellow (working), Gray (idle)
- **Actions:** Tap to view details, long-press for quick actions

---

# 6. Core Algorithms & Logic

## 6.1 Credit Management System

### 6.1.1 Credit Deduction Logic

```typescript
// services/credit-manager.ts
class CreditManager {
  
  /**
   * Deduct credits for API usage
   * Called after each LLM response
   */
  async deductForLLMUsage(
    userId: string,
    inputTokens: number,
    outputTokens: number,
    model: string
  ): Promise<{ success: boolean; remaining: number }> {
    
    // Get model's cost per 1M tokens
    const costPerM = MODEL_COSTS[model];
    const totalCost = ((inputTokens + outputTokens) / 1_000_000) * costPerM;
    
    // Get user's subscription tier
    const subscription = await db.subscriptions.findOne({ userId });
    
    // Check if user has enough credits
    const available = subscription.monthly_credits - subscription.credits_used;
    
    if (available < totalCost) {
      // Insufficient credits
      await this.handleInsufficientCredits(userId);
      return { success: false, remaining: available };
    }
    
    // Deduct credits
    await db.subscriptions.update(
      { userId },
      { 
        credits_used: subscription.credits_used + Math.ceil(totalCost)
      }
    );
    
    // Log transaction
    await db.credit_transactions.create({
      userId,
      type: 'usage',
      amount: -Math.ceil(totalCost),
      balance_after: subscription.monthly_credits - subscription.credits_used - Math.ceil(totalCost),
      description: `LLM: ${model} (${inputTokens + outputTokens} tokens)`
    });
    
    return { 
      success: true, 
      remaining: available - Math.ceil(totalCost) 
    };
  }
  
  /**
   * Calculate if user is approaching limit
   */
  async checkQuota(userId: string): Promise<{
    available: number;
    limit: number;
    percentage: number;
    shouldAlert: boolean;
  }> {
    const sub = await db.subscriptions.findOne({ userId });
    const available = sub.monthly_credits - sub.credits_used;
    const percentage = (sub.credits_used / sub.monthly_credits) * 100;
    
    return {
      available,
      limit: sub.monthly_credits,
      percentage: Math.round(percentage),
      shouldAlert: percentage >= 80
    };
  }
}

// Model pricing (per 1M tokens)
const MODEL_COSTS: Record<string, number> = {
  'anthropic/claude-3.5-sonnet': 3.00,
  'openai/gpt-4o': 15.00,
  'google/gemini-pro': 1.25,
  'mistralai/mixtral-8x7b': 0.24,
  // Default fallback
  'default': 5.00
};
```

### 6.1.2 Credit Purchase Flow

```typescript
// Stripe checkout session creation
async function createCreditPurchaseSession(
  userId: string,
  packageId: string
): Promise<string> {
  
  const pkg = CREDIT_PACKAGES[packageId];
  
  const session = await stripe.checkout.sessions.create({
    customer: await getStripeCustomerId(userId),
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: pkg.name,
          description: `${pkg.credits} AI Credits`
        },
        unit_amount: Math.round(pkg.price * 100)
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/credits/cancel`,
    metadata: {
      userId,
      credits: pkg.credits.toString(),
      packageId
    }
  });
  
  return session.url;
}

const CREDIT_PACKAGES = {
  starter: { name: 'Starter Pack', credits: 5000, price: 9.99 },
  pro: { name: 'Pro Pack', credits: 25000, price: 39.99 },
  premium: { name: 'Premium Pack', credits: 100000, price: 129.99 }
};
```

## 6.2 Cron Job Execution

### 6.2.1 User Cron Job Scheduling

```typescript
// services/cron-scheduler.ts
class CronScheduler {
  
  /**
   * Parse cron expression and calculate next run
   */
  parseCron(expression: string): { nextRun: Date; interval: string } {
    const cron = parser.parseExpression(expression);
    const nextRun = cron.next().toDate();
    
    return {
      nextRun,
      interval: this.getHumanInterval(expression)
    };
  }
  
  /**
   * Execute a user's cron job on their VPS
   */
  async executeCronJob(jobId: string): Promise<void> {
    const job = await db.cron_jobs.findOne({ id: jobId });
    const vps = await db.vps_instances.findOne({ id: job.vps_id });
    
    // Connect to user's VPS via SSH
    const ssh = await this.getSSHConnection(vps);
    
    // Execute the Openclaw command
    const result = await ssh.exec(
      `docker exec openclaw-${job.user_id} openclaw run --task "${job.task}"`
    );
    
    // Log execution
    await db.cron_jobs.update(jobId, {
      last_run_at: new Date(),
      next_run_at: this.calculateNextRun(job.schedule)
    });
    
    // Notify user if configured
    if (job.notify_on_complete) {
      await notifications.send(job.user_id, {
        title: 'Scheduled Task Complete',
        body: job.name
      });
    }
  }
  
  /**
   * Background worker that checks and executes due cron jobs
   */
  startCronWorker(): void {
    setInterval(async () => {
      const dueJobs = await db.cron_jobs.find({
        enabled: true,
        next_run_at: { $lte: new Date() }
      });
      
      for (const job of dueJobs) {
        this.executeCronJob(job.id).catch(err => {
          console.error(`Cron job ${job.id} failed:`, err);
        });
      }
    }, 60000); // Check every minute
  }
}
```

## 6.3 File Synchronization

### 6.3.1 VPS to Mobile File Sync

```typescript
// services/file-sync.ts
class FileSyncService {
  
  /**
   * Poll user's VPS for new/modified files
   */
  async syncFiles(userId: string): Promise<File[]> {
    const vps = await db.vps_instances.findOne({ userId });
    const ssh = await this.getSSHConnection(vps);
    
    // List files in workspace
    const remoteFiles = await ssh.exec(
      `docker exec openclaw-${userId} find /home/ubuntu/.openclaw/workspace -type f -mmin -60`
    );
    
    const fileList = remoteFiles.stdout.split('\n').filter(Boolean);
    const newFiles: File[] = [];
    
    for (const filePath of fileList) {
      // Check if file exists in our DB
      const existing = await db.files.findOne({ 
        userId, 
        path: filePath 
      });
      
      if (!existing) {
        // New file - add to database
        const fileInfo = await this.getFileInfo(ssh, filePath);
        const file = await db.files.create({
          userId,
          vps_id: vps.id,
          ...fileInfo
        });
        newFiles.push(file);
      } else {
        // Check if modified
        const currentChecksum = await this.getChecksum(ssh, filePath);
        if (currentChecksum !== existing.checksum) {
          await db.files.update(existing.id, {
            checksum: currentChecksum,
            synced_at: new Date()
          });
        }
      }
    }
    
    return newFiles;
  }
  
  /**
   * Stream file download from VPS to mobile
   */
  async downloadFile(fileId: string, onProgress: (percent: number) => void): Promise<Blob> {
    const file = await db.files.findOne({ id: fileId });
    const vps = await db.vps_instances.findOne({ id: file.vps_id });
    
    // Create SSH tunnel for streaming
    const ssh = await this.getSSHConnection(vps);
    
    return new Promise((resolve, reject) => {
      const stream = ssh.scp.read(file.path, (err, stream) => {
        if (err) return reject(err);
        
        const chunks: Buffer[] = [];
        let downloaded = 0;
        
        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
          downloaded += chunk.length;
          onProgress((downloaded / file.size_bytes) * 100);
        });
        
        stream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });
      });
    });
  }
}
```

---

# 7. Security Architecture

## 7.1 Authentication & Authorization

### 7.1.1 JWT Token Flow

```
User Login
    │
    ▼
Backend validates credentials
    │
    ▼
Generate JWT tokens:
├── Access Token (15 min expiry)
│   └── Used for API requests
└── Refresh Token (7 days expiry)
    └── Used to get new access tokens
    │
    ▼
Store refresh token in httpOnly cookie
    │
    ▼
Client stores access token in memory (Zustand)
```

### 7.1.2 Token Structure

```typescript
// Access Token Payload
interface AccessToken {
  sub: string;        // userId
  email: string;
  tier: 'starter' | 'pro' | 'premium';
  iat: number;
  exp: number;
}

// Refresh Token Payload
interface RefreshToken {
  sub: string;
  type: 'refresh';
  iat: number;
  exp: number;
}
```

## 7.2 API Security

### 7.2.1 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/chat/*` | 60 | 1 minute |
| `/api/agents/*` | 30 | 1 minute |
| `/api/files/*` | 20 | 1 minute |
| `/api/credits/*` | 10 | 1 minute |

### 7.2.2 Request Validation

```typescript
// middleware/validate.ts
const chatMessageSchema = z.object({
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(10000, 'Message too long'),
  agentId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional()
});

function validateChatMessage(req: Request, res: Response, next: NextFunction) {
  const result = chatMessageSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues
    });
  }
  
  req.validated = result.data;
  next();
}
```

## 7.3 VPS Security

### 7.3.1 Network Isolation

```
User's VPS
    │
    ├── Firewall (UFW)
    │       ├── 22   (SSH) - Limited to backend IP
    │       ├── 443  (HTTPS) - Openclaw API
    │       └── 80   (HTTP) - Redirect to HTTPS
    │
    ├── Container isolation (Docker)
    │       └── Each user in separate container
    │
    └── No direct SSH for users
            └── All access via mobile app API
```

---

# 8. Data Models & Schemas

## 8.1 API Response Types

```typescript
// src/types/api.ts

// Generic API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// User
interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  subscription: Subscription;
  credits: CreditInfo;
}

// Subscription
interface Subscription {
  tier: 'starter' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: Date;
  creditsRemaining: number;
  creditsUsed: number;
}

// Agent
interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: 'idle' | 'working' | 'sleeping';
  currentTask?: Task;
  lastActiveAt: Date;
  modelPreference: string;
  config: AgentConfig;
}

// Conversation
interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// Message
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
  tokens?: number;
}

// Project File
interface ProjectFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  agentId?: string;
  syncedAt: Date;
  status: 'synced' | 'syncing' | 'error';
}

// Task
interface Task {
  id: string;
  agentId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  createdAt: Date;
  completedAt?: Date;
}
```

---

# 9. API Reference

## 9.1 Authentication

### POST /api/auth/register
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### POST /api/auth/login
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

## 9.2 Chat

### POST /api/chat/:conversationId/messages
Send a message to an agent.

**Request:**
```json
{
  "content": "Research the latest AI developments",
  "agentId": "agent-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-uuid",
      "role": "assistant",
      "content": "I'll research that for you...",
      "timestamp": "2026-02-25T12:00:00Z"
    },
    "creditsUsed": 150
  }
}
```

## 9.3 Agents

### GET /api/agents
List user's agents.

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "uuid",
        "name": "Scout",
        "role": "Research",
        "emoji": "🔍",
        "status": "idle"
      }
    ]
  }
}
```

### POST /api/agents/:id/task
Assign task to agent.

**Request:**
```json
{
  "task": "Find information about X",
  "schedule": "now" | "cron: 0 9 * * *"
}
```

## 9.4 Credits

### GET /api/credits/balance
Get current credit balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 8500,
    "limit": 10000,
    "percentageUsed": 15,
    "resetDate": "2026-03-01T00:00:00Z"
  }
}
```

---

# 10. Implementation Roadmap

## Phase 1: MVP (Weeks 1-4)

| Week | Tasks |
|------|-------|
| 1 | Project setup, Auth service, Database schema |
| 2 | VPS provisioning, Openclaw Docker image |
| 3 | Mobile app - Auth screens, basic navigation |
| 4 | Mobile app - Chat interface, agent list |

## Phase 2: Core Features (Weeks 5-8)

| Week | Tasks |
|------|-------|
| 5 | Credit system, Stripe integration |
| 6 | File sync, Projects screen |
| 7 | Cron jobs, Agent management |
| 8 | Push notifications, Real-time updates |

## Phase 3: Polish (Weeks 9-12)

| Week | Tasks |
|------|-------|
| 9 | Onboarding flow, Preferences |
| 10 | Performance optimization |
| 11 | Security audit |
| 12 | Beta testing, Bug fixes |

---

# Appendices

## A. Environment Variables

```bash
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# VPS Providers
DO_API_TOKEN=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# OpenRouter
OPENROUTER_API_KEY=...

# Mobile App
EXPO_PUBLIC_API_URL=https://api.wapple.io
EXPO_PUBLIC_WS_URL=wss://api.wapple.io
```

## B. Docker Configuration (Openclaw VPS)

```dockerfile
# Dockerfile for user Openclaw instance
FROM node:20-alpine

WORKDIR /app

# Install Openclaw
RUN npm install -g openclaw

# Copy user-specific config
COPY config/ ./config/

# Expose API port
EXPOSE 3000

CMD ["openclaw", "start"]
```

## C. Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| AUTH_INVALID | Invalid credentials | 401 |
| AUTH_EXPIRED | Token expired | 401 |
| CREDITS_INSUFFICIENT | Not enough credits | 402 |
| VPS_NOT_READY | VPS still provisioning | 503 |
| AGENT_BUSY | Agent is currently busy | 409 |
| FILE_TOO_LARGE | File exceeds size limit | 413 |

---

**Document Status:** Ready for Implementation  
**Next Review:** After Phase 1 completion  
**Questions:** Reference this document or contact Architecture team
