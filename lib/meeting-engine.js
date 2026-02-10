const fs = require('fs');
const path = require('path');

const AGENCY_DIR = path.join(__dirname, '..');

// Load agent data
function loadAgent(agentId) {
  const agents = JSON.parse(fs.readFileSync(path.join(AGENCY_DIR, 'agents.json'), 'utf8'));
  return agents.agents.find(a => a.id === agentId);
}

function loadAgentMemory(agentId) {
  const file = path.join(AGENCY_DIR, 'agents', `${agentId}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveAgentMemory(agentId, memory) {
  const file = path.join(AGENCY_DIR, 'agents', `${agentId}.json`);
  fs.writeFileSync(file, JSON.stringify(memory, null, 2));
}

// Generate contextual response based on agent persona + topic
function generateAgentTurn(agent, topic, previousMessages, meetingContext) {
  const persona = agent.personality;
  const skills = agent.skills;
  
  // Topic-specific response templates
  const topicResponses = {
    content_performance_review: {
      scout: [
        "Our last post performed 23% better than average. The AI tool comparison angle really resonated.",
        "Engagement peaked when we discussed pricing transparency. Audiences want honesty.",
        "Video completion rate is up 15%. The shorter format is working."
      ],
      alex: [
        "Metrics show 3.2% CTR on the last campaign. Above industry average of 2.1%.",
        "A/B test results: Version B outperformed by 18% on the CTA.",
        "Retention drops at the 2-minute mark. We should front-load value."
      ],
      pixel: [
        "The thumbnail with the split-screen comparison got 40% more clicks.",
        "Visual consistency is paying off - brand recognition up 25%.",
        "I'm seeing better engagement on bold color schemes vs muted tones."
      ],
      quill: [
        "The hook 'I fired my developer' outperformed everything else this week.",
        "Story-driven content is retaining 35% longer than feature lists.",
        "Our authenticity angle is working - comments mention 'refreshing honesty'."
      ],
      echo: [
        "The automation script I built saved 5 hours this week on content prep.",
        "Analytics integration is now real-time. We can track performance instantly.",
        "I built a tool that auto-generates thumbnail variations for testing."
      ],
      codex: [
        "Our content pipeline architecture is scaling well. No bottlenecks.",
        "I've designed a modular system for rapid content iteration.",
        "The workflow automation is reducing manual work by 60%."
      ],
      henry: [
        "Great insights everyone. Let's double down on what's working.",
        "The data tells a clear story. We should adjust our strategy accordingly.",
        "Excellent collaboration. This is how we improve systematically."
      ]
    },
    social_media_monitoring: {
      scout: [
        "Competitor X just launched a new feature. Our community is asking if we'll do the same.",
        "Trending hashtag: #AItools - 50K mentions in the last 24 hours.",
        "Someone on Reddit asked for exactly what we're building. Opportunity!"
      ],
      alex: [
        "Sentiment analysis: 73% positive mentions, up from 65% last week.",
        "Our response time to comments is averaging 12 minutes. Industry best.",
        "Share of voice in our niche increased 8% this month."
      ],
      quill: [
        "The community loves our behind-the-scenes content. More of that?",
        "People are quoting our 'AI should amplify humans' line everywhere.",
        "We should address the pricing questions directly - they're trending."
      ],
      pixel: [
        "Visual trends shifting toward dark mode designs. We should adapt.",
        "Minimalist thumbnails are outperforming busy ones by 22%.",
        "The 'day in the life' aesthetic is peaking on Instagram."
      ],
      echo: [
        "Built a scraper that tracks competitor feature releases automatically.",
        "I can integrate sentiment analysis directly into our dashboard.",
        "The social listening API is set up and feeding data to Scout."
      ],
      codex: [
        "We should design a response system for community feedback.",
        "The monitoring architecture can scale to 10x current volume.",
        "Consider building a knowledge base from common questions."
      ],
      henry: [
        "Scout and Alex, can you prioritize the competitor analysis?",
        "Let's assign response ownership for different platforms.",
        "This intelligence is gold. Let's act on it quickly."
      ]
    },
    new_ideas_brainstorm: {
      pixel: [
        "What if we did a 'build in public' series showing our own tool creation?",
        "Interactive content idea: Let viewers vote on our next feature.",
        "Visual concept: Split-screen showing 'old way vs AI way'."
      ],
      quill: [
        "Story idea: 'I replaced my entire marketing team with AI agents.'",
        "Script concept: Interview real users about their AI transformation.",
        "Series idea: 'AI Tools That Actually Work' - honest reviews only."
      ],
      scout: [
        "Gap in market: No one is doing AI tool comparison for non-technical founders.",
        "Opportunity: The 'AI for creators' space is underserved.",
        "Trend: People want AI that feels human, not robotic."
      ],
      echo: [
        "Technical idea: Open-source some of our tools for community goodwill.",
        "Build idea: A free tool that showcases our capabilities.",
        "Automation idea: Auto-generate content from our meetings."
      ],
      codex: [
        "Strategy idea: Position as the 'anti-hype' AI company.",
        "System idea: Modular content that repurposes across platforms.",
        "Innovation idea: Let users train custom AI agents for their workflow."
      ],
      alex: [
        "Data-driven idea: Content about metrics that actually matter.",
        "Analytics idea: Show real before/after ROI case studies.",
        "Testing idea: Systematic A/B test framework for all content."
      ],
      henry: [
        "These are excellent. Let's prioritize based on impact vs effort.",
        "Pixel and Quill, can you storyboard the top 3 ideas?",
        "Echo, assess technical feasibility of the automation concepts."
      ]
    },
    task_prioritization: {
      henry: [
        "Critical path: Fix the onboarding flow first. Everything else follows.",
        "High priority: The pricing page redesign. Conversions depend on it.",
        "Medium: Content calendar can wait until next sprint."
      ],
      echo: [
        "Blocked on: API rate limits. Need upgraded plan to proceed.",
        "Quick win: The analytics dashboard fix - 2 hours, high impact.",
        "Technical debt: Database optimization is becoming urgent."
      ],
      scout: [
        "Research priority: Competitor pricing analysis for next week.",
        "Ongoing: Social monitoring is automated and running smoothly.",
        "New task: Customer interview recruitment for case studies."
      ],
      alex: [
        "Priority: Fix the attribution tracking bug. Data is unreliable.",
        "Analysis needed: Churn reasons - why are people leaving?",
        "Report due: Monthly metrics summary for stakeholders."
      ],
      pixel: [
        "Design sprint: Landing page visuals needed by Friday.",
        "Backlog: Thumbnail templates for next month's content.",
        "Creative priority: Brand refresh concepts for Q2."
      ],
      quill: [
        "Urgent: Email sequence for new trial users.",
        "This week: Blog post on AI transparency.",
        "Ongoing: Script for next YouTube video."
      ],
      codex: [
        "Architecture review: Scale planning for 10x growth.",
        "Security audit: Due before next funding round.",
        "Documentation: API docs for developer community."
      ]
    },
    blockers_and_support: {
      echo: [
        "Need Scout's research on API alternatives. Current provider is unstable.",
        "Blocked: Waiting for Codex's architecture decision on caching.",
        "Support needed: Pixel's design specs for the dashboard."
      ],
      pixel: [
        "Blocked: Need actual user data from Alex to inform design decisions.",
        "Support: Can Quill help with microcopy for the new flow?",
        "Waiting: Echo's component library to maintain consistency."
      ],
      quill: [
        "Need Scout's trend insights to write relevant content.",
        "Blocked: Waiting for product feature to be built before I can document it.",
        "Support: Alex's data would strengthen the case study content."
      ],
      scout: [
        "Need access to premium analytics tool. Current plan is limited.",
        "Support: Echo's help to automate the social listening reports.",
        "Blocked: Waiting for customer interviews to be scheduled."
      ],
      alex: [
        "Need Echo to fix the tracking pixel. Data is incomplete.",
        "Blocked: Waiting for Quill to finalize messaging before A/B testing.",
        "Support: Scout's competitor data for benchmark analysis."
      ],
      codex: [
        "Need stakeholder alignment on technical direction.",
        "Support: Echo's input on implementation complexity.",
        "Blocked: Budget approval for infrastructure upgrades."
      ],
      henry: [
        "I'll address the blockers. Echo and Codex, sync after this meeting.",
        "Pixel, I'll get you that user data from Alex today.",
        "Everyone, update the task board with your blockers so we can track them."
      ]
    }
  };

  const responses = topicResponses[topic] && topicResponses[topic][agent.id];
  
  if (responses && responses.length > 0) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Fallback generic responses
  const generics = [
    `As ${agent.role}, I think we should consider the strategic implications.`,
    `From my perspective, this aligns with our goals.`,
    `I can contribute my expertise on this topic.`,
    `This is interesting. Let me add my thoughts...`
  ];
  
  return generics[Math.floor(Math.random() * generics.length)];
}

// Simulate relationship dynamics during conversation
function simulateRelationshipDynamics(speakerId, previousSpeakerId, message, relationships) {
  const changes = [];
  
  // Check for agreement/disagreement indicators
  const agreementWords = ['agree', 'great', 'excellent', 'perfect', 'love', 'like', 'yes', 'absolutely', 'brilliant'];
  const disagreementWords = ['disagree', 'but', 'however', 'concern', 'problem', 'issue', 'wrong', 'no', 'different'];
  
  const lowerMessage = message.toLowerCase();
  const hasAgreement = agreementWords.some(w => lowerMessage.includes(w));
  const hasDisagreement = disagreementWords.some(w => lowerMessage.includes(w));
  
  if (previousSpeakerId && previousSpeakerId !== speakerId) {
    if (hasAgreement) {
      // Small positive bump
      const current = relationships.matrix[speakerId][previousSpeakerId];
      if (current < 10) {
        relationships.matrix[speakerId][previousSpeakerId] = Math.min(10, current + 0.2);
        relationships.matrix[previousSpeakerId][speakerId] = Math.min(10, current + 0.2);
        changes.push({
          agents: [speakerId, previousSpeakerId],
          change: +0.2,
          reason: "Agreement expressed"
        });
      }
    } else if (hasDisagreement) {
      // Small negative hit
      const current = relationships.matrix[speakerId][previousSpeakerId];
      if (current > -10) {
        relationships.matrix[speakerId][previousSpeakerId] = Math.max(-10, current - 0.3);
        relationships.matrix[previousSpeakerId][speakerId] = Math.max(-10, current - 0.3);
        changes.push({
          agents: [speakerId, previousSpeakerId],
          change: -0.3,
          reason: "Disagreement or concern raised"
        });
      }
    }
  }
  
  return changes;
}

// Generate insights from meeting
function generateInsights(transcript, topic) {
  const insights = [];
  
  // Pattern detection
  const allMessages = transcript.map(t => t.message.toLowerCase()).join(' ');
  
  if (allMessages.includes('perform') || allMessages.includes('metric') || allMessages.includes('data')) {
    insights.push({
      text: "Team is highly data-driven, prioritizing metrics over intuition",
      confidence: 85,
      source: "multiple data references"
    });
  }
  
  if (allMessages.includes('automation') || allMessages.includes('tool') || allMessages.includes('built')) {
    insights.push({
      text: "Technical infrastructure and automation are key enablers",
      confidence: 80,
      source: "automation mentions"
    });
  }
  
  if (allMessages.includes('audience') || allMessages.includes('community') || allMessages.includes('user')) {
    insights.push({
      text: "User-centric approach driving content and product decisions",
      confidence: 75,
      source: "audience focus"
    });
  }
  
  if (topic === 'new_ideas_brainstorm' && transcript.length > 10) {
    insights.push({
      text: "High creative output suggests strong ideation phase",
      confidence: 70,
      source: "brainstorming volume"
    });
  }
  
  return insights;
}

module.exports = {
  generateAgentTurn,
  simulateRelationshipDynamics,
  generateInsights,
  loadAgent,
  loadAgentMemory,
  saveAgentMemory
};
