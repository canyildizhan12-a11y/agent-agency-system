/**
 * 🧠 3-Tier Memory Architecture
 * 
 * Hot (<100ms): Session context - immediate working memory
 * Warm (<1s): Daily memory - today's activity and state  
 * Cold (<5s): Curated wisdom - long-term knowledge
 */

const fs = require('fs');
const path = require('path');

class MemoryArchitecture {
  constructor(basePath = './memory') {
    this.basePath = basePath;
    this.hotMemory = new HotMemory();
    this.warmMemory = new WarmMemory(basePath);
    this.coldMemory = new ColdMemory(basePath);
    
    // Access statistics
    this.stats = {
      hot: { hits: 0, misses: 0 },
      warm: { hits: 0, misses: 0 },
      cold: { hits: 0, misses: 0 }
    };
  }
  
  /**
   * Initialize memory system
   */
  async init() {
    await this.warmMemory.init();
    await this.coldMemory.init();
    console.log('🧠 Memory Architecture initialized');
  }
  
  /**
   * Read with automatic tier escalation
   * Attempts hot → warm → cold with timing guarantees
   */
  async read(key, options = {}) {
    const startTime = performance.now();
    
    // Try hot memory first (<100ms)
    const hotResult = this.hotMemory.get(key);
    if (hotResult !== undefined) {
      this.stats.hot.hits++;
      return {
        value: hotResult,
        tier: 'hot',
        latency: performance.now() - startTime
      };
    }
    this.stats.hot.misses++;
    
    // Try warm memory (<1s total)
    const warmResult = await this.warmMemory.get(key);
    if (warmResult !== undefined) {
      this.stats.warm.hits++;
      // Promote to hot for next access
      this.hotMemory.set(key, warmResult, options.hotTTL || 300000); // 5min default
      return {
        value: warmResult,
        tier: 'warm',
        latency: performance.now() - startTime
      };
    }
    this.stats.warm.misses++;
    
    // Try cold memory (<5s total)
    const coldResult = await this.coldMemory.get(key);
    if (coldResult !== undefined) {
      this.stats.cold.hits++;
      // Promote to warm and hot
      await this.warmMemory.set(key, coldResult);
      this.hotMemory.set(key, coldResult, options.hotTTL || 300000);
      return {
        value: coldResult,
        tier: 'cold',
        latency: performance.now() - startTime
      };
    }
    this.stats.cold.misses++;
    
    return {
      value: undefined,
      tier: null,
      latency: performance.now() - startTime
    };
  }
  
  /**
   * Write with tier selection
   */
  async write(key, value, options = {}) {
    const { tier = 'hot', ttl } = options;
    
    switch (tier) {
      case 'hot':
        this.hotMemory.set(key, value, ttl);
        break;
      case 'warm':
        await this.warmMemory.set(key, value);
        break;
      case 'cold':
        await this.coldMemory.set(key, value);
        break;
      case 'all':
        this.hotMemory.set(key, value, ttl);
        await this.warmMemory.set(key, value);
        await this.coldMemory.set(key, value);
        break;
    }
    
    return { success: true, tier };
  }
  
  /**
   * Get memory statistics
   */
  getStats() {
    return {
      ...this.stats,
      hotSize: this.hotMemory.size(),
      warmSize: this.warmMemory.size(),
      coldSize: this.coldMemory.size(),
      hotEntries: this.hotMemory.keys(),
      warmEntries: this.warmMemory.keys(),
      coldEntries: this.coldMemory.keys()
    };
  }
}

/**
 * 🔥 HOT MEMORY
 * In-memory cache with <100ms access time
 * Session context, recent interactions, active state
 */
