#!/usr/bin/env node
/**
 * Agent Agency Dashboard
 * Real-time status view of all agents, meetings, tasks, and relationships
 */

const fs = require('fs');
const path = require('path');

const AGENCY_DIR = path.join(__dirname);

function loadAgents() {
  return JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'agents.json'), 'utf8'));
}

function loadRelationships() {
  return JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'relationships', 'matrix.json'), 'utf8'));
}

function loadMeetingConfig() {
  return JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'meetings', 'config.json'), 'utf8'));
}

function loadTaskTracker() {
  return JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'tasks', 'tracker.json'), 'utf8'));
}

function loadSocialConfig() {
  return JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'monitoring', 'social.json'), 'utf8'));
}

function getRecentMeetings(limit = 3) {
  const meetingsDir = path.join(AGENCY_DIR, 'meetings');
  const files = fs.readdirSync(meetingsDir)
    .filter(f => f.startsWith('meeting-') && f.endsWith('.json'))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, limit);
  
  return files.map(f => JSON.parse(fs.readFileSync(path.join(meetingsDir, f), 'utf8')));
}

function renderDashboard() {
  const agents = loadAgents();
  const relationships = loadRelationships();
  const meetingConfig = loadMeetingConfig();
  const tasks = loadTaskTracker();
  const social = loadSocialConfig();
  const recentMeetings = getRecentMeetings();
  
  console.clear();
  console.log("\n" + "█".repeat(70));
  console.log("█" + " ".repeat(20) + "🦉 AGENT AGENCY DASHBOARD" + " ".repeat(20) + "█");
  console.log("█" + " ".repeat(68) + "█");
  console.log("█" + "  Autonomous Multi-Agent Content Creation Team".padEnd(68) + "█");
  console.log("█".repeat(70) + "\n");
  
  // System Status
  console.log("┌─ SYSTEM STATUS ───────────────────────────────────────────────────┐");
  console.log(`│  📅 Last Updated: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }).padEnd(49)}│`);
  console.log(`│  📊 Total Meetings: ${meetingConfig.stats.total_meetings.toString().padEnd(47)}│`);
  console.log(`│  ✅ Action Items Created: ${meetingConfig.stats.action_items_created.toString().padEnd(41)}│`);
  console.log(`│  📢 Social Mentions Tracked: ${social.stats.total_mentions.toString().padEnd(38)}│`);
  console.log(`│  📅 Next Standup: ${meetingConfig.meeting_structure.times.join(' & ').padEnd(48)}│`);
  console.log("└────────────────────────────────────────────────────────────────────┘\n");
  
  // Agent Status
  console.log("┌─ AGENT STATUS ────────────────────────────────────────────────────┐");
  agents.agents.forEach(agent => {
    const status = agent.status === 'active' ? '🟢' : '⚪';
    const focus = agent.memory?.personal?.current_focus || 'Standby';
    const truncatedFocus = focus.length > 35 ? focus.substring(0, 32) + '...' : focus;
    
    console.log(`│  ${status} ${agent.emoji} ${agent.name.padEnd(10)} │ ${agent.role.padEnd(20)} │ ${truncatedFocus.padEnd(35)}│`);
  });
  console.log("└────────────────────────────────────────────────────────────────────┘\n");
  
  // Relationship Matrix (Mini View)
  console.log("┌─ RELATIONSHIP MATRIX ─────────────────────────────────────────────┐");
  console.log("│  Agent Pairings         │ Status                              │");
  console.log("├─────────────────────────┼─────────────────────────────────────┤");
  
  const pairs = [
    ['scout', 'alex'],
    ['quill', 'pixel'],
    ['echo', 'codex'],
    ['henry', 'scout'],
    ['pixel', 'echo']
  ];
  
  pairs.forEach(([a1, a2]) => {
    const agent1 = agents.agents.find(a => a.id === a1);
    const agent2 = agents.agents.find(a => a.id === a2);
    const score = relationships.matrix[a1][a2];
    const status = score >= 7 ? '💚 Strong' : score >= 4 ? '💛 Good' : score >= 0 ? '🤍 Neutral' : '❤️ Strained';
    
    console.log(`│  ${agent1.emoji}${agent1.name} <-> ${agent2.emoji}${agent2.name.padEnd(6)} │ ${status} (${score.toFixed(1)}/10)${' '.repeat(22 - status.length)}│`);
  });
  console.log("└────────────────────────────────────────────────────────────────────┘\n");
  
  // Recent Meetings
  console.log("┌─ RECENT MEETINGS ─────────────────────────────────────────────────┐");
  if (recentMeetings.length === 0) {
    console.log("│  No meetings yet. Run: node orchestrator.js                       │");
  } else {
    recentMeetings.forEach((meeting, idx) => {
      const date = new Date(meeting.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const time = new Date(meeting.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const topic = meeting.topics_discussed[0]?.replace(/_/g, ' ').substring(0, 25) || 'General';
      const actions = meeting.action_items.length;
      
      console.log(`│  ${idx + 1}. ${date} ${time} │ ${topic.padEnd(25)} │ ${actions} actions │`);
    });
  }
  console.log("└────────────────────────────────────────────────────────────────────┘\n");
  
  // Active Tasks
  const allAgentTasks = [];
  agents.agents.forEach(agent => {
    const memoryFile = path.join(AGENCY_DIR, 'agents', `${agent.id}.json`);
    if (fs.existsSync(memoryFile)) {
      const memory = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
      memory.memory.action_items?.filter(t => t.status !== 'completed').forEach(task => {
        allAgentTasks.push({
          agent: agent,
          task: task
        });
      });
    }
  });
  
  console.log("┌─ ACTIVE TASKS ────────────────────────────────────────────────────┐");
  if (allAgentTasks.length === 0) {
    console.log("│  No active tasks. Schedule a meeting to generate action items.    │");
  } else {
    allAgentTasks.slice(0, 5).forEach(({ agent, task }, idx) => {
      const priority = task.priority === 'critical' ? '🔴' : task.priority === 'high' ? '🟠' : '🟡';
      const taskText = task.task.length > 30 ? task.task.substring(0, 27) + '...' : task.task;
      console.log(`│  ${priority} ${agent.emoji} ${agent.name.padEnd(8)} │ ${taskText.padEnd(32)} │ ${task.due.padEnd(10)}│`);
    });
    if (allAgentTasks.length > 5) {
      console.log(`│  ... and ${allAgentTasks.length - 5} more tasks                                                │`);
    }
  }
  console.log("└────────────────────────────────────────────────────────────────────┘\n");
  
  // Quick Stats
  console.log("┌─ QUICK STATS ─────────────────────────────────────────────────────┐");
  console.log(`│  🦉 Henry has facilitated ${meetingConfig.stats.total_meetings} meetings`);
  console.log(`│  🔍 Scout is tracking ${social.stats.total_mentions} social mentions`);
  console.log(`│  📊 Alex has generated ${meetingConfig.stats.action_items_created} action items`);
  console.log(`│  💻 Echo has built ${meetingConfig.stats.total_meetings} prototypes`);
  console.log("└────────────────────────────────────────────────────────────────────┘\n");
  
  console.log("Commands: node orchestrator.js | node lib/social-monitor.js | node dashboard.js\n");
}

module.exports = { renderDashboard };

if (require.main === module) {
  renderDashboard();
}
