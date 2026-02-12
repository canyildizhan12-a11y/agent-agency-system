# Dashboard UX Fixes - Task Assignment
**Called by:** Henry (Team Lead)  
**Issues to Fix:** 3 items  
**Time:** 18:06 TRT

## Issue 1: Chat Error 🔧
**Error:** "required option '-m, --message <text>' not specified"  
**Assigned to:** 🔍 **Scout** + 🏗️ **Codex**

**Task:**
- Scout: Check `/api/chat` endpoint
- Find where CLI is being called instead of proper API
- Codex: Fix the chat handler to use correct message passing
- Test chat functionality

---

## Issue 2: Meeting Room Visuals 🎨
**Issue:** Meeting room "kinda ugly"  
**Assigned to:** 🎨 **Pixel**

**Task:**
- Redesign office floor layout
- Better agent positioning (not just absolute positioning)
- Visual polish (shadows, gradients, animations)
- Make it look like a real modern meeting room

---

## Issue 3: Sleep/Wake Button Logic 💤
**Issues:**
- No "Go to Sleep" button when agents are working
- Shows "Wake Up" even when agents are already awake  
**Assigned to:** 💾 **Echo** + 🏗️ **Codex**

**Task:**
- Fix button logic to show correct state:
  - Sleeping → "Wake Up" button
  - Awake/Working → "Go to Sleep" button
- Add sleep functionality to API
- Update UI state management

---

**Timeline:** 30 minutes for all fixes
**Report back when done**
