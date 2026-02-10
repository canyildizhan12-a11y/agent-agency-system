-- Agent Agency Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable RLS (Row Level Security)
alter table if exists public.agents enable row level security;
alter table if exists public.agent_status enable row level security;
alter table if exists public.work_items enable row level security;
alter table if exists public.chat_messages enable row level security;
alter table if exists public.meetings enable row level security;

-- Drop existing tables (be careful in production!)
drop table if exists public.chat_messages cascade;
drop table if exists public.work_items cascade;
drop table if exists public.agent_status cascade;
drop table if exists public.meetings cascade;
drop table if exists public.agents cascade;

-- Agents table
CREATE TABLE public.agents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id text UNIQUE NOT NULL,
    name text NOT NULL,
    emoji text NOT NULL,
    role text NOT NULL,
    color text NOT NULL,
    personality text,
    expertise text[],
    traits jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agent status table (real-time status tracking)
CREATE TABLE public.agent_status (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id text REFERENCES public.agents(agent_id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('awake', 'sleeping', 'working')),
    last_task text,
    woken_at timestamp with time zone,
    woken_by text,
    sleep_started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Work items table (tracks what agents build)
CREATE TABLE public.work_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id text REFERENCES public.agents(agent_id) ON DELETE CASCADE,
    task text NOT NULL,
    description text,
    status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    file_path text,
    lines_of_code integer,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chat messages table (chat history with agents)
CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id text REFERENCES public.agents(agent_id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    sender text NOT NULL CHECK (sender IN ('user', 'agent')),
    message text NOT NULL,
    session_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Meetings table (tracks standup meetings)
CREATE TABLE public.meetings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    topic text NOT NULL,
    meeting_type text DEFAULT 'standup',
    participants text[] DEFAULT '{}',
    transcript jsonb DEFAULT '[]'::jsonb,
    action_items jsonb DEFAULT '[]'::jsonb,
    insights jsonb DEFAULT '[]'::jsonb,
    intelligence_score integer,
    started_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User preferences table
CREATE TABLE public.user_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferences jsonb DEFAULT '{}'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Functions to update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_status_updated_at BEFORE UPDATE ON public.agent_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_items_updated_at BEFORE UPDATE ON public.work_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
-- Agents: readable by all, writable by authenticated
CREATE POLICY "Agents readable by all" ON public.agents
    FOR SELECT USING (true);

CREATE POLICY "Agents writable by authenticated" ON public.agents
    FOR ALL USING (auth.role() = 'authenticated');

-- Agent Status: readable by all, writable by authenticated
CREATE POLICY "Agent status readable by all" ON public.agent_status
    FOR SELECT USING (true);

CREATE POLICY "Agent status writable by authenticated" ON public.agent_status
    FOR ALL USING (auth.role() = 'authenticated');

-- Work Items: readable by all, writable by authenticated
CREATE POLICY "Work items readable by all" ON public.work_items
    FOR SELECT USING (true);

CREATE POLICY "Work items writable by authenticated" ON public.work_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Chat Messages: users can only see their own messages
CREATE POLICY "Users can see own messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meetings: readable by all, writable by authenticated
CREATE POLICY "Meetings readable by all" ON public.meetings
    FOR SELECT USING (true);

CREATE POLICY "Meetings writable by authenticated" ON public.meetings
    FOR ALL USING (auth.role() = 'authenticated');

-- User Preferences: users can only see/edit their own
CREATE POLICY "Users can see own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can edit own preferences" ON public.user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Insert initial agent data
INSERT INTO public.agents (agent_id, name, emoji, role, color, personality, expertise, traits) VALUES
('henry', 'Henry', '🦉', 'Team Lead', '#FFD700', 'Wise, organized, strategic thinker', ARRAY['meeting facilitation', 'strategic planning', 'task prioritization', 'team coordination'], '{"leadership": 9, "creativity": 5, "technical": 4, "analytical": 7, "social": 8}'::jsonb),
('scout', 'Scout', '🔍', 'Researcher', '#87CEEB', 'Curious, detail-oriented, always digging', ARRAY['social media monitoring', 'competitor analysis', 'trend detection', 'data gathering'], '{"leadership": 3, "creativity": 6, "technical": 5, "analytical": 9, "social": 5}'::jsonb),
('pixel', 'Pixel', '🎨', 'Creative Director', '#FF69B4', 'Visual thinker, enthusiastic about design', ARRAY['visual design', 'thumbnail creation', 'brand aesthetics', 'creative direction'], '{"leadership": 4, "creativity": 10, "technical": 6, "analytical": 4, "social": 7}'::jsonb),
('echo', 'Echo', '💻', 'Developer', '#00CED1', 'Practical, efficient, loves building', ARRAY['full-stack development', 'prototyping', 'code review', 'automation'], '{"leadership": 4, "creativity": 6, "technical": 10, "analytical": 8, "social": 4}'::jsonb),
('quill', 'Quill', '✍️', 'Copywriter', '#DDA0DD', 'Wordsmith, storyteller, audience psychology', ARRAY['copywriting', 'script writing', 'social media content', 'storytelling'], '{"leadership": 3, "creativity": 9, "technical": 3, "analytical": 6, "social": 8}'::jsonb),
('codex', 'Codex', '🏗️', 'Architect', '#F4A460', 'Big-picture thinker, loves system design', ARRAY['system architecture', 'technical strategy', 'infrastructure planning'], '{"leadership": 6, "creativity": 5, "technical": 9, "analytical": 9, "social": 5}'::jsonb),
('alex', 'Alex', '📊', 'Analyst', '#98FB98', 'Data-driven, analytical, finds patterns', ARRAY['data analysis', 'performance metrics', 'A/B testing', 'reporting'], '{"leadership": 4, "creativity": 4, "technical": 7, "analytical": 10, "social": 5}'::jsonb);

-- Initialize agent status (all sleeping)
INSERT INTO public.agent_status (agent_id, status, last_task, sleep_started_at)
SELECT agent_id, 'sleeping', 'Initialized', timezone('utc'::text, now())
FROM public.agents;

-- Insert recent work items
INSERT INTO public.work_items (agent_id, task, description, status, file_path, lines_of_code, completed_at) VALUES
('henry', 'Pre-Flight Check Protocol', 'Built time estimation and checkpoint system', 'completed', 'implementation/pre-flight-protocol.js', 626, timezone('utc'::text, now())),
('scout', 'Intelligence Monitor', 'Built competitor and trend monitoring system', 'completed', 'implementation/intelligence-monitor.js', 734, timezone('utc'::text, now())),
('pixel', 'Visual Output System', 'Built status cards and progress visualizers', 'completed', 'implementation/visual-output-system.js', 868, timezone('utc'::text, now())),
('echo', 'Smart Cron System', 'Built natural language cron creation', 'completed', 'implementation/smart-cron-system.js', 653, timezone('utc'::text, now())),
('echo', 'Semantic Memory', 'Built embedding-based memory search', 'completed', 'implementation/semantic-memory.js', 777, timezone('utc'::text, now())),
('quill', 'Communication Framework', 'Built Can-First response templates', 'completed', 'implementation/communication-framework.js', 535, timezone('utc'::text, now())),
('codex', 'Context Router', 'Built mode detection system', 'completed', 'implementation/context-router.js', 551, timezone('utc'::text, now())),
('codex', 'Memory Architecture', 'Built 3-tier memory system', 'completed', 'implementation/memory-architecture.js', 673, timezone('utc'::text, now())),
('codex', 'Escalation System', 'Built confidence-based escalation', 'completed', 'implementation/escalation-system.js', 525, timezone('utc'::text, now())),
('alex', 'Metrics Framework', 'Built trust/value/efficiency tracking', 'completed', 'implementation/metrics-framework.js', 752, timezone('utc'::text, now())),
('alex', 'Research ROI Tracker', 'Built research usage tracking', 'completed', 'implementation/research-roi-tracker.js', 653, timezone('utc'::text, now())),
('alex', 'Weekly Reports', 'Built automated report generation', 'completed', 'implementation/weekly-reports.js', 602, timezone('utc'::text, now()));

-- Enable realtime for tables
alter publication supabase_realtime add table public.agent_status;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.work_items;

-- Create indexes for performance
CREATE INDEX idx_agent_status_agent_id ON public.agent_status(agent_id);
CREATE INDEX idx_agent_status_updated_at ON public.agent_status(updated_at DESC);
CREATE INDEX idx_work_items_agent_id ON public.work_items(agent_id);
CREATE INDEX idx_work_items_status ON public.work_items(status);
CREATE INDEX idx_chat_messages_agent_id ON public.chat_messages(agent_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Done!
SELECT 'Agent Agency database schema created successfully!' as status;