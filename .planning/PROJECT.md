# DealClose — Project Context

## What This Is

**DealClose** is an AI-powered real estate deal workflow engine built for the DevNetwork [API + Cloud + AI] Hackathon 2026. It solves the trust gap in AI-generated legal documents by implementing a provable "Trust Pipeline" architecture: AI drafts, humans authorize, and every step is auditable.

The product takes a property address as input, pulls live market intelligence (SerpApi), generates a fully-structured purchase offer PDF (Nutrient DWS), flags uncertain AI-generated fields for human review, then hands the finalized document to Foxit eSign for legally-binding signature. Xano serves as the orchestration backend for all workflows, business logic, and storage.

**Hackathon:** DevNetwork [API + Cloud + AI] Hackathon 2026 (Aug 17 – Sep 3, 2026)
**Demo Date:** September 2–3, 2026 — Santa Clara Convention Center
**Team Size:** Small (1–3)

---

## Problem Being Solved

### Core Problem
Real estate agents and legal professionals waste 3–5 hours per deal manually gathering live property/market data, drafting contracts with AI tools that produce no audit trail, and chasing clients across 4 different disconnected e-signature tools — with zero traceability when a deal goes wrong.

### Problem Deconstruction

**Who experiences it:**
- Primary: Real estate agents closing residential/commercial property deals
- Secondary: Legal professionals handling contract-heavy workflows (leases, offers, NDAs)
- Both are regulated professionals who need compliance-grade documentation trails

**What job they're trying to accomplish:**
- Go from "I have a buyer interested in this property" to "signed offer in buyer's/seller's hands" in under 30 minutes
- Currently requires: CRM lookup → property research (Zillow/Redfin/MLS) → contract template → manual data fill → send for review → chase signature

**What makes it difficult:**
- Live market data is siloed in property search tools, not in contract tools
- AI contract generators produce markdown text, not structured, legally-formatted PDFs with calculated fields
- No single tool handles research → draft → human review → signature in one flow
- No audit trail: when a contract has an error, there's no record of what AI generated vs. what a human confirmed

**Root Cause:**
The existing tool ecosystem was built in silos — data tools don't talk to document tools, document tools don't talk to signing tools. AI has been bolted on top of each silo independently, creating a "Frankenstein stack" with no coherent workflow.

**High-Value User:**
Independent real estate agent or small brokerage team that closes 10–50 deals/year — too small for enterprise workflow software, too active to waste hours on manual admin per deal.

**Measurable Desired Outcome:**
- Time from "property address input" to "signature request sent" < 5 minutes
- Zero manual data entry between research, drafting, and signing
- Full audit trail showing AI-generated fields vs. human-verified fields

---

## Core Value

The single most important thing DealClose must do:

> **Take a property address → produce a fully-drafted, human-reviewed, ready-to-sign offer document in one unbroken workflow.**

If the demo shows this working end-to-end in front of judges, we win.

---

## Sponsor Prize Strategy

| Sponsor | Role in Product | Prize Vector |
|---|---|---|
| **Nutrient DWS** | Structured PDF generation with branching logic, calculated fields, digital signature + audit trail | Primary — "Turn Documents Into Something People Actually Trust" |
| **Foxit eSign** | Human-only signature handoff; AI queues, human triggers | Primary — "Your Agent Shouldn't Sign That" |
| **Xano** | Entire backend: workflows, DB, auth, deal state, audit logs | Primary — "Rebuild a SaaS Tool You Hate" |
| **SerpApi** | Real-time property/market data grounding — product doesn't function without it | Primary — "Best AI Use Case" |
| **Doctavian** | Backup for Nutrient if DWS integration proves complex | Secondary |
| **name.com** | Domain availability search for deal brand/LLC naming | Bonus P1 (30 min) |

---

## Requirements

### Validated

(None yet — greenfield build)

### Active

**P0 — Non-negotiable for demo:**
- [ ] INTAKE-01: User can input a property address and trigger the deal workflow
- [ ] RESEARCH-01: System fetches live market comps and property data via SerpApi
- [ ] AI-01: GPT-4o structures raw SerpApi data into a typed deal data object with confidence scores per field
- [ ] DOC-01: Nutrient DWS generates a complete, formatted purchase offer PDF using structured deal data (with branching logic for contingencies, calculated closing costs)
- [ ] HITL-01: Fields where AI confidence is below threshold are surfaced to the human agent for review/edit before document is finalized
- [ ] HITL-02: Audit trail records which fields were AI-generated vs. human-confirmed (with timestamps)
- [ ] SIGN-01: Foxit eSign sends the finalized document to buyer/seller email for legally-binding signature
- [ ] SIGN-02: AI cannot trigger the signature — only the human agent can initiate the send
- [ ] BACKEND-01: Xano handles all deal state, document metadata, audit logs, and user sessions
- [ ] BACKEND-02: Deal status (drafted / under review / sent for signature / signed) is visible in real-time

