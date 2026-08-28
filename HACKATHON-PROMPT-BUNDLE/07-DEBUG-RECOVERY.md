# PROMPT 07 — DEBUG & FAILURE RECOVERY
## Agent: Debug Engineer
## Time Budget: Use when blocked, max 30 min per issue

---

## CONTEXT
Error: [PASTE FULL ERROR MESSAGE]
File: [file where error occurs]
What was being done: [describe the action that caused it]
Stack: [framework + runtime + versions]

---

## YOUR JOB
Diagnose and fix the error. Do not randomly rewrite. Prove the cause, patch the root, verify the fix.

---

## DEBUGGING PROTOCOL (follow in order)

### STEP 1: CLASSIFY
Which category is this error?

| Class | Symptoms |
|-------|----------|
| **Syntax** | Parser error, unexpected token |
| **Type** | TypeScript type mismatch, `undefined is not a function` |
| **Import** | Module not found, cannot resolve |
| **Runtime** | Throws during execution, null reference |
| **Config** | Missing env var, wrong path, misconfigured framework |
| **Data** | DB returns null/wrong shape, AI output unexpected |
| **Integration** | Two systems don't match contracts |
| **Environment** | Works locally, fails in build/deploy |

### STEP 2: ISOLATE
Find the smallest failing boundary:
- What is the exact line that fails?
- What value is unexpected?
- What was the value supposed to be?

### STEP 3: FORM HYPOTHESIS
Write it in one sentence: "The error occurs because [X] receives [Y] instead of [Z]."

### STEP 4: VERIFY HYPOTHESIS
Before changing code:
- Add a `console.log` or breakpoint to confirm the hypothesis
- Check the actual value vs. the expected value

### STEP 5: PATCH (minimum change)
Fix only the root cause. Do not refactor surrounding code.

### STEP 6: VERIFY FIX
- Re-run the exact same action that caused the failure
- Confirm the error is gone
- Confirm no new errors were introduced

---

## COMMON HACKATHON ERRORS & FIXES

### `Cannot read properties of undefined`
→ Null check missing. Add `?.` optional chaining or early return guard.

### `Module not found`
→ Check exact file path case (Windows ≠ Linux). Check export name matches import name.

### `Environment variable is undefined`
→ Check `.env.local` exists. Check variable name matches exactly. Restart dev server after .env change.

### `CORS error`
→ API route missing `Access-Control-Allow-Origin` header, or calling wrong URL from client.

### `Supabase: JWT expired`
→ Token not refreshed. Use `supabase.auth.getSession()` not a cached token.

### `OpenAI: 429 Rate limit`
→ Add retry with 1s delay. Switch to `gpt-4o-mini` if using `gpt-4o`.

### `Hydration mismatch (Next.js)`
→ Server and client rendering differ. Wrap in `useEffect` or use `suppressHydrationWarning`.

### `Build fails but dev works`
→ Dynamic import issue or `typeof window` needed. Check `'use client'` directive placement.

### `TypeScript error only in build`
→ Run `npx tsc --noEmit` locally. Fix types — do not use `// @ts-ignore` unless last resort.

---

## ESCALATION RULE
If an error cannot be fixed in 15 minutes:
1. Check if the feature is P0 or P1
2. If P1 — stub it, move on, come back
3. If P0 — escalate: try a different implementation approach, not the same fix repeatedly
4. Document the blocker with: error, what was tried, current workaround

## OUTPUT
- Root cause: [one sentence]
- Fix applied: [what changed and why]
- Verification: [how confirmed fixed]
- Status: `FIXED` / `WORKAROUND APPLIED` / `ESCALATED`