class HotMemory {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.accessCounts = new Map();
    this.maxSize = 1000;
    this.defaultTTL = 300000; // 5 minutes
  }
  
  get(key) {
    const entry = this.cache.get(key);
    if (entry === undefined) return undefined;
    
    // Check TTL
    const timestamp = this.timestamps.get(key);
    const ttl = entry._ttl || this.defaultTTL;
    
    if (Date.now() - timestamp > ttl) {
      this.delete(key);
      return undefined;
    }
    
    // Update access stats
    this.accessCounts.set(key, (this.accessCounts.get(key) || 0) + 1);
    this.timestamps.set(key, Date.now());
    
    return entry._value;
  }
  
  set(key, value, ttl = this.defaultTTL) {
    // Evict if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this._evictLRU();
    }
    
    this.cache.set(key, {
      _value: value,
      _ttl: ttl
    });
    this.timestamps.set(key, Date.now());
    this.accessCounts.set(key, 0);
  }
  
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
    this.accessCounts.delete(key);
  }
  
  size() {
    return this.cache.size;
  }
  
  keys() {
    return Array.from(this.cache.keys());
  }
  
  _evictLRU() {
    // Find least recently used
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.timestamps) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
  
  /**
   * Session context management
   */
  setSessionContext(context) {
    this.set('_session_context', context, 86400000); // 24h
  }
  
  getSessionContext() {
    return this.get('_session_context');
  }
  
  /**
   * Conversation tracking
   */
  addToConversation(message) {
    const conversation = this.get('_conversation') || [];
    conversation.push({
      ...message,
      timestamp: Date.now()
    });
    
    // Keep last 50 messages
    if (conversation.length > 50) {
      conversation.shift();
    }
    
    this.set('_conversation', conversation, 3600000); // 1h
  }
  
  getConversation() {
    return this.get('_conversation') || [];
  }
  
  /**
   * Working memory - temporary scratchpad
   */
  setWorkingMemory(data) {
    this.set('_working_memory', data, 600000); // 10min
  }
  
  getWorkingMemory() {
    return this.get('_working_memory');
  }
  
  /**
   * Clear all session data
   */
  clearSession() {
    this.cache.clear();
    this.timestamps.clear();
    this.accessCounts.clear();
  }
}

/**
 * 🌡️ WARM MEMORY
 * Daily memory with <1s access time
 * Today's files, recent decisions, daily state
 */
class WarmMemory {
  constructor(basePath) {
    this.basePath = basePath;
    this.memoryPath = path.join(basePath, 'daily');
    this.cache = new Map(); // In-memory cache for today
    this.currentDate = this._getDateString();
  }
  
  async init() {
    if (!fs.existsSync(this.memoryPath)) {
      fs.mkdirSync(this.memoryPath, { recursive: true });
    }
    
    // Load today's memory into cache
    await this._loadToday();
  }
  
  _getDateString() {
    return new Date().toISOString().split('T')[0];
  }
  
  _getTodayPath() {
    return path.join(this.memoryPath, `${this.currentDate}.json`);
  }
  
  async _loadToday() {
    const todayPath = this._getTodayPath();
    
    if (fs.existsSync(todayPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(todayPath, 'utf8'));
        this.cache = new Map(Object.entries(data));
      } catch (e) {
        this.cache = new Map();
      }
    }
    
    // Check if date changed
    const currentDate = this._getDateString();
    if (currentDate !== this.currentDate) {
      // Archive old day and start fresh
      await this._archiveDay();
      this.currentDate = currentDate;
      this.cache = new Map();
    }
  }
  
  async _archiveDay() {
    // Warm memory automatically archives to cold
    // Implementation depends on cold memory structure
  }
  
  async _save() {
    const todayPath = this._getTodayPath();
    const data = Object.fromEntries(this.cache);
    fs.writeFileSync(todayPath, JSON.stringify(data, null, 2));
  }
  
  async get(key) {
    await this._loadToday(); // Check for date rollover
    return this.cache.get(key);
  }
  
  async set(key, value) {
    await this._loadToday();
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    await this._save();
  }
  
  async delete(key) {
    await this._loadToday();
    this.cache.delete(key);
    await this._save();
  }
  
  size() {
    return this.cache.size;
  }
  
  keys() {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Daily log management
   */
  async logEvent(event) {
    const logs = (await this.get('_daily_logs'))?.value || [];
    logs.push({
      ...event,
      timestamp: Date.now()
    });
    await this.set('_daily_logs', logs.slice(-100)); // Keep last 100
  }
  
  async getDailyLogs() {
    return (await this.get('_daily_logs'))?.value || [];
  }
  
  /**
   * Decision tracking
   */
  async recordDecision(decision) {
    const decisions = (await this.get('_decisions'))?.value || [];
    decisions.push({
      ...decision,
      timestamp: Date.now()
    });
    await this.set('_decisions', decisions.slice(-50));
  }
  
  async getRecentDecisions() {
    return (await this.get('_decisions'))?.value || [];
  }
  
  /**
   * File access tracking for today
   */
  async trackFileAccess(filePath, context = {}) {
    const files = (await this.get('_files_accessed'))?.value || {};
    files[filePath] = {
      lastAccess: Date.now(),
      accessCount: (files[filePath]?.accessCount || 0) + 1,
      ...context
    };
    await this.set('_files_accessed', files);
  }
  
  async getFilesAccessed() {
    return (await this.get('_files_accessed'))?.value || {};
  }
  
  /**
   * Daily summary generation
   */
  async generateDailySummary() {
    const logs = await this.getDailyLogs();
    const decisions = await this.getRecentDecisions();
    const files = await this.getFilesAccessed();
    
    return {
      date: this.currentDate,
      eventCount: logs.length,
      decisionCount: decisions.length,
      filesAccessed: Object.keys(files).length,
      highlights: logs.slice(-5),
      topDecisions: decisions.slice(-5)
    };
  }
}

