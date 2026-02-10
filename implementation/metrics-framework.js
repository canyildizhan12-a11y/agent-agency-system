/**
 * 📊 Metrics Framework
 * Three-tier metrics system for Agent Agency performance tracking
 * 
 * Tier 1: Trust Metrics (promise fulfillment, time accuracy)
 * Tier 2: Value Metrics (time-to-insight, re-ask rate)  
 * Tier 3: Efficiency Metrics (token usage, redundancy)
 */

class MetricsFramework {
  constructor() {
    this.dbPath = './data/metrics-db.json';
    this.metrics = {
      trust: {},      // Tier 1
      value: {},      // Tier 2
      efficiency: {}  // Tier 3
    };
    this.interactions = [];
    this.loadDatabase();
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 1: TRUST METRICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record a promise made by the agent
   */
  recordPromise(interactionId, promise) {
    const record = {
      interactionId,
      promiseId: this.generateId(),
      timestamp: Date.now(),
      type: promise.type,           // 'delivery' | 'time' | 'quality' | 'follow-up'
      description: promise.description,
      deadline: promise.deadline || null,
      deliverable: promise.deliverable,
      status: 'pending',            // pending | fulfilled | broken
      fulfilledAt: null,
      variance: null                // time difference in ms (for time promises)
    };

    this.interactions.push({
      type: 'promise-made',
      data: record
    });

    this.persist();
    return record.promiseId;
  }

  /**
   * Mark a promise as fulfilled
   */
  fulfillPromise(promiseId, details = {}) {
    const promise = this.findPromise(promiseId);
    if (!promise) return null;

    const now = Date.now();
    promise.status = 'fulfilled';
    promise.fulfilledAt = now;
    
    if (promise.deadline) {
      promise.variance = now - promise.deadline;
      promise.onTime = promise.variance <= 0;
    }

    promise.fulfillmentDetails = details;
    this.persist();
    
    return promise;
  }

  /**
   * Mark a promise as broken
   */
  breakPromise(promiseId, reason) {
    const promise = this.findPromise(promiseId);
    if (!promise) return null;

    promise.status = 'broken';
    promise.brokenAt = Date.now();
    promise.breakReason = reason;
    
    this.persist();
    return promise;
  }

  /**
   * Calculate Tier 1 Trust Metrics
   */
  calculateTrustMetrics(timeRange = '30d') {
    const range = this.parseTimeRange(timeRange);
    const promises = this.getPromisesInRange(range);
    
    const total = promises.length;
    const fulfilled = promises.filter(p => p.status === 'fulfilled');
    const broken = promises.filter(p => p.status === 'broken');
    const pending = promises.filter(p => p.status === 'pending');
    
    // Promise Fulfillment Rate
    const fulfillmentRate = total > 0 ? fulfilled.length / total : 0;
    
    // Time Accuracy (for promises with deadlines)
    const timeBoundPromises = fulfilled.filter(p => p.deadline !== null);
    const onTime = timeBoundPromises.filter(p => p.onTime);
    const timeAccuracy = timeBoundPromises.length > 0 
      ? onTime.length / timeBoundPromises.length 
      : null;
    
    // Average variance (how early/late)
    const variances = timeBoundPromises
      .filter(p => p.variance !== null)
      .map(p => p.variance);
    
    const avgVarianceMs = variances.length > 0
      ? variances.reduce((a, b) => a + b, 0) / variances.length
      : null;

    return {
      tier: 1,
      name: 'Trust Metrics',
      period: timeRange,
      generatedAt: Date.now(),
      
      // Core KPIs
      kpi: {
        promiseFulfillmentRate: fulfillmentRate,
        timeAccuracy: timeAccuracy,
        averageVarianceMinutes: avgVarianceMs ? avgVarianceMs / 60000 : null,
        reliabilityScore: this.calculateReliabilityScore(fulfillmentRate, timeAccuracy)
      },
      
      // Breakdown
      breakdown: {
        totalPromises: total,
        fulfilled: fulfilled.length,
        broken: broken.length,
        pending: pending.length,
        withDeadline: timeBoundPromises.length,
        onTime: onTime.length,
        late: timeBoundPromises.length - onTime.length
      },
      
      // By promise type
      byType: this.groupByPromiseType(promises),
      
      // Trend (fulfillment rate over time)
      trend: this.calculateTrend(promises, 'fulfilled', 7)
    };
  }

  calculateReliabilityScore(fulfillmentRate, timeAccuracy) {
    const fWeight = 0.6;
    const tWeight = 0.4;
    
    if (timeAccuracy === null) {
      return fulfillmentRate * 100;
    }
    
    return (fulfillmentRate * fWeight + timeAccuracy * tWeight) * 100;
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: VALUE METRICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record start of an insight/query interaction
   */
  startInsightTracking(queryId, query) {
    return {
      queryId,
      query,
      startedAt: Date.now(),
      status: 'in-progress'
    };
  }

  /**
   * Complete insight tracking
   */
  completeInsight(tracking, result) {
    const completedAt = Date.now();
    const timeToInsight = completedAt - tracking.startedAt;

    const record = {
      type: 'insight',
      queryId: tracking.queryId,
      query: tracking.query,
      startedAt: tracking.startedAt,
      completedAt,
      timeToInsight,
      
      // Quality indicators
      resultType: result.type,        // 'direct' | 'research' | 'clarification-needed'
      userSatisfaction: result.satisfaction || null,  // 1-5 rating
      
      // Re-ask tracking
      relatedQueryId: result.relatedTo || null,
      isReask: !!result.relatedTo,
      reaskReason: result.reaskReason || null,
      
      // Depth metrics
      followUpsRequired: result.followUps || 0,
      iterations: result.iterations || 1,
      
      // Value assessment
      valueDelivered: result.value || null  // estimated value or impact
    };

    this.interactions.push(record);
    this.persist();
    
    return record;
  }

  /**
   * Calculate Tier 2 Value Metrics
   */
  calculateValueMetrics(timeRange = '30d') {
    const range = this.parseTimeRange(timeRange);
    const insights = this.getInsightsInRange(range);
    
    const total = insights.length;
    if (total === 0) {
      return { tier: 2, name: 'Value Metrics', totalQueries: 0 };
    }

    // Time-to-Insight
    const timeToInsights = insights.map(i => i.timeToInsight);
    const avgTimeToInsight = timeToInsights.reduce((a, b) => a + b, 0) / total;
    const medianTimeToInsight = this.median(timeToInsights);
    
    // Distribution of response times
    const under30s = timeToInsights.filter(t => t < 30000).length;
    const under2m = timeToInsights.filter(t => t < 120000).length;
    const under5m = timeToInsights.filter(t => t < 300000).length;
    
    // Re-ask Rate
    const reasks = insights.filter(i => i.isReask);
    const reaskRate = reasks.length / total;
    
    // Re-ask reasons
    const reaskReasons = {};
    reasks.forEach(r => {
      const reason = r.reaskReason || 'unknown';
      reaskReasons[reason] = (reaskReasons[reason] || 0) + 1;
    });
    
    // Satisfaction (if collected)
    const withSatisfaction = insights.filter(i => i.userSatisfaction !== null);
    const avgSatisfaction = withSatisfaction.length > 0
      ? withSatisfaction.reduce((sum, i) => sum + i.userSatisfaction, 0) / withSatisfaction.length
      : null;
    
    // First-contact resolution (no follow-ups needed)
    const fcr = insights.filter(i => i.followUpsRequired === 0).length / total;
    
    // Iterations needed
    const avgIterations = insights.reduce((sum, i) => sum + i.iterations, 0) / total;

    return {
      tier: 2,
      name: 'Value Metrics',
      period: timeRange,
      generatedAt: Date.now(),
      
      // Core KPIs
      kpi: {
        avgTimeToInsightSeconds: (avgTimeToInsight / 1000).toFixed(1),
        medianTimeToInsightSeconds: (medianTimeToInsight / 1000).toFixed(1),
        reaskRate: (reaskRate * 100).toFixed(1) + '%',
        firstContactResolution: (fcr * 100).toFixed(1) + '%',
        avgSatisfaction: avgSatisfaction ? avgSatisfaction.toFixed(1) + '/5' : 'N/A',
        valueScore: this.calculateValueScore(avgTimeToInsight, reaskRate, fcr)
      },
      
      // Time distribution
      timeDistribution: {
        under30Seconds: (under30s / total * 100).toFixed(1) + '%',
        under2Minutes: (under2m / total * 100).toFixed(1) + '%',
        under5Minutes: (under5m / total * 100).toFixed(1) + '%',
        over5Minutes: ((total - under5m) / total * 100).toFixed(1) + '%'
      },
      
      // Re-ask analysis
      reaskAnalysis: {
        totalReasks: reasks.length,
        reaskRate: (reaskRate * 100).toFixed(1) + '%',
        topReasons: Object.entries(reaskReasons)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([reason, count]) => ({ reason, count, pct: (count / reasks.length * 100).toFixed(1) + '%' }))
      },
      
      // Breakdown
      breakdown: {
        totalQueries: total,
        resolvedFirstContact: insights.filter(i => i.followUpsRequired === 0).length,
        requiredFollowUp: insights.filter(i => i.followUpsRequired > 0).length,
        avgIterations: avgIterations.toFixed(2)
      }
    };
  }

  calculateValueScore(avgTimeMs, reaskRate, fcr) {
    // Lower time = better, lower reask = better, higher FCR = better
    const timeScore = Math.max(0, 100 - (avgTimeMs / 1000 / 60) * 10); // Decay by 10pts per minute
    const reaskScore = (1 - reaskRate) * 100;
    const fcrScore = fcr * 100;
    
    return ((timeScore * 0.4 + reaskScore * 0.3 + fcrScore * 0.3)).toFixed(1);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: EFFICIENCY METRICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record resource usage for an interaction
   */
  recordResourceUsage(interactionId, usage) {
    const record = {
      type: 'resource-usage',
      interactionId,
      timestamp: Date.now(),
      
      // Token usage (if applicable)
      tokens: {
        input: usage.tokensIn || 0,
        output: usage.tokensOut || 0,
        total: (usage.tokensIn || 0) + (usage.tokensOut || 0)
      },
      
      // API calls
      apiCalls: usage.apiCalls || 0,
      
      // Tools used
      toolsUsed: usage.tools || [],
      
      // Redundancy tracking
      redundantOperations: usage.redundantOps || [],
      
      // Context window efficiency
      contextTokens: usage.contextTokens || 0,
      contextUtilization: usage.contextUtilization || null,
      
      // Cost (if tracked)
      estimatedCost: usage.cost || null
    };

    this.interactions.push(record);
    this.persist();
    
    return record;
  }

  /**
   * Calculate Tier 3 Efficiency Metrics
   */
  calculateEfficiencyMetrics(timeRange = '30d') {
    const range = this.parseTimeRange(timeRange);
    const usages = this.getResourceUsagesInRange(range);
    
    const total = usages.length;
    if (total === 0) {
      return { tier: 3, name: 'Efficiency Metrics', totalTracked: 0 };
    }

    // Token statistics
    const totalTokens = usages.reduce((sum, u) => sum + u.tokens.total, 0);
    const totalInput = usages.reduce((sum, u) => sum + u.tokens.input, 0);
    const totalOutput = usages.reduce((sum, u) => sum + u.tokens.output, 0);
    const avgTokensPerInteraction = totalTokens / total;
    
    // Token distribution
    const tokenDistribution = usages.map(u => u.tokens.total);
    const medianTokens = this.median(tokenDistribution);
    const p95Tokens = this.percentile(tokenDistribution, 95);
    
    // Redundancy analysis
    const withRedundancy = usages.filter(u => u.redundantOperations.length > 0);
    const redundancyRate = withRedundancy.length / total;
    
    const redundancyTypes = {};
    withRedundancy.forEach(u => {
      u.redundantOperations.forEach(op => {
        redundancyTypes[op.type] = (redundancyTypes[op.type] || 0) + 1;
      });
    });
    
    // Tool usage efficiency
    const allTools = usages.flatMap(u => u.toolsUsed);
    const toolCounts = {};
    allTools.forEach(t => {
      toolCounts[t] = (toolCounts[t] || 0) + 1;
    });
    
    // API efficiency
    const totalApiCalls = usages.reduce((sum, u) => sum + u.apiCalls, 0);
    const avgApiCalls = totalApiCalls / total;
    
    // Token efficiency score
    const tokenEfficiency = this.calculateTokenEfficiency(avgTokensPerInteraction, redundancyRate);

    return {
      tier: 3,
      name: 'Efficiency Metrics',
      period: timeRange,
      generatedAt: Date.now(),
      
      // Core KPIs
      kpi: {
        avgTokensPerInteraction: Math.round(avgTokensPerInteraction),
        redundancyRate: (redundancyRate * 100).toFixed(1) + '%',
        tokenEfficiencyScore: tokenEfficiency,
        apiCallsPerInteraction: avgApiCalls.toFixed(2),
        inputOutputRatio: totalInput > 0 ? (totalOutput / totalInput).toFixed(2) : 'N/A'
      },
      
      // Token breakdown
      tokens: {
        total: totalTokens,
        input: totalInput,
        output: totalOutput,
        average: Math.round(avgTokensPerInteraction),
        median: medianTokens,
        p95: p95Tokens
      },
      
      // Redundancy analysis
      redundancy: {
        interactionsWithRedundancy: withRedundancy.length,
        redundancyRate: (redundancyRate * 100).toFixed(1) + '%',
        topRedundancyTypes: Object.entries(redundancyTypes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([type, count]) => ({ type, count }))
      },
      
      // Tool usage
      toolUsage: Object.entries(toolCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tool, count]) => ({ tool, count, pct: (count / total * 100).toFixed(1) + '%' })),
      
      // Efficiency recommendations
      recommendations: this.generateEfficiencyRecommendations(redundancyTypes, toolCounts, avgTokensPerInteraction)
    };
  }

