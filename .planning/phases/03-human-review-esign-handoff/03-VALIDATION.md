---
phase: 03
slug: human-review-esign-handoff
date: 2026-08-26
---

# Phase 3: Human Review + eSign Handoff - Validation Strategy

## 1. Goal-Backward Validation

**Goal:** Uncertain fields surface in a review UI for human confirmation, the finalized document is sent via Foxit eSign, and the full audit trail is recorded.

**Must-Haves for Verification:**
- [ ] A Human-in-the-Loop review UI displays fields flagged in Phase 2.
- [ ] The human can input override values or accept the AI suggestion.
- [ ] Document generation (Phase 2 step) is gated/rerun after HITL review is complete.
- [ ] Audit logs for every field are written via backend route.
- [ ] A dedicated "Send for Signature" button exists.
- [ ] The signature button triggers Foxit eSign API and returns a success status.

## 2. Requirement Cross-Check

| REQ-ID | Validation Method |
|---|---|
| HITL-01 | Manual: UI shows flagged fields in a clear side-by-side layout. |
| HITL-02 | Manual: Overriding a value successfully updates the deal state. |
| HITL-03 | Integration: Ensure final PDF generation waits for HITL submission. |
| HITL-04 | Code check: Verify `/api/deal/audit` records both `ai_value` and `final_value`. |
| SIGN-01 | Manual: Verify human click is required to trigger eSign API. |
| SIGN-02 | Integration: Call `/api/esign/send` and verify Foxit eSign response. |
| SIGN-03 | Code check: Deal view UI polls or refreshes to show `signature_sent`. |
| SIGN-04 | Logic check: Ensure AI extractor route cannot trigger the eSign route. |
| BACKEND-03 | Code check: Xano status updates seamlessly integrate with UI states. |
