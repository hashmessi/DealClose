---
phase: 02
slug: ai-structuring-document-generation
date: 2026-08-26
---

# Phase 2: AI Structuring + Document Generation - Validation Strategy

## 1. Goal-Backward Validation

**Goal:** GPT-4o converts raw SerpApi data into a typed deal object with confidence scores, and Nutrient DWS generates a complete, formatted purchase offer PDF.

**Must-Haves for Verification:**
- [ ] OpenAI route `/api/ai/extract` accepts SerpApi data and returns typed deal JSON with confidence scores.
- [ ] At least 2 fields are tagged as low confidence (<85%).
- [ ] Document generation route `/api/doc/generate` renders a formatted PDF with calculated closing costs and contingency branching.
- [ ] The generated PDF renders inline in the frontend UI (`<iframe>` or object embed).
- [ ] Deal status in Xano updates to `draft_complete`.

## 2. Requirement Cross-Check

| REQ-ID | Validation Method |
|---|---|
| AI-01 | Integration test: Call `/api/ai/extract` and verify structured output + confidence scores. |
| AI-02 | Verification: Confirm fields below 85% confidence get flagged for HITL review. |
| AI-03 | Error test: Simulate OpenAI API error / missing key and verify graceful fallback. |
| DOC-01 | Integration test: Call `/api/doc/generate` and verify PDF generation. |
| DOC-02 | Visual/Contract check: Verify contingency clauses branch correctly based on deal data. |
| DOC-03 | Code/Math check: Verify closing costs calculations (purchase price * % or split). |
| DOC-04 | Visual check: Inline PDF renderer renders PDF cleanly without download dialog. |
| BACKEND-02 | Integration check: Xano deal record updated with document metadata. |
