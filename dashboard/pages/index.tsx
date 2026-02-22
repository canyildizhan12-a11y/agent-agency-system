import { useState, useEffect } from 'react';
import Head from 'next/head';
import ResearchModule from '../components/ResearchModule';

// Types
interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: 'awake' | 'sleeping' | 'working';
  color: string;
  session: { sessionKey: string; uuid: string; spawnedAt: string; expiresAt: string } | null;
}

interface Tab { id: string; label: string; icon: string; }

// Mock Data
const mockAgents: Agent[] = [
  { id: 'henry', name: 'Henry', emoji: '🦉', role: 'Team Lead', status: 'awake', color: '#f59e0b', session: { sessionKey: 'henry:main', uuid: 'abc-123', spawnedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() } },
  { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Research', status: 'working', color: '#8b5cf6', session: { sessionKey: 'scout:main', uuid: 'def-456', spawnedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() } },
  { id: 'pixel', name: 'Pixel', emoji: '🎨', role: 'Creative', status: 'awake', color: '#ec4899', session: { sessionKey: 'pixel:main', uuid: 'ghi-789', spawnedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() } },
  { id: 'echo', name: 'Echo', emoji: '💾', role: 'Memory', status: 'sleeping', color: '#06b6d4', session: null },
  { id: 'quill', name: 'Quill', emoji: '✍️', role: 'Documentation', status: 'sleeping', color: '#10b981', session: null },
  { id: 'codex', name: 'Codex', emoji: '🏗️', role: 'Architecture', status: 'working', color: '#3b82f6', session: { sessionKey: 'codex:main', uuid: 'jkl-012', spawnedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() } },
  { id: 'alex', name: 'Alex', emoji: '🛡️', role: 'Security', status: 'sleeping', color: '#ef4444', session: null },
  { id: 'vega', name: 'Vega', emoji: '📊', role: 'Data Analyst', status: 'awake', color: '#14b8a6', session: { sessionKey: 'vega:main', uuid: 'mno-345', spawnedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() } },
];

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: '🎯' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'research', label: 'Research', icon: '🔍' },
  { id: 'metrics', label: 'Metrics', icon: '📊' },
  { id: 'tokens', label: 'Tokens', icon: '🪙' },
  { id: 'system', label: 'System', icon: '⚙️' },
];

// Components
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    awake: { color: '#10b981', label: '● Awake' },
    working: { color: '#f59e0b', label: '◐ Working' },
    sleeping: { color: '#6b7280', label: '○ Sleeping' },
  };
  const { color, label } = config[status] || config.sleeping;
  return <span style={{ color, background: `${color}22`, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{label}</span>;
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '16px', border: `2px solid ${agent.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${agent.color}33, ${agent.color}11)`, marginBottom: '16px' }}>
        <span style={{ fontSize: '32px' }}>{agent.emoji}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{agent.name}</h3>
        <StatusBadge status={agent.status} />
      </div>
      <p style={{ color: '#94a3b8', fontSize: '13px' }}>{agent.role}</p>
      {agent.session && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#00d4ff', background: 'rgba(0,212,255,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '8px' }}>
          {agent.session.sessionKey}
        </p>
      )}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', borderRadius: '50%', background: agent.color, filter: 'blur(40px)', opacity: 0.3, pointerEvents: 'none' }} />
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}22`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{icon}</span>
        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color }}>{value}</div>
    </div>
  );
}

function Gauge({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = (value / max) * 100;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 100 60" style={{ width: '100%', maxWidth: '140px' }}>
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})`, strokeDasharray: 283, strokeDashoffset: 283 - (283 * percentage) / 100, transition: 'stroke-dashoffset 1.5s ease-out' }} />
      </svg>
      <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: '-30px' }}>{value}%</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{label}</div>
    </div>
  );
}

// Main Component
export default function MissionControl() {
  const [agents] = useState<Agent[]>(mockAgents);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const awakeAgents = agents.filter(a => a.status !== 'sleeping');
  const workingAgents = agents.filter(a => a.status === 'working');

  return (
    <>
      <Head><title>🎛️ Mission Control | Agent Agency</title></Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        :root { --bg-primary: #0a0a0f; --accent-cyan: #00d4ff; --accent-purple: #8b5cf6; --accent-green: #10b981; --accent-amber: #f59e0b; --text-primary: #f8fafc; --text-secondary: #94a3b8; --glass-border: rgba(255,255,255,0.08); }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: var(--bg-primary); color: var(--text-primary); min-height: 100vh; }
        .bg-effects { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .bg-effects::before { content: ''; position: absolute; inset: -50%; background: radial-gradient(ellipse at 20% 20%, rgba(0,212,255,0.08), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.08), transparent 50%); animation: bgPulse 15s infinite; }
        @keyframes bgPulse { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-2%,-2%); } }
        .grid-overlay { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 50px 50px; }
        .app-container { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: rgba(10,10,15,0.8); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); position: sticky; top: 0; z-index: 100; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon { width: 42px; height: 42px; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 4px 20px rgba(0,212,255,0.3); }
        .logo-text { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header-right { display: flex; align-items: center; gap: 24px; }
        .time-display { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--text-secondary); padding: 8px 16px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--glass-border); }
        .system-status { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--accent-green); }
        .status-dot { width: 8px; height: 8px; background: var(--accent-green); border-radius: 50%; box-shadow: 0 0 10px var(--accent-green); animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .nav-tabs { display: flex; gap: 4px; padding: 16px 32px; background: rgba(10,10,15,0.5); border-bottom: 1px solid var(--glass-border); flex-wrap: wrap; }
        .nav-tab { padding: 10px 20px; background: transparent; border: none; color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .nav-tab:hover { background: rgba(255,255,255,0.03); color: var(--text-primary); }
        .nav-tab.active { background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15)); color: var(--accent-cyan); border: 1px solid rgba(0,212,255,0.3); }
        .main-content { flex: 1; padding: 32px; }
        .overview-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .stat-box { text-align: center; padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border); }
        .stat-value { font-size: 32px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
        .stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
        .two-column { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .gauges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .chart-area { height: 250px; background: linear-gradient(180deg, rgba(0,212,255,0.05), transparent); border-radius: 12px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .chart-area::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 60%; background: linear-gradient(180deg, rgba(0,212,255,0.2), transparent); clip-path: polygon(0 100%, 0 60%, 14% 55%, 28% 65%, 42% 45%, 57% 50%, 71% 35%, 85% 40%, 100% 25%, 100% 100%); }
        .chart-label { position: relative; z-index: 1; color: var(--text-secondary); font-size: 13px; }
        @media (max-width: 1200px) { .two-column { grid-template-columns: 1fr; } .overview-stats { grid-template-columns: repeat(2, 1fr); } .gauges-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .header { padding: 12px 16px; } .nav-tabs { padding: 12px 16px; overflow-x: auto; } .main-content { padding: 16px; } .overview-stats { grid-template-columns: 1fr; } }
      `}</style>
      
      <div className="bg-effects"><div className="grid-overlay" /></div>
      
      <div className="app-container">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">🎛️</div>
            <span className="logo-text">Mission Control</span>
          </div>
          <div className="header-right">
            <div className="system-status"><span className="status-dot" />System Online</div>
            <div className="time-display">{currentTime}</div>
          </div>
        </header>
        
        <nav className="nav-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        
        <main className="main-content">
          {activeTab === 'overview' && (
            <>
              <div className="overview-stats">
                <div className="stat-box"><div className="stat-value" style={{ color: 'var(--accent-green)' }}>{awakeAgents.length}</div><div className="stat-label">Active Agents</div></div>
                <div className="stat-box"><div className="stat-value" style={{ color: 'var(--accent-amber)' }}>{workingAgents.length}</div><div className="stat-label">Working</div></div>
                <div className="stat-box"><div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>4</div><div className="stat-label">Sessions</div></div>
                <div className="stat-box"><div className="stat-value" style={{ color: 'var(--accent-purple)' }}>2.8k</div><div className="stat-label">Tokens Today</div></div>
              </div>
              
              <div className="two-column">
                <div>
                  <h2 className="section-title"><span>🤖</span> Active Agents</h2>
                  <div className="agents-grid">
                    {awakeAgents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
                  </div>
                </div>
                <div>
                  <h2 className="section-title"><span>📊</span> System Health</h2>
                  <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                    <div className="gauges-grid">
                      <Gauge value={23} max={100} label="CPU" color="#00d4ff" />
                      <Gauge value={67} max={100} label="Memory" color="#8b5cf6" />
                      <Gauge value={98} max={100} label="Uptime" color="#10b981" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'agents' && (
            <>
              <h2 className="section-title"><span>🤖</span> All Agents</h2>
              <div className="agents-grid">
                {agents.map(agent => <AgentCard key={agent.id} agent={agent} />)}
              </div>
            </>
          )}
          
          {activeTab === 'research' && <ResearchModule />}
          
          {activeTab === 'metrics' && (
            <>
              <h2 className="section-title"><span>📊</span> Metrics Overview</h2>
              <div className="metrics-grid">
                <MetricCard icon="🔥" label="Token Usage" value="2,847" color="#00d4ff" />
                <MetricCard icon="⚡" label="Active Sessions" value="4" color="#8b5cf6" />
                <MetricCard icon="📈" label="Total Sessions" value="156" color="#10b981" />
                <MetricCard icon="⏱️" label="Avg Response" value="1.2s" color="#f59e0b" />
              </div>
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#94a3b8' }}>Weekly Trend</h3>
                <div className="chart-area"><span className="chart-label">Token usage over last 7 days</span></div>
              </div>
            </>
          )}
          
          {activeTab === 'tokens' && (
            <>
              <h2 className="section-title"><span>🪙</span> Token Management</h2>
              <div className="metrics-grid">
                <MetricCard icon="📅" label="Today" value="2,847" color="#00d4ff" />
                <MetricCard icon="📆" label="This Week" value="18,234" color="#8b5cf6" />
                <MetricCard icon="🗓️" label="This Month" value="72,456" color="#10b981" />
                <MetricCard icon="💰" label="Budget" value="$42.50" color="#f59e0b" />
              </div>
            </>
          )}
          
          {activeTab === 'system' && (
            <>
              <h2 className="section-title"><span>⚙️</span> System Status</h2>
              <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div className="gauges-grid">
                  <Gauge value={23} max={100} label="CPU" color="#00d4ff" />
                  <Gauge value={67} max={100} label="Memory" color="#8b5cf6" />
                  <Gauge value={98} max={100} label="Uptime" color="#10b981" />
                </div>
              </div>
              <div className="metrics-grid" style={{ marginTop: '24px' }}>
                <MetricCard icon="🔄" label="Cron Jobs" value="10/12" color="#10b981" />
                <MetricCard icon="🛡️" label="Security" value="Pass" color="#10b981" />
                <MetricCard icon="📡" label="API Status" value="Healthy" color="#10b981" />
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
