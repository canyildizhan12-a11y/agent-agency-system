# 🦉 Agent Agency Dashboard

Visual dashboard for managing 7 AI agents with real-time status, chat, and work tracking.

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/canyildizhan12-a11y/agent-agency)

Or manually:

```bash
# 1. Clone the repo
git clone https://github.com/canyildizhan12-a11y/agent-agency.git

# 2. Navigate to dashboard
cd agent-agency/dashboard

# 3. Install dependencies
npm install

# 4. Deploy to Vercel
vercel --prod
```

## 📁 Project Structure

```
dashboard/
├── pages/
│   ├── index.tsx          # Main dashboard UI
│   └── api/
│       ├── agents.ts      # Get agent status
│       ├── work.ts        # Get work history
│       └── wake.ts        # Wake up agent
├── package.json
├── next.config.js
├── tsconfig.json
└── vercel.json
```

## ✨ Features

- 🏢 **Visual Office** - See all 7 agents in a meeting room
- 👁️ **Real-time Status** - Who's awake, sleeping, or working
- 🔔 **Wake Controls** - One-click to wake any agent
- 💬 **Direct Chat** - Talk to agents individually
- 📋 **Work Tracker** - Monitor what each agent built

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all agents with status |
| `/api/work` | GET | Get recent work items |
| `/api/wake?id={agent}` | POST | Wake up specific agent |

## 🎨 Dashboard Sections

### Office View
Visual meeting room with agents positioned around the central table:
- 🟢 **Green border** = Awake
- ⚪ **Gray border** = Sleeping  
- 🟠 **Orange pulse** = Working

Click any agent to select them.

### Agent Panel
- See all agents with status and roles
- Wake up sleeping agents
- Select agents for direct chat

### Chat Interface
- Send messages to selected agents
- View conversation history
- Real-time responses

### Work Tracker
- Recent builds by each agent
- Completion timestamps
- Status indicators

## 🛠️ Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Start production server
```

## 📱 Responsive

Dashboard works on desktop and tablet. Mobile layout stacks the panels vertically.

## 🔗 Integration

The dashboard reads from the agent-agency system:
- `sleeping_agents/` folder for current status
- `implementation/` folder for work history
- Can spawn sub-agents via API routes

## 📝 Environment Variables

None required for basic deployment. The dashboard reads agent data from the filesystem.

For production with persistent storage, you may want to configure:
- `AGENCY_DIR` - Path to agent-agency data

## 👥 Agents

| Agent | Emoji | Role | Specialty |
|-------|-------|------|-----------|
| Henry | 🦉 | Team Lead | Strategy, Facilitation |
| Scout | 🔍 | Researcher | Intelligence, Trends |
| Pixel | 🎨 | Creative | Visual Design, UX |
| Echo | 💻 | Developer | Automation, Code |
| Quill | ✍️ | Copywriter | Communication |
| Codex | 🏗️ | Architect | Systems Design |
| Alex | 📊 | Analyst | Metrics, Data |
