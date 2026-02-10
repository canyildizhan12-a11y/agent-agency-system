/**
 * 🎯 Context Router
 * 
 * Detects operational context (work/coding/life) based on:
 * - Time patterns
 * - File access patterns  
 * - Active project signals
 * - User behavior indicators
 */

class ContextRouter {
  constructor() {
    this.MODES = {
      WORK: 'work',
      CODING: 'coding',
      LIFE: 'life',
      RESEARCH: 'research',
      CREATIVE: 'creative'
    };
    
    this.currentMode = null;
    this.confidence = 0;
    this.lastModeChange = null;
    this.history = [];
    
    // Time-based detection patterns (24h format)
    this.timePatterns = {
      [this.MODES.WORK]: [
        { start: 9, end: 12 },   // Morning work
        { start: 13, end: 17 }   // Afternoon work
      ],
      [this.MODES.CODING]: [
        { start: 20, end: 24 },  // Evening coding
        { start: 0, end: 2 },    // Late night coding
        { start: 6, end: 8 }     // Early morning coding
      ],
      [this.MODES.LIFE]: [
        { start: 7, end: 9 },    // Morning routine
        { start: 12, end: 13 },  // Lunch
        { start: 17, end: 20 },  // Evening
        { start: 0, end: 6 }     // Late night/early morning
      ],
      [this.MODES.RESEARCH]: [
        { start: 14, end: 17 },  // Afternoon deep work
        { start: 21, end: 23 }   // Evening reading
      ]
    };
    
    // File access pattern signatures
    this.fileSignatures = {
      [this.MODES.CODING]: {
        extensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h', '.json', '.yaml', '.yml'],
        keywords: ['test', 'spec', 'src', 'lib', 'app', 'server', 'client', 'api'],
        paths: ['/workspace', '/project', '/repo', '/git'],
        weight: 1.0
      },
      [this.MODES.WORK]: {
        extensions: ['.md', '.doc', '.docx', '.pdf', '.xlsx', '.csv', '.pptx'],
        keywords: ['report', 'meeting', 'client', 'proposal', 'budget', 'plan', 'strategy'],
        paths: ['/work', '/business', '/client', '/project'],
        weight: 0.9
      },
      [this.MODES.LIFE]: {
        extensions: ['.txt', '.jpg', '.png', '.mp4', '.mp3', '.epub', '.mobi'],
        keywords: ['photo', 'video', 'music', 'book', 'personal', 'family', 'travel', 'recipe'],
        paths: ['/home', '/personal', '/photos', '/music', '/videos'],
        weight: 0.8
      },
      [this.MODES.RESEARCH]: {
        extensions: ['.md', '.pdf', '.txt', '.bib', '.tex'],
        keywords: ['paper', 'research', 'study', 'analysis', 'survey', 'review', 'journal'],
        paths: ['/research', '/papers', '/notes', '/references'],
        weight: 0.85
      },
      [this.MODES.CREATIVE]: {
        extensions: ['.md', '.txt', '.psd', '.ai', '.svg', '.mp4', '.aep'],
        keywords: ['draft', 'idea', 'concept', 'design', 'story', 'script', 'sketch'],
        paths: ['/creative', '/writing', '/design', '/art'],
        weight: 0.85
      }
    };
    
    // Command/activity signatures
    this.activitySignatures = {
      [this.MODES.CODING]: ['git', 'npm', 'pip', 'docker', 'build', 'test', 'lint', 'compile'],
      [this.MODES.WORK]: ['email', 'calendar', 'meeting', 'call', 'present', 'review'],
      [this.MODES.LIFE]: ['browse', 'chat', 'watch', 'listen', 'photo', 'video'],
      [this.MODES.RESEARCH]: ['read', 'search', 'analyze', 'note', 'bookmark', 'cite'],
      [this.MODES.CREATIVE]: ['write', 'draft', 'design', 'sketch', 'brainstorm', 'edit']
    };
    
    this.activeProjects = new Map();
    this.recentFiles = [];
    this.maxHistorySize = 50;
  }
  
