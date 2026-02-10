/**
 * 🔗 Agent Architecture Integration
 * 
 * Demonstrates how Context Router + Memory Architecture + Escalation System
 * work together in a unified agent system.
 */

const { ContextRouter } = require('./context-router');
const { MemoryArchitecture } = require('./memory-architecture');
const { ContextualEscalation } = require('./escalation-system');

class IntegratedAgent {
  constructor(options = {}) {
    this.router = new ContextRouter();
    this.memory = new MemoryArchitecture(options.memoryPath || './memory');
    this.escalation = new ContextualEscalation(this.router);
    
    this.initialized = false;
    this.sessionId = this._generateSessionId();
  }
  
  _generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  async init() {
    await this.memory.init();
    this.initialized = true;
    
    // Load or create session context
    const savedSession = await this.memory.read('current_session');
    if (savedSession.value) {
      this.sessionId = savedSession.value.id;
    }
    
    console.log(`🤖 Agent initialized [${this.sessionId}]`);
    return this;
  }
  
  /**
   * Process user request with full context awareness
   */
  async processRequest(request) {
    if (!this.initialized) {
      throw new Error('Agent not initialized. Call init() first.');
    }
    
    // 1. Detect context from request
    const context = this.router.detectContext({
      files: request.files || request.filePath,
      activity: request.command || request.activity,
      projectType: request.projectType
    });
    
    // 2. Store in hot memory (session context)
    this.memory.hotMemory.setSessionContext({
      mode: context.mode,
      confidence: context.confidence,
      timestamp: Date.now()
    });
    
    // 3. Get mode-specific configuration
    const modeConfig = this.router.getModeConfig(context.mode);
    
    // 4. Evaluate request confidence for escalation
    const confidence = this._calculateRequestConfidence(request, context);
    const escalation = this.escalation.evaluateWithContext(confidence, {
      proposedAction: request.intent,
      stakes: request.stakes || 0.5
    });
    
    // 5. Log to warm memory
    await this.memory.warmMemory.logEvent({
      type: 'request',
      intent: request.intent,
      context: context.mode,
      confidence: confidence,
      escalation: escalation.action.type
    });
    
    // 6. Execute based on escalation level
    const result = await this._execute(escalation, request, context);
    
    // 7. Store result
    this.memory.hotMemory.addToConversation({
      role: 'assistant',
      content: result,
      context: context.mode,
      timestamp: Date.now()
    });
    
    return {
      result,
      context,
      escalation: escalation.action,
      modeConfig
    };
  }
  
  /**
   * Calculate confidence for a request
   */
  _calculateRequestConfidence(request, context) {
    let confidence = 0.5; // Base confidence
    
    // Context clarity boost
    if (context.confidence > 0.7) {
      confidence += 0.2;
    }
    
    // Historical pattern match
    const history = this.memory.hotMemory.getConversation();
    const similarRequests = history.filter(h => 
      h.content && h.content.includes?.(request.intent)
    );
    
    if (similarRequests.length > 2) {
      confidence += 0.15;
    }
    
    // Explicit intent clarity
    if (request.intent && request.intent.length > 10) {
      confidence += 0.1;
    }
    
    return Math.min(1, confidence);
  }
  
  /**
   * Execute based on escalation level
   */
  async _execute(escalation, request, context) {
    const { type } = escalation.action;
    
    switch (type) {
      case 'auto_execute':
        return await this._autoExecute(request, context);
        
      case 'propose_confirm':
        return {
          type: 'proposal',
          message: `I understand you want to: ${request.intent}`,
          details: escalation.action.explanation,
          proposedAction: request.intent,
          requiresConfirmation: true
        };
        
      case 'suggest_explain':
        return {
          type: 'suggestion',
          message: escalation.action.explanation,
          options: this._generateOptions(request, context),
          context: context.mode
        };
        
      case 'ask_research':
        return {
          type: 'inquiry',
          message: escalation.action.explanation,
          questions: [
            `Can you clarify what you mean by "${request.intent}"?`,
            'What is your desired outcome?',
            'Are there any constraints I should know about?'
          ]
        };
        
      default:
        return { error: 'Unknown escalation type' };
    }
  }
  
