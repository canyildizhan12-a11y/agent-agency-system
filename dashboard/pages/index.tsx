import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: 'awake' | 'sleeping' | 'working';
  color: string;
  session: {
    sessionKey: string;
    uuid: string;
    spawnedAt: string;
    expiresAt: string;
  } | null;
}

interface Metrics {
  cronJobs: any[];
  tokenUsage: { today: number; sessions: any[] };
  immuneStatus: any;
  recentWork: any[];
  systemHealth: any;
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'henry', name: 'Henry', emoji: '🦉', role: 'Team Lead', status: 'sleeping', color: '#00ff88', session: null },
    { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Research', status: 'sleeping', color: '#00ff88', session: null },
    { id: 'pixel', name: 'Pixel', emoji: '🎨', role: 'Creative', status: 'sleeping', color: '#00ff88', session: null },
    { id: 'echo', name: 'Echo', emoji: '💾', role: 'Memory', status: 'sleeping', color: '#00ff88', session: null },
    { id: 'quill', name: 'Quill', emoji: '✍️', role: 'Documentation', status: 'sleeping', color: '#00ff88', session: null },
    { id: 'codex', name: 'Codex', emoji: '🏗️', role: 'Architecture', status: 'sleeping', color: '#00ff88', session: null },
    { id: 'alex', name: 'Alex', emoji: '🛡️', role: 'Security Lead', status: 'sleeping', color: '#00ff88', session: null },
    { id: 'vega', name: 'Vega', emoji: '📊', role: 'Data Analyst', status: 'sleeping', color: '#00ff88', session: null },
  ]);
  
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'metrics' | 'system'>('agents');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

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

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMetrics();
    const interval = setInterval(() => {
      fetchData();
      fetchMetrics();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const wakeAgent = async (agentId: string) => {
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/wake?id=${agentId}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'Stand by for instructions' })
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotification(`${data.agentEmoji} ${data.agentName} is now awake`);
        fetchData();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      setNotification('Error waking agent');
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
        setNotification(`${data.agentEmoji} ${data.agentName} is now sleeping`);
        fetchData();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      setNotification('Error putting agent to sleep');
    }
    setIsLoading(false);
  };

  const awakeCount = agents.filter(a => a.status === 'awake').length;
  const workingCount = agents.filter(a => a.status === 'working').length;
  const sleepingCount = agents.filter(a => a.status === 'sleeping').length;

  return (
    <>
      <Head>
        <title>🦉 Agent Agency - Monitoring Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>🦉 Agent Agency</h1>
            <div className="status-overview">
              <div className="status-pill awake">{awakeCount} Awake</div>
              <div className="status-pill working">{workingCount} Working</div>
              <div className="status-pill sleeping">{sleepingCount} Sleeping</div>
            </div>
          </div>
        </header>

        {notification && (
          <div className="notification-banner">
            {notification}
          </div>
        )}

        <div className="main-content">
          {/* Meeting Room */}
          <div className="meeting-room-container">
            <div className="room-header">
              <h2>🏢 Agency Meeting Room</h2>
              <p>Select an agent to view details</p>
            </div>
            
            <div className="meeting-room">
              <div className="conference-table">
                <div className="table-surface">
                  <span className="table-logo">🦉</span>
                </div>
              </div>
              
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
              <button className={activeTab === 'metrics' ? 'active' : ''} onClick={() => setActiveTab('metrics')}>📊 Metrics</button>
              <button className={activeTab === 'system' ? 'active' : ''} onClick={() => setActiveTab('system')}>⚙️ System</button>
            </div>

            <div className="panel-content">
              {activeTab === 'agents' && (
                <div className="agents-panel">
                  <div className="panel-header">
                    <h3>Agent Control</h3>
                    <p className="panel-hint">Click an agent in the room to select</p>
                  </div>

                  <div className="agents-list">
                    {agents.map(agent => (
                      <div key={agent.id} className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''} ${agent.status}`} onClick={() => setSelectedAgent(agent.id)}>
                        <div className="card-emoji">{agent.emoji}</div>
                        <div className="card-info">
                          <div className="card-name">{agent.name}</div>
                          <div className="card-role">{agent.role}</div>
                          <div className={`card-status ${agent.status}`}>{agent.status}</div>
                          {agent.session && (
                            <div className="session-expiry">
                              ⏱️ Expires: {new Date(agent.session.expiresAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          )}
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

                  {selectedAgent && (
                    <div className="agent-details">
                      {(() => {
                        const agent = agents.find(a => a.id === selectedAgent);
                        if (!agent) return null;
                        return (
                          <>
                            <h4>Agent Details</h4>
                            <div className="detail-row">
                              <span className="detail-label">Session Key:</span>
                              <code className="detail-value">{agent.session?.sessionKey || 'None'}</code>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">UUID:</span>
                              <code className="detail-value">{agent.session?.uuid || 'None'}</code>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Spawned:</span>
                              <span className="detail-value">{agent.session ? new Date(agent.session.spawnedAt).toLocaleString('tr-TR') : 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Expires:</span>
                              <span className="detail-value">{agent.session ? new Date(agent.session.expiresAt).toLocaleString('tr-TR') : 'N/A'}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'metrics' && (
                <div className="metrics-panel">
                  <h3>📊 Agency Metrics</h3>
                  
                  {metrics ? (
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-value">{metrics.tokenUsage.today.toLocaleString()}</div>
                        <div className="metric-label">Tokens Today</div>
                      </div>
                      
                      <div className="metric-card">
                        <div className="metric-value">{metrics.cronJobs.length}</div>
                        <div className="metric-label">Active Cron Jobs</div>
                      </div>
                      
                      <div className="metric-card">
                        <div className="metric-value">{metrics.recentWork.length}</div>
                        <div className="metric-label">Recent Work Items</div>
                      </div>
                      
                      <div className="metric-card">
                        <div className="metric-value">{metrics.systemHealth.status || 'Unknown'}</div>
                        <div className="metric-label">System Health</div>
                      </div>
                    </div>
                  ) : (
                    <p className="loading">Loading metrics...</p>
                  )}
                </div>
              )}

              {activeTab === 'system' && (
                <div className="system-panel">
                  <h3>⚙️ System Status</h3>
                  
                  <div className="system-section">
                    <h4>🛡️ Immune System</h4>
                    <p>Status: {metrics?.immuneStatus?.status || 'Checking...'}</p>
                    <p>Last Check: {metrics?.immuneStatus?.lastCheck ? new Date(metrics.immuneStatus.lastCheck).toLocaleString('tr-TR') : 'N/A'}</p>
                  </div>
                  
                  <div className="system-section">
                    <h4>📅 Cron Jobs</h4>
                    {metrics?.cronJobs.map((job: any) => (
                      <div key={job.id} className="cron-job">
                        <span className="cron-name">{job.name}</span>
                        <span className={`cron-status ${job.enabled ? 'enabled' : 'disabled'}`}>
                          {job.enabled ? '✅' : '❌'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>🦉 Agent Agency Monitoring Dashboard | Communication via Telegram</p>
        </footer>
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
        
        .status-overview {
          display: flex;
          gap: 12px;
        }
        
        .status-pill {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-pill.awake {
          background: rgba(0,255,136,0.2);
          color: #00ff88;
        }
        
        .status-pill.working {
          background: rgba(255,170,0,0.2);
          color: #ffaa00;
        }
        
        .status-pill.sleeping {
          background: rgba(100,100,100,0.2);
          color: #888;
        }
        
        .notification-banner {
          background: rgba(0,255,136,0.15);
          border: 1px solid rgba(0,255,136,0.3);
          padding: 12px 32px;
          text-align: center;
          font-size: 14px;
        }
        
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
        
        .meeting-room-container {
          background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
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
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,255,136,0.1);
        }
        
        .table-logo {
          font-size: 56px;
          filter: drop-shadow(0 0 20px rgba(0,255,136,0.5));
        }
        
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
        
        .side-panel {
          background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
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
        
        .panel-header {
          margin-bottom: 16px;
        }
        
        .panel-header h3 {
          font-size: 16px;
          margin-bottom: 4px;
        }
        
        .panel-hint {
          font-size: 12px;
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
        
        .session-expiry {
          font-size: 10px;
          color: #00ff88;
          margin-top: 4px;
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
        
        .agent-details {
          background: rgba(0,100,255,0.1);
          border: 1px solid rgba(0,100,255,0.2);
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
        }
        
        .agent-details h4 {
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 12px;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          color: #888;
        }
        
        .detail-value {
          color: #00ff88;
          font-family: monospace;
          font-size: 11px;
        }
        
        .metrics-panel h3,
        .system-panel h3 {
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .metric-card {
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 4px;
        }
        
        .metric-label {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
        }
        
        .loading {
          text-align: center;
          color: #666;
          padding: 40px;
        }
        
        .system-section {
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .system-section h4 {
          margin-bottom: 12px;
          font-size: 14px;
        }
        
        .system-section p {
          font-size: 12px;
          color: #888;
          margin-bottom: 4px;
        }
        
        .cron-job {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 12px;
        }
        
        .cron-name {
          color: #ccc;
        }
        
        .cron-status {
          font-size: 14px;
        }
        
        .footer {
          background: rgba(0,0,0,0.3);
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        
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