  /**
   * Primary entry point: detect current context mode
   */
  detectContext(signals = {}) {
    const scores = {};
    const confidences = {};
    
    // Gather all detection signals
    const timeSignal = this._detectTimeMode();
    const fileSignal = this._detectFileMode(signals.filePath || signals.files);
    const activitySignal = this._detectActivityMode(signals.command || signals.activity);
    const projectSignal = this._detectProjectMode(signals.project || signals.projectType);
    
    // Combine scores with weights
    for (const mode of Object.values(this.MODES)) {
      scores[mode] = 0;
      let totalWeight = 0;
      
      // Time-based (weight: 0.3)
      if (timeSignal.mode === mode) {
        scores[mode] += timeSignal.confidence * 0.3;
        totalWeight += 0.3;
      }
      
      // File-based (weight: 0.35)
      if (fileSignal.mode === mode) {
        scores[mode] += fileSignal.confidence * 0.35;
        totalWeight += 0.35;
      }
      
      // Activity-based (weight: 0.25)
      if (activitySignal.mode === mode) {
        scores[mode] += activitySignal.confidence * 0.25;
        totalWeight += 0.25;
      }
      
      // Project-based (weight: 0.1)
      if (projectSignal.mode === mode) {
        scores[mode] += projectSignal.confidence * 0.1;
        totalWeight += 0.1;
      }
      
      // Normalize by total weight used
      if (totalWeight > 0) {
        scores[mode] = scores[mode] / totalWeight;
      }
    }
    
    // Find best match
    let bestMode = null;
    let bestScore = 0;
    
    for (const [mode, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestMode = mode;
      }
    }
    
    // Calculate overall confidence
    const confidence = bestScore;
    
    // Update state if confidence threshold met
    if (confidence >= 0.6) {
      this._updateMode(bestMode, confidence, {
        time: timeSignal,
        file: fileSignal,
        activity: activitySignal,
        project: projectSignal
      });
    }
    
    return {
      mode: bestMode,
      confidence: confidence,
      scores: scores,
      signals: {
        time: timeSignal,
        file: fileSignal,
        activity: activitySignal,
        project: projectSignal
      }
    };
  }
  
