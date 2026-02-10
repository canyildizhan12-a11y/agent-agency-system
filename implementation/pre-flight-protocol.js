/**
 * 🦉 Pre-Flight Check Protocol
 * Team Lead: Henry
 * 
 * Mandatory check-in system before any multi-hour task.
 * Prevents scope creep, deadline surprises, and marathon sessions.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  BUFFER_PERCENTAGE: 0.50,      // 50% time buffer
  CHECKPOINT_INTERVAL_MIN: 45,  // Minutes between checkpoints
  MAX_SESSION_WITHOUT_CHECKPOINT: 90,
  DEFAULT_APPROVAL_TIMEOUT_MS: 5 * 60 * 1000, // 5 minutes for approval
  LOG_DIR: path.join(__dirname, '../logs'),
  STATE_FILE: path.join(__dirname, '../logs/preflight-state.json')
};

/**
 * Task complexity multipliers for time estimation
 */
const COMPLEXITY = {
  LOW: {
    name: 'Low',
    multiplier: 1.0,
    description: 'Routine task, familiar domain, clear requirements',
    examples: ['Fix typo', 'Update config', 'Run standard report']
  },
  MEDIUM: {
    name: 'Medium', 
    multiplier: 1.5,
    description: 'Some uncertainty, may need research, moderate complexity',
    examples: ['Integrate new API', 'Refactor module', 'Build simple UI']
  },
  HIGH: {
    name: 'High',
    multiplier: 2.5,
    description: 'Complex, many unknowns, significant research needed',
    examples: ['New feature architecture', 'Performance optimization', 'Security audit']
  },
  EXPLORATORY: {
    name: 'Exploratory',
    multiplier: 4.0,
    description: 'Highly uncertain, R&D nature, impossible to estimate precisely',
    examples: ['Research new technology', 'Proof of concept', 'Investigate bug with unknown cause']
  }
};

/**
 * PreFlightCheck - Main class for task planning and approval
 */
class PreFlightCheck {
  constructor() {
    this.ensureLogDir();
    this.state = this.loadState();
  }

  ensureLogDir() {
    if (!fs.existsSync(CONFIG.LOG_DIR)) {
      fs.mkdirSync(CONFIG.LOG_DIR, { recursive: true });
    }
  }