  async _autoExecute(request, context) {
    // Auto-execution logic based on mode
    const mode = context.mode;
    
    if (mode === 'coding') {
      return {
        executed: true,
        action: 'code_generated',
        message: `Generated code for: ${request.intent}`,
        mode: mode
      };
    }
    
    if (mode === 'work') {
      return {
        executed: true,
        action: 'task_scheduled',
        message: `Scheduled: ${request.intent}`,
        mode: mode
      };
    }
    
    return {
      executed: true,
      action: 'processed',
      message: `Processed: ${request.intent}`,
      mode: mode
    };
  }
  
  _generateOptions(request, context) {
    const options = [];
    
    if (context.mode === 'coding') {
      options.push(
        { label: 'Generate Code', description: 'Write implementation' },
        { label: 'Review Code', description: 'Analyze existing code' },
        { label: 'Debug', description: 'Find and fix issues' }
      );
    } else if (context.mode === 'work') {
      options.push(
        { label: 'Schedule', description: 'Add to calendar' },
        { label: 'Delegate', description: 'Assign to team member' },
        { label: 'Draft', description: 'Create proposal' }
      );
    } else {
      options.push(
        { label: 'Proceed', description: 'Continue with this approach' },
        { label: 'Research', description: 'Learn more before deciding' },
        { label: 'Alternative', description: 'Explore other options' }
      );
    }
    
    return options;
  }
  
  /**
   * Get comprehensive agent state
   */
  async getState() {
    return {
      session: this.sessionId,
      context: this.router.getCurrentContext(),
      memory: this.memory.getStats(),
      escalation: this.escalation.getStats()
    };
  }
  
  /**
   * End session and archive
   */
  async endSession() {
    // Archive to cold memory
    const sessionSummary = await this._generateSessionSummary();
    await this.memory.coldMemory.set(`session_${this.sessionId}`, sessionSummary, {
      importance: 0.6,
      category: 'sessions',
      tags: ['session', 'archive']
    });
    
    // Clear hot memory
    this.memory.hotMemory.clearSession();
    
    console.log(`👋 Session ${this.sessionId} ended and archived`);
  }
  
  async _generateSessionSummary() {
    const conversation = this.memory.hotMemory.getConversation();
    const warmLogs = await this.memory.warmMemory.getDailyLogs();
    
    return {
      id: this.sessionId,
      startTime: conversation[0]?.timestamp || Date.now(),
      endTime: Date.now(),
      messageCount: conversation.length,
      modes: [...new Set(conversation.map(c => c.context))],
      events: warmLogs
    };
  }
}

// Demo
if (require.main === module) {
  async function demo() {
    console.log('🔗 Integrated Agent Architecture Demo');
    console.log('=====================================\n');
    
    const agent = new IntegratedAgent({ memoryPath: '/tmp/agent-memory' });
    await agent.init();
    
    // Simulate different requests
    const requests = [
      {
        intent: 'implement user authentication',
        files: ['/workspace/project/src/auth.js'],
        projectType: 'software',
        stakes: 0.8
      },
      {
        intent: 'schedule team meeting',
        command: 'calendar',
        stakes: 0.3
      },
      {
        intent: 'something about... not sure',
        stakes: 0.1
      }
    ];
    
    for (const request of requests) {
      console.log(`\n📨 Request: "${request.intent}"`);
      console.log(`   Stakes: ${request.stakes}, Files: ${request.files?.length || 0}`);
      
      const result = await agent.processRequest(request);
      
      console.log(`   Detected Mode: ${result.context.mode} (${(result.context.confidence * 100).toFixed(0)}%)`);
      console.log(`   Escalation: ${result.escalation.type}`);
      console.log(`   Result Type: ${result.result.type || 'direct'}`);
      
      if (result.result.message) {
        console.log(`   Message: ${result.result.message.substring(0, 60)}...`);
      }
    }
    
    console.log('\n📊 Final Agent State:');
    const state = await agent.getState();
    console.log(`   Session: ${state.session}`);
    console.log(`   Memory Tiers - Hot: ${state.memory.hotSize}, Warm: ${state.memory.warmSize}, Cold: ${state.memory.coldSize}`);
    console.log(`   Escalations: ${state.escalation.total}`);
    
    await agent.endSession();
    console.log('\n✅ Integration Demo Complete!');
  }
  
  demo().catch(console.error);
}

module.exports = { IntegratedAgent };
