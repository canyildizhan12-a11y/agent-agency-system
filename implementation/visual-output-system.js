/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║           🎨 PIXEL VISUAL OUTPUT REDESIGN SYSTEM v1.0                    ║
 * ║              Creative Director: Status, Progress & Beauty                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 * 
 * A comprehensive visual system for beautiful, glanceable agent outputs.
 * 
 * @author Pixel - Creative Director 🎨
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS - Color Palette & Styling Constants
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  // Status Colors
  success: {
    bg: '#22c55e',
    bgLight: '#dcfce7',
    text: '#166534',
    border: '#86efac',
    emoji: '🟢',
    symbol: '✓',
    ansi: '\x1b[32m',
    hex: '#22c55e'
  },
  inProgress: {
    bg: '#f59e0b',
    bgLight: '#fef3c7',
    text: '#92400e',
    border: '#fcd34d',
    emoji: '🟡',
    symbol: '◐',
    ansi: '\x1b[33m',
    hex: '#f59e0b'
  },
  attention: {
    bg: '#ef4444',
    bgLight: '#fee2e2',
    text: '#991b1b',
    border: '#fca5a5',
    emoji: '🔴',
    symbol: '✗',
    ansi: '\x1b[31m',
    hex: '#ef4444'
  },
  info: {
    bg: '#3b82f6',
    bgLight: '#dbeafe',
    text: '#1e40af',
    border: '#93c5fd',
    emoji: '🔵',
    symbol: 'ℹ',
    ansi: '\x1b[34m',
    hex: '#3b82f6'
  },
  neutral: {
    bg: '#6b7280',
    bgLight: '#f3f4f6',
    text: '#374151',
    border: '#d1d5db',
    emoji: '⚪',
    symbol: '○',
    ansi: '\x1b[90m',
    hex: '#6b7280'
  },
  // Accent Colors
  purple: {
    bg: '#a855f7',
    bgLight: '#f3e8ff',
    text: '#6b21a8',
    border: '#d8b4fe',
    emoji: '🟣',
    symbol: '★',
    ansi: '\x1b[35m',
    hex: '#a855f7'
  },
  pink: {
    bg: '#ec4899',
    bgLight: '#fce7f3',
    text: '#9d174d',
    border: '#f9a8d4',
    emoji: '🩷',
    symbol: '♥',
    ansi: '\x1b[95m',
    hex: '#ec4899'
  }
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

// ═══════════════════════════════════════════════════════════════════════════
// 📦 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Center text within a given width
 */
