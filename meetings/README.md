# Agent Agency Meetings Archive

This folder contains all meeting transcripts and recordings from Agent Agency sessions.

## Folder Structure

```
meetings/
├── bi-daily/           # Scheduled 09:00 & 17:00 TRT standups
├── emergency/          # Ad-hoc emergency meetings
├── transcripts/        # Full conversation transcripts
└── README.md          # This file
```

## Meeting Types

### 1. Bi-Daily Standups (Scheduled)
- **Time:** 09:00 & 17:00 TRT (GMT+3)
- **Duration:** ~10-15 minutes
- **Purpose:** Status updates, task assignment, blocker resolution
- **Auto-pushed:** Yes

### 2. Emergency Meetings (Ad-hoc)
- **Called by:** Can or Garmin
- **Duration:** Variable (typically 5-15 minutes)
- **Purpose:** Critical issues, diagnostics, urgent decisions
- **Auto-pushed:** Yes

### 3. Working Sessions (As needed)
- **Duration:** Variable
- **Purpose:** Collaborative work, implementation, reviews
- **Auto-pushed:** Yes

## Naming Convention

- `YYYY-MM-DD-HHMM-type-description.md` for transcripts
- `meeting-{timestamp}.json` for structured data

## Auto-Push Configuration

All meeting files are automatically committed and pushed to GitHub after completion.

**Last Updated:** 2026-02-12
