---
description: Ultrathink validation - deeply analyze a plan against the codebase to identify risks, breaking changes, and gaps using subagents
allowed-tools:
  - Read
  - Grep
  - Glob
  - Task
  - Bash(find *)
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(git status *)
  - Bash(npm run build *)
  - Bash(npx tsc --noEmit *)
---

# VR - Validate Reasonableness

Ultrathink and validate the reasonableness of a plan against the actual codebase. Be deliberately skeptical. Find what will break, what was missed, and what won't work.

## Context

### Recent Changes
!`git diff --name-only HEAD~5 2>/dev/null | head -20`

### Current Branch State
!`git status --short 2>/dev/null | head -10`

### Recent Commits
!`git log --oneline -10 2>/dev/null`

### TypeScript Compilation Status
!`npm run build 2>&1 | tail -20`

### Plan Files (if any)
!`find . -name "*plan*" -type f 2>/dev/null | grep -v node_modules | head -10`

---

## Your Task

Extract the plan from the conversation context and validate it against the codebase.

**Be deliberately skeptical.** Assume the plan has flaws and find them.

---

## Phase 1: Plan Extraction

Identify from the conversation:
- What is the proposed plan?
- What files/components will be touched?
- What is the expected outcome?
- What assumptions are being made?

---

## Phase 2: Subagent Delegation

Use the Task tool to spawn relevant subagents for deep analysis:

| Subagent | Prompt | Purpose |
|----------|--------|---------|
| **Explore** | "Find all code that imports/uses [affected components]. Trace dependencies." | Discover hidden dependencies |
| **code-reviewer** | "Review [affected files] for breaking change risks if [plan changes] are made." | Identify breaking changes |
| **Plan** | "Validate architecture of [proposed approach]. What are the trade-offs?" | Check architectural soundness |

### Delegation Rules

1. Spawn subagents **in parallel** when independent
2. Wait for results before synthesis
3. Each subagent should focus on ONE aspect
4. Capture specific file:line references

---

## Phase 3: Validation Questions

For each part of the plan, systematically answer:

| Question | Focus Area |
|----------|------------|
| **Why will this NOT work?** | TypeScript errors, type mismatches, Zod schema conflicts |
| **What will BREAK?** | Existing MCP tools, API clients, type exports |
| **What was MISSED?** | Error handling, edge cases, API rate limits |
| **What TOOLS are affected?** | Direct changes, dependent tools, parameter schemas |
| **What API CHANGES are needed?** | OAuth scopes, googleapis version, new endpoints |
| **What CLIENT LIFECYCLE issues exist?** | Initialization order, null checks, connection handling |

### Deep Validation Checklist

#### Build & Type Safety
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Zod schemas validate all expected inputs
- [ ] Type imports/exports are consistent across files
- [ ] No `any` types introduced without justification
- [ ] All tool parameters have proper descriptions

#### MCP Tool Definitions
- [ ] Tool names follow existing conventions
- [ ] Parameters use correct Zod schema patterns
- [ ] Execute functions have proper error handling
- [ ] UserError thrown for client-recoverable errors
- [ ] Internal errors logged before throwing

#### Google API Client Concerns
- [ ] OAuth scopes sufficient for new functionality
- [ ] API client initialized before tool execution
- [ ] Proper null checks on client instances
- [ ] Rate limiting considered for batch operations
- [ ] API error codes translated to UserError messages

#### Dependencies & Imports
- [ ] No circular import dependencies introduced
- [ ] Helper functions imported from correct modules
- [ ] googleapis version compatibility verified
- [ ] Zod version compatibility verified

#### Error Handling
- [ ] All API calls wrapped in try/catch
- [ ] UserError for user-facing issues (404, 403)
- [ ] Internal Error for system issues
- [ ] Logging provides debugging context
- [ ] Graceful degradation where appropriate

#### Documentation & Testing
- [ ] README updated if public API changes
- [ ] CLAUDE.md reflects new capabilities
- [ ] Example usage documented in tool descriptions
- [ ] Manual testing steps identified

---

## Phase 4: Synthesis

Combine subagent findings into a concerns checklist.

---

## Output Format

