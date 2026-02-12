// TokenTrackingMiddleware - Auto-track tokens for all agent sessions
// Drop this into the orchestrator to enable per-agent, per-tool tracking

const fs = require('fs');
const path = require('path');

class TokenTrackingMiddleware {
  constructor() {
    this.logDir = '/home/ubuntu/.openclaw/workspace/agent-agency/token_logs';
    this.dailyFile = path.join(this.logDir, `daily_${this.getDateStamp()}.jsonl`);
    this.ensureLogDir();
  }
  
  getDateStamp() {
    return new Date().toISOString().split('T')[0];
  }
  
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  // Call this at start of agent session
  startSession(sessionId, agentId, context) {
    return {
      session_id: sessionId,
      agent_id: agentId,
      start_time: Date.now(),
      context: context || {},
      tool_calls: [],
      input_tokens: 0,
      output_tokens: 0
    };
  }
  
  // Call this when agent invokes a tool
  recordToolCall(session, toolName, params, estimatedTokens = null) {
    const toolCosts = {
      web_search: 2000,
      web_fetch: 800,
      browser: 5000,
      read: 100,
      write: 150,
      edit: 200,
      exec: 600,
      process: 200,
      message: 500,
      tts: 400
    };
    
    const toolCall = {
      timestamp: new Date().toISOString(),
      tool: toolName,
      params: this.summarizeParams(params),
      estimated_tokens: estimatedTokens || toolCosts[toolName] || 500
    };
    
    session.tool_calls.push(toolCall);
    return toolCall;
  }
  
  // Summarize params to avoid logging sensitive/large data
  summarizeParams(params) {
    if (!params) return null;
    const summary = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        summary[key] = value.length > 50 ? value.substring(0, 50) + '...' : value;
      } else if (Array.isArray(value)) {
        summary[key] = `[Array(${value.length})]`;
      } else if (typeof value === 'object') {
        summary[key] = '[Object]';
      } else {
        summary[key] = value;
      }
    }
    return summary;
  }
  
  // Call this at end of agent session
  endSession(session, finalStats) {
    const endTime = Date.now();
    const duration = endTime - session.start_time;
    
    const sessionData = {
      timestamp: new Date().toISOString(),
      session_id: session.session_id,
      agent_id: session.agent_id,
      input_tokens: finalStats.input_tokens || session.input_tokens || 0,
      output_tokens: finalStats.output_tokens || session.output_tokens || 0,
      total_tokens: (finalStats.input_tokens || session.input_tokens || 0) + 
                    (finalStats.output_tokens || session.output_tokens || 0),
      context_tokens: finalStats.context_tokens || 0,
      tool_calls: session.tool_calls,
      tool_token_cost: session.tool_calls.reduce((sum, t) => sum + t.estimated_tokens, 0),
      duration_ms: duration,
      context_summary: this.summarizeContext(session.context)
    };
    
    // Append to daily log
    fs.appendFileSync(this.dailyFile, JSON.stringify(sessionData) + '\n');
    
    // Update baseline metrics
    this.updateBaseline(session.agent_id, sessionData);
    
    return sessionData;
  }
  
  summarizeContext(context) {
    return {
      has_tools: !!context.tools,
      tool_count: context.tools?.length || 0,
      has_files: !!context.files,
      file_count: context.files?.length || 0
    };
  }
  
  updateBaseline(agentId, sessionData) {
    const baselinePath = path.join(this.logDir, 'baseline_metrics.json');
    
    try {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      
      // Update agent stats
      if (baseline.agents[agentId]) {
        baseline.agents[agentId].total_sessions++;
        baseline.agents[agentId].total_tokens += sessionData.total_tokens;
        baseline.agents[agentId].input_tokens += sessionData.input_tokens;
        baseline.agents[agentId].output_tokens += sessionData.output_tokens;
        baseline.agents[agentId].tool_calls += sessionData.tool_calls.length;
        baseline.agents[agentId].tool_tokens += sessionData.tool_token_cost;
        baseline.agents[agentId].avg_session_cost = 
          baseline.agents[agentId].total_tokens / baseline.agents[agentId].total_sessions;
        baseline.agents[agentId].last_active = sessionData.timestamp;
      }
      
      // Update tool stats
      sessionData.tool_calls.forEach(toolCall => {
        if (baseline.tools[toolCall.tool]) {
          baseline.tools[toolCall.tool].invocations++;
          baseline.tools[toolCall.tool].total_tokens += toolCall.estimated_tokens;
          if (!baseline.tools[toolCall.tool].agents[agentId]) {
            baseline.tools[toolCall.tool].agents[agentId] = 0;
          }
          baseline.tools[toolCall.tool].agents[agentId]++;
        }
      });
      
      // Update summary
      baseline.summary.total_sessions++;
      baseline.summary.total_tokens += sessionData.total_tokens;
      baseline.summary.total_tool_calls += sessionData.tool_calls.length;
      baseline.summary.avg_tokens_per_session = 
        Math.round(baseline.summary.total_tokens / baseline.summary.total_sessions);
      
      fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
    } catch (e) {
      console.error('Failed to update baseline:', e.message);
    }
  }
  
  // Get current stats for an agent
  getAgentStats(agentId) {
    const baselinePath = path.join(this.logDir, 'baseline_metrics.json');
    
    try {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      return baseline.agents[agentId] || null;
    } catch (e) {
      return null;
    }
  }
  
  // Check if agent is over budget
  isOverBudget(agentId, dailyLimit = 2143) {
    const stats = this.getAgentStats(agentId);
    if (!stats) return false;
    return stats.total_tokens > dailyLimit;
  }
  
  // Get budget warning level
  getBudgetStatus(agentId, dailyLimit = 2143) {
    const stats = this.getAgentStats(agentId);
    if (!stats) return { status: 'unknown', pct: 0 };
    
    const pct = (stats.total_tokens / dailyLimit) * 100;
    if (pct >= 100) return { status: 'exceeded', pct };
    if (pct >= 80) return { status: 'critical', pct };
    if (pct >= 50) return { status: 'warning', pct };
    return { status: 'ok', pct };
  }
}

// Export for use in orchestrator
module.exports = TokenTrackingMiddleware;

// Example usage:
// const tracker = new TokenTrackingMiddleware();
// const session = tracker.startSession('sess-123', 'henry', { task: 'fix bug' });
// tracker.recordToolCall(session, 'web_search', { query: 'javascript error' });
// tracker.endSession(session, { input_tokens: 500, output_tokens: 800 });
