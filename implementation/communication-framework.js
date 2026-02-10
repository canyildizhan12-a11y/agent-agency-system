/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     CAN-FIRST COMMUNICATION FRAMEWORK                        ║
 * ║                           By Quill ✍️                                        ║
 * ║                                                                              ║
 * ║  A response system that puts the user (Can) at the center—leading with       ║
 * ║  outcomes, respecting attention, and always offering clear next steps.       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: INFORMATION HIERARCHY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * The 3-Tier Information Pyramid
 * 
 * SURFACE (1-2 lines)     → Immediate answer: "What do I need to know NOW?"
 * SUMMARIZE (3-5 bullets) → Key points: "What are the important details?"
 * DETAIL (full text)      → Deep dive: "Tell me everything if I want it"
 */

const InformationHierarchy = {
  /**
   * TIER 1: SURFACE
   * The elevator pitch. If they read nothing else, they got the answer.
   */
  surface(template, data) {
    return template.surface(data);
  },

  /**
   * TIER 2: SUMMARIZE
   * The executive summary. Bullet points for scanning.
   */
  summarize(template, data) {
    const surface = template.surface(data);
    const bullets = template.summarize(data);
    return `${surface}\n\n${bullets.map(b => `• ${b}`).join('\n')}`;
  },

  /**
   * TIER 3: DETAIL
   * The full story. Complete context when needed.
   */
  detail(template, data) {
    const summary = this.summarize(template, data);
    const detail = template.detail(data);
    return `${summary}\n\n${detail}`;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: RESPONSE TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Template Structure:
 * - surface(data): Immediate outcome/answer (1-2 lines max)
 * - summarize(data): 3-5 bullet points of key info
 * - detail(data): Full explanation with context
 * - actionTrigger(data): Suggested next step
 */

const Templates = {

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE: Task Completion
  // ─────────────────────────────────────────────────────────────────────────────
  taskComplete: {
    name: "Task Completion",
    description: "When you've finished something the user requested",
    
    surface(data) {
      const { task, outcome, benefit } = data;
      return `✅ **${task}** — ${outcome}${benefit ? ` (${benefit})` : ''}`;
    },

    summarize(data) {
      const { whatChanged, timeSaved, location } = data;
      const bullets = [];
      if (whatChanged) bullets.push(`Changed: ${whatChanged}`);
      if (timeSaved) bullets.push(`Saved you: ${timeSaved}`);
      if (location) bullets.push(`Find it at: ${location}`);
      return bullets;
    },

    detail(data) {
      const { fullExplanation, technicalNotes } = data;
      let detail = '';
      if (fullExplanation) detail += `**What I did:**\n${fullExplanation}\n\n`;
      if (technicalNotes) detail += `**Behind the scenes:**\n${technicalNotes}`;
      return detail.trim();
    },

    actionTrigger(data) {
      const { nextStepOptions } = data;
      if (!nextStepOptions || nextStepOptions.length === 0) {
        return "Want me to do anything else with this?";
      }
      return `Want me to ${nextStepOptions.join(', ')}?`;
    },

    build(data, tier = 'summarize') {
      let response = InformationHierarchy[tier](this, data);
      const trigger = this.actionTrigger(data);
      return `${response}\n\n_${trigger}_`;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE: Research/Information Delivery
  // ─────────────────────────────────────────────────────────────────────────────
  researchDelivery: {
    name: "Research/Information",
    description: "When you've gathered information for the user",
    
    surface(data) {
      const { topic, keyFinding } = data;
      return `📊 **${topic}** — Bottom line: ${keyFinding}`;
    },

    summarize(data) {
      const { keyPoints = [] } = data;
      return keyPoints.slice(0, 5).map(point => point);
    },

    detail(data) {
      const { sources = [], deepDive = '' } = data;
      let detail = '';
      if (deepDive) detail += `${deepDive}\n\n`;
      if (sources.length > 0) {
        detail += `**Sources:**\n${sources.map(s => `• ${s}`).join('\n')}`;
      }
      return detail.trim();
    },

    actionTrigger(data) {
      const { followUpOptions = ['dig deeper', 'summarize differently'] } = data;
      return `Should I ${followUpOptions.join(' or ')}?`;
    },

    build(data, tier = 'summarize') {
      let response = InformationHierarchy[tier](this, data);
      const trigger = this.actionTrigger(data);
      return `${response}\n\n_${trigger}_`;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE: Problem/Solution
  // ─────────────────────────────────────────────────────────────────────────────
  problemSolution: {
    name: "Problem → Solution",
    description: "When there's an issue and you've resolved or identified it",
    
    surface(data) {
      const { problem, resolution } = data;
      return resolution 
        ? `✅ **Resolved:** ${problem} — ${resolution}`
        : `⚠️ **Issue found:** ${problem}`;
    },

    summarize(data) {
      const { impact, fixApplied, prevention } = data;
      const bullets = [];
      if (impact) bullets.push(`Impact: ${impact}`);
      if (fixApplied) bullets.push(`Fix applied: ${fixApplied}`);
      if (prevention) bullets.push(`Won't happen again because: ${prevention}`);
      return bullets;
    },

    detail(data) {
      const { rootCause, stepsTaken, alternatives } = data;
      let detail = '';
      if (rootCause) detail += `**What caused it:** ${rootCause}\n\n`;
      if (stepsTaken) detail += `**Steps I took:**\n${stepsTaken}\n\n`;
      if (alternatives) detail += `**Other options considered:**\n${alternatives}`;
      return detail.trim();
    },

    actionTrigger(data) {
      const { needsDecision, options = [] } = data;
      if (needsDecision && options.length > 0) {
        return `What would you prefer: ${options.join(' or ')}?`;
      }
      return "Want me to monitor this going forward?";
    },

    build(data, tier = 'summarize') {
      let response = InformationHierarchy[tier](this, data);
      const trigger = this.actionTrigger(data);
      return `${response}\n\n_${trigger}_`;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE: Proactive Alert
  // ─────────────────────────────────────────────────────────────────────────────
  proactiveAlert: {
    name: "Proactive Alert",
    description: "When you're reaching out with something important",
    
    surface(data) {
      const { what, whyMatters } = data;
      return `🔔 **${what}** — ${whyMatters}`;
    },

    summarize(data) {
      const { urgency, actionNeeded, deadline } = data;
      const bullets = [];
      if (urgency) bullets.push(`Urgency: ${urgency}`);
      if (actionNeeded) bullets.push(`Action needed: ${actionNeeded}`);
      if (deadline) bullets.push(`By when: ${deadline}`);
      return bullets;
    },

    detail(data) {
      const { context, implications, background } = data;
      let detail = '';
      if (context) detail += `**Context:** ${context}\n\n`;
      if (implications) detail += `**If you don't act:** ${implications}\n\n`;
      if (background) detail += `**Background:** ${background}`;
      return detail.trim();
    },

    actionTrigger(data) {
      const { quickOptions = [] } = data;
      if (quickOptions.length > 0) {
        return `Quick options: ${quickOptions.join(' | ')} — or tell me what you'd like.`;
      }
      return "Want me to handle this, or would you like to review first?";
    },

    build(data, tier = 'summarize') {
      let response = InformationHierarchy[tier](this, data);
      const trigger = this.actionTrigger(data);
      return `${response}\n\n_${trigger}_`;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE: Choice/Decision Required
  // ─────────────────────────────────────────────────────────────────────────────
  decisionRequired: {
    name: "Decision Required",
    description: "When the user needs to make a choice",
    
    surface(data) {
      const { decision, recommendation } = data;
      return recommendation
        ? `🤔 **Decision:** ${decision} — I'd go with: ${recommendation}`
        : `🤔 **Decision needed:** ${decision}`;
    },

    summarize(data) {
      const { options = [], prosCons } = data;
      return options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`);
    },

    detail(data) {
      const { analysis, myReasoning, tradeoffs } = data;
      let detail = '';
      if (analysis) detail += `**Analysis:**\n${analysis}\n\n`;
      if (myReasoning) detail += `**My reasoning:** ${myReasoning}\n\n`;
      if (tradeoffs) detail += `**Trade-offs:** ${tradeoffs}`;
      return detail.trim();
    },

    actionTrigger(data) {
      const { options = [] } = data;
      const letters = options.map((_, i) => String.fromCharCode(65 + i)).join('/');
      return options.length > 0 
        ? `Just reply ${letters}, or tell me what you're thinking.`
        : "What feels right to you?";
    },

    build(data, tier = 'summarize') {
      let response = InformationHierarchy[tier](this, data);
      const trigger = this.actionTrigger(data);
      return `${response}\n\n_${trigger}_`;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEMPLATE: Status Update
  // ─────────────────────────────────────────────────────────────────────────────
  statusUpdate: {
    name: "Status Update",
    description: "Progress reports on ongoing work",
    
    surface(data) {
      const { project, status } = data;
      return `📈 **${project}** — ${status}`;
    },

    summarize(data) {
      const { completed = [], inProgress = [], blocked = [] } = data;
      const bullets = [];
      if (completed.length > 0) bullets.push(`✓ Done: ${completed.join(', ')}`);
      if (inProgress.length > 0) bullets.push(`→ Working on: ${inProgress.join(', ')}`);
      if (blocked.length > 0) bullets.push(`✗ Blocked: ${blocked.join(', ')}`);
      return bullets;
    },

    detail(data) {
      const { timeline, risks, nextMilestone } = data;
      let detail = '';
      if (nextMilestone) detail += `**Next milestone:** ${nextMilestone}\n\n`;
      if (timeline) detail += `**Timeline:** ${timeline}\n\n`;
      if (risks) detail += `**Risks:** ${risks}`;
      return detail.trim();
    },

    actionTrigger(data) {
      const { canHelpWith } = data;
      if (canHelpWith) {
        return `Want me to ${canHelpWith}?`;
      }
      return "Need me to adjust priorities?";
    },

    build(data, tier = 'summarize') {
      let response = InformationHierarchy[tier](this, data);
      const trigger = this.actionTrigger(data);
      return `${response}\n\n_${trigger}_`;
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: QUICK RESPONSE BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * One-liner responses for common scenarios
 * When you don't need the full template structure
 */

const QuickResponses = {
  /**
   * Acknowledge + Action offer
   */
  acknowledge(task) {
    return `Got it — working on **${task}**. Want me to ping you when it's done, or just surprise you?`;
  },

  /**
   * Confirmation with opt-out
   */
  confirm(action, optOutTime = '5 minutes') {
    return `I'll ${action} unless you tell me otherwise in the next ${optOutTime}.`;
  },

  /**
   * Clarification request
   */
  clarify(options) {
    const opts = options.map((opt, i) => `${i + 1}) ${opt}`).join('  ');
    return `Quick clarification — ${opts}`;
  },

  /**
   * Escalation offer
   */
  escalate(situation) {
    return `This ${situation} might need your eyes on it. Want me to explain more, or handle it my way?`;
  },

  /**
   * Success + next step offer
   */
  success(what, offer) {
    return `✅ **${what}** is all set. ${offer ? `Want me to ${offer}?` : 'What should I tackle next?'}`;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * EXAMPLE 1: Task Completion (File organized)
 */
const exampleTaskComplete = Templates.taskComplete.build({
  task: "Photos organized",
  outcome: "500 vacation pics sorted by date with best shots flagged",
  benefit: "your favorites are in the 'Best Of' album",
  whatChanged: "Created 12 monthly folders + 'Best Of' collection",
  timeSaved: "~45 minutes of manual sorting",
  location: "Google Photos → Albums → 2024 Vacation",
  fullExplanation: "I scanned all 500 images, extracted EXIF dates, grouped them by month, and used image quality scoring to flag the sharpest 47 photos for your 'Best Of' album.",
  technicalNotes: "Used date-based batching and blur detection algorithms. Skipped screenshots and duplicates.",
  nextStepOptions: ['share the best ones', 'create a slideshow', 'back them up to external storage']
}, 'summarize');

/**
 * EXAMPLE 2: Research Delivery (Weather check)
 */
const exampleResearch = Templates.researchDelivery.build({
  topic: "Weekend forecast",
  keyFinding: "Saturday's perfect for hiking, Sunday bring a raincoat",
  keyPoints: [
    "Saturday: 72°F, sunny, light breeze — ideal conditions",
    "Sunday: 68°F, 60% chance rain after 2pm",
    "Trail conditions: Dry (no mud from recent weeks)",
    "Sunset: 6:47pm both days"
  ],
  sources: [
    "National Weather Service — detailed hourly",
    "AllTrails — recent hiker reports",
    "SunCalc — sunset times"
  ],
  followUpOptions: ['check a different location', 'find indoor backup activities']
}, 'summarize');

/**
 * EXAMPLE 3: Problem/Solution (Meeting conflict)
 */
const exampleProblem = Templates.problemSolution.build({
  problem: "Your 2pm and 2:30pm meetings overlap",
  resolution: "I moved the 2:30 to 3:15 — both attendees confirmed",
  impact: "Would have been 15 minutes late to second meeting",
  fixApplied: "Rescheduled to 3:15pm with calendar invite updated",
  prevention: "I added 15min buffers after your recurring meetings",
  rootCause: "Original meetings were scheduled before your time-zone change",
  stepsTaken: "1) Checked both attendees' availability 2) Proposed 3:15 slot 3) Got confirmations 4) Updated calendar"
}, 'summarize');

/**
 * EXAMPLE 4: Proactive Alert (Payment due)
 */
const exampleAlert = Templates.proactiveAlert.build({
  what: "Credit card payment due",
  whyMatters: "3 days left to avoid late fees",
  urgency: "Medium — payment due Friday",
  actionNeeded: "Schedule $847 payment",
  deadline: "February 14, 11:59 PM",
  context: "This is your Chase Sapphire card with the usual $847 minimum due",
  implications: "$29 late fee + potential interest rate increase",
  quickOptions: ['schedule payment now', 'remind me tomorrow', 'set up autopay']
}, 'summarize');

/**
 * EXAMPLE 5: Decision Required (Tool choice)
 */
const exampleDecision = Templates.decisionRequired.build({
  decision: "Which project management tool to set up",
  recommendation: "Notion — it's what your team already uses",
  options: [
    "Notion — integrates with your team's workspace",
    "Linear — better for pure software tasks",
    "ClickUp — most features, steeper learning curve"
  ],
  analysis: "Notion has 90% of what you need with zero setup friction. Linear is overkill for solo work. ClickUp's complexity isn't worth it for your use case.",
  myReasoning: "Your team's already in Notion daily. No context-switching = faster adoption.",
  tradeoffs: "Notion lacks some dev-specific features, but you can add those later if needed."
}, 'summarize');

/**
 * EXAMPLE 6: Status Update (Website migration)
 */
const exampleStatus = Templates.statusUpdate.build({
  project: "Website migration",
  status: "75% complete, on track for Friday launch",
  completed: ["Database migrated", "DNS configured", "SSL certificates installed"],
  inProgress: ["Final content review", "404 redirect mapping"],
  blocked: [],
  nextMilestone: "Content freeze by Thursday 5pm",
  timeline: "Final review tomorrow → Soft launch Thursday → Public Friday",
  risks: "Low — only risk is if you add new content after Thursday",
  canHelpWith: "run a speed test once it's live"
}, 'summarize');

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: EXPORTS & USAGE
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Core system
  InformationHierarchy,
  Templates,
  QuickResponses,
  
  // Convenience method
  respond(templateName, data, tier = 'summarize') {
    const template = Templates[templateName];
    if (!template) {
      throw new Error(`Unknown template: ${templateName}. Available: ${Object.keys(Templates).join(', ')}`);
    }
    return template.build(data, tier);
  },

  // Examples for reference
  Examples: {
    taskComplete: exampleTaskComplete,
    research: exampleResearch,
    problem: exampleProblem,
    alert: exampleAlert,
    decision: exampleDecision,
    status: exampleStatus
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: PRINT EXAMPLES (if run directly)
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log('═'.repeat(80));
  console.log('  CAN-FIRST COMMUNICATION FRAMEWORK — EXAMPLE OUTPUTS');
  console.log('═'.repeat(80));
  
  Object.entries(module.exports.Examples).forEach(([name, output]) => {
    console.log(`\n📋 ${name.toUpperCase()}`);
    console.log('─'.repeat(80));
    console.log(output);
  });
  
  console.log('\n' + '═'.repeat(80));
  console.log('  QUICK RESPONSES');
  console.log('═'.repeat(80));
  
  console.log('\n📝 Acknowledge:');
  console.log(QuickResponses.acknowledge('booking your flight'));
  
  console.log('\n📝 Confirm:');
  console.log(QuickResponses.confirm('send that email'));
  
  console.log('\n📝 Clarify:');
  console.log(QuickResponses.clarify(['morning meeting', 'afternoon meeting']));
  
  console.log('\n📝 Success:');
  console.log(QuickResponses.success('Your report', 'email it to the team'));
}
