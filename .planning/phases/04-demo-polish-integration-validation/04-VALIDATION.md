---
phase: 04
slug: demo-polish-integration-validation
date: 2026-08-26
---

# Phase 4: Demo Polish & Integration Validation - Validation Strategy

## 1. Goal-Backward Validation

**Goal:** The full end-to-end demo flow works flawlessly with the chosen demo address. Error states are handled. UI is presentable to judges.

**Must-Haves for Verification:**
- [ ] The app runs without throwing unhandled React exceptions.
- [ ] If an API call fails, the UI displays a readable error message instead of crashing.
- [ ] Visual polish: padding, colors, and layout are consistent on desktop and mobile.
- [ ] All API integrations (SerpApi, OpenAI, Nutrient, Foxit, Xano) are tested and documented.

## 2. Requirement Cross-Check

| Criteria | Validation Method |
|---|---|
| Full flow runs uninterrupted | Manual: Start deal -> AI Extract -> Human Review -> PDF -> eSign. |
| Error states show friendly msg | Integration: Trigger a failure (e.g., bad address) and ensure the UI shows a red alert banner, not a white screen of death. |
| UI is clean | Visual check: No overlapping text, iframe responsive, buttons disabled when loading. |
| Pre-warm demo / API Guide | Document check: `API-SETUP-GUIDE.md` exists and is accurate. |
