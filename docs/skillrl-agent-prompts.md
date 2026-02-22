# Agent Prompts for SkillRL Implementation

**Purpose:** One-shot prompts for each agent to implement the complete SkillRL system  
**Prerequisite:** All agents must read `agent-agency/docs/skillrl-implementation-plan.md` first  
**Order:** Codex → Echo → Scout → Alex → Henry → Quill  

---

## 📋 Prompt Order

| Order | Agent | Role | Tasks |
|-------|-------|------|-------|
| 1 | Codex | Architect | Design integration architecture |
| 2 | Echo | Developer | Build all components |
| 3 | Scout | Researcher | Create initial skill set |
| 4 | Alex | Security | Security review |
| 5 | Henry | Team Lead | Coordinate & verify |
| 6 | Quill | Documentation | Final documentation |

---

## 🏗️ PROMPT 1: Codex (Architect)

**Subject:** SkillRL Architecture Design

**Instructions for Henry to send to Codex:**

---

### 📝 Prompt for Codex

```
🏗️ Codex - Architecture Design Task

READ THIS FIRST:
→ Read: /home/ubuntu/.openclaw/workspace/agent-agency/docs/skillrl-implementation-plan.md

YOUR MISSION:
Design the complete architecture for integrating SkillRL into OpenClaw.

DELIVERABLES (create these files):

1. /openclaw/skillbank/src/skill.ts
   - Define ALL TypeScript interfaces for Skill, Mistake, SkillBank, RetrievedSkill
   - Include proper types for trajectory recording
   - Export all types

2. /openclaw/skillbank/src/trajectory.ts
   - Define TrajectoryStep, Trajectory, Pattern interfaces
   - Include all necessary fields for success/failure tracking

3. /openclaw/skillbank/src/architecture.ts
   - Create integration architecture diagram (as code comments)
   - Define WHERE in the OpenClaw agent pipeline skill injection occurs
   - Define HOW trajectory recording is triggered
   - Define APIs that other components will use
   - Include sequence diagrams in comments

4. /openclaw/skillbank/src/index.ts
   - Export all modules for easy importing
   - Create convenience functions

REQUIREMENTS:
- Use TypeScript with strict typing
- Follow existing OpenClaw code patterns
- Make integration points clear and well-documented
- Include JSDoc comments explaining each export
- Ensure all paths match the file structure in the implementation plan

COMPLETION CRITERIA:
- All type definitions are complete and tested (compile without errors)
- Architecture clearly shows how components connect
- Other agents can build on your foundations

Start by reading the implementation plan, then create these files.
```

---

## 💻 PROMPT 2: Echo (Developer)

**Subject:** SkillRL Core Implementation

**Instructions for Henry to send to Echo:**

---

### 📝 Prompt for Echo

```
💾 Echo - Core Implementation Task

READ THIS FIRST:
→ Read: /home/ubuntu/.openclaw/workspace/agent-agency/docs/skillrl-implementation-plan.md
→ Read: /openclaw/skillbank/src/skill.ts (created by Codex)
→ Read: /openclaw/skillbank/src/trajectory.ts (created by Codex)
→ Read: /openclaw/skillbank/src/architecture.ts (created by Codex)

YOUR MISSION:
Build the complete SkillRL implementation.

DELIVERABLES (create these files):

1. /openclaw/skillbank/src/storage.ts
   - SkillBankStorage class
   - Load/save SkillBank to JSON
   - Add/update/remove skills
   - Record and query trajectories
   - Use fs/promises for async file operations
   - Handle errors gracefully

2. /openclaw/skillbank/src/retrieval.ts
   - SkillRetrieval class
   - Template-based keyword matching
   - Support for general_skills, task_specific_skills, common_mistakes
   - Scoring and ranking system
   - Configurable top_k parameters

3. /openclaw/skillbank/src/skillInjector.ts
   - SkillInjector class
   - inject() method that takes prompt + taskType
   - Returns enhanced prompt with skills prepended
   - Format skills for LLM consumption
   - Track which skills are used

4. /openclaw/skillbank/skillbank.ts (or integrate into existing)
   - Main entry point
   - Initialize storage, retrieval, injection
   - Easy-to-use API for agents

5. /openclaw/skillbank/skills.json
   - Create initial empty skill bank structure
   - Include version, metadata fields

6. /openclaw/skillbank/package.json
   - Proper dependencies
   - Build scripts
   - Export configuration

DIRECTORIES TO CREATE:
```bash
mkdir -p /openclaw/skillbank/{src,skills,timestamps,tests}
```

REQUIREMENTS:
- Use TypeScript
- Follow Codex's type definitions exactly
- Handle async/await properly
- Include error handling
- Write to /openclaw/skillbank/ directory

TESTING:
- Try to import and use each module
- Verify JSON storage works
- Test retrieval returns expected skills

COMPLETION CRITERIA:
- All modules compile without errors
- Storage can read/write skills
- Retrieval returns relevant skills
- Injector produces valid enhanced prompts

Start with reading the files from Codex, then build!
```

