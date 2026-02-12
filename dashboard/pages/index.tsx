import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: 'awake' | 'sleeping' | 'working';
  color: string;
  lastTask?: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  agentName?: string;
  loading?: boolean;
  messageId?: string;
  status?: 'pending' | 'completed' | 'error';
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'henry', name: 'Henry', emoji: '🦉', role: 'Team Lead', status: 'awake', color: '#00ff88' },
    { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Research', status: 'sleeping', color: '#00ff88' },
    { id: 'pixel', name: 'Pixel', emoji: '🎨', role: 'Creative', status: 'awake', color: '#00ff88' },
    { id: 'echo', name: 'Echo', emoji: '💾', role: 'Memory', status: 'sleeping', color: '#00ff88' },
    { id: 'quill', name: 'Quill', emoji: '✍️', role: 'Documentation', status: 'sleeping', color: '#00ff88' },
    { id: 'codex', name: 'Codex', emoji: '🏗️', role: 'Architecture', status: 'working', color: '#00ff88' },
    { id: 'alex', name: 'Alex', emoji: '🛡️', role: 'Security Lead', status: 'awake', color: '#00ff88' },
    { id: 'vega', name: 'Vega', emoji: '📊', role: 'Data Analyst', status: 'sleeping', color: '#00ff88' },
  ]);
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'chat' | 'work'>('agents');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [agentResponse, setAgentResponse] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setAgents(data);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const wakeAgent = async (agentId: string) => {
    const task = taskInput.trim() || 'Check in and report status';
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/wake?id=${agentId}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAgentResponse(`${data.agentEmoji} ${data.agentName} is now awake and working on: ${task}`);
        fetchData();
      }
    } catch (err) {
      setAgentResponse('Error waking agent');
    }
    setIsLoading(false);
  };

  const sleepAgent = async (agentId: string) => {
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/sleep?id=${agentId}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAgentResponse(`${data.agentEmoji} ${data.agentName} is now sleeping`);
        fetchData();
      }
    } catch (err) {
      setAgentResponse('Error putting agent to sleep');
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedAgent) return;
    
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return;

    const userMessage = chatInput;
    setChatInput('');

    setChatMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMessage 
    }]);

    setChatMessages(prev => [...prev, { 
      sender: 'agent', 
      agentName: `${agent.emoji} ${agent.name}`,
      text: '...',
      loading: true,
      status: 'pending'
    }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent, message: userMessage })
      });

      if (res.ok) {
        setTimeout(async () => {
          const pollRes = await fetch(`/api/chat?agentId=${selectedAgent}`);
          if (pollRes.ok) {
            const data = await pollRes.json();
            if (data.history && data.history.length > 0) {
              const lastMsg = data.history[data.history.length - 1];
              if (lastMsg.sender === 'agent' && lastMsg.message) {
                setChatMessages(prev => prev.map((msg, idx) => 
                  idx === prev.length - 1 && msg.loading
                    ? { ...msg, text: lastMsg.message, loading: false, status: 'completed' }
                    : msg
                ));
              }
            }
          }
        }, 3000);
      }
    } catch (err) {
      setChatMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.loading
          ? { ...msg, text: 'Error sending message', loading: false, status: 'error' }
          : msg
      ));
    }
  };

  return (
    <>
      <Head>
        <title>🦉 Agent Agency Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>🦉 Agent Agency</h1>
            <div className="status-badge">
              <span className="status-dot"></span>
              <span>System Online</span>
            </div>
          </div>
        </header>

        <div className="main-content">
          {/* Meeting Room */}
          <div className="meeting-room-container">
            <div className="room-header">
              <h2>🏢 Agency Meeting Room</h2>
              <p>Select an agent to interact</p>
            </div>
            
            <div className="meeting-room">
              {/* Center Table */}
              <div className="conference-table">
                <div className="table-surface">
                  <span className="table-logo">🦉</span>
                  <div className="table-glow"></div>
                </div>
              </div>
              
              {/* Agent Positions - Around the table */}
              <div className="agents-around-table">
                {agents.slice(0, 4).map((agent, idx) => (
                  <div
                    key={agent.id}
                    className={`agent-seat position-${idx} ${agent.status} ${selectedAgent === agent.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="seat-base">
                      <div className="agent-avatar-large">
                        <span className="agent-emoji">{agent.emoji}</span>
                        <div className={`status-ring ${agent.status}`}></div>
                      </div>
                      <div className="agent-info-bubble">
                        <span className="agent-name">{agent.name}</span>
                        <span className="agent-role">{agent.role}</span>
                        <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* More agents on the other side */}
              <div className="agents-around-table bottom-row">
                {agents.slice(4, 8).map((agent, idx) => (
                  <div
                    key={agent.id}
                    className={`agent-seat position-${idx + 4} ${agent.status} ${selectedAgent === agent.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAgent(agent.id)}
                  >
                    <div className="seat-base">
                      <div className="agent-avatar-large">
                        <span className="agent-emoji">{agent.emoji}</span>
                        <div className={`status-ring ${agent.status}`}></div>
                      </div>
                      <div className="agent-info-bubble">
                        <span className="agent-name">{agent.name}</span>
                        <span className="agent-role">{agent.role}</span>
                        <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="side-panel">
            <div className="tabs">
              <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>👥 Agents</button>
              <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>💬 Chat</button>
              <button className={activeTab === 'work' ? 'active' : ''} onClick={() => setActiveTab('work')}>📋 Work</button>
            </div>

            <div className="panel-content">
              {activeTab === 'agents' && (
                <div className="agents-panel">
                  {agentResponse && (
                    <div className="response-banner">
                      {agentResponse}
                    </div>
                  )}
                  
                  <div className="task-input-section">
                    <input
                      type="text"
                      placeholder="Enter task for agent..."
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                    />
                    <p className="input-hint">💡 Token-optimized prompts enabled</p>
                  </div>

                  <div className="agents-list">
                    {agents.map(agent => (
                      <div key={agent.id} className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''}`} onClick={() => setSelectedAgent(agent.id)}>
                        <div className="card-emoji">{agent.emoji}</div>
                        <div className="card-info">
                          <div className="card-name">{agent.name}</div>
                          <div className="card-role">{agent.role}</div>
                          <div className={`card-status ${agent.status}`}>{agent.status}</div>
                        </div>
                        {agent.status === 'sleeping' ? (
                          <button className="btn-wake" disabled={isLoading} onClick={(e) => { e.stopPropagation(); wakeAgent(agent.id); }}>
                            {isLoading ? '...' : 'Wake Up'}
                          </button>
                        ) : (
                          <button className="btn-sleep" disabled={isLoading} onClick={(e) => { e.stopPropagation(); sleepAgent(agent.id); }}>
                            {isLoading ? '...' : '💤 Sleep'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="chat-panel">
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="chat-empty">
                        {selectedAgent 
                          ? `Chat with ${agents.find(a => a.id === selectedAgent)?.name || selectedAgent}` 
                          : 'Select an agent from the meeting room'}
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.sender} ${msg.status || ''}`}>
                          {msg.agentName && <div className="message-sender">{msg.agentName}</div>}
                          <div className="message-text">{msg.loading ? 'Thinking...' : msg.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={selectedAgent ? `Message ${agents.find(a => a.id === selectedAgent)?.name}...` : 'Select an agent...'}
                      disabled={!selectedAgent}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} disabled={!selectedAgent || !chatInput.trim()}>➤</button>
                  </div>
                </div>
              )}

              {activeTab === 'work' && (
                <div className="work-panel">
                  <h3>📋 Recent Activity</h3>
                  <p className="empty-state">Work items will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0a0a0f;
          color: #fff;
          min-height: 100vh;
        }
        
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Header */
        .header {
          background: linear-gradient(180deg, rgba(0,255,136,0.1) 0%, transparent 100%);
          border-bottom: 1px solid rgba(0,255,136,0.2);
          padding: 16px 32px;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1600px;
          margin: 0 auto;
        }
        
        .header h1 {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(90deg, #00ff88, #00cc6a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #00ff88;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Main Layout */
        .main-content {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
          padding: 24px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }
        
        /* Meeting Room */
        .meeting-room-container {
          background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        
        .room-header {
          background: linear-gradient(90deg, rgba(0,255,136,0.1), transparent);
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .room-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .room-header p {
          font-size: 13px;
          color: #888;
        }
        
        .meeting-room {
          padding: 40px;
          min-height: 500px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        /* Conference Table */
        .conference-table {
          position: relative;
          width: 320px;
          height: 180px;
          margin-bottom: 60px;
        }
        
        .table-surface {
          width: 100%;
          height: 100%;
          background: linear-gradient(145deg, #2a2a3e, #1e1e2e);
          border-radius: 100px;
          border: 2px solid rgba(0,255,136,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 
            0 20px 60px rgba(0,0,0,0.5),
            inset 0 2px 4px rgba(255,255,255,0.1),
            0 0 40px rgba(0,255,136,0.1);
        }
        
        .table-logo {
          font-size: 56px;
          filter: drop-shadow(0 0 20px rgba(0,255,136,0.5));
        }
        
        .table-glow {
          position: absolute;
          inset: -20px;
          border-radius: 120px;
          background: radial-gradient(ellipse at center, rgba(0,255,136,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        
        /* Agents Around Table */
        .agents-around-table {
          display: flex;
          gap: 40px;
          justify-content: center;
          margin-bottom: 40px;
        }
        
        .agents-around-table.bottom-row {
          margin-bottom: 0;
        }
        
        .agent-seat {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .agent-seat:hover {
          transform: translateY(-8px);
        }
        
        .agent-seat.selected .agent-avatar-large {
          box-shadow: 0 0 30px rgba(0,255,136,0.5);
          transform: scale(1.1);
        }
        
        .seat-base {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .agent-avatar-large {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(145deg, #3a3a4e, #2a2a3e);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        
        .agent-emoji {
          font-size: 32px;
        }
        
        .status-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 3px solid transparent;
        }
        
        .status-ring.awake {
          border-color: #00ff88;
          box-shadow: 0 0 15px rgba(0,255,136,0.4);
        }
        
        .status-ring.working {
          border-color: #ffaa00;
          box-shadow: 0 0 15px rgba(255,170,0,0.4);
          animation: working-pulse 2s infinite;
        }
        
        .status-ring.sleeping {
          border-color: #555;
          opacity: 0.5;
        }
        
        @keyframes working-pulse {
          0%, 100% { box-shadow: 0 0 15px rgba(255,170,0,0.4); }
          50% { box-shadow: 0 0 25px rgba(255,170,0,0.7); }
        }
        
        .agent-info-bubble {
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(10px);
          padding: 6px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .agent-name {
          font-size: 13px;
          font-weight: 600;
        }
        
        .agent-role {
          font-size: 10px;
          color: #888;
        }
        
        .status-badge {
          font-size: 9px;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 2px;
        }
        
        .status-badge.awake {
          background: rgba(0,255,136,0.2);
          color: #00ff88;
        }
        
        .status-badge.working {
          background: rgba(255,170,0,0.2);
          color: #ffaa00;
        }
        
        .status-badge.sleeping {
          background: rgba(100,100,100,0.2);
          color: #888;
        }
        
        /* Side Panel */
        .side-panel {
          background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        
        .tabs button {
          flex: 1;
          padding: 16px;
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
        }
        
        .tabs button:hover {
          color: #fff;
          background: rgba(255,255,255,0.03);
        }
        
        .tabs button.active {
          color: #00ff88;
          background: rgba(0,255,136,0.1);
          border-bottom: 2px solid #00ff88;
        }
        
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        
        /* Agents Panel */
        .agents-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .response-banner {
          background: rgba(0,255,136,0.15);
          border: 1px solid rgba(0,255,136,0.3);
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
        }
        
        .task-input-section {
          background: rgba(255,255,255,0.03);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .task-input-section input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.3);
          color: #fff;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .input-hint {
          font-size: 11px;
          color: #666;
        }
        
        .agents-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .agent-card {
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        
        .agent-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
        }
        
        .agent-card.selected {
          background: rgba(0,255,136,0.1);
          border-color: rgba(0,255,136,0.3);
        }
        
        .card-emoji {
          font-size: 28px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.3);
          border-radius: 50%;
        }
        
        .card-info {
          flex: 1;
        }
        
        .card-name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 2px;
        }
        
        .card-role {
          font-size: 12px;
          color: #888;
          margin-bottom: 4px;
        }
        
        .card-status {
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          font-weight: 600;
          display: inline-block;
        }
        
        .card-status.awake {
          background: rgba(0,255,136,0.2);
          color: #00ff88;
        }
        
        .card-status.working {
          background: rgba(255,170,0,0.2);
          color: #ffaa00;
        }
        
        .card-status.sleeping {
          background: rgba(100,100,100,0.2);
          color: #888;
        }
        
        .btn-wake {
          background: linear-gradient(145deg, #00ff88, #00cc6a);
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          color: #000;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }
        
        .btn-wake:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,255,136,0.4);
        }
        
        .btn-sleep {
          background: linear-gradient(145deg, #555, #333);
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
        }
        
        .btn-sleep:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(100,100,100,0.4);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Chat Panel */
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 16px;
        }
        
        .chat-empty {
          text-align: center;
          color: #666;
          padding: 40px;
          font-size: 14px;
        }
        
        .message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .message.user {
          align-self: flex-end;
          background: linear-gradient(145deg, #0084ff, #0066cc);
          border-bottom-right-radius: 4px;
        }
        
        .message.agent {
          align-self: flex-start;
          background: rgba(255,255,255,0.08);
          border-bottom-left-radius: 4px;
        }
        
        .message-sender {
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #00ff88;
        }
        
        .chat-input {
          display: flex;
          gap: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        
        .chat-input input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.3);
          color: #fff;
          font-size: 14px;
          outline: none;
        }
        
        .chat-input input:focus {
          border-color: rgba(0,255,136,0.3);
        }
        
        .chat-input button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(145deg, #00ff88, #00cc6a);
          color: #000;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chat-input button:hover:not(:disabled) {
          transform: scale(1.1);
        }
        
        .chat-input button:disabled {
          background: #444;
          color: #666;
        }
        
        /* Work Panel */
        .work-panel h3 {
          margin-bottom: 16px;
          font-weight: 600;
        }
        
        .empty-state {
          text-align: center;
          color: #666;
          padding: 40px;
        }
        
        /* Responsive */
        @media (max-width: 1100px) {
          .main-content {
            grid-template-columns: 1fr;
          }
          
          .side-panel {
            max-height: 500px;
          }
        }
      `}</style>
    </>
  );
}
