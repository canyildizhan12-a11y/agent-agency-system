#!/bin/bash
# Auto-push meetings to GitHub
# Run this after every meeting

cd /home/ubuntu/.openclaw/workspace/agent-agency

# Add all meeting files
git add meetings/

# Check if there are changes
if git diff --cached --quiet; then
    echo "No changes to push"
    exit 0
fi

# Commit with timestamp
git commit -m "Add meeting recordings - $(date '+%Y-%m-%d %H:%M TRT')"

# Push to GitHub
git push origin master

echo "Meetings pushed to GitHub"
