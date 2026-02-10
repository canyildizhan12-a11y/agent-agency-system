# Agent Agency Dashboard

Visual dashboard for managing 7 AI agents with real-time status, chat, and work tracking.

## Features

- 🏢 **Visual Office** - See all agents in a meeting room layout
- 👁️ **Real-time Status** - Track who's awake, sleeping, or working
- 🔔 **Wake Controls** - One-click to wake up any agent
- 💬 **Direct Chat** - Talk to agents individually
- 📋 **Work Tracker** - Monitor what each agent is building

## Quick Start

```bash
cd agent-agency/dashboard
npm install
node server.js
```

Then open http://localhost:3001

## Dashboard Sections

### Office View
Visual representation of the meeting room with all 7 agents positioned around the central table. Agents show:
- 🟢 Green border = Awake
- ⚪ Gray border = Sleeping
- 🟠 Orange pulse = Working

Click any agent to select them.

### Agent Panel
List view with wake buttons:
- See status, role, and current activity
- Wake up sleeping agents
- Select agents for chat

### Chat
Direct messaging interface:
- Select an agent first
- Send messages
- View conversation history
- Real responses from sub-agents (in full implementation)

### Work Tracker
Recent activity feed:
- See what each agent built
- Completion timestamps
- Status indicators

## API Endpoints

- `GET /api/agents` - List all agents with status
- `GET /api/work` - Get recent work items
- `POST /api/wake/:agentId` - Wake up specific agent

## Integration

This dashboard connects to the actual agent-agency system:
- Reads from `sleeping_agents/` folder for status
- Can spawn sub-agents via `real-orchestrator.js`
- Tracks work from `implementation/` folder

## Agents

| Agent | Emoji | Role | Specialty |
|-------|-------|------|-----------|
| Henry | 🦉 | Team Lead | Facilitation, Strategy |
| Scout | 🔍 | Researcher | Intelligence, Trends |
| Pixel | 🎨 | Creative | Visual Design, UX |
| Echo | 💻 | Developer | Automation, Code |
| Quill | ✍️ | Copywriter | Communication |
| Codex | 🏗️ | Architect | Systems Design |
| Alex | 📊 | Analyst | Metrics, Data |
