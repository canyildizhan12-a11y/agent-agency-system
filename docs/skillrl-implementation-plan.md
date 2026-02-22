# SkillRL Implementation Plan for OpenClaw

**Document Version:** 1.0  
**Date:** 2026-02-22  
**Purpose:** Technical implementation guide for Agent Agency team  
**Status:** Ready for Implementation  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Understanding SkillRL](#understanding-skillrl)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Phases](#implementation-phases)
5. [Component Specifications](#component-specifications)
6. [Agent Task Assignments](#agent-task-assignments)
7. [File Structure](#file-structure)
8. [API References](#api-references)
9. [Testing Strategy](#testing-strategy)
10. [Rollout Plan](#rollout-plan)

---

## Executive Summary

This document outlines the implementation of **SkillRL** (Skill Reinforcement Learning) framework into the OpenClaw agent system. SkillRL enables agents to learn high-level, reusable behavioral patterns from past experiences, transforming raw execution history into actionable skills that improve future performance.

### Key Benefits

- **Token Efficiency**: 10-20% reduction in context usage vs raw trajectory storage
- **Self-Improving**: Agent learns from failures and evolves its skill library
- **Hierarchical Knowledge**: Separates general strategies from task-specific heuristics
- **Better Reasoning**: Skills provide strategic guidance without verbose history

### What We'll Build

A **SkillBank** system that:
1. Records agent execution trajectories
2. Distills successful patterns into reusable skills
3. Retrieves relevant skills for new tasks
4. Evolves skills based on performance

---

## Understanding SkillRL

### The Problem

Current LLM agents operate in isolation—each task is approached fresh without learning from past experiences. Existing memory systems store raw conversation history which is:
- **Redundant**: Same patterns repeat across tasks
- **Noisy**: Irrelevant details clutter context
- **Hard to extract**: No structure for learning

### The Solution: SkillRL

SkillRL transforms raw experiences into **skills**—high-level, reusable behavioral patterns. Instead of remembering every conversation, the agent learns *principles* that can be applied to new situations.

### Core Concepts

#### 1. Skills
A skill is a structured piece of guidance:

```json
{
  "skill_id": "gen_001",
  "title": "Systematic Exploration",
  "principle": "Search every plausible location exactly once before repeating",
  "when_to_apply": "Anytime the goal is to find a specific object"
}
```

#### 2. Skill Categories

| Category | Description | Example |
|----------|-------------|---------|
| **General Skills** | Universal strategies that apply to any task | "Break down complex tasks into steps" |
| **Task-Specific Skills** | Heuristics for particular task types | "For web research: check multiple sources" |
| **Common Mistakes** | Lessons learned from failures | "Don't repeat the same failed action" |

#### 3. The Learning Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    SKILLRL PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. EXECUTE TASK                                           │
│     ┌─────────────┐                                        │
│     │   Agent     │                                        │
│     │  performs   │                                        │
│     │    task     │                                        │
│     └──────┬──────┘                                        │
│            │                                                │
│            ▼                                                │
│  2. RECORD TRAJECTORY                                      │
│     ┌─────────────┐                                        │
│     │ Trajectory  │────▶ Store: task, actions, outcome     │
│     │   Logger    │                                        │
│     └──────┬──────┘                                        │
│            │                                                │
│            ▼                                                │
│  3. SKILL DISTILLATION                                     │
│     ┌─────────────┐                                        │
│     │   Extract  │────▶ Success → General principle        │
│     │   patterns  │────▶ Failure → Lesson learned          │
│     └──────┬──────┘                                        │
│            │                                                │
│            ▼                                                │
│  4. UPDATE SKILLBANK                                       │
│     ┌─────────────┐                                        │
│     │  SkillBank  │────▶ Add new skills / update existing  │
│     │   Storage   │                                        │
│     └──────┬──────┘                                        │
│            │                                                │
│            ▼                                                │
│  5. SKILL RETRIEVAL                                        │
│     ┌─────────────┐                                        │
│     │ For new     │────▶ Match task → Retrieve top-k      │
│     │    task     │────▶ Inject skills into context        │
│     └─────────────┘                                        │
│            │                                                │
│            └────────────────┐                               │
│                             ▼                               │
│                      BACK TO STEP 1                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OPENCLAW + SKILLRL                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     AGENT LAYER                               │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │   │
│  │  │  Henry  │ │  Scout  │ │  Pixel  │ │  Echo   │  ...      │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘            │   │
│  │       │            │            │            │                  │   │
│  │       └────────────┴────────────┴────────────┘                  │   │
│  │                           │                                      │   │
│  │                    ┌──────▼──────┐                              │   │
│  │                    │ SkillInjector│  ◄── Injects skills        │   │
│  │                    │   (NEW)      │      into prompts           │   │
│  │                    └──────┬───────┘                              │   │
│  └──────────────────────────│────────────────────────────────────┘   │
│                              │                                        │
│  ┌──────────────────────────▼────────────────────────────────────┐   │
│  │                   SKILLBANK LAYER (NEW)                        │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│  │  │  Retrieval  │  │ Distillation│  │  Evolution  │            │   │
│  │  │   Engine    │  │   Process   │  │   Engine    │            │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │   │
│  │         │                │                │                    │   │
│  │         └────────────────┴────────────────┘                    │   │
│  │                          │                                      │   │
│  │                   ┌──────▼──────┐                              │   │
│  │                   │ SkillBank   │                              │   │
│  │                   │   Storage   │                              │   │
│  │                   │  (JSON)     │                              │   │
│  │                   └─────────────┘                              │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│  ┌──────────────────────────▼────────────────────────────────────┐   │
│  │                   MEMORY LAYER (Existing)                       │   │
│  │                                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │   │
│  │  │  Sessions   │  │   Memory    │  │  Trajectory │  ◄── NEW  │   │
│  │  │   Store     │  │    (MEM)    │  │    Store    │            │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘            │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
USER REQUEST
     │
     ▼
┌─────────────┐
│  Parse      │ ◄── Understand task type
│  Task       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Retrieve   │ ◄── Find relevant skills from SkillBank
│  Skills     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Inject     │ ◄── Add skills to agent prompt
│  into LLM   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Execute   │ ◄── Agent performs task
│   Task      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Record    │ ◄── Store trajectory
│  Trajectory │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Evaluate  │ ◄── Check success/failure
│   Result    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Update    │ ◄── Evolve SkillBank if needed
│  SkillBank  │
└─────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal:** Basic SkillBank storage and retrieval working

| Task | Agent | Deliverable |
|------|-------|-------------|
| Create SkillBank directory structure | Echo | `/openclaw/skillbank/` folder |
| Define TypeScript interfaces | Codex | `skill.ts` with all types |
| Implement JSON storage | Echo | `storage.ts` read/write |
| Create initial general skills | Scout | `skills/general.json` |
| Build retrieval engine (template mode) | Echo | `retrieval.ts` |
| Integrate into agent prompt injection | Echo | `skillInjector.ts` |

### Phase 2: Recording (Week 2)

**Goal:** Capture execution history for learning

| Task | Agent | Deliverable |
|------|-------|-------------|
| Design trajectory schema | Codex | `trajectory.ts` interface |
| Implement trajectory logger | Echo | `trajectoryStore.ts` |
| Add success/failure tracking | Echo | Outcome recording |
| Create trajectory query API | Echo | `getTrajectories()` |

### Phase 3: Distillation (Week 3)

**Goal:** Extract skills from trajectories

| Task | Agent | Deliverable |
|------|-------|-------------|
| Pattern extraction from successes | TBD | `distillation.ts` |
| Failure analysis module | TBD | `failureAnalyzer.ts` |
| Skill generation prompts | Scout | Prompt templates |
| Auto-skill creation pipeline | TBD | `generateSkills()` |

### Phase 4: Evolution (Week 4)

**Goal:** Self-improving skill system

| Task | Agent | Deliverable |
|------|-------|-------------|
| Success rate tracking per skill | TBD | `skillMetrics.ts` |
| Update trigger logic | TBD | `evolution.ts` |
| Deprecation mechanism | TBD | `deprecateSkill()` |
| Dynamic skill addition | TBD | `addNewSkill()` |

### Phase 5: Enhancement (Week 5+)

**Goal:** Advanced features

| Task | Agent | Deliverable |
|------|-------|-------------|
| Embedding-based retrieval | TBD | Vector similarity search |
| Task categorization | TBD | Auto-detect task type |
| Skill analytics dashboard | Vega | Usage stats UI |

---

## Component Specifications

### 1. Skill Types (`skill.ts`)

```typescript
// /openclaw/skillbank/src/skill.ts

/**
 * A single skill that guides agent behavior
 */
export interface Skill {
  /** Unique identifier */
  skill_id: string;
  /** Human-readable title */
  title: string;
  /** The actual guidance/principle */
  principle: string;
  /** When this skill should be applied */
  when_to_apply: string;
  /** Category: general, task_specific, or mistake */
  category: 'general' | 'task_specific' | 'mistake';
  /** Task type if task_specific */
  task_type?: string;
  /** Usage statistics */
  usage_count: number;
  success_count: number;
  failure_count: number;
  /** Timestamps */
  created_at: string;
  updated_at: string;
}

/**
 * Common mistakes learned from failures
 */
export interface Mistake {
  mistake_id: string;
  description: string;
  why_it_happens: string;
  how_to_avoid: string;
  occurrence_count: number;
}

/**
 * The complete SkillBank structure
 */
export interface SkillBank {
  version: string;
  general_skills: Skill[];
  task_specific_skills: Record<string, Skill[]>;
  common_mistakes: Mistake[];
  metadata: {
    total_skills: number;
    last_updated: string;
  };
}

/**
 * Skill retrieval result
 */
export interface RetrievedSkill {
  skill: Skill;
  relevance_score: number;
  source: 'general' | 'task_specific' | 'mistake';
}
```

### 2. Trajectory Types (`trajectory.ts
// /open`)

```typescriptclaw/skillbank/src/trajectory.ts

/**
 * A single action in a trajectory
 */
export interface TrajectoryStep {
  step_number: number;
  timestamp: string;
  action: string;
  input?: string;
  output?: string;
  success: boolean;
  error?: string;
}

/**
 * Complete execution trajectory
 */
export interface Trajectory {
  trajectory_id: string;
  task_type: string;
  task_description: string;
  outcome: 'success' | 'failure' | 'partial';
  failure_reason?: string;
  steps: TrajectoryStep[];
  duration_ms: number;
  tokens_used: number;
  agent_id: string;
  created_at: string;
}

/**
 * Aggregated pattern from multiple trajectories
 */
export interface Pattern {
  pattern_id: string;
  description: string;
  trajectory_count: number;
  success_rate: number;
  key_steps: string[];
}
```

### 3. Storage Module (`storage.ts`)

```typescript
// /openclaw/skillbank/src/storage.ts

import { SkillBank, Skill, Mistake } from './skill';
import { Trajectory } from './trajectory';
import fs from 'fs/promises';
import path from 'path';

const SKILLBANK_DIR = '/openclaw/skillbank';
const SKILLS_FILE = `${SKILLBANK_DIR}/skills.json`;
const TRAJECTORIES_DIR = `${SKILLBANK_DIR}/trajectories`;

/**
 * SkillBank Storage Manager
 * Handles reading/writing skills and trajectories to disk
 */
export class SkillBankStorage {
  
  /**
   * Load the complete SkillBank
   */
  async loadSkillBank(): Promise<SkillBank> {
    const data = await fs.readFile(SKILLS_FILE, 'utf-8');
    return JSON.parse(data);
  }

  /**
   * Save the SkillBank
   */
  async saveSkillBank(skillBank: SkillBank): Promise<void> {
    await fs.writeFile(SKILLS_FILE, JSON.stringify(skillBank, null, 2));
  }

  /**
   * Add a new skill
   */
  async addSkill(skill: Skill): Promise<void> {
    const bank = await this.loadSkillBank();
    
    if (skill.category === 'general') {
      bank.general_skills.push(skill);
    } else if (skill.category === 'task_specific' && skill.task_type) {
      if (!bank.task_specific_skills[skill.task_type]) {
        bank.task_specific_skills[skill.task_type] = [];
      }
      bank.task_specific_skills[skill.task_type].push(skill);
    }
    
    bank.metadata.total_skills = this.countSkills(bank);
    bank.metadata.last_updated = new Date().toISOString();
    
    await this.saveSkillBank(bank);
  }

  /**
   * Record a trajectory
   */
  async recordTrajectory(trajectory: Trajectory): Promise<void> {
    const filename = `${TRAJECTORIES_DIR}/${trajectory.trajectory_id}.json`;
    await fs.writeFile(filename, JSON.stringify(trajectory, null, 2));
  }

  /**
   * Get trajectories by outcome
   */
  async getTrajectories(
    outcome?: 'success' | 'failure',
    limit: number = 100
  ): Promise<Trajectory[]> {
    const files = await fs.readdir(TRAJECTORIES_DIR);
    const trajectories: Trajectory[] = [];
    
    for (const file of files.slice(-limit)) {
      const data = await fs.readFile(`${TRAJECTORIES_DIR}/${file}`, 'utf-8');
      const trajectory = JSON.parse(data);
      if (!outcome || trajectory.outcome === outcome) {
        trajectories.push(trajectory);
      }
    }
    
    return trajectories;
  }

  private countSkills(bank: SkillBank): number {
    let count = bank.general_skills.length;
    for (const tasks of Object.values(bank.task_specific_skills)) {
      count += tasks.length;
    }
    return count;
  }
}
```

### 4. Retrieval Engine (`retrieval.ts`)

```typescript
// /openclaw/skillbank/src/retrieval.ts

import { SkillBank, Skill, RetrievedSkill } from './skill';

/**
 * Skill Retrieval Modes
 */
export type RetrievalMode = 'template' | 'embedding';

/**
 * Configuration for retrieval
 */
export interface RetrievalConfig {
  mode: RetrievalMode;
  top_k: number;
  task_specific_top_k: number;
  task_type?: string;
}

/**
 * Template-based skill retrieval
 * Uses keyword matching to find relevant skills
 */
export class SkillRetrieval {
  
  /**
   * Retrieve skills for a given task
   */
  async retrieve(
    taskDescription: string,
    taskType: string | undefined,
    skillBank: SkillBank,
    config: RetrievalConfig
  ): Promise<RetrievedSkill[]> {
    
    const results: RetrievedSkill[] = [];
    
    // 1. Get general skills (template matching)
    const generalMatches = this.matchGeneralSkills(
      taskDescription,
      skillBank.general_skills,
      config.top_k
    );
    results.push(...generalMatches);
    
    // 2. Get task-specific skills
    if (taskType && skillBank.task_specific_skills[taskType]) {
      const taskMatches = skillBank.task_specific_skills[taskType]
        .slice(0, config.task_specific_top_k)
        .map(skill => ({
          skill,
          relevance_score: 1.0,
          source: 'task_specific' as const
        }));
      results.push(...taskMatches);
    }
    
    // 3. Get common mistakes
    const mistakeMatches = this.matchMistakes(
      taskDescription,
      skillBank.common_mistakes,
      2
    ).map(mistake => ({
      skill: this.mistakeToSkill(mistake),
      relevance_score: 0.8,
      source: 'mistake' as const
    }));
    results.push(...mistakeMatches);
    
    return results;
  }

  /**
   * Match general skills using keyword/pattern matching
   */
  private matchGeneralSkills(
    taskDescription: string,
    skills: Skill[],
    topK: number
  ): RetrievedSkill[] {
    const taskLower = taskDescription.toLowerCase();
    
    // Score each skill based on keyword overlap
    const scored = skills.map(skill => {
      const titleWords = skill.title.toLowerCase().split(' ');
      const principleWords = skill.principle.toLowerCase().split(' ');
      const whenWords = skill.when_to_apply.toLowerCase().split(' ');
      
      const allWords = [...titleWords, ...principleWords, ...whenWords];
      let score = 0;
      
      for (const word of allWords) {
        if (word.length > 3 && taskLower.includes(word)) {
          score += 1;
        }
      }
      
      return { skill, score };
    });
    
    // Sort by score and return top K
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ skill, score }) => ({
        skill,
        relevance_score: score / 10, // Normalize to 0-1
        source: 'general' as const
      }));
  }

  private matchMistakes(
    taskDescription: string,
    mistakes: any[],
    topK: number
  ): any[] {
    // Similar matching logic
    return mistakes.slice(0, topK);
  }

  private mistakeToSkill(mistake: any): Skill {
    return {
      skill_id: mistake.mistake_id,
      title: `Avoid: ${mistake.description}`,
      principle: mistake.how_to_avoid,
      when_to_apply: mistake.why_it_happens,
      category: 'mistake',
      usage_count: mistake.occurrence_count,
      success_count: 0,
      failure_count: mistake.occurrence_count,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
```

### 5. Skill Injector (`skillInjector.ts`)

```typescript
// /openclaw/skillbank/src/skillInjector.ts

import { RetrievedSkill } from './retrieval';
import { SkillRetrieval } from './retrieval';
import { SkillBankStorage } from './storage';

/**
 * Injects retrieved skills into agent prompts
 */
export class SkillInjector {
  private retrieval: SkillRetrieval;
  private storage: SkillBankStorage;

  constructor() {
    this.retrieval = new SkillRetrieval();
    this.storage = new SkillBankStorage();
  }

  /**
   * Inject skills into a prompt
   */
  async inject(
    prompt: string,
    taskType?: string
  ): Promise<{ enhancedPrompt: string; skillsUsed: string[] }> {
    
    const skillBank = await this.storage.loadSkillBank();
    
    const retrieved = await this.retrieval.retrieve(
      prompt,
      taskType,
      skillBank,
      {
        mode: 'template',
        top_k: 6,
        task_specific_top_k: 5
      }
    );
    
    if (retrieved.length === 0) {
      return { enhancedPrompt: prompt, skillsUsed: [] };
    }
    
    // Build skills section
    const skillsSection = this.buildSkillsSection(retrieved);
    
    // Prepend to prompt
    const enhancedPrompt = `${skillsSection}\n\n---\n\n${prompt}`;
    
    // Track usage
    const skillsUsed = retrieved.map(r => r.skill.skill_id);
    
    return { enhancedPrompt, skillsUsed };
  }

  /**
   * Format skills for prompt injection
   */
  private buildSkillsSection(retrieved: RetrievedSkill[]): string {
    const sections: string[] = [
      '# Relevant Skills and Guidance',
      ''
    ];
    
    // Group by source
    const general = retrieved.filter(r => r.source === 'general');
    const taskSpecific = retrieved.filter(r => r.source === 'task_specific');
    const mistakes = retrieved.filter(r => r.source === 'mistake');
    
    if (general.length > 0) {
      sections.push('## General Strategies');
      for (const { skill } of general) {
        sections.push(`- **${skill.title}**: ${skill.principle}`);
        sections.push(`  → Apply when: ${skill.when_to_apply}`);
      }
      sections.push('');
    }
    
    if (taskSpecific.length > 0) {
      sections.push('## Task-Specific Guidance');
      for (const { skill } of taskSpecific) {
        sections.push(`- **${skill.title}**: ${skill.principle}`);
      }
      sections.push('');
    }
    
    if (mistakes.length > 0) {
      sections.push('## Common Mistakes to Avoid');
      for (const { skill } of mistakes) {
        sections.push(`- **${skill.title}**: ${skill.principle}`);
      }
      sections.push('');
    }
    
    return sections.join('\n');
  }
}
```

### 6. Example Skill Data (`skills.json`)

```json
{
  "version": "1.0.0",
  "general_skills": [
    {
      "skill_id": "gen_001",
      "title": "Break Down Complex Tasks",
      "principle": "Divide complex tasks into smaller, manageable steps. Complete one step at a time and verify before proceeding.",
      "when_to_apply": "When the task involves multiple steps or unclear requirements",
      "category": "general",
      "usage_count": 0,
      "success_count": 0,
      "failure_count": 0,
      "created_at": "2026-02-22T00:00:00Z",
      "updated_at": "2026-02-22T00:00:00Z"
    },
    {
      "skill_id": "gen_002",
      "title": "Verify Before Acting",
      "principle": "Check the current state and available information before taking action. Don't assume - verify.",
      "when_to_apply": "Before executing any action that depends on external state",
      "category": "general",
      "usage_count": 0,
      "success_count": 0,
      "failure_count": 0,
      "created_at": "2026-02-22T00:00:00Z",
      "updated_at": "2026-02-22T00:00:00Z"
    },
    {
      "skill_id": "gen_003",
      "title": "Use Examples from Memory",
      "principle": "Draw parallels to similar past tasks you've completed. Apply proven approaches to new situations.",
      "when_to_apply": "When facing a task that resembles previous work",
      "category": "general",
      "usage_count": 0,
      "success_count": 0,
      "failure_count": 0,
      "created_at": "2026-02-22T00:00:00Z",
      "updated_at": "2026-02-22T00:00:00Z"
    }
  ],
  "task_specific_skills": {
    "research": [
      {
        "skill_id": "res_001",
        "title": "Cross-Check Sources",
        "principle": "Verify information across multiple independent sources before treating it as fact.",
        "when_to_apply": "When researching factual claims or important data",
        "category": "task_specific",
        "task_type": "research",
        "usage_count": 0,
        "success_count": 0,
        "failure_count": 0,
        "created_at": "2026-02-22T00:00:00Z",
        "updated_at": "2026-02-22T00:00:00Z"
      }
    ],
    "code": [
      {
        "skill_id": "cod_001",
        "title": "Read Before Write",
        "principle": "Understand existing code structure, patterns, and tests before making changes.",
        "when_to_apply": "When modifying or extending existing code",
        "category": "task_specific",
        "task_type": "code",
        "usage_count": 0,
        "success_count": 0,
        "failure_count": 0,
        "created_at": "2026-02-22T00:00:00Z",
        "updated_at": "2026-02-22T00:00:00Z"
      }
    ]
  },
  "common_mistakes": [
    {
      "mistake_id": "err_001",
      "description": "Repeating the same failed action",
      "why_it_happens": "Agent doesn't track action history or learn from failures",
      "how_to_avoid": "If an action fails, try a different approach rather than repeating",
      "occurrence_count": 0
    }
  ],
  "metadata": {
    "total_skills": 6,
    "last_updated": "2026-02-22T00:00:00Z"
  }
}
```

---

## Agent Task Assignments

### Phase 1 Detailed Tasks

#### Echo (Developer)

**Task 1.1: Create Directory Structure**
```bash
mkdir -p /openclaw/skillbank/{src,skills,trajectories,tests}
```

**Task 1.2: Implement skill.ts**
- Create TypeScript interfaces for Skill, Mistake, SkillBank
- Export all types for use by other modules

**Task 1.3: Implement storage.ts**
- JSON read/write for SkillBank
- Trajectory recording
- Query methods

**Task 1.4: Implement retrieval.ts**
- Template-based keyword matching
- Skill scoring and ranking
- Support for general + task-specific + mistakes

**Task 1.5: Create skillInjector.ts**
- Inject skills into prompts
- Format skills for LLM consumption

#### Codex (Architect)

**Task 1.6: Design Integration Points**
- Where in the agent pipeline does skill injection occur?
- How do we trigger trajectory recording?
- Define APIs for other agents to use

**Task 1.7: Review Technical Design**
- Ensure scalability
- Check for security considerations
- Validate against OpenClaw architecture

#### Scout (Researcher)

**Task 1.8: Create Initial Skills**
- Research best practices for different task types
- Create general skills based on common patterns
- Define task-specific skills for known use cases

**Task 1.9: Document Skills**
- Create skill creation guidelines
- Document skill format requirements

#### Alex (Security)

**Task 1.10: Security Review**
- Validate skill injection doesn't introduce prompt injection
- Check for malicious skill content
- Ensure proper input sanitization

---

## File Structure

```
/openclaw/
├── skillbank/
│   ├── src/
│   │   ├── skill.ts           # Types & interfaces
│   │   ├── trajectory.ts      # Trajectory types
│   │   ├── storage.ts         # SkillBank persistence
│   │   ├── retrieval.ts       # Skill retrieval engine
│   │   ├── distillation.ts    # Pattern extraction (Phase 3)
│   │   ├── evolution.ts        # Skill evolution (Phase 4)
│   │   ├── skillInjector.ts   # Prompt injection
│   │   └── index.ts           # Main exports
│   │
│   ├── skills/
│   │   ├── general.json        # General skills
│   │   └── task_specific/
│   │       ├── research.json
│   │       ├── code.json
│   │       └── ...
│   │
│   ├── trajectories/          # Recorded executions
│   │   └── (JSON files)
│   │
│   ├── tests/
│   │   ├── retrieval.test.ts
│   │   ├── storage.test.ts
│   │   └── integration.test.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── agent/
│   └── skill_injector.ts      # Integration with agent
│
└── ... (existing OpenClaw files)
```

---

## API Reference

### SkillBankStorage

```typescript
// Load entire skill bank
loadSkillBank(): Promise<SkillBank>

// Save skill bank
saveSkillBank(bank: SkillBank): Promise<void>

// Add a new skill
addSkill(skill: Skill): Promise<void>

// Record execution trajectory
recordTrajectory(trajectory: Trajectory): Promise<void>

// Query trajectories
getTrajectories(outcome?: 'success' | 'failure', limit?: number): Promise<Trajectory[]>
```

### SkillRetrieval

```typescript
// Retrieve relevant skills
retrieve(
  taskDescription: string,
  taskType: string | undefined,
  skillBank: SkillBank,
  config: RetrievalConfig
): Promise<RetrievedSkill[]>
```

### SkillInjector

```typescript
// Inject skills into prompt
inject(
  prompt: string,
  taskType?: string
): Promise<{
  enhancedPrompt: string;
  skillsUsed: string[];
}>
```

---

## Testing Strategy

### Unit Tests

| Module | Test Cases |
|--------|------------|
| storage.ts | Load, save, add skill, record trajectory |
| retrieval.ts | Template matching, scoring, ranking |
| distillation.ts | Pattern extraction accuracy |

### Integration Tests

| Scenario | Expected Result |
|----------|----------------|
| Task without skills | Original prompt returned unchanged |
| Task with matching general skills | Top-k skills injected |
| Task with task-specific type | Both general + task skills injected |
| Recording trajectory | Trajectory saved with correct data |

### Performance Tests

- Retrieval latency < 50ms
- Storage operations < 100ms
- Skill injection adds < 500 tokens to prompt

---

## Rollout Plan

### Week 1: Alpha
- Internal testing by Echo and Codex
- Manual testing of skill retrieval
- No production impact

### Week 2: Beta
- Enable for Scout agent only
- Monitor token usage
- Collect feedback

### Week 3: GA
- Enable for all agents
- Enable trajectory recording
- Monitor success rates

### Week 4+: Evolution
- Enable skill evolution (if success rate tracking shows value)
- Add embedding-based retrieval
- Continuous skill addition

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Token reduction | 10-20% vs raw history |
| Skill retrieval accuracy | >80% relevant skills |
| Task success rate | No degradation |
| Skill usage tracking | All skills tracked |

---

## Troubleshooting

### Common Issues

**Issue:** Skills not being retrieved
- Check: Is task type being passed correctly?
- Check: Are skills in correct JSON format?
- Check: Is retrieval config set correctly?

**Issue:** Too many skills injected
- Check: top_k configuration
- Check: relevance scoring thresholds

**Issue:** Performance degradation
- Check: SkillBank file size
- Consider: Embedding mode for larger skill banks

---

## Next Steps

1. **Echo**: Start with Phase 1 tasks
2. **Codex**: Design integration architecture
3. **Scout**: Create initial skill set
4. **Team**: Review this plan and provide feedback

---

**Document End**
