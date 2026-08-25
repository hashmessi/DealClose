# DealClose — Roadmap

**Milestone 1:** MVP — Hackathon Demo Build
**Granularity:** Coarse (3–4 phases, demo-driven)
**Parallelization:** Yes (independent plans within phases run simultaneously)
**Mode:** YOLO

---

## Phase Structure

| # | Phase | Goal | Requirements | Est. Time |
|---|---|---|---|---|
| 1 | Foundation & Data Pipeline | Scaffold Next.js + Xano backend, wire SerpApi data pull end-to-end | INTAKE-01–03, RESEARCH-01–03, BACKEND-01, 04 | ~2.5hr |
| 2 | AI Structuring + Document Generation | GPT-4o field extraction with confidence scoring + Nutrient DWS PDF generation | AI-01–03, DOC-01–04, BACKEND-02 | ~2.5hr |
| 3 | Human Review + eSign Handoff | HITL review UI + Foxit eSign integration + full deal audit trail | HITL-01–04, SIGN-01–04, BACKEND-03 | ~2hr |
| 4 | Demo Polish + Integration Validation | End-to-end smoke test with real demo address, error state handling, UI polish | All cross-cutting | ~1hr |

**Total P0 estimate: ~8 hours.** Demo must be bulletproof before submission.

---

## Phase 1: Foundation & Data Pipeline

**Goal:** User can enter a property address, trigger a deal, and see live SerpApi market data on screen — all persisted in Xano.

**Requirements covered:**
- INTAKE-01: Property address intake form
- INTAKE-02: Input validation
- INTAKE-03: Workflow progress status indicator
- RESEARCH-01: SerpApi data fetch (comps, property details, neighborhood)
- RESEARCH-02: Raw data display transparency
- RESEARCH-03: SerpApi error handling
- BACKEND-01: Deal state persistence in Xano
- BACKEND-04: Single pre-seeded demo account

**Success criteria:**
1. User types a property address → form validates and submits without error
2. SerpApi returns real market comps and property data (not mocked) — visible on screen within 5 seconds
3. Raw API response is shown to user for transparency
4. New deal record with status "research_complete" is created in Xano DB
5. Error states (bad address, SerpApi timeout) display a clear message, not a crash

**Plans:**
1. Next.js 14 project scaffold + Xano workspace setup + environment config (SerpApi key, Xano base URL, OpenAI key)
2. Xano: deal table schema + REST endpoint to create and update deal state
3. Next.js: intake form component + SerpApi proxy API route + data display component

---

## Phase 2: AI Structuring + Document Generation

**Goal:** GPT-4o converts raw SerpApi data into a typed deal object with confidence scores, and Nutrient DWS generates a complete, formatted purchase offer PDF.

**Requirements covered:**
- AI-01: GPT-4o structured extraction with per-field confidence scores
- AI-02: Fields below threshold (85%) tagged for HITL routing
- AI-03: AI error handling
- DOC-01: Nutrient DWS PDF generation from deal data
- DOC-02: Branching logic in document (contingencies)
- DOC-03: Calculated fields (closing costs)
- DOC-04: PDF viewable inline
- BACKEND-02: Document metadata stored in Xano

**Success criteria:**
1. Given SerpApi data for a known address, GPT-4o returns a typed JSON deal object with confidence scores for each field (offer price, comps used, contingency type, closing cost breakdown)
2. At least 2 fields are reliably tagged as "uncertain" for the demo address (confidence < 85%)
3. Nutrient DWS generates a complete PDF with the correct offer price, calculated closing costs, and contingency branch selected
4. PDF renders inline in the browser without download prompt
5. Nutrient API errors (auth fail, rate limit) are caught and display a fallback message

**Plans:**
1. GPT-4o integration: system prompt for structured deal extraction + confidence scoring schema + Next.js API route
2. Nutrient DWS integration: document template design + API authentication + field mapping from deal object + PDF generation endpoint
3. Xano: store document URL/metadata + update deal status to "draft_complete"

---

## Phase 3: Human Review + eSign Handoff

**Goal:** Uncertain fields surface in a review UI for human confirmation, the finalized document is sent via Foxit eSign, and the full audit trail is recorded.

**Requirements covered:**
- HITL-01: Uncertain field review UI
- HITL-02: Human can accept/edit/override each flagged field
- HITL-03: Document not finalized until human submits review
- HITL-04: Audit log with AI value vs. final value + timestamp
- SIGN-01: "Send for Signature" action (human-only trigger)
- SIGN-02: Foxit eSign sends PDF to buyer/seller email
- SIGN-03: Signature status visible in deal view
- SIGN-04: AI cannot programmatically trigger eSign
- BACKEND-03: Real-time deal status queryable from Xano

**Success criteria:**
1. Uncertain fields display in a side-by-side UI (AI suggestion | human input field) — user can accept or override each
2. Submit button is disabled until all flagged fields are resolved
3. After human review submission, Nutrient DWS re-generates the final PDF with human-confirmed values
4. Audit log entry created for each field: {field, ai_value, final_value, changed_by_human: bool, timestamp}
5. "Send for Signature" button triggers Foxit eSign API — real email arrives at team member's inbox within 60 seconds
6. Deal status in Xano updates to "signature_sent" — visible in the UI without page refresh

**Plans:**
1. HITL review UI component: flagged field list, accept/override controls, submit gate
2. Audit log: Xano table + write endpoint + display in deal view
3. Foxit eSign integration: API auth + document send endpoint + status poll webhook/polling

---

## Phase 4: Demo Polish & Integration Validation

**Goal:** The full end-to-end demo flow works flawlessly with the chosen demo address. Error states are handled. UI is presentable to judges.

**Requirements covered:** All cross-cutting polish and validation

**Success criteria:**
1. Full demo flow runs without interruption using the pre-validated demo address (see Risk Register)
2. All 5 demo success criteria pass in a dry run
3. Error states (bad address, API failure) show user-friendly messages, not stack traces
4. UI is clean enough for a live judge demo (no placeholder text, no console errors, no layout breaks)
5. Foxit eSign flow tested with real email 24h before submission

**Plans:**
1. End-to-end smoke test with real demo address — identify and fix any broken API calls
2. Error boundary implementation across all API routes
3. UI polish pass: typography, loading states, empty states, responsive layout
4. Pre-warm demo: seed a completed deal in Xano for fallback if live flow stalls

---

## STATE.md Reference

Current phase: **1 (Not started)**
Last completed phase: None
Blocked: No

---

## Requirement Coverage Check

All 21 P0 requirements mapped:

| Phase | REQ-IDs | Count |
|---|---|---|
| Phase 1 | INTAKE-01, 02, 03, RESEARCH-01, 02, 03, BACKEND-01, 04 | 8 |
| Phase 2 | AI-01, 02, 03, DOC-01, 02, 03, 04, BACKEND-02 | 8 |
| Phase 3 | HITL-01, 02, 03, 04, SIGN-01, 02, 03, 04, BACKEND-03 | 9 |
| Phase 4 | All cross-cutting | — |

**Coverage: 100% of P0 requirements mapped ✓**