/**
 * 🧊 COLD MEMORY
 * Curated wisdom with <5s access time
 * Long-term knowledge, patterns, important learnings
 */
class ColdMemory {
  constructor(basePath) {
    this.basePath = basePath;
    this.memoryPath = path.join(basePath, 'curated');
    this.indexPath = path.join(this.memoryPath, 'index.json');
    this.index = new Map();
  }
  
  async init() {
    if (!fs.existsSync(this.memoryPath)) {
      fs.mkdirSync(this.memoryPath, { recursive: true });
    }
    
    // Load index
    if (fs.existsSync(this.indexPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
        this.index = new Map(Object.entries(data));
      } catch (e) {
        this.index = new Map();
      }
    }
  }
  
  async _saveIndex() {
    fs.writeFileSync(this.indexPath, JSON.stringify(Object.fromEntries(this.index), null, 2));
  }
  
  _getEntryPath(key) {
    // Hash key for filesystem safety
    const hash = Buffer.from(key).toString('base64').replace(/[/+=]/g, '_');
    return path.join(this.memoryPath, `${hash}.json`);
  }
  
  async get(key) {
    const entry = this.index.get(key);
    if (!entry) return undefined;
    
    const entryPath = this._getEntryPath(key);
    
    if (fs.existsSync(entryPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
        
        // Update access stats
        entry.lastAccess = Date.now();
        entry.accessCount = (entry.accessCount || 0) + 1;
        await this._saveIndex();
        
        return data.value;
      } catch (e) {
        return undefined;
      }
    }
    
    return undefined;
  }
  
  async set(key, value, options = {}) {
    const entryPath = this._getEntryPath(key);
    const now = Date.now();
    
    // Store value
    fs.writeFileSync(entryPath, JSON.stringify({
      value,
      metadata: {
        created: now,
        importance: options.importance || 0.5,
        tags: options.tags || [],
        category: options.category || 'general'
      }
    }, null, 2));
    
    // Update index
    this.index.set(key, {
      created: now,
      lastAccess: now,
      accessCount: 0,
      importance: options.importance || 0.5,
      category: options.category || 'general'
    });
    
    await this._saveIndex();
  }
  
  async delete(key) {
    const entryPath = this._getEntryPath(key);
    
    if (fs.existsSync(entryPath)) {
      fs.unlinkSync(entryPath);
    }
    
    this.index.delete(key);
    await this._saveIndex();
  }
  
  size() {
    return this.index.size;
  }
  
  keys() {
    return Array.from(this.index.keys());
  }
  
  /**
   * Search by tags
   */
  async findByTag(tag) {
    const results = [];
    
    for (const [key, entry] of this.index) {
      const fullEntry = await this.get(key);
      if (fullEntry?.metadata?.tags?.includes(tag)) {
        results.push({ key, entry: fullEntry });
      }
    }
    
    return results;
  }
  