  /**
   * Time-based mode detection
   */
  _detectTimeMode(timestamp = Date.now()) {
    const hour = new Date(timestamp).getHours();
    const scores = {};
    
    for (const [mode, ranges] of Object.entries(this.timePatterns)) {
      let maxConfidence = 0;
      
      for (const range of ranges) {
        const rangeSize = range.end - range.start;
        const center = range.start + rangeSize / 2;
        const distance = Math.abs(hour - center);
        const maxDistance = rangeSize / 2;
        
        // Gaussian-like confidence curve
        const confidence = Math.max(0, 1 - (distance / maxDistance));
        maxConfidence = Math.max(maxConfidence, confidence);
      }
      
      scores[mode] = maxConfidence;
    }
    
    const bestMode = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      mode: bestMode[0],
      confidence: bestMode[1],
      hour: hour,
      scores: scores
    };
  }
  
  /**
   * File access pattern detection
   */
  _detectFileMode(fileInput) {
    if (!fileInput) {
      return { mode: null, confidence: 0 };
    }
    
    const files = Array.isArray(fileInput) ? fileInput : [fileInput];
    const scores = {};
    
    for (const mode of Object.values(this.MODES)) {
      scores[mode] = 0;
    }
    
    for (const file of files) {
      const lowerFile = file.toLowerCase();
      const ext = '.' + lowerFile.split('.').pop();
      
      for (const [mode, signature] of Object.entries(this.fileSignatures)) {
        let matchScore = 0;
        let matchCount = 0;
        
        // Check extension
        if (signature.extensions.includes(ext)) {
          matchScore += 0.4;
          matchCount++;
        }
        
        // Check keywords
        for (const keyword of signature.keywords) {
          if (lowerFile.includes(keyword)) {
            matchScore += 0.3;
            matchCount++;
          }
        }
        
        // Check path patterns
        for (const path of signature.paths) {
          if (lowerFile.includes(path)) {
            matchScore += 0.3;
            matchCount++;
          }
        }
        
        if (matchCount > 0) {
          scores[mode] += matchScore * signature.weight;
        }
      }
    }
    
    // Normalize by file count
    for (const mode of Object.keys(scores)) {
      scores[mode] = scores[mode] / files.length;
    }
    
    const bestMode = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      mode: bestMode[0],
      confidence: Math.min(1, bestMode[1]),
      filesAnalyzed: files.length,
      scores: scores
    };
  }
  
  /**
   * Activity/command pattern detection
   */
  _detectActivityMode(activity) {
    if (!activity) {
      return { mode: null, confidence: 0 };
    }
    
    const activities = Array.isArray(activity) ? activity : [activity];
    const lowerActivities = activities.map(a => a.toLowerCase());
    const scores = {};
    
    for (const mode of Object.values(this.MODES)) {
      scores[mode] = 0;
      const signatures = this.activitySignatures[mode];
      
      for (const act of lowerActivities) {
        for (const sig of signatures) {
          if (act.includes(sig)) {
            scores[mode] += 0.5;
          }
        }
      }
    }
    
    // Normalize
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      for (const mode of Object.keys(scores)) {
        scores[mode] = scores[mode] / maxScore;
      }
    }
    
    const bestMode = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      mode: bestMode[0],
      confidence: bestMode[1],
      activitiesAnalyzed: activities.length,
      scores: scores
    };
  }
  
  /**
   * Active project type detection
   */
  _detectProjectMode(projectInfo) {
    if (!projectInfo) {
      return { mode: null, confidence: 0 };
    }
    
    // Map project types to modes
    const projectModeMap = {
      'software': this.MODES.CODING,
      'webapp': this.MODES.CODING,
      'mobile': this.MODES.CODING,
      'data': this.MODES.CODING,
      'business': this.MODES.WORK,
      'consulting': this.MODES.WORK,
      'writing': this.MODES.CREATIVE,
      'design': this.MODES.CREATIVE,
      'research': this.MODES.RESEARCH,
      'academic': this.MODES.RESEARCH,
      'personal': this.MODES.LIFE,
      'hobby': this.MODES.LIFE
    };
    
    const mode = projectModeMap[projectInfo.toLowerCase()] || null;
    
    return {
      mode: mode,
      confidence: mode ? 0.8 : 0,
      projectType: projectInfo
    };
  }
  
  /**
   * Update internal mode state
   */
  _updateMode(mode, confidence, signals) {
    const previousMode = this.currentMode;
    
    this.currentMode = mode;
    this.confidence = confidence;
    this.lastModeChange = Date.now();
    
    // Add to history
    this.history.push({
      mode: mode,
      confidence: confidence,
      timestamp: Date.now(),
      signals: signals
    });
    
    // Trim history
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
    
    // Emit mode change event if different
    if (previousMode && previousMode !== mode) {
      this._emitModeChange(previousMode, mode, confidence);
    }
  }
  
  /**
   * Emit mode change event (override for custom handling)
   */
  _emitModeChange(fromMode, toMode, confidence) {
    const event = {
      type: 'MODE_CHANGE',
      from: fromMode,
      to: toMode,
      confidence: confidence,
      timestamp: Date.now()
    };
    
    // Can be hooked into event system
    if (typeof this.onModeChange === 'function') {
      this.onModeChange(event);
    }
  }
  
  /**
   * Register an active project
   */
  registerProject(projectId, projectType, metadata = {}) {
    this.activeProjects.set(projectId, {
      type: projectType,
      mode: this._detectProjectMode(projectType).mode,
      startTime: Date.now(),
      metadata: metadata
    });
  }
  
  /**
   * Track file access
   */
  trackFileAccess(filePath, metadata = {}) {
    this.recentFiles.push({
      path: filePath,
      timestamp: Date.now(),
      metadata: metadata
    });
    
    // Keep only recent files
    const cutoff = Date.now() - 3600000; // 1 hour
    this.recentFiles = this.recentFiles.filter(f => f.timestamp > cutoff);
    
    // Re-detect context with new file
    return this.detectContext({ filePath });
  }
  
  /**
   * Get current mode with metadata
   */
  getCurrentContext() {
    return {
      mode: this.currentMode,
      confidence: this.confidence,
      since: this.lastModeChange,
      duration: this.lastModeChange ? Date.now() - this.lastModeChange : 0,
      history: this.history.slice(-10),
      activeProjects: Array.from(this.activeProjects.entries())
    };
  }
  
  /**
   * Force set mode (for manual override)
   */
  setMode(mode, reason = 'manual') {
    if (!Object.values(this.MODES).includes(mode)) {
      throw new Error(`Invalid mode: ${mode}`);
    }
    
    this._updateMode(mode, 1.0, { reason });
    return this.getCurrentContext();
  }
  
  /**
   * Get mode-specific behavior config
   */
  getModeConfig(mode = this.currentMode) {
    const configs = {
      [this.MODES.WORK]: {
        responseStyle: 'professional',
        proactiveLevel: 'medium',
        checkEmail: true,
        checkCalendar: true,
        summarizeMeetings: true,
        priorityKeywords: ['urgent', 'client', 'deadline', 'meeting']
      },
      [this.MODES.CODING]: {
        responseStyle: 'technical',
        proactiveLevel: 'high',
        autoLint: true,
        suggestRefactor: true,
        debugHelp: true,
        priorityKeywords: ['error', 'bug', 'test', 'deploy', 'build']
      },
      [this.MODES.LIFE]: {
        responseStyle: 'casual',
        proactiveLevel: 'low',
        reminders: true,
        weather: true,
        news: false,
        priorityKeywords: ['appointment', 'birthday', 'reminder', 'health']
      },
      [this.MODES.RESEARCH]: {
        responseStyle: 'analytical',
        proactiveLevel: 'medium',
        citeSources: true,
        suggestPapers: true,
        takeNotes: true,
        priorityKeywords: ['study', 'paper', 'analysis', 'data']
      },
      [this.MODES.CREATIVE]: {
        responseStyle: 'inspirational',
        proactiveLevel: 'medium',
        brainstorming: true,
        suggestIdeas: true,
        saveDrafts: true,
        priorityKeywords: ['idea', 'draft', 'concept', 'inspiration']
      }
    };
    
    return configs[mode] || configs[this.MODES.WORK];
  }
}

