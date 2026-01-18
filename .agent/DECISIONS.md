# Design Decisions Log
**Purpose:** Record WHY we made certain choices (prevents re-litigating decisions)

Format: `## [Decision] - [Date] - [Who Decided]`

---

## Use v.any() for game state - Jan 19 - Overseer + User

**Decision:** Keep `gameState.state: v.any()` in Convex schema

**Why:**
- Rapid prototyping velocity (no schema migrations)
- Type safety maintained on frontend
- Convex queries don't need game data (just save/load)

**Trade-offs:**
- ✅ Fast development
- ❌ Can't query "all users level > 10"
- ❌ Migration complexity if we normalize later

**Alternative considered:** Normalized tables (stats, inventory, tasks separate)

**Rejected because:** Would require rewriting SyncManager and entire state flow. Defer until we need server-side queries (leaderboards).

**Status:** ACCEPTED (revisit when adding leaderboards)

---

## Remove cosmetic perks - Jan 19 - User + Design Strategist

**Decision:** Cosmetics are PURELY aesthetic (no +XP or +Gold bonuses)

**Why:**
- Prevents pay-to-win concerns
- Skill tree is ONLY source of multipliers
- Clearer game balance

**Trade-offs:**
- ✅ Fair for F2P users
- ✅ Simpler balance
- ❌ Less incentive to buy cosmetics?

**Alternative considered:** Tiered perks (cheap = aesthetic, expensive = bonuses)

**Rejected because:** Creates confusion about "stats vs cosmetics"

**Status:** APPROVED (to be implemented by Gardener)

---

## Fixed task rewards (100 XP, 25 Gold) - Jan 19 - User

**Decision:** Remove difficulty levels, use fixed base rewards

**Why:**
- Simplifies UX (one less field when creating tasks)
- Skill multipliers create variance
- Players can't "game" difficulty ratings

**Trade-offs:**
- ✅ Simpler
- ✅ Skill tree more impactful
- ❌ All tasks feel same value?

**Alternative considered:** Keep difficulty, tie to complexity

**Rejected because:** Players would always mark as EPIC to maximize XP

**Status:** APPROVED (to be implemented by Builder)

---

## Template for New Decisions

```markdown
## [Short decision title] - [Date] - [Who]

**Decision:** What we decided

**Why:** Reasoning

**Trade-offs:**
- ✅ Pros
- ❌ Cons

**Alternative considered:** What else was on the table

**Rejected because:** Why we didn't do that

**Status:** APPROVED / DEFERRED / REJECTED
```
