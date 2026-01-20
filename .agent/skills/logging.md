# Skill: Logger
Description: Logs development progress to Notion with token usage tracking. Choose the right mode based on task scope to optimize token efficiency.

---

## 📊 Token Cost Guide
| Mode | Typical Cost | When to Use |
|------|-------------|-------------|
| **Micro Log** | ~100 tokens | Trivial updates, single-line fixes |
| **Daily Log** | ~1,500 tokens | Normal feature work, bug fixes |
| **Deep Audit** | ~8-15K tokens | Major milestones, refactors, security reviews |

> [!WARNING]
> **Deep Audits are expensive!** Reserve for important milestones, not routine changes.

---

## Commands

### 1. **Micro Log** (NEW - Ultra Compact)
- **Trigger:** "Micro log this", "Quick note"
- **Purpose:** Minimal logging for trivial changes (just file + one-liner)
- **Token Cost:** ~100
- **Run Script:**
  ```bash
  .venv/bin/python .tools/logger.py \
    --mode "Micro Log" \
    --summary "{one_line_summary}" \
    --files "{file_list}" \
    --next "{optional_next_step}" \
    --tokens {token_int}
  ```
- **Requirements:**
  - `summary`: One sentence describing the change
  - `file_list`: Comma-separated files
  - `token_int`: INTEGER ONLY (e.g., 100)
  - `next`: Optional next step

---

### 2. **Quick Save** (Daily Log)
- **Trigger:** "Log this", "Quick save", "Update dev log"
- **Purpose:** Track normal development sessions
- **Token Cost:** ~1,500
- **Run Script:**
  ```bash
  .venv/bin/python .tools/logger.py \
    --mode "Daily Log" \
    --summary "{summary}" \
    --files "{file_list}" \
    --next "{next_steps}" \
    --tokens {token_int}
  ```
- **Requirements:**
  - `summary`: 2 sentences on what changed
  - `file_list`: Comma-separated modified files
  - `next_steps`: One clear action item for next session
  - `token_int`: INTEGER ONLY (e.g., 1500)

---

### 3. **Deep Audit** (Comprehensive Analysis)
- **Trigger:** "Run audit", "Deep dive", "Audit [type]"
- **Purpose:** In-depth codebase analysis for major changes
- **Token Cost:** ~8-15K (varies by audit type)
- **Run Script (Multiple Options):**

#### Option A: Short Body (Simple)
```bash
.venv/bin/python .tools/logger.py \
  --mode "Deep Audit" \
  --summary "{summary}" \
  --files "{file_list}" \
  --impact "{impact_areas}" \
  --audit-type "{audit_type}" \
  --tokens {token_int} \
  --body "{short_audit_report}"
```

#### Option B: Long Body via File (Recommended for detailed audits)
```bash
# 1. Write audit to temp file
cat > /tmp/audit.md << 'EOF'
## Detailed Analysis
...your long audit report...
EOF

# 2. Pass file path
.venv/bin/python .tools/logger.py \
  --mode "Deep Audit" \
  --summary "{summary}" \
  --files "{file_list}" \
  --impact "{impact_areas}" \
  --audit-type "{audit_type}" \
  --tokens {token_int} \
  --body-file /tmp/audit.md
```

#### Option C: stdin (Best for shell escaping issues)
```bash
echo "Your audit content with (special) chars!" | \
.venv/bin/python .tools/logger.py \
  --mode "Deep Audit" \
  --summary "{summary}" \
  --files "{file_list}" \
  --impact "{impact_areas}" \
  --audit-type "{audit_type}" \
  --tokens {token_int} \
  --body-stdin
```

- **Requirements:**
  - `summary`: High-level overview
  - `file_list`: Comma-separated files analyzed
  - `impact_areas`: YOU determine. Choose from: **Game Economy, UI/UX, Backend, Tech Debt, Marketing, Analytics**
  - `audit_type`: Choose from: **Security, Performance, Architecture, Full** (prefixes summary in Notion)
  - `token_int`: INTEGER ONLY (e.g., 12000)
  - `audit_report`: Detailed findings (see format below)

**Audit Report Format:**
```markdown
## 1. Critical Issues
- Bullet point issues

## 2. Performance/Security Concerns
- Findings

## 3. Code Smells
- Technical debt items

## 4. Recommendations
- IMMEDIATE: Quick wins
- STRATEGIC: Medium-term fixes
- LONG-TERM: Architecture changes
```

---

## 🎯 Audit Type Presets

Use `--audit-type` to focus your analysis and save tokens:

| Type | Focus Areas | Token Cost |
|------|-------------|------------|
| **Security** | API keys, auth, XSS, CSRF, exposed secrets | ~8K |
| **Performance** | Re-renders, bundle size, memory leaks, slow queries | ~10K |
| **Architecture** | State management, code organization, tech debt | ~12K |
| **Full** | Everything (comprehensive review) | ~15K |

**Example:**
```bash
--audit-type "Security"  # Summary becomes: "[Security] API key exposure audit"
```

---

## 💡 Best Practices

### When to Use Each Mode:
- **Micro Log:** Typo fixes, single-line changes, config tweaks
- **Daily Log:** Feature additions, bug fixes, normal refactoring
- **Deep Audit:** 
  - Before/after major refactors
  - Security reviews before deployment
  - Weekly/monthly comprehensive checks
  - End of sprint milestone reviews

### Token Efficiency Tips:
1. **Batch related changes** into one log instead of logging each file separately
2. **Use Micro Log** for trivial updates (saves ~1,400 tokens vs Daily Log)
3. **Reserve Deep Audits** for meaningful milestones (don't audit every PR)
4. **Focused audits** (`--audit-type`) save 5-7K tokens vs Full audit

### Body Input Strategy:
- **Short bodies (<500 chars):** Use `--body "text"`
- **Medium bodies (500-2000 chars):** Use `--body-file /tmp/audit.md`
- **Long bodies (>2000 chars):** Use `--body-file` (auto-chunks to fit Notion limit)
- **Special characters:** Use `--body-stdin` to avoid shell escaping

---

## 🔧 Technical Details

**Smart Chunking:**
- Logger automatically splits bodies >1800 chars into multiple Notion paragraph blocks
- No more 2000-character limit errors!

**Error Handling:**
- If body append fails, page is still created (prevents duplicates)
- Clear error messages distinguish page creation vs body append failures

**Available Columns in Notion:**
- Name, Type, Files Changed, Impact Areas, Dev Mode Flags
- Summary, Next Steps, Status, Token Cost