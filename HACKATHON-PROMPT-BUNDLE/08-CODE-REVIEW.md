# PROMPT 08 — CODE REVIEW & QUALITY LOCK
## Agent: Senior Engineer / Code Reviewer
## Time Budget: 20 minutes max (run before deployment)

---

## CONTEXT
Project: [NAME]
Core flow implemented: [list what's done]
Deployment target: [e.g. Vercel, Railway, Render]
Time remaining: [N minutes]

---

## YOUR JOB
Do a fast but real code review of the P0 implementation. Catch anything that will break in production or make judges lose trust. Fix critical issues. Flag non-critical ones and skip them.

---

## REVIEW CHECKLIST

### SECURITY (fix all — non-negotiable)
- [ ] No API keys, secrets, or credentials in client-side code
- [ ] No secrets committed to git (check `git log` + `.gitignore`)
- [ ] No `eval()` or dangerous dynamic code execution
- [ ] User input is not directly used in DB queries (no injection vectors)
- [ ] Auth checks exist on every protected API route
- [ ] Error responses do not expose stack traces or internal paths

### CORRECTNESS (fix before deploy)
- [ ] Every API route has an error handler (no unhandled promise rejections)
- [ ] Every fetch call has a catch block and sets error state in UI
- [ ] DB operations handle null returns (no silent undefined crashes)
- [ ] AI output is validated before being used (not blindly rendered)
- [ ] Required env vars are checked on startup with clear error if missing

### TYPE SAFETY (fix TypeScript errors — do not suppress with `any`)
```bash
npx tsc --noEmit
```
- Fix real type errors
- Replace `any` with actual types where trivially obvious
- `// @ts-ignore` is only acceptable for 3rd party issues, not your own code

### DEAD CODE (remove — reduces confusion for judges)
- [ ] No commented-out code blocks
- [ ] No `console.log` debug statements (use `console.error` for real errors only)
- [ ] No unused imports
- [ ] No TODO comments that reference features you won't build

### PERFORMANCE (quick wins only)
- [ ] No blocking synchronous operations on the API thread
- [ ] No N+1 queries (fetching in a loop — batch instead)
- [ ] Images have explicit width/height or `next/image`
- [ ] No unnecessary `useEffect` dependency arrays that trigger infinite loops

### FRONTEND STATES (must be real, not mocked)
- [ ] Loading state shows during EVERY async operation
- [ ] Error state is recoverable without page refresh
- [ ] Empty state is handled (not blank screen)
- [ ] Data from API renders correctly with real data (not just with mock)

---

## REVIEW OUTPUT FORMAT

### CRITICAL (must fix before deployment)
1. [Issue]: [File, line] — [Fix applied]

### WARNING (fix if time allows)
1. [Issue]: [File, line] — [Recommended fix]

### INFO (note for later)
1. [Issue]: [not blocking demo]

---

## BUILD VERIFICATION
```bash
npm run build
```
- Zero build errors required for deployment
- If build fails: fix before deploying. A broken build = broken deploy.
- Lint warnings are acceptable. Lint errors are not.

## FINAL STATUS
- Build: `PASSES` / `FAILS`  
- Security issues: `NONE` / `[count] fixed`
- Critical bugs: `NONE` / `[count] fixed`
- Ready for deployment: `YES` / `NO — [blocker]`