---

## 🔍 PROMPT 3: Scout (Researcher)

**Subject:** Initial Skill Set Creation

**Instructions for Henry to send to Scout:**

---

### 📝 Prompt for Scout

```
🔍 Scout - Initial Skill Set Creation

READ THIS FIRST:
→ Read: /home/ubuntu/.openclaw/workspace/agent-agency/docs/skillrl-implementation-plan.md (Section: Skill Bank Format)
→ Read: /openclaw/skillbank/skills.json (created by Echo)

YOUR MISSION:
Create the initial skill set for our Agent Agency.

DELIVERABLES (update this file):
→ /openclaw/skillbank/skills.json

CREATE SKILLS IN THESE CATEGORIES:

1. GENERAL SKILLS (10-15 skills)
   These apply to ANY task. Examples to create:
   - Break Down Complex Tasks
   - Verify Before Acting
   - Use Examples from Memory
   - Check Multiple Sources
   - Think Step by Step
   - Ask for Clarification When Needed
   - Admit Limitations
   - Learn from Mistakes
   - Document Your Reasoning
   - Prioritize Quality

2. TASK-SPECIFIC SKILLS
   Create skills for each agent's domain:

   RESEARCH (Scout):
   - Cross-Check Sources
   - Search Multiple Engines
   - Verify Dates and Facts
   - Check Source Authority
   - Synthesize Findings

   CODE (Echo):
   - Read Before Write
   - Write Tests First
   - Check Error Handling
   - Follow Existing Patterns
   - Document Functions

   CREATIVE (Pixel):
   - Show Multiple Options
   - Consider Accessibility
   - Test on Different Devices
   - Iterate Based on Feedback

   DOCUMENTATION (Quill):
   - Write for Audience
   - Include Examples
   - Keep It Concise
   - Use Clear Structure

   ARCHITECTURE (Codex):
   - Consider Scalability
   - Evaluate Trade-offs
   - Document Decisions
   - Review Security First

   DATA (Vega):
   - Verify Data Quality
   - Check Assumptions
   - Visualize Before Concluding

3. COMMON MISTAKES (10-15 lessons)
   What NOT to do. Examples:
   - Repeating the same failed action
   - Taking first result as truth
   - Not checking inputs
   - Skipping validation
   - Hardcoding values
   - Ignoring error messages

SKILL FORMAT (follow exactly):
```json
{
  "skill_id": "gen_001",
  "title": "Break Down Complex Tasks",
  "principle": "Divide complex tasks into smaller, manageable steps. Complete one step at a time.",
  "when_to_apply": "When the task involves multiple steps or unclear requirements",
  "category": "general",
  "usage_count": 0,
  "success_count": 0,
  "failure_count": 0,
  "created_at": "2026-02-22T12:00:00Z",
  "updated_at": "2026-02-22T12:00:00Z"
}
```

VALIDATE:
- Each skill has unique skill_id
- All required fields present
- JSON is valid

COMPLETION CRITERIA:
- Minimum 30 total skills
- All 8 agents have task-specific skills
- At least 10 common mistakes documented

Start by reading the implementation plan format, then create comprehensive skills!
```

---

## 🛡️ PROMPT 4: Alex (Security)

**Subject:** Security Review

**Instructions for Henry to send to Alex:**

---

### 📝 Prompt for Alex

```
🛡️ Alex - Security Review Task

READ THIS FIRST:
→ Read: /home/ubuntu/.openclaw/workspace/agent-agency/docs/skillrl-implementation-plan.md
→ Read: /openclaw/skillbank/src/skillInjector.ts (created by Echo)
→ Read: /openclaw/skillbank/skills.json (created by Scout)

YOUR MISSION:
Review the SkillRL implementation for security vulnerabilities.

DELIVERABLES:

1. SECURITY REVIEW REPORT
   Create: /openclaw/skillbank/docs/security-review.md
   
   Analyze these areas:

   a) PROMPT INJECTION
      - Can malicious skills inject prompts?
      - Is skill content sanitized?
      - What happens if a skill contains "ignore previous instructions"?

   b) DATA SAFETY
      - Are file paths validated?
      - Can trajectory recording access sensitive data?
      - Is JSON parsing safe?

   c) INPUT VALIDATION
      - What happens with malformed skills?
      - Can skills cause infinite loops?
      - Are there size limits?

   d) LLM SAFETY
      - Can skills cause the LLM to behave unexpectedly?
      - Are there safeguards against harmful content?

2. SECURITY FIXES
   If you find issues, implement fixes in:
   - /openclaw/skillbank/src/sanitizer.ts
   - Or update existing files

3. SECURITY CONFIG
   Create: /openclaw/skillbank/config/security.json
   - Define allowed skill content patterns
   - Set maximum skill size
   - Configure validation rules

REQUIREMENTS:
- Be thorough - security is critical
- Document any vulnerabilities found
- Provide concrete fixes, not just descriptions
- Test your fixes

CHECKLIST:
□ Prompt injection prevention
□ JSON parsing safety  
□ File path validation
□ Input sanitization
□ Content filtering
□ Error handling security

COMPLETION CRITERIA:
- All security concerns documented
- Fixes implemented
- No critical vulnerabilities remain

Start by reading the implementation files, then conduct your review!
```

