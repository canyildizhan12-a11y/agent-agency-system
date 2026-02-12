import type { NextApiRequest, NextApiResponse } from 'next';
import { spawnAgent, isAgentActive } from '../../lib/openclaw';
import fs from 'fs';
import path from 'path';

const AGENCY_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get agent status
    try {
      const agentsFile = path.join(AGENCY_DIR, 'agents.json');
      const agentsData = JSON.parse(fs.readFileSync(agentsFile, 'utf8'));
      
      // Check actual status from OpenClaw
      const agentsWithStatus = agentsData.agents.map((agent: any) => {
        const isActive = isAgentActive(agent.id);
        
        // Also check sleeping_agents folder
        const sleepFile = path.join(AGENCY_DIR, 'sleeping_agents', `${agent.id}.json`);
        let status = 'sleeping';
        let lastTask = null;
        let wokenAt = null;
        
        if (fs.existsSync(sleepFile)) {
          const data = JSON.parse(fs.readFileSync(sleepFile, 'utf8'));
          status = data.status || 'sleeping';
          lastTask = data.current_task || data.last_task;
          wokenAt = data.woken_at;
          
          // Override if actually active in OpenClaw
          if (isActive) {
            status = 'working';
          }
        }
        
        return {
          id: agent.id,
          name: agent.name,
          emoji: agent.emoji,
          role: agent.role,
          personality: agent.personality,
          skills: agent.skills,
          status,
          lastTask,
          wokenAt,
          isActive
        };
      });
      
      res.status(200).json(agentsWithStatus);
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    // Wake/spawn an agent
    const { agentId, task, message } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID required' });
    }
    
    try {
      // ACTUALLY spawn the agent via OpenClaw
      const result = await spawnAgent(agentId, task || message || 'Wake up and standby');
      
      // Update status file
      const sleepFile = path.join(AGENCY_DIR, 'sleeping_agents', `${agentId}.json`);
      if (fs.existsSync(sleepFile)) {
        const data = JSON.parse(fs.readFileSync(sleepFile, 'utf8'));
        data.status = 'awake';
        data.woken_at = new Date().toISOString();
        data.woken_by = 'dashboard';
        data.current_task = task || message;
        fs.writeFileSync(sleepFile, JSON.stringify(data, null, 2));
      }
      
      res.status(200).json({
        success: true,
        agentId,
        agentName: result.name,
        agentEmoji: result.emoji,
        message: `🚀 ${agentId} is now awake and working`,
        openclawResult: result
      });
    } catch (err: any) {
      console.error('Error spawning agent:', err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
