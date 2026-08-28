---
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: ["HITL-01", "HITL-02", "HITL-03", "HITL-04", "SIGN-01", "SIGN-02", "SIGN-03", "SIGN-04", "BACKEND-03"]
---

# Phase 3: Human Review + eSign Handoff - Plan

## Objectives
- Introduce a Human-in-the-Loop (HITL) review UI that pauses document generation until low-confidence AI fields are reviewed and authorized.
- Log an audit trail of AI vs. Human values for transparency and trust.
- Integrate Foxit eSign to route the finalized PDF to the buyer for signature.

## Tasks

```xml
<task>
  <read_first>
    - .env.local
  </read_first>
  <action>
    Append `FOXIT_API_KEY=""` placeholder to `.env.local`.
  </action>
  <acceptance_criteria>
    - `.env.local` contains `FOXIT_API_KEY`.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/api/deal/route.ts
  </read_first>
  <action>
    Create `src/app/api/deal/audit/route.ts` API endpoint.
    - Accepts POST request with `{ dealId, auditLogs: Array<{ field, originalValue, finalValue, overridden: boolean }> }`.
    - Updates Xano deal record by appending to an `audit_logs` JSON column (or creates records in an audit table).
    - If Xano is unconfigured, gracefully log the audit trail locally.
    - Returns `{ success: true }`.
  </action>
  <acceptance_criteria>
    - `src/app/api/deal/audit/route.ts` exists.
    - Safely handles Xano PATCH request.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/api/doc/generate/route.ts
  </read_first>
  <action>
    Create `src/app/api/esign/send/route.ts` API endpoint.
    - Accepts POST request with `{ dealId, buyerEmail, pdfUrl }`.
    - If `FOXIT_API_KEY` is present, calls Foxit eSign API to create a signature envelope for the buyer.
    - If API key is missing, mocks a successful eSign envelope creation after 2000ms delay.
    - Updates Xano deal status to `signature_sent`.
    - Returns `{ success: true, envelopeId: "mock_env_123" }`.
  </action>
  <acceptance_criteria>
    - `src/app/api/esign/send/route.ts` exists.
    - Returns success response and updates status.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/page.tsx
  </read_first>
  <action>
    Update `src/app/page.tsx` UI to implement the HITL loop and Signature Handoff:
    1. **HITL Review Component**: 
       - If `aiResult.flaggedFields.length > 0`, display a "Human-in-the-Loop Required" section before the PDF generation button.
       - Map through `flaggedFields`. For each field, show the AI's suggested value and a number/text input for the human to override.
       - Track `resolvedFields` state (which fields the human has explicitly accepted or overridden).
       - Disable the "Generate Purchase Offer PDF" button until `resolvedFields.length === flaggedFields.length`.
    2. **Audit Logging**:
       - When generating the PDF, first submit the audit logs to `/api/deal/audit` representing the human's final choices vs. the AI's original choices.
       - Pass the *merged* (human-approved) deal terms to `/api/doc/generate`.
    3. **eSign Handoff Component**:
       - Under the generated PDF viewer, add a section: "Legally Binding Signature Routing".
       - Add a text input for `buyerEmail` (default: "demo@dealclose.ai").
       - Add a "Send for Signature via Foxit eSign" button.
       - On click, call `/api/esign/send` and display success status ("Signature Requested!").
  </action>
  <acceptance_criteria>
    - `src/app/page.tsx` requires human resolution of flagged fields before PDF generation.
    - The PDF generation button uses human-overridden values.
    - `src/app/page.tsx` has a Foxit eSign email input and trigger button.
  </acceptance_criteria>
</task>
```

## Verification
- Does the UI force the human to resolve flagged fields?
- Are the human's overrides reflected in the final generated PDF document?
- Does clicking the eSign button show a success state indicating the envelope was created?