  calculateTokenEfficiency(avgTokens, redundancyRate) {
    // Ideal: < 2000 tokens, 0% redundancy
    const tokenScore = Math.max(0, 100 - (avgTokens / 2000) * 20);
    const redundancyScore = (1 - redundancyRate) * 100;
    
    return ((tokenScore * 0.6 + redundancyScore * 0.4)).toFixed(1);
  }

  generateEfficiencyRecommendations(redundancyTypes, toolCounts, avgTokens) {
    const recs = [];
    
    if (redundancyTypes['repeated-search']) {
      recs.push({
        type: 'cache',
        message: 'Frequent repeated searches detected. Consider caching recent results.',
        impact: 'high'
      });
    }
    
    if (redundancyTypes['repeated-file-read']) {
      recs.push({
        type: 'memory',
        message: 'Same files being read multiple times. Maintain session context better.',
        impact: 'medium'
      });
    }
    
    if (avgTokens > 4000) {
      recs.push({
        type: 'context',
        message: 'High average token usage. Review context management strategy.',
        impact: 'medium'
      });
    }
    
    return recs;
  }

  // ═══════════════════════════════════════════════════════════════
  // UNIFIED DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all three tiers in one call
   */
  getFullDashboard(timeRange = '30d') {
    const trust = this.calculateTrustMetrics(timeRange);
    const value = this.calculateValueMetrics(timeRange);
    const efficiency = this.calculateEfficiencyMetrics(timeRange);
    
    // Calculate composite score
    const composite = this.calculateCompositeScore(trust, value, efficiency);
    
    return {
      generatedAt: Date.now(),
      period: timeRange,
      
      summary: {
        compositeScore: composite.score,
        grade: composite.grade,
        trend: composite.trend,
        topConcern: composite.topConcern
      },
      
      tiers: {
        trust,
        value,
        efficiency
      },
      
      // Cross-tier insights
      correlations: this.findCorrelations(trust, value, efficiency),
      
      // Action items
      actionItems: this.generateActionItems(trust, value, efficiency)
    };
  }

