# SkillRL: Complete User Guide for Can

**Written by:** Scout (Research Agent)  
**For:** Can (Human Supervisor)  
**Date:** 2026-02-22  

---

## Welcome, Can! 👋

I've done a deep dive into a research paper called **SkillRL** and created an implementation plan for our Agent Agency. This document explains everything in simple terms so you can understand what we're building and why it matters.

---

## Table of Contents

1. [What is SkillRL?](#what-is-skillrl)
2. [Why Does This Matter?](#why-does-this-matter)
3. [What Problems Does It Solve?](#what-problems-does-it-solve)
4. [How Will Our Agents Improve?](#how-will-our-agents-improve)
5. [What Are the Benefits?](#what-are-the-benefits)
6. [Real-World Use Cases](#real-world-use-cases)
7. [What Will You See?](#what-will-you-see)
8. [How Do You Use It?](#how-do-you-use-it)
9. [Timeline](#timeline)
10. [FAQ](#faq)

---

## What is SkillRL?

**SkillRL** stands for **Skill Reinforcement Learning**. It's a system that helps AI agents learn from their past experiences and get better over time.

Think of it like this:

- **Before**: Our agents approach every task like it's brand new, starting from scratch
- **After**: Our agents remember what worked before and apply those lessons to new tasks

### Simple Analogy

Imagine you're teaching someone to cook:

| Without SkillRL | With SkillRL |
|-----------------|---------------|
| They forget that chopping onions first prevents crying | They remember: "Always chop onions first, then garlic" |
| They don't learn from burning toast | They learn: "Lower heat, use butter, watch carefully" |
| Every meal is their first time cooking | They build a mental cookbook of tips and tricks |

SkillRL gives our agents exactly that—a **cookbook of skills** they can reference.

---

## Why Does This Matter?

Currently, here's what happens when an agent works:

1. **User asks for something** → Agent gets a fresh prompt
2. **Agent does the work** → Uses its training knowledge
3. **Task completes** → Agent forgets everything about what happened

This is inefficient because:

- The agent might make the same mistakes repeatedly
- It doesn't learn from successes ("Oh, that approach worked well!")
- Every conversation starts from zero

SkillRL fixes this by adding **memory** and **learning**.

---

## What Problems Does It Solve?

### Problem 1: Forgotten Lessons

**Current:** Agent fails at something → Next time, it might fail the same way

**With SkillRL:** Agent fails → System records what went wrong → Next task includes guidance to avoid that mistake

### Problem 2: Starting From Zero

**Current:** Agent approaches every task with only its training

**With SkillRL:** Agent can say "For this type of task, here's what usually works..."

### Problem 3: Verbose History

**Current:** To help the agent, we include past conversation history → Uses lots of tokens, expensive

**With SkillRL:** Instead of full history, we inject **skills** (short, actionable tips) → Much more efficient

---

## How Will Our Agents Improve?

Here's what changes:

### Before (Current System)

```
User: "Research AI coding tools"
Agent: [Uses general knowledge] → Result

[Task forgotten]
```

### After (With SkillRL)

```
User: "Research AI coding tools"
System: [Checks skill bank] → "For research tasks: verify sources, check multiple websites"
Agent: [Uses general knowledge + skills] → Better Result

[Skills updated with new learnings]
```

### The Learning Loop

```
┌─────────────────────────────────────────┐
│           WHAT HAPPENS NOW              │
├─────────────────────────────────────────┤
│                                         │
│  1. Agent works on a task               │
│                                         │
│  2. System records what happened       │
│     (success or failure)               │
│                                         │
│  3. If something worked well →          │
│     Extract the principle              │
│                                         │
│  4. If something failed →               │
│     Record the lesson                  │
│                                         │
│  5. Next similar task →                 │
│     Skills are injected to help        │
│                                         │
└─────────────────────────────────────────┘
```

---

## What Are the Benefits?

### 1. 💰 **Cost Savings (10-20% less tokens)**

Instead of including full conversation history, we inject short skills. This saves tokens = saves money.

### 2. 📈 **Better Performance Over Time**

The agent learns from failures and successes. Tasks that used to fail might start succeeding.

### 3. 🎯 **Smarter Context**

Instead of "here's everything that happened before," we say "here are the relevant tips for this task"

### 4. 🔄 **Self-Improving**

The system gets better automatically. No manual updates needed.

### 5. 📊 **We Can Track What's Working**

We'll see which skills are actually helping vs. which aren't being used.

---

## Real-World Use Cases

### Example 1: Research Tasks

**Scenario:** You ask Scout (me) to research something

**Without SkillRL:** I research it based on my training

**With SkillRL:** I get skills like:
- "For research: always cross-check facts with multiple sources"
- "Common mistake: taking the first search result as truth"

**Result:** Better, more accurate research for you

---

### Example 2: Code Reviews

**Scenario:** Echo writes code

**Without SkillRL:** Each code review is independent

**With SkillRL:** Skills like:
- "For code reviews: check error handling first"
- "Remember: always verify inputs before processing"

**Result:** More consistent code quality

---

### Example 3: Complex Tasks

**Scenario:** A multi-step task that previously failed

**Without SkillRL:** Agent tries same approach, fails again

**With SkillRL:** Agent learns from failure, tries different approach, succeeds

---

## What Will You See?

As the human supervisor, here's what changes for you:

### Changes You Might Notice

| What You See | What's Happening |
|--------------|------------------|
| Agents perform better on repeated tasks | They're using learned skills |
| Slightly shorter responses | We're using skills instead of verbose history |
| "I recall that..." type comments | Skills are being injected |
| Better success rates over time | The learning is working |

### What You Won't Notice

- No changes to how you communicate with agents
- Same interface, same commands
- Everything happens behind the scenes

---

## How Do You Use It?

### Short Answer: You Don't Have to Do Anything

The system is designed to work automatically. You just keep using agents as normal, and they get better.

### Optional: You Can Help

If you want to contribute to the skill bank:

1. **Give feedback**: When something works well or fails, tell us
2. **Suggest skills**: Any tips you'd want agents to remember?
3. **Review performance**: Check if tasks are succeeding more over time

---

## Timeline

Here's when things happen:

| Week | What Happens |
|------|--------------|
| **Week 1** | Echo builds the skill storage and retrieval system |
| **Week 2** | Start recording task histories |
| **Week 3** | Begin extracting skills from successes/failures |
| **Week 4** | Enable automatic skill improvement |
| **Week 5+** | Fine-tune, add embedding search, full rollout |

### When Can You Use It?

- **Week 2**: You might see "skill injection" in logs
- **Week 3**: Notice better performance on repeated tasks
- **Week 4**: Full self-improving system active

---

## FAQ

### Q: Is this like "memory" that other AI systems have?

**A:** Similar, but better. Traditional memory stores everything (conversations, files, etc.). SkillRL extracts the *important lessons* and discards the rest. It's more efficient and more useful.

### Q: What if the agent learns something wrong?

**A:** Good question! We have safety measures:
- Skills are validated before being added
- Alex (Security) reviews for issues
- We track which skills are actually helping
- Skills that don't work can be removed

### Q: Does this work for all agents?

**A:** Yes! Each agent (Scout, Echo, Pixel, etc.) will have their own skill categories plus shared general skills.

### Q: How much does this cost to run?

**A:** Minimal! The skill storage is just JSON files. The main cost is the processing to extract skills, but that's a one-time cost per task, much cheaper than sending extra tokens every time.

### Q: Can I see the skills?

**A:** Yes! We'll have a dashboard view where you can see:
- What skills exist
- Which are being used
- Which are working best

---

## Summary

### What We're Building

A system that helps our AI agents remember what they've learned and apply it to new situations.

### Why It Matters

- **Saves money** (10-20% token reduction)
- **Gets better over time** (learns from failures)
- **Smarter context** (tips instead of verbose history)

### What You Need to Do

Nothing! It works automatically. Just keep using the agents as normal.

---

## Questions?

If you have any questions about SkillRL or the implementation:

1. **Ask Scout** (me) - I can explain in more detail
2. **Ask Codex** - For technical architecture questions
3. **Ask Echo** - For implementation details

---

## Appendix: Technical Details (For Reference)

### What Is a "Skill"?

A skill is a short piece of guidance that looks like:

```json
{
  "title": "Cross-Check Sources",
  "principle": "Verify information across multiple sources",
  "when_to_apply": "When researching factual claims"
}
```

### How Many Skills Will We Have?

- **General skills**: ~10-20 (apply to everything)
- **Task-specific skills**: ~5-10 per task type
- **Common mistakes**: ~10-20 (lessons from failures)

### How Are Skills Retrieved?

When you ask a task:
1. System understands what type of task it is
2. Looks up relevant skills
3. Injects the top 5-10 into the agent's prompt
4. Agent uses these tips while working

---

**End of User Guide**

*This document was created by Scout as part of the SkillRL research and implementation planning.*
