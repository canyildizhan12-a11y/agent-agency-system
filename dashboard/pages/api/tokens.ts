import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getTokenSavings } from '../../lib/openclaw';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';
const TOKEN_DIR = path.join(AGENCY_DIR, 'token_logs');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { agentId, range = 'today' } = req.query;
  
  try {
    // Get token savings stats
    const savings = getTokenSavings();
    
    // Get usage data
    const usage = getTokenUsage(range as string, agentId as string);
    
    // Get performance metrics
    const performance = getPerformanceMetrics();
    
    res.status(200).json({
      success: true,
      optimization: savings,
      usage,
      performance,
      generatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get token usage statistics
 */
function getTokenUsage(range: string, agentId?: string) {
  const today = new Date().toISOString().split('T')[0];
  const files = fs.readdirSync(TOKEN_DIR).filter(f => f.endsWith('.json') && !f.includes('performance'));
  
  let totalTokens = 0;
  let totalInput = 0;
  let totalOutput = 0;
  const byAgent: Record<string, { tokens: number; requests: number }> = {};
  const byDay: Record<string, number> = {};
  
  for (const file of files) {
    const date = file.replace('.json', '');
    const filepath = path.join(TOKEN_DIR, file);
    
    try {
      const logs: any[] = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      for (const log of logs) {
        if (agentId && log.agentId !== agentId) continue;
        
        totalTokens += log.totalTokens || 0;
        totalInput += log.inputTokens || 0;
        totalOutput += log.outputTokens || 0;
        
        // By agent
        if (!byAgent[log.agentId]) {
          byAgent[log.agentId] = { tokens: 0, requests: 0 };
        }
        byAgent[log.agentId].tokens += log.totalTokens || 0;
        byAgent[log.agentId].requests += 1;
        
        // By day
        if (!byDay[date]) byDay[date] = 0;
        byDay[date] += log.totalTokens || 0;
      }
    } catch {
      // Skip corrupt files
    }
  }
  
  return {
    totalTokens,
    totalInput,
    totalOutput,
    byAgent,
    byDay,
    estimatedCost: calculateCost(totalTokens)
  };
}

/**
 * Get performance metrics
 */
function getPerformanceMetrics() {
  const perfFile = path.join(TOKEN_DIR, 'performance.json');
  
  if (!fs.existsSync(perfFile)) {
    return { avgDuration: 0, totalRequests: 0, avgTokens: 0 };
  }
  
  try {
    const logs: any[] = JSON.parse(fs.readFileSync(perfFile, 'utf8'));
    
    if (logs.length === 0) {
      return { avgDuration: 0, totalRequests: 0, avgTokens: 0 };
    }
    
    const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalTokens = logs.reduce((sum, log) => sum + (log.estimatedTokens || 0), 0);
    
    return {
      avgDuration: Math.round(totalDuration / logs.length),
      totalRequests: logs.length,
      avgTokens: Math.round(totalTokens / logs.length),
      last24h: logs.filter(l => 
        new Date(l.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      ).length
    };
  } catch {
    return { avgDuration: 0, totalRequests: 0, avgTokens: 0 };
  }
}

/**
 * Calculate estimated cost (based on typical API pricing)
 */
function calculateCost(tokens: number): { usd: number; local: string } {
  // Rough estimate: $0.003 per 1K tokens for Kimi K2.5
  const usd = (tokens / 1000) * 0.003;
  
  return {
    usd: Math.round(usd * 100) / 100,
    local: `$${usd.toFixed(3)} USD`
  };
}