  calculateCompositeScore(trust, value, efficiency) {
    const tScore = trust.kpi?.reliabilityScore || 0;
    const vScore = parseFloat(value.kpi?.valueScore || 0);
    const eScore = parseFloat(efficiency.kpi?.tokenEfficiencyScore || 0);
    
    const score = (tScore * 0.4 + vScore * 0.35 + eScore * 0.25).toFixed(1);
    
    let grade = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    
    // Find lowest score for concern
    const scores = [
      { name: 'Trust', value: tScore },
      { name: 'Value', value: vScore },
      { name: 'Efficiency', value: eScore }
    ];
    const lowest = scores.sort((a, b) => a.value - b.value)[0];
    
    return {
      score,
      grade,
      breakdown: { trust: tScore, value: vScore, efficiency: eScore },
      trend: 'stable', // Would calculate from historical data
      topConcern: lowest.value < 70 ? `Low ${lowest.name} performance (${lowest.value.toFixed(1)})` : null
    };
  }

  findCorrelations(trust, value, efficiency) {
    // Placeholder for cross-tier correlation analysis
    return {
      trustVsValue: 'analyzing...',
      efficiencyVsSatisfaction: 'analyzing...',
      note: 'Correlation analysis requires historical trend data'
    };
  }

  generateActionItems(trust, value, efficiency) {
    const items = [];
    
    if (trust.kpi?.promiseFulfillmentRate < 0.9) {
      items.push({ tier: 1, priority: 'high', action: 'Review promise-making patterns', metric: 'fulfillment-rate' });
    }
    
    if (parseFloat(value.kpi?.reaskRate) > 20) {
      items.push({ tier: 2, priority: 'high', action: 'Analyze top re-ask reasons and improve first-response quality', metric: 'reask-rate' });
    }
    
    if (parseFloat(efficiency.kpi?.redundancyRate) > 15) {
      items.push({ tier: 3, priority: 'medium', action: 'Implement caching for repeated operations', metric: 'redundancy' });
    }
    
    return items;
  }

