// Supabase bypass - dashboard works without auth
export const supabase = {
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    eq: () => ({ data: null, error: null }),
  }),
  auth: {
    signUp: () => Promise.resolve({ data: { user: { id: 'local' } }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: { id: 'local' }, session: { access_token: 'local' } }, error: null }),
    getSession: () => Promise.resolve({ data: { session: { user: { id: 'local' } } }, error: null }),
    getUser: () => Promise.resolve({ data: { user: { id: 'local' } }, error: null }),
  }
} as any;

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