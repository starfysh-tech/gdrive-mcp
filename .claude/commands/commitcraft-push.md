---
description: CommitCraft automated git commit and push workflow with security scanning, conventional commits, and GitHub issue integration
allowed-tools:
  - Read
  - Edit
  - AskUserQuestion
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(git add *)
  - Bash(git commit *)
  - Bash(git push *)
  - Bash(git log *)
  - Bash(git branch *)
  - Bash(gh issue *)
  - Bash(pre-commit *)
  - Bash(.claude/scripts/commitcraft-analyze.sh)
  - Bash(.claude/scripts/commitcraft-issues.sh)
---

# CommitCraft Automated Git Workflow

Fully automated commit workflow with security scanning, conventional format, and Claude attribution.

**This command runs automatically unless there's a problem. Only stops for blockers.**

## Phase 1: Security & State Analysis

### Step 1.1: Run Analysis Script

```bash
.claude/scripts/commitcraft-analyze.sh
```

**Parse output for BLOCKERS:**

| Status | Action |
|--------|--------|
| `SECRETS_DETECTED` | STOP - Show detected patterns, require removal |
| `BEHIND_REMOTE` | STOP - Instruct `git pull --rebase origin main` |
| `MERGE_CONFLICTS` | STOP - Require manual resolution |
| `LARGE_FILES` | WARN - Note files >1000 lines, continue |
| `OK` | Continue to Step 1.2 |

### Step 1.2: GitHub Issue Validation

```bash
.claude/scripts/commitcraft-issues.sh
```

**Parse STATUS line:**

| STATUS | Action |
|--------|--------|
| `ERROR` | STOP - Show ERROR and FIX lines |
| `BLOCKED` | STOP - Show LABELS and REASON (blocked/needs-discussion/on-hold) |
| `INCOMPLETE` | PROMPT - Show unchecked items, ask to override or abort |
| `NOT_FOUND` | WARN - Issue may be closed/deleted, continue |
| `NO_ISSUE` | PROMPT - Offer: create issue / link existing / continue without |
| `OK` | Continue - Save ISSUE number for Step 5 |

Use `AskUserQuestion` for INCOMPLETE and NO_ISSUE statuses.

---

## Phase 2: Stage and Validate

### Step 2.1: Stage All Changes

```bash
git add -A
```

### Step 2.2: Run Pre-Commit Hooks

```bash
git diff --cached --name-only | xargs pre-commit run --files
```

**If hooks fail with auto-fixes:**
```bash
git add -u
```

**If hooks fail without fixes:**
STOP - Show failures, require manual fix.

---

## Phase 3: Commit Message Generation

Analyze staged changes and generate Conventional Commits format:

```
<emoji> <type>(<scope>): <subject>

<body>
```

**Type Mapping:**

| Emoji | Type | Use For |
|-------|------|---------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| style | Code style/formatting |
| refactor | Code restructuring |
| test | Test changes |
| chore | Build/auxiliary tools |
| perf | Performance |
| ci | CI/CD pipeline |

**Rules:**
- Always include emoji before type
- Scope optional: component/area affected
- Subject: imperative mood, <=50 chars
- Body: detailed description, <=72 chars/line
- Preserve existing PR references `(#123)` in subject
- Reference `CLAUDE.md` for project-specific rules

---

## Phase 4: CHANGELOG Update

Check if CHANGELOG.md exists:
```bash
[ -f CHANGELOG.md ] && echo "exists" || echo "skip"
```

**If exists:**

1. Map commit type to category:
   - `feat` -> `### Added`
   - `fix` -> `### Fixed`
   - `docs`, `refactor`, `perf`, `style`, `chore`, `test`, `ci` -> `### Changed`

2. Format entry:
   - With scope: `- **<scope>:** <subject>`
   - No scope: `- <subject>`

3. Use Edit tool to insert under `[Unreleased]` section

4. Stage CHANGELOG:
   ```bash
   git add CHANGELOG.md
   ```

---

## Phase 5: Commit and Push

### Step 5.1: Create Commit

```bash
git commit -m "$(cat <<'EOF'
<generated message>
EOF
)"
```

### Step 5.2: Push to Origin

```bash
git push origin $(git branch --show-current)
```

### Step 5.3: Update GitHub Issue

If issue was found in Phase 1 (ISSUE number saved):

```bash
gh issue comment <ISSUE_NUM> --body "$(cat <<EOF
Commit pushed: \`<COMMIT_HASH>\`

**Changes:** <COMMIT_SUBJECT>

**Branch:** \`<BRANCH_NAME>\`

---
_Automated by CommitCraft_
EOF
)"
```

**Important:** Do NOT close issues. Issues close via `fixes #X` in PR description when merged.

---

## Phase 6: Report Success

```
Committed: <commit-hash>
Pushed to: origin/<branch-name>

<commit message>
```

---

## Blocker Reference

**Hard Blockers (STOP):**
- Secrets detected in changes
- Behind remote (needs rebase)
- Merge conflicts present
- Pre-commit hooks failed (no auto-fix)
- Issue has blocking label (blocked, needs-discussion, on-hold)
- Tools not installed (pre-commit, gh CLI)

**Soft Blockers (PROMPT):**
- Issue has unchecked acceptance criteria
- No related GitHub issue found

**Warnings (NOTE, continue):**
- Large files detected (>1000 lines)
- Issue not found (may be closed)

**Everything else runs automatically.**
