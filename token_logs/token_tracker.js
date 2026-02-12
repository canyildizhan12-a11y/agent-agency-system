// TokenTracker - Session-level token instrumentation for Agent Agency
// Created by: Alex (Analyst)
// Purpose: Track per-agent, per-tool, per-session token usage

const fs = require('fs');
const path = require('path');

class TokenTracker {
  constructor() {
    this.logDir = '/home/ubuntu/.openclaw/workspace/agent-agency/token_logs';
    this.baselineFile = path.join(this.logDir, 'baseline_metrics.json');
    this.dailyFile = path.join(this.logDir, `daily_${this.getDateStamp()}.jsonl`);
    this.sessionStart = Date.now();
    this.metrics = {
      sessions: {},
      agents: {},
      tools: {},
      hourly: {}
    };
    
    this.initializeTracking();
  }
  
  getDateStamp() {
    return new Date().toISOString().split('T')[0];
  }
  
  initializeTracking() {
    // Initialize agent tracking
    const agents = ['henry', 'scout', 'pixel', 'echo', 'quill', 'codex', 'alex'];
    agents.forEach(agent => {
      this.metrics.agents[agent] = {
        total_sessions: 0,
        total_tokens: 0,
        input_tokens: 0,
        output_tokens: 0,
        tool_calls: 0,
        tool_tokens: 0,
        avg_session_cost: 0,
        last_active: null
      };
    });
    
    // Initialize tool tracking
    const tools = ['web_search', 'web_fetch', 'browser', 'read', 'write', 
                   'edit', 'exec', 'process', 'message', 'tts'];
    tools.forEach(tool => {
      this.metrics.tools[tool] = {
        invocations: 0,
        total_tokens: 0,
        avg_cost: 0,
        agents: {}
      };
    });
    
    console.log('📊 TokenTracker initialized');
  }
  
  recordSession(sessionId, agentId, data) {
    const timestamp = new Date().toISOString();
    const sessionData = {
      timestamp,
      session_id: sessionId,
      agent_id: agentId,
      input_tokens: data.input_tokens || 0,
      output_tokens: data.output_tokens || 0,
      total_tokens: (data.input_tokens || 0) + (data.output_tokens || 0),
      context_tokens: data.context_tokens || 0,
      tool_calls: data.tool_calls || [],
      tool_tokens: this.calculateToolTokens(data.tool_calls || []),
      duration_ms: data.duration_ms || 0
    };
    
    // Update agent metrics
    if (this.metrics.agents[agentId]) {
      this.metrics.agents[agentId].total_sessions++;
      this.metrics.agents[agentId].total_tokens += sessionData.total_tokens;
      this.metrics.agents[agentId].input_tokens += sessionData.input_tokens;
      this.metrics.agents[agentId].output_tokens += sessionData.output_tokens;
      this.metrics.agents[agentId].tool_calls += data.tool_calls?.length || 0;
      this.metrics.agents[agentId].tool_tokens += sessionData.tool_tokens;
      this.metrics.agents[agentId].avg_session_cost = 
        this.metrics.agents[agentId].total_tokens / this.metrics.agents[agentId].total_sessions;
      this.metrics.agents[agentId].last_active = timestamp;
    }
    
    // Update tool metrics
    (data.tool_calls || []).forEach(tool => {
      if (this.metrics.tools[tool.tool]) {
        this.metrics.tools[tool.tool].invocations++;
        this.metrics.tools[tool.tool].total_tokens += tool.estimated_tokens || 0;
        if (!this.metrics.tools[tool.tool].agents[agentId]) {
          this.metrics.tools[tool.tool].agents[agentId] = 0;
        }
        this.metrics.tools[tool.tool].agents[agentId]++;
      }
    });
    
    // Append to daily log
    fs.appendFileSync(this.dailyFile, JSON.stringify(sessionData) + '\n');
    
    return sessionData;
  }
  
  calculateToolTokens(toolCalls) {
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
    
    return toolCalls.reduce((total, tool) => {
      return total + (toolCosts[tool.tool] || 500);
    }, 0);
  }
  
  getBaselineMetrics() {
    return {
      timestamp: new Date().toISOString(),
      agents: this.metrics.agents,
      tools: this.metrics.tools,
      summary: {
        total_sessions: Object.values(this.metrics.agents).reduce((a, b) => a + b.total_sessions, 0),
        total_tokens: Object.values(this.metrics.agents).reduce((a, b) => a + b.total_tokens, 0),
        total_tool_calls: Object.values(this.metrics.agents).reduce((a, b) => a + b.tool_calls, 0),
        avg_tokens_per_session: 0 // Calculated below
      }
    };
  }
  
  saveBaseline() {
    const baseline = this.getBaselineMetrics();
    const totalSessions = baseline.summary.total_sessions;
    baseline.summary.avg_tokens_per_session = totalSessions > 0 
      ? Math.round(baseline.summary.total_tokens / totalSessions) 
      : 0;
    
    fs.writeFileSync(this.baselineFile, JSON.stringify(baseline, null, 2));
    return baseline;
  }
  
  generateReport() {
    const baseline = this.saveBaseline();
    
    // Sort agents by token usage
    const agentRanking = Object.entries(baseline.agents)
      .sort((a, b) => b[1].total_tokens - a[1].total_tokens)
      .map(([agent, data]) => ({
        agent,
        tokens: data.total_tokens,
        sessions: data.total_sessions,
        avg_per_session: Math.round(data.avg_session_cost),
        tool_calls: data.tool_calls,
        pct_of_total: baseline.summary.total_tokens > 0 
          ? ((data.total_tokens / baseline.summary.total_tokens) * 100).toFixed(1)
          : 0
      }));
    
    // Sort tools by usage
    const toolRanking = Object.entries(baseline.tools)
      .sort((a, b) => b[1].invocations - a[1].invocations)
      .map(([tool, data]) => ({
        tool,
        invocations: data.invocations,
        total_tokens: data.total_tokens,
        avg_cost: data.invocations > 0 ? Math.round(data.total_tokens / data.invocations) : 0
      }));
    
    return {
      baseline,
      agentRanking,
      toolRanking,
      optimization_opportunities: this.identifyWaste(agentRanking, toolRanking)
    };
  }
  
  identifyWaste(agentRanking, toolRanking) {
    const opportunities = [];
    
    // High-volume tool usage
    const highCostTools = toolRanking.filter(t => t.total_tokens > 5000);
    if (highCostTools.length > 0) {
      opportunities.push({
        type: 'high_cost_tools',
        severity: 'high',
        description: `${highCostTools.length} tools consuming >5K tokens`,
        savings_potential: `${(highCostTools.reduce((a, b) => a + b.total_tokens, 0) * 0.5).toFixed(0)} tokens`
      });
    }
    
    // Agent efficiency variance
    if (agentRanking.length > 1) {
      const avgTokens = agentRanking.reduce((a, b) => a + b.avg_per_session, 0) / agentRanking.length;
      const highBurners = agentRanking.filter(a => a.avg_per_session > avgTokens * 1.5);
      if (highBurners.length > 0) {
        opportunities.push({
          type: 'agent_inefficiency',
          severity: 'medium',
          description: `${highBurners.length} agents burning >50% above average`,
          agents: highBurners.map(a => a.agent)
        });
      }
    }
    
    return opportunities;
  }
}

module.exports = TokenTracker;

// If run directly, generate baseline report
if (require.main === module) {
  const tracker = new TokenTracker();
  const report = tracker.generateReport();
  console.log(JSON.stringify(report, null, 2));
}
