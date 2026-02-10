const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

const PORT = 3001;
const AGENCY_DIR = path.join(__dirname, '..');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Get agent status from files
function getAgentStatus() {
  const sleepingDir = path.join(AGENCY_DIR, 'sleeping_agents');
  const activeDir = path.join(AGENCY_DIR, 'active_sessions');
  
  const agents = [
    { id: 'henry', name: 'Henry', emoji: '🦉', role: 'Team Lead', color: '#FFD700' },
    { id: 'scout', name: 'Scout', emoji: '🔍', role: 'Researcher', color: '#87CEEB' },
    { id: 'pixel', name: 'Pixel', emoji: '🎨', role: 'Creative', color: '#FF69B4' },
    { id: 'echo', name: 'Echo', emoji: '💻', role: 'Developer', color: '#00CED1' },
    { id: 'quill', name: 'Quill', emoji: '✍️', role: 'Copywriter', color: '#DDA0DD' },
    { id: 'codex', name: 'Codex', emoji: '🏗️', role: 'Architect', color: '#F4A460' },
    { id: 'alex', name: 'Alex', emoji: '📊', role: 'Analyst', color: '#98FB98' }
  ];
  
  return agents.map(agent => {
    const sleepFile = path.join(sleepingDir, `${agent.id}.json`);
    
    if (fs.existsSync(sleepFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(sleepFile, 'utf8'));
        return { ...agent, status: data.status || 'sleeping', lastTask: data.last_task };
      } catch (e) {
        return { ...agent, status: 'sleeping' };
      }
    }
    
    // Check if there's an active session
    const activeDirContents = fs.existsSync(activeDir) ? fs.readdirSync(activeDir) : [];
    const isActive = activeDirContents.some(f => f.includes(agent.id));
    
    if (isActive) {
      return { ...agent, status: 'awake' };
    }
    
    return { ...agent, status: 'sleeping' };
  });
}

// Get recent work
function getRecentWork() {
  const workDir = path.join(AGENCY_DIR, 'implementation');
  const workItems = [];
  
  if (fs.existsSync(workDir)) {
    const files = fs.readdirSync(workDir).filter(f => f.endsWith('.js'));
    
    const workMap = {
      'pre-flight-protocol.js': { agent: 'henry', task: 'Pre-Flight Protocol' },
      'intelligence-monitor.js': { agent: 'scout', task: 'Intelligence Monitor' },
      'visual-output-system.js': { agent: 'pixel', task: 'Visual Output System' },
      'smart-cron-system.js': { agent: 'echo', task: 'Smart Cron System' },
      'semantic-memory.js': { agent: 'echo', task: 'Semantic Memory' },
      'communication-framework.js': { agent: 'quill', task: 'Communication Framework' },
      'context-router.js': { agent: 'codex', task: 'Context Router' },
      'memory-architecture.js': { agent: 'codex', task: 'Memory Architecture' },
      'escalation-system.js': { agent: 'codex', task: 'Escalation System' },
      'metrics-framework.js': { agent: 'alex', task: 'Metrics Framework' },
      'research-roi-tracker.js': { agent: 'alex', task: 'Research ROI Tracker' },
      'weekly-reports.js': { agent: 'alex', task: 'Weekly Reports' }
    };
    
    files.forEach(file => {
      if (workMap[file]) {
        const stats = fs.statSync(path.join(workDir, file));
        workItems.push({
          ...workMap[file],
          status: 'completed',
          time: stats.mtime.toISOString(),
          file: file
        });
      }
    });
  }
  
  return workItems.sort((a, b) => new Date(b.time) - new Date(a.time));
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // API endpoints
  if (pathname === '/api/agents') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getAgentStatus()));
    return;
  }
  
  if (pathname === '/api/work') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getRecentWork()));
    return;
  }
  
  if (pathname.startsWith('/api/wake/')) {
    const agentId = pathname.split('/')[3];
    
    // In a real implementation, this would spawn a sub-agent
    // For now, just update the status file
    const sleepFile = path.join(AGENCY_DIR, 'sleeping_agents', `${agentId}.json`);
    
    if (fs.existsSync(sleepFile)) {
      const data = JSON.parse(fs.readFileSync(sleepFile, 'utf8'));
      data.status = 'awake';
      data.woken_at = new Date().toISOString();
      data.woken_by = 'dashboard';
      fs.writeFileSync(sleepFile, JSON.stringify(data, null, 2));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: `Woke up ${agentId}` }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Agent not found' }));
    }
    return;
  }
  
  // Static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🦉 AGENT AGENCY DASHBOARD                                ║
║                                                            ║
║   Server running at: http://localhost:${PORT}              ║
║                                                            ║
║   Features:                                                ║
║   • Visual office with all 7 agents                       ║
║   • Real-time status monitoring                           ║
║   • Wake up agents with one click                         ║
║   • Direct chat interface                                 ║
║   • Work tracking                                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Also update the HTML file to use the API
console.log('Dashboard server started. Open http://localhost:3001 in your browser.');
