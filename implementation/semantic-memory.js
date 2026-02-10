/**
 * Semantic Memory Search System
 * Embedding-based retrieval for long-term memory
 * 
 * Features:
 * - Generate embeddings for text memories
 * - Store and retrieve memories by semantic similarity
 * - Vector-based search for relevant context
 * - Integration with memory system
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple embedding generation (simulated - replace with actual API)
// In production, use OpenAI, Cohere, or local embedding models
class EmbeddingGenerator {
  constructor(options = {}) {
    this.provider = options.provider || 'local'; // 'local', 'openai', 'cohere'
    this.apiKey = options.apiKey || null;
    this.model = options.model || 'text-embedding-3-small';
    this.dimension = options.dimension || 1536;
    this.localCache = new Map();
  }

  /**
   * Generate embedding vector for text
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generate(text) {
    // Check cache first
    const cacheKey = this._hashText(text);
    if (this.localCache.has(cacheKey)) {
      return this.localCache.get(cacheKey);
    }

    let embedding;

    switch (this.provider) {
      case 'openai':
        embedding = await this._generateOpenAI(text);
        break;
      case 'cohere':
        embedding = await this._generateCohere(text);
        break;
      case 'local':
      default:
        embedding = this._generateLocal(text);
    }

    // Cache result
    this.localCache.set(cacheKey, embedding);
    
    // Limit cache size
    if (this.localCache.size > 1000) {
      const firstKey = this.localCache.keys().next().value;
      this.localCache.delete(firstKey);
    }

    return embedding;
  }

  /**
   * Generate batch embeddings
   * @param {string[]} texts - Array of texts
   * @returns {Promise<number[][]>} - Array of embeddings
   */
  async generateBatch(texts) {
    const embeddings = [];
    for (const text of texts) {
      embeddings.push(await this.generate(text));
    }
    return embeddings;
  }

  /**
   * Local embedding using TF-IDF-like approach
   * Simulates semantic meaning through word frequency analysis
   * @private
   */
  _generateLocal(text) {
    // Normalize text
    const normalized = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
    
    const words = normalized.split(/\s+/).filter(w => w.length > 2);
    
    // Create a vocabulary hash
    const vocab = new Set(words);
    const vocabArray = Array.from(vocab).sort();
    
    // Create embedding vector based on word presence and position
    const embedding = new Array(this.dimension).fill(0);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = this._hashString(word);
      
      // Distribute word influence across dimensions
      for (let j = 0; j < 5; j++) {
        const dim = (hash + j * 997) % this.dimension;
        const positionWeight = 1 - (i / words.length) * 0.5; // Earlier words weighted slightly higher
        const tf = words.filter(w => w === word).length / words.length;
        embedding[dim] += tf * positionWeight;
      }
    }

    // Normalize vector
    return this._normalize(embedding);
  }

  /**
   * OpenAI embedding API
   * @private
   */
  async _generateOpenAI(text) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key required');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: this.model
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Cohere embedding API
   * @private
   */
  async _generateCohere(text) {
    if (!this.apiKey) {
      throw new Error('Cohere API key required');
    }

    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_document'
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embeddings[0];
  }

  /**
   * Hash text for caching
   * @private
   */
  _hashText(text) {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Simple string hash for indexing
   * @private
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Normalize vector to unit length
   * @private
   */
  _normalize(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }
}

/**
 * Memory entry with embedding
 * @typedef {Object} MemoryEntry
 * @property {string} id - Unique identifier
 * @property {string} content - Raw memory content
 * @property {number[]} embedding - Vector embedding
 * @property {string} timestamp - ISO timestamp
 * @property {Object} metadata - Additional metadata
 * @property {string} category - Memory category
 * @property {number} importance - Importance score (0-1)
 */

class SemanticMemory {
  constructor(options = {}) {
    this.memoryDir = options.memoryDir || '/home/ubuntu/.openclaw/workspace/agent-agency/memory/semantic';
    this.indexFile = options.indexFile || path.join(this.memoryDir, 'index.json');
    this.dimension = options.dimension || 1536;
    this.maxMemories = options.maxMemories || 10000;
    this.defaultTopK = options.defaultTopK || 5;
    this.similarityThreshold = options.similarityThreshold || 0.6;
    
    this.embedder = new EmbeddingGenerator({
      provider: options.embeddingProvider || 'local',
      apiKey: options.embeddingApiKey,
      dimension: this.dimension
    });

    this.index = new Map();
    this.memories = new Map();
    
    this._ensureDirectory();
    this._loadIndex();
  }

