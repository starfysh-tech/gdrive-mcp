#!/usr/bin/env bash
# CommitCraft Pre-Commit Analysis for TypeScript/Node.js
# Gathers context before creating a commit (sync status, security, npm checks)

set -euo pipefail

OUTPUT_FILE="${1:-/dev/stdout}"

{
    echo "== GIT PRE-COMMIT ANALYSIS =="
    echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # Branch & Sync Status
    echo "## Branch & Sync Status"
    echo "----"

    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
    echo "Branch: $CURRENT_BRANCH"

    [ "$CURRENT_BRANCH" = "HEAD" ] && echo "WARNING: Detached HEAD state"

    git fetch origin --quiet 2>/dev/null || echo "Could not fetch from remote"

    BEHIND=0
    AHEAD=0
    TRACKING_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{upstream} 2>/dev/null || echo "")

    if [ -z "$TRACKING_BRANCH" ]; then
        echo "WARNING: No tracking branch set"
        git status -sb
    else
        git status -sb
        AHEAD_BEHIND=$(git rev-list --left-right --count HEAD...@{upstream} 2>/dev/null || echo "0	0")
        AHEAD=$(echo "$AHEAD_BEHIND" | cut -f1)
        BEHIND=$(echo "$AHEAD_BEHIND" | cut -f2)

        [ "$BEHIND" -gt 0 ] && echo "BLOCKER: $BEHIND commits BEHIND - run: git pull --rebase"
        [ "$AHEAD" -gt 0 ] && echo "Info: $AHEAD commits ahead"
    fi
    echo ""

    # Working Tree Status
    echo "## Working Tree Status"
    echo "----"

    PORCELAIN=$(git status --porcelain 2>/dev/null)
    if [ -z "$PORCELAIN" ]; then
        echo "No changes (working tree clean)"
    else
        git status --porcelain
    fi

    STAGED=$(git diff --cached --stat 2>/dev/null)
    UNSTAGED=$(git diff --stat 2>/dev/null)
    UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)

    echo ""
    [ -n "$STAGED" ] && echo "Staged:" && git diff --cached --stat
    [ -z "$STAGED" ] && echo "No staged changes"
    echo ""

    # Security Scan
    echo "## Security Scan"
    echo "----"

    SECRETS=$(git diff --cached 2>/dev/null | grep -iE "password|secret|api_key|token|credential|private_key" || true)
    if [ -z "$SECRETS" ]; then
        echo "OK: No obvious secrets detected"
    else
        echo "WARNING: POTENTIAL SECRETS DETECTED:"
        echo "$SECRETS"
    fi
    echo ""

    # TypeScript/Node.js Checks
    echo "## TypeScript/Node.js Checks"
    echo "----"

    # Check for sensitive files
    SENSITIVE_FILES=$(git diff --cached --name-only 2>/dev/null | grep -E '(\.env|credentials\.json|token\.json|\.pem|\.key)$' || true)
    if [ -n "$SENSITIVE_FILES" ]; then
        echo "CRITICAL: Sensitive files found (should not be committed):"
        echo "$SENSITIVE_FILES"
    else
        echo "OK: No sensitive config files"
    fi

    # Check for node_modules or dist accidentally staged
    NODE_MODULES=$(git diff --cached --name-only 2>/dev/null | grep -E '^(node_modules/|dist/)' || true)
    if [ -n "$NODE_MODULES" ]; then
        echo "WARNING: Build artifacts or dependencies staged:"
        echo "$NODE_MODULES"
    else
        echo "OK: No node_modules or dist files staged"
    fi

    # Check TypeScript compilation if tsconfig exists
    if [ -f "tsconfig.json" ] && command -v npx &> /dev/null; then
        if npx tsc --noEmit 2>/dev/null; then
            echo "OK: TypeScript compiles without errors"
        else
            echo "WARNING: TypeScript compilation has errors - run: npm run build"
        fi
    fi
    echo ""

    # Recent Commits
    echo "## Recent Commits"
    echo "----"
    git log --oneline -5 2>/dev/null || echo "No commit history"
    echo ""

    # Actions
    echo "## Actions Required"
    echo "----"
    [ "$BEHIND" -gt 0 ] && echo "BLOCKER: git pull --rebase"
    [ -n "$UNSTAGED" ] && echo "Stage changes: git add <files>"
    [ -n "$UNTRACKED" ] && echo "Review untracked files"
    [ -n "$SECRETS" ] && echo "REVIEW SECRETS before committing"
    echo ""
    echo "== END =="

} > "$OUTPUT_FILE"

exit 0
