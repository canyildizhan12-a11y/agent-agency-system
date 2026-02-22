module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/pages/api/agents.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
const AGENTS_DIR = '/home/ubuntu/.openclaw/workspace/agent-agency/agents';
// Get agent emoji from identity files
function getAgentEmoji(agentId) {
    const emojiMap = {
        henry: '🦆',
        scout: '🔍',
        pixel: '🎨',
        echo: '💾',
        quill: '✍️',
        codex: '🏗️',
        alex: '🛡️',
        vega: '📊'
    };
    return emojiMap[agentId] || '❓';
}
// Get agent role from identity files
function getAgentRole(agentId) {
    const roleMap = {
        henry: 'Team Lead',
        scout: 'Research',
        pixel: 'Creative',
        echo: 'Developer',
        quill: 'Documentation',
        codex: 'Architecture',
        alex: 'Immune System',
        vega: 'Data Analyst'
    };
    return roleMap[agentId] || 'Unknown';
}
// Read real agent data from filesystem
function getRealAgents() {
    const agentIds = [
        'henry',
        'scout',
        'pixel',
        'echo',
        'quill',
        'codex',
        'alex',
        'vega'
    ];
    const agents = [];
    for (const agentId of agentIds){
        const configPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](AGENTS_DIR, `${agentId}.json`);
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](configPath)) {
                const config = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](configPath, 'utf-8'));
                // Check for active sessions in cron jobs or recent activity
                const cronJobsPath = '/home/ubuntu/.openclaw/cron/jobs.json';
                let status = 'sleeping';
                let lastActivity;
                if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](cronJobsPath)) {
                    const cronData = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](cronJobsPath, 'utf-8'));
                    const recentJob = cronData.jobs?.find((j)=>j.agentId === agentId && j.state?.lastRunAtMs && Date.now() - j.state.lastRunAtMs < 3600000 // Within last hour
                    );
                    if (recentJob) {
                        status = 'active';
                        lastActivity = new Date(recentJob.state.lastRunAtMs).toISOString();
                    }
                }
                agents.push({
                    id: agentId,
                    name: config.name || agentId.charAt(0).toUpperCase() + agentId.slice(1),
                    emoji: getAgentEmoji(agentId),
                    role: getAgentRole(agentId),
                    status,
                    lastActivity
                });
            }
        } catch (err) {
            // Fallback for agents without config
            agents.push({
                id: agentId,
                name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
                emoji: getAgentEmoji(agentId),
                role: getAgentRole(agentId),
                status: 'sleeping'
            });
        }
    }
    return agents;
}
function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // GET: List all agents from real data
    if (req.method === 'GET') {
        const agents = getRealAgents();
        res.status(200).json({
            success: true,
            data: agents
        });
        return;
    }
    // POST: Get single agent or update status
    if (req.method === 'POST') {
        const { agentId, action } = req.body;
        if (action === 'status') {
            const agents = getRealAgents();
            const agent = agents.find((a)=>a.id === agentId);
            if (agent) {
                res.status(200).json({
                    success: true,
                    data: [
                        agent
                    ]
                });
                return;
            }
            res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
            return;
        }
        res.status(400).json({
            success: false,
            error: 'Invalid action'
        });
        return;
    }
    res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__61e6c877._.js.map