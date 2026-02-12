#!/usr/bin/env node
/**
 * Token Analytics Reporter
 * Generates real-time reports on token usage
 * Usage: node token_reporter.js [--baseline] [--agents] [--tools] [--recommendations]
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency/token_logs';
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function loadBaseline() {
  try {
    return JSON.parse(fs.readFileSync(path.join(LOG_DIR, 'baseline_metrics.json'), 'utf8'));
  } catch (e) {
    return null;
  }
}

function formatNumber(num) {
  return num.toLocaleString();
}

function printHeader(title) {
  console.log(`\n${COLORS.bold}${COLORS.cyan}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}  📊 ${title}${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}═══════════════════════════════════════════════════${COLORS.reset}\n`);
}

function printMetric(label, value, unit = '', status = 'neutral') {
  const color = status === 'good' ? COLORS.green : status === 'warning' ? COLORS.yellow : status === 'danger' ? COLORS.red : COLORS.white;
  console.log(`  ${label.padEnd(25)} ${color}${value}${unit}${COLORS.reset}`);
}

function showBaseline(baseline) {
  printHeader('BASELINE METRICS');
  
  console.log(`${COLORS.bold}Collection Status:${COLORS.reset}`);
  printMetric('Timestamp:', baseline.timestamp);
  printMetric('Phase:', baseline.collection_phase.toUpperCase());
  
  console.log(`\n${COLORS.bold}Summary Statistics:${COLORS.reset}`);
  printMetric('Total Sessions:', formatNumber(baseline.summary.total_sessions));
  printMetric('Total Tokens:', formatNumber(baseline.summary.total_tokens));
  printMetric('Avg Tokens/Session:', formatNumber(baseline.summary.avg_tokens_per_session));
  printMetric('Total Tool Calls:', formatNumber(baseline.summary.total_tool_calls));
  
  console.log(`\n${COLORS.bold}Budget Analysis:${COLORS.reset}`);
  const daily = baseline.summary.estimated_daily_total;
  const target = baseline.summary.target_daily_total;
  const gap = baseline.summary.reduction_needed;
  const pct = baseline.summary.reduction_percentage;
  
  printMetric('Est. Daily Usage:', formatNumber(daily), ' tokens', daily > target ? 'danger' : 'good');
  printMetric('Target Budget:', formatNumber(target), ' tokens', 'good');
  printMetric('Gap:', formatNumber(gap), ' tokens', 'danger');
  printMetric('Reduction Required:', pct, '%', pct > 50 ? 'danger' : 'warning');
}

function showAgentBreakdown(baseline) {
  printHeader('AGENT TOKEN BREAKDOWN');
  
  const agents = Object.entries(baseline.agents)
    .sort((a, b) => b[1].estimated_daily - a[1].estimated_daily);
  
  console.log(`  ${COLORS.bold}${'Agent'.padEnd(10)} ${'Role'.padEnd(15)} ${'Est. Daily'.padEnd(12)} ${'Efficiency'.padEnd(12)} Status${COLORS.reset}`);
  console.log(`  ${'-'.repeat(70)}`);
  
  agents.forEach(([agent, data]) => {
    const est = data.estimated_daily || 0;
    const target = 2143; // per agent target
    const status = est > target * 2 ? COLORS.red + '🔴 HIGH' : est > target ? COLORS.yellow + '🟡 WARN' : COLORS.green + '🟢 OK';
    const efficiency = est > 0 ? Math.round((target / est) * 100) + '%' : 'N/A';
    
    console.log(`  ${agent.padEnd(10)} ${(data.role || 'Unknown').padEnd(15)} ${formatNumber(est).padEnd(12)} ${efficiency.padEnd(12)} ${status}${COLORS.reset}`);
  });
  
  // Show actual collected data if available
  console.log(`\n${COLORS.bold}Currently Tracked (Today's Actuals):${COLORS.reset}`);
  const tracked = Object.entries(baseline.agents)
    .filter(([_, data]) => data.total_tokens > 0)
    .sort((a, b) => b[1].total_tokens - a[1].total_tokens);
  
  if (tracked.length === 0) {
    console.log(`  ${COLORS.yellow}⚠️  No session data collected yet${COLORS.reset}`);
  } else {
    tracked.forEach(([agent, data]) => {
      console.log(`  ${agent.padEnd(10)} ${formatNumber(data.total_tokens).padEnd(10)} tokens  (${data.total_sessions} sessions)`);
    });
  }
}

function showToolBreakdown(baseline) {
  printHeader('TOOL COST ANALYSIS');
  
  const tools = Object.entries(baseline.tools)
    .sort((a, b) => (b[1].total_tokens || b[1].estimated_daily) - (a[1].total_tokens || a[1].estimated_daily));
  
  console.log(`  ${COLORS.bold}${'Tool'.padEnd(15)} ${'Invocations'.padEnd(12)} ${'Tokens'.padEnd(12)} ${'Avg Cost'.padEnd(12)} Tier${COLORS.reset}`);
  console.log(`  ${'-'.repeat(70)}`);
  
  tools.forEach(([tool, data]) => {
    const tokens = data.total_tokens || data.estimated_daily || 0;
    const invocations = data.invocations || 0;
    const avg = data.avg_cost || (invocations > 0 ? Math.round(tokens / invocations) : 0);
    const tier = avg > 3000 ? COLORS.red + 'VERY_HIGH' : avg > 1000 ? COLORS.yellow + 'HIGH' : avg > 500 ? COLORS.cyan + 'MEDIUM' : COLORS.green + 'LOW';
    
    console.log(`  ${tool.padEnd(15)} ${String(invocations).padEnd(12)} ${formatNumber(tokens).padEnd(12)} ${formatNumber(avg).padEnd(12)} ${tier}${COLORS.reset}`);
  });
}

function showRecommendations(baseline) {
  printHeader('OPTIMIZATION RECOMMENDATIONS');
  
  const recommendations = [
    {
      priority: 'CRITICAL',
      agent: 'Scout',
      issue: 'Web search burning 12K+ tokens/day',
      action: 'Implement result caching, batch queries, limit results to 3',
      savings: '~6,000 tokens/day',
      color: 'red'
    },
    {
      priority: 'CRITICAL',
      agent: 'Pixel',
      issue: 'Browser automation averaging 5K tokens per use',
      action: 'Use web_fetch for static content, browser for JS-only',
      savings: '~4,000 tokens/day',
      color: 'red'
    },
    {
      priority: 'HIGH',
      agent: 'All',
      issue: 'No cache hit tracking implemented',
      action: 'Add file content hash caching for redundant reads',
      savings: '~1,500 tokens/day',
      color: 'yellow'
    },
    {
      priority: 'HIGH',
      agent: 'All',
      issue: 'Only 1 of 7 agents instrumented',
      action: 'Deploy token tracking middleware to all sessions',
      savings: '20-30% reduction via visibility',
      color: 'yellow'
    },
    {
      priority: 'MEDIUM',
      agent: 'All',
      issue: 'Context window utilization unmonitored',
      action: 'Add context length telemetry',
      savings: '~2,000 tokens/day',
      color: 'cyan'
    }
  ];
  
  recommendations.forEach((rec, i) => {
    const color = COLORS[rec.color];
    console.log(`  ${color}[${rec.priority}]${COLORS.reset} ${COLORS.bold}${rec.agent}${COLORS.reset}`);
    console.log(`    Issue:  ${rec.issue}`);
    console.log(`    Action: ${rec.action}`);
    console.log(`    ${COLORS.green}Savings: ${rec.savings}${COLORS.reset}`);
    console.log();
  });
  
  const totalSavings = 6000 + 4000 + 1500 + 5000 + 2000; // Rough estimate
  console.log(`  ${COLORS.bold}${COLORS.green}Total Potential Savings: ~${formatNumber(totalSavings)} tokens/day${COLORS.reset}`);
  console.log(`  ${COLORS.bold}This would achieve: ${COLORS.green}${Math.round((totalSavings / baseline.summary.estimated_daily_total) * 100)}% reduction${COLORS.reset}`);
}

function main() {
  const args = process.argv.slice(2);
  const showAll = args.length === 0;
  const baseline = loadBaseline();
  
  if (!baseline) {
    console.log(`${COLORS.red}❌ No baseline metrics found. Run token_tracker.js first.${COLORS.reset}`);
    process.exit(1);
  }
  
  console.log(`\n${COLORS.bold}${COLORS.magenta}╔════════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.magenta}║       AGENT AGENCY TOKEN ANALYTICS REPORTER v1.0           ║${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.magenta}╚════════════════════════════════════════════════════════════╝${COLORS.reset}`);
  
  if (showAll || args.includes('--baseline')) showBaseline(baseline);
  if (showAll || args.includes('--agents')) showAgentBreakdown(baseline);
  if (showAll || args.includes('--tools')) showToolBreakdown(baseline);
  if (showAll || args.includes('--recommendations')) showRecommendations(baseline);
  
  console.log(`\n${COLORS.bold}${COLORS.cyan}════════════════════════════════════════════════════════════${COLORS.reset}\n`);
}

main();
