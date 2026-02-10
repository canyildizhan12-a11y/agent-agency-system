#!/usr/bin/env node
/**
 * Agent Work Executor
 * Actually executes tasks assigned to agents using LLM capabilities
 */

const fs = require('fs');
const path = require('path');
const { spawnWorkAgent, executeAgentWork } = require('./lib/llm-bridge');

const AGENCY_DIR = path.join(__dirname);

// Load agent memory
function loadAgentMemory(agentId) {
  const file = path.join(AGENCY_DIR, 'agents', `${agentId}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveAgentMemory(agentId, memory) {
  const file = path.join(AGENCY_DIR, 'agents', `${agentId}.json`);
  fs.writeFileSync(file, JSON.stringify(memory, null, 2));
}

// Execute all pending tasks
async function executePendingTasks() {
  console.log("🔧 EXECUTING PENDING AGENT TASKS\n");
  
  const agentsDir = path.join(AGENCY_DIR, 'agents');
  const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.json'));
  
  let completedCount = 0;
  
  for (const file of agentFiles) {
    const agentId = file.replace('.json', '');
    const memory = loadAgentMemory(agentId);
    
    // Find pending tasks
    const pendingTasks = memory.memory.action_items?.filter(t => t.status === 'pending') || [];
    
    for (const task of pendingTasks) {
      console.log(`\n📋 Task: ${task.task}`);
      console.log(`👤 Agent: ${agentId}`);
      console.log(`⏳ Due: ${task.due}`);
      
      // Spawn work session
      const workSession = await spawnWorkAgent(agentId, task.task, {
        assigned_in_meeting: task.assigned_in_meeting,
        priority: task.priority
      });
      
      // Execute the work
      try {
        const result = await executeAgentWork(workSession.id);
        
        // Update task status
        task.status = 'completed';
        task.completed_at = new Date().toISOString();
        task.work_session_id = workSession.id;
        task.result_summary = result.output;
        
        // Add to agent's completed work
        if (!memory.memory.personal.recent_achievements) {
          memory.memory.personal.recent_achievements = [];
        }
        memory.memory.personal.recent_achievements.push({
          task: task.task,
          completed_at: task.completed_at,
          summary: result.output
        });
        
        completedCount++;
        
        console.log(`✅ Completed: ${result.output.substring(0, 100)}...\n`);
        
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        task.status = 'failed';
        task.error = error.message;
      }
      
      // Save updated memory
      saveAgentMemory(agentId, memory);
    }
  }
  
  console.log(`\n📊 SUMMARY: ${completedCount} tasks completed`);
  
  return completedCount;
}

// Execute specific agent task
async function executeAgentTask(agentId, taskDescription) {
  console.log(`🚀 Executing task for ${agentId}: ${taskDescription}`);
  
  const workSession = await spawnWorkAgent(agentId, taskDescription, {
    manual_execution: true
  });
  
  const result = await executeAgentWork(workSession.id);
  
  console.log(`\n✅ Result: ${result.output}`);
  
  return result;
}

// CLI
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'all') {
    executePendingTasks().catch(console.error);
  } else if (command === 'agent' && process.argv[3]) {
    const agentId = process.argv[3];
    const task = process.argv[4] || 'General task';
    executeAgentTask(agentId, task).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  node execute-work.js all          # Execute all pending tasks');
    console.log('  node execute-work.js agent [id] [task]  # Execute specific task');
    console.log('');
    console.log('Examples:');
    console.log('  node execute-work.js all');
    console.log('  node execute-work.js agent echo "Build authentication system"');
    console.log('  node execute-work.js agent quill "Write blog post about AI trends"');
  }
}

module.exports = { executePendingTasks, executeAgentTask };