function center(text, width) {
  const padding = Math.max(0, width - text.length);
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Pad text to specific length
 */
function pad(text, length, align = 'left') {
  const str = String(text);
  if (str.length >= length) return str.slice(0, length);
  const padding = ' '.repeat(length - str.length);
  return align === 'right' ? padding + str : str + padding;
}

/**
 * Repeat a character n times
 */
function repeat(char, times) {
  return char.repeat(Math.max(0, times));
}

// ═══════════════════════════════════════════════════════════════════════════
// 🃏 STATUS CARD TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a status indicator with emoji and color
 * @param {string} status - 'success' | 'inProgress' | 'attention' | 'info' | 'neutral'
 * @param {string} label - Optional label text
 */
function statusIndicator(status, label = '') {
  const theme = COLORS[status] || COLORS.neutral;
  return `${theme.emoji}${label ? ' ' + label : ''}`;
}

/**
 * Create a beautiful status card
 * @param {Object} options
 * @param {string} options.title - Card title
 * @param {string} options.status - 'success' | 'inProgress' | 'attention' | 'info'
 * @param {string} options.message - Main message
 * @param {string[]} options.details - Additional details (optional)
 * @param {number} options.width - Card width (default: 50)
 * @param {boolean} options.compact - Compact mode (default: false)
 */
function statusCard({ title, status, message, details = [], width = 50, compact = false }) {
  const theme = COLORS[status] || COLORS.info;
  const lines = [];
  
  // Top border with gradient effect
  lines.push(`╔${repeat('═', width - 2)}╗`);
  
  // Header with status emoji
  const headerText = `${theme.emoji} ${title}`;
  const headerPadding = width - 4 - headerText.length;
  lines.push(`║ ${BOLD}${theme.ansi}${headerText}${RESET}${repeat(' ', headerPadding)} ║`);
  
  // Separator
  lines.push(`╠${repeat('═', width - 2)}╣`);
  
  // Main message
  const msgLines = message.length > width - 6 
    ? message.match(new RegExp(`.{1,${width - 6}}`, 'g')) || [message]
    : [message];
  
  msgLines.forEach(line => {
    const padding = width - 4 - line.length;
    lines.push(`║  ${line}${repeat(' ', padding)}║`);
  });
  
  // Details if any
  if (details.length > 0 && !compact) {
    lines.push(`║${repeat(' ', width - 2)}║`);
    details.forEach(detail => {
      const detailText = `  ${theme.symbol} ${detail}`;
      const detailLines = detailText.length > width - 4
        ? detailText.match(new RegExp(`.{1,${width - 4}}`, 'g')) || [detailText]
        : [detailText];
      
      detailLines.forEach((line, idx) => {
        const display = idx === 0 ? line : '    ' + line.trim();
        const padding = width - 2 - display.length;
        lines.push(`║${display}${repeat(' ', padding)}║`);
      });
    });
  }
  
  // Bottom border
  lines.push(`╚${repeat('═', width - 2)}╝`);
  
  return lines.join('\n');
}

/**
 * Create a compact status badge
 * @param {string} status - Status type
 * @param {string} text - Badge text
 */
function statusBadge(status, text) {
  const theme = COLORS[status] || COLORS.neutral;
  return `${theme.ansi}[${theme.symbol} ${text}]${RESET}`;
}

/**
 * Create a status list item
 * @param {string} status - Status type
 * @param {string} label - Item label
 * @param {string} value - Optional value
 */
function statusListItem(status, label, value = '') {
  const theme = COLORS[status] || COLORS.neutral;
  const valueStr = value ? ` ${DIM}→${RESET} ${value}` : '';
  return `  ${theme.emoji} ${label}${valueStr}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 PROGRESS VISUALIZER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a progress bar
 * @param {Object} options
 * @param {number} options.current - Current progress
 * @param {number} options.total - Total value
 * @param {number} options.width - Bar width (default: 30)
 * @param {string} options.filled - Filled character (default: '█')
 * @param {string} options.empty - Empty character (default: '░')
 * @param {boolean} options.showPercent - Show percentage (default: true)
 * @param {string} options.status - Color status for the bar
 */
function progressBar({ 
  current, 
  total, 
  width = 30, 
  filled = '█', 
  empty = '░',
  showPercent = true,
  status = 'info'
}) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;
  
  const theme = COLORS[status] || COLORS.info;
  
  let bar = theme.ansi + filled.repeat(filledWidth) + RESET;
  bar += DIM + empty.repeat(emptyWidth) + RESET;
  
  const percentText = showPercent ? ` ${percentage.toFixed(1)}%` : '';
  const countText = ` (${current}/${total})`;
  
  return `[${bar}]${percentText}${countText}`;
}

/**
 * Create a segmented progress bar (good for steps)
 * @param {number} current - Current step
 * @param {number} total - Total steps
 * @param {string[]} labels - Step labels
 */
function segmentedProgress(current, total, labels = []) {
  const segments = [];
  for (let i = 1; i <= total; i++) {
    if (i < current) {
      segments.push(`${COLORS.success.emoji}`);
    } else if (i === current) {
      segments.push(`${COLORS.inProgress.emoji}`);
    } else {
      segments.push(`${COLORS.neutral.emoji}`);
    }
    
    if (labels[i - 1]) {
      const color = i < current ? COLORS.success.ansi : 
                    i === current ? COLORS.inProgress.ansi : COLORS.neutral.ansi;
      segments.push(`${color}${labels[i - 1]}${RESET}`);
    }
    
    if (i < total) {
      const connector = i < current ? `${COLORS.success.ansi}→${RESET}` : 
                       i === current ? `${COLORS.inProgress.ansi}→${RESET}` : `${DIM}→${RESET}`;
      segments.push(connector);
    }
  }
  return segments.join(' ');
}

/**
 * Create a multi-step progress tracker
 * @param {Object[]} steps - Array of step objects { name, status, details? }
 * @param {string} steps[].name - Step name
 * @param {string} steps[].status - 'done' | 'active' | 'pending' | 'error'
 * @param {string} steps[].details - Optional details
 */
function stepTracker(steps) {
  const lines = [];
  const maxNameLength = Math.max(...steps.map(s => s.name.length));
  
  steps.forEach((step, index) => {
    const isLast = index === steps.length - 1;
    const connector = isLast ? '  ' : '  │';
    
    let statusIcon, statusColor;
    switch (step.status) {
      case 'done':
        statusIcon = '✓';
        statusColor = COLORS.success.ansi;
        break;
      case 'active':
        statusIcon = '▶';
        statusColor = COLORS.inProgress.ansi;
        break;
      case 'error':
        statusIcon = '✗';
        statusColor = COLORS.attention.ansi;
        break;
      default:
        statusIcon = '○';
        statusColor = DIM;
    }
    
    const namePadded = pad(step.name, maxNameLength + 2);
    lines.push(`${connector}${statusColor}${statusIcon}${RESET} ${namePadded}${step.details || ''}`);
  });
  
  return lines.join('\n');
}

/**
 * Create a dashboard-style progress summary
 * @param {Object} stats - Statistics object
 * @param {number} stats.completed - Completed count
 * @param {number} stats.inProgress - In progress count
 * @param {number} stats.pending - Pending count
 * @param {number} stats.blocked - Blocked count
 */
function progressDashboard(stats) {
  const total = stats.completed + stats.inProgress + stats.pending + stats.blocked;
  const width = 40;
  
  const lines = [
    `┌${repeat('─', width - 2)}┐`,
    `│${center('📊 PROGRESS DASHBOARD', width - 2)}│`,
    `├${repeat('─', width - 2)}┤`
  ];
  
  // Progress bar
  const barWidth = width - 8;
  const completedW = Math.round((stats.completed / total) * barWidth);
  const inProgressW = Math.round((stats.inProgress / total) * barWidth);
  const blockedW = Math.round((stats.blocked / total) * barWidth);
  const pendingW = barWidth - completedW - inProgressW - blockedW;
  
  const bar = COLORS.success.ansi + '█'.repeat(completedW) + 
              COLORS.inProgress.ansi + '█'.repeat(inProgressW) +
              COLORS.attention.ansi + '█'.repeat(blockedW) +
              DIM + '░'.repeat(Math.max(0, pendingW)) + RESET;
  
  lines.push(`│  [${bar}]  │`);
  lines.push(`│${repeat(' ', width - 2)}│`);
  
  // Stats rows
  const addStat = (emoji, label, count, color) => {
    const percent = ((count / total) * 100).toFixed(0);
    const text = `${emoji} ${label}: ${count} (${percent}%)`;
    const padding = width - 4 - text.length;
    lines.push(`│  ${color}${text}${RESET}${repeat(' ', padding)}│`);
  };
  
  addStat('🟢', 'Done', stats.completed, COLORS.success.ansi);
  addStat('🟡', 'Active', stats.inProgress, COLORS.inProgress.ansi);
  addStat('🔴', 'Blocked', stats.blocked, COLORS.attention.ansi);
  addStat('⚪', 'Pending', stats.pending, DIM);
  
  lines.push(`├${repeat('─', width - 2)}┤`);
  lines.push(`│  ${BOLD}Total:${RESET} ${total} items${repeat(' ', width - 16 - String(total).length)}│`);
  lines.push(`└${repeat('─', width - 2)}┘`);
  
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// 👁️ GLANCEABLE OUTPUT FORMATTING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a quick glance summary (one-liner)
 * @param {Object} items - Key-value pairs to display
 */
function glance(items) {
  const parts = [];
  for (const [key, value] of Object.entries(items)) {
    let formatted;
    if (typeof value === 'boolean') {
      formatted = value ? `${COLORS.success.emoji} ${key}` : `${COLORS.attention.emoji} ${key}`;
    } else if (typeof value === 'number' && value > 0) {
      formatted = `${COLORS.info.emoji} ${key}: ${value}`;
    } else {
      formatted = `${COLORS.neutral.emoji} ${key}: ${value}`;
    }
    parts.push(formatted);
  }
  return parts.join(' │ ');
}

/**
 * Create a metric card for a single important number
 * @param {string} label - Metric label
 * @param {number} value - Metric value
 * @param {string} unit - Unit suffix
 * @param {string} trend - 'up' | 'down' | 'neutral'
 * @param {string} status - Color status
 */
function metricCard(label, value, unit = '', trend = 'neutral', status = 'info') {
  const theme = COLORS[status] || COLORS.info;
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? COLORS.success.ansi : 
                     trend === 'down' ? COLORS.attention.ansi : DIM;
  
  return [
    `┌────────────────────┐`,
    `│${center(label, 20)}│`,
    `│                    │`,
    `│${center(`${BOLD}${theme.ansi}${value}${RESET}${unit} ${trendColor}${trendIcon}${RESET}`, 20)}│`,
    `└────────────────────┘`
  ].join('\n');
}

/**
 * Create a table with aligned columns
 * @param {string[]} headers - Column headers
 * @param {Array[]} rows - Table rows
 * @param {Object} options - Table options
 */
function table(headers, rows, { align = [], spacing = 2 } = {}) {
  // Calculate column widths
  const colWidths = headers.map((h, i) => {
    const cellWidths = rows.map(r => String(r[i] || '').length);
    return Math.max(h.length, ...cellWidths);
  });
  
  const lines = [];
  const totalWidth = colWidths.reduce((a, b) => a + b, 0) + (colWidths.length - 1) * spacing + 4;
  
  // Top border
  lines.push(`┌${repeat('─', totalWidth - 2)}┐`);
  
  // Headers
  const headerRow = headers.map((h, i) => pad(h, colWidths[i], align[i] || 'left')).join(repeat(' ', spacing));
  lines.push(`│ ${BOLD}${headerRow}${RESET} │`);
  
  // Separator
  lines.push(`├${repeat('─', totalWidth - 2)}┤`);
  
  // Rows
  rows.forEach(row => {
    const rowStr = row.map((cell, i) => pad(String(cell), colWidths[i], align[i] || 'left')).join(repeat(' ', spacing));
    lines.push(`│ ${rowStr} │`);
  });
  
  // Bottom border
  lines.push(`└${repeat('─', totalWidth - 2)}┘`);
  
  return lines.join('\n');
}

/**
 * Create a collapsible section (for expandable details)
 * @param {string} title - Section title
 * @param {string[]} content - Content lines
 * @param {boolean} expanded - Start expanded
 */
function collapsible(title, content, expanded = false) {
  const icon = expanded ? '▼' : '▶';
  const lines = [`${icon} ${BOLD}${title}${RESET}`];
  
  if (expanded) {
    content.forEach(line => lines.push(`  ${line}`));
  }
  
  return lines.join('\n');
}

/**
 * Create a notification/toast style message
 * @param {string} message - Message text
 * @param {string} type - 'success' | 'info' | 'warning' | 'error'
 */
function toast(message, type = 'info') {
  const theme = {
    success: { ...COLORS.success, icon: '✓' },
    info: { ...COLORS.info, icon: 'ℹ' },
    warning: { ...COLORS.inProgress, icon: '⚠' },
    error: { ...COLORS.attention, icon: '✗' }
  }[type] || COLORS.info;
  
  const width = Math.max(message.length + 6, 20);
  const padding = width - message.length - 4;
  
  return [
    `${theme.ansi}╭${repeat('─', width - 2)}╮${RESET}`,
    `${theme.ansi}│${RESET} ${theme.icon} ${message}${repeat(' ', padding - 2)}${theme.ansi}│${RESET}`,
    `${theme.ansi}╰${repeat('─', width - 2)}╯${RESET}`
  ].join('\n');
}

/**
 * Create a separator line with optional text
 * @param {string} text - Optional text to center
 * @param {number} width - Line width
 */
function separator(text = '', width = 50) {
  if (!text) return repeat('─', width);
  const textWidth = text.length + 2;
  const sideWidth = Math.floor((width - textWidth) / 2);
  return repeat('─', sideWidth) + ` ${text} ` + repeat('─', width - sideWidth - textWidth);
}

/**
 * Create a header banner
 * @param {string} title - Header title
 * @param {string} subtitle - Optional subtitle
 */
function header(title, subtitle = '') {
  const width = Math.max(title.length, subtitle.length) + 10;
  const lines = [
    `╔${repeat('═', width - 2)}╗`,
    `║${center('', width - 2)}║`,
    `║${center(BOLD + title + RESET, width - 2)}║`,
    `║${center('', width - 2)}║`
  ];
  
  if (subtitle) {
    lines.push(`║${center(DIM + subtitle + RESET, width - 2)}║`);
    lines.push(`║${center('', width - 2)}║`);
  }
  
  lines.push(`╚${repeat('═', width - 2)}╝`);
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 AGENT-SPECIFIC FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format agent status for quick viewing
 * @param {Object} agent - Agent data
 * @param {string} agent.name - Agent name
 * @param {string} agent.role - Agent role
 * @param {string} agent.status - 'idle' | 'working' | 'error' | 'complete'
 * @param {string} agent.task - Current task description
 * @param {number} agent.progress - Progress 0-100
 */
function agentStatusCard(agent) {
  const statusMap = {
    idle: { color: COLORS.neutral, label: 'Idle' },
    working: { color: COLORS.inProgress, label: 'Working' },
    error: { color: COLORS.attention, label: 'Error' },
    complete: { color: COLORS.success, label: 'Complete' }
  };
  
  const statusInfo = statusMap[agent.status] || statusMap.idle;
  const width = 45;
  
  const lines = [
    `┌${repeat('─', width - 2)}┐`,
    `│ ${BOLD}${agent.name}${RESET}${repeat(' ', width - 4 - agent.name.length - agent.role.length)}${DIM}${agent.role}${RESET} │`,
    `├${repeat('─', width - 2)}┤`,
    `│  Status: ${statusInfo.color.ansi}${statusInfo.label}${RESET}${repeat(' ', width - 13 - statusInfo.label.length)}│`,
    `│  Task: ${truncate(agent.task, width - 11)}${repeat(' ', Math.max(0, width - 11 - Math.min(agent.task.length, width - 11)))}│`
  ];
  
  if (agent.progress !== undefined) {
    const bar = progressBar({ 
      current: agent.progress, 
      total: 100, 
      width: width - 12,
      status: agent.status === 'error' ? 'attention' : agent.status === 'complete' ? 'success' : 'info'
    });
    lines.push(`│${repeat(' ', width - 2)}│`);
    lines.push(`│  ${bar} │`);
  }
  
  lines.push(`└${repeat('─', width - 2)}┘`);
  
  return lines.join('\n');
}

/**
 * Format multiple agents in a fleet view
 * @param {Object[]} agents - Array of agent objects
 */
function agentFleetView(agents) {
  const lines = [header('🤖 AGENT FLEET STATUS', `${agents.length} agents active`)];
  lines.push('');
  
  agents.forEach((agent, i) => {
    lines.push(agentStatusCard(agent));
    if (i < agents.length - 1) lines.push('');
  });
  
  return lines.join('\n');
}

/**
 * Create a task completion summary
 * @param {Object} summary - Task summary data
 */
function taskSummary(summary) {
  const lines = [
    header('✅ TASK COMPLETE', summary.title || ''),
    '',
    `${COLORS.success.emoji} ${BOLD}Success!${RESET} ${summary.message || ''}`,
    ''
  ];
  
  if (summary.metrics) {
    lines.push(separator('METRICS', 40));
    lines.push('');
    for (const [key, value] of Object.entries(summary.metrics)) {
      lines.push(`  ${COLORS.info.emoji} ${key}: ${BOLD}${value}${RESET}`);
    }
    lines.push('');
  }
  
  if (summary.nextSteps) {
    lines.push(separator('NEXT STEPS', 40));
    lines.push('');
    summary.nextSteps.forEach((step, i) => {
      lines.push(`  ${i + 1}. ${step}`);
    });
  }
  
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧪 WORKING EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

function runExamples() {
  const examples = [];
  
  // Example 1: Status Cards
  examples.push(header('EXAMPLE 1: STATUS CARDS'));
  examples.push('');
  
  examples.push(statusCard({
    title: 'Deployment Complete',
    status: 'success',
    message: 'All services deployed successfully to production.',
    details: ['3 services updated', '0 errors', 'Build time: 2m 34s']
  }));
  
  examples.push('');
  
  examples.push(statusCard({
    title: 'Processing Data',
    status: 'inProgress',
    message: 'Analyzing dataset for patterns...',
    details: ['Records processed: 45,231', 'ETA: 3 minutes'],
    width: 55
  }));
  
  examples.push('');
  
  examples.push(statusCard({
    title: 'Action Required',
    status: 'attention',
    message: 'API key expired. Please update credentials.',
    compact: true
  }));
  
  // Example 2: Progress Bars
  examples.push('');
  examples.push(header('EXAMPLE 2: PROGRESS VISUALIZERS'));
  examples.push('');
  
  examples.push('File Upload:');
  examples.push(progressBar({ current: 75, total: 100, status: 'info' }));
  examples.push('');
  
  examples.push('Segmented Progress:');
  examples.push(segmentedProgress(3, 5, ['Init', 'Process', 'Validate', 'Deploy', 'Done']));
  examples.push('');
  
  examples.push('Step Tracker:');
  examples.push(stepTracker([
    { name: 'Clone repo', status: 'done', details: '(2.3s)' },
    { name: 'Install deps', status: 'done', details: '(12.1s)' },
    { name: 'Run tests', status: 'active', details: '45/100 passing' },
    { name: 'Build package', status: 'pending' },
    { name: 'Deploy', status: 'pending' }
  ]));
  
  // Example 3: Dashboard
  examples.push('');
  examples.push(header('EXAMPLE 3: PROGRESS DASHBOARD'));
  examples.push('');
  
  examples.push(progressDashboard({
    completed: 42,
    inProgress: 8,
    pending: 15,
    blocked: 3
  }));
  
  // Example 4: Glanceable Info
  examples.push('');
  examples.push(header('EXAMPLE 4: GLANCEABLE OUTPUTS'));
  examples.push('');
  
  examples.push('Quick Status:');
  examples.push(glance({
    'Build': true,
    'Tests': false,
    'Deploy': 3,
    'Queue': 12
  }));
  
  examples.push('');
  examples.push('Metrics:');
  examples.push(metricCard('Response Time', 245, 'ms', 'down', 'success'));
  
  examples.push('');
  examples.push('Table:');
  examples.push(table(
    ['Service', 'Status', 'Uptime'],
    [
      ['API Gateway', statusBadge('success', 'Healthy'), '99.9%'],
      ['Database', statusBadge('success', 'Healthy'), '99.99%'],
      ['Cache', statusBadge('inProgress', 'Degraded'), '98.5%'],
      ['Worker', statusBadge('attention', 'Down'), '0%']
    ]
  ));
  
  // Example 5: Agent Fleet
  examples.push('');
  examples.push(header('EXAMPLE 5: AGENT FLEET VIEW'));
  examples.push('');
  
  examples.push(agentFleetView([
    { name: 'Pixel', role: 'Creative Director', status: 'working', task: 'Designing UI components', progress: 65 },
    { name: 'Nova', role: 'Research Lead', status: 'complete', task: 'Market analysis report', progress: 100 },
    { name: 'Bolt', role: 'Dev Engineer', status: 'error', task: 'API integration', progress: 30 },
    { name: 'Spark', role: 'Data Analyst', status: 'idle', task: 'Waiting for input', progress: 0 }
  ]));
  
  // Example 6: Notifications
  examples.push('');
  examples.push(header('EXAMPLE 6: TOAST NOTIFICATIONS'));
  examples.push('');
  
  examples.push(toast('Changes saved successfully!', 'success'));
  examples.push('');
  examples.push(toast('Warning: Low disk space', 'warning'));
  examples.push('');
  examples.push(toast('Connection failed', 'error'));
  
  // Example 7: Task Summary
  examples.push('');
  examples.push(header('EXAMPLE 7: TASK COMPLETION'));
  examples.push('');
  
  examples.push(taskSummary({
    title: 'Website Redesign',
    message: 'All pages have been updated with the new design system.',
    metrics: {
      'Pages Updated': 24,
      'Components': 156,
      'Files Changed': 42,
      'Time Spent': '4h 32m'
    },
    nextSteps: [
      'Schedule stakeholder review',
      'Deploy to staging environment',
      'Run accessibility audit'
    ]
  }));
  
  return examples.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// 📦 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

const PixelVisualSystem = {
  // Constants
  COLORS,
  RESET,
  BOLD,
  DIM,
  
  // Utilities
  center,
  truncate,
  pad,
  repeat,
  
  // Status Cards
  statusIndicator,
  statusCard,
  statusBadge,
  statusListItem,
  
  // Progress
  progressBar,
  segmentedProgress,
  stepTracker,
  progressDashboard,
  
  // Glanceable
  glance,
  metricCard,
  table,
  collapsible,
  toast,
  separator,
  header,
  
  // Agent-specific
  agentStatusCard,
  agentFleetView,
  taskSummary,
  
  // Examples
  runExamples
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PixelVisualSystem;
}

if (typeof window !== 'undefined') {
  window.PixelVisualSystem = PixelVisualSystem;
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 RUN EXAMPLES IF EXECUTED DIRECTLY
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log('\n' + '='.repeat(70));
  console.log(center('🎨 PIXEL VISUAL OUTPUT SYSTEM', 70));
  console.log(center('Creative Director Presents: Beautiful Agent Outputs', 70));
  console.log('='.repeat(70) + '\n');
  
  console.log(runExamples());
  
  console.log('\n' + '='.repeat(70));
  console.log(center('✨ Made with love by Pixel', 70));
  console.log('='.repeat(70) + '\n');
}