  // ═══════════════════════════════════════════════════════════════
  // STORAGE HELPERS
  // ═══════════════════════════════════════════════════════════════

  loadDatabase() {
    try {
      const fs = require('fs');
      const data = fs.readFileSync(this.dbPath, 'utf8');
      const parsed = JSON.parse(data);
      this.interactions = parsed.interactions || [];
    } catch (e) {
      this.interactions = [];
    }
  }

  persist() {
    try {
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(this.dbPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.dbPath, JSON.stringify({
        interactions: this.interactions,
        lastUpdated: Date.now()
      }, null, 2));
    } catch (e) {
      console.error('Failed to persist metrics database:', e);
    }
  }

  findPromise(promiseId) {
    const event = this.interactions.find(i => 
      i.type === 'promise-made' && i.data.promiseId === promiseId
    );
    return event?.data || null;
  }

  getPromisesInRange(range) {
    return this.interactions
      .filter(i => i.type === 'promise-made')
      .map(i => i.data)
      .filter(p => p.timestamp >= range.start);
  }

  getInsightsInRange(range) {
    return this.interactions
      .filter(i => i.type === 'insight')
      .filter(i => i.startedAt >= range.start);
  }

  getResourceUsagesInRange(range) {
    return this.interactions
      .filter(i => i.type === 'resource-usage')
      .filter(i => i.timestamp >= range.start);
  }

