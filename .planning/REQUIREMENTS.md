# DealClose — v1 Requirements

## v1 Requirements

### Intake & Workflow Trigger

- [ ] **INTAKE-01**: User can enter a property address into the intake form and initiate a new deal workflow
- [ ] **INTAKE-02**: System validates the address input before sending to SerpApi (non-empty, basic format check)
- [ ] **INTAKE-03**: User can see workflow progress status (Research → Draft → Review → Sign)

### Research & Data Grounding

- [ ] **RESEARCH-01**: System fetches live market comps, property details, and neighborhood data from SerpApi given a property address
- [ ] **RESEARCH-02**: Raw SerpApi response is displayed to the user for transparency before AI processing
- [ ] **RESEARCH-03**: System handles SerpApi errors gracefully (rate limit, no results) with a clear user message

### AI Structuring

- [ ] **AI-01**: GPT-4o processes raw SerpApi data and produces a typed deal data object (asking price, comps, zoning, closing cost estimate) with a per-field confidence score (0–100)
- [ ] **AI-02**: Fields with confidence score below threshold (85%) are tagged for HITL routing
- [ ] **AI-03**: AI structuring errors or timeouts are surfaced to the user without crashing the workflow

### Document Generation

- [ ] **DOC-01**: Nutrient DWS generates a complete, formatted purchase offer PDF using the structured deal data object
- [ ] **DOC-02**: Generated PDF uses branching logic (e.g., financing contingency present/absent based on data)
- [ ] **DOC-03**: Generated PDF includes calculated fields (closing cost total, offer price breakdown)
- [ ] **DOC-04**: PDF is viewable inline before the human review step

### Human-in-the-Loop Review

- [ ] **HITL-01**: All AI-tagged uncertain fields are displayed in a review UI with the AI-suggested value and a field for human correction
- [ ] **HITL-02**: Human can accept, edit, or override each flagged field before document finalization
- [ ] **HITL-03**: Document is not finalized until the human explicitly submits the review step
- [ ] **HITL-04**: Audit log records: field name, AI-suggested value, final value, whether human changed it, timestamp

### eSign Handoff

- [ ] **SIGN-01**: After human review, a "Send for Signature" action is available — only triggerable by the human agent, never by AI automation
- [ ] **SIGN-02**: Foxit eSign sends the finalized PDF to the buyer/seller email address provided
- [ ] **SIGN-03**: Signature request status (sent / opened / signed) is visible in the deal dashboard
- [ ] **SIGN-04**: AI agent cannot programmatically trigger the eSign send — it can only prepare and queue

### Backend & Orchestration (Xano)

- [ ] **BACKEND-01**: All deal state (intake → research → draft → review → signed) is persisted in Xano
- [ ] **BACKEND-02**: Xano stores document metadata, audit log entries, and signature status
- [ ] **BACKEND-03**: Deal workflow status is queryable and returned to the frontend in real-time
- [ ] **BACKEND-04**: A single pre-seeded agent account is used for demo (no full auth flow required for v1)

---

## v2 Requirements (Deferred)

- Full user authentication and multi-agent account management
- Multi-deal pipeline dashboard with Kanban/list view
- Deal history and searchable audit log browser
- PDF annotation or in-browser editing after generation
- Mobile-responsive layout
- Bulk deal processing (multiple properties in one session)
- name.com domain availability search for LLC naming (bonus, if P0 done early → promote to P1)

---

## Out of Scope

| Item | Reason |
|---|---|
| Perfect Corp AR/virtual try-on | 3+ hours build, zero prize leverage for this product domain |
| Doctavian integration (primary) | Redundant with Nutrient DWS; only use as fallback if DWS fails |
| Custom PDF renderer | Nutrient DWS handles this — no reason to build custom |
| Stripe/payment integration | Not a transactional product in v1 |
| Real MLS API (RESO/Spark) | SerpApi approximates this sufficiently for hackathon; full MLS requires broker agreements |
| Email notification system | Foxit eSign handles the email; no separate mailer needed |

---

## Traceability

*(Filled by roadmap agent — maps REQ-IDs to phases)*

| REQ-ID | Phase | Notes |
|---|---|---|
| INTAKE-01–03 | Phase 1 | |
| RESEARCH-01–03 | Phase 1 | |
| AI-01–03 | Phase 2 | |
| DOC-01–04 | Phase 2 | |
| HITL-01–04 | Phase 3 | |
| SIGN-01–04 | Phase 3 | |
| BACKEND-01–04 | Phase 1–3 (cross-cutting) | |
