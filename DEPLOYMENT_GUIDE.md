# 🚀 Agent Agency Dashboard - Supabase + Vercel Deployment Guide

## Prerequisites

1. **Supabase Account** - https://supabase.com
2. **Vercel Account** - https://vercel.com
3. **GitHub Repository** - Your agent-agency repo

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it: `agent-agency`
4. Choose a strong database password (save it!)
5. Select region closest to your users
6. Click "Create new project"

### 1.2 Run the Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run**
5. Wait for "Success. No rows returned" message

### 1.3 Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy these values:
   - `URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.4 Enable Email Auth (Optional but recommended)
1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. For development, you can disable "Confirm email" (enable it in production)

## Step 2: Vercel Deployment

### 2.1 Connect Repository
1. Go to https://vercel.com/new
2. Import your GitHub repository: `canyildizhan12-a11y/agent-agency`
3. Select the `dashboard` folder as the root directory
4. Click **Continue**

### 2.2 Configure Environment Variables
Add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2.3 Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Your dashboard will be live at `https://your-project.vercel.app`

## Step 3: Verify Everything Works

### 3.1 Test Authentication
1. Visit your deployed dashboard
2. You should see the login page
3. Create an account or sign in
4. You should be redirected to the dashboard

### 3.2 Check Agent Status
1. After logging in, you should see the office view
2. All 7 agents should be displayed
3. Their status should show (initially all sleeping)

### 3.3 Test Wake Function
1. Click an agent in the list
2. Click "Wake Up" button
3. Status should change to "awake"
4. Check Supabase table editor - `agent_status` should show updated status

## Troubleshooting

### "Failed to fetch" errors
- Check that environment variables are set correctly in Vercel
- Verify Supabase URL is correct (should end with `.supabase.co`)

### Authentication not working
- Make sure Email provider is enabled in Supabase Auth
- Check that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify middleware.ts is in the dashboard folder

### Database errors
- Make sure you ran the schema.sql file completely
- Check that Row Level Security (RLS) policies are in place
- Verify tables exist in Supabase Table Editor

### Real-time updates not working
- Check that realtime is enabled for tables in Supabase
- Go to Database → Replication → Realtime (should be enabled)

## Database Schema Overview

### Tables Created:
1. **agents** - Stores agent definitions (Henry, Scout, etc.)
2. **agent_status** - Real-time status (awake/sleeping/working)
3. **work_items** - Tracks what agents build
4. **chat_messages** - Chat history with agents
5. **meetings** - Meeting records and transcripts
6. **user_preferences** - User settings

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Real-time subscriptions
- ✅ Automatic timestamps
- ✅ Foreign key relationships
- ✅ Indexes for performance

## Local Development

```bash
cd agent-agency/dashboard

# Create env file
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# Edit the file and fill in your values

# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Production Checklist

- [ ] Confirm email enabled in Supabase Auth
- [ ] RLS policies properly configured
- [ ] Environment variables set in Vercel
- [ ] Domain configured (optional)
- [ ] All 7 agents visible in dashboard
- [ ] Wake/sleep functionality working
- [ ] Chat history persists
- [ ] Work items showing

## Support

If issues arise:
1. Check Supabase Logs (Database → Logs)
2. Check Vercel Logs (Deployments → Latest)
3. Verify schema was applied correctly
4. Check browser console for errors

## Next Steps

Once deployed:
1. Create your account
2. Wake up agents
3. Start chatting
4. Monitor work progress
5. Schedule meetings

The dashboard will automatically sync with Supabase in real-time!