  parseTimeRange(range) {
    const now = Date.now();
    const days = parseInt(range) || 30;
    return { start: now - (days * 24 * 60 * 60 * 1000), end: now };
  }

  groupByPromiseType(promises) {
    const groups = {};
    promises.forEach(p => {
      if (!groups[p.type]) {
        groups[p.type] = { total: 0, fulfilled: 0, broken: 0 };
      }
      groups[p.type].total++;
      if (p.status === 'fulfilled') groups[p.type].fulfilled++;
      if (p.status === 'broken') groups[p.type].broken++;
    });
    
    // Calculate rates
    for (const type in groups) {
      const g = groups[type];
      g.fulfillmentRate = g.total > 0 ? (g.fulfilled / g.total).toFixed(2) : 0;
    }
    
    return groups;
  }

  calculateTrend(items, metric, windowDays) {
    // Simplified trend - would need historical snapshots for real trend
    return { direction: 'stable', change: 0 };
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  median(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 
      ? sorted[mid] 
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  generateId() {
    return `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ═══════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = { MetricsFramework };

// Demo
if (require.main === module) {
  const metrics = new MetricsFramework();
  
  console.log('📊 Metrics Framework - Three Tier Demo');
  console.log('=======================================\n');
  
  // Simulate data
  const pid = metrics.recordPromise('int1', {
    type: 'delivery',
    description: 'Deliver market analysis',
    deadline: Date.now() + 3600000,
    deliverable: 'market-report.pdf'
  });
  metrics.fulfillPromise(pid, { delivered: true });
  
  const tracking = metrics.startInsightTracking('q1', 'market trends');
  metrics.completeInsight(tracking, {
    type: 'research',
    satisfaction: 5,
    iterations: 1
  });
  
  metrics.recordResourceUsage('int1', {
    tokensIn: 500,
    tokensOut: 1500,
    apiCalls: 3,
    tools: ['web_search', 'file_read']
  });
  
  // Show dashboard
  const dashboard = metrics.getFullDashboard('7d');
  
  console.log(`Composite Score: ${dashboard.summary.compositeScore} (${dashboard.summary.grade})`);
  console.log(`\nTier 1 - Trust: Reliability ${dashboard.tiers.trust.kpi?.reliabilityScore?.toFixed(1) || 'N/A'}`);
  console.log(`Tier 2 - Value: Score ${dashboard.tiers.value.kpi?.valueScore || 'N/A'}`);
  console.log(`Tier 3 - Efficiency: Score ${dashboard.tiers.efficiency.kpi?.tokenEfficiencyScore || 'N/A'}`);
  
  console.log('\n🎯 Action Items:');
  dashboard.actionItems.forEach(item => {
    console.log(`  [Tier ${item.tier}] ${item.action}`);
  });
}
