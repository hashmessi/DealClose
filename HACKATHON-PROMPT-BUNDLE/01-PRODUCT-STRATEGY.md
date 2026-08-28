# PROMPT 01 — PRODUCT STRATEGY & IDEA LOCK
## Agent: Product Strategist
## Time Budget: 20 minutes max

---

## CONTEXT
**Problem Statement:** Real estate and legal professionals rely on a painful chain of 5-8 disconnected tools (CRMs, property search, offer generation, contract drafting, e-signature) to close a single deal — losing hours to copy-paste, outdated data, and zero audit trail.
**Hackathon Theme:** Theme 1 x Theme 2 Overlap — Document Automation + Next-Gen SaaS
**Team Size:** Small (1-3)
**Stack Available:** Next.js, Python (FastAPI), Xano, OpenAI GPT-4o, Nutrient DWS, Foxit PDF + eSign, SerpApi, name.com API

---

## YOUR JOB
Given the problem statement above, deliver a locked product strategy in one response. No fluff. No lengthy analysis.

## OUTPUT FORMAT (strict)

### 1. PAIN POINT (1 sentence)
Real estate agents and legal professionals waste 3-5 hours per deal manually gathering live property/market data, drafting contracts with AI that has no audit trail, and chasing clients across 4 different e-signature tools — all with zero traceability when a deal goes sideways.

---

### 2. OUR PRODUCT (1 sentence)
**DealClose** — an AI deal-workflow engine that takes a property address or legal matter as input, pulls live market intelligence via SerpApi, uses GPT-4o to draft a structured offer or contract via Nutrient DWS, routes uncertain fields to a human-in-the-loop review step, and delivers a digitally signed, auditable document — all in one linear flow, with Xano as the orchestration backend.

---

### 3. CORE USER FLOW (numbered steps)
1. **Input** — Agent types a property address (or matter description) into DealClose's clean intake form.
2. **Research** — SerpApi fetches live MLS comps, zoning info, and market trends; GPT-4o summarizes into a structured data object.
3. **Draft** — Nutrient DWS generates a fully structured offer/contract using the live data — with branching logic for contingencies, calculated fields for closing costs, no mail-merge.
4. **Human-in-the-Loop Review** — Any field flagged as uncertain (>80% AI confidence threshold not met) is surfaced to the agent for manual confirmation before the document is finalized. Nutrient provides the audit trail of what was AI-generated vs. human-verified.
5. **eSign Handoff** — Foxit eSign API sends the finalized document to buyer/seller for legally binding signature; the AI agent cannot sign — only queue and track.
6. **Close + Record** — Signed document + full audit log stored via Xano; status visible in real-time dashboard.

---

### 4. WINNING DIFFERENTIATOR
**The "Trust Pipeline" architecture** — unlike every other AI contract tool that generates text and prays, DealClose has a provable, inspectable boundary between AI work and human authorization. Nutrient provides the timestamped audit trail of AI extraction to human verification to digital signature. Judges will remember: *"The AI can draft it. Only the human can close it."* This is not a chatbot wrapper — it's a compliance-grade workflow with four sponsor APIs doing real, non-decorative work.

---

### 5. FEATURE PRIORITY MATRIX
| Feature | Impact | Build Time | Priority |
|---|---|---|---|
| SerpApi real-time property/market data pull | High | 45min | P0 |
| Nutrient DWS document generation (structured, branching) | High | 1.5hr | P0 |
| Human-in-the-loop uncertain field review UI | High | 1hr | P0 |
| Foxit eSign handoff (send for signature + status poll) | High | 1hr | P0 |
| Xano backend (workflows, DB, business logic) | High | 1hr | P0 |
| GPT-4o data structuring + contract clause generation | High | 45min | P0 |
| Audit trail viewer (AI vs human attribution) | Med | 45min | P1 |
| name.com domain search for deal/brand names (bonus) | Low | 30min | P1-optional |
| Multi-deal dashboard with status tracking | Med | 1.5hr | P2-skip |
| Perfect Corp AR property visualization | Low | 3hr | P2-skip |

> **P0 total estimate: ~6 hours of focused build.** Leaves buffer for polish and demo prep.

---

### 6. RISK FLAGS (max 3)