  /**
   * Ensure memory directory exists
   * @private
   */
  _ensureDirectory() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  /**
   * Load existing index
   * @private
   */
  _loadIndex() {
    try {
      if (fs.existsSync(this.indexFile)) {
        const data = JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
        
        for (const entry of data.memories || []) {
          this.index.set(entry.id, {
            id: entry.id,
            timestamp: entry.timestamp,
            category: entry.category,
            importance: entry.importance,
            content: entry.content.substring(0, 100) // Preview only
          });
        }

        // Load full memory files
        for (const id of this.index.keys()) {
          const memoryPath = path.join(this.memoryDir, `${id}.json`);
          if (fs.existsSync(memoryPath)) {
            const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
            this.memories.set(id, memory);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load semantic memory index:', error.message);
    }
  }

  /**
   * Save index to disk
   * @private
   */
  _saveIndex() {
    try {
      const indexData = {
        version: '1.0',
        updatedAt: new Date().toISOString(),
        memoryCount: this.index.size,
        memories: Array.from(this.index.values())
      };
      
      fs.writeFileSync(this.indexFile, JSON.stringify(indexData, null, 2));
    } catch (error) {
      console.error('Failed to save semantic memory index:', error.message);
    }
  }

  /**
   * Store a new memory with embedding
   * @param {string} content - Memory content
   * @param {Object} options - Storage options
   * @returns {Promise<MemoryEntry>} - Stored memory
   */
  async store(content, options = {}) {
    try {
      // Generate embedding
      const embedding = await this.embedder.generate(content);
      
      // Create memory entry
      const memoryId = options.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const memory = {
        id: memoryId,
        content,
        embedding,
        timestamp: new Date().toISOString(),
        category: options.category || 'general',
        importance: options.importance || 0.5,
        metadata: options.metadata || {},
        source: options.source || 'unknown',
        tags: options.tags || []
      };

      // Store in memory and index
      this.memories.set(memoryId, memory);
      this.index.set(memoryId, {
        id: memoryId,
        timestamp: memory.timestamp,
        category: memory.category,
        importance: memory.importance,
        content: content.substring(0, 100)
      });

      // Save to disk
      const memoryPath = path.join(this.memoryDir, `${memoryId}.json`);
      fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));

      // Manage storage limit
      await this._enforceStorageLimit();
      
      // Update index
      this._saveIndex();

      return memory;
    } catch (error) {
      console.error('Failed to store memory:', error.message);
      throw error;
    }
  }

  /**
   * Search memories by semantic similarity
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Matching memories with scores
   */
  async search(query, options = {}) {
    try {
      const topK = options.topK || this.defaultTopK;
      const threshold = options.threshold || this.similarityThreshold;
      const category = options.category || null;
      const minImportance = options.minImportance || 0;

      // Generate query embedding
      const queryEmbedding = await this.embedder.generate(query);

      // Calculate similarities
      const results = [];
      
      for (const [id, memory] of this.memories) {
        // Filter by category if specified
        if (category && memory.category !== category) continue;
        
        // Filter by importance
        if (memory.importance < minImportance) continue;

        // Calculate cosine similarity
        const similarity = this._cosineSimilarity(queryEmbedding, memory.embedding);
        
        if (similarity >= threshold) {
          results.push({
            memory: {
              id: memory.id,
              content: memory.content,
              timestamp: memory.timestamp,
              category: memory.category,
              importance: memory.importance,
              metadata: memory.metadata,
              tags: memory.tags
            },
            similarity: Math.round(similarity * 1000) / 1000,
            rank: 0 // Will be set after sorting
          });
        }
      }

      // Sort by similarity descending
      results.sort((a, b) => b.similarity - a.similarity);

      // Take top K and add ranks
      const topResults = results.slice(0, topK);
      topResults.forEach((r, i) => r.rank = i + 1);

      return topResults;
    } catch (error) {
      console.error('Semantic search failed:', error.message);
      return [];
    }
  }

  /**
   * Find memories similar to a specific memory
   * @param {string} memoryId - ID of reference memory
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Similar memories
   */
  async findSimilar(memoryId, options = {}) {
    const memory = this.memories.get(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    // Use memory content as query
    const query = memory.content;
    const results = await this.search(query, { ...options, topK: (options.topK || 5) + 1 });
    
    // Exclude the query memory itself
    return results.filter(r => r.memory.id !== memoryId);
  }

  /**
   * Retrieve memory by ID
   * @param {string} memoryId - Memory ID
   * @returns {MemoryEntry|null} - Memory or null
   */
  get(memoryId) {
    return this.memories.get(memoryId) || null;
  }

  /**
   * Update memory content
   * @param {string} memoryId - Memory ID
   * @param {string} newContent - New content
   * @param {Object} updates - Other updates
   * @returns {Promise<MemoryEntry>} - Updated memory
   */
  async update(memoryId, newContent, updates = {}) {
    const memory = this.memories.get(memoryId);
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`);
    }

    // Regenerate embedding if content changed
    if (newContent !== memory.content) {
      memory.embedding = await this.embedder.generate(newContent);
      memory.content = newContent;
    }

    // Apply other updates
    Object.assign(memory, updates);
    memory.updatedAt = new Date().toISOString();

    // Save
    const memoryPath = path.join(this.memoryDir, `${memoryId}.json`);
    fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
    
    // Update index preview
    this.index.set(memoryId, {
      ...this.index.get(memoryId),
      content: newContent.substring(0, 100),
      category: memory.category,
      importance: memory.importance
    });
    this._saveIndex();

    return memory;
  }

  /**
   * Delete a memory
   * @param {string} memoryId - Memory ID to delete
   * @returns {boolean} - Success status
   */
  delete(memoryId) {
    try {
      this.memories.delete(memoryId);
      this.index.delete(memoryId);

      const memoryPath = path.join(this.memoryDir, `${memoryId}.json`);
      if (fs.existsSync(memoryPath)) {
        fs.unlinkSync(memoryPath);
      }

      this._saveIndex();
      return true;
    } catch (error) {
      console.error(`Failed to delete memory ${memoryId}:`, error.message);
      return false;
    }
  }

  /**
   * List all memories with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Array} - Filtered memories
   */
  list(filters = {}) {
    let results = Array.from(this.memories.values());

    if (filters.category) {
      results = results.filter(m => m.category === filters.category);
    }

    if (filters.minImportance) {
      results = results.filter(m => m.importance >= filters.minImportance);
    }

    if (filters.tags) {
      const tagSet = new Set(filters.tags);
      results = results.filter(m => 
        m.tags.some(tag => tagSet.has(tag))
      );
    }

    // Sort by timestamp desc
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Get memory statistics
   * @returns {Object} - Statistics
   */
  getStats() {
    const memories = Array.from(this.memories.values());
    
    const categories = {};
    for (const m of memories) {
      categories[m.category] = (categories[m.category] || 0) + 1;
    }

    return {
      totalMemories: memories.length,
      categories,
      averageImportance: memories.reduce((sum, m) => sum + m.importance, 0) / memories.length || 0,
      oldestMemory: memories.length > 0 
        ? Math.min(...memories.map(m => new Date(m.timestamp)))
        : null,
      newestMemory: memories.length > 0
        ? Math.max(...memories.map(m => new Date(m.timestamp)))
        : null
    };
  }

  /**
   * Enforce storage limit by removing oldest/lowest importance memories
   * @private
   */
  async _enforceStorageLimit() {
    if (this.memories.size <= this.maxMemories) return;

    const toRemove = this.memories.size - this.maxMemories;
    const memories = Array.from(this.memories.values());

    // Sort by importance (asc) then by timestamp (asc)
    memories.sort((a, b) => {
      if (a.importance !== b.importance) {
        return a.importance - b.importance;
      }
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    // Remove oldest lowest-importance memories
    for (let i = 0; i < toRemove; i++) {
      await this.delete(memories[i].id);
    }

    console.log(`Pruned ${toRemove} memories to enforce storage limit`);
  }

  /**
   * Calculate cosine similarity between two vectors
   * @private
   */
  _cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

/**
 * Memory-augmented retrieval for conversations
 * Automatically retrieves relevant context based on current query
 */
class ContextualMemory {
  constructor(semanticMemory, options = {}) {
    this.memory = semanticMemory;
    this.contextWindow = options.contextWindow || 5;
    this.minRelevanceScore = options.minRelevanceScore || 0.7;
  }

  /**
   * Enhance a query with relevant historical context
   * @param {string} query - Current query
   * @param {Object} options - Retrieval options
   * @returns {Promise<Object>} - Query with context
   */
  async augmentQuery(query, options = {}) {
    const searchResults = await this.memory.search(query, {
      topK: this.contextWindow,
      threshold: this.minRelevanceScore,
      ...options
    });

    if (searchResults.length === 0) {
      return {
        originalQuery: query,
        context: [],
        augmentedQuery: query,
        hasContext: false
      };
    }

    // Build context string
    const contextParts = searchResults.map((result, i) => {
      const date = new Date(result.memory.timestamp).toLocaleDateString();
      return `[Context ${i + 1}] (${date}, relevance: ${result.similarity}):\n${result.memory.content}`;
    });

    const augmentedQuery = `Relevant context from memory:\n${contextParts.join('\n\n')}\n\nCurrent query: ${query}`;

    return {
      originalQuery: query,
      context: searchResults,
      augmentedQuery,
      hasContext: true
    };
  }

  /**
   * Store interaction with automatic context linking
   * @param {string} query - User query
   * @param {string} response - System response
   * @param {Object} metadata - Additional metadata
   */
  async storeInteraction(query, response, metadata = {}) {
    const combined = `Q: ${query}\nA: ${response}`;
    
    await this.memory.store(combined, {
      category: 'interaction',
      importance: metadata.importance || 0.5,
      metadata: {
        query,
        responseLength: response.length,
        ...metadata
      },
      tags: metadata.tags || ['conversation']
    });
  }
}

// ==================== Integration Helpers ====================

/**
 * Create semantic memory system with default configuration
 */
function createSemanticMemory(options = {}) {
  return new SemanticMemory({
    memoryDir: '/home/ubuntu/.openclaw/workspace/agent-agency/memory/semantic',
    ...options
  });
}

/**
 * Quick search helper
 */
async function semanticSearch(query, options = {}) {
  const memory = createSemanticMemory(options);
  return await memory.search(query, options);
}

/**
 * Store and index content
 */
async function indexContent(content, options = {}) {
  const memory = createSemanticMemory(options);
  return await memory.store(content, options);
}

// ==================== Export ====================

module.exports = {
  SemanticMemory,
  ContextualMemory,
  EmbeddingGenerator,
  createSemanticMemory,
  semanticSearch,
  indexContent
};

// CLI usage example
if (require.main === module) {
  async function demo() {
    console.log('Semantic Memory System - Demo Mode\n');
    console.log('=' .repeat(60));

    const memory = new SemanticMemory({
      memoryDir: '/tmp/semantic-memory-demo'
    });

    // Store sample memories
    const sampleMemories = [
      { content: "The user prefers dark mode in all applications", category: "preferences", importance: 0.8 },
      { content: "User's favorite programming language is Python", category: "preferences", importance: 0.7 },
      { content: "Meeting with the design team scheduled for Friday at 2pm", category: "calendar", importance: 0.9 },
      { content: "Project deadline is approaching - need to finish documentation", category: "tasks", importance: 0.9 },
      { content: "User mentioned they like minimalist UI design", category: "preferences", importance: 0.6 },
      { content: "API keys are stored in the environment variables", category: "technical", importance: 0.7 },
      { content: "User has a cat named Whiskers", category: "personal", importance: 0.5 },
    ];

    console.log('\nStoring sample memories...');
    for (const mem of sampleMemories) {
      await memory.store(mem.content, mem);
      console.log(`  ✓ Stored: "${mem.content.substring(0, 50)}..."`);
    }

    // Perform searches
    const queries = [
      "What does the user like?",
      "Tell me about upcoming meetings",
      "Technical setup information",
      "Anything about pets or animals"
    ];

    console.log('\n' + '=' .repeat(60));
    console.log('Semantic Search Results:\n');

    for (const query of queries) {
      console.log(`\nQuery: "${query}"`);
      const results = await memory.search(query, { topK: 3 });
      
      if (results.length === 0) {
        console.log('  No relevant memories found');
      } else {
        for (const result of results) {
          console.log(`  ${result.rank}. [${result.similarity}] ${result.memory.content.substring(0, 60)}...`);
        }
      }
    }

    // Show stats
    console.log('\n' + '=' .repeat(60));
    console.log('Memory Statistics:');
    console.log(memory.getStats());
  }

  demo().catch(console.error);
}
