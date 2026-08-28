---
phase: 04a
slug: api-integration-validation
date: 2026-08-26
---

# Phase 4a: API Integration Validation & Tests

## Objectives
Verify all five API integrations work end-to-end with real credentials. Each integration must produce a successful response before the demo. This phase creates a dedicated test route and test page in the app.

## Tasks

```xml
<task>
  <action>
    Create `src/app/api/test/connections/route.ts` — a GET endpoint that tests all 5 API integrations:
    1. **SerpApi**: Fire a test search for "500 Howard St San Francisco" and verify non-empty results.
    2. **OpenAI**: Send a minimal prompt ("say ok") to gpt-4o-mini and verify a 200 response.
    3. **Nutrient/pdf-lib**: Generate a 1-page test PDF (pdf-lib in-memory) and verify the buffer is non-empty.
    4. **Foxit eSign**: If FOXIT_API_KEY is present, ping the Foxit eSign API health endpoint. If absent, return status "skipped (no key)".
    5. **Xano**: If XANO_API_URL is present, make a GET request to the base URL and check for a 2xx/4xx (not 5xx) response. If absent, return status "skipped (no URL)".
    Returns a JSON object: `{ serpapi, openai, nutrient, foxit, xano }` each with `{ ok: boolean, message: string, latencyMs: number }`.
  </action>
  <acceptance_criteria>
    - `src/app/api/test/connections/route.ts` exists.
    - Returns structured per-service results.
    - Does not throw — any individual failure is caught and reported in the result.
  </acceptance_criteria>
</task>

<task>
  <action>
    Create `src/app/test/page.tsx` — a developer-only connections dashboard.
    - Full-page brutalist design: warm canvas background (#e5e5e5), black display heading "API CONNECTION TESTS".
    - Shows a card for each of the 5 integrations.
    - "Run Connection Tests" button calls `/api/test/connections` and displays per-service result with green (OK) / red (FAIL) / yellow (SKIPPED) pill badges.
    - Shows latency in milliseconds for each service.
    - Do NOT add this to the main navigation — it is a hidden `/test` developer route.
  </action>
  <acceptance_criteria>
    - `/test` page exists and renders the connection test dashboard.
    - Tests are run on-demand with a button.
    - Results display per-service status badges and latency.
  </acceptance_criteria>
</task>
```

## Verification
- Navigate to `/test` in the browser.
- Click "Run Connection Tests" and verify all services with real keys show `ok: true`.
- Services with missing keys should show `skipped` status, not error.
