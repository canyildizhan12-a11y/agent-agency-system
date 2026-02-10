/**
 * ⚡ Confidence-Based Escalation System
 * 
 * Decision thresholds:
 * - >90%: Auto-execute
 * - 70-90%: Propose + confirm
 * - 50-70%: Suggest + explain
 * - <50%: Ask + research
 */

class EscalationSystem {
  constructor(options = {}) {
    this.thresholds = {
      AUTO_EXECUTE: options.autoExecuteThreshold || 0.90,
      PROPOSE_CONFIRM: options.proposeThreshold || 0.70,
      SUGGEST_EXPLAIN: options.suggestThreshold || 0.50
      // <50%: ASK_RESEARCH
    };
    
    this.ACTIONS = {
      AUTO_EXECUTE: 'auto_execute',
      PROPOSE_CONFIRM: 'propose_confirm',
      SUGGEST_EXPLAIN: 'suggest_explain',
      ASK_RESEARCH: 'ask_research'
    };
    
    this.history = [];
    this.maxHistory = 100;
    
    // Confidence adjustment factors
    this.factors = {
      historicalAccuracy: 1.0,
      contextClarity: 1.0,
      stakes: 1.0,
      reversibility: 1.0
    };
  }
  
  /**
   * Evaluate confidence and determine action
   */
  evaluate(confidence, context = {}) {
    const adjustedConfidence = this._adjustConfidence(confidence, context);
    const action = this._determineAction(adjustedConfidence);
    
    const result = {
      originalConfidence: confidence,
      adjustedConfidence: adjustedConfidence,
      action: action,
      thresholds: this.thresholds,
      context: context,
      timestamp: Date.now()
    };
    
    // Record for learning
    this._recordDecision(result);
    
    return result;
  }
  
  /**
   * Adjust confidence based on context factors
   */
  _adjustConfidence(baseConfidence, context) {
    let adjusted = baseConfidence;
    
    // Historical accuracy factor (0.8 - 1.2)
    if (context.historicalAccuracy !== undefined) {
      adjusted *= (0.8 + context.historicalAccuracy * 0.4);
    }
    
    // Context clarity factor (0.9 - 1.1)
    if (context.clarity !== undefined) {
      adjusted *= (0.9 + context.clarity * 0.2);
    }
    
    // Stakes factor (reduces confidence for high-stakes)
    if (context.stakes !== undefined) {
      // Higher stakes = require higher confidence
      adjusted *= (1 - context.stakes * 0.2);
    }
    
    // Reversibility factor (increases confidence for reversible actions)
    if (context.reversible !== undefined) {
      adjusted *= (context.reversible ? 1.1 : 0.9);
    }
    
    // Time pressure factor
    if (context.urgent) {
      // Slightly lower threshold for urgent matters
      adjusted *= 1.05;
    }
    
    return Math.max(0, Math.min(1, adjusted));
  }
  
  /**
   * Determine action based on confidence
   */
  _determineAction(confidence) {
    if (confidence >= this.thresholds.AUTO_EXECUTE) {
      return {
        type: this.ACTIONS.AUTO_EXECUTE,
        confidence: confidence,
        description: 'Auto-execute without confirmation',
        requiresConfirmation: false,
        explanation: this._generateExplanation(confidence, 'auto')
      };
    }
    
    if (confidence >= this.thresholds.PROPOSE_CONFIRM) {
      return {
        type: this.ACTIONS.PROPOSE_CONFIRM,
        confidence: confidence,
        description: 'Propose action and wait for confirmation',
        requiresConfirmation: true,
        explanation: this._generateExplanation(confidence, 'propose')
      };
    }
    
    if (confidence >= this.thresholds.SUGGEST_EXPLAIN) {
      return {
        type: this.ACTIONS.SUGGEST_EXPLAIN,
        confidence: confidence,
        description: 'Suggest options with explanation',
        requiresConfirmation: true,
        explanation: this._generateExplanation(confidence, 'suggest')
      };
    }
    
    return {
      type: this.ACTIONS.ASK_RESEARCH,
      confidence: confidence,
      description: 'Ask for clarification and research',
      requiresConfirmation: true,
      explanation: this._generateExplanation(confidence, 'ask')
    };
  }
  
