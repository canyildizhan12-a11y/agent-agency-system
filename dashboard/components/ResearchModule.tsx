import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface IntelligenceItem {
  id: string;
  type: 'tool' | 'competitor' | 'technology' | 'trend';
  title: string;
  source: string;
  url?: string;
  summary: string;
  tags: string[];
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface ResearchTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  dueDate?: string;
}

interface Finding {
  id: string;
  title: string;
  description: string;
  category: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  sources: string[];
  createdAt: string;
}

// Mock Data
const mockIntelligence: IntelligenceItem[] = [
  { id: '1', type: 'tool', title: 'Cline CLI v3.0 Released', source: 'TechCrunch', summary: 'New API-based pricing at $4.90/task with enhanced agentic capabilities', tags: ['ai', 'coding', 'cli'], timestamp: '2h ago', sentiment: 'positive' },
  { id: '2', type: 'competitor', title: 'Windsurf AI Agentic IDE', source: 'Codeium', summary: 'Direct competitor to Cursor with unique agent flows', tags: ['ide', 'competition'], timestamp: '5h ago', sentiment: 'neutral' },
  { id: '3', type: 'trend', title: 'Vibe Coding Trend 2026', source: 'HackerNews', summary: '85% of developers now use AI tools regularly for coding', tags: ['trends', 'statistics'], timestamp: '1d ago', sentiment: 'positive' },
  { id: '4', type: 'technology', title: 'Claude Code Reasoning Mode', source: 'Anthropic', summary: 'Step-by-step reasoning for complex debugging and architecture', tags: ['ai', 'reasoning'], timestamp: '2d ago', sentiment: 'positive' },
];

const mockTasks: ResearchTask[] = [
  { id: '1', title: 'Compare AI coding assistants pricing models', status: 'in_progress', priority: 'high', assignee: 'Scout', dueDate: 'Today' },
  { id: '2', title: 'Research local/self-hosted AI options', status: 'pending', priority: 'medium', dueDate: 'Tomorrow' },
  { id: '3', title: 'Analyze Cursor vs Windsurf features', status: 'completed', priority: 'high', assignee: 'Scout' },
  { id: '4', title: 'Document competitor weaknesses', status: 'pending', priority: 'low' },
];

const mockFindings: Finding[] = [
  { id: '1', title: 'Cline is best for CLI-first workflows', description: 'API-based pricing makes it cost-effective for quick edits. Great for terminal-heavy developers.', category: 'tool-comparison', importance: 'high', sources: ['AIMultiple', 'DevTo'], createdAt: '2026-02-19' },
  { id: '2', title: 'Enterprise needs local models', description: 'Privacy-sensitive industries (healthcare, finance, defense) require self-hosted solutions.', category: 'market-gap', importance: 'critical', sources: ['SeedIo', 'Faros'], createdAt: '2026-02-18' },
  { id: '3', title: 'Windsurf bridging gap between AI and IDE', description: 'Good UX with agentic features, but still maturing compared to Cursor.', category: 'competitor-analysis', importance: 'medium', sources: ['HumAI'], createdAt: '2026-02-17' },
];

// Components
function IntelligenceCard({ item, onClick }: { item: IntelligenceItem; onClick?: () => void }) {
  const typeColors = {
    tool: '#10b981',
    competitor: '#f59e0b',
    technology: '#8b5cf6',
    trend: '#06b6d4',
  };
  const color = typeColors[item.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, x: 4 }}
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
          {item.type}
        </span>
        <span style={{ fontSize: '11px', color: '#64748b' }}>{item.timestamp}</span>
      </div>
      <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{item.title}</h4>
      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '10px' }}>{item.summary}</p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {item.tags.map(tag => (
          <span key={tag} style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: '#94a3b8' }}>
            #{tag}
          </span>
        ))}
      </div>
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>📰 {item.source}</div>
    </motion.div>
  );
}

