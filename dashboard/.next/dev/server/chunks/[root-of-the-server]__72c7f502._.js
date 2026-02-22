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
"[project]/pages/api/work.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
// Need path for the runs directory
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
const CRON_JOBS_PATH = '/home/ubuntu/.openclaw/cron/jobs.json';
const CRON_RUNS_DIR = '/home/ubuntu/.openclaw/cron/runs';
// Get real work from cron job runs
function getRealWork() {
    const work = [];
    try {
        // Read cron jobs to get task info
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](CRON_JOBS_PATH)) {
            const cronData = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](CRON_JOBS_PATH, 'utf-8'));
            for (const job of cronData.jobs || []){
                const lastRun = job.state?.lastRunAtMs;
                const status = job.state?.lastStatus === 'ok' ? 'completed' : job.state?.lastStatus === 'error' ? 'failed' : 'pending';
                work.push({
                    id: job.id,
                    agentId: job.agentId,
                    task: job.name || `Run ${job.agentId} task`,
                    status,
                    createdAt: lastRun ? new Date(lastRun).toISOString() : new Date().toISOString(),
                    duration: job.state?.lastDurationMs,
                    result: job.state?.lastStatus === 'ok' ? 'Success' : job.state?.lastStatus === 'error' ? 'Failed' : undefined
                });
            }
        }
        // Also check cron runs directory for more details
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](CRON_RUNS_DIR)) {
            const runFiles = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdirSync"](CRON_RUNS_DIR).filter((f)=>f.endsWith('.json'));
            for (const file of runFiles.slice(-10)){
                try {
                    const runData = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](CRON_RUNS_DIR, file), 'utf-8'));
                    work.push({
                        id: runData.jobId || file,
                        agentId: runData.agentId || 'unknown',
                        task: runData.task || 'Cron job execution',
                        status: runData.status || 'completed',
                        createdAt: runData.startedAt || new Date().toISOString(),
                        duration: runData.durationMs,
                        result: runData.result || runData.error
                    });
                } catch (err) {
                // Skip malformed files
                }
            }
        }
    } catch (err) {
        console.error('Error reading work data:', err);
    }
    // Sort by most recent first
    return work.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
;
function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // GET: Get work from real cron runs
    if (req.method === 'GET') {
        const { agentId, status } = req.query;
        let work = getRealWork();
        if (agentId) work = work.filter((w)=>w.agentId === agentId);
        if (status) work = work.filter((w)=>w.status === status);
        res.status(200).json({
            success: true,
            data: work
        });
        return;
    }
    // POST: Submit new work (would trigger agent in production)
    if (req.method === 'POST') {
        const { agentId, task } = req.body;
        if (!agentId || !task) {
            res.status(400).json({
                success: false,
                error: 'agentId and task required'
            });
            return;
        }
        const validAgents = [
            'henry',
            'scout',
            'pixel',
            'echo',
            'quill',
            'codex',
            'alex',
            'vega'
        ];
        if (!validAgents.includes(agentId)) {
            res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
            return;
        }
        // In production, this would trigger the agent via sessions_spawn
        const taskId = `task_${Date.now()}`;
        res.status(201).json({
            success: true,
            taskId,
            message: `Task assigned to ${agentId}: ${task}`
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

//# sourceMappingURL=%5Broot-of-the-server%5D__72c7f502._.js.map