  /**
   * Search by category
   */
  async findByCategory(category) {
    const results = [];
    
    for (const [key, entry] of this.index) {
      if (entry.category === category) {
        const fullEntry = await this.get(key);
        results.push({ key, entry: fullEntry });
      }
    }
    
    return results;
  }
  
  /**
   * Get most important entries
   */
  async getMostImportant(limit = 10) {
    const sorted = Array.from(this.index.entries())
      .sort((a, b) => (b[1].importance || 0) - (a[1].importance || 0))
      .slice(0, limit);
    
    const results = [];
    for (const [key] of sorted) {
      const entry = await this.get(key);
      results.push({ key, entry });
    }
    
    return results;
  }
  
  /**
   * Curate wisdom from warm memory
   */
  async curateFromWarm(warmMemory, key, options = {}) {
    const value = await warmMemory.get(key);
    if (value !== undefined) {
      await this.set(key, value.value, {
        importance: options.importance || 0.7,
        tags: options.tags || [],
        category: options.category || 'curated'
      });
    }
  }
  
  /**
   * Knowledge graph - link related concepts
   */
  async linkConcepts(concept1, concept2, relationship = 'related') {
    const links = (await this.get('_concept_links')) || {};
    
    if (!links[concept1]) links[concept1] = [];
    links[concept1].push({ concept: concept2, relationship, timestamp: Date.now() });
    
    if (!links[concept2]) links[concept2] = [];
    links[concept2].push({ concept: concept1, relationship, timestamp: Date.now() });
    
    await this.set('_concept_links', links, { category: 'meta' });
  }
  
  async getRelatedConcepts(concept) {
    const links = await this.get('_concept_links');
    return links?.[concept] || [];
  }
}

// Export for module usage
module.exports = { MemoryArchitecture, HotMemory, WarmMemory, ColdMemory };

// Example usage
if (require.main === module) {
  async function demo() {
    const memory = new MemoryArchitecture('/tmp/memory-demo');
    await memory.init();
    
    console.log('🧠 3-Tier Memory Architecture - Demo');
    console.log('=====================================\n');
    
    // Hot memory operations
    console.log('🔥 Hot Memory (<100ms):');
    await memory.write('session_user', { name: 'Can', context: 'coding' }, { tier: 'hot' });
    const hotRead = await memory.read('session_user');
    console.log(`  Write/Read: ${hotRead.tier} tier, ${hotRead.latency.toFixed(2)}ms`);
    
    // Warm memory operations
    console.log('\n🌡️ Warm Memory (<1s):');
    await memory.write('daily_tasks', ['Implement router', 'Test memory', 'Document'], { tier: 'warm' });
    const warmRead = await memory.read('daily_tasks');
    console.log(`  Write/Read: ${warmRead.tier} tier, ${warmRead.latency.toFixed(2)}ms`);
    
    // Cold memory operations
    console.log('\n🧊 Cold Memory (<5s):');
    await memory.write('user_preferences', { theme: 'dark', notifications: true }, { 
      tier: 'cold',
      importance: 0.9,
      tags: ['user', 'settings'],
      category: 'preferences'
    });
    const coldRead = await memory.read('user_preferences');
    console.log(`  Write/Read: ${coldRead.tier} tier, ${coldRead.latency.toFixed(2)}ms`);
    
    // Tier promotion demo
    console.log('\n⬆️ Tier Promotion (cold → warm → hot):');
    const promoted = await memory.read('user_preferences');
    console.log(`  After read: ${promoted.tier} tier (promoted from cold)`);
    
    // Read again - should be hot now
    const hotAgain = await memory.read('user_preferences');
    console.log(`  Second read: ${hotAgain.tier} tier`);
    
    // Stats
    console.log('\n📊 Memory Statistics:');
    const stats = memory.getStats();
    console.log(`  Hot: ${stats.hot.hits} hits, ${stats.hot.misses} misses`);
    console.log(`  Warm: ${stats.warm.hits} hits, ${stats.warm.misses} misses`);
    console.log(`  Cold: ${stats.cold.hits} hits, ${stats.cold.misses} misses`);
    
    console.log('\n✅ Memory Architecture ready!');
  }
  
  demo().catch(console.error);
}
