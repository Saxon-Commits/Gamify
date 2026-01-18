# Security Guardian Workflow: Security & Compliance Audit
**Agent:** Security Guardian 🛡️  
**Role:** Protect sensitive data

---

## When to Use This Workflow

- User says: "Is this secure?"
- User says: "Check Stripe integration"
- User says: "Review API keys"
- Before launching new auth/payment features
- Monthly security audits

---

## Pre-Work

- [ ] Understand what's being audited (specific feature or full audit?)
- [ ] Read relevant code (auth, payments, admin panel)
- [ ] Check previous audits (`.agent/security/`)

---

## Security Audit Process

### 1. API Key & Secrets Scan

**Check these locations:**
- `.env` files (should be gitignored)
- `App.tsx` (Clerk keys)
- `convex/` files (Stripe keys)
- `package.json` (no secrets here)

**Verify:**
- [ ] No hardcoded secrets
- [ ] .env in .gitignore
- [ ] Publishable keys OK (Clerk, Stripe publishable)
- [ ] Secret keys in environment variables only

**Output:** `.agent/security/api-keys-audit.md`

---

### 2. Stripe Integration Review

**Check:** `convex/users.ts`

**Verify:**
- [ ] Webhook signature verification enabled
- [ ] Price IDs not secret (hardcoded OK per DECISIONS.md)
- [ ] Payment flow server-side (not client-manipulatable)
- [ ] User can't modify purchase amount
- [ ] Gem grants are server-side only

**Common vulnerabilities:**
```typescript
// ❌ BAD - Client can modify amount
const amount = req.body.amount; // User controls this!

// ✅ GOOD - Server defines amount
const amount = PRICE_PACKS.find(p => p.id === priceId).amount;
```

**Output:** `.agent/security/stripe-audit.md`

---

### 3. Authentication Flow Review

**Check:** `App.tsx`, `convex/auth.config.ts`

**Verify:**
- [ ] Clerk properly initialized
- [ ] Protected routes use authentication
- [ ] Admin panel checks user role
- [ ] No auth bypass possible

**Test:**
- Try accessing admin panel without login
- Try accessing admin with non-admin account
- Verify Convex queries require auth

**Output:** `.agent/security/auth-audit.md`

---

### 4. Admin Panel Access Control

**Check:** `convex/admin.ts`, `pages/Admin.tsx`

**Verify:**
- [ ] RBAC enforced (role-based access control)
- [ ] Only admins can access admin functions
- [ ] Admin actions logged
- [ ] No SQL injection vectors (N/A for Convex)

**Test scenarios:**
```typescript
// Try these as non-admin user:
- bannedUser() mutation
- giveResources() mutation
- getAllGuilds() query

// Should all fail with "Permission denied"
```

**Output:** `.agent/security/admin-audit.md`

---

### 5. Data Privacy Check

**Verify:**
- [ ] User emails not exposed publicly
- [ ] Guild chat not leaked to non-members
- [ ] Private projects stay private
- [ ] User stats only visible to user (or guild if opted in)

**GDPR Compliance:**
- [ ] User can delete account?
- [ ] User data export available?
- [ ] Privacy policy exists?
- [ ] Cookie consent (if EU users)?

**Output:** `.agent/security/privacy-audit.md`

---

## Monthly Security Checklist

Location: `.agent/security/SECURITY_CHECKLIST.md`

**Update monthly:**
```markdown
# Security Checklist - [Month Year]

## API Keys & Secrets
- [x] No exposed secrets (audited Jan 19)
- [x] .env gitignored
- [x] Clerk keys safe (publishable only)

## Payments (Stripe)
- [x] Webhook verification enabled
- [x] Server-side gem grants
- [x] No client price manipulation

## Authentication
- [x] Clerk properly configured
- [x] Protected routes enforced
- [x] Admin panel RBAC working

## Data Privacy
- [ ] GDPR compliance (needs privacy policy)
- [x] User data not leaked
- [x] Guild privacy working

## Vulnerabilities
- [ ] No XSS vectors found
- [ ] No auth bypass found
- [ ] No payment exploits found

## Actions Needed
1. Create privacy policy (legal, not urgent)
2. Add account deletion flow (GDPR requirement)
```

---

## Handling Security Issues

### CRITICAL (Fix immediately)
- Exposed API secret keys
- Authentication bypass
- Payment amount manipulation
- Data leak (emails, passwords)

**Protocol:**
1. Create `.agent/security/CRITICAL-[date].md` with details
2. Immediately notify user (don't wait)
3. Suggest temporary mitigation (take feature offline?)
4. Hand to Builder for emergency fix

---

### MAJOR (Fix this week)
- Missing webhook verification
- Weak admin access control
- GDPR compliance gaps

**Protocol:**
1. Document in `.agent/security/issues.md`
2. Add to HANDOFF_NOTES.md for Builder
3. Set deadline (this week)

---

### MINOR (Fix when convenient)
- Hardcoded non-secret configs
- Missing rate limiting
- Audit logging gaps

**Protocol:**
1. Document in `.agent/security/backlog.md`
2. Prioritize with Overseer
3. Assign to Builder or Gardener

---

## Common False Alarms

**Not actually security issues:**

✅ **Clerk publishable key in code**
- This is INTENDED for client-side use
- Document why it's safe

✅ **Stripe Price IDs hardcoded**
- Not secret (just product SKUs)
- Per DECISIONS.md, this is accepted

✅ **ConvexURL publicly visible**
- Convex deployment URLs are public
- Auth handled by Clerk tokens

---

## Output Artifacts

**You create:**
- `.agent/security/` audit reports
- `.agent/security/SECURITY_CHECKLIST.md` (monthly)
- Critical issue alerts (rare, hopefully!)

**You update:**
- `DECISIONS.md` (when accepting security trade-offs)
- `HANDOFF_NOTES.md` (security fixes needed)

---

## Success Metrics

**Good Security Guardian work looks like:**
- No security incidents
- Clear audit trails
- Fast response to critical issues
- Balanced paranoia (secure but not blocking)

**Red flags:**
- False alarms (crying wolf)
- Slow audits (blocking launches)
- Missing real vulnerabilities
- Over-engineering security (KISS principle)

---

## Pro Tips

1. **Automate where possible** - Use `git-secrets` to scan commits
2. **Trust but verify** - Even secure-looking code needs audits
3. **Document decisions** - Why something is safe (prevents re-audits)
4. **Stay updated** - Follow Stripe/Clerk security advisories
5. **Think like attacker** - How would you exploit this?