  loadState() {
    try {
      if (fs.existsSync(CONFIG.STATE_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG.STATE_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load state:', e.message);
    }
    return { pendingApprovals: [], completedChecks: [], lastId: 0 };
  }

  saveState() {
    fs.writeFileSync(CONFIG.STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  /**
   * Create a new pre-flight check for a task
   * @param {Object} task - Task definition
   * @returns {Object} Pre-flight check plan
   */
  createCheck(task) {
    const id = ++this.state.lastId;
    
    // Validate required fields
    const required = ['title', 'description', 'estimatedHours', 'complexity'];
    const missing = required.filter(r => !task[r]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!COMPLEXITY[task.complexity]) {
      throw new Error(`Invalid complexity. Use: ${Object.keys(COMPLEXITY).join(', ')}`);
    }

    const complexity = COMPLEXITY[task.complexity];
    const baseEstimate = task.estimatedHours;
    const bufferedEstimate = baseEstimate * (1 + CONFIG.BUFFER_PERCENTAGE);
    const adjustedEstimate = bufferedEstimate * complexity.multiplier;

    const check = {
      id,
      createdAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
      task: {
        title: task.title,
        description: task.description,
        type: task.type || 'general',
        deliverables: task.deliverables || []
      },
      estimation: {
        baseHours: baseEstimate,
        complexity: complexity.name,
        complexityMultiplier: complexity.multiplier,
        bufferPercentage: CONFIG.BUFFER_PERCENTAGE * 100,
        bufferedHours: bufferedEstimate,
        finalEstimateHours: Math.ceil(adjustedEstimate * 2) / 2, // Round to 0.5
        confidence: this.calculateConfidence(task.complexity, baseEstimate)
      },
      doneCriteria: this.generateDoneCriteria(task),
      checkpoints: this.generateCheckpoints(adjustedEstimate),
      approval: {
        requestedAt: new Date().toISOString(),
        approvedAt: null,
        approvedBy: null,
        notes: null,
        modifications: []
      },
      execution: {
        startedAt: null,
        completedAt: null,
        actualHours: null,
        checkpointLogs: []
      }
    };

    // Save to pending approvals
    this.state.pendingApprovals.push(check);
    this.saveState();

    return check;
  }

  /**
   * Calculate confidence level based on complexity and estimate
   */
  calculateConfidence(complexityKey, baseHours) {
    const confidenceMap = {
      'LOW': baseHours <= 2 ? 'HIGH' : 'MEDIUM',
      'MEDIUM': baseHours <= 4 ? 'MEDIUM' : 'LOW',
      'HIGH': 'LOW',
      'EXPLORATORY': 'VERY_LOW'
    };
    return confidenceMap[complexityKey] || 'UNKNOWN';
  }

  /**
   * Generate explicit done criteria based on task type
   */
  generateDoneCriteria(task) {
    const baseCriteria = [
      'Code is written and functional',
      'Basic testing completed',
      'Changes committed to version control'
    ];

    const typeCriteria = {
      'research': [
        'Key findings documented',
        'Recommendations provided',
        'Sources/references noted',
        'Decision points clearly marked'
      ],
      'build': [
        'Feature works as specified',
        'Edge cases handled',
        'Documentation updated',
        'Code reviewed (if applicable)'
      ],
      'fix': [
        'Bug is reproducibly fixed',
        'Root cause documented',
        'Regression tests pass',
        'Fix verified in target environment'
      ],
      'refactor': [
        'Behavior unchanged (regression tested)',
        'Code quality improved',
        'Performance maintained or improved',
        'New patterns documented'
      ]
    };

    const specificCriteria = typeCriteria[task.type] || typeCriteria['build'];
    
    // Add custom deliverables as criteria
    const deliverableCriteria = (task.deliverables || []).map(d => 
      typeof d === 'string' ? `${d} created and saved` : `${d.name} delivered`
    );

    return {
      mustHave: [...baseCriteria, ...specificCriteria],
      niceToHave: task.niceToHave || [
        'Performance optimized beyond requirements',
        'Additional edge cases covered',
        'Bonus features added'
      ],
      explicitDeliverables: deliverableCriteria,
      antiGoals: task.antiGoals || [
        'Do NOT refactor unrelated code',
        'Do NOT add scope beyond specified requirements',
        'Do NOT perfect what is good enough'
      ]
    };
  }

  /**
   * Generate checkpoint schedule based on total time
   */
  generateCheckpoints(totalHours) {
    const totalMinutes = totalHours * 60;
    const checkpoints = [];
    
    // Always have at least one checkpoint
    const numCheckpoints = Math.max(1, Math.floor(totalMinutes / CONFIG.CHECKPOINT_INTERVAL_MIN));
    const intervalMinutes = Math.floor(totalMinutes / (numCheckpoints + 1));

    for (let i = 1; i <= numCheckpoints; i++) {
      const minutesIn = intervalMinutes * i;
      checkpoints.push({
        number: i,
        scheduledAtMinutes: minutesIn,
        scheduledTimeFormatted: this.formatDuration(minutesIn),
        status: 'PENDING',
        completedAt: null,
        notes: null,
        blockers: []
      });
    }

    // Add final checkpoint (completion)
    checkpoints.push({
      number: checkpoints.length + 1,
      scheduledAtMinutes: totalMinutes,
      scheduledTimeFormatted: this.formatDuration(totalMinutes),
      status: 'PENDING',
      isFinal: true,
      notes: null
    });

    return {
      totalCheckpoints: checkpoints.length,
      intervalMinutes,
      items: checkpoints
    };
  }

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  /**
   * Approve a pre-flight check
   * @param {number} checkId - Check ID
   * @param {Object} approval - Approval details
   */
  approve(checkId, approval = {}) {
    const idx = this.state.pendingApprovals.findIndex(c => c.id === checkId);
    if (idx === -1) {
      throw new Error(`Check #${checkId} not found in pending approvals`);
    }

    const check = this.state.pendingApprovals[idx];
    check.status = 'APPROVED';
    check.approval.approvedAt = new Date().toISOString();
    check.approval.approvedBy = approval.approvedBy || 'Can';
    check.approval.notes = approval.notes || null;
    
    if (approval.modifiedHours) {
      check.approval.modifications.push({
        type: 'time_adjustment',
        original: check.estimation.finalEstimateHours,
        modified: approval.modifiedHours,
        reason: approval.modificationReason || 'User adjustment'
      });
      check.estimation.finalEstimateHours = approval.modifiedHours;
      // Regenerate checkpoints with new time
      check.checkpoints = this.generateCheckpoints(approval.modifiedHours);
    }

    // Move to completed checks
    this.state.completedChecks.push(check);
    this.state.pendingApprovals.splice(idx, 1);
    this.saveState();

    return check;
  }

  /**
   * Reject/modify a pre-flight check
   */
  reject(checkId, reason, modifications = {}) {
    const idx = this.state.pendingApprovals.findIndex(c => c.id === checkId);
    if (idx === -1) {
      throw new Error(`Check #${checkId} not found`);
    }

    const check = this.state.pendingApprovals[idx];
    check.status = 'REJECTED';
    check.approval.rejectedAt = new Date().toISOString();
    check.approval.rejectionReason = reason;
    check.approval.suggestedModifications = modifications;

    this.saveState();
    return check;
  }

  /**
   * Start execution of an approved check
   */
  startExecution(checkId) {
    const check = this.state.completedChecks.find(c => c.id === checkId);
    if (!check) {
      throw new Error(`Approved check #${checkId} not found`);
    }
    if (check.status !== 'APPROVED') {
      throw new Error(`Check #${checkId} is not approved (status: ${check.status})`);
    }

    check.status = 'IN_PROGRESS';
    check.execution.startedAt = new Date().toISOString();
    this.saveState();

    return check;
  }

  /**
   * Log a checkpoint completion
   */
  logCheckpoint(checkId, checkpointNumber, notes = '', blockers = []) {
    const check = this.findCheck(checkId);
    const checkpoint = check.checkpoints.items.find(c => c.number === checkpointNumber);
    
    if (!checkpoint) {
      throw new Error(`Checkpoint #${checkpointNumber} not found`);
    }

    checkpoint.status = 'COMPLETED';
    checkpoint.completedAt = new Date().toISOString();
    checkpoint.notes = notes;
    checkpoint.blockers = blockers;

    check.execution.checkpointLogs.push({
      checkpointNumber,
      timestamp: new Date().toISOString(),
      notes,
      blockers
    });

    this.saveState();
    return checkpoint;
  }

  /**
   * Complete execution
   */
  complete(checkId, actualHours, retrospective = {}) {
    const check = this.findCheck(checkId);
    check.status = 'COMPLETED';
    check.execution.completedAt = new Date().toISOString();
    check.execution.actualHours = actualHours;
    check.execution.retrospective = {
      estimateAccuracy: actualHours / check.estimation.finalEstimateHours,
      whatWentWell: retrospective.whatWentWell || [],
      whatWasHard: retrospective.whatWasHard || [],
      lessonsLearned: retrospective.lessonsLearned || []
    };

    this.saveState();
    return check;
  }

  findCheck(checkId) {
    const check = this.state.completedChecks.find(c => c.id === checkId) ||
                  this.state.pendingApprovals.find(c => c.id === checkId);
    if (!check) throw new Error(`Check #${checkId} not found`);
    return check;
  }

  /**
   * Generate formatted report for display
   */
  generateReport(checkId, format = 'text') {
    const check = this.findCheck(checkId);
    
    if (format === 'json') {
      return JSON.stringify(check, null, 2);
    }

    const lines = [
      `╔════════════════════════════════════════════════════════════╗`,
      `║           🦉 PRE-FLIGHT CHECK #${check.id.toString().padStart(3)}                    ║`,
      `╠════════════════════════════════════════════════════════════╣`,
      `║  📋 TASK: ${check.task.title.substring(0, 40).padEnd(40)}  ║`,
      `║  📝 ${check.task.description.substring(0, 46).padEnd(46)}  ║`,
      `╠════════════════════════════════════════════════════════════╣`,
      `║  ⏱️  TIME ESTIMATE                                         ║`,
      `║     Base estimate:     ${check.estimation.baseHours.toString().padStart(5)} hours                   ║`,
      `║     Complexity:        ${check.estimation.complexity.padStart(10)} (${check.estimation.complexityMultiplier}x)        ║`,
      `║     Buffer (50%):      +${(check.estimation.baseHours * 0.5).toString().padStart(4)} hours                    ║`,
      `║     ─────────────────────────────────────                  ║`,
      `║     FINAL ESTIMATE:    ${check.estimation.finalEstimateHours.toString().padStart(5)} hours                   ║`,
      `║     Confidence:        ${check.estimation.confidence.padStart(10)}                     ║`,
      `╠════════════════════════════════════════════════════════════╣`,
      `║  ✅ DONE WHEN (Must Have):                                 ║`
    ];

    check.doneCriteria.mustHave.forEach(c => {
      lines.push(`║     • ${c.substring(0, 50).padEnd(50)}  ║`);
    });

    lines.push(`╠════════════════════════════════════════════════════════════╣`);
    lines.push(`║  📍 CHECKPOINT SCHEDULE (${check.checkpoints.totalCheckpoints} checkpoints):                  ║`);
    
    check.checkpoints.items.forEach(cp => {
      const icon = cp.isFinal ? '🏁' : '⏱️';
      lines.push(`║     ${icon} #${cp.number}: ${cp.scheduledTimeFormatted.padStart(8)} ${cp.status.padEnd(12)}          ║`);
    });

    lines.push(`╠════════════════════════════════════════════════════════════╣`);
    lines.push(`║  🚫 ANTI-GOALS (What NOT to do):                           ║`);
    check.doneCriteria.antiGoals.forEach(g => {
      lines.push(`║     ✗ ${g.substring(0, 50).padEnd(50)}  ║`);
    });

    lines.push(`╠════════════════════════════════════════════════════════════╣`);
    lines.push(`║  📊 STATUS: ${check.status.padEnd(45)}  ║`);
    lines.push(`╚════════════════════════════════════════════════════════════╝`);

    return lines.join('\n');
  }

  /**
   * Get pending approvals that need attention
   */
  getPendingApprovals() {
    return this.state.pendingApprovals;
  }

  /**
   * Get stats on estimation accuracy
   */
  getStats() {
    const completed = this.state.completedChecks.filter(c => c.status === 'COMPLETED');
    if (completed.length === 0) return { message: 'No completed checks yet' };

    const accuracies = completed.map(c => c.execution.retrospective?.estimateAccuracy || 0);
    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    return {
      totalChecks: this.state.completedChecks.length,
      completedCount: completed.length,
      averageEstimateAccuracy: avgAccuracy.toFixed(2),
      withinEstimate: completed.filter(c => {
        const acc = c.execution.retrospective?.estimateAccuracy;
        return acc && acc <= 1.0;
      }).length,
      overEstimate: completed.filter(c => {
        const acc = c.execution.retrospective?.estimateAccuracy;
        return acc && acc > 1.0;
      }).length
    };
  }
}

/**
 * Convenience function for quick task creation
 */
function quickCheck(title, description, estimatedHours, complexity = 'MEDIUM', options = {}) {
  const pfc = new PreFlightCheck();
  const check = pfc.createCheck({
    title,
    description,
    estimatedHours,
    complexity,
    type: options.type || 'build',
    deliverables: options.deliverables,
    antiGoals: options.antiGoals
  });
  
  console.log(pfc.generateReport(check.id));
  console.log('\n⚠️  WAITING FOR APPROVAL ⚠️\n');
  console.log(`To approve: preflight.approve(${check.id}, { approvedBy: 'Can' })`);
  console.log(`To reject:  preflight.reject(${check.id}, 'reason')`);
  
  return { check, pfc };
}

/**
 * Interactive approval helper
 */
async function requestApproval(checkId, pfcInstance) {
  const check = pfcInstance.findCheck(checkId);
  
  console.log('\n' + '='.repeat(60));
  console.log('🦉 HENRY: Pre-flight check requires your approval, Can.');
  console.log('='.repeat(60));
  console.log(pfcInstance.generateReport(checkId));
  console.log('\n');
  
  return {
    check,
    approve: (notes) => pfcInstance.approve(checkId, { approvedBy: 'Can', notes }),
    reject: (reason) => pfcInstance.reject(checkId, reason),
    modify: (newHours, reason) => pfcInstance.approve(checkId, { 
      approvedBy: 'Can', 
      modifiedHours: newHours, 
      modificationReason: reason 
    })
  };
}

// Export for use as module
module.exports = {
  PreFlightCheck,
  COMPLEXITY,
  CONFIG,
  quickCheck,
  requestApproval
};

// If run directly, run tests
if (require.main === module) {
  console.log('🦉 Pre-Flight Check Protocol - Test Mode\n');
  
  const pfc = new PreFlightCheck();
  
  // Test 1: Create a sample research task
  console.log('═'.repeat(60));
  console.log('TEST 1: Research Task');
  console.log('═'.repeat(60));
  
  const researchCheck = pfc.createCheck({
    title: 'Research Vector Database Options',
    description: 'Evaluate Pinecone vs Weaviate vs pgvector for our use case',
    estimatedHours: 3,
    complexity: 'MEDIUM',
    type: 'research',
    deliverables: ['Comparison matrix', 'Recommendation doc', 'Implementation plan'],
    antiGoals: [
      'Do NOT implement anything yet',
      'Do NOT get lost in feature comparisons - focus on OUR needs',
      'Do NOT spend more than 30 min on pricing research'
    ]
  });
  
  console.log(pfc.generateReport(researchCheck.id));
  
  // Simulate approval
  console.log('\n📍 Simulating approval...\n');
  pfc.approve(researchCheck.id, { 
    approvedBy: 'Can', 
    notes: 'Looks good, but limit to 2 hours if possible' 
  });
  
  // Test 2: Build task with higher complexity
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 2: Complex Build Task');
  console.log('═'.repeat(60));
  
  const buildCheck = pfc.createCheck({
    title: 'Implement WebSocket Notification System',
    description: 'Real-time notifications for task updates using Socket.io',
    estimatedHours: 4,
    complexity: 'HIGH',
    type: 'build',
    deliverables: ['WebSocket server', 'Client integration', 'Fallback polling'],
    niceToHave: ['Message persistence', 'Delivery receipts']
  });
  
  console.log(pfc.generateReport(buildCheck.id));
  
  // Simulate approval with time modification
  console.log('\n📍 Simulating approval with time modification...\n');
  pfc.approve(buildCheck.id, { 
    approvedBy: 'Can',
    modifiedHours: 6,
    modificationReason: 'Need to add Redis adapter for multi-server setup'
  });
  
  // Show updated report
  console.log(pfc.generateReport(buildCheck.id));
  
  // Test 3: Show stats
  console.log('\n' + '═'.repeat(60));
  console.log('SYSTEM STATS');
  console.log('═'.repeat(60));
  console.log(JSON.stringify(pfc.getStats(), null, 2));
  
  // Test 4: Quick check convenience function
  console.log('\n' + '═'.repeat(60));
  console.log('TEST 3: Quick Check Function');
  console.log('═'.repeat(60));
  
  const { check: quick } = quickCheck(
    'Fix Auth Middleware Bug',
    'Users getting 401 on valid tokens after 1 hour',
    1.5,
    'LOW',
    { type: 'fix' }
  );
  
  console.log('\n✅ All tests passed!');
  console.log('\n📚 Usage:');
  console.log('  const { PreFlightCheck, quickCheck } = require("./pre-flight-protocol");');
  console.log('  const pfc = new PreFlightCheck();');
  console.log('  const check = pfc.createCheck({...});');
}