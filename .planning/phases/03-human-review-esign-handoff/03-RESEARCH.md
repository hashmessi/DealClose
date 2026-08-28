# Phase 3: Human Review + eSign Handoff - Research

## Overview
Phase 3 builds the Human-in-the-Loop UI to review uncertain AI fields and integrates Foxit eSign for digital signature routing.

## Technical Architecture

### 1. HITL Review UI Component
- Next.js Client Component.
- Receives the `flaggedFields` array from Phase 2.
- Maintains state for `resolvedFields` (Set or object mapping field keys to updated values).
- Upon full resolution, makes a POST request to `/api/deal/audit` and then re-triggers `/api/doc/generate`.

### 2. Audit Trail Endpoint
- Endpoint `/api/deal/audit` receives an array of audit logs.
- Posts to a Xano `deal_audits` table (or patches a JSON column on the deal).
- Structure: `{ deal_id, field, original_value, final_value, human_overridden: true/false, timestamp }`.

### 3. Foxit eSign Integration
- **Signer Identity**: For the hackathon demo, we will use a hardcoded or form-provided email address (a team member's real email) as the Buyer.
- **Endpoint**: `/api/esign/send`.
- **API Flow**:
  1. Authenticate with Foxit eSign (Bearer token).
  2. Upload the finalized PDF document from `/public/documents/offer_[dealId].pdf` (or pass base64).
  3. Create a signature envelope routing the document to the Buyer email.
  4. Receive the envelope ID and update Xano deal status to `signature_sent`.
- **Note on API Keys**: Requires `FOXIT_API_KEY` or equivalent OAuth credentials stored in `.env.local`.

## Validation Architecture
- Verify that document generation cannot proceed if `flaggedFields` are not resolved.
- Verify audit log is successfully written to the backend API route.
- Verify `/api/esign/send` can only be invoked manually via the frontend UI, not programmatically by the AI extractor.