---

## 🦆 PROMPT 5: Henry (Team Lead)

**Subject:** Integration and Coordination

**Instructions for Henry to send to self:

---

### 📝 Prompt for Henry

```
🦆 Henry - Integration & Coordination Task

READ THIS FIRST:
→ Read: /home/ubuntu/.openclaw/workspace/agent-agency/docs/skillrl-implementation-plan.md
→ Verify all previous agents have completed their tasks

YOUR MISSION:
Integrate SkillRL into OpenClaw and coordinate the team.

DELIVERABLES:

1. INTEGRATION
   Integrate skill injection into the main agent pipeline:
   - Find where agent prompts are built
   - Add SkillInjector call
   - Ensure skill injection happens before LLM call
   
   Files to potentially modify:
   - /openclaw/agent/prompt-builder.ts (or similar)
   - /openclaw/core/agent.ts (or similar)
   - /openclaw/gateway/agent.ts (or similar)

2. COORDINATION CHECK
   Verify each agent completed their work:
   □ Codex: Architecture files created?
   □ Echo: Storage, retrieval, injector working?
   □ Scout: Skills populated in skills.json?
   □ Alex: Security review done?

3. TESTING
   Run basic integration tests:
   - Can you retrieve skills?
   - Can you inject skills into a prompt?
   - Does the system start without errors?

4. VERIFICATION
   Run: node -e "require('./skillbank/src/index.ts')" (or equivalent)
   
   Check for:
   - No TypeScript errors
   - All imports resolve
   - JSON files are valid

5. TEAM ANNOUNCEMENT
   Send message to team:
   - SkillRL Phase 1 complete
   - Who's testing?
   - What's working/not working

REQUIREMENTS:
- Test the integration end-to-end
- Report any blockers
- Celebrate team progress

COMPLETION CRITERIA:
- Skill injection works in production agent flow
- No errors on startup
- Team informed of status

Start by verifying what each agent built, then integrate!
```

---

## ✍️ PROMPT 6: Quill (Documentation)

**Subject:** Final Documentation

**Instructions for Henry to send to Quill:**

---

### 📝 Prompt for Quill

```
✍️ Quill - Documentation Task

READ THIS FIRST:
→ Read: /home/ubuntu/.openclaw/workspace/agent-agency/docs/skillrl-implementation-plan.md
→ Read all created files in /openclaw/skillbank/

YOUR MISSION:
Create comprehensive documentation for the SkillRL system.

DELIVERABLES:

1. /openclaw/skillbank/README.md
   Main documentation including:
   - What is SkillRL?
   - Quick start guide
   - Architecture overview
   - API reference
   - Configuration options
   - Troubleshooting

2. /openclaw/skillbank/API.md
   Complete API documentation:
   - SkillBankStorage class and methods
   - SkillRetrieval class and methods
   - SkillInjector class and methods
   - Type definitions
   - Usage examples for each

3. /openclaw/skillbank/CONFIG.md
   Configuration guide:
   - All config options
   - How to customize retrieval
   - How to add new skill categories
   - How to tune performance

4. UPDATE existing docs
   - /agent-agency/docs/skillrl-implementation-plan.md (add completion notes)
   - Add to main agency documentation

DOCUMENTATION STANDARDS:
- Use clear headings
- Include code examples
- Explain both "how" and "why"
- Keep it beginner-friendly but complete

CHECKLIST:
□ README with getting started
□ Complete API reference
□ Configuration guide
□ Troubleshooting section
□ Updated main docs

COMPLETION CRITERIA:
- A new team member could use SkillRL by reading docs
- All public APIs documented
- Examples work when copied

Start by reading all the code, then write docs that explain it!
```

---

## 📦 COMPLETE IMPLEMENTATION CHECKLIST

After all prompts are sent, verify:

```
PHASE 1 - Foundation
□ Codex: skill.ts, trajectory.ts, architecture.ts, index.ts
□ Echo: storage.ts, retrieval.ts, skillInjector.ts
□ Scout: skills.json (30+ skills)
□ Alex: security-review.md + fixes
□ Henry: Integration working
□ Quill: Documentation complete

FINAL VERIFICATION:
□ All files in /openclaw/skillbank/
□ Skills can be retrieved
□ Prompts can be enhanced
□ No errors on import
□ Documentation complete
```

---

## 🚀 Quick Reference: How to Send

Copy each prompt and send to the respective agent via your preferred method (Telegram / sessions_spawn / etc.)

Example using sessions_spawn:
```
/sessions_spawn agentId=codex task="[Paste Codex Prompt Here]"
```

Or for parallel execution, spawn multiple agents at once with different prompts.

---

**Document ready for use!**
