import { useState, useEffect, useCallback } from 'react';
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

interface WorkItem {
  agent: string;
  task: string;
  status: string;
  time: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  agentName?: string;
  loading?: boolean;
  messageId?: string;
  status?: 'pending' | 'completed' | 'error';
}

interface TokenMetrics {
  optimization: {
    compressed: number;
    full: number;
    savings: number;
    percentage: number;
  };
  usage: {
    totalTokens: number;
    totalInput: number;
    totalOutput: number;
    estimatedCost: { usd: number; local: string };
    byAgent: Record<string, { tokens: number; requests: number }>;
  };
  performance: {
    avgDuration: number;
    totalRequests: number;
    avgTokens: number;
    last24h: number;
  };
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [work, setWork] = useState<WorkItem[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'chat' | 'work' | 'tokens'>('agents');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics | null>(null);

  // Fetch agents and work data
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll for chat responses when there's a pending message
  useEffect(() => {
    if (!pendingMessageId || !selectedAgent) return;
    
    const pollInterval = setInterval(async () => {
      await pollForResponse();
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [pendingMessageId, selectedAgent]);

  // Fetch token metrics when on tokens tab
  useEffect(() => {
    if (activeTab === 'tokens') {
      fetchTokenMetrics();
      const interval = setInterval(fetchTokenMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [agentsRes, workRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/work')
      ]);
      
      if (agentsRes.ok) setAgents(await agentsRes.json());
      if (workRes.ok) setWork(await workRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const fetchTokenMetrics = async () => {
    try {
      const res = await fetch('/api/tokens');
      if (res.ok) {
        setTokenMetrics(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch token metrics:', err);
    }
  };

  const pollForResponse = async () => {
    if (!selectedAgent) return;
    
    try {
      const res = await fetch(`/api/chat?agentId=${selectedAgent}`);
      if (!res.ok) return;
      
      const data = await res.json();
      
      if (data.response && data.response.messageId === pendingMessageId) {
        // Update the loading message with actual response
        setChatMessages(prev => prev.map(msg => {
          if (msg.messageId === pendingMessageId) {
            return {
              ...msg,
              text: data.response.response,
              loading: false,
              status: data.response.status
            };
          }
          return msg;
        }));
        
        setPendingMessageId(null);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  const wakeAgent = async (agentId: string) => {
    const task = taskInput.trim() || 'General task - analyze our current projects and suggest improvements';
    setIsLoading(true);
    setAgentResponse(null);
    
    try {
      const res = await fetch(`/api/wake?id=${agentId}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAgentResponse(`${data.agentEmoji} ${data.agentName} is working on: ${task}`);
        await fetchData();
      } else {
        setAgentResponse('Error: Failed to wake agent');
      }
    } catch (err) {
      setAgentResponse('Error: ' + (err as Error).message);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedAgent) return;
    
    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return;

    const userMessage = chatInput;
    setChatInput('');

    // Add user message
    setChatMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMessage 
    }]);

    // Add loading message
    const loadingMsg: ChatMessage = { 
      sender: 'agent', 
      agentName: `${agent.emoji} ${agent.name}`,
      text: 'Thinking...',
      loading: true,
      status: 'pending'
    };
    setChatMessages(prev => [...prev, loadingMsg]);

    // Send to API
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent, message: userMessage })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update loading message with messageId for tracking
        setChatMessages(prev => prev.map((msg, idx) => {
          if (idx === prev.length - 1 && msg.loading) {
            return {
              ...msg,
              messageId: data.messageId,
              text: 'Processing...'
            };
          }
          return msg;
        }));
        
        setPendingMessageId(data.messageId);
      } else {
        setChatMessages(prev => prev.map((msg, idx) => {
          if (idx === prev.length - 1 && msg.loading) {
            return {
              ...msg,
              text: 'Failed to send message',
              loading: false,
              status: 'error'
            };
          }
          return msg;
        }));
      }
    } catch (err) {
      setChatMessages(prev => prev.map((msg, idx) => {
        if (idx === prev.length - 1 && msg.loading) {
          return {
            ...msg,
            text: 'Error: ' + (err as Error).message,
            loading: false,
            status: 'error'
          };
        }
        return msg;
      }));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'awake': return 'awake';
      case 'working': return 'working';
      default: return 'sleeping';
    }
  };

  return (
    <>
      <Head>
        <title>🦉 Agent Agency Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="container">
        <header className="header">
          <h1>🦉 Agent Agency Dashboard</h1>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>System Online</span>
          </div>
        </header>

        <div className="main">
          {/* Office View */}
          <div className="office">
            <div className="office-title">🏢 Office Floor - Meeting Room</div>
            <div className="office-floor">
              <div className="meeting-table">🦉</div>
              {agents.map((agent, idx) => (
                <div
                  key={agent.id}
                  className={`agent-avatar ${getStatusClass(agent.status)} ${selectedAgent === agent.id ? 'selected' : ''}`}
                  style={getPositionStyle(idx)}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  {agent.emoji}
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-status">{agent.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="side-panel">
            <div className="tabs">
              <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>Agents</button>
              <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>Chat</button>
              <button className={activeTab === 'work' ? 'active' : ''} onClick={() => setActiveTab('work')}>Work</button>
              <button className={activeTab === 'tokens' ? 'active' : ''} onClick={() => setActiveTab('tokens')}>📊 Tokens</button>
            </div>

            <div className="panel-content">
              {activeTab === 'agents' && (
                <div className="agent-list">
                  <div style={{ padding: '10px', marginBottom: '15px', background: 'rgba(0,255,136,0.1)', borderRadius: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter task for agent..."
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.3)',
                        color: '#fff',
                        marginBottom: '10px'
                      }}
                    />
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                      💡 Token-optimized prompts enabled (70% savings)
                    </p>
                  </div>

                  {agentResponse && (
                    <div style={{ padding: '12px', marginBottom: '15px', background: 'rgba(0,255,136,0.2)', borderRadius: '8px', fontSize: '13px' }}>
                      {agentResponse}
                    </div>
                  )}

                  {agents.map(agent => (
                    <div key={agent.id} className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''}`} onClick={() => setSelectedAgent(agent.id)}>
                      <div className="agent-emoji">{agent.emoji}</div>
                      <div className="agent-info">
                        <div className="agent-name">{agent.name}</div>
                        <div className="agent-role">{agent.role}</div>
                        <div className="agent-status-badge">
                          <span className={`badge ${agent.status}`}>{agent.status.toUpperCase()}</span>
                        </div>
                      </div>
                      <button 
                        className="wake-btn" 
                        disabled={isLoading}
                        onClick={(e) => { e.stopPropagation(); wakeAgent(agent.id); }}
                      >
                        {isLoading ? '...' : 'Wake Up'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="chat-container">
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="chat-placeholder">
                        {selectedAgent ? `Chat with ${agents.find(a => a.id === selectedAgent)?.name || selectedAgent}` : 'Select an agent first'}
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender} ${msg.status || ''}`}>
                          {msg.agentName && <div className="sender">{msg.agentName}</div>}
                          {msg.loading ? (
                            <span className="loading-dots">
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                            </span>
                          ) : (
                            msg.text
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="chat-input-area">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={selectedAgent ? `Message ${agents.find(a => a.id === selectedAgent)?.name}...` : 'Select an agent...'}
                      disabled={!selectedAgent || pendingMessageId !== null}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} disabled={!selectedAgent || !chatInput.trim() || pendingMessageId !== null}>➤</button>
                  </div>
                </div>
              )}

              {activeTab === 'work' && (
                <div className="work-list">
                  <h3>📋 Recent Work</h3>
                  {work.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No work items yet</p>
                  ) : (
                    work.map((item, idx) => {
                      const agent = agents.find(a => a.id === item.agent);
                      return (
                        <div key={idx} className={`work-item ${item.status}`}>
                          <div className="work-header">
                            <span>{agent?.emoji} {agent?.name}</span>
                            <span className="work-time">{new Date(item.time).toLocaleTimeString()}</span>
                          </div>
                          <div className="work-task">{item.task}</div>
                          <span className={`work-status ${item.status}`}>{item.status.toUpperCase()}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'tokens' && tokenMetrics && (
                <div className="token-metrics">
                  <h3>📊 Token Analytics</h3>
                  
                  <div className="metric-card savings">
                    <div className="metric-title">💰 Optimization Savings</div>
                    <div className="metric-value">{tokenMetrics.optimization.percentage}%</div>
                    <div className="metric-subtitle">
                      {tokenMetrics.optimization.full} → {tokenMetrics.optimization.compressed} tokens
                    </div>
                  </div>

                  <div className="metric-grid">
                    <div className="metric-card">
                      <div className="metric-title">📈 Total Tokens</div>
                      <div className="metric-value">{tokenMetrics.usage.totalTokens.toLocaleString()}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-title">💵 Est. Cost</div>
                      <div className="metric-value">{tokenMetrics.usage.estimatedCost.usd}</div>
                      <div className="metric-subtitle">USD</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-title">⚡ Performance</div>
                    <div className="metric-row">
                      <span>Avg Response Time</span>
                      <span>{tokenMetrics.performance.avgDuration}ms</span>
                    </div>
                    <div className="metric-row">
                      <span>Total Requests</span>
                      <span>{tokenMetrics.performance.totalRequests}</span>
                    </div>
                    <div className="metric-row">
                      <span>Last 24h</span>
                      <span>{tokenMetrics.performance.last24h}</span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-title">👤 Usage by Agent</div>
                    {Object.entries(tokenMetrics.usage.byAgent).map(([agentId, data]) => (
                      <div key={agentId} className="metric-row">
                        <span>{agentId}</span>
                        <span>{data.tokens.toLocaleString()} tokens ({data.requests} req)</span>
                      </div>
                    ))}
                  </div>
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
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          color: #fff;
          min-height: 100vh;
        }
        .container { min-height: 100vh; display: flex; flex-direction: column; }
        
        .header {
          background: rgba(0,0,0,0.3);
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .header h1 { font-size: 28px; display: flex; align-items: center; gap: 10px; }
        
        .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #aaa; }
        .status-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #00ff88; box-shadow: 0 0 10px #00ff88;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .main { display: flex; flex: 1; overflow: hidden; }
        
        .office { flex: 2; padding: 30px; }
        .office-title { font-size: 20px; margin-bottom: 20px; color: #aaa; }
        .office-floor {
          background: linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%);
          border-radius: 20px;
          padding: 40px;
          min-height: 500px;
          position: relative;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .meeting-table {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 200px; height: 120px;
          background: linear-gradient(145deg, #3a3a4e, #2a2a3e);
          border-radius: 60px;
          border: 3px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        
        .agent-avatar {
          position: absolute;
          width: 80px; height: 80px;
          border-radius: 50%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 3px solid;
          font-size: 32px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }
        .agent-avatar:hover { transform: scale(1.1); }
        .agent-avatar.selected { transform: scale(1.2); z-index: 10; }
        .agent-avatar.awake { background: linear-gradient(145deg, #2d5a3d, #1a3a2a); border-color: #00ff88; box-shadow: 0 0 20px rgba(0,255,136,0.3); }
        .agent-avatar.sleeping { background: linear-gradient(145deg, #3a3a4e, #2a2a3e); border-color: #666; opacity: 0.7; }
        .agent-avatar.working { background: linear-gradient(145deg, #5a4a2d, #3a2a1a); border-color: #ffaa00; box-shadow: 0 0 20px rgba(255,170,0,0.3); animation: working 2s infinite; }
        @keyframes working { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .agent-avatar .agent-name { font-size: 11px; margin-top: 5px; font-weight: bold; }
        .agent-avatar .agent-status { font-size: 9px; color: #aaa; }
        
        .side-panel { flex: 1; background: rgba(0,0,0,0.2); border-left: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; }
        .tabs { display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .tabs button { flex: 1; padding: 15px; background: transparent; border: none; color: #aaa; cursor: pointer; transition: all 0.3s; font-size: 14px; }
        .tabs button:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .tabs button.active { background: rgba(255,255,255,0.1); color: #fff; border-bottom: 2px solid #00ff88; }
        
        .panel-content { flex: 1; overflow-y: auto; padding: 20px; }
        
        .agent-list { display: flex; flex-direction: column; gap: 15px; }
        .agent-card {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid transparent;
        }
        .agent-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .agent-card.selected { border-color: #00ff88; background: rgba(0,255,136,0.1); }
        .agent-card .agent-emoji { font-size: 32px; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); border-radius: 50%; }
        .agent-card .agent-info { flex: 1; }
        .agent-card .agent-name { font-weight: bold; font-size: 16px; }
        .agent-card .agent-role { font-size: 12px; color: #aaa; }
        .agent-card .agent-status-badge { margin-top: 5px; }
        .badge { padding: 3px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
        .badge.awake { background: #00ff88; color: #000; }
        .badge.sleeping { background: #666; color: #fff; }
        .badge.working { background: #ffaa00; color: #000; }
        .wake-btn {
          background: linear-gradient(145deg, #00ff88, #00cc6a);
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          color: #000;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }
        .wake-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,255,136,0.4); }
        .wake-btn:disabled { background: #666; cursor: not-allowed; }
        
        .chat-container { display: flex; flex-direction: column; height: 100%; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
        .chat-placeholder { text-align: center; color: #666; padding: 40px; }
        .chat-message { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
        .chat-message.user { align-self: flex-end; background: linear-gradient(145deg, #0084ff, #0066cc); border-bottom-right-radius: 4px; }
        .chat-message.agent { align-self: flex-start; background: rgba(255,255,255,0.1); border-bottom-left-radius: 4px; }
        .chat-message.agent.completed { border-left: 3px solid #00ff88; }
        .chat-message.agent.error { border-left: 3px solid #ff4444; }
        .chat-message .sender { font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #aaa; }
        
        .loading-dots { display: inline-flex; }
        .loading-dots .dot { animation: bounce 1.4s infinite ease-in-out both; margin: 0 2px; }
        .loading-dots .dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots .dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        
        .chat-input-area { padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 10px; }
        .chat-input-area input { flex: 1; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 10px 20px; color: #fff; font-size: 14px; outline: none; }
        .chat-input-area input::placeholder { color: #666; }
        .chat-input-area input:disabled { opacity: 0.5; }
        .chat-input-area button { background: #00ff88; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .chat-input-area button:hover { transform: scale(1.1); }
        .chat-input-area button:disabled { background: #666; cursor: not-allowed; }
        
        .work-list { display: flex; flex-direction: column; gap: 15px; }
        .work-list h3 { margin-bottom: 10px; }
        .work-item { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; border-left: 3px solid #00ff88; }
        .work-item.pending { border-left-color: #ffaa00; }
        .work-item.completed { border-left-color: #00ff88; }
        .work-item .work-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .work-item .work-time { font-size: 12px; color: #aaa; }
        .work-item .work-task { font-size: 14px; color: #ddd; }
        .work-item .work-status { display: inline-block; padding: 3px 10px; border-radius: 10px; font-size: 11px; margin-top: 8px; }
        .work-status.pending { background: rgba(255,170,0,0.2); color: #ffaa00; }
        .work-status.completed { background: rgba(0,255,136,0.2); color: #00ff88; }

        /* Token Metrics Styles */
        .token-metrics { display: flex; flex-direction: column; gap: 15px; }
        .token-metrics h3 { margin-bottom: 10px; color: #00ff88; }
        .metric-card {
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 15px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .metric-card.savings {
          background: linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,200,100,0.05));
          border-color: rgba(0,255,136,0.3);
        }
        .metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .metric-title {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: #fff;
        }
        .metric-subtitle {
          font-size: 12px;
          color: #888;
          margin-top: 4px;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 13px;
        }
        .metric-row:last-child { border-bottom: none; }
        
        @media (max-width: 900px) {
          .main { flex-direction: column; }
          .office { flex: none; height: 400px; }
          .side-panel { flex: none; height: 400px; border-left: none; border-top: 1px solid rgba(255,255,255,0.1); }
          .metric-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

function getPositionStyle(index: number): React.CSSProperties {
  const positions = [
    { top: '10%', left: '50%', transform: 'translateX(-50%)' },
    { top: '30%', right: '10%' },
    { bottom: '30%', right: '10%' },
    { bottom: '10%', left: '50%', transform: 'translateX(-50%)' },
    { bottom: '30%', left: '10%' },
    { top: '30%', left: '10%' },
    { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '-100px' },
  ];
  return positions[index] || {};
}