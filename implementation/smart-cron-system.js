/**
 * Smart Cron Creation System
 * Auto-detects time mentions in messages and creates cron jobs automatically
 * 
 * Features:
 * - Natural language time parsing
 * - Automatic cron creation without explicit "create cron" commands
 * - Supports relative times ("in 5 minutes"), absolute times ("at 9am"), and recurrences ("daily")
 */

const fs = require('fs');
const path = require('path');

// Time pattern definitions for natural language parsing
const TIME_PATTERNS = {
  // Relative time patterns
  RELATIVE: {
    MINUTES: {
      patterns: [
        /(?:in\s+)?(\d+)\s*(?:min|minute)s?\s*(?:from\s+now)?/i,
        /(?:remind\s+me\s+)?in\s+(\d+)\s*(?:min|minute)s?/i,
      ],
      type: 'relative_minutes'
    },
    HOURS: {
      patterns: [
        /(?:in\s+)?(\d+)\s*(?:hour|hr)s?\s*(?:from\s+now)?/i,
        /(?:remind\s+me\s+)?in\s+(\d+)\s*(?:hour|hr)s?/i,
      ],
      type: 'relative_hours'
    },
    DAYS: {
      patterns: [
        /(?:in\s+)?(\d+)\s*days?\s*(?:from\s+now)?/i,
        /(?:remind\s+me\s+)?in\s+(\d+)\s*days?/i,
      ],
      type: 'relative_days'
    }
  },

  // Absolute time patterns
  ABSOLUTE: {
    TIME_12H: {
      patterns: [
        /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
        /(?:remind\s+me\s+)?at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
      ],
      type: 'absolute_time'
    },
    TIME_24H: {
      patterns: [
        /at\s+(\d{1,2}):(\d{2})/i,
        /(?:remind\s+me\s+)?at\s+(\d{1,2}):(\d{2})/i,
      ],
      type: 'absolute_time'
    }
  },

  // Recurring patterns
  RECURRING: {
    DAILY: {
      patterns: [
        /(?:every\s+)?day\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i,
        /daily\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i,
      ],
      cron: '0 {minute} {hour} * * *',
      type: 'daily'
    },
    WEEKLY: {
      patterns: [
        /(?:every\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i,
        /weekly\s+on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?(?:\s*(am|pm))?/i,
      ],
      cron: '0 {minute} {hour} * * {day}',
      type: 'weekly'
    },
    HOURLY: {
      patterns: [
        /(?:every\s+)?hour/i,
        /hourly/i,
      ],
      cron: '0 * * * * *',
      type: 'hourly'
    }
  },

  // Action context patterns (what to do)
  ACTION_CONTEXT: {
    REMIND: /(?:remind\s+me\s+(?:to\s+)?)(.+?)(?:\s+(?:at|in|on|every|daily|weekly))/i,
    CHECK: /(?:check|verify|review)\s+(.+?)(?:\s+(?:at|in|on|every|daily|weekly))/i,
    REPORT: /(?:give\s+(?:me\s+)?a\s+report|report)\s+(?:on\s+)?(.+?)(?:\s+(?:at|in|on|every|daily|weekly))/i,
    WAKE: /(?:wake\s+me\s+up|wake)\s+(?:at\s+)?/i
  }
};

// Day name to cron day mapping
const DAY_MAP = {
  'sunday': 0, 'sun': 0,
  'monday': 1, 'mon': 1,
  'tuesday': 2, 'tue': 2, 'tues': 2,
  'wednesday': 3, 'wed': 3,
  'thursday': 4, 'thu': 4, 'thurs': 4,
  'friday': 5, 'fri': 5,
  'saturday': 6, 'sat': 6
};

/**
 * ParsedTimeResult - Result of parsing a time mention
 * @typedef {Object} ParsedTimeResult
 * @property {boolean} hasTime - Whether a time was detected
 * @property {string} type - Type of time pattern (relative_minutes, absolute_time, daily, etc.)
 * @property {Date} targetTime - Calculated target time
 * @property {string} cronExpression - Generated cron expression if recurring
 * @property {string} action - Detected action context
 * @property {string} originalText - Original matched text
 */

class SmartCronSystem {
  constructor(options = {}) {
    this.cronJobsDir = options.cronJobsDir || '/home/ubuntu/.openclaw/cron-jobs';
    this.historyFile = options.historyFile || path.join(this.cronJobsDir, '.cron-history.json');
    this.maxJobs = options.maxJobs || 100;
    this.defaultTimezone = options.timezone || 'UTC';
    
    // Ensure directory exists
    this._ensureDirectory();
  }

  /**
   * Ensure cron jobs directory exists
   * @private
   */
  _ensureDirectory() {
    try {
      if (!fs.existsSync(this.cronJobsDir)) {
        fs.mkdirSync(this.cronJobsDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create cron jobs directory:', error.message);
      throw new Error(`Cannot initialize cron system: ${error.message}`);
    }
  }

  /**
   * Main entry point: Analyze a message and auto-create cron if time is detected
   * @param {string} message - The message to analyze
   * @param {Object} context - Additional context (userId, channel, etc.)
   * @returns {Promise<Object>} - Result of analysis and potential cron creation
   */
  async analyzeAndCreate(message, context = {}) {
    try {
      // Step 1: Detect time mentions
      const timeResult = this.detectTimeMention(message);
      
      if (!timeResult.hasTime) {
        return {
          detected: false,
          message: 'No time mention detected',
          action: null
        };
      }

      // Step 2: Extract action context
      timeResult.action = this.extractActionContext(message) || 'reminder';
      
      // Step 3: Generate the cron job spec
      const cronSpec = this.generateCronSpec(timeResult, context);
      
      // Step 4: Create the cron job
      const jobId = await this.createCronJob(cronSpec);
      
      // Step 5: Log the creation
      this.logCronCreation(jobId, cronSpec, message);

      return {
        detected: true,
        jobId,
        type: timeResult.type,
        targetTime: timeResult.targetTime,
        action: timeResult.action,
        cronExpression: timeResult.cronExpression,
        message: `Created ${timeResult.type} cron job: ${timeResult.action}`
      };

    } catch (error) {
      console.error('SmartCron analysis error:', error);
      return {
        detected: true,
        error: error.message,
        message: 'Time detected but failed to create cron job'
      };
    }
  }

  /**
   * Detect time mentions in a message
   * @param {string} message - Message to analyze
   * @returns {ParsedTimeResult} - Parsed time information
   */
  detectTimeMention(message) {
    const result = {
      hasTime: false,
      type: null,
      targetTime: null,
      cronExpression: null,
      originalText: null,
      parsedValue: null
    };

    const now = new Date();

    // Check relative time patterns first
    for (const [category, config] of Object.entries(TIME_PATTERNS.RELATIVE)) {
      for (const pattern of config.patterns) {
        const match = message.match(pattern);
        if (match) {
          const value = parseInt(match[1], 10);
          result.hasTime = true;
          result.type = config.type;
          result.parsedValue = value;
          result.originalText = match[0];

          // Calculate target time
          result.targetTime = new Date(now);
          switch (category) {
            case 'MINUTES':
              result.targetTime.setMinutes(now.getMinutes() + value);
              result.cronExpression = this._generateOneTimeCron(result.targetTime);
              break;
            case 'HOURS':
              result.targetTime.setHours(now.getHours() + value);
              result.cronExpression = this._generateOneTimeCron(result.targetTime);
              break;
            case 'DAYS':
              result.targetTime.setDate(now.getDate() + value);
              result.cronExpression = this._generateOneTimeCron(result.targetTime);
              break;
          }
          return result;
        }
      }
    }

    // Check recurring patterns
    for (const [category, config] of Object.entries(TIME_PATTERNS.RECURRING)) {
      for (const pattern of config.patterns) {
        const match = message.match(pattern);
        if (match) {
          result.hasTime = true;
          result.type = config.type;
          result.originalText = match[0];

          let hour = 9; // default
          let minute = 0;
          let dayOfWeek = null;

          if (category === 'DAILY') {
            if (match[1]) hour = this._parseHour(match[1], match[3]);
            if (match[2]) minute = parseInt(match[2], 10);
            result.cronExpression = `0 ${minute} ${hour} * * *`;
            result.targetTime = this._nextOccurrence(hour, minute);
          } else if (category === 'WEEKLY') {
            dayOfWeek = DAY_MAP[match[1].toLowerCase()];
            if (match[2]) hour = this._parseHour(match[2], match[4]);
            if (match[3]) minute = parseInt(match[3], 10);
            result.cronExpression = `0 ${minute} ${hour} * * ${dayOfWeek}`;
            result.targetTime = this._nextWeeklyOccurrence(dayOfWeek, hour, minute);
          } else if (category === 'HOURLY') {
            result.cronExpression = config.cron;
            result.targetTime = this._nextHourOccurrence();
          }

          return result;
        }
      }
    }

    // Check absolute time patterns
    for (const [category, config] of Object.entries(TIME_PATTERNS.ABSOLUTE)) {
      for (const pattern of config.patterns) {
        const match = message.match(pattern);
        if (match) {
          result.hasTime = true;
          result.type = config.type;
          result.originalText = match[0];

          let hour, minute = 0;

          if (category === 'TIME_12H') {
            hour = this._parseHour(match[1], match[3]);
            if (match[2]) minute = parseInt(match[2], 10);
          } else {
            hour = parseInt(match[1], 10);
            minute = parseInt(match[2], 10);
          }

          result.targetTime = this._nextOccurrence(hour, minute);
          result.cronExpression = this._generateOneTimeCron(result.targetTime);

          return result;
        }
      }
    }

    return result;
  }

  /**
   * Extract action context from message
   * @param {string} message - Message to analyze
   * @returns {string|null} - Detected action or null
   */
  extractActionContext(message) {
    // Check for specific action patterns
    for (const [actionType, pattern] of Object.entries(TIME_PATTERNS.ACTION_CONTEXT)) {
      const match = message.match(pattern);
      if (match) {
        if (actionType === 'WAKE') return 'wake-up';
        return match[1] ? match[1].trim() : actionType.toLowerCase();
      }
    }

    // Extract what comes after time indicators as the action
    const actionPatterns = [
      /(?:to|about|regarding)\s+(.+?)(?:\s*[.!?]|$)/i,
      /(?:remind\s+me\s+(?:to\s+)?)(.+?)(?:\s*[.!?]|$)/i,
    ];

    for (const pattern of actionPatterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Default: use the whole message as context
    return 'general reminder';
  }

  /**
   * Generate cron job specification
   * @param {ParsedTimeResult} timeResult - Parsed time information
   * @param {Object} context - Additional context
   * @returns {Object} - Cron job specification
   */
  generateCronSpec(timeResult, context = {}) {
    const jobId = `cron-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: jobId,
      name: `${timeResult.action || 'reminder'}-${timeResult.type}`,
      schedule: timeResult.cronExpression,
      type: timeResult.type.includes('relative') || timeResult.type === 'absolute_time' 
        ? 'one-time' 
        : 'recurring',
      targetTime: timeResult.targetTime.toISOString(),
      action: {
        type: this._determineActionType(timeResult.action),
        payload: {
          message: `Time to: ${timeResult.action || 'do your task'}`,
          originalText: timeResult.originalText,
          context: context
        }
      },
      sessionTarget: context.sessionTarget || 'main',
      channel: context.channel || null,
      createdAt: new Date().toISOString(),
      metadata: {
        source: 'smart-cron-auto-detect',
        parsedType: timeResult.type,
        userId: context.userId || null
      }
    };
  }

  /**
   * Create the actual cron job file
   * @param {Object} cronSpec - Cron job specification
   * @returns {Promise<string>} - Job ID
   */
  async createCronJob(cronSpec) {
    try {
      const jobPath = path.join(this.cronJobsDir, `${cronSpec.id}.json`);
      
      // Write the job file
      fs.writeFileSync(jobPath, JSON.stringify(cronSpec, null, 2));
      
      // Set up execution script if needed
      await this._createExecutionScript(cronSpec);
      
      return cronSpec.id;
    } catch (error) {
      throw new Error(`Failed to create cron job: ${error.message}`);
    }
  }

  /**
   * Create execution script for the cron job
   * @private
   */
  async _createExecutionScript(cronSpec) {
    const scriptName = `${cronSpec.id}.sh`;
    const scriptPath = path.join(this.cronJobsDir, scriptName);
    
    const scriptContent = `#!/bin/bash
# Auto-generated cron execution script
# Job: ${cronSpec.name}
# Created: ${cronSpec.createdAt}

export OPENCLAW_CRON_JOB_ID="${cronSpec.id}"
export OPENCLAW_CRON_ACTION="${cronSpec.action.type}"

# Log execution
echo "[$(date -Iseconds)] Executing cron job: ${cronSpec.name}" >> "${this.cronJobsDir}/execution.log"

# Trigger the action via OpenClaw
echo '${JSON.stringify(cronSpec.action.payload)}' | openclaw agent run --stdin --target ${cronSpec.sessionTarget}

# For one-time jobs, clean up after execution
if [ "${cronSpec.type}" = "one-time" ]; then
  rm -f "${path.join(this.cronJobsDir, cronSpec.id + '.json')}"
  rm -f "${scriptPath}"
fi
`;

    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, 0o755);
  }

  /**
   * Log cron creation to history
   * @private
   */
  logCronCreation(jobId, cronSpec, originalMessage) {
    try {
      let history = [];
      if (fs.existsSync(this.historyFile)) {
        history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
      }

      history.unshift({
        jobId,
        timestamp: new Date().toISOString(),
        type: cronSpec.type,
        schedule: cronSpec.schedule,
        action: cronSpec.action.type,
        originalMessage: originalMessage.substring(0, 200) // truncate for safety
      });

      // Keep only last 100 entries
      if (history.length > 100) {
        history = history.slice(0, 100);
      }

      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Failed to log cron creation:', error.message);
    }
  }

  /**
   * Get all active cron jobs
   * @returns {Array} - List of active cron jobs
   */
  getActiveJobs() {
    try {
      const jobs = [];
      const files = fs.readdirSync(this.cronJobsDir);
      
      for (const file of files) {
        if (file.endsWith('.json') && !file.startsWith('.')) {
          const jobPath = path.join(this.cronJobsDir, file);
          const job = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
          jobs.push(job);
        }
      }
      
      return jobs.sort((a, b) => new Date(a.targetTime) - new Date(b.targetTime));
    } catch (error) {
      console.error('Failed to get active jobs:', error.message);
      return [];
    }
  }

  /**
   * Cancel a cron job
   * @param {string} jobId - Job ID to cancel
   * @returns {boolean} - Success status
   */
  cancelJob(jobId) {
    try {
      const jobPath = path.join(this.cronJobsDir, `${jobId}.json`);
      const scriptPath = path.join(this.cronJobsDir, `${jobId}.sh`);
      
      if (fs.existsSync(jobPath)) {
        fs.unlinkSync(jobPath);
      }
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to cancel job ${jobId}:`, error.message);
      return false;
    }
  }

  // ==================== Helper Methods ====================

  _parseHour(hourStr, ampm) {
    let hour = parseInt(hourStr, 10);
    
    if (ampm) {
      const isPM = ampm.toLowerCase() === 'pm';
      const isAM = ampm.toLowerCase() === 'am';
      
      if (isPM && hour !== 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
    }
    
    return hour;
  }

  _generateOneTimeCron(date) {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    return `${minute} ${hour} ${day} ${month} *`;
  }

  _nextOccurrence(hour, minute) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    return target;
  }

  _nextWeeklyOccurrence(dayOfWeek, hour, minute) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    
    const currentDay = now.getDay();
    const daysUntil = (dayOfWeek - currentDay + 7) % 7;
    
    if (daysUntil === 0 && target <= now) {
      target.setDate(target.getDate() + 7);
    } else {
      target.setDate(target.getDate() + daysUntil);
    }
    
    return target;
  }

  _nextHourOccurrence() {
    const now = new Date();
    const target = new Date(now);
    target.setMinutes(0, 0, 0);
    target.setHours(target.getHours() + 1);
    return target;
  }

  _determineActionType(action) {
    const actionLower = (action || '').toLowerCase();
    
    if (actionLower.includes('wake')) return 'systemEvent';
    if (actionLower.includes('check') || actionLower.includes('verify')) return 'check';
    if (actionLower.includes('report')) return 'report';
    if (actionLower.includes('email') || actionLower.includes('send')) return 'send';
    
    return 'notify';
  }
}

// ==================== Integration Helpers ====================

/**
 * Quick helper to analyze a message and auto-create cron if needed
 * This can be called from any message handler
 */
async function autoCreateCron(message, context = {}) {
  const cronSystem = new SmartCronSystem();
  return await cronSystem.analyzeAndCreate(message, context);
}

/**
 * Middleware for message processing pipelines
 * Automatically detects and creates cron jobs from time mentions
 */
function smartCronMiddleware(options = {}) {
  const cronSystem = new SmartCronSystem(options);
  
  return async (message, context, next) => {
    // Check if this looks like a cron request
    const result = await cronSystem.analyzeAndCreate(message, context);
    
    // Attach result to context for downstream handlers
    context.cronResult = result;
    
    // Continue to next handler
    if (next) await next();
    
    return result;
  };
}

// ==================== Export ====================

module.exports = {
  SmartCronSystem,
  autoCreateCron,
  smartCronMiddleware,
  TIME_PATTERNS
};

// CLI usage example
if (require.main === module) {
  const testMessages = [
    "Remind me in 5 minutes to check the oven",
    "Give me a report daily at 9am",
    "Wake me up at 7:30am",
    "Check emails every hour",
    "Review the document in 2 hours",
    "Weekly meeting on Monday at 2pm"
  ];

  const cronSystem = new SmartCronSystem();

  console.log('Smart Cron System - Test Mode\n');
  console.log('=' .repeat(60));

  for (const msg of testMessages) {
    console.log(`\nMessage: "${msg}"`);
    const result = cronSystem.detectTimeMention(msg);
    
    if (result.hasTime) {
      console.log(`  ✓ Detected: ${result.type}`);
      console.log(`  ⏰ Target: ${result.targetTime?.toLocaleString()}`);
      console.log(`  📅 Cron: ${result.cronExpression}`);
      console.log(`  📝 Action: ${cronSystem.extractActionContext(msg)}`);
    } else {
      console.log(`  ✗ No time detected`);
    }
  }
}
