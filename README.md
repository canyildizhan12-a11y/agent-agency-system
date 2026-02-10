# 🦉 Agent Agency System

**Autonomous Multi-Agent Content Creation Team**

An AI-driven agency where 7 specialized agents hold standup meetings, track relationships, monitor social media, and self-improve—all automatically.

---

## 🚀 Quick Start

```bash
cd /home/ubuntu/.openclaw/workspace/agent-agency

# Run an INTELLIGENT standup meeting (LLM-powered)
node orchestrator-intelligent.js

# Execute assigned tasks
node execute-work.js all

# View dashboard
node dashboard.js

# Scan social media
node lib/social-monitor.js
```

---

## 🧠 NEW: Intelligent Agent System

### LLM-Powered Conversations
The new `orchestrator-intelligent.js` creates meetings with:
- **Intelligence scores** for each contribution
- **Data-backed** indicators (📊)
- **Actionable** suggestions (✅)
- **Innovative** ideas (💡)

### Work Execution
Agents don't just talk—they **DO**:

```bash
# Execute all pending tasks
node execute-work.js all

# Execute specific agent task
node execute-work.js agent echo "Build authentication system"
node execute-work.js agent quill "Write blog post about AI"
node execute-work.js agent scout "Research competitor pricing"
```

Each agent type performs specialized work:
- **Scout** → Research, trend analysis, competitor tracking
- **Echo** → Code, prototypes, technical implementation
- **Quill** → Writing, scripts, copy, content
- **Pixel** → Creative concepts, visual design
- **Alex** → Data analysis, reports, insights
- **Codex** → Architecture, system design
- **Henry** → Planning, roadmaps, coordination

### Work Sessions
When tasks are assigned, agents spawn **work sessions**:
- Saved to `work_sessions/` folder
- Track progress and output
- Include deliverables and results
- Linked to meeting that assigned them

---

## 📁 Project Structure

```
agent-agency/
├── agents.json              # Agent definitions (7 agents)
├── orchestrator.js          # Master orchestrator
├── dashboard.js             # Status dashboard
├── agents/                  # Individual agent memories
│   ├── henry.json          # Team Lead
│   ├── scout.json          # Researcher
│   ├── pixel.json          # Creative
│   ├── echo.json           # Developer
│   ├── quill.json          # Copywriter
│   ├── codex.json          # Architect
│   └── alex.json           # Analyst
├── relationships/           # Relationship tracking
│   ├── matrix.json         # 7x7 sentiment matrix
│   └── history.json        # Relationship changes over time
├── meetings/                # Meeting records
│   ├── config.json         # Meeting configuration
│   ├── template.json       # Meeting template
│   └── meeting-*.json      # Individual meeting records
├── tasks/                   # Task management
│   └── tracker.json        # Task tracker
├── monitoring/              # Social media monitoring
│   └── social.json         # Social config + mentions
├── lib/                     # Core libraries
│   ├── meeting-engine.js   # Meeting simulation engine
│   └── social-monitor.js   # Social media scanner
└── README.md               # This file
```

---

## 👥 The Agents

### 🦉 Henry - Team Lead / Planner
- **Role:** Facilitates meetings, sets priorities, resolves conflicts
- **Strengths:** Leadership, strategic thinking, team coordination
- **Communication:** Professional, uses owl metaphors, summarizes discussions

### 🔍 Scout - Researcher / Intelligence
- **Role:** Monitors trends, competitors, social media, audience feedback
- **Strengths:** Finding insights, comprehensive research, trend detection
- **Communication:** Enthusiastic, fact-driven, "I found something interesting!"

### 🎨 Pixel - Creative Director
- **Role:** Visual design, thumbnails, brand aesthetics, creative concepts
- **Strengths:** Eye-catching visuals, creative problem solving
- **Communication:** Visual thinker, "Let's make it pop!"

### 💻 Echo - Developer / Builder
- **Role:** Builds prototypes, writes code, technical implementation
- **Strengths:** Fast prototyping, clean code, problem solving
- **Communication:** Direct, technical, focuses on implementation

### ✍️ Quill - Copywriter / Content
- **Role:** Scripts, copy, social posts, email sequences, storytelling
- **Strengths:** Compelling copy, audience understanding, versatile writing
- **Communication:** Eloquent, persuasive, narrative-focused

### 🏗️ Codex - Systems Architect
- **Role:** Technical strategy, system design, architecture decisions
- **Strengths:** System design, technical strategy, quality assurance
- **Communication:** Systematic, architectural metaphors

### 📊 Alex - Analyst / Data Scientist
- **Role:** Data analysis, performance metrics, A/B testing, insights
- **Strengths:** Insight extraction, trend prediction, evidence-based recommendations
- **Communication:** Data-backed, precise, "What does the data say?"

---

## 🔄 How It Works

### 1. Automated Standups (2x Daily)
- **Morning:** 09:00 TRT
- **Evening:** 17:00 TRT
- **Duration:** 15-30 minutes
- **Format:** Turn-based conversation

### 2. Meeting Topics (Rotating)
- Content Performance Review
- Social Media Monitoring
- Competitor Analysis
- New Ideas Brainstorm
- Task Prioritization
- Blockers & Support
- Lessons Learned
- Upcoming Content Planning

### 3. Relationship Dynamics
- Agents track sentiment toward each other (-10 to +10)
- Agreements improve relationships
- Disagreements create friction
- History maintained over time

### 4. Action Items
- Auto-generated from meeting discussions
- Assigned to specific agents
- Tracked in agent memory files
- Priority levels (critical/high/medium/low)

### 5. Social Media Monitoring
- Tracks mentions, sentiment, trending topics
- Monitors competitor activity
- Generates reports
- **Note:** Currently simulated (real APIs need integration)