**P1 — Ship if P0 complete with time remaining:**
- [ ] AUDIT-01: Full audit trail viewer showing AI attribution vs. human confirmation per field
- [ ] DOMAIN-01: name.com domain search for deal-related brand/LLC naming (30 min integration)

### Out of Scope

- Multi-deal dashboard with pipeline kanban — kills demo focus, add post-hackathon
- Perfect Corp AR property visualization — 3+ hours for zero additional prize leverage
- Doctavian integration (unless Nutrient DWS fails) — don't build two document pipelines
- User authentication/auth flows — demo uses a single pre-seeded agent account
- PDF annotation or editing after generation — out of scope for v1 workflow
- Mobile app — web only

---

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Nutrient DWS over Doctavian as primary document generator | Nutrient's audit trail + digital signature capabilities match the "regulated industry trust" problem better; Doctavian is backup | Pending validation |
| Xano as backend (not FastAPI/custom) | Required for Xano prize; no infra overhead; handles auth+DB+workflows natively | Locked |
| SerpApi as data grounding layer | Real-time property data is the core differentiator that makes AI drafting trustworthy; no other free-tier alternative matches it | Locked |
| Foxit eSign for signature handoff only (not PDF generation) | Foxit's prize is specifically about the human-in-the-loop handoff pattern, not document creation | Locked |
| GPT-4o for field extraction + confidence scoring | Needed for structured JSON output with per-field confidence scores that power the HITL routing | Locked |
| Next.js 14 frontend | SSR for fast load, API routes for proxying sponsor SDKs without CORS issues, React for interactive HITL review UI | Locked |
| Coarse phasing (3-5 phases) | Hackathon timeline; each phase must ship a demoable slice | Locked |

---

## Tech Stack (Locked)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend / Orchestration | Xano (workflows + DB + auth) |
| Document Generation | Nutrient DWS API |
| eSign Handoff | Foxit eSign API |
| Real-time Data | SerpApi |
| AI / LLM | OpenAI GPT-4o |
| Deployment | Vercel (frontend) + Xano cloud |
| Bonus | name.com API (if time allows) |

---

## Constraints

- **Timeline:** Hackathon ends Sep 3, 2026. Demo is live in front of judges — no grace period.
- **No fallback to fake data in demo:** Every API call must be real or the judges will ask questions we can't answer.
- **SerpApi must use a pre-validated demo address:** We pick a specific property address before demo day and confirm SerpApi returns rich data for it.
- **Foxit eSign must use a real email in the room:** A team member acts as "buyer" — we pre-test the exact eSign URL flow.
- **P0 is ~6 hours of build time.** Do not start P1 until all P0 features are working end-to-end.

---

## Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Nutrient DWS auth or rate limits fail during demo | High | Pre-generate 2 cached demo documents; inject live fields. Doctavian on standby. |
| SerpApi returns thin data for demo property address | High | Use a fixed, famous address pre-validated during build. Never demo on unknown addresses. |
| Foxit eSign triggers spam filter / requires recipient account | High | Use team member email+phone. Test exact URL flow 24h before demo. |
| Xano workflow latency > 5s visible in demo | Med | Pre-warm all Xano endpoints before judge session. |
| GPT-4o structured output hallucination in critical fields | Med | Set confidence threshold conservatively (>85%) — more fields go to HITL review, which is also a feature we're demoing. |

---

## Demo Success Criteria

The demo **must** show this exact sequence live:

1. Type real property address → SerpApi returns live market comps on screen
2. GPT-4o structures data → Nutrient DWS renders complete purchase offer PDF with calculated closing costs
3. 3 fields flagged as uncertain → human reviewer confirms/edits in the UI (proves HITL is real, not cosmetic)
4. Click "Send for Signature" → Foxit eSign sends real email to real phone in the room (proves AI handed off, didn't sign)
5. Xano dashboard shows deal + audit trail + signature status in real-time (proves end-to-end, not mocked)

**If all 5 happen live — we win multiple prizes simultaneously.**

---

## The Judge Hook

> *"DealClose is the first real estate workflow tool where the AI can draft every field of your contract from live market data — but legally, only you can close the deal."*

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After milestone (demo day):**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?

---
*Last updated: 2026-08-26 after initialization*
