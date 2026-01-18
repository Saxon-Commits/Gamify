# Master Testing Checklist
**Purpose:** Accumulate all testing requirements before launch  
**Last Updated:** January 19, 2026

---

## 🎯 **Pre-Launch Testing Protocol**

This checklist grows as agents add features. Before launch, test EVERYTHING here.

---

## ✅ **Core Features (Must Work)**

### Task/Quest System
- [ ] Create task (all difficulty levels)
- [ ] Complete task
- [ ] Verify XP/Gold rewards (100 XP, 25 Gold base)
- [ ] Skill multipliers apply (Greed, Momentum, etc.)
- [ ] Subtasks work
- [ ] Recurring tasks trigger correctly (daily/weekly/monthly)
- [ ] Most Wanted task grants bonus
- [ ] Delete task works
- [ ] Edit task works

### Leveling & Progression
- [ ] XP accumulates correctly
- [ ] Level up triggers at correct XP thresholds
- [ ] Skill points granted on level up
- [ ] XP curve follows Gamify Hybrid Curve (fast L1-10, steady L11-50, cap L50+)

### Skill Tree
- [ ] Can unlock skills
- [ ] Skill points deduct correctly
- [ ] Skill effects apply (test each skill)
- [ ] Scribe Master avatar unlocks
- [ ] Master Bounty Hunter avatar unlocks
- [ ] Master Blacksmith avatar unlocks

### Character Customization
- [ ] Equip avatar
- [ ] Equip armor
- [ ] Equip companion
- [ ] Equip backdrop
- [ ] Loadout displays correctly in guild

### Shop & Economy
- [ ] Buy items with gold
- [ ] Buy items with gems
- [ ] Cart adds/removes items
- [ ] Checkout works
- [ ] Gem purchases via Stripe (test mode)
- [ ] Avatar unlocks show (check if modal working)

### Guild System
- [ ] Create guild
- [ ] Join guild
- [ ] Leave guild
- [ ] Guild projects work
- [ ] Guild bounties work
- [ ] Guild chat works
- [ ] Member display shows correct loadouts
- [ ] Treasury donations work
- [ ] Invite links work

### Journal
- [ ] Create entry
- [ ] Rich text formatting works
- [ ] Word count tracks
- [ ] Skill bonuses apply (Clarity, Memory, Legacy, Golden Ink)
- [ ] Folders work

### Grindstone Timer
- [ ] Timer starts
- [ ] Timer completes
- [ ] Rewards granted
- [ ] Anti-cheat works (tab switching detection)
- [ ] Skill bonuses apply (Iron Will, etc.)

### Cloud Sync
- [ ] Auto-save works (every 10s)
- [ ] Manual save works
- [ ] Load on login works
- [ ] No data loss

### Authentication
- [ ] Sign up with Clerk
- [ ] Sign in
- [ ] Sign out
- [ ] Profile updates save

### Admin Panel
- [ ] Only admins can access
- [ ] Ban user works
- [ ] Give resources works
- [ ] Guild inspector works

---

## 🔧 **Features Modified (Test After Changes)**

### Phase 1 Cleanup (Jan 19) - Added by Gardener
- [x] Quest Log loads (no Foundations Carousel)
- [x] Task creation works (no penalty field)
- [x] Task completion works (no activity heatmap logging)

---

## 🚀 **Pre-Launch Critical Path**

**Test this flow end-to-end:**
1. New user signs up
2. Tutorial shows (if enabled)
3. Creates first task
4. Completes task
5. Levels up
6. Unlocks skill
7. Joins guild
8. Completes guild bounty
9. Buys cosmetic with gold
10. Equips cosmetic
11. Writes journal entry
12. Completes Grindstone session

**If all pass:** Ready for beta launch

---

## 📱 **Mobile Testing** (Future)

- [ ] Responsive design works on iPhone
- [ ] Responsive design works on Android
- [ ] Touch interactions work
- [ ] No horizontal scroll

---

## 🔒 **Security Testing**

From Security Guardian:
- [ ] No API keys exposed
- [ ] Stripe webhook verified
- [ ] Admin panel RBAC enforced
- [ ] No auth bypass
- [ ] Guild privacy enforced

---

## ⚡ **Performance Testing**

- [ ] Page load <3s
- [ ] App responsive (no lag on task completion)
- [ ] Large task lists load (100+ tasks)
- [ ] Guild with 50 members loads

---

## 🐛 **Bug Tracking**

**Known Issues:**
- Avatar unlock modal not showing (needs fix)
- Light mode looks awful (accepted for now)

**Fixed Issues:**
- Weapon system zombie code (cleaned up)

---

## 📝 **Agent Instructions**

**When you add/modify a feature, add tests here:**

```markdown
### [Feature Name] - Added by [Agent] (Date)
- [ ] Test requirement 1
- [ ] Test requirement 2
```

**Example:**
```markdown
### Prestige System - Added by Builder (Jan 20)
- [ ] Prestige button appears at L50+
- [ ] Costs 50,000 gold
- [ ] Resets to Level 1
- [ ] Keeps cosmetics
- [ ] Grants prestige title
- [ ] Prestige count tracks correctly
```