  /**
   * Generate human-readable explanation
   */
  _generateExplanation(confidence, level) {
    const explanations = {
      auto: [
        'High confidence based on clear patterns and historical success.',
        'Strong match with established criteria. Proceeding automatically.',
        'Confidence exceeds auto-execute threshold.'
      ],
      propose: [
        'Good confidence, but confirmation recommended before proceeding.',
        'Pattern matches are strong, but verification is prudent.',
        'This action looks correct, but please confirm.'
      ],
      suggest: [
        'Moderate confidence. Multiple options may be valid.',
        'Context suggests this direction, but alternatives exist.',
        'Unclear which approach is best. Here are my suggestions:'
      ],
      ask: [
        'Low confidence. Need more information to proceed safely.',
        'Ambiguous situation - clarification needed.',
        'Unable to determine best course of action without more context.'
      ]
    };
    
    const options = explanations[level];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  /**
   * Execute the escalation decision
   */
  async execute(decision, handlers = {}) {
    const { type } = decision.action;
    
    switch (type) {
      case this.ACTIONS.AUTO_EXECUTE:
        return await this._executeAuto(decision, handlers);
        
      case this.ACTIONS.PROPOSE_CONFIRM:
        return await this._executePropose(decision, handlers);
        
      case this.ACTIONS.SUGGEST_EXPLAIN:
        return await this._executeSuggest(decision, handlers);
        
      case this.ACTIONS.ASK_RESEARCH:
        return await this._executeAsk(decision, handlers);
        
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }
  
  /**
   * Auto-execute handler
   */
  async _executeAuto(decision, handlers) {
    if (handlers.onAutoExecute) {
      return await handlers.onAutoExecute(decision);
    }
    
    return {
      status: 'executed',
      auto: true,
      decision: decision
    };
  }
  
  /**
   * Propose + confirm handler
   */
  async _executePropose(decision, handlers) {
    const proposal = {
      type: 'proposal',
      message: decision.action.explanation,
      confidence: decision.adjustedConfidence,
      proposedAction: decision.context.proposedAction,
      alternatives: decision.context.alternatives || []
    };
    
    if (handlers.onPropose) {
      return await handlers.onPropose(decision, proposal);
    }
    
    return {
      status: 'pending_confirmation',
      proposal: proposal,
      decision: decision
    };
  }
  
  /**
   * Suggest + explain handler
   */
  async _executeSuggest(decision, handlers) {
    const suggestion = {
      type: 'suggestion',
      message: decision.action.explanation,
      confidence: decision.adjustedConfidence,
      options: decision.context.options || [
        { label: 'Option A', description: 'Description of option A' },
        { label: 'Option B', description: 'Description of option B' },
        { label: 'Option C', description: 'Let me research more' }
      ],
      reasoning: decision.context.reasoning || 'Based on available information'
    };
    
    if (handlers.onSuggest) {
      return await handlers.onSuggest(decision, suggestion);
    }
    
    return {
      status: 'suggestion',
      suggestion: suggestion,
      decision: decision
    };
  }
  
  /**
   * Ask + research handler
   */
  async _executeAsk(decision, handlers) {
    const inquiry = {
      type: 'inquiry',
      message: decision.action.explanation,
      confidence: decision.adjustedConfidence,
      questions: decision.context.questions || [
        'What is your primary goal?',
        'Are there any constraints I should know about?',
        'What would success look like?'
      ],
      researchNeeded: decision.context.researchAreas || ['general']
    };
    
    if (handlers.onAsk) {
      return await handlers.onAsk(decision, inquiry);
    }
    
    return {
      status: 'awaiting_input',
      inquiry: inquiry,
      decision: decision
    };
  }
  
  /**
   * Record decision for learning
   */
  _recordDecision(result) {
    this.history.push(result);
    
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }
  
  /**
   * Learn from feedback
   */
  learnFromFeedback(decision, feedback) {
    // Adjust thresholds based on feedback
    if (feedback.appropriate === false) {
      if (decision.action.type === this.ACTIONS.AUTO_EXECUTE) {
        // Was too aggressive, increase threshold slightly
        this.thresholds.AUTO_EXECUTE = Math.min(0.95, this.thresholds.AUTO_EXECUTE + 0.01);
      } else if (decision.action.type === this.ACTIONS.ASK_RESEARCH) {
        // Was too cautious, decrease threshold slightly  
        this.thresholds.SUGGEST_EXPLAIN = Math.max(0.3, this.thresholds.SUGGEST_EXPLAIN - 0.01);
      }
    }
    
    // Record feedback
    decision.feedback = feedback;
    decision.feedbackTimestamp = Date.now();
  }
  
  /**
   * Get statistics on decisions
   */
  getStats() {
    const stats = {
      total: this.history.length,
      byAction: {},
      averageConfidence: 0,
      thresholdAdjustments: 0
    };
    
    for (const decision of this.history) {
      const type = decision.action.type;
      stats.byAction[type] = (stats.byAction[type] || 0) + 1;
      stats.averageConfidence += decision.adjustedConfidence;
    }
    
    if (this.history.length > 0) {
      stats.averageConfidence /= this.history.length;
    }
    
    return stats;
  }
  
  /**
   * Batch evaluate multiple items
   */
  evaluateBatch(items, context = {}) {
    return items.map(item => ({
      item: item,
      evaluation: this.evaluate(item.confidence, { ...context, ...item.context })
    }));
  }
  
  /**
   * Confidence calculator for common scenarios
   */
  static calculateConfidence(signals) {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [signal, data] of Object.entries(signals)) {
      const weight = data.weight || 1;
      const confidence = data.confidence || 0;
      
      weightedSum += confidence * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

/**
 * Escalation Handler - Implements specific behaviors for each action type
 */
class EscalationHandler {
  constructor(options = {}) {
    this.confirmationFn = options.confirmationFn || this._defaultConfirmation;
    this.executionFn = options.executionFn || this._defaultExecution;
    this.notificationFn = options.notificationFn || this._defaultNotification;
  }
  
  async _defaultConfirmation(proposal) {
    // Default: return pending state
    return { confirmed: false, pending: true };
  }
  
  async _defaultExecution(action) {
    // Default: just return success
    return { executed: true, result: null };
  }
  
  async _defaultNotification(message) {
    // Default: log to console
    console.log(`[Notification] ${message}`);
  }
  
  /**
   * Handle auto-execute
   */
  async onAutoExecute(decision) {
    await this.notificationFn(`Auto-executing: ${decision.action.explanation}`);
    const result = await this.executionFn(decision.context.proposedAction);
    return { status: 'completed', result };
  }
  
  /**
   * Handle propose + confirm
   */
  async onPropose(decision, proposal) {
    await this.notificationFn(`Proposal: ${proposal.message}`);
    const confirmation = await this.confirmationFn(proposal);
    
    if (confirmation.confirmed) {
      const result = await this.executionFn(proposal.proposedAction);
      return { status: 'completed', result };
    }
    
    return { status: 'awaiting_confirmation', proposal };
  }
  
  /**
   * Handle suggest + explain
   */
  async onSuggest(decision, suggestion) {
    await this.notificationFn(`Suggestion: ${suggestion.message}`);
    return { status: 'awaiting_selection', suggestion };
  }
  
  /**
   * Handle ask + research
   */
  async onAsk(decision, inquiry) {
    await this.notificationFn(`Need more info: ${inquiry.message}`);
    return { status: 'awaiting_input', inquiry };
  }
}

/**
 * Integration with Context Router
 */
class ContextualEscalation extends EscalationSystem {
  constructor(contextRouter, options = {}) {
    super(options);
    this.contextRouter = contextRouter;
    this.modeModifiers = {
      work: { stakes: 0.3 },
      coding: { reversible: true },
      life: { stakes: 0.1 },
      research: { clarity: 0.8 },
      creative: { reversible: true }
    };
  }
  
  evaluateWithContext(confidence, extraContext = {}) {
    const context = this.contextRouter.getCurrentContext();
    const modeConfig = this.contextRouter.getModeConfig(context.mode);
    
    // Apply mode-specific modifiers
    const modifiers = this.modeModifiers[context.mode] || {};
    
    return this.evaluate(confidence, {
      ...modifiers,
      ...extraContext,
      mode: context.mode,
      modeConfidence: context.confidence
    });
  }
}

// Export for module usage
module.exports = { 
  EscalationSystem, 
  EscalationHandler, 
  ContextualEscalation 
};

// Example usage
if (require.main === module) {
  console.log('⚡ Confidence-Based Escalation System - Demo');
  console.log('=============================================\n');
  
  const escalation = new EscalationSystem();
  
  // Test different confidence levels
  const testCases = [
    { confidence: 0.95, context: { proposedAction: 'deploy_to_production' } },
    { confidence: 0.82, context: { proposedAction: 'refactor_module' } },
    { confidence: 0.65, context: { proposedAction: 'update_config', options: ['Option A', 'Option B'] } },
    { confidence: 0.40, context: { questions: ['What is the goal?', 'Any constraints?'] } },
    { confidence: 0.92, context: { stakes: 0.9, proposedAction: 'delete_database' } } // High stakes, should drop
  ];
  
  for (const test of testCases) {
    const result = escalation.evaluate(test.confidence, test.context);
    
    console.log(`Confidence: ${(test.confidence * 100).toFixed(0)}% → ${(result.adjustedConfidence * 100).toFixed(0)}%`);
    console.log(`  Action: ${result.action.type}`);
    console.log(`  Description: ${result.action.description}`);
    console.log(`  Needs confirmation: ${result.action.requiresConfirmation}`);
    console.log(`  Explanation: ${result.action.explanation}`);
    console.log('');
  }
  
  // Test batch evaluation
  console.log('📊 Batch Evaluation:');
  const batch = [
    { confidence: 0.88, context: { task: 'send_email' } },
    { confidence: 0.75, context: { task: 'schedule_meeting' } },
    { confidence: 0.55, context: { task: 'purchase_item' } },
    { confidence: 0.30, context: { task: 'hire_employee' } }
  ];
  
  const batchResults = escalation.evaluateBatch(batch);
  for (const r of batchResults) {
    console.log(`  ${r.item.context.task}: ${r.evaluation.action.type}`);
  }
  
  // Stats
  console.log('\n📈 System Statistics:');
  const stats = escalation.getStats();
  console.log(`  Total decisions: ${stats.total}`);
  console.log(`  Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
  console.log(`  By action type:`, stats.byAction);
  
  console.log('\n✅ Escalation System ready!');
}
