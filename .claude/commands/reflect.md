---
description: Analyze chat history and Claude config to identify issues and improve CLAUDE.md instructions, commands, and settings
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash(find *)
  - Bash(ls *)
  - Bash(head *)
---

# Reflect - Claude Configuration Optimizer

You are an expert in prompt engineering, specializing in optimizing AI code assistant instructions for Claude Code. Your task is to analyze the current session and improve Claude's configuration.

## Context

### CLAUDE.md Files
!`find . -name "CLAUDE.md" -type f 2>/dev/null | grep -v node_modules | head -10`

### Claude Config Directory
!`ls -la .claude/ 2>/dev/null`

### Available Commands
!`ls .claude/commands/ 2>/dev/null | head -20`

### Current Settings
!`cat .claude/settings.json 2>/dev/null | head -40`

### Local Settings Override
!`cat .claude/settings.local.json 2>/dev/null | head -20`

## Key Files

@CLAUDE.md
@.claude/settings.json

---

## Phase 1: Analysis

Review the chat history in your context window.

Then examine the current Claude configuration:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Root project instructions |
| `**/CLAUDE.md` | Subdirectory-specific instructions |
| `.claude/commands/*.md` | Custom slash commands |
| `.claude/settings.json` | Project settings and permissions |
| `.claude/settings.local.json` | Local overrides (gitignored) |

### What to Analyze

Identify areas that could be improved:

| Category | Look For |
|----------|----------|
| **Inconsistencies** | Claude responses that contradict instructions |
| **Misunderstandings** | User requests Claude didn't interpret correctly |
| **Missing Detail** | Areas needing more specific guidance |
| **Task Handling** | Opportunities to improve specific query types |
| **Commands** | New commands or improvements to existing ones |
| **Permissions** | MCPs/tools approved locally that should be in config |
| **Anti-patterns** | Instructions that cause problematic behavior |

### Analysis Checklist

- [ ] Review chat history for friction points
- [ ] Check CLAUDE.md for unclear instructions
- [ ] Verify commands have proper allowed-tools
- [ ] Check settings.json for missing permissions
- [ ] Look for approved MCPs not yet in config
- [ ] Identify repeated user corrections

---

## Phase 2: Interaction

Present your findings and improvement ideas. For each suggestion:

### Suggestion Format

```markdown
### Issue: [Brief title]

**Current Behavior:**
[What Claude is doing now that's suboptimal]

**Proposed Change:**
[Specific modification to instructions/config]

**Expected Improvement:**
[How this change will help]

**File to Modify:**
[CLAUDE.md | .claude/commands/X.md | .claude/settings.json]
```

### Interaction Rules

1. Present one suggestion at a time
2. Wait for human feedback before proceeding
3. If approved → move to Implementation Phase
4. If rejected → refine suggestion or move to next idea
5. If unclear → ask clarifying questions

---

## Phase 3: Implementation

For each approved change:

### Implementation Format

```markdown
### Implementing: [Change title]

**File:** `[path/to/file]`

**Section:** [Section being modified]

**Before:**
```
[Current text, if modifying existing content]
```

**After:**
```
[New or modified text]
```

**Rationale:**
[How this addresses the identified issue]
```

### Implementation Rules

1. Make minimal, focused changes
2. Preserve existing functionality
3. Follow project conventions
4. Test that changes don't break other features
5. Commit changes with clear message

---

## Phase 4: Output

Present your final output in the following structure:

### Analysis

**Issues Identified:**
- [Issue 1]: [Brief description]
- [Issue 2]: [Brief description]
- [Issue 3]: [Brief description]

**Potential Improvements:**
- [Improvement 1]: [Expected benefit]
- [Improvement 2]: [Expected benefit]

---

### Improvements Applied

For each approved improvement:

#### 1. [Improvement Title]

| Attribute | Value |
|-----------|-------|
| **File** | `path/to/file` |
| **Section** | Section name |
| **Status** | Applied / Pending |

**Change:**
```
[New or modified instruction text]
```

**Impact:**
[How this addresses the identified issue]

---

### Summary

| Metric | Count |
|--------|-------|
| Issues identified | X |
| Improvements proposed | X |
| Improvements approved | X |
| Improvements applied | X |
| Files modified | X |

**Files Changed:**
- `CLAUDE.md` - [brief description of changes]
- `.claude/commands/X.md` - [brief description]
- `.claude/settings.json` - [brief description]

---

## Best Practices

### When Modifying CLAUDE.md

- Keep instructions specific and actionable
- Avoid generic "best practices" without context
- Include examples for complex patterns
- Use tables for quick reference
- Maintain consistent formatting

### When Modifying Commands

- Ensure proper YAML frontmatter
- Use specific bash permissions (not wildcards)
- Include Context section with `!` bash
- Add `@` file references for key files
- Follow factory template patterns

### When Modifying Settings

- Only add permissions that are actually needed
- Document why each permission is required
- Keep local-only settings in settings.local.json
- Test that MCP tools work after adding

---

## Goal

Enhance Claude's performance and consistency while maintaining core functionality and purpose. Be:

- **Thorough** in analysis
- **Clear** in explanations
- **Precise** in implementations
- **Conservative** in changes (minimal, focused modifications)

---

## Success Criteria

- [ ] Chat history reviewed for issues
- [ ] All config files analyzed
- [ ] Issues clearly documented
- [ ] Suggestions presented with rationale
- [ ] Human approval obtained before changes
- [ ] Changes implemented correctly
- [ ] Summary provided with metrics
