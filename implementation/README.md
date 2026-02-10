# 🏗️ Agent Architecture Implementation

Three interconnected systems for intelligent agent behavior.

## 📁 Files

| File | Purpose | Lines |
|------|---------|-------|
| `context-router.js` | Mode detection (work/coding/life) | ~450 |
| `memory-architecture.js` | 3-tier memory system | ~500 |
| `escalation-system.js` | Confidence-based decisions | ~480 |
| `index.js` | Integration demo | ~350 |

---

## 🎯 Context Router

Detects operational context from multiple signals:

```javascript
const { ContextRouter } = require('./context-router');
const router = new ContextRouter();

const context = router.detectContext({
  files: ['/workspace/project/src/app.js'],
  activity: 'coding',
  projectType: 'software'
});

// Result: { mode: 'coding', confidence: 0.96, ... }
```

### Detection Methods
- **Time-based**: Work hours, coding hours, life hours
- **File patterns**: Extensions, keywords, paths
- **Activity signals**: Commands, actions
- **Project type**: Software, business, creative, etc.

### Modes
- `work` — Professional tasks, meetings, documents
- `coding` — Software development, testing, deployment
- `life` — Personal tasks, entertainment, health
- `research` — Deep reading, analysis, learning
- `creative` — Writing, design, brainstorming

---

## 🧠 Memory Architecture

3-tier memory with automatic promotion:

```javascript
const { MemoryArchitecture } = require('./memory-architecture');
const memory = new MemoryArchitecture('./memory');
await memory.init();

// Write to cold (long-term)
await memory.write('user_pref', data, { tier: 'cold' });

// Read with automatic promotion
const result = await memory.read('user_pref');
// First: cold tier (~5s) → promotes to warm + hot
// Second: hot tier (~0.1ms)
```

### Tiers

| Tier | Latency | Use Case | Persistence |
|------|---------|----------|-------------|
| 🔥 Hot | <100ms | Session context, conversation | RAM only |
| 🌡️ Warm | <1s | Daily activity, recent files | JSON daily |
| 🧊 Cold | <5s | Curated wisdom, preferences | Indexed files |

---

## ⚡ Escalation System

Confidence-based action selection:

```javascript
const { EscalationSystem } = require('./escalation-system');
const escalation = new EscalationSystem();

const result = escalation.evaluate(0.85, { stakes: 0.5 });

// >90% → auto_execute
// 70-90% → propose_confirm  
// 50-70% → suggest_explain
// <50% → ask_research
```

### Confidence Factors
- Historical accuracy
- Context clarity
- Stakes level
- Reversibility
- Time pressure

---

## 🔗 Integration

All three systems work together:

```javascript
const { IntegratedAgent } = require('./index');

const agent = new IntegratedAgent();
await agent.init();

const result = await agent.processRequest({
  intent: 'implement auth system',
  files: ['/src/auth.js'],
  stakes: 0.8
});

// 1. Router detects coding mode from files
// 2. Memory stores context in hot tier
// 3. Escalation evaluates → propose_confirm (high stakes)
// 4. Result returned with mode-specific config
```

---

## 🚀 Usage

```bash
# Test individual systems
node context-router.js
node memory-architecture.js
node escalation-system.js

# Test full integration
node index.js
```

---

## 📊 Architecture Flow

```
User Request
     │
     ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Context   │───▶│    Hot      │───▶│  Escalation │
│   Router    │    │   Memory    │    │   System    │
│  (detect)   │    │   (cache)   │    │  (decide)   │
└─────────────┘    └─────────────┘    └─────────────┘
     │                                      │
     ▼                                      ▼
   Mode                                   Action
     │                                      │
     └──────────────┬───────────────────────┘
                    ▼
            ┌─────────────┐
            │   Warm/     │
            │    Cold     │
            │   Memory    │
            │  (persist)  │
            └─────────────┘
```

## ✅ Status

All systems implemented and tested:
- ✅ Context Router with 5 mode detection
- ✅ 3-tier memory with automatic promotion
- ✅ Confidence escalation with 4 levels
- ✅ Full integration demo

**Total: ~1,780 lines of production-ready code**
