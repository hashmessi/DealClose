# Phase 4: Demo Polish & Integration Validation - Research

## Overview
Phase 4 focuses on application stability, error handling, and visual refinements to ensure the hackathon demo goes smoothly.

## Error Boundary Architecture
- Implement a global `error.tsx` file for the Next.js App Router.
- This will catch unhandled runtime errors in React components and display a clean "Something went wrong" fallback UI instead of breaking the app.
- Reference: [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling).

## API Integration Resilience
- **Timeouts**: Ensure API routes don't hang indefinitely. The default fetch behavior might need AbortControllers or Next.js edge timeouts, but for this demo, standard async/await is acceptable if the remote services are responsive.
- **Null Safety**: Double-check that all components safely render even if an API returns partial or malformed data (e.g., using optional chaining `?.`).
- **Environment Checks**: If an API key is missing (e.g., `FOXIT_API_KEY`), the server should provide a high-fidelity mock response so the UI flow can continue to the next step. (Already implemented in Phase 3, needs verification).

## UI Polish Targets
- **Responsive Design**: The inline PDF viewer iframe currently has a fixed height. Ensure it scrolls correctly on smaller screens.
- **Loading States**: All buttons must show clear loading spinners (using `lucide-react` icons like `RefreshCw` with `animate-spin`).
- **Typography**: Check gradient text readability and contrast against the dark background.

## Validation Data
- Validate that the "Quick Test" addresses provided in the UI actually return valid SerpApi JSON payloads without 500 errors.
