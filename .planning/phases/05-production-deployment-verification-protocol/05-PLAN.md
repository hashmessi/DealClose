# Phase 5: Production Deployment & Verification Protocol

## Goal
Deploy DealClose to target production platform (Vercel / Node.js runtime) and execute a rigorous 8-step verification protocol across all runtime, API, AI, document, and state boundaries before submission.

---

## Scope & Requirements Covered
- **DEVOPS-01:** Next.js 16 production build verification with 0 errors / 0 warnings.
- **DEVOPS-02:** Environment variables & secrets setup guide (`.env.example`, `SETUP.md`).
- **DEVOPS-03:** Live endpoint health checks (`/api/test/connections`, `/api/deal/audit`).
- **DEVOPS-04:** 8-Step verification runbook (`VERIFY.md`) covering the complete end-to-end user journey.
- **DEVOPS-05:** Pre-pitch warm-up checklist and LRU cache pre-seeding.

---

## Tasks

### 1. Pre-Deployment Configuration Audit
- [x] Verify `next.config.ts` has proper server external packages & environment mappings.
- [x] Verify `.env.example` lists all required and optional API keys with fallback explanations.
- [x] Verify API route error handling and abort signals (no unhandled promises or crashes).

### 2. Deployment Documentation & Runbooks
- [x] Create `SETUP.md` with Vercel zero-config and Docker standalone instructions.
- [x] Create `VERIFY.md` with explicit 8-step verification matrix and runbook commands.

### 3. Post-Deployment Verification
- [x] Step 1: Verify production build (`npm run build` exits with code 0).
- [x] Step 2: Verify application startup (`curl -I http://localhost:3000`).
- [x] Step 3: Verify frontend UI rendering & theme tokens.
- [x] Step 4: Verify health check endpoints (`GET /api/test/connections`).
- [x] Step 5: Verify state persistence and audit certificate generation (`GET /api/deal/audit`).
- [x] Step 6: Verify SerpApi intake endpoint (`POST /api/deal`).
- [x] Step 7: Verify AI structuring and fallback chain (`POST /api/ai/extract`).
- [x] Step 8: Execute full primary user journey end-to-end.

---

## Verification Criteria
- [x] TypeScript compiles cleanly (`npx tsc --noEmit` exit 0).
- [x] All 9 Next.js App Router routes compile to static/dynamic bundles.
- [x] Zero console errors during full 5-stage pipeline run.
- [x] Deployment guide (`SETUP.md`) and verification runbook (`VERIFY.md`) created in project root.
