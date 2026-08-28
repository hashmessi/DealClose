# Phase 3: Human Review + eSign Handoff - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning
**Source:** User Directive (Assumptions Mode)

<domain>
## Phase Boundary

In Phase 3, DealClose implements the "Trust Pipeline" core value proposition. Uncertain AI-extracted fields (< 85% confidence) from Phase 2 are presented in a side-by-side Human-in-the-Loop (HITL) review UI. The human agent must explicitly accept or override these flagged fields. Once resolved, the document is finalized, and a complete audit trail is logged to Xano attributing every field to AI or Human. Finally, the human explicitly triggers the "Send for Signature" action, handing off the PDF to Foxit eSign.

</domain>

<decisions>
## Implementation Decisions

### HITL Review UI
- UI displays a list of flagged fields.
- For each flagged field, show the AI's suggested value and an input for the human to override.
- Provide "Accept AI Suggestion" and "Override" actions for each.
- The "Finalize & Re-draft Document" button remains disabled until all flagged fields are marked as resolved.

### Document Regeneration
- Upon HITL resolution, the frontend calls the document generation route (`/api/doc/generate`) again to rebuild the PDF with the updated (human-approved) values.

### Audit Trail (Xano)
- A new table `audit_logs` (or JSON column in `deals`) is needed in Xano to track:
  - `deal_id`: reference
  - `field_name`: string
  - `ai_value`: string
  - `final_value`: string
  - `changed_by_human`: boolean
  - `timestamp`: datetime

### Foxit eSign Integration
- We will integrate the Foxit eSign API to send the final PDF to a buyer/seller email.
- The AI is structurally prevented from calling the signature API; the API route (`/api/esign/send`) will only accept requests triggered by the human agent's button click in the UI.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/PROJECT.md` — The "Trust Pipeline" architecture and sponsor prize strategy (Foxit eSign).
- `.planning/ROADMAP.md` — Phase 3 requirements (HITL-01..04, SIGN-01..04, BACKEND-03).

</canonical_refs>

<deferred>
## Deferred Ideas

- Webhook callbacks from Foxit eSign for real-time status updates (we will use manual refresh or simple polling for the hackathon demo).

</deferred>
