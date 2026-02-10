#!/usr/bin/env node
/**
 * Agent Agency - Enhanced Orchestrator
 * Full meeting simulation with realistic conversations
 */

const fs = require('fs');
const path = require('path');
const { 
  generateAgentTurn, 
  simulateRelationshipDynamics, 
  generateInsights,
  loadAgent,
  loadAgentMemory,
  saveAgentMemory
} = require('./lib/meeting-engine');

const AGENCY_DIR = path.join(__dirname);

function loadRelationships() {
  return JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'relationships', 'matrix.json'), 'utf8'));
}

function saveRelationships(relationships) {
  fs.writeFileSync(
    path.join(AGENCY_DIR, 'relationships', 'matrix.json'),
    JSON.stringify(relationships, null, 2)
  );
}

function loadMeetingConfig() {
  return JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'meetings', 'config.json'), 'utf8'));
}

function saveMeetingConfig(config) {
  fs.writeFileSync(
    path.join(AGENCY_DIR, 'meetings', 'config.json'),
    JSON.stringify(config, null, 2)
  );
}

function generateMeetingTopic() {
  const topics = [
    "content_performance_review",
    "social_media_monitoring",
    "competitor_analysis",
    "new_ideas_brainstorm",
    "task_prioritization",
    "blockers_and_support",
    "lessons_learned",
    "upcoming_content_planning"
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}

function runStandupMeeting() {
  console.log("\n" + "=".repeat(60));
  console.log("🏢 AGENT AGENCY STANDUP MEETING");
  console.log("📅 " + new Date().toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }));
  console.log("=".repeat(60) + "\n");
  
  const meetingConfig = loadMeetingConfig();
  const relationships = loadRelationships();
  
  const meeting = {
    id: `meeting-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: "daily_standup",
    participants: meetingConfig.meeting_structure.participants,
    transcript: [],
    topics_discussed: [],
    action_items: [],
    insights_generated: [],
    relationship_changes: []
  };
  
  // Generate topic
  const topic = generateMeetingTopic();
  meeting.topics_discussed.push(topic);
  
  const topicDisplay = topic.replace(/_/g, ' ').toUpperCase();
  console.log(`📋 TODAY'S TOPIC: ${topicDisplay}\n`);
  console.log("-".repeat(60) + "\n");
  
  let turn = 1;
  let previousSpeaker = null;
  
  // Henry opens the meeting
  const henry = loadAgent('henry');
  const opening = generateAgentTurn(henry, topic, [], meeting);
  console.log(`${henry.emoji} ${henry.name}: ${opening}\n`);
  
  meeting.transcript.push({
    turn: turn++,
    agent: 'henry',
    message: opening,
    type: 'opening'
  });
  
  previousSpeaker = 'henry';
  
  // Each agent contributes 2-3 times
  const participants = meetingConfig.meeting_structure.participants.filter(p => p !== 'henry');
  
  for (let round = 0; round < 2; round++) {
    // Shuffle participants for variety
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    for (const agentId of shuffled) {
      const agent = loadAgent(agentId);
      const previousMessages = meeting.transcript.map(t => t.message);
      
      const response = generateAgentTurn(agent, topic, previousMessages, meeting);
      console.log(`${agent.emoji} ${agent.name}: ${response}\n`);
      
      meeting.transcript.push({
        turn: turn++,
        agent: agentId,
        message: response,
        type: 'contribution'
      });
      
      // Update relationships
      const relChanges = simulateRelationshipDynamics(agentId, previousSpeaker, response, relationships);
      meeting.relationship_changes.push(...relChanges);
      
      previousSpeaker = agentId;
    }
  }
  
  console.log("-".repeat(60) + "\n");
  
  // Henry summarizes and creates action items
  console.log(`${henry.emoji} ${henry.name}: Excellent discussion everyone! Let me summarize our action items:\n`);
  
  // Generate contextual action items based on topic
  const actionItems = generateActionItems(topic, meeting.transcript);
  
  actionItems.forEach((item, idx) => {
    const agent = loadAgent(item.assignee);
    console.log(`  ${idx + 1}. ${item.task}`);
    console.log(`     Assigned to: ${agent.emoji} ${agent.name} (${agent.role})`);
    console.log(`     Priority: ${item.priority.toUpperCase()}`);
    console.log(`     Due: ${item.due}\n`);
    
    meeting.action_items.push(item);
    
    // Add to agent's memory
    const memory = loadAgentMemory(item.assignee);
    memory.memory.personal.current_focus = item.task;
    memory.memory.action_items.push({
      id: `task-${Date.now()}-${idx}`,
      task: item.task,
      priority: item.priority,
      due: item.due,
      status: 'pending',
      assigned_in_meeting: meeting.id
    });
    saveAgentMemory(item.assignee, memory);
  });
  
  // Generate insights
  meeting.insights_generated = generateInsights(meeting.transcript, topic);
  
  if (meeting.insights_generated.length > 0) {
    console.log("💡 INSIGHTS GENERATED:\n");
    meeting.insights_generated.forEach((insight, idx) => {
      console.log(`  ${idx + 1}. ${insight.text}`);
      console.log(`     Confidence: ${insight.confidence}%`);
      console.log(`     Source: ${insight.source}\n`);
    });
  }
  
  // Henry closes
  const closing = "Let's execute on these action items. Same time tomorrow!";
  console.log(`${henry.emoji} ${henry.name}: ${closing}\n`);
  
  meeting.transcript.push({
    turn: turn,
    agent: 'henry',
    message: closing,
    type: 'closing'
  });
  
  console.log("=".repeat(60));
  console.log("✅ MEETING ADJOURNED\n");
  
  // Save meeting
  const meetingFile = path.join(AGENCY_DIR, 'meetings', `${meeting.id}.json`);
  fs.writeFileSync(meetingFile, JSON.stringify(meeting, null, 2));
  
  // Update relationships
  saveRelationships(relationships);
  
  // Update meeting stats
  meetingConfig.stats.total_meetings++;
  meetingConfig.stats.action_items_created += meeting.action_items.length;
  meetingConfig.meetings = meetingConfig.meetings || [];
  meetingConfig.meetings.push({
    id: meeting.id,
    timestamp: meeting.timestamp,
    topic: topic,
    action_items_count: meeting.action_items.length
  });
  saveMeetingConfig(meetingConfig);
  
  // Save relationship history
  const historyEntry = {
    timestamp: meeting.timestamp,
    meeting_id: meeting.id,
    changes: meeting.relationship_changes
  };
  
  const historyFile = path.join(AGENCY_DIR, 'relationships', 'history.json');
  const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  history.push(historyEntry);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  
  return meeting;
}

