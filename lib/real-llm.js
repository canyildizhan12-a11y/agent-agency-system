const { sessions_spawn } = require('../../../../../.npm-global/lib/node_modules/openclaw/skills/coding-agent/SKILL.md') || {};
const fs = require('fs');
const path = require('path');

const AGENCY_DIR = path.join(__dirname, '..');

// Load agent definition
function loadAgent(agentId) {
  const agents = JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'agents.json'), 'utf8'));
  return agents.agents.find(a => a.id === agentId);
}

// Create system prompt for an agent
function createSystemPrompt(agent) {
  return `You are ${agent.name}, ${agent.role}.

PERSONALITY: ${agent.personality}

YOUR EXPERTISE: ${agent.skills.join(', ')}
TRAITS: Leadership ${agent.traits.leadership}/10, Creativity ${agent.traits.creativity}/10, Technical ${agent.traits.technical}/10, Analytical ${agent.traits.analytical}/10, Social ${agent.traits.social}/10

COMMUNICATION STYLE: ${agent.communication_style}
STRENGTHS: ${agent.strengths.join(', ')}
WEAKNESSES: ${agent.weaknesses.join(', ')}

CRITICAL RULES:
1. ALWAYS stay in character as ${agent.name}
2. Start EVERY response with ${agent.emoji}
3. Use your professional expertise
4. Be specific, use data, suggest concrete actions
5. NEVER break character or mention you are an AI
6. Respond naturally as this expert would in a meeting`;
}

// Call real LLM using sessions_spawn
async function callRealAgent(agentId, prompt, context = {}) {
  const agent = loadAgent(agentId);
  const systemPrompt = createSystemPrompt(agent);
  
  const fullPrompt = `${systemPrompt}

---

MEETING CONTEXT:
${context.topic ? `Topic: ${context.topic}` : ''}
${context.previousMessages ? `Previous discussion:\n${context.previousMessages}` : ''}

YOUR TURN:
${prompt}

Respond as ${agent.name}:`;

  try {
    // Use sessions_spawn to create a real sub-agent session
    const result = await sessions_spawn({
      task: fullPrompt,
      agentId: 'main',
      model: 'kimi-coding/k2p5',
      timeoutSeconds: 60,
      thinking: 'low'
    });
    
    return {
      content: result,
      agent: agentId,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error calling ${agentId}:`, error.message);
    return {
      content: `${agent.emoji} ${agent.name}: [Error generating response]`,
      agent: agentId,
      error: true
    };
  }
}

// Spawn a work session for an agent
async function spawnWorkSession(agentId, taskDescription) {
  const agent = loadAgent(agentId);
  
  const workPrompt = `${createSystemPrompt(agent)}

---

ASSIGNED WORK:
${taskDescription}

Execute this work as the expert ${agent.role} you are. Provide detailed, professional output with deliverables.`;

  try {
    const result = await sessions_spawn({
      task: workPrompt,
      agentId: 'main',
      model: 'kimi-coding/k2p5',
      timeoutSeconds: 120,
      thinking: 'low'
    });
    
    return {
      agentId,
      task: taskDescription,
      result: result,
      completed: true
    };
  } catch (error) {
    return {
      agentId,
      task: taskDescription,
      error: error.message,
      completed: false
    };
  }
}

module.exports = { callRealAgent, spawnWorkSession, createSystemPrompt, loadAgent };
