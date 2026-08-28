---
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: ["Demo Polish", "Error Handling"]
---

# Phase 4: Demo Polish & Integration Validation - Plan

## Objectives
- Ensure the application is visually polished, responsive, and robust for a live hackathon demonstration.
- Implement global error handling so crashes do not show a blank screen.
- Verify API setup guide is present for judges and team members.

## Tasks

```xml
<task>
  <read_first>
    - API-SETUP-GUIDE.md
  </read_first>
  <action>
    Verify the `API-SETUP-GUIDE.md` exists and is fully populated with instructions for OpenAI, SerpApi, Nutrient, Foxit, and Xano integrations. (Completed implicitly).
  </action>
  <acceptance_criteria>
    - `API-SETUP-GUIDE.md` exists in root.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/error.tsx
    - src/app/not-found.tsx
  </read_first>
  <action>
    Create a global `src/app/error.tsx` file for the Next.js App Router to catch and display unhandled UI exceptions cleanly.
    Create a global `src/app/not-found.tsx` to handle 404s gracefully.
  </action>
  <acceptance_criteria>
    - `error.tsx` exists and returns a styled error message.
    - `not-found.tsx` exists and returns a styled 404 message.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - src/app/page.tsx
  </read_first>
  <action>
    Review `src/app/page.tsx` for layout polish:
    - Ensure inputs and buttons have disabled states when loading.
    - Ensure the iframe for PDF rendering (`h-[550px]`) is responsive on smaller devices.
    - Ensure the loading spinners are correctly centered.
    - Confirm the global error state `error` is rendered cleanly as a red banner (already implemented in Phase 3).
  </action>
  <acceptance_criteria>
    - Layout issues resolved.
    - UI is responsive.
  </acceptance_criteria>
</task>

<task>
  <read_first>
    - package.json
  </read_first>
  <action>
    Run `npm run build` one final time to verify that adding the error boundary and not-found pages does not break the production build.
  </action>
  <acceptance_criteria>
    - Next.js build completes with code 0.
  </acceptance_criteria>
</task>
```

## Verification
- Does the API-SETUP-GUIDE.md accurately map to `.env.local` requirements?
- Are error boundaries properly handling crashes?
- Can the app successfully compile to a production build?