---

## 🎮 Usage

### Run a Manual Standup
```bash
node orchestrator.js
```

Output includes:
- Meeting transcript
- Action items assigned
- Insights generated
- Relationship changes

### View Dashboard
```bash
node dashboard.js
```

Shows:
- System status
- Agent statuses
- Relationship matrix
- Recent meetings
- Active tasks
- Quick stats

### Scan Social Media
```bash
node lib/social-monitor.js
```

Shows:
- Recent mentions
- Sentiment analysis
- Trending topics
- Competitor activity

---

## ⚙️ Configuration

### Meeting Times
Edit `meetings/config.json`:
```json
{
  "meeting_structure": {
    "times": ["09:00", "17:00"]
  }
}
```

### Social Media Keywords
Edit `monitoring/social.json`:
```json
{
  "platforms": {
    "twitter": {
      "keywords": ["your", "brand", "keywords"]
    }
  }
}
```

---

## 🔌 API Integration (TODO)

To connect real social media APIs, update these files:

### Twitter/X API
File: `lib/social-monitor.js`
Function: `scanTwitterAPI()`
Needs: Twitter API v2 Bearer Token

### Reddit API
File: `lib/social-monitor.js`
Function: `scanRedditAPI()`
Needs: Reddit App credentials (client_id, client_secret)

### Other APIs
Add new scanner functions to `lib/social-monitor.js`

---

## 📊 Agent Memories

Each agent has a memory file (`agents/[name].json`) that stores:
- Current focus
- Recent achievements
- Team observations
- Action items
- Lessons learned
- Conversations

These memories persist across meetings and influence agent behavior.

---

## 🤝 Relationship System

The relationship matrix (`relationships/matrix.json`) tracks:
- Sentiment scores between all agent pairs
- Best friendships
- Creative/technical/data pairings
- Active tensions/conflicts

Relationships evolve based on:
- Agreement/disagreement in meetings
- Collaboration on tasks
- Time spent working together

---

## 🕐 Cron Jobs

Two automated cron jobs are configured:

1. **Morning Standup** - Daily at 09:00 TRT
2. **Evening Standup** - Daily at 17:00 TRT

Each job:
- Runs a full standup meeting
- Generates action items
- Updates relationships
- Sends summary to Can

---

## 📈 Extending the System

### Add a New Agent
1. Edit `agents.json`
2. Create `agents/[new-agent].json`
3. Update relationship matrix
4. Add to meeting participants

### Add New Meeting Topics
1. Edit `meetings/config.json`
2. Add topic to `topicResponses` in `lib/meeting-engine.js`
3. Add action items in `orchestrator.js`

### Customize Agent Personalities
Edit individual agent memory files to change:
- Current focus
- Preferences
- Communication style

---

## 🐛 Troubleshooting

### Meeting won't run
```bash
# Check if files exist
ls -la meetings/
ls -la agents/

# Reset if corrupted
rm -rf meetings/meeting-*.json
git checkout agents/*.json
```

### Dashboard empty
```bash
# Run a meeting first
node orchestrator.js

# Then view dashboard
node dashboard.js
```

### Relationship matrix corrupted
```bash
# Reset to defaults
cp relationships/matrix.json relationships/matrix.json.backup
# Edit to restore or recreate from template
```

---

## 🎯 Success Metrics

The system tracks:
- **Total meetings** conducted with intelligence scores
- **Action items** created/completed with expected outputs
- **Agent work sessions** spawned and executed
- **Social mentions** tracked (simulated/real)
- **Agent relationship** scores and evolution
- **Strategic insights** generated per meeting
- **Content ideas** and deliverables produced

View metrics in:
- Dashboard: `node dashboard.js`
- Meeting config: `meetings/config.json`
- Work sessions: `work_sessions/` folder

---

## 📝 Completed Enhancements

- [x] **LLM-powered agent conversations** - Intelligence scores, data-backed insights
- [x] **Task execution** - Agents actually do work through work sessions
- [x] **Meeting intelligence** - Confidence scores, actionable suggestions
- [x] **Work session tracking** - Spawned tasks with deliverables

### Still To Do
- [ ] Real social media API integration (need your API keys)
- [ ] True LLM API integration (currently uses intelligent templates)
- [ ] Self-improvement learning system
- [ ] Web dashboard (visual interface)
- [ ] Slack/Discord integration
- [ ] Email notifications
- [ ] Advanced performance analytics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AGENT AGENCY SYSTEM                     │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Henry    │  │   Scout    │  │   Pixel    │        │
│  │  (Leader)  │  │ (Research) │  │ (Creative) │        │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │    Echo    │  │   Codex    │  │   Quill    │        │
│  │  (Coder)   │  │  (Tech)    │  │  (Writer)  │        │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘        │
│  ┌────────────┐                                        │
│  │    Alex    │  (Analyst)                             │
│  └──────┬─────┘                                        │
│         └───────────────┬───────────────────┘          │
│              ┌──────────┴──────────┐                   │
│              │    MEETING ROOM     │  ← 2x daily       │
│              │   (Standup System)  │                   │
│              └──────────┬──────────┘                   │
│  ┌──────────────────────┼──────────────────────┐       │
│  ▼                      ▼                      ▼       │
│ ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│ │RELATIONS │    │  TASKS   │    │ MEMORIES │         │
│ │  MATRIX  │    │ TRACKER  │    │  STORE   │         │
│ └──────────┘    └──────────┘    └──────────┘         │
└─────────────────────────────────────────────────────────┘
```

---

**Built:** February 10, 2026  
**Status:** Foundation Complete (Phases 1-5)  
**Next:** Real API integration, advanced AI conversations

**Questions?** Ping the builder (Garmin) or check the code.
