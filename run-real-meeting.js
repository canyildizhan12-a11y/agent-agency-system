#!/usr/bin/env node
/**
 * Real Multi-Agent Meeting Runner
 * 
 * INSTRUCTIONS FOR THE MAIN AGENT (Garmin):
 * 
 * This script generates the prompts needed to run a REAL multi-agent meeting
 * using sessions_spawn. As the main agent, you should:
 * 
 * 1. Read this script to understand the meeting flow
 * 2. Use sessions_spawn to create a sub-agent session for EACH agent turn
 * 3. Pass the generated prompt to each sub-agent
 * 4. Collect responses
 * 5. Continue the meeting
 * 
 * EXAMPLE workflow:
 * 
 * const prompts = require('./agent-prompts');
 * 
 * // Round 1: Wake all agents
 * for (const agentId of ['henry', 'scout', 'pixel', 'echo', 'quill', 'codex', 'alex']) {
 *   sessions_spawn({
 *     task: prompts.generateMeetingPrompts(topic)[agentId],
 *     model: 'kimi-coding/k2p5',
 *     timeoutSeconds: 60
 *   });
 * }
 * 
 * Since you (Garmin) are the one executing this, you have access to the 
 * sessions_spawn tool. Use it to spawn REAL sub-agent sessions.
 */

const { generateMeetingPrompts, generateWorkPrompt, AGENTS, AGENT_DEFINITIONS } = require('./agent-prompts');

const MEETING_TOPICS = [
  "Content Performance Review - Analyze our latest content metrics and identify optimization opportunities",
  "Social Media Monitoring - Review mentions, sentiment, trending topics, and competitor activity",
  "Competitor Analysis - Deep dive on competitor strategies, features, and market positioning",
  "New Ideas Brainstorm - Generate creative concepts for upcoming content and campaigns",
  "Task Prioritization - Review backlog, set priorities, and allocate resources for next sprint",
  "Blockers and Support - Identify obstacles, provide team assistance, and resolve issues",
  "Lessons Learned - Review recent projects, extract insights, and document best practices",
  "Upcoming Content Planning - Finalize content calendar, assign ownership, and set deadlines"
];

function getRandomTopic() {
  return MEETING_TOPICS[Math.floor(Math.random() * MEETING_TOPICS.length)];
}

function generateMeetingInstructions() {
  const topic = getRandomTopic();
  
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║         REAL MULTI-AGENT MEETING - INSTRUCTIONS                    ║
║         For Main Agent (Garmin)                                    ║
╚════════════════════════════════════════════════════════════════════╝

📋 TODAY'S TOPIC: ${topic}

TO RUN THIS MEETING WITH REAL LLM SUB-AGENTS:

Step 1: Generate prompts for all agents
----------------------------------------
const { generateMeetingPrompts } = require('./agent-prompts');
const prompts = generateMeetingPrompts('${topic}');

Step 2: Spawn each agent as a REAL sub-agent session
----------------------------------------------------
FOR EACH agentId IN ['henry', 'scout', 'pixel', 'echo', 'quill', 'codex', 'alex']:
  CALL TOOL: sessions_spawn
    task: prompts[agentId]
    model: 'kimi-coding/k2p5'
    timeoutSeconds: 60
    label: \`meeting-\${agentId}\`

Step 3: Collect responses
-------------------------
Wait for all 7 sub-agents to complete
Collect their responses

Step 4: Continue to Round 2
---------------------------
const round2Prompts = generateMeetingPrompts('${topic}', [round1Responses]);
Repeat Step 2 with round2Prompts

Step 5: Henry summarizes and assigns work
-----------------------------------------
Spawn Henry with summary prompt
Generate action items

Step 6: Execute work
--------------------
For each action item:
  CALL TOOL: sessions_spawn
    task: generateWorkPrompt(agentId, task)
    model: 'kimi-coding/k2p5'
    timeoutSeconds: 120

AGENTS TO SPAWN:
${AGENTS.map(id => {
  const agent = AGENT_DEFINITIONS[id];
  return `  ${agent.emoji} ${agent.name} (${agent.role})`;
}).join('\n')}

════════════════════════════════════════════════════════════════════

ACTUAL PROMPTS FOR THIS MEETING:
`);

  // Show the actual prompts
  const prompts = generateMeetingPrompts(topic);
  
  for (const [agentId, prompt] of Object.entries(prompts)) {
    const agent = AGENT_DEFINITIONS[agentId];
    console.log(`\n${'='.repeat(70)}`);
    console.log(`PROMPT FOR ${agent.emoji} ${agent.name}:`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(prompt.substring(0, 500) + '...\n');
  }
  
  return { topic, prompts };
}

// Main execution
if (require.main === module) {
  const meeting = generateMeetingInstructions();
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('NEXT STEPS:');
  console.log(`${'='.repeat(70)}\n`);
  console.log('1. As the main agent (Garmin), copy the prompts above');
  console.log('2. Use sessions_spawn tool to spawn 7 sub-agents');
  console.log('3. Each sub-agent runs independently with Kimi K2.5');
  console.log('4. Collect all responses');
  console.log('5. Continue meeting with Round 2\n');
  console.log('This creates REAL intelligent conversations, not templates.\n');
}

module.exports = { generateMeetingInstructions, getRandomTopic, MEETING_TOPICS };
