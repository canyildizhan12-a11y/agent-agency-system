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
"[project]/pages/api/tasks.ts [api] (ecmascript)", ((__turbopack_context__) => {
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
// Get real tasks from agent memory files
function getRealTasks() {
    const tasks = [];
    try {
        const files = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdirSync"](AGENTS_DIR).filter((f)=>f.endsWith('.json'));
        for (const file of files){
            const agentId = file.replace('.json', '');
            const configPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](AGENTS_DIR, file);
            try {
                const config = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](configPath, 'utf-8'));
                // Get action_items from agent memory
                const actionItems = config.memory?.personal?.action_items || [];
                for (const item of actionItems){
                    tasks.push({
                        id: item.id || `task-${Date.now()}-${agentId}`,
                        title: item.task || 'Untitled task',
                        assignee: agentId,
                        priority: item.priority || 'medium',
                        status: item.status || 'pending',
                        createdAt: item.completed_at || new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error(`Error reading agent ${agentId}:`, err);
            }
        }
    } catch (err) {
        console.error('Error reading agents directory:', err);
    }
    return tasks;
}
function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    // GET: List tasks from real agent data
    if (req.method === 'GET') {
        const { status, assignee, priority } = req.query;
        let tasks = getRealTasks();
        if (status) tasks = tasks.filter((t)=>t.status === status);
        if (assignee) tasks = tasks.filter((t)=>t.assignee === assignee);
        if (priority) tasks = tasks.filter((t)=>t.priority === priority);
        res.status(200).json({
            success: true,
            data: tasks
        });
        return;
    }
    // POST: Create a task (would need to write to file in production)
    if (req.method === 'POST') {
        const { title, assignee, priority = 'medium' } = req.body;
        if (!title || !assignee) {
            res.status(400).json({
                success: false,
                error: 'Title and assignee required'
            });
            return;
        }
        // In production, this would write to the agent's memory file
        const newTask = {
            id: `task-${Date.now()}-${assignee}`,
            title,
            assignee,
            priority,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            data: [
                newTask
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

//# sourceMappingURL=%5Broot-of-the-server%5D__668d2de0._.js.map