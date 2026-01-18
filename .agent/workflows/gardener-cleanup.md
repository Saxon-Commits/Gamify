# Gardener Workflow: Code Cleanup & Refactoring
**Agent:** Gardener 🌱  
**Role:** Keep codebase healthy

---

## When to Use This Workflow

- User says: "Clean up [code]"
- User says: "Refactor [component]"
- User says: "Remove [zombie code]"
- After Builder ships feature (polish phase)
- Executing `PRUNING_PLAN.md`

---

## Pre-Work Checklist

- [ ] Read `.agent/CURRENT_WORK.md` - Is Builder actively developing?
- [ ] Read `brain/PRUNING_PLAN.md` - Is this part of the plan?
- [ ] Confirm NO active development on files you'll touch

**Golden Rule:** Never refactor while Builder is developing. Wait for IDLE.

---

## Step-by-Step Process

### 1. Identify Scope (10 minutes)

**What to do:**
- Pick ONE cleanup task (don't boil ocean)
- List exact files involved
- Estimate time (be conservative)

**Examples of good scope:**
- ✅ "Extract constants from useGameStore.ts"
- ✅ "Remove cosmetic perks from all items"
- ✅ "Consolidate Guild types into types/guild.ts"

**Examples of bad scope:**
- ❌ "Refactor entire codebase"
- ❌ "Make everything perfect"

---

### 2. Update CURRENT_WORK.md

```markdown
## 🌱 Gardener
**Status:** ACTIVE
**Working on:** [Cleanup task]
**Files locked:** [List files]
**Started:** [Time]
**Expected completion:** [Time]
```

---

### 3. Execute Cleanup

**Methodical approach:**
1. Make ONE type of change at a time
2. Test after EACH change
3. Commit after EACH change
4. Don't add features (just clean up)

**Example sequence:**
```bash
# Step 1: Extract constants
git commit -m "[Gardener] Extract PRESTIGE_COST constant"

# Step 2: Add JSDoc
git commit -m "[Gardener] Document prestige() function"

# Step 3: Remove dead code
git commit -m "[Gardener] Remove unused prestigeLevel prop"
```

---

### 4. Testing Protocol

**After each change:**
- [ ] TypeScript compiles (`npm run build`)
- [ ] No new console errors
- [ ] Core features still work (spot check)

**Don't skip testing!** Refactors can introduce subtle bugs.

---

### 5. Handoff to Overseer

**Update HANDOFF_NOTES.md:** ⚠️ **MANDATORY - DO NOT SKIP**

```markdown
## Gardener → Overseer ([Date])

Completed cleanup: [task name]

**Changes made:**
- [List changes]

**Files modified:**
- [List files]

**Testing done:**
- TypeScript: ✅
- Manual testing: ✅
- No regressions found

**Notes:**
- [Any observations or follow-up suggestions]
- [Anything incomplete or deferred]
```

**Update `.agent/MASTER_TESTING.md`:**
```markdown
### [Cleanup Name] - Modified by Gardener ([Date])
- [x] Test that removed feature doesn't break app
- [ ] Retest affected features: [list]
```

**⚠️ CRITICAL:** If you skip handoff notes, your work is INCOMPLETE. Overseer cannot review what they don't know about.

Ensures cleanup doesn't break existing functionality.

---

### 6. Update CURRENT_WORK.md

```markdown
**Status:** COMPLETE
**Notes:** Cleanup done, verified working
```

---

## Common Cleanup Tasks

### Task: Extract Constants

**Before:**
```typescript
if (gold >= 50000) {
  prestige();
}
```

**After:**
```typescript
// constants/gameConstants.ts
export const PRESTIGE_COST = 50000;

// usage
if (gold >= PRESTIGE_COST) {
  prestige();
}
```

---

### Task: Add JSDoc Comments

**Before:**
```typescript
const completeTask = (taskId: string) => {
  // ... 200 lines of code
}
```

**After:**
```typescript
/**
 * Completes a task and calculates rewards with skill modifiers.
 * 
 * @param taskId - ID of task to complete
 * 
 * Applies 15+ skill node effects including:
 * - Greed I/II (gold bonuses)
 * - Momentum (first task bonus)
 * - Speed Run (time pressure)
 * - etc.
 * 
 * @critical Test thoroughly after any skill tree changes
 */
const completeTask = (taskId: string) => {
  // ... 200 lines of code
}
```

---

### Task: Consolidate Types

**Before:**
```typescript
// Guild.tsx
interface MemberLoadout {
  id: string;
  name: string;
  // ...
}

// Guildmembers Panel.tsx
interface GuildMember {
  _id: string;
  userName: string;
  // ... (same fields, different names!)
}
```

**After:**
```typescript
// types/guild.ts
export interface GuildMemberDisplay {
  id: string;
  name: string;
  // ... (ONE source of truth)
}

// Both files import this
```

---

### Task: Remove Dead Code

**Protocol:**
1. Search for all usages (`grep -r "functionName"`)
2. Verify 0 usages
3. Delete
4. Test TypeScript compilation
5. If breaks, revert immediately

---

## Pruning Plan Execution

When executing `brain/PRUNING_PLAN.md`:

**Phase-by-phase:**
1. Read entire phase in pruning plan
2. Execute ONE deletion at a time
3. Test after EACH deletion
4. Document in HANDOFF_NOTES.md
5. Only proceed to next phase when current phase 100% verified

**Never rush pruning.** One broken deletion cascades.

---

## Output Artifacts

**You create:**
- `constants/` folder files
- Type definition files (`types/guild.ts`)
- Documentation (JSDoc comments)
- Cleaned-up code files

**You update:**
- `.agent/HANDOFF_NOTES.md` (what you cleaned)
- `brain/PRUNING_PLAN.md` (mark phases complete)

---

## Success Metrics

**Good Gardener work looks like:**
- Codebase easier to navigate
- No regressions introduced
- Technical debt decreases
- Other agents thank you for cleanup

**Red flags:**
- Introduced bugs (test more!)
- Refactored code Builder is using (coordination fail)
- Over-engineered simple cleanup (KISS principle)

---

## Pro Tips

1. **Small commits** - Every logical cleanup is one commit
2. **Test obsessively** - Refactors break things
3. **Don't feature-creep** - If you see a feature idea, note it for Builder
4. **Coordinate timing** - Work when Builder is idle
5. **Document findings** - If you spot tech debt, note in HANDOFF_NOTES for Overseer