// Export for module usage
module.exports = { ContextRouter };

// Example usage
if (require.main === module) {
  const router = new ContextRouter();
  
  console.log('🎯 Context Router - Demo');
  console.log('========================\n');
  
  // Test time detection
  const timeResult = router._detectTimeMode();
  console.log('📅 Time Detection:', timeResult.mode, `(confidence: ${timeResult.confidence.toFixed(2)})`);
  
  // Test file detection
  const fileResult = router._detectFileMode(['/workspace/project/src/app.js', '/workspace/project/test.js']);
  console.log('📁 File Detection:', fileResult.mode, `(confidence: ${fileResult.confidence.toFixed(2)})`);
  
  // Test activity detection
  const activityResult = router._detectActivityMode(['git commit', 'npm test']);
  console.log('⚡ Activity Detection:', activityResult.mode, `(confidence: ${activityResult.confidence.toFixed(2)})`);
  
  // Full context detection
  console.log('\n🔄 Full Context Detection:');
  const context = router.detectContext({
    files: ['/workspace/agent-agency/src/orchestrator.js'],
    activity: 'coding',
    projectType: 'software'
  });
  
  console.log('  Mode:', context.mode);
  console.log('  Confidence:', context.confidence.toFixed(2));
  console.log('  All Scores:', Object.entries(context.scores)
    .map(([m, s]) => `${m}: ${s.toFixed(2)}`).join(', '));
  
  console.log('\n✅ Context Router ready!');
}
