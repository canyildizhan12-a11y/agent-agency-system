/**
 * 📊 Weekly Report Generator
 * Auto-generates comprehensive performance reports from metrics data
 * 
 * Outputs: Executive Summary | Tier Breakdowns | Trends | Recommendations
 */

const { ResearchROITracker } = require('./research-roi-tracker');
const { MetricsFramework } = require('./metrics-framework');

class WeeklyReportGenerator {
  constructor(options = {}) {
    this.options = {
      outputFormat: options.outputFormat || 'markdown', // markdown | json | html
      includeRawData: options.includeRawData || false,
      comparisonPeriod: options.comparisonPeriod || 'previous-week',
      ...options
    };
    
    this.roiTracker = new ResearchROITracker();
    this.metrics = new MetricsFramework();
    this.reportCache = null;
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN GENERATION PIPELINE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate complete weekly report
   */
  generateReport(weekOffset = 0) {
    const period = this.getWeekPeriod(weekOffset);
    const comparisonPeriod = this.getWeekPeriod(weekOffset + 1);
    
    console.log(`📊 Generating report for ${period.label}...`);
    
    const report = {
      meta: {
        generatedAt: Date.now(),
        generatedAtISO: new Date().toISOString(),
        period: period.label,
        periodStart: period.start,
        periodEnd: period.end,
        comparisonPeriod: comparisonPeriod.label,
        version: '1.0.0'
      },
      
      // Executive summary
      executiveSummary: this.generateExecutiveSummary(period, comparisonPeriod),
      
      // Detailed sections
      sections: {
        researchROI: this.generateResearchSection(period, comparisonPeriod),
        trustMetrics: this.generateTrustSection(period, comparisonPeriod),
        valueMetrics: this.generateValueSection(period, comparisonPeriod),
        efficiencyMetrics: this.generateEfficiencySection(period, comparisonPeriod)
      },
      
      // Analysis
      trends: this.analyzeTrends(period, comparisonPeriod),
      insights: this.generateInsights(period),
      recommendations: this.generateRecommendations(period),
      
      // Action plan
      actionPlan: this.generateActionPlan(period),
      
      // Appendices
      appendices: this.options.includeRawData ? {
        rawMetrics: this.metrics.getFullDashboard('7d'),
        rawROI: this.roiTracker.getDashboardMetrics('7d')
      } : null
    };
    
    this.reportCache = report;
    return report;
  }

  /**
   * Generate and format report for output
   */
  generate(formatted = true, weekOffset = 0) {
    const report = this.generateReport(weekOffset);
    
    if (!formatted) {
      return report;
    }
    
    switch (this.options.outputFormat) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'html':
        return this.formatAsHTML(report);
      case 'markdown':
      default:
        return this.formatAsMarkdown(report);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SECTION GENERATORS
  // ═══════════════════════════════════════════════════════════════

  generateExecutiveSummary(period, comparison) {
    const dashboard = this.metrics.getFullDashboard('7d');
    const roi = this.roiTracker.getDashboardMetrics('7d');
    
    // Calculate week-over-week changes
    const prevDashboard = this.getHistoricalMetrics(comparison);
    const scoreChange = prevDashboard 
      ? (parseFloat(dashboard.summary.compositeScore) - parseFloat(prevDashboard.summary.compositeScore))
      : 0;
    
    return {
      headline: this.generateHeadline(dashboard, scoreChange),
      compositeScore: {
        current: dashboard.summary.compositeScore,
        grade: dashboard.summary.grade,
        change: scoreChange > 0 ? `+${scoreChange.toFixed(1)}` : scoreChange.toFixed(1),
        trend: scoreChange > 0 ? 'improving' : scoreChange < 0 ? 'declining' : 'stable'
      },
      
      keyHighlights: [
        {
          metric: 'Research Conversion',
          value: `${(roi.rates.conversionRate * 100).toFixed(1)}%`,
          context: `${roi.funnel.converted} research items led to action`
        },
        {
          metric: 'Promise Fulfillment',
          value: dashboard.tiers.trust.kpi?.promiseFulfillmentRate 
            ? `${(dashboard.tiers.trust.kpi.promiseFulfillmentRate * 100).toFixed(0)}%`
            : 'N/A',
          context: 'Tier 1 Trust metric'
        },
        {
          metric: 'Avg Response Time',
          value: dashboard.tiers.value.kpi?.avgTimeToInsightSeconds 
            ? `${dashboard.tiers.value.kpi.avgTimeToInsightSeconds}s`
            : 'N/A',
          context: 'Tier 2 Value metric'
        },
        {
          metric: 'Token Efficiency',
          value: dashboard.tiers.efficiency.kpi?.tokenEfficiencyScore || 'N/A',
          context: 'Tier 3 Efficiency score'
        }
      ],
      
      criticalIssues: dashboard.summary.topConcern 
        ? [{ severity: 'high', issue: dashboard.summary.topConcern }]
        : [],
      
      wins: this.identifyWins(dashboard, roi)
    };
  }

  generateHeadline(dashboard, scoreChange) {
    const score = parseFloat(dashboard.summary.compositeScore);
    const grade = dashboard.summary.grade;
    
    if (score >= 90) {
      return `Exceptional week! ${grade}-grade performance with strong results across all tiers.`;
    } else if (score >= 80) {
      return `Solid ${grade}-grade performance. ${scoreChange > 0 ? 'Continued improvement' : 'Maintaining strong standards'}.`;
    } else if (score >= 70) {
      return `Good ${grade}-grade performance with room for improvement in ${dashboard.summary.topConcern?.split(' ')[1] || 'key areas'}.`;
    } else {
      return `Performance needs attention. Focus on ${dashboard.summary.topConcern || 'improving core metrics'}.`;
    }
  }

  identifyWins(dashboard, roi) {
    const wins = [];
    
    if (roi.rates.conversionRate > 0.3) {
      wins.push({ type: 'roi', message: 'Strong research-to-action conversion rate' });
    }
    
    if (dashboard.tiers.trust.kpi?.reliabilityScore > 85) {
      wins.push({ type: 'trust', message: 'High reliability score - promises kept' });
    }
    
    if (parseFloat(dashboard.tiers.value.kpi?.reaskRate) < 15) {
      wins.push({ type: 'value', message: 'Low re-ask rate - queries resolved first time' });
    }
    
    return wins;
  }

  generateResearchSection(period, comparison) {
    const roi = this.roiTracker.getDashboardMetrics('7d');
    const insights = this.roiTracker.getInsights();
    
    return {
      title: 'Research ROI Analysis',
      summary: {
        totalResearch: roi.totalResearch,
        totalAccesses: roi.totalAccesses,
        avgAccessesPerItem: roi.totalResearch > 0 
          ? (roi.totalAccesses / roi.totalResearch).toFixed(1) 
          : 0
      },
      
      conversionFunnel: roi.funnel,
      conversionRates: roi.rates,
      
      qualityMetrics: {
        averageRating: roi.quality.averageRating.toFixed(1),
        averageTimeToAction: roi.quality.averageTimeToActionMinutes 
          ? `${(roi.quality.averageTimeToActionMinutes / 60).toFixed(1)} hours`
          : 'N/A',
        totalActionValue: roi.quality.totalActionValue
      },
      
      topPerformers: roi.topResearch.slice(0, 5),
      underperformers: roi.underperformers,
      
      insights: insights.slice(0, 3),
      
      categoryBreakdown: this.roiTracker.analyzeByCategory()
    };
  }

  generateTrustSection(period, comparison) {
    const trust = this.metrics.calculateTrustMetrics('7d');
    
    return {
      title: 'Tier 1: Trust Metrics',
      reliability: {
        score: trust.kpi?.reliabilityScore?.toFixed(1) || 'N/A',
        fulfillmentRate: trust.kpi?.promiseFulfillmentRate 
          ? `${(trust.kpi.promiseFulfillmentRate * 100).toFixed(1)}%`
          : 'N/A',
        timeAccuracy: trust.kpi?.timeAccuracy 
          ? `${(trust.kpi.timeAccuracy * 100).toFixed(1)}%`
          : 'N/A'
      },
      
      breakdown: trust.breakdown,
      byType: trust.byType,
      trend: trust.trend
    };
  }

  generateValueSection(period, comparison) {
    const value = this.metrics.calculateValueMetrics('7d');
    
    return {
      title: 'Tier 2: Value Metrics',
      score: value.kpi?.valueScore || 'N/A',
      
      timeToInsight: {
        average: value.kpi?.avgTimeToInsightSeconds 
          ? `${value.kpi.avgTimeToInsightSeconds}s`
          : 'N/A',
        distribution: value.timeDistribution
      },
      
      queryQuality: {
        reaskRate: value.kpi?.reaskRate || 'N/A',
        firstContactResolution: value.kpi?.firstContactResolution || 'N/A',
        averageSatisfaction: value.kpi?.avgSatisfaction || 'N/A'
      },
      
      reaskAnalysis: value.reaskAnalysis,
      breakdown: value.breakdown
    };
  }

  generateEfficiencySection(period, comparison) {
    const efficiency = this.metrics.calculateEfficiencyMetrics('7d');
    
    return {
      title: 'Tier 3: Efficiency Metrics',
      score: efficiency.kpi?.tokenEfficiencyScore || 'N/A',
      
      tokenUsage: efficiency.tokens,
      apiEfficiency: {
        callsPerInteraction: efficiency.kpi?.apiCallsPerInteraction || 'N/A',
        inputOutputRatio: efficiency.kpi?.inputOutputRatio || 'N/A'
      },
      
      redundancy: efficiency.redundancy,
      topTools: efficiency.toolUsage?.slice(0, 5) || [],
      recommendations: efficiency.recommendations
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // ANALYSIS & INSIGHTS
  // ═══════════════════════════════════════════════════════════════

  analyzeTrends(period, comparison) {
    // Would compare against historical data
    // For now, provide structure
    return {
      compositeScore: { direction: 'analyzing', change: 0 },
      trust: { direction: 'analyzing', change: 0 },
      value: { direction: 'analyzing', change: 0 },
      efficiency: { direction: 'analyzing', change: 0 },
      note: 'Trend analysis requires multiple weeks of historical data'
    };
  }

  generateInsights(period) {
    const roiInsights = this.roiTracker.getInsights();
    const dashboard = this.metrics.getFullDashboard('7d');
    
    const allInsights = [
      ...roiInsights.map(i => ({ source: 'ROI', ...i })),
      ...this.extractMetricInsights(dashboard)
    ];
    
    return allInsights.slice(0, 5);
  }

  extractMetricInsights(dashboard) {
    const insights = [];
    
    if (dashboard.tiers.value.kpi?.reaskRate && parseFloat(dashboard.tiers.value.kpi.reaskRate) > 20) {
      insights.push({
        source: 'Metrics',
        type: 'warning',
        metric: 'reask-rate',
        message: `High re-ask rate (${dashboard.tiers.value.kpi.reaskRate}) suggests query understanding issues`,
        recommendation: 'Review misunderstood queries for pattern analysis'
      });
    }
    
    return insights;
  }

  generateRecommendations(period) {
    const dashboard = this.metrics.getFullDashboard('7d');
    const recommendations = [];
    
    // Priority recommendations based on lowest scores
    const scores = [
      { name: 'Trust', score: parseFloat(dashboard.tiers.trust.kpi?.reliabilityScore || 0), tier: 1 },
      { name: 'Value', score: parseFloat(dashboard.tiers.value.kpi?.valueScore || 0), tier: 2 },
      { name: 'Efficiency', score: parseFloat(dashboard.tiers.efficiency.kpi?.tokenEfficiencyScore || 0), tier: 3 }
    ].sort((a, b) => a.score - b.score);
    
    const lowest = scores[0];
    if (lowest.score < 70) {
      recommendations.push({
        priority: 'critical',
        area: lowest.name,
        action: `Focus on improving ${lowest.name.toLowerCase()} metrics - currently at ${lowest.score.toFixed(1)}`,
        expectedImpact: 'High'
      });
    }
    
    // Add ROI-specific recommendations
    const roi = this.roiTracker.getDashboardMetrics('7d');
    if (roi.rates.feedbackRate < 0.3) {
      recommendations.push({
        priority: 'high',
        area: 'Research Feedback',
        action: 'Implement inline feedback collection to increase response rate',
        expectedImpact: 'Medium'
      });
    }
    
    return recommendations;
  }

  generateActionPlan(period) {
    const actions = this.metrics.getFullDashboard('7d').actionItems || [];
    const roiInsights = this.roiTracker.getInsights();
    
    return {
      thisWeek: [
        ...actions.map(a => ({
          task: a.action,
          owner: 'Agent',
          due: 'End of week',
          priority: a.priority
        })),
        ...roiInsights
          .filter(i => i.type === 'critical')
          .map(i => ({
            task: i.recommendation,
            owner: 'Agent',
            due: 'End of week',
            priority: 'high'
          }))
      ],
      
      nextWeek: [
        { task: 'Review progress on action items', owner: 'Agent', priority: 'medium' },
        { task: 'Analyze trend data if available', owner: 'Agent', priority: 'low' }
      ]
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // FORMATTING
  // ═══════════════════════════════════════════════════════════════

  formatAsMarkdown(report) {
    const sections = [];
    
    // Header
    sections.push(`# 📊 Weekly Performance Report`);
    sections.push(`**Period:** ${report.meta.period}  `);
    sections.push(`**Generated:** ${new Date(report.meta.generatedAt).toLocaleString()}  `);
    sections.push(`**Version:** ${report.meta.version}\n`);
    
    // Executive Summary
    sections.push(`## Executive Summary\n`);
    sections.push(`> ${report.executiveSummary.headline}\n`);
    sections.push(`**Composite Score:** ${report.executiveSummary.compositeScore.current}/100 (${report.executiveSummary.compositeScore.grade})  `);
    sections.push(`**Trend:** ${report.executiveSummary.compositeScore.trend} (${report.executiveSummary.compositeScore.change})\n`);
    
    sections.push(`### Key Highlights`);
    report.executiveSummary.keyHighlights.forEach(h => {
      sections.push(`- **${h.metric}:** ${h.value} — ${h.context}`);
    });
    
    if (report.executiveSummary.wins.length > 0) {
      sections.push(`\n### 🏆 Wins This Week`);
      report.executiveSummary.wins.forEach(w => {
        sections.push(`- ${w.message}`);
      });
    }
    
    // Research ROI
    const roi = report.sections.researchROI;
    sections.push(`\n---\n\n## ${roi.title}\n`);
    sections.push(`| Metric | Value |`);
    sections.push(`|--------|-------|`);
    sections.push(`| Total Research Items | ${roi.summary.totalResearch} |`);
    sections.push(`| Total Accesses | ${roi.summary.totalAccesses} |`);
    sections.push(`| Conversion Rate | ${(roi.conversionRates.conversionRate * 100).toFixed(1)}% |`);
    sections.push(`| Avg Rating | ${roi.qualityMetrics.averageRating}/5 |`);
    
    // Trust Metrics
    const trust = report.sections.trustMetrics;
    sections.push(`\n---\n\n## ${trust.title}\n`);
    sections.push(`- **Reliability Score:** ${trust.reliability.score}/100`);
    sections.push(`- **Promise Fulfillment:** ${trust.reliability.fulfillmentRate}`);
    sections.push(`- **Time Accuracy:** ${trust.reliability.timeAccuracy}`);
    
    // Value Metrics
    const value = report.sections.valueMetrics;
    sections.push(`\n---\n\n## ${value.title}\n`);
    sections.push(`- **Value Score:** ${value.score}/100`);
    sections.push(`- **Avg Time to Insight:** ${value.timeToInsight.average}`);
    sections.push(`- **Re-ask Rate:** ${value.queryQuality.reaskRate}`);
    sections.push(`- **First Contact Resolution:** ${value.queryQuality.firstContactResolution}`);
    
    // Efficiency Metrics
    const eff = report.sections.efficiencyMetrics;
    sections.push(`\n---\n\n## ${eff.title}\n`);
    sections.push(`- **Efficiency Score:** ${eff.score}/100`);
    sections.push(`- **Avg Tokens:** ${eff.tokenUsage?.average || 'N/A'}`);
    sections.push(`- **Redundancy Rate:** ${eff.redundancy?.redundancyRate || 'N/A'}`);
    
    // Insights
    if (report.insights.length > 0) {
      sections.push(`\n---\n\n## 💡 Key Insights\n`);
      report.insights.forEach((i, idx) => {
        sections.push(`${idx + 1}. **[${i.type.toUpperCase()}]** ${i.message}`);
        if (i.recommendation) {
          sections.push(`   → *Recommendation:* ${i.recommendation}`);
        }
      });
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      sections.push(`\n---\n\n## 🎯 Recommendations\n`);
      report.recommendations.forEach((r, idx) => {
        sections.push(`${idx + 1}. **${r.priority.toUpperCase()}** — ${r.action}`);
        sections.push(`   Area: ${r.area} | Expected Impact: ${r.expectedImpact}`);
      });
    }
    
    // Action Plan
    sections.push(`\n---\n\n## ✅ Action Plan\n`);
    sections.push(`### This Week`);
    report.actionPlan.thisWeek.forEach(a => {
      sections.push(`- [ ] **${a.priority.toUpperCase()}** — ${a.task} (${a.due})`);
    });
    
    return sections.join('\n');
  }

  formatAsHTML(report) {
    // Simplified HTML output
    return `<!DOCTYPE html>
<html>
<head>
  <title>Weekly Report - ${report.meta.period}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; }
    h1 { color: #1a1a1a; border-bottom: 3px solid #4a90d9; padding-bottom: 0.5rem; }
    h2 { color: #333; margin-top: 2rem; }
    .score { font-size: 2rem; font-weight: bold; color: #4a90d9; }
    .grade { font-size: 1.5rem; color: #666; }
    .metric { background: #f5f5f5; padding: 1rem; border-radius: 8px; margin: 0.5rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>📊 Weekly Performance Report</h1>
  <p><strong>Period:</strong> ${report.meta.period}</p>
  <p><strong>Generated:</strong> ${new Date(report.meta.generatedAt).toLocaleString()}</p>
  
  <div class="metric">
    <span class="score">${report.executiveSummary.compositeScore.current}</span>
    <span class="grade">(${report.executiveSummary.compositeScore.grade})</span>
    <p>${report.executiveSummary.headline}</p>
  </div>
  
  <h2>Trust Metrics</h2>
  <p>Reliability Score: ${report.sections.trustMetrics.reliability.score}/100</p>
  
  <h2>Value Metrics</h2>
  <p>Value Score: ${report.sections.valueMetrics.score}/100</p>
  
  <h2>Efficiency Metrics</h2>
  <p>Efficiency Score: ${report.sections.efficiencyMetrics.score}/100</p>
</body>
</html>`;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  getWeekPeriod(weekOffset = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek - (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const format = (d) => d.toISOString().split('T')[0];
    
    return {
      label: weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Last Week' : `${weekOffset} Weeks Ago`,
      start: startOfWeek.getTime(),
      end: endOfWeek.getTime(),
      startISO: format(startOfWeek),
      endISO: format(endOfWeek)
    };
  }

  getHistoricalMetrics(period) {
    // Would load from historical database
    return null;
  }

  saveReport(report, filename = null) {
    const fs = require('fs');
    const path = require('path');
    
    const timestamp = new Date().toISOString().split('T')[0];
    const name = filename || `weekly-report-${timestamp}.${this.options.outputFormat === 'json' ? 'json' : 'md'}`;
    const filePath = path.join('./reports', name);
    
    if (!fs.existsSync('./reports')) {
      fs.mkdirSync('./reports', { recursive: true });
    }
    
    const content = this.options.outputFormat === 'json' 
      ? JSON.stringify(report, null, 2)
      : this.formatAsMarkdown(report);
    
    fs.writeFileSync(filePath, content);
    return filePath;
  }
}

// ═══════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = { WeeklyReportGenerator };

// CLI Demo
if (require.main === module) {
  const generator = new WeeklyReportGenerator({ outputFormat: 'markdown' });
  
  console.log('📊 Weekly Report Generator - Demo');
  console.log('==================================\n');
  
  const report = generator.generate(true);
  console.log(report);
  
  console.log('\n\n✅ Report generated successfully!');
  console.log('Use saveReport() to persist to disk.');
}
