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
"[project]/pages/api/cron.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>handler
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
;
const CRON_JOBS_PATH = '/home/ubuntu/.openclaw/cron/jobs.json';
// Read real cron jobs from OpenClaw
function getRealCronJobs() {
    try {
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](CRON_JOBS_PATH)) {
            return [];
        }
        const data = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](CRON_JOBS_PATH, 'utf-8'));
        if (!data.jobs || !Array.isArray(data.jobs)) {
            return [];
        }
        return data.jobs.map((job)=>({
                id: job.id,
                name: job.name || job.agentId,
                agentId: job.agentId,
                schedule: job.schedule?.expr || 'unknown',
                action: job.payload?.kind || 'agentTurn',
                enabled: job.enabled ?? true,
                lastRun: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toISOString() : null,
                nextRun: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toISOString() : null,
                status: job.state?.lastStatus || 'pending'
            }));
    } catch (err) {
        console.error('Error reading cron jobs:', err);
        return [];
    }
}
function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // GET: List cron jobs from real data
    if (req.method === 'GET') {
        const { enabled } = req.query;
        let jobs = getRealCronJobs();
        if (enabled !== undefined) {
            jobs = jobs.filter((j)=>j.enabled === (enabled === 'true'));
        }
        res.status(200).json({
            success: true,
            data: jobs
        });
        return;
    }
    // POST: Trigger a cron job manually
    if (req.method === 'POST') {
        const { jobId } = req.body;
        const jobs = getRealCronJobs();
        const job = jobs.find((j)=>j.id === jobId);
        if (!job) {
            res.status(404).json({
                success: false,
                error: 'Job not found'
            });
            return;
        }
        // In production, this would trigger the cron job via OpenClaw API
        res.status(200).json({
            success: true,
            message: `Triggered job: ${job.name}`,
            data: [
                job
            ]
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

//# sourceMappingURL=%5Broot-of-the-server%5D__368491d8._.js.map