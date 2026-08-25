<!-- GSD:project-start source:PROJECT.md -->
## Project

**DealClose — Project Context**

**DealClose** is an AI-powered real estate deal workflow engine built for the DevNetwork [API + Cloud + AI] Hackathon 2026. It solves the trust gap in AI-generated legal documents by implementing a provable "Trust Pipeline" architecture: AI drafts, humans authorize, and every step is auditable.

The product takes a property address as input, pulls live market intelligence (SerpApi), generates a fully-structured purchase offer PDF (Nutrient DWS), flags uncertain AI-generated fields for human review, then hands the finalized document to Foxit eSign for legally-binding signature. Xano serves as the orchestration backend for all workflows, business logic, and storage.

**Hackathon:** DevNetwork [API + Cloud + AI] Hackathon 2026 (Aug 17 – Sep 3, 2026)
**Demo Date:** September 2–3, 2026 — Santa Clara Convention Center
**Team Size:** Small (1–3)

---

**Core Value:** The single most important thing DealClose must do:

> **Take a property address → produce a fully-drafted, human-reviewed, ready-to-sign offer document in one unbroken workflow.**

If the demo shows this working end-to-end in front of judges, we win.

---

### Constraints

- **Timeline:** Hackathon ends Sep 3, 2026. Demo is live in front of judges — no grace period.
- **No fallback to fake data in demo:** Every API call must be real or the judges will ask questions we can't answer.
- **SerpApi must use a pre-validated demo address:** We pick a specific property address before demo day and confirm SerpApi returns rich data for it.
- **Foxit eSign must use a real email in the room:** A team member acts as "buyer" — we pre-test the exact eSign URL flow.
- **P0 is ~6 hours of build time.** Do not start P1 until all P0 features are working end-to-end.

---
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
