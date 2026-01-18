# Agent Coordination System
**Last Updated:** January 19, 2026

This folder coordinates work between 6 AI agents helping build XP Focus. Read this FIRST before starting any work.

## 📚 Quick Start

1. **Check CURRENT_WORK.md** - What's happening right now?
2. **Read HANDOFF_NOTES.md** - Any messages from other agents?
3. **Pick your workflow** - See `workflows/` for your role
4. **Update CURRENT_WORK.md** - Log what you're doing
5. **Leave HANDOFF_NOTES.md** - Tell next agent what you did

## 🤖 The 6 Agents

| Agent | Role | Use When |
|-------|------|----------|
| **Builder** 🔨 | Feature development | Adding features, fixing bugs |
| **Gardener** 🌱 | Code cleanup | Refactoring, documentation, debt |
| **Overseer** 👁️ | Quality assurance | Reviews, audits, planning |
| **Security Guardian** 🛡️ | Security & compliance | Stripe, API keys, auth |
| **Design Strategist** 🎨 | Game balance & UX | Economy, progression, retention |
| **Growth Marketer** 📈 | Audience & marketing | Social media, launch, community |

## 📋 File Ownership (Primary Responsibility)

**Builder owns:**
- `pages/`, `components/`, `convex/`
- Active development work

**Gardener owns:**
- `src/utils/`, `types.ts`, constants
- Code organization

**Overseer owns:**
- `brain/` artifacts
- `.agent/` coordination docs

**Security Guardian owns:**
- `convex/auth.config.ts`, `convex/users.ts`
- `.env` audits

**Design Strategist owns:**
- `GAME_DESIGN.md`
- `src/utils/GameEconomy.ts`, `SkillTreeUtils.ts`

**Growth Marketer owns:**
- `marketing/` folder
- Landing page copy

**⚠️ Ownership = Responsibility, NOT Restriction**
- Any agent can read ANY file
- Any agent can edit ANY file
- Ownership just means "who's accountable for quality here"
- Example: Builder edits GameEconomy.ts → Should notify Design Strategist via HANDOFF_NOTES.md

## 🔄 Daily Workflow

### Morning
1. Read CURRENT_WORK.md
2. Read HANDOFF_NOTES.md
3. Pick today's agent role

### During Work
1. Follow your workflow (see `workflows/`)
2. Update CURRENT_WORK.md when starting
3. Commit frequently with `[Agent Name]` prefix

### Evening
1. Update HANDOFF_NOTES.md if work continues tomorrow
2. Mark CURRENT_WORK.md as complete or blocked
3. Commit final changes

## 🚨 Conflict Resolution

**If two agents need same file:**
1. Check CURRENT_WORK.md first
2. Coordinate via HANDOFF_NOTES.md
3. Sequential work (not parallel)
4. Tag commits with agent name

**Example:**
```markdown
# HANDOFF_NOTES.md
## Builder → Gardener (Jan 19)
I'm working on prestige system in useGameStore.ts today.
Don't touch that file until tomorrow.
```

## 📁 Folder Structure

```
.agent/
├── README.md (this file)
├── CURRENT_WORK.md
├── HANDOFF_NOTES.md
├── DECISIONS.md
├── security/
├── workflows/
└── templates/
```

## 🎯 Success Criteria

You're doing it right when:
- ✅ No merge conflicts
- ✅ Fast feature velocity
- ✅ Decreasing technical debt
- ✅ No security incidents
- ✅ Clear agent accountability

## 💡 Pro Tips

1. **Read before you write** - Check CURRENT_WORK.md and HANDOFF_NOTES.md first
2. **Tag everything** - Git commits, file edits, all tagged with agent name
3. **Over-communicate** - When in doubt, leave a note in HANDOFF_NOTES.md
4. **Sequential > Parallel** - Coordinate timing to avoid conflicts
5. **Ownership clarifies** - When something breaks, we know who reviews it
