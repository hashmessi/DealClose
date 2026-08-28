# Phase 1: Foundation & Data Pipeline - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning
**Source:** User Directive (Assumptions Mode)

<domain>
## Phase Boundary

This phase scaffolds the core Next.js frontend and Xano backend, establishing the initial Deal state persistence, and integrating SerpApi to pull live market comps for a property address. The primary output is a functioning web form that accepts an address, fetches live data, persists the deal in Xano, and displays the raw data to the user.

</domain>

<decisions>
## Implementation Decisions

### Frontend Framework
- Next.js 14 App Router
- TailwindCSS for styling (standardizing on a clean, modern real-estate aesthetic)

### Backend Architecture
- Xano for REST API and database
- Next.js API routes will proxy requests to SerpApi to keep keys secure, and then communicate with Xano for persistence.

### Data Model (Xano)
- Table `deals`:
  - `id` (integer)
  - `property_address` (text)
  - `status` (text: "research_complete", etc.)
  - `raw_serpapi_data` (json)
  - `created_at` (timestamp)

### API Integrations
- **SerpApi**: Used for property market comps.

</decisions>

<canonical_refs>
## Canonical References

### Project Scope
- `.planning/PROJECT.md` — Project definition and constraints
- `.planning/ROADMAP.md` — Phase goals and requirements

</canonical_refs>

<specifics>
## Specific Ideas
- The SerpApi response must be shown to the user on the UI after fetching.
- Form needs clear validation for empty addresses.

</specifics>

<deferred>
## Deferred Ideas
- Authentication is out of scope (using a pre-seeded account).
- Document generation (deferred to Phase 2).

</deferred>
