#!/bin/bash
# Auto-Generated Agent Briefing
# Purpose: Extract current status from CURRENT_WORK.md and HANDOFF_NOTES.md
# Usage: ./briefing.sh > BRIEFING.md

AGENT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "# 🎯 Agent Briefing (Auto-Generated)"
echo ""
echo "> Generated: $(date '+%b %d, %I:%M %p')"
echo ""

# Extract Builder Status from CURRENT_WORK.md
echo "## 🔨 Current Assignment"
echo ""

# Get Builder section (lines between "## 🔨 Builder" and next "---")
awk '/## 🔨 Builder/,/^---$/' "$AGENT_DIR/CURRENT_WORK.md" | grep -E "^\*\*" | head -6

echo ""
echo "---"
echo ""

# Extract Last Handoff from HANDOFF_NOTES.md
echo "## 📡 Last Transmission"
echo ""

# Get first handoff entry (between first "##" and first "---")
awk '/^## [^#]/, /^---$/ {print; if (/^---$/) exit}' "$AGENT_DIR/HANDOFF_NOTES.md" | head -20

echo ""
echo "---"
echo ""

# Quick Status Summary
echo "## ⚡ Quick Reference"
echo ""

# Extract just the active task name
TASK=$(grep "^\*\*Working on:" "$AGENT_DIR/CURRENT_WORK.md" | head -1 | sed 's/\*\*Working on:\*\* //')
STATUS=$(grep "^\*\*Status:" "$AGENT_DIR/CURRENT_WORK.md" | head -1 | sed 's/\*\*Status:\*\* //')

echo "- **Active Task:** $TASK"
echo "- **Status:** $STATUS"

# Look for instruction files mentioned in CURRENT_WORK
INSTRUCTIONS=$(grep "brain/" "$AGENT_DIR/CURRENT_WORK.md" | head -1 | sed 's/.*`\(brain\/[^`]*\)`.*/\1/')
if [ ! -z "$INSTRUCTIONS" ]; then
    echo "- **Instructions:** \`$INSTRUCTIONS\`"
fi

echo ""
echo "---"
echo ""
echo "_Read this briefing instead of CURRENT_WORK + HANDOFF_NOTES to save ~3,000 tokens_"