| Risk | Consequence | Mitigation |
|---|---|---|
| **Nutrient DWS API auth complexity during demo** | Document generation fails live — product looks broken | Pre-generate 2 demo documents during build; demo shows "cached" generation with live fields injected. Have Doctavian as fallback. |
| **SerpApi returns thin data for chosen demo address** | AI structuring step produces garbage — contract has wrong fields | Use a fixed, well-documented address for demo (e.g., famous SF property); pre-validate SerpApi output during build. |
| **Foxit eSign triggers spam filters or requires account** | Live signature demo breaks in front of judges | Use a team member's real email + phone as "buyer" for demo; test the exact eSign URL flow before demo day. |

---

### 7. TECH STACK DECISION (locked)

| Layer | Decision | Rationale |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | SSR for fast load, API routes for proxying sponsor SDKs, React for interactive review UI |
| **Backend / Orchestration** | Xano | Required for Xano prize; handles workflows, DB, auth, business logic without custom server infra |
| **Document Generation** | Nutrient DWS API | Structured generation with branching/looping logic, audit trail, digital signature support |
| **eSign Handoff** | Foxit eSign API | Human-in-the-loop signing; AI queues it, human triggers it — hits Foxit prize requirement directly |
| **Real-time Data** | SerpApi (Google Search / Real Estate results) | Grounds GPT-4o in live market data; hits SerpApi prize requirement |
| **AI / LLM** | OpenAI GPT-4o | Field extraction, clause generation, confidence scoring for HITL routing |
| **Database** | Xano DB (primary) | Deals, documents, audit logs, user sessions — all in Xano to maximize integration depth |
| **Auth** | Xano Auth (JWT) | Native to stack; no extra service needed |
| **Deployment** | Vercel (Next.js frontend) + Xano cloud | Zero-config deploy; demo-day reliable |
| **Optional Bonus** | name.com API (domain availability for deal branding) | 30-min integration; adds a 5th sponsor touch if P0 is done early |

---

### 8. SUCCESS CRITERIA FOR DEMO
**The demo must show this exact sequence live in front of judges:**
1. Type a real property address — SerpApi returns live market comps on screen (proves real-time grounding).
2. GPT-4o structures the data — Nutrient DWS renders a complete, correctly-formatted purchase offer PDF with calculated closing costs (proves non-trivial document generation).
3. Three fields are flagged as uncertain — the human reviewer confirms/edits them in the UI (proves human-in-the-loop is real, not cosmetic).
4. Click "Send for Signature" — Foxit eSign sends an actual email to a real phone in the room (proves the AI handed off, not signed).
5. Xano dashboard shows the deal, document, audit trail, and signature status in real-time (proves end-to-end connection, not mocked).

**If all 5 happen live — we win multiple prizes simultaneously.**

---

## RULES
- Be brutal about scope. Cut anything that doesn't serve the core demo moment.
- If the PS has multiple interpretations, pick the most innovative defensible one.
- Do not propose a CRUD app or a dashboard. Propose something judges remember.

---

## STRATEGIC NOTES (ENGINE OUTPUT)

### Sponsor Prize Targeting
| Sponsor | How We Win Their Prize |
|---|---|
| **Nutrient** | Document pipeline: AI extracts — human verifies uncertain fields — digitally signed. Audit trail is explicit. |
| **Foxit** | AI agent queues eSign, human triggers it. "Your Agent Shouldn't Sign That" is our literal architecture. |
| **Xano** | All business logic, DB, and orchestration lives in Xano. Not decorative — it IS the backend. |
| **SerpApi** | Live property data grounds every contract generation. Without it, the product doesn't work. |
| **Doctavian** | Optional swap for Nutrient if DWS proves complex; branching/looping logic fits perfectly. |
| **name.com** | 30-min bonus: search domain availability for the deal's brand/LLC name inside the workflow. |

### What We Are NOT Building
- A chatbot that generates contracts as markdown
- A dashboard with fake data
- A "powered by AI" label on a CRUD app
- Perfect Corp AR (saves 3+ hours for zero additional prize leverage)
- A multi-deal pipeline manager (P2-skip; kills demo focus)

### The One-Sentence Judge Hook
> *"DealClose is the first real estate workflow tool where the AI can draft every field of your contract from live market data — but legally, only you can close the deal."*
