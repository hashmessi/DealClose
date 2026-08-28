# Phase 2: AI Structuring + Document Generation - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning
**Source:** User Directive (Assumptions Mode)

<domain>
## Phase Boundary

In Phase 2, DealClose takes raw SerpApi market data and passes it to OpenAI GPT-4o with structured output schema enforcement. GPT-4o outputs a typed JSON deal object with per-field confidence scores (0–100%). Any fields with confidence < 85% are flagged for HITL review. Then, Nutrient DWS (or fallback structured PDF engine) consumes the structured deal object, applies calculated fields (closing costs, earnest money), branches on contingencies (financing vs. cash), and produces a rendered Purchase Offer PDF viewable inline in the UI.

</domain>

<decisions>
## Implementation Decisions

### AI Extraction Schema
- OpenAI `OPENAI_API_KEY` configured in `.env.local`.
- Model: `gpt-4o` (or `gpt-4o-mini` with JSON response mode for fast execution).
- Data Schema:
  - `property_address`: string
  - `purchase_price`: number (calculated from market comps)
  - `earnest_money`: number (typically 2-3% of purchase_price)
  - `closing_date`: string (e.g. 30 days from today)
  - `contingency_financing`: boolean
  - `contingency_inspection`: boolean
  - `closing_costs_seller`: number
  - `closing_costs_buyer`: number
  - `confidence_scores`: object mapping field keys to confidence percentages (0-100).

### HITL Flagging Threshold
- Fields with confidence score < 85% are tagged with `requires_review: true`.
- For demo purposes, we prompt GPT-4o to conservatively assign lower confidence (<85%) to fields like seller closing cost contribution or specific seller concessions.

### Document Generation Architecture
- Endpoint `/api/doc/generate`.
- Primary: Nutrient DWS (Document Web Services) API or template PDF engine.
- Generates a purchase offer PDF document and saves it locally (`/public/documents/deal_[id].pdf`) or returns a base64/blob stream.
- Renders inline in an `<iframe>` or PDF viewer on the frontend.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — Sponsor prize strategy (Nutrient DWS, OpenAI)
- `.planning/ROADMAP.md` — Phase 2 requirements (AI-01..03, DOC-01..04, BACKEND-02)

</canonical_refs>

<deferred>
## Deferred Ideas

- Foxit eSign signature handoff is deferred to Phase 3.
- Interactive editing of flagged fields is deferred to Phase 3 (HITL UI).

</deferred>
