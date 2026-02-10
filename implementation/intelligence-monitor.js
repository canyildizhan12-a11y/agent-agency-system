/** 
 * 🔍 PROACTIVE INTELLIGENCE MONITORING SYSTEM
 * Scout's Intelligence Engine - v1.0
 * 
 * Monitors: Competitor funding, AI pricing, Reddit pain points, HN trends
 * Alerts with: "I found something interesting!" format + actionable insights
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Monitoring sources
  sources: {
    competitors: ['Day AI', '11x.ai', 'Clay', 'Apollo.io', 'Outreach', 'Salesloft'],
    aiPricing: ['Kimi', 'OpenRouter', 'Anthropic', 'OpenAI', 'Gemini'],
    redditCommunities: ['startups', 'SaaS', 'Entrepreneur', 'artificial', 'LocalLLaMA'],
    hackerNewsTags: ['AI', 'SaaS', 'funding', 'pricing', 'automation']
  },
  
  // Alert thresholds
  thresholds: {
    fundingAmount: 5000000,      // $5M+ funding rounds
    priceChange: 0.15,           // 15%+ price change
    engagementScore: 100,        // 100+ upvotes/comments
    painPointScore: 50           // 50+ pain indicators
  },
  
  // Output settings
  outputDir: path.join(__dirname, 'intelligence-reports'),
  alertHistoryFile: path.join(__dirname, 'intelligence-reports', 'alert-history.json')
};

// ============================================
// SAMPLE DATA (Replace with real API calls)
// ============================================

const SAMPLE_DATA = {
  // Sample competitor funding data
  funding: [
    {
      company: '11x.ai',
      round: 'Series A',
      amount: 24000000,
      date: '2025-01-15',
      investors: ['Andreessen Horowitz', 'Sequoia'],
      source: 'TechCrunch',
      insight: 'AI sales rep space heating up - 11x.ai raised $24M at 10x valuation from seed'
    },
    {
      company: 'Day AI',
      round: 'Seed',
      amount: 3500000,
      date: '2025-01-28',
      investors: ['Y Combinator', 'LocalGlobe'],
      source: 'LinkedIn',
      insight: 'New entrant in AI meeting intelligence - targeting SMB sales teams'
    },
    {
      company: 'Clay',
      round: 'Series B',
      amount: 46000000,
      date: '2025-02-05',
      investors: ['Tiger Global', 'Lightspeed'],
      source: 'The Information',
      insight: 'Data enrichment wars continue - Clay doubling down on AI-powered personalization'
    }
  ],
  
  // Sample AI pricing changes
  aiPricing: [
    {
      provider: 'Kimi',
      model: 'Kimi k2.5',
      change: 'increase',
      oldPrice: { input: 0.50, output: 1.50 },
      newPrice: { input: 0.60, output: 2.00 },
      date: '2025-02-08',
      percentChange: 0.33,
      insight: '20-33% price hike suggests strong demand or capacity constraints'
    },
    {
      provider: 'OpenRouter',
      model: 'Claude 3.5 Sonnet',
      change: 'decrease',
      oldPrice: { input: 3.00, output: 15.00 },
      newPrice: { input: 2.50, output: 12.50 },
      date: '2025-02-07',
      percentChange: -0.17,
      insight: 'Price war intensifying - OpenRouter passing through Anthropic cuts'
    },
    {
      provider: 'OpenAI',
      model: 'GPT-4o',
      change: 'decrease',
      oldPrice: { input: 5.00, output: 15.00 },
      newPrice: { input: 2.50, output: 10.00 },
      date: '2025-02-01',
      percentChange: -0.33,
      insight: 'Aggressive pricing to compete with Claude - margins compressing industry-wide'
    }
  ],
  
  // Sample Reddit pain points
  redditPainPoints: [
    {
      subreddit: 'startups',
      title: 'Sales outreach is killing our SDR team - anyone found a good AI solution?',
      score: 342,
      comments: 87,
      painSignals: ['burnout', 'manual work', 'low response rates', 'scaling issues'],
      date: '2025-02-09',
      insight: 'High engagement on SDR pain points - validation for AI sales tools',
      urgencyScore: 85
    },
    {
      subreddit: 'SaaS',
      title: 'Churn is through the roof since we raised prices. How to communicate value better?',
      score: 267,
      comments: 64,
      painSignals: ['churn', 'pricing sensitivity', 'value communication'],
      date: '2025-02-08',
      insight: 'Pricing optimization is top-of-mind for SaaS founders right now',
      urgencyScore: 72
    },
    {
      subreddit: 'startups',
      title: 'Prospecting data quality is our biggest bottleneck. Any reliable enrichment tools?',
      score: 189,
      comments: 45,
      painSignals: ['data quality', 'prospecting', 'enrichment', 'bottleneck'],
      date: '2025-02-07',
      insight: 'Data enrichment market showing strong demand signals',
      urgencyScore: 68
    },
    {
      subreddit: 'Entrepreneur',
      title: 'AI tools are eating my budget - $5K/month just for APIs. How to optimize?',
      score: 423,
      comments: 112,
      painSignals: ['cost', 'AI spending', 'budget optimization', 'ROI concerns'],
      date: '2025-02-06',
      insight: 'AI cost optimization is becoming a major concern - consolidation opportunity',
      urgencyScore: 91
    }
  ],
  
  // Sample Hacker News trends
  hackerNewsTrends: [
    {
      title: 'Show HN: I built an open-source AI SDR that books meetings automatically',
      points: 523,
      comments: 156,
      url: 'news.ycombinator.com/item?id=xyz123',
      tags: ['AI', 'automation', 'SaaS'],
      date: '2025-02-10',
      insight: 'Open-source AI SDRs gaining traction - differentiation through transparency?',
      trendScore: 94
    },
    {
      title: 'The state of AI pricing: Why costs are dropping faster than expected',
      points: 687,
      comments: 203,
      url: 'news.ycombinator.com/item?id=abc456',
      tags: ['AI', 'pricing'],
      date: '2025-02-09',
      insight: 'Market awareness of AI price compression - margin pressure for providers',
      trendScore: 96
    },
    {
      title: 'YC W25 batch predictions: AI infrastructure and vertical SaaS dominate',
      points: 412,
      comments: 98,
      url: 'news.ycombinator.com/item?id=def789',
      tags: ['funding', 'SaaS'],
      date: '2025-02-08',
      insight: 'YC trends indicate continued investor appetite for AI + vertical plays',
      trendScore: 78
    }
  ]
};

// ============================================
// INTELLIGENCE ENGINE
// ============================================

class IntelligenceMonitor {
  constructor(config) {
    this.config = config;
    this.alertHistory = this.loadAlertHistory();
    this.alerts = [];
  }

  loadAlertHistory() {
    try {
      if (fs.existsSync(this.config.alertHistoryFile)) {
        return JSON.parse(fs.readFileSync(this.config.alertHistoryFile, 'utf8'));
      }
    } catch (e) {
      console.warn('⚠️ Could not load alert history, starting fresh');
    }
    return { alerts: [], lastRun: null };
  }

  saveAlertHistory() {
    try {
      if (!fs.existsSync(this.config.outputDir)) {
        fs.mkdirSync(this.config.outputDir, { recursive: true });
      }
      this.alertHistory.alerts.push(...this.alerts);
      this.alertHistory.lastRun = new Date().toISOString();
      fs.writeFileSync(
        this.config.alertHistoryFile,
        JSON.stringify(this.alertHistory, null, 2)
      );
    } catch (e) {
      console.error('❌ Failed to save alert history:', e.message);
    }
  }

  // Check for significant funding rounds
  scanFunding(data) {
    const alerts = [];
    
    for (const item of data) {
      if (item.amount >= this.config.thresholds.fundingAmount) {
        const alert = {
          id: `funding-${item.company}-${item.date}`,
          type: 'COMPETITOR_FUNDING',
          priority: item.amount > 20000000 ? 'HIGH' : 'MEDIUM',
          title: `🚀 ${item.company} raised $${(item.amount / 1000000).toFixed(1)}M ${item.round}`,
          company: item.company,
          amount: item.amount,
          insight: item.insight,
          recommendations: this.generateFundingRecommendations(item),
          data: item,
          timestamp: new Date().toISOString()
        };
        alerts.push(alert);
      }
    }
    
    return alerts;
  }

  // Check for AI pricing changes
  scanPricing(data) {
    const alerts = [];
    
    for (const item of data) {
      if (Math.abs(item.percentChange) >= this.config.thresholds.priceChange) {
        const direction = item.change === 'increase' ? '📈' : '📉';
        const alert = {
          id: `pricing-${item.provider}-${item.date}`,
          type: 'AI_PRICING_CHANGE',
          priority: Math.abs(item.percentChange) > 0.30 ? 'HIGH' : 'MEDIUM',
          title: `${direction} ${item.provider} ${item.model} pricing ${item.change}d ${(Math.abs(item.percentChange) * 100).toFixed(0)}%`,
          provider: item.provider,
          percentChange: item.percentChange,
          insight: item.insight,
          recommendations: this.generatePricingRecommendations(item),
          data: item,
          timestamp: new Date().toISOString()
        };
        alerts.push(alert);
      }
    }
    
    return alerts;
  }

  // Scan Reddit for pain points
  scanReddit(data) {
    const alerts = [];
    
    for (const item of data) {
      if (item.urgencyScore >= this.config.thresholds.painPointScore) {
        const alert = {
          id: `reddit-${item.subreddit}-${item.date}`,
          type: 'MARKET_PAIN_POINT',
          priority: item.urgencyScore > 80 ? 'HIGH' : 'MEDIUM',
          title: `💡 r/${item.subreddit}: ${item.title.substring(0, 60)}...`,
          subreddit: item.subreddit,
          engagement: item.score + item.comments,
          painSignals: item.painSignals,
          insight: item.insight,
          recommendations: this.generatePainPointRecommendations(item),
          data: item,
          timestamp: new Date().toISOString()
        };
        alerts.push(alert);
      }
    }
    
    return alerts;
  }

  // Scan Hacker News for trends
  scanHackerNews(data) {
    const alerts = [];
    
    for (const item of data) {
      if (item.trendScore >= this.config.thresholds.engagementScore) {
        const alert = {
          id: `hn-${item.date}-${item.points}`,
          type: 'TRENDING_TOPIC',
          priority: item.trendScore > 90 ? 'HIGH' : 'MEDIUM',
          title: `🔥 HN Trending: ${item.title.substring(0, 60)}...`,
          points: item.points,
          comments: item.comments,
          tags: item.tags,
          insight: item.insight,
          recommendations: this.generateTrendRecommendations(item),
          data: item,
          timestamp: new Date().toISOString()
        };
        alerts.push(alert);
      }
    }
    
    return alerts;
  }

  // Generate actionable recommendations
  generateFundingRecommendations(item) {
    const recs = [];
    
    if (item.company === '11x.ai') {
      recs.push('📊 Action: Analyze their pricing page for competitive positioning');
      recs.push('🎯 Action: Review their feature set - what are they doubling down on?');
      recs.push('⚠️ Watch: Monitor their hiring - expansion into new verticals likely');
    } else if (item.company === 'Clay') {
      recs.push('🔗 Action: Check if they\'re moving upmarket or staying SMB-focused');
      recs.push('🛡️ Action: Prepare competitive response for data enrichment features');
    } else {
      recs.push('🔍 Action: Research their go-to-market strategy post-funding');
      recs.push('📈 Action: Track their customer acquisition spend in coming months');
    }
    
    recs.push(`💰 Opportunity: Their raise validates the space - positioning for partnerships/investors`);
    
    return recs;
  }

  generatePricingRecommendations(item) {
    const recs = [];
    
    if (item.change === 'increase') {
      recs.push(`✅ Opportunity: ${item.provider} becoming more expensive - price advantage window`);
      recs.push(`📊 Action: Update competitive comparison docs with new pricing`);
    } else {
      recs.push(`⚠️ Watch: Price compression means margin pressure industry-wide`);
      recs.push(`💡 Action: Consider value-adds beyond raw price (features, support, reliability)`);
    }
    
    recs.push(`🔄 Action: Review your own cost structure - can you maintain margins?`);
    
    return recs;
  }

  generatePainPointRecommendations(item) {
    const recs = [];
    
    if (item.painSignals.includes('burnout') || item.painSignals.includes('manual work')) {
      recs.push('🎯 Content: Create ROI calculator for time saved with AI SDRs');
      recs.push('📢 Marketing: Target "SDR burnout" keywords in SEO/content');
    }
    
    if (item.painSignals.includes('churn') || item.painSignals.includes('pricing')) {
      recs.push('💰 Product: Build value-based pricing calculator');
      recs.push('🎓 Content: Publish "How to communicate AI ROI to customers" guide');
    }
    
    if (item.painSignals.includes('cost') || item.painSignals.includes('budget')) {
      recs.push('🏆 Positioning: Emphasize cost efficiency vs hiring additional headcount');
      recs.push('📊 Sales: Prepare TCO (Total Cost of Ownership) comparison sheets');
    }
    
    recs.push(`🔗 Outreach: Engage in this thread with helpful, non-promotional advice`);
    
    return recs;
  }

  generateTrendRecommendations(item) {
    const recs = [];
    
    if (item.tags.includes('AI')) {
      recs.push('🤖 Strategy: Accelerate AI feature roadmap if not already doing so');
    }
    
    if (item.tags.includes('pricing')) {
      recs.push('💡 Opportunity: Position as "transparent pricing" alternative');
    }
    
    if (item.tags.includes('funding')) {
      recs.push('📈 Action: Monitor YC W25 batch for partnership/acqui-hire opportunities');
    }
    
    recs.push(`📝 Content: Reference this trend in your next thought leadership piece`);
    
    return recs;
  }

  // Format alert for display
  formatAlert(alert) {
    const lines = [
      ``,
      `╔══════════════════════════════════════════════════════════════════╗`,
      `║  🔍 SCOUT INTELLIGENCE ALERT                                     ║`,
      `╚══════════════════════════════════════════════════════════════════╝`,
      ``,
      `🎯 I found something interesting!`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `  ${alert.title}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `💡 INSIGHT:`,
      `   ${alert.insight}`,
      ``,
      `📋 ACTIONABLE RECOMMENDATIONS:`,
      ...alert.recommendations.map(r => `   ${r}`),
      ``,
      `📊 SOURCE DATA:`,
    ];
    
    // Add source-specific data
    if (alert.type === 'COMPETITOR_FUNDING') {
      lines.push(`   • Company: ${alert.data.company}`);
      lines.push(`   • Amount: $${(alert.data.amount / 1000000).toFixed(1)}M`);
      lines.push(`   • Round: ${alert.data.round}`);
      lines.push(`   • Investors: ${alert.data.investors.join(', ')}`);
    } else if (alert.type === 'AI_PRICING_CHANGE') {
      lines.push(`   • Provider: ${alert.data.provider}`);
      lines.push(`   • Model: ${alert.data.model}`);
      lines.push(`   • Change: ${(alert.data.percentChange * 100).toFixed(0)}% ${alert.data.change}`);
      lines.push(`   • New Input: $${alert.data.newPrice.input}/1M tokens`);
      lines.push(`   • New Output: $${alert.data.newPrice.output}/1M tokens`);
    } else if (alert.type === 'MARKET_PAIN_POINT') {
      lines.push(`   • Subreddit: r/${alert.data.subreddit}`);
      lines.push(`   • Upvotes: ${alert.data.score}`);
      lines.push(`   • Comments: ${alert.data.comments}`);
      lines.push(`   • Pain Signals: ${alert.data.painSignals.join(', ')}`);
    } else if (alert.type === 'TRENDING_TOPIC') {
      lines.push(`   • Points: ${alert.data.points}`);
      lines.push(`   • Comments: ${alert.data.comments}`);
      lines.push(`   • Tags: ${alert.data.tags.join(', ')}`);
    }
    
    lines.push(`   • Priority: ${alert.priority}`);
    lines.push(`   • Alert ID: ${alert.id}`);
    lines.push(`   • Detected: ${alert.timestamp}`);
    lines.push('');
    lines.push('══════════════════════════════════════════════════════════════════');
    lines.push('');
    
    return lines.join('\n');
  }

  // Generate summary report
  generateSummary() {
    const byType = {};
    const byPriority = {};
    
    for (const alert of this.alerts) {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
      byPriority[alert.priority] = (byPriority[alert.priority] || 0) + 1;
    }
    
    return {
      totalAlerts: this.alerts.length,
      highPriority: byPriority.HIGH || 0,
      mediumPriority: byPriority.MEDIUM || 0,
      byType,
      generatedAt: new Date().toISOString()
    };
  }

  // Main run method
  run(data = SAMPLE_DATA) {
    console.log('🔍 SCOUT: Initiating intelligence sweep...\n');
    
    // Run all scans
    const fundingAlerts = this.scanFunding(data.funding);
    const pricingAlerts = this.scanPricing(data.aiPricing);
    const redditAlerts = this.scanReddit(data.redditPainPoints);
    const hnAlerts = this.scanHackerNews(data.hackerNewsTrends);
    
    // Combine all alerts
    this.alerts = [...fundingAlerts, ...pricingAlerts, ...redditAlerts, ...hnAlerts];
    
    // Deduplicate by ID
    const seen = new Set();
    this.alerts = this.alerts.filter(alert => {
      if (seen.has(alert.id)) return false;
      seen.add(alert.id);
      return true;
    });
    
    // Sort by priority
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    this.alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Display results
    console.log(`✅ Intelligence sweep complete! Found ${this.alerts.length} actionable insights.\n`);
    
    for (const alert of this.alerts) {
      console.log(this.formatAlert(alert));
    }
    
    // Generate and display summary
    const summary = this.generateSummary();
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  📊 INTELLIGENCE SUMMARY                                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log(`   Total Alerts: ${summary.totalAlerts}`);
    console.log(`   🔴 High Priority: ${summary.highPriority}`);
    console.log(`   🟡 Medium Priority: ${summary.mediumPriority}`);
    console.log('\n   By Category:');
    for (const [type, count] of Object.entries(summary.byType)) {
      console.log(`   • ${type}: ${count}`);
    }
    console.log('\n══════════════════════════════════════════════════════════════════\n');
    
    // Save to history
    this.saveAlertHistory();
    
    return {
      alerts: this.alerts,
      summary
    };
  }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

class NotificationEngine {
  constructor(config) {
    this.config = config;
    this.channels = [];
  }

  // Add notification channel
  addChannel(name, handler) {
    this.channels.push({ name, handler });
  }

  // Send notification to all channels
  async notify(alert) {
    const results = [];
    
    for (const channel of this.channels) {
      try {
        const result = await channel.handler(alert);
        results.push({ channel: channel.name, success: true, result });
      } catch (e) {
        results.push({ channel: channel.name, success: false, error: e.message });
      }
    }
    
    return results;
  }

  // Send batch notification
  async notifyBatch(alerts) {
    const results = [];
    
    for (const alert of alerts) {
      const result = await this.notify(alert);
      results.push({ alert: alert.id, channels: result });
    }
    
    return results;
  }
}

// ============================================
// SAMPLE NOTIFICATION HANDLERS
// ============================================

// Console notification (default)
const consoleNotifier = (alert) => {
  const monitor = new IntelligenceMonitor(CONFIG);
  console.log(monitor.formatAlert(alert));
  return { delivered: true, timestamp: new Date().toISOString() };
};

// File notification - saves to file
const fileNotifier = (alert) => {
  const filePath = path.join(CONFIG.outputDir, `alert-${alert.id.replace(/[^a-zA-Z0-9]/g, '-')}.json`);
  
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(alert, null, 2));
  return { delivered: true, filePath, timestamp: new Date().toISOString() };
};

// Webhook notification (example for Discord/Slack)
const webhookNotifier = async (alert) => {
  // This would make an HTTP request in production
  // Example: POST to Discord webhook
  
  const payload = {
    content: `🔍 **Scout Intelligence Alert**`,
    embeds: [{
      title: alert.title,
      description: alert.insight,
      color: alert.priority === 'HIGH' ? 0xff0000 : 0xffa500,
      fields: [
        { name: 'Type', value: alert.type, inline: true },
        { name: 'Priority', value: alert.priority, inline: true },
        { name: 'Recommendations', value: alert.recommendations.slice(0, 3).join('\n') }
      ],
      timestamp: alert.timestamp
    }]
  };
  
  // In production:
  // await fetch(process.env.DISCORD_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload)
  // });
  
  return { 
    delivered: true, 
    simulated: true,
    payload,
    timestamp: new Date().toISOString() 
  };
};

// ============================================
// DATA FETCHERS (Templates for real APIs)
// ============================================

class DataFetchers {
  // Crunchbase/Dealroom API for funding data
  static async fetchFundingData(companies) {
    // In production, use:
    // - Crunchbase API
    // - Dealroom API
    // - PitchBook API
    // - Manual RSS scraping from TechCrunch, VentureBeat, etc.
    
    console.log(`[Fetcher] Would fetch funding data for: ${companies.join(', ')}`);
    return SAMPLE_DATA.funding;
  }

  // OpenRouter, Kimi, etc. for pricing
  static async fetchPricingData(providers) {
    // In production, scrape pricing pages or use APIs
    
    console.log(`[Fetcher] Would fetch pricing from: ${providers.join(', ')}`);
    return SAMPLE_DATA.aiPricing;
  }

  // Reddit API for pain points
  static async fetchRedditData(subreddits) {
    // In production, use PRAW or Reddit API
    // Filter for keywords like "pain", "struggle", "problem", "issue"
    
    console.log(`[Fetcher] Would scan r/${subreddits.join(', r/')}`);
    return SAMPLE_DATA.redditPainPoints;
  }

  // Hacker News API
  static async fetchHackerNewsData(tags) {
    // In production, use Algolia HN API
    // https://hn.algolia.com/api
    
    console.log(`[Fetcher] Would search HN for: ${tags.join(', ')}`);
    return SAMPLE_DATA.hackerNewsTrends;
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

// If running directly
if (require.main === module) {
  // Initialize monitor
  const monitor = new IntelligenceMonitor(CONFIG);
  
  // Initialize notification engine
  const notifier = new NotificationEngine(CONFIG);
  notifier.addChannel('console', consoleNotifier);
  notifier.addChannel('file', fileNotifier);
  notifier.addChannel('webhook', webhookNotifier);
  
  // Run monitoring
  const results = monitor.run(SAMPLE_DATA);
  
  // Example: Send high priority alerts to webhook
  const highPriorityAlerts = results.alerts.filter(a => a.priority === 'HIGH');
  
  if (highPriorityAlerts.length > 0) {
    console.log(`\n🚀 Sending ${highPriorityAlerts.length} HIGH priority alerts to notification channels...\n`);
    
    // In async context, you would await:
    // await notifier.notifyBatch(highPriorityAlerts);
    
    // For demo, just show what would happen
    highPriorityAlerts.forEach(alert => {
      console.log(`Would notify about: ${alert.title}`);
    });
  }
  
  console.log('\n✅ Intelligence monitoring cycle complete!');
  console.log('\n📁 Reports saved to:', CONFIG.outputDir);
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  IntelligenceMonitor,
  NotificationEngine,
  DataFetchers,
  CONFIG,
  SAMPLE_DATA,
  consoleNotifier,
  fileNotifier,
  webhookNotifier
};