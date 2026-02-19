/**
 * Mission Control Dashboard - Agent Agency
 * Cyberpunk themed real-time dashboard
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';

// Types
interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: 'active' | 'idle' | 'sleeping' | 'busy';
  lastActivity: string;
  currentTask?: string;
}

interface Metric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  nextRun: string;
}

interface Task {
  id: string;
  agent: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

// Mock Data
const agents: Agent[] = [
  { id: 'henry', name: 'Henry', emoji: '🦆', role: 'Team Lead', status: 'active', lastActivity: '2 min ago', currentTask: 'Coordinating team' },
  { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Research', status: 'active', lastActivity: '5 min ago', currentTask: 'Intelligence gathering' },
  { id: 'pixel', name: 'Pixel', emoji: '🎨', role: 'Creative', status: 'idle', lastActivity: '12 min ago', currentTask: 'Design work' },
  { id: 'echo', name: 'Echo', emoji: '💾', role: 'Developer', status: 'active', lastActivity: '1 min ago', currentTask: 'Building dashboard' },
  { id: 'codex', name: 'Codex', emoji: '🏗️', role: 'Architecture', status: 'sleeping', lastActivity: '1 hr ago' },
  { id: 'quill', name: 'Quill', emoji: '✍️', role: 'Documentation', status: 'idle', lastActivity: '8 min ago', currentTask: 'Writing docs' },
  { id: 'vega', name: 'Vega', emoji: '📊', role: 'Data Analyst', status: 'active', lastActivity: '3 min ago', currentTask: 'Analyzing metrics' },
  { id: 'alex', name: 'Alex', emoji: '🛡️', role: 'Security', status: 'active', lastActivity: '1 min ago', currentTask: 'Monitoring systems' },
];

const metrics: Metric[] = [
  { label: 'Token Usage Today', value: '2.4M', change: -12, trend: 'down' },
  { label: 'Active Sessions', value: '8', change: 0, trend: 'stable' },
  { label: 'Tasks Completed', value: '47', change: 23, trend: 'up' },
  { label: 'Success Rate', value: '98.2%', change: 2.1, trend: 'up' },
];

const cronJobs: CronJob[] = [
  { id: '1', name: 'Morning Standup', schedule: '09:00 TRT', status: 'active', lastRun: 'Today 09:00', nextRun: 'Tomorrow 09:00' },
  { id: '2', name: 'Evening Standup', schedule: '17:00 TRT', status: 'active', lastRun: 'Today 17:00', nextRun: 'Tomorrow 17:00' },
  { id: '3', name: 'Intelligence Sweep', schedule: 'Every 6 hours', status: 'active', lastRun: '6 hrs ago', nextRun: 'In 2 hrs' },
  { id: '4', name: 'Disk Monitor', schedule: 'Every 4 hours', status: 'active', lastRun: '4 hrs ago', nextRun: 'In 30 min' },
  { id: '5', name: 'Security Scan', schedule: 'Daily', status: 'paused', lastRun: 'Yesterday', nextRun: 'Paused' },
];

const recentTasks: Task[] = [
  { id: '1', agent: 'Scout', description: 'Research competitor analysis', status: 'completed', priority: 'high' },
  { id: '2', agent: 'Echo', description: 'Fix dashboard API', status: 'in_progress', priority: 'high' },
  { id: '3', agent: 'Vega', description: 'Generate metrics report', status: 'pending', priority: 'medium' },
  { id: '4', agent: 'Pixel', description: 'Design mockups', status: 'in_progress', priority: 'medium' },
  { id: '5', agent: 'Alex', description: 'Security audit', status: 'pending', priority: 'low' },
];

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState('overview');
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'sleeping': return '#6b7280';
      case 'busy': return '#ef4444';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'pending': return '#6b7280';
      case 'error': return '#ef4444';
      case 'paused': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  return (
    <div className="dashboard">
      <Head>
        <title>Mission Control | Agent Agency</title>
        <meta name="description" content="Real-time Agent Agency Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">🎛️</span>
          <span className="logo-text">MISSION CONTROL</span>
        </div>
        
        <nav className="nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            <span>Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            <span className="nav-icon">🤖</span>
            <span>Agents</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <span className="nav-icon">📈</span>
            <span>Metrics</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <span className="nav-icon">📋</span>
            <span>Tasks</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'cron' ? 'active' : ''}`}
            onClick={() => setActiveTab('cron')}
          >
            <span className="nav-icon">⏰</span>
            <span>Cron Jobs</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span className="nav-icon">📜</span>
            <span>Activity</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot active"></span>
            <span>All Systems Operational</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <span className="subtitle">Agent Agency Dashboard</span>
          </div>
          <div className="header-right">
            <div className="notifications" onClick={() => setNotifications(0)}>
              <span className="notif-icon">🔔</span>
              {notifications > 0 && <span className="notif-badge">{notifications}</span>}
            </div>
            <div className="time">
              <span className="time-label">TRT</span>
              <span className="time-value">
                {time.toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' })}
              </span>
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="content">
            {/* Metrics Grid */}
            <div className="metrics-grid">
              {metrics.map((metric, i) => (
                <div key={i} className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">{metric.label}</span>
                    <span className={`metric-trend ${metric.trend}`}>
                      {getTrendIcon(metric.trend)} {Math.abs(metric.change)}%
                    </span>
                  </div>
                  <div className="metric-value">{metric.value}</div>
                </div>
              ))}
            </div>

            {/* Agent Status Grid */}
            <div className="section">
              <h2 className="section-title">Agent Status</h2>
              <div className="agent-grid">
                {agents.map((agent) => (
                  <div key={agent.id} className="agent-card">
                    <div className="agent-header">
                      <span className="agent-emoji">{agent.emoji}</span>
                      <span 
                        className="agent-status"
                        style={{ backgroundColor: getStatusColor(agent.status) }}
                      ></span>
                    </div>
                    <div className="agent-info">
                      <h3>{agent.name}</h3>
                      <span className="agent-role">{agent.role}</span>
                    </div>
                    <div className="agent-activity">
                      <span className="activity-status">{agent.status}</span>
                      <span className="activity-time">{agent.lastActivity}</span>
                    </div>
                    {agent.currentTask && (
                      <div className="current-task">
                        <span className="task-label">Current:</span>
                        <span className="task-text">{agent.currentTask}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="section section-2col">
              <div className="panel">
                <h3 className="panel-title">Active Tasks</h3>
                <div className="task-list">
                  {recentTasks.filter(t => t.status !== 'completed').map((task) => (
                    <div key={task.id} className="task-item">
                      <span className="task-status" style={{ backgroundColor: getStatusColor(task.status) }}></span>
                      <span className="task-agent">{task.agent}</span>
                      <span className="task-desc">{task.description}</span>
                      <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3 className="panel-title">Cron Jobs</h3>
                <div className="cron-list">
                  {cronJobs.slice(0, 4).map((job) => (
                    <div key={job.id} className="cron-item">
                      <span className="cron-status" style={{ backgroundColor: getStatusColor(job.status) }}></span>
                      <span className="cron-name">{job.name}</span>
                      <span className="cron-next">{job.nextRun}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="content">
            <div className="agent-grid full">
              {agents.map((agent) => (
                <div key={agent.id} className="agent-card detailed">
                  <div className="agent-header">
                    <span className="agent-emoji large">{agent.emoji}</span>
                    <span 
                      className="agent-status large"
                      style={{ backgroundColor: getStatusColor(agent.status) }}
                    ></span>
                  </div>
                  <div className="agent-info">
                    <h3>{agent.name}</h3>
                    <span className="agent-role">{agent.role}</span>
                  </div>
                  <div className="agent-stats">
                    <div className="stat">
                      <span className="stat-label">Status</span>
                      <span className="stat-value">{agent.status}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Last Activity</span>
                      <span className="stat-value">{agent.lastActivity}</span>
                    </div>
                  </div>
                  {agent.currentTask && (
                    <div className="current-task">
                      <span className="task-label">Current Task:</span>
                      <span className="task-text">{agent.currentTask}</span>
                    </div>
                  )}
                  <div className="agent-actions">
                    <button className="btn btn-secondary">View Details</button>
                    <button className="btn btn-primary">Wake</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="content">
            <div className="metrics-grid">
              {metrics.map((metric, i) => (
                <div key={i} className="metric-card large">
                  <div className="metric-header">
                    <span className="metric-label">{metric.label}</span>
                    <span className={`metric-trend ${metric.trend}`}>
                      {getTrendIcon(metric.trend)} {Math.abs(metric.change)}%
                    </span>
                  </div>
                  <div className="metric-value huge">{metric.value}</div>
                  <div className="metric-chart">
                    <div className="chart-bar" style={{ height: '60%' }}></div>
                    <div className="chart-bar" style={{ height: '80%' }}></div>
                    <div className="chart-bar" style={{ height: '45%' }}></div>
                    <div className="chart-bar" style={{ height: '90%' }}></div>
                    <div className="chart-bar" style={{ height: '70%' }}></div>
                    <div className="chart-bar" style={{ height: '85%' }}></div>
                    <div className="chart-bar" style={{ height: '60%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="content">
            <div className="panel full">
              <div className="panel-header">
                <h3 className="panel-title">All Tasks</h3>
                <button className="btn btn-primary">+ New Task</button>
              </div>
              <div className="task-list detailed">
                {recentTasks.map((task) => (
                  <div key={task.id} className="task-item detailed">
                    <span className="task-status" style={{ backgroundColor: getStatusColor(task.status) }}></span>
                    <div className="task-info">
                      <span className="task-agent">{task.agent}</span>
                      <span className="task-desc">{task.description}</span>
                    </div>
                    <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                    <span className="task-status-text">{task.status.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cron Tab */}
        {activeTab === 'cron' && (
          <div className="content">
            <div className="panel full">
              <div className="panel-header">
                <h3 className="panel-title">Scheduled Jobs</h3>
                <button className="btn btn-primary">+ New Job</button>
              </div>
              <div className="cron-list detailed">
                {cronJobs.map((job) => (
                  <div key={job.id} className="cron-item detailed">
                    <span className="cron-status" style={{ backgroundColor: getStatusColor(job.status) }}></span>
                    <div className="cron-info">
                      <span className="cron-name">{job.name}</span>
                      <span className="cron-schedule">{job.schedule}</span>
                    </div>
                    <div className="cron-times">
                      <span className="cron-last">Last: {job.lastRun}</span>
                      <span className="cron-next">Next: {job.nextRun}</span>
                    </div>
                    <div className="cron-actions">
                      <button className="btn btn-small">{job.status === 'active' ? 'Pause' : 'Resume'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="content">
            <div className="panel full">
              <h3 className="panel-title">Recent Activity</h3>
              <div className="activity-feed">
                <div className="activity-item">
                  <span className="activity-time">2 min ago</span>
                  <span className="activity-agent">Echo</span>
                  <span className="activity-action">deployed dashboard to production</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">5 min ago</span>
                  <span className="activity-agent">Scout</span>
                  <span className="activity-action">completed intelligence sweep</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">12 min ago</span>
                  <span className="activity-agent">Pixel</span>
                  <span className="activity-action">submitted design mockups</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">1 hr ago</span>
                  <span className="activity-agent">Alex</span>
                  <span className="activity-action">ran security scan - all clear</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">2 hrs ago</span>
                  <span className="activity-agent">Vega</span>
                  <span className="activity-action">generated weekly metrics report</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --bg-dark: #0a0a12;
          --bg-card: #12121a;
          --bg-card-hover: #1a1a24;
          --border: #2a2a3a;
          --text-primary: #ffffff;
          --text-secondary: #a0a0b0;
          --text-muted: #606070;
          --accent-cyan: #00d4ff;
          --accent-purple: #8b5cf6;
          --accent-green: #10b981;
          --accent-red: #ef4444;
          --accent-amber: #f59e0b;
          --glass: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg-dark);
          color: var(--text-primary);
          min-height: 100vh;
        }

        .dashboard {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          width: 260px;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 0 32px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 24px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1px;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: var(--glass);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(139, 92, 246, 0.15));
          color: var(--accent-cyan);
          border: 1px solid var(--glass-border);
        }

        .nav-icon {
          font-size: 18px;
        }

        .sidebar-footer {
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-green);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-card);
        }

        .header-left h1 {
          font-size: 24px;
          font-weight: 600;
        }

        .subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .notifications {
          position: relative;
          cursor: pointer;
          padding: 8px;
        }

        .notif-icon {
          font-size: 20px;
        }

        .notif-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--accent-red);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .time {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .time-label {
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 1px;
        }

        .time-value {
          font-size: 18px;
          font-weight: 600;
          font-family: 'SF Mono', Monaco, monospace;
          color: var(--accent-cyan);
        }

        .content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .metric-card:hover {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .metric-label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .metric-trend {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .metric-trend.up {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-green);
        }

        .metric-trend.down {
          background: rgba(239, 68, 68, 0.2);
          color: var(--accent-red);
        }

        .metric-trend.stable {
          background: rgba(160, 160, 176, 0.2);
          color: var(--text-secondary);
        }

        .metric-value {
          font-size: 28px;
          font-weight: 700;
        }

        .section {
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-secondary);
        }

        .section-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .agent-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .agent-grid.full {
          grid-template-columns: repeat(3, 1fr);
        }

        .agent-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
        }

        .agent-card:hover {
          border-color: var(--accent-purple);
          transform: translateY(-2px);
        }

        .agent-card.detailed {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .agent-emoji {
          font-size: 32px;
        }

        .agent-emoji.large {
          font-size: 48px;
        }

        .agent-status {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .agent-status.large {
          width: 16px;
          height: 16px;
        }

        .agent-info h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .agent-role {
          font-size: 13px;
          color: var(--text-muted);
        }

        .agent-activity {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-secondary);
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .activity-status {
          text-transform: capitalize;
        }

        .current-task {
          font-size: 12px;
          padding: 8px 12px;
          background: var(--glass);
          border-radius: 8px;
          margin-top: 8px;
        }

        .task-label {
          color: var(--text-muted);
        }

        .task-text {
          color: var(--accent-cyan);
          margin-left: 4px;
        }

        .agent-stats {
          display: flex;
          gap: 16px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 14px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .agent-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }

        .panel.full {
          padding: 24px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .panel-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--glass);
          border-radius: 8px;
        }

        .task-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .task-agent {
          font-size: 13px;
          font-weight: 500;
          min-width: 80px;
        }

        .task-desc {
          flex: 1;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .task-priority {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .task-priority.high {
          background: rgba(239, 68, 68, 0.2);
          color: var(--accent-red);
        }

        .task-priority.medium {
          background: rgba(245, 158, 11, 0.2);
          color: var(--accent-amber);
        }

        .task-priority.low {
          background: rgba(160, 160, 176, 0.2);
          color: var(--text-secondary);
        }

        .cron-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cron-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--glass);
          border-radius: 8px;
        }

        .cron-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .cron-name {
          font-size: 14px;
          font-weight: 500;
          min-width: 150px;
        }

        .cron-next {
          font-size: 12px;
          color: var(--text-muted);
        }

        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: var(--glass);
          border-radius: 8px;
        }

        .activity-time {
          font-size: 12px;
          color: var(--text-muted);
          min-width: 80px;
        }

        .activity-agent {
          font-size: 14px;
          font-weight: 500;
          color: var(--accent-cyan);
          min-width: 80px;
        }

        .activity-action {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .btn-secondary {
          background: var(--glass);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .btn-small {
          padding: 4px 12px;
          font-size: 12px;
          background: var(--glass);
          color: var(--text-primary);
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
