/**
 * 📊 Research ROI Tracker
 * Tracks research file usage, feedback, and conversion to action
 * 
 * Metrics: Access rate | Feedback rate | Conversion rate | Time-to-action
 */

class ResearchROITracker {
  constructor() {
    this.dbPath = './data/research-roi-db.json';
    this.researchEvents = [];
    this.feedbackQueue = [];
    this.loadDatabase();
  }

  // ═══════════════════════════════════════════════════════════════
  // CORE DATA STRUCTURES
  // ═══════════════════════════════════════════════════════════════

  createResearchRecord(fileId, metadata = {}) {
    return {
      id: this.generateId(),
      fileId,
      createdAt: Date.now(),
      metadata: {
        title: metadata.title || fileId,
        category: metadata.category || 'uncategorized',
        estimatedReadTime: metadata.readTime || 0,
        tags: metadata.tags || [],
        ...metadata
      },
      // Access tracking
      accessLog: [],
      totalAccesses: 0,
      uniqueUsers: new Set(),
      
      // Feedback tracking
      feedback: {
        wasUseful: null,        // boolean | null
        usefulnessRating: null, // 1-5 scale
        usedFor: [],            // what action was taken
        timeToAction: null,     // ms between access and action
        comments: []
      },
      
      // Conversion tracking
      conversion: {
        status: 'pending',      // pending | converted | abandoned
        actionTaken: null,
        actionTimestamp: null,
        actionValue: null       // estimated value of action
      },
      
      // Derived metrics (recalculated on query)
      metrics: {
        roiScore: null,
        engagementScore: null,
        decayFactor: 1.0
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENT TRACKING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Track when a research file is accessed
   */
  trackAccess(fileId, userId = 'anonymous', context = {}) {
    const timestamp = Date.now();
    const accessEvent = {
      type: 'access',
      fileId,
      userId,
      timestamp,
      context: {
        source: context.source || 'unknown',      // search | recommendation | direct
        query: context.query || null,             // what were they looking for
        sessionId: context.sessionId || null,
        device: context.device || 'unknown'
      }
    };

    this.researchEvents.push(accessEvent);
    
    // Update or create record
    let record = this.getRecord(fileId);
    if (!record) {
      record = this.createResearchRecord(fileId, context.metadata);
      this.saveRecord(record);
    }
    
    record.accessLog.push({
      timestamp,
      userId,
      context: accessEvent.context
    });
    record.totalAccesses++;
    record.uniqueUsers.add(userId);
    
    // Queue feedback request (staggered, not immediate)
    this.queueFeedbackRequest(fileId, userId, timestamp);
    
    this.persist();
    return accessEvent;
  }

  /**
   * Queue a "Did you use this?" feedback request
   */
  queueFeedbackRequest(fileId, userId, accessTimestamp) {
    // Delay feedback request by 15 minutes or next session
    const feedbackDue = accessTimestamp + (15 * 60 * 1000);
    
    this.feedbackQueue.push({
      fileId,
      userId,
      accessTimestamp,
      feedbackDue,
      status: 'pending',
      attempts: 0
    });
  }

  /**
   * Process pending feedback requests
   * Returns list of requests ready to be asked
   */
  processFeedbackQueue() {
    const now = Date.now();
    const ready = [];
    const stillPending = [];
    
    for (const request of this.feedbackQueue) {
      if (request.status === 'pending' && now >= request.feedbackDue) {
        // Check if user already provided feedback
        const record = this.getRecord(request.fileId);
        const alreadyAnswered = record?.feedback.wasUseful !== null;
        
        if (!alreadyAnswered && request.attempts < 2) {
          ready.push(request);
          request.attempts++;
          request.status = 'asked';
        }
      } else {
        stillPending.push(request);
      }
    }
    
    this.feedbackQueue = stillPending;
    this.persist();
    return ready;
  }

  // ═══════════════════════════════════════════════════════════════
  // FEEDBACK COLLECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record user feedback on research utility
   */
  recordFeedback(fileId, feedback) {
    const record = this.getRecord(fileId);
    if (!record) {
      throw new Error(`Research record not found: ${fileId}`);
    }

    record.feedback = {
      wasUseful: feedback.wasUseful,
      usefulnessRating: feedback.rating || null,
      usedFor: feedback.usedFor || [],
      timeToAction: feedback.timeToAction || null,
      comments: feedback.comments ? [feedback.comments] : []
    };

    // If useful, mark for conversion tracking
    if (feedback.wasUseful) {
      this.initiateConversionTracking(fileId, feedback);
    }

    this.persist();
    this.updateMetrics(fileId);
    
    return {
      success: true,
      fileId,
      feedback: record.feedback
    };
  }

  /**
   * Quick feedback: "Was this useful?" Y/N
   */
  quickFeedback(fileId, wasUseful, userId = 'anonymous') {
    return this.recordFeedback(fileId, {
      wasUseful,
      rating: wasUseful ? 4 : 2,
      usedFor: wasUseful ? ['unknown'] : [],
      timestamp: Date.now()
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // CONVERSION TRACKING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start tracking conversion from research to action
   */
  initiateConversionTracking(fileId, context = {}) {
    const record = this.getRecord(fileId);
    if (!record) return;

    // Set conversion window (24 hours to complete action)
    record.conversion.trackingStarted = Date.now();
    record.conversion.deadline = Date.now() + (24 * 60 * 60 * 1000);
    record.conversion.status = 'tracking';
    
    this.persist();
  }

  /**
   * Record that an action was taken based on research
   */
  recordConversion(fileId, actionDetails) {
    const record = this.getRecord(fileId);
    if (!record) {
      throw new Error(`Research record not found: ${fileId}`);
    }

    const now = Date.now();
    const timeToAction = record.accessLog.length > 0 
      ? now - record.accessLog[record.accessLog.length - 1].timestamp 
      : null;

    record.conversion = {
      status: 'converted',
      actionTaken: actionDetails.actionType,
      actionTimestamp: now,
      actionValue: actionDetails.estimatedValue || 0,
      timeToAction,
      details: actionDetails
    };

    // Update feedback with timing
    record.feedback.timeToAction = timeToAction;
    
    this.persist();
    this.updateMetrics(fileId);
    
    return {
      success: true,
      fileId,
      conversion: record.conversion,
      timeToAction
    };
  }

  /**
   * Mark conversion as abandoned (deadline passed, no action)
   */
  markAbandoned(fileId) {
    const record = this.getRecord(fileId);
    if (!record) return;

    if (record.conversion.status === 'tracking') {
      record.conversion.status = 'abandoned';
      record.conversion.abandonedAt = Date.now();
      this.persist();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // METRICS CALCULATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calculate and update all metrics for a research item
   */
  updateMetrics(fileId) {
    const record = this.getRecord(fileId);
    if (!record) return null;

    const age = Date.now() - record.createdAt;
    const daysOld = age / (24 * 60 * 60 * 1000);
    
    // Engagement score (0-100)
    const accessScore = Math.min(record.totalAccesses * 10, 40);
    const uniqueScore = Math.min(record.uniqueUsers.size * 15, 30);
    const recencyScore = Math.max(0, 30 - daysOld); // Decays over time
    
    record.metrics.engagementScore = accessScore + uniqueScore + recencyScore;
    
    // Calculate decay factor (older = less relevant)
    record.metrics.decayFactor = Math.exp(-daysOld / 30); // 30-day half-life
    
    // ROI Score calculation
    const feedbackWeight = record.feedback.wasUseful === true ? 1.0 : 
                           record.feedback.wasUseful === false ? 0.0 : 0.5;
    const conversionWeight = record.conversion.status === 'converted' ? 1.0 :
                             record.conversion.status === 'abandoned' ? 0.0 : 0.5;
    
    record.metrics.roiScore = (
      (record.metrics.engagementScore / 100) * 0.3 +
      feedbackWeight * 0.4 +
      conversionWeight * 0.3
    ) * 100;

    return record.metrics;
  }

  // ═══════════════════════════════════════════════════════════════
  // AGGREGATE ANALYTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get dashboard metrics for a time period
   */
  getDashboardMetrics(timeRange = '7d') {
    const range = this.parseTimeRange(timeRange);
    const records = this.getRecordsInRange(range);
    
    const totalResearch = records.length;
    const withFeedback = records.filter(r => r.feedback.wasUseful !== null);
    const converted = records.filter(r => r.conversion.status === 'converted');
    const abandoned = records.filter(r => r.conversion.status === 'abandoned');
    
    // Feedback quality distribution
    const ratings = withFeedback
      .filter(r => r.feedback.usefulnessRating)
      .map(r => r.feedback.usefulnessRating);
    
    const avgRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    // Time-to-action stats
    const timeToActions = converted
      .map(r => r.conversion.timeToAction)
      .filter(t => t !== null);
    
    const avgTimeToAction = timeToActions.length > 0
      ? timeToActions.reduce((a, b) => a + b, 0) / timeToActions.length
      : null;

    return {
      period: timeRange,
      generatedAt: Date.now(),
      
      // Volume metrics
      totalResearch,
      totalAccesses: records.reduce((sum, r) => sum + r.totalAccesses, 0),
      
      // Conversion funnel
      funnel: {
        accessed: totalResearch,
        feedbackReceived: withFeedback.length,
        markedUseful: withFeedback.filter(r => r.feedback.wasUseful === true).length,
        converted: converted.length,
        abandoned: abandoned.length,
        pending: totalResearch - converted.length - abandoned.length
      },
      
      // Rates
      rates: {
        feedbackRate: totalResearch > 0 ? withFeedback.length / totalResearch : 0,
        usefulnessRate: withFeedback.length > 0 
          ? withFeedback.filter(r => r.feedback.wasUseful === true).length / withFeedback.length 
          : 0,
        conversionRate: withFeedback.length > 0 
          ? converted.length / withFeedback.length 
          : 0,
        abandonmentRate: withFeedback.length > 0 
          ? abandoned.length / withFeedback.length 
          : 0
      },
      
      // Quality metrics
      quality: {
        averageRating: avgRating,
        averageTimeToAction: avgTimeToAction,
        averageTimeToActionMinutes: avgTimeToAction ? avgTimeToAction / 60000 : null,
        totalActionValue: converted.reduce((sum, r) => sum + (r.conversion.actionValue || 0), 0)
      },
      
      // Top performers
      topResearch: records
        .sort((a, b) => (b.metrics.roiScore || 0) - (a.metrics.roiScore || 0))
        .slice(0, 10)
        .map(r => ({
          fileId: r.fileId,
          title: r.metadata.title,
          roiScore: r.metrics.roiScore,
          totalAccesses: r.totalAccesses,
          conversionStatus: r.conversion.status
        })),
      
      // Underperformers (high access, low conversion)
      underperformers: records
        .filter(r => r.totalAccesses > 2 && r.conversion.status !== 'converted')
        .sort((a, b) => b.totalAccesses - a.totalAccesses)
        .slice(0, 5)
        .map(r => ({
          fileId: r.fileId,
          title: r.metadata.title,
          totalAccesses: r.totalAccesses,
          feedbackStatus: r.feedback.wasUseful === null ? 'no-feedback' : 'feedback-received'
        }))
    };
  }

  /**
   * Get actionable insights from the data
   */
  getInsights() {
    const metrics = this.getDashboardMetrics('30d');
    const insights = [];
    
    // Insight: Low feedback rate
    if (metrics.rates.feedbackRate < 0.3) {
      insights.push({
        type: 'warning',
        metric: 'feedback-rate',
        message: `Feedback rate is ${(metrics.rates.feedbackRate * 100).toFixed(1)}%. Consider making feedback requests more prominent.`,
        recommendation: 'Add inline feedback buttons after research delivery'
      });
    }
    
    // Insight: High abandonment
    if (metrics.rates.abandonmentRate > 0.4) {
      insights.push({
        type: 'critical',
        metric: 'abandonment-rate',
        message: `${(metrics.rates.abandonmentRate * 100).toFixed(1)}% of useful research leads to no action.`,
        recommendation: 'Follow up on "useful but not acted on" cases to understand barriers'
      });
    }
    
    // Insight: Top category performance
    const byCategory = this.analyzeByCategory();
    const bestCategory = Object.entries(byCategory)
      .sort((a, b) => b[1].roiScore - a[1].roiScore)[0];
    
    if (bestCategory) {
      insights.push({
        type: 'positive',
        metric: 'category-performance',
        message: `"${bestCategory[0]}" research has highest ROI (${bestCategory[1].roiScore.toFixed(1)}).`,
        recommendation: 'Produce more content in this category'
      });
    }
    
    // Insight: Long time-to-action
    if (metrics.quality.averageTimeToActionMinutes > 120) {
      insights.push({
        type: 'opportunity',
        metric: 'time-to-action',
        message: `Average time to action is ${(metrics.quality.averageTimeToActionMinutes / 60).toFixed(1)} hours.`,
        recommendation: 'Consider real-time notifications or scheduled reminders'
      });
    }
    
    return insights;
  }

  /**
   * Analyze performance by category
   */
  analyzeByCategory() {
    const categories = {};
    const records = this.getAllRecords();
    
    for (const record of records) {
      const cat = record.metadata.category;
      if (!categories[cat]) {
        categories[cat] = {
          count: 0,
          totalAccesses: 0,
          conversions: 0,
          ratings: [],
          roiScore: 0
        };
      }
      
      categories[cat].count++;
      categories[cat].totalAccesses += record.totalAccesses;
      if (record.conversion.status === 'converted') categories[cat].conversions++;
      if (record.feedback.usefulnessRating) {
        categories[cat].ratings.push(record.feedback.usefulnessRating);
      }
    }
    
    // Calculate averages
    for (const cat in categories) {
      const c = categories[cat];
      c.avgRating = c.ratings.length > 0 
        ? c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length 
        : 0;
      c.conversionRate = c.count > 0 ? c.conversions / c.count : 0;
      c.roiScore = (c.avgRating / 5 * 0.5 + c.conversionRate * 0.5) * 100;
    }
    
    return categories;
  }

  // ═══════════════════════════════════════════════════════════════
  // STORAGE & PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  loadDatabase() {
    try {
      const fs = require('fs');
      const data = fs.readFileSync(this.dbPath, 'utf8');
      const parsed = JSON.parse(data);
      this.researchEvents = parsed.events || [];
      this.feedbackQueue = parsed.queue || [];
    } catch (e) {
      this.researchEvents = [];
      this.feedbackQueue = [];
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
        events: this.researchEvents,
        queue: this.feedbackQueue,
        lastUpdated: Date.now()
      }, null, 2));
    } catch (e) {
      console.error('Failed to persist ROI database:', e);
    }
  }

  saveRecord(record) {
    const existing = this.researchEvents.findIndex(e => 
      e.type === 'record' && e.data.fileId === record.fileId
    );
    
    const event = { type: 'record', data: record, timestamp: Date.now() };
    
    if (existing >= 0) {
      this.researchEvents[existing] = event;
    } else {
      this.researchEvents.push(event);
    }
  }

  getRecord(fileId) {
    const event = this.researchEvents.find(e => 
      e.type === 'record' && e.data.fileId === fileId
    );
    return event?.data || null;
  }

  getAllRecords() {
    return this.researchEvents
      .filter(e => e.type === 'record')
      .map(e => e.data);
  }

  getRecordsInRange(range) {
    return this.getAllRecords().filter(r => r.createdAt >= range.start);
  }

  parseTimeRange(range) {
    const now = Date.now();
    const days = parseInt(range) || 7;
    return { start: now - (days * 24 * 60 * 60 * 1000), end: now };
  }

  generateId() {
    return `roi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // EXPORT & REPORTING
  // ═══════════════════════════════════════════════════════════════

  exportCSV() {
    const records = this.getAllRecords();
    const headers = [
      'fileId', 'title', 'category', 'createdAt', 'totalAccesses',
      'wasUseful', 'usefulnessRating', 'conversionStatus', 'timeToAction',
      'roiScore', 'engagementScore'
    ];
    
    const rows = records.map(r => [
      r.fileId,
      r.metadata.title,
      r.metadata.category,
      new Date(r.createdAt).toISOString(),
      r.totalAccesses,
      r.feedback.wasUseful,
      r.feedback.usefulnessRating,
      r.conversion.status,
      r.conversion.timeToAction,
      r.metrics.roiScore?.toFixed(2),
      r.metrics.engagementScore?.toFixed(2)
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = { ResearchROITracker };

// CLI usage example
if (require.main === module) {
  const tracker = new ResearchROITracker();
  
  console.log('📊 Research ROI Tracker - Demo');
  console.log('================================');
  
  // Simulate some data
  tracker.trackAccess('market-analysis-q1', 'user1', {
    source: 'search',
    query: 'market trends',
    metadata: { title: 'Q1 Market Analysis', category: 'market-research', readTime: 15 }
  });
  
  // Record feedback
  tracker.quickFeedback('market-analysis-q1', true, 'user1');
  tracker.recordConversion('market-analysis-q1', {
    actionType: 'strategy-update',
    estimatedValue: 5000
  });
  
  // Show metrics
  const metrics = tracker.getDashboardMetrics('7d');
  console.log('\n📈 Dashboard Metrics:');
  console.log(`Total Research Items: ${metrics.totalResearch}`);
  console.log(`Conversion Rate: ${(metrics.rates.conversionRate * 100).toFixed(1)}%`);
  console.log(`Average Rating: ${metrics.quality.averageRating.toFixed(1)}/5`);
  
  console.log('\n💡 Insights:');
  tracker.getInsights().forEach(i => {
    console.log(`[${i.type.toUpperCase()}] ${i.message}`);
  });
}
