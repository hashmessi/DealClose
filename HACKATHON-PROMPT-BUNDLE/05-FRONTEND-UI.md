# PROMPT 05 — FRONTEND UI IMPLEMENTATION
## Agent: UI/UX Engineer
## Time Budget: 60 minutes max

---

## CONTEXT
Core flow: [PASTE from Prompt 01]
Pages/routes needed: [list them]
API routes available: [PASTE from Prompt 04 — completed routes]
Design direction: [e.g. Dark mode, modern SaaS, glassmorphism — pick one]

---

## YOUR JOB
Build the frontend for the P0 core flow. Every screen must be functional, connected to real APIs, and visually premium. Not MVP ugly — judges see the UI first.

---

## DESIGN SYSTEM (establish first, before any components)

### Color Palette
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-card: #13131a;
  --accent: #6366f1;        /* indigo — change to match your theme */
  --accent-glow: #6366f133;
  --text-primary: #f1f5f9;
  --text-muted: #64748b;
  --border: #1e1e2e;
  --success: #22c55e;
  --error: #ef4444;
}
```

### Typography
```css
/* Use Google Fonts — Inter or Outfit */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body { font-family: 'Inter', sans-serif; }
```

### Component Standards
Every interactive component must have:
- Default state
- Hover state (transform + color shift)
- Loading state (skeleton or spinner)
- Error state (inline, not alert popup)
- Empty state (not blank — message + CTA)

---

## PAGE IMPLEMENTATION ORDER

### 1. Landing / Entry Page
- Hero: What is this? Why does it matter? CTA above the fold.
- Do NOT use generic text like "AI-powered solution." Name the specific outcome.
- CTA button → core flow (not a form page)

### 2. Core Feature Page
- This is the demo moment. Make it feel alive.
- Input area → trigger → loading state → result display
- Result must feel like magic, not a raw JSON dump
- Use animations for: page load, result reveal, state transitions

### 3. Result / Output Page (if separate)
- Clear hierarchy: most important info biggest
- Share / copy / export action visible

---

## COMPONENT PATTERNS

### API Call Pattern (client components)
```typescript
const [state, setState] = useState<'idle'|'loading'|'done'|'error'>('idle')
const [result, setResult] = useState<ResultType | null>(null)

const handleSubmit = async (data: FormData) => {
  setState('loading')
  try {
    const res = await fetch('/api/[route]', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(await res.text())
    setResult(await res.json())
    setState('done')
  } catch {
    setState('error')
  }
}
```

### Loading State
```tsx
{state === 'loading' && (
  <div className="animate-pulse">Processing...</div>
)}
```

### Error State
```tsx
{state === 'error' && (
  <p className="text-red-400 text-sm">Something went wrong. Try again.</p>
)}
```

---

## ANIMATION REQUIREMENTS
- Page entrance: `opacity-0 → opacity-100` fade, 200ms
- Result reveal: slide up from bottom, 300ms
- Button click: scale 0.97 on press
- Loading: pulse or spinner — not a frozen UI
- Use CSS transitions, not heavy animation libraries

---

## QUALITY CHECKLIST
- [ ] Landing page CTA works and routes correctly
- [ ] Form validation gives instant feedback (no silent failures)
- [ ] Loading state shows during every API call
- [ ] Error state is recoverable (user can try again without refresh)
- [ ] Result displays correctly with real data (not mocked)
- [ ] Mobile viewport looks intentional (not broken)
- [ ] No console errors in browser
- [ ] Fonts load (not falling back to system font)

## OUTPUT
- Status per page: `DONE` / `PARTIALLY DONE` / `BLOCKED`
- Screenshot or description of actual rendered result
- What's missing and estimated time to fix