function generateActionItems(topic, transcript) {
  const actions = {
    content_performance_review: [
      { task: "Analyze top-performing content patterns", assignee: "alex", priority: "high", due: "24 hours" },
      { task: "Create visual templates based on winning designs", assignee: "pixel", priority: "high", due: "48 hours" },
      { task: "Draft follow-up content scripts", assignee: "quill", priority: "medium", due: "72 hours" }
    ],
    social_media_monitoring: [
      { task: "Compile competitor feature comparison", assignee: "scout", priority: "high", due: "24 hours" },
      { task: "Draft response templates for trending topics", assignee: "quill", priority: "medium", due: "48 hours" },
      { task: "Update social monitoring dashboard", assignee: "echo", priority: "medium", due: "48 hours" }
    ],
    competitor_analysis: [
      { task: "Deep dive on top 3 competitor strategies", assignee: "scout", priority: "high", due: "48 hours" },
      { task: "SWOT analysis presentation", assignee: "alex", priority: "medium", due: "72 hours" },
      { task: "Differentiation strategy document", assignee: "henry", priority: "high", due: "72 hours" }
    ],
    new_ideas_brainstorm: [
      { task: "Storyboard top 3 content ideas", assignee: "pixel", priority: "high", due: "48 hours" },
      { task: "Write scripts for selected concepts", assignee: "quill", priority: "high", due: "72 hours" },
      { task: "Build prototype of automation tool", assignee: "echo", priority: "medium", due: "1 week" }
    ],
    task_prioritization: [
      { task: "Update project roadmap", assignee: "henry", priority: "high", due: "24 hours" },
      { task: "Fix critical onboarding flow bugs", assignee: "echo", priority: "critical", due: "24 hours" },
      { task: "Complete pricing page redesign", assignee: "pixel", priority: "high", due: "48 hours" }
    ],
    blockers_and_support: [
      { task: "Resolve API rate limit issue", assignee: "echo", priority: "critical", due: "24 hours" },
      { task: "Provide user data for design decisions", assignee: "alex", priority: "high", due: "24 hours" },
      { task: "Schedule stakeholder alignment meeting", assignee: "henry", priority: "high", due: "48 hours" }
    ],
    lessons_learned: [
      { task: "Document key learnings in knowledge base", assignee: "codex", priority: "medium", due: "72 hours" },
      { task: "Update onboarding based on feedback", assignee: "echo", priority: "high", due: "1 week" },
      { task: "Create best practices guide", assignee: "quill", priority: "low", due: "2 weeks" }
    ],
    upcoming_content_planning: [
      { task: "Finalize Q2 content calendar", assignee: "quill", priority: "high", due: "1 week" },
      { task: "Create visual assets for upcoming launches", assignee: "pixel", priority: "high", due: "1 week" },
      { task: "Set up tracking for new campaigns", assignee: "alex", priority: "medium", due: "48 hours" }
    ]
  };
  
  return actions[topic] || [
    { task: "Follow up on discussion points", assignee: "scout", priority: "medium", due: "48 hours" },
    { task: "Prepare for next meeting", assignee: "henry", priority: "medium", due: "24 hours" }
  ];
}

// Main execution
if (require.main === module) {
  const meeting = runStandupMeeting();
  
  console.log("\n📊 MEETING SUMMARY:");
  console.log(`   Meeting ID: ${meeting.id}`);
  console.log(`   Participants: ${meeting.participants.length}`);
  console.log(`   Turns: ${meeting.transcript.length}`);
  console.log(`   Action Items: ${meeting.action_items.length}`);
  console.log(`   Insights: ${meeting.insights_generated.length}`);
  console.log(`   Relationship Changes: ${meeting.relationship_changes.length}`);
  console.log(`\n💾 Saved to: meetings/${meeting.id}.json`);
}

module.exports = { runStandupMeeting };
