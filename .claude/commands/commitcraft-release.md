---
description: CommitCraft automated release workflow - semantic versioning, CHANGELOG generation, and GitHub release creation
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash(git rev-parse *)
  - Bash(git status *)
  - Bash(git log *)
  - Bash(git tag *)
  - Bash(git push *)
  - Bash(git add *)
  - Bash(git commit *)
  - Bash(gh auth *)
  - Bash(gh release *)
  - Bash(.claude/scripts/*)
---

# CommitCraft Automated Release Workflow

Fully automated semantic versioning, CHANGELOG generation, and GitHub release creation.

**This command runs automatically unless there's a problem. Only stops for blockers.**

## Context

### Branch Check
!`git rev-parse --abbrev-ref HEAD`

### Working Tree Status
!`git status --porcelain`

### GitHub CLI Status
!`gh auth status 2>&1 | head -5`

### Last Tag
!`git describe --tags --abbrev=0 2>/dev/null || echo "NO_TAGS"`

### Commits Since Last Tag
!`git log $(git describe --tags --abbrev=0 2>/dev/null || echo "HEAD~10")..HEAD --oneline 2>/dev/null | head -20`

## Your Task

Execute the CommitCraft release workflow. **Only stop for blockers listed below.**

---

### Step 1: Check for Blockers

Run analysis script and check for blockers:
```bash
.claude/scripts/commitcraft-release-analyze.sh
```

**BLOCKERS (STOP immediately):**

| Blocker | Message | Resolution |
|---------|---------|------------|
| Not on main | Releases must be from main branch | `git checkout main` |
| No gh CLI | GitHub CLI not found | `brew install gh` |
| Not authenticated | GitHub CLI not authenticated | `gh auth login` |
| Uncommitted changes | Working tree dirty | Commit or stash changes |
| No commits | No commits since last release | Nothing to release |

**NON-BLOCKERS (continue):**
- No existing tags -> First release (v1.0.0)

**If NO blockers -> Continue automatically.**

---

### Step 2: Extract Version Information

Parse analysis script output:
- **Current version**: e.g., `v3.1.0` (or none for first release)
- **New version**: e.g., `v3.2.0` (or `v1.0.0` for first)
- **Bump type**: major/minor/patch

**Version Bump Rules:**

| Condition | Bump | Example |
|-----------|------|---------|
| `BREAKING CHANGE` in commit body | **Major** | v2.0.0 -> v3.0.0 |
| Has `feat:` commits | **Minor** | v2.0.0 -> v2.1.0 |
| Has `fix:` commits only | **Patch** | v2.0.0 -> v2.0.1 |
| Other commits only | **Patch** | v2.0.0 -> v2.0.1 |
| First release | N/A | v1.0.0 |

---

### Step 3: Generate Release Notes

Get commits since last tag:
```bash
git log <LAST_TAG>..HEAD --format="%H|%s|%b" --no-merges
```

**Categorize by conventional commit type:**

```markdown
## Breaking Changes

<Commits with BREAKING CHANGE in body - include description>

## Features

<feat: commits>

## Bug Fixes

<fix: commits>

## Documentation

<docs: commits>

## Other Changes

<chore:, refactor:, test:, style:, perf:, ci: commits>
```

**Format rules:**
- Strip type prefix and emoji from subject
- Preserve scope as bold: `feat(api): add endpoint` -> `**api:** Add endpoint`
- For breaking changes, extract description from commit body
- Only include non-empty sections

---

### Step 4: Auto-Update CHANGELOG.md

**Read current CHANGELOG.md and update:**

1. Find `## [Unreleased]` section

2. Insert new version section after `## [Unreleased]`:
   ```markdown
   ## [Unreleased]

   ## [<NEW_VERSION>] - <YYYY-MM-DD>

   ### Added
   <feat: commits>

   ### Fixed
   <fix: commits>

   ### Changed
   <refactor:, perf: commits>

   ### Documentation
   <docs: commits>

   ### Other
   <chore:, test:, ci: commits>
   ```

3. Clear `## [Unreleased]` section (leave header, remove entries)

4. Commit CHANGELOG:
   ```bash
   git add CHANGELOG.md
   git commit -m "docs: update CHANGELOG for <NEW_VERSION>"
   ```

**Note:** Only include sections with content.

---

### Step 5: Create Git Tag

Create annotated tag:
```bash
git tag -a <NEW_VERSION> -m "<NEW_VERSION>"
```

Example:
```bash
git tag -a v3.2.0 -m "v3.2.0"
```

---

### Step 6: Push Tag

Push tag to origin:
```bash
git push origin <NEW_VERSION>
```

---

### Step 7: Create GitHub Release

Create release with generated notes:
```bash
gh release create <NEW_VERSION> \
  --title "<NEW_VERSION> - <BRIEF_SUMMARY>" \
  --notes "$(cat <<'EOF'
<GENERATED_RELEASE_NOTES>
EOF
)"
```

**Title format:**
- Extract 1-3 main topics from feat/fix commits
- Example: `v3.2.0 - Release Automation & Bug Fixes`

---

### Step 8: Report Success

```
Updated CHANGELOG.md
Committed: docs: update CHANGELOG for <NEW_VERSION>
Created tag: <NEW_VERSION>
Pushed to: origin
Published release: <RELEASE_URL>

Release Summary:
- Breaking Changes: <count>
- Features: <count>
- Bug Fixes: <count>
- Other: <count>
```

---

## Blocker Summary

**Only stop for these issues:**

| Blocker | Action |
|---------|--------|
| Not on main branch | Stop, show current branch |
| GitHub CLI missing | Stop, show install command |
| GitHub CLI not authenticated | Stop, show auth command |
| Uncommitted changes | Stop, show git status |
| No commits since last release | Stop, nothing to release |

**Everything else runs automatically without user interaction.**

---

## CHANGELOG Format

Keep It a Changelog format (https://keepachangelog.com):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [3.2.0] - 2025-01-07

### Added
- New feature description

### Fixed
- Bug fix description

### Changed
- Change description

## [3.1.0] - 2025-01-01
...
```

---

## Release Notes Format

GitHub release body format:

```markdown
## Breaking Changes

- **scope:** Description of breaking change

## Features

- **scope:** New feature description
- Another feature without scope

## Bug Fixes

- **scope:** Bug fix description

## Documentation

- Documentation update

## Other Changes

- Refactoring, tests, chores
```

---

## Deployment

**Releases do not trigger automatic deployment.**

After creating a release:
1. Verify the release on GitHub
2. Follow manual deployment procedures
3. Tag-based deployments remain under team control

---

## Success Criteria

- [ ] On main branch
- [ ] Working tree clean
- [ ] GitHub CLI authenticated
- [ ] Commits exist since last tag
- [ ] Version bump calculated correctly
- [ ] CHANGELOG.md updated and committed
- [ ] Git tag created (annotated)
- [ ] Tag pushed to origin
- [ ] GitHub release published
- [ ] Release notes categorized correctly
