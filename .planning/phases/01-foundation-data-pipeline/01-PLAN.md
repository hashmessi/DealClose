---
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: ["INTAKE-01", "INTAKE-02", "INTAKE-03", "RESEARCH-01", "RESEARCH-02", "RESEARCH-03", "BACKEND-01", "BACKEND-04"]
---

# Phase 1: Foundation & Data Pipeline - Plan

## Objectives
- Setup the Next.js web application.
- Setup Xano backend integration and SerpApi data fetching.
- Implement the intake UI.

## Tasks

```xml
<task>
  <read_first>
    - .planning/ROADMAP.md
  </read_first>
  <action>
    Initialize a Next.js 14 project in the workspace root if one does not already exist. 
    Run `npx -y create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm` in the workspace root `c:/Users/Hashvanth/Dev-post hack`. Do not overwrite existing files if already initialized.
  </action>
  <acceptance_criteria>
    - `package.json` exists in the root directory.
    - `src/app/layout.tsx` exists.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - package.json
  </read_first>
  <action>
    Create `.env.local` in the root directory. Add empty placeholders for `SERPAPI_KEY=""` and `XANO_API_URL=""`.
    Add `lucide-react` by running `npm install lucide-react`.
  </action>
  <acceptance_criteria>
    - `.env.local` exists and contains `SERPAPI_KEY` and `XANO_API_URL`.
    - `package.json` includes `lucide-react`.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/page.tsx
  </read_first>
  <action>
    Replace the contents of `src/app/page.tsx` to implement the property address intake form.
    - Make it a client component (`"use client"`).
    - Add states for `address` (string), `isLoading` (boolean), `data` (any), and `error` (string).
    - Create a clean, premium dark-mode aesthetic using Tailwind classes. Use a centered layout with a large input field.
    - Disable the submit button if `address.trim() === ""` or `isLoading` is true.
    - Add a loading state indicator (spinner icon from lucide-react).
    - Render `error` state in a red alert box if present.
    - Render `data` in a `<pre>` block with `JSON.stringify(data, null, 2)` if present.
  </action>
  <acceptance_criteria>
    - `src/app/page.tsx` starts with `"use client"`.
    - `src/app/page.tsx` uses `useState` for the form logic.
    - `src/app/page.tsx` contains an `<input>` for the address.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/page.tsx
  </read_first>
  <action>
    Create a new file `src/app/api/deal/route.ts` to handle the data pipeline.
    - Export a `POST(request: Request)` function.
    - Parse the `address` from the JSON body.
    - Add a try/catch block.
    - In the try block: 
      1. Call SerpApi: `fetch("https://serpapi.com/search.json?engine=google&q=" + encodeURIComponent(address + " real estate") + "&api_key=" + process.env.SERPAPI_KEY)`.
      2. Parse the JSON response.
      3. Call Xano (assuming standard REST API format): `fetch(process.env.XANO_API_URL + "/deal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ property_address: address, status: "research_complete", raw_serpapi_data: serpData, user_id: 1 }) })`. (User ID 1 represents the pre-seeded demo account BACKEND-04).
      4. Return the SerpApi data to the client using `NextResponse.json({ success: true, data: serpData })`.
    - In the catch block: return a 500 status with the error message.
  </action>
  <acceptance_criteria>
    - `src/app/api/deal/route.ts` exists and contains an async `POST` function.
    - The route makes fetch calls to SerpApi and Xano.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/page.tsx
    - src/app/api/deal/route.ts
  </read_first>
  <action>
    Update the `onSubmit` handler in `src/app/page.tsx` to call the `/api/deal` endpoint.
    - Set `isLoading(true)` and `error(null)`.
    - `fetch('/api/deal', { method: 'POST', body: JSON.stringify({ address }) })`.
    - On success, set `data`. On error, set `error`.
    - Set `isLoading(false)` in a finally block.
  </action>
  <acceptance_criteria>
    - `src/app/page.tsx` calls `fetch('/api/deal')`.
  </acceptance_criteria>
</task>
```

## Verification
- Can I type an address and see the loading state?
- If SerpApi key is missing or invalid, does it gracefully fail and display the error message on screen?
- Is the raw response from SerpApi printed in the `<pre>` block on success?
