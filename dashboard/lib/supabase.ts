import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Agent = {
  id: string;
  agent_id: string;
  name: string;
  emoji: string;
  role: string;
  color: string;
  personality?: string;
  expertise?: string[];
  traits?: Record<string, number>;
  created_at: string;
  updated_at: string;
};

export type AgentStatus = {
  id: string;
  agent_id: string;
  status: 'awake' | 'sleeping' | 'working';
  last_task?: string;
  woken_at?: string;
  woken_by?: string;
  sleep_started_at?: string;
  metadata?: Record<string, any>;
  updated_at: string;
};

export type WorkItem = {
  id: string;
  agent_id: string;
  task: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  file_path?: string;
  lines_of_code?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  agent_id: string;
  sender: 'user' | 'agent';
  message: string;
  session_id?: string;
  created_at: string;
};