```markdown
## Plan Validation Results

**Plan Summary:** [1-2 sentence summary of what's being validated]

**Verdict:** [red_circle] Critical Issues | [yellow_circle] Proceed with Caution | [green_circle] Reasonable

---

### [red_circle] Critical Concerns (Must Address Before Proceeding)

- [ ] **[Issue]**: [Description]
  - *Impact*: [What breaks if ignored]
  - *File*: `path/to/file.ts:123`
  - *Mitigation*: [How to fix]

- [ ] **[Issue]**: [Description]
  - *Impact*: [What breaks if ignored]
  - *Mitigation*: [How to fix]

---

### [orange_circle] High Risk (Should Address)

- [ ] **[Issue]**: [Description]
  - *Impact*: [Potential problem]
  - *Recommendation*: [Suggested action]

---

### [yellow_circle] Medium Risk (Consider)

- [ ] **[Issue]**: [Description]
  - *Note*: [Why this matters]

---

### [blue_circle] Low Risk (Nice to Have)

- [ ] **[Issue]**: [Minor improvement opportunity]

---

### What Was Missed

The plan did not consider:

1. **[Gap]**: [What wasn't addressed]
2. **[Gap]**: [What wasn't addressed]
3. **[Gap]**: [What wasn't addressed]

---

### MCP Tools & API Impacts

| Component | Impact | Action Needed |
|-----------|--------|---------------|
| `server.addTool()` definitions | [Add/Change/Remove] | Verify schema |
| Zod parameter schemas | [New/Modified] | Check validation |
| Helper functions | [Add/Change] | Check exports |
| API client initialization | [Modified?] | Verify lifecycle |
| OAuth scopes | [Expanded?] | Re-authorize if needed |
| googleapis calls | [New endpoints?] | Check API docs |

---

### Build & Type Verification

| Check | Status | Notes |
|-------|--------|-------|
| `npm run build` | Pass/Fail | [Errors if any] |
| `npx tsc --noEmit` | Pass/Fail | [Type errors] |
| Import resolution | Pass/Fail | [Missing imports] |
| Zod schema validation | Pass/Fail | [Schema issues] |

---

### Test Implications

- **Will fail**: [List of tests that will break]
- **Need updating**: [Tests that need modification]
- **Missing coverage**: [New code paths without tests]

---

### Recommendations

1. **Before implementing**: [Critical prep work]
2. **During implementation**: [Key considerations]
3. **After implementation**: [Validation steps]

---

### Confidence Level

| Aspect | Confidence | Notes |
|--------|------------|-------|
| Scope identification | High/Medium/Low | [Why] |
| Risk assessment | High/Medium/Low | [Why] |
| Dependency analysis | High/Medium/Low | [Why] |
```

---

## Validation Mindset

**Be the devil's advocate:**

- Assume the plan has flaws
- Look for hidden dependencies the author forgot
- Consider race conditions in API client lifecycle
- Check for breaking changes in tool parameters
- Verify backward compatibility of Zod schemas
- Consider what happens if API calls fail mid-operation
- Think about OAuth token expiration scenarios
- Question optimistic assumptions about API responses

**The goal is NOT to block progress** — it's to surface risks early so they can be addressed before they become runtime errors.

---

## TypeScript MCP Server Specific Concerns

### Common Pitfalls

| Pitfall | How to Check |
|---------|--------------|
| Missing null check on API client | Search for `await getDocsClient()` usage |
| Zod schema doesn't match API response | Compare schema to googleapis types |
| Tool parameter description unclear | Review from LLM consumer perspective |
| UserError vs internal Error confusion | Check error inheritance chain |
| Batch update index calculation errors | Verify range arithmetic |
| API field masks missing required fields | Check googleapis documentation |

### Key Files to Validate

| File | What to Check |
|------|---------------|
| `src/server.ts` | Tool definitions, client initialization |
| `src/types.ts` | Zod schemas, TypeScript types |
| `src/googleDocsApiHelpers.ts` | API helper functions |
| `src/googleSheetsApiHelpers.ts` | Sheets-specific helpers |
| `src/auth.ts` | OAuth scopes, token handling |
| `package.json` | Dependency versions |
| `tsconfig.json` | Compiler settings |

---

## Success Criteria

- [ ] Plan extracted from context
- [ ] Subagents delegated for deep analysis
- [ ] All 6 validation questions answered
- [ ] Concerns categorized by severity
- [ ] Specific file:line references provided
- [ ] Mitigation strategies suggested
- [ ] Dependencies mapped
- [ ] Build verification completed
- [ ] Clear verdict provided