function TaskItem({ task }: { task: ResearchTask }) {
  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#64748b' };
  const statusIcons = { pending: '⏳', in_progress: '🔄', completed: '✅' };
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ fontSize: '16px' }}>{statusIcons[task.status]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>{task.title}</div>
        {task.assignee && <div style={{ fontSize: '11px', color: '#64748b' }}>👤 {task.assignee}</div>}
      </div>
      <span style={{ 
        fontSize: '10px', 
        padding: '2px 8px', 
        borderRadius: '4px', 
        background: `${priorityColors[task.priority]}22`,
        color: priorityColors[task.priority],
        fontWeight: 600,
      }}>
        {task.priority}
      </span>
      {task.dueDate && (
        <span style={{ fontSize: '10px', color: '#64748b' }}>{task.dueDate}</span>
      )}
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const importanceColors = { critical: '#ef4444', high: '#f59e0b', medium: '#8b5cf6', low: '#64748b' };
  const color = importanceColors[finding.importance];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>{finding.category}</span>
        <span style={{ 
          fontSize: '9px', 
          padding: '2px 6px', 
          borderRadius: '4px', 
          background: `${color}22`,
          color,
          fontWeight: 600,
        }}>
          {finding.importance}
        </span>
      </div>
      <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>{finding.title}</h4>
      <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '10px' }}>{finding.description}</p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#64748b' }}>Sources:</span>
        {finding.sources.map(s => (
          <span key={s} style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(139,92,246,0.1)', borderRadius: '4px', color: '#8b5cf6' }}>{s}</span>
        ))}
      </div>
    </motion.div>
  );
}

// Main Research Module
export default function ResearchModule() {
  const [activeSection, setActiveSection] = useState<'feed' | 'tasks' | 'findings'>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ padding: '24px' }}>
      <style>{`
        .research-section { margin-bottom: 24px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .search-input { 
          background: rgba(255,255,255,0.05); 
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 8px; 
          padding: 8px 16px; 
          color: #f8fafc; 
          font-size: 13px; 
          width: 250px;
        }
        .search-input::placeholder { color: #64748b; }
        .search-input:focus { outline: none; border-color: #00d4ff; }
        .btn { 
          padding: 8px 16px; 
          border-radius: 8px; 
          border: none; 
          font-size: 12px; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s;
        }
        .btn-primary { background: linear-gradient(135deg, #00d4ff, #8b5cf6); color: white; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,212,255,0.3); }
        .btn-secondary { background: rgba(255,255,255,0.1); color: #94a3b8; }
        .btn-secondary:hover { background: rgba(255,255,255,0.15); color: #f8fafc; }
        .tab-btn { padding: 10px 20px; background: transparent; border: none; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
        .tab-btn.active { background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15)); color: #00d4ff; border: 1px solid rgba(0,212,255,0.3); }
        .tab-btn:hover:not(.active) { background: rgba(255,255,255,0.05); color: #94a3b8; }
      `}</style>

      {/* Header */}
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>🔍 Research Module</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Intelligence feed, task queue, and findings tracker</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="text" 
            className="search-input"
            placeholder="Search research..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary">+ New Research</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        <button className={`tab-btn ${activeSection === 'feed' ? 'active' : ''}`} onClick={() => setActiveSection('feed')}>
          📡 Intelligence Feed
        </button>
        <button className={`tab-btn ${activeSection === 'tasks' ? 'active' : ''}`} onClick={() => setActiveSection('tasks')}>
          📋 Task Queue ({mockTasks.filter(t => t.status !== 'completed').length})
        </button>
        <button className={`tab-btn ${activeSection === 'findings' ? 'active' : ''}`} onClick={() => setActiveSection('findings')}>
          💡 Findings ({mockFindings.length})
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}
          >
            {mockIntelligence.map(item => (
              <IntelligenceCard key={item.id} item={item} />
            ))}
          </motion.div>
        )}

        {activeSection === 'tasks' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {mockTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
            <button className="btn btn-secondary" style={{ marginTop: '12px', alignSelf: 'center' }}>+ Add Task</button>
          </motion.div>
        )}

        {activeSection === 'findings' && (
          <motion.div
            key="findings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}
          >
            {mockFindings.map(finding => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
