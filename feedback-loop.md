# Feedback Loop System
## How Can's Feedback Shapes Agent Behavior

**Purpose:** Capture, categorize, and apply Can's feedback to improve agent behavior
**Maintainer:** Echo 💾 (memory) + All agents (application)

---

## Feedback Types

### 1. Immediate Feedback
**When:** During active session  
**Format:** Direct correction from Can

**Example:**
```
Can: "No, that's not what I meant. I want X not Y."
```

**Action:**
1. Agent acknowledges immediately
2. Corrects course
3. Logs feedback to `shared/consciousness/can_preferences.json`
4. Applies to current task

### 2. Retrospective Feedback
**When:** After task completion  
**Format:** Evaluation of work done

**Example:**
```
Can: "That was good, but next time include Z"
Can: "Too verbose — be more concise"
Can: "Perfect, do it exactly like this going forward"
```

**Action:**
1. Agent captures feedback
2. Categorizes by type (style, content, approach)
3. Updates preferences
4. Confirms understanding

### 3. Implicit Feedback
**When:** Inferred from behavior  
**Format:** Actions speak louder than words

**Signals:**
- Can rejects output → preference learned
- Can accepts quickly → positive reinforcement
- Can asks follow-up → clarity needed
- Can shares with others → high value

**Action:**
1. Scout monitors for patterns
2. Echo logs inferred preferences
3. All agents adjust behavior

---

## Feedback Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Style** | How things are said | "Be more concise" |
| **Content** | What is included | "Include code examples" |
| **Approach** | Method used | "Ask before doing X" |
| **Priority** | What matters most | "Focus on Y first" |
| **Format** | Structure of output | "Use tables not lists" |

---

## Preference Storage

**Location:** `shared/consciousness/can_preferences.json`

```json
{
  "preferences": [
    {
      "preference_id": "pref_001",
      "category": "style",
      "description": "Prefers concise responses",
      "source": "explicit_feedback",
      "timestamp": "2026-02-12T10:00:00+03:00",
      "confidence": 0.95,
      "applied_count": 15,
      "last_applied": "2026-02-12T11:30:00+03:00"
    },
    {
      "preference_id": "pref_002", 
      "category": "approach",
      "description": "Ask before using expensive models",
      "source": "implicit_signal",
      "timestamp": "2026-02-12T09:00:00+03:00",
      "confidence": 0.80,
      "applied_count": 3,
      "last_applied": "2026-02-12T10:15:00+03:00"
    }
  ],
  "learned_behaviors": {
    "communication": {
      "verbosity": "concise",
      "format": "structured",
      "tone": "direct"
    },
    "work_style": {
      "proactive": true,
      "asks_before_expensive_ops": true,
      "prefers_code_examples": true
    }
  }
}
```

---

## Feedback Processing

### Step 1: Capture
All agents watch for feedback signals:
- Direct statements ("I prefer...", "Next time...")
- Corrections ("No, that's...", "Actually...")
- Reactions (👍, ❌, follow-up questions)

### Step 2: Categorize
Echo categorizes feedback by type and domain.

### Step 3: Store
Preferences stored with:
- Source (explicit/implicit)
- Confidence score
- Timestamp
- Application count

### Step 4: Apply
Agents query preferences before acting:
```
Before: Generate long report
Query: What format does Can prefer?
Result: "Concise, bullet points"
Action: Generate concise bullet report
```

### Step 5: Verify
Agent confirms preference application:
```
"Applied your preference for concise format."
```

---

## Feedback Loop in Action

**Scenario:**
```
🦉 Henry: [Provides 500-word analysis]

Can: "Too long. Be brief."

[Feedback captured]
  Type: Immediate
  Category: Style/Verbosity
  Action: Reduce verbosity

🦉 Henry: "Got it. Summary: [2 sentences]"

[Preference stored]
  "Prefers concise responses"
  Confidence: 0.90

[Next interaction]
🦉 Henry: [Automatically provides brief response]
```

---

## Feedback Escalation

If feedback conflicts:
1. Newer feedback overrides older
2. Explicit feedback overrides implicit
3. Can clarification resolves conflicts

---

**Integration:** All agents check preferences before output generation.
