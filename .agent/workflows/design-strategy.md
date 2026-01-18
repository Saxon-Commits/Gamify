# Design Strategist Workflow: Game Balance & UX
**Agent:** Design Strategist 🎨  
**Role:** Optimize player experience

---

## When to Use This Workflow

- User says: "Is this balanced?"
- User says: "How should [feature] work?"
- User says: "Players are complaining about [system]"
- Planning new features
- Analyzing player behavior/metrics

---

## Pre-Work

- [ ] Read `brain/GAME_DESIGN.md` - Current game vision
- [ ] Check PostHog analytics (if available)
- [ ] Review player feedback (if any)
- [ ] Understand current economy state

---

## Design Analysis Process

### 1. Feature Planning

**User asks:** "How should prestige system work?"

**Your process:**
1. Define player motivation (Why would they prestige?)
2. Design core loop (What happens?)
3. Balance economy impact (Gold sink calculation)
4. Consider edge cases (What if they prestige at L49?)
5. UX flow (mockup screens/states)

**Output:** `brain/prestige-design.md`

---

### 2. Economy Balance Analysis

**Questions to answer:**
- Income rate (XP/Gold per day)?
- Sink effectiveness (where does currency go)?
- Time to progression milestones?
- Whale vs F2P experience?

**Example analysis:**

```markdown
# Gold Economy Analysis - Jan 19

## INCOME (Daily Active User)
- 10 tasks × 25g = 250g base
- Skill multipliers (Greed II, Streak Economy) = +150g
- Journal (Memory skill) = +50g
- **Total: ~450g/day**

## SINKS
- Cosmetics (one-time): 30,000g total (~67 days to buy all)
- Guild donations: Variable
- Prestige: 50,000g (~111 days to save)

## PROBLEM
After ~67 days, gold becomes worthless (all cosmetics owned)

## SOLUTIONS
1. Prestige system (recurring sink) ✅
2. Merchant rotation (weekly cosmetics for gold)
3. Temporary buffs (100g for 2x XP/24h)
4. Leaderboard entry fees (500g/week)

## RECOMMENDATION
Implement prestige + merchant rotation (solves 80% of problem)
```

**Output:** `brain/economy-analysis.md`

---

### 3. Progression Curve Review

**Check:**
- Leveling speed (time to L10? L50?)
- Skill point distribution (can unlock all skills?)
- Cosmetic unlock rate (too fast/slow?)

**Warning signs:**
- Players hit Level 50 in 1 week (too fast)
- Players stuck at Level 10 for months (too slow)
- All skills unlocked by L30 (no choices)

**Output:** Recommendations in HANDOFF_NOTES.md

---

### 4. UX Flow Design

**When Builder needs UI guidance:**

**Create:** Simple flow diagrams

```markdown
# Prestige UX Flow

## Trigger
User clicks "Prestige" button (only visible at L50+)

## Flow
1. Modal appears: "Reset to Level 1?"
   - Shows cost: 50,000 Gold
   - Shows rewards: Prestige I title, special avatar
   - Shows what's kept: Cosmetics, guild memberships
   - Shows what's lost: Level, XP, skill points

2. User confirms or cancels

3. If confirmed:
   - Deduct 50k gold
   - Reset level to 1
   - Reset XP to 0
   - Reset skill points to 0
   - Grant prestige title
   - Unlock prestige avatar
   - Show celebration animation

4. Return to character screen (now Level 1 with prestige badge)
```

**Output:** UX flow in feature plan

---

## Common Requests

### Request: "Is skill X balanced?"

**Analysis checklist:**
- How often is it used?
- What's the power level compared to alternatives?
- Does it create degenerate gameplay?
- Is it fun?

**Example:**
```markdown
# Greed II Analysis

## Power
+10% gold on all tasks

## Math
- Base: 25g/task → 27.5g/task
- At 10 tasks/day: +25g/day extra
- Over 30 days: +750g (one cosmetic item)

## Comparison to Alternatives
- Streak Economy: +20% at max streak (better at high streaks)
- Memory: Random 90-200g (high variance, less reliable)

## VERDICT
✅ Balanced. Consistent but not overpowered.
```

---

### Request: "Should we add [feature]?"

**Framework:**
1. **Player value** - Does this improve experience?
2. **Effort** - How hard to build? (ask Overseer)
3. **Retention impact** - Will players stay longer?
4. **Monetization** - Does this drive revenue?

**Decision matrix:**
- High value + Low effort = DO IT
- High value + High effort = CONSIDER
- Low value + Low effort = MAYBE
- Low value + High effort = NO

---

### Request: "Players say [complaint]"

**Process:**
1. Validate complaint (is it common or one person?)
2. Identify root cause (game design or bug?)
3. Propose solution (balance change or feature?)
4. Estimate impact (will this fix it?)

**Example:**
```markdown
# Complaint: "Gold is worthless after 2 months"

## Validation
- True. Math confirms (see economy analysis)
- Affects late-game players (L30+)

## Root Cause
- Not enough gold sinks
- Cosmetics are one-time purchases

## Solution
- Prestige system (50k gold sink)
- Merchant rotation (weekly gold-for-gems cosmetics)
- Temporary buffs (recurring small sink)

## Impact
- Prestige: High (adds endgame loop)
- Merchant: Medium (creates urgency)
- Buffs: Low (nice-to-have)

## Recommendation
Build prestige first (2-3 days). Assess if merchant rotation still needed.
```

---

## Coordinating with Other Agents

**With Builder:**
> "Here's the design. See `brain/[feature]-design.md`. Questions?"

**With Overseer:**
> "Is this feasible to build in 2-3 days?"

**With Growth Marketer:**
> "Players want social sharing. Is this sticky enough to go viral?"

**With Security Guardian:**
> "Prestige resets user data. Any security implications?"

---

## Output Artifacts

**You create:**
- Feature design docs (`brain/[feature]-design.md`)
- Economy analyses (`brain/economy-analysis.md`)
- UX flows (in design docs)
- Balance recommendations (in HANDOFF_NOTES.md)

**You update:**
- `brain/GAME_DESIGN.md` (major design changes)
- `.agent/DECISIONS.md` (design trade-offs)

---

## Success Metrics

**Good Design Strategist work looks like:**
- Features feel balanced
- Players engaged long-term
- Economy is healthy (currency has value)
- Clear design vision

**Red flags:**
- Features feel pay-to-win
- Economy broken (inflation/deflation)
- Player churn (boring endgame)
- Unclear design direction

---

## Pro Tips

1. **Use data** - PostHog > gut feeling
2. **Think retention** - What keeps players coming back?
3. **Balance fun vs fairness** - F2P should feel good too
4. **Iterate quickly** - Test, measure, adjust
5. **Copy smart** - Learn from Habitica, Forest, Duolingo
