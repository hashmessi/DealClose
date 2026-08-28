# PROMPT 04 — BACKEND & API IMPLEMENTATION
## Agent: Backend Engineer
## Time Budget: 60 minutes max

---

## CONTEXT
API routes to build: [PASTE from Prompt 02 — API Routes table]
DB schema: [PASTE from Prompt 02]
AI integration: [PASTE client setup from Prompt 03]
Auth strategy: [e.g. Supabase Auth / NextAuth / None]

---

## YOUR JOB
Implement all P0 API routes. Each must be end-to-end functional: request in, validated, processed, stored/retrieved, response out. Do not leave stubs.

---

## FOR EACH API ROUTE, IMPLEMENT:

### Route: [METHOD] /api/[path]

**File:** `app/api/[path]/route.ts`

**Implementation must include:**

1. **Input validation** (use Zod schema — no raw req.body access)
```typescript
const schema = z.object({
  field: z.string().min(1).max(500),
})
```

2. **Auth check** (if required)
```typescript
const session = await getServerSession() // or Supabase equivalent
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

3. **Core logic** — DB read/write + AI call if applicable

4. **Error handling** — every failure path returns a typed error response
```typescript
} catch (error) {
  console.error('[route-name]', error)
  return NextResponse.json({ error: 'Internal error' }, { status: 500 })
}
```

5. **Response shape** — consistent, typed
```typescript
return NextResponse.json({ data: result, success: true })
```

---

## DATABASE OPERATIONS
For each DB interaction:
- Use parameterized queries / ORM — no string interpolation
- Handle null returns explicitly
- Log errors server-side (not client-side)

## AI INTEGRATION PATTERN
```typescript
// lib/ai.ts usage pattern
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',          // cheapest model that works
  messages: [...],
  temperature: 0.3,              // lower = more predictable
  max_tokens: 500,               // set a hard ceiling
})
```
- Always handle: API key missing, timeout, rate limit, malformed response
- Never expose raw AI errors to the client

## VALIDATION CHECKLIST (run after each route)
- [ ] POST with valid data → 200 + correct response shape
- [ ] POST with missing required field → 400 + error message
- [ ] POST without auth (if required) → 401
- [ ] POST with valid data, DB down → 500 + generic error (no stack trace)
- [ ] AI call with empty input → handled gracefully

## OUTPUT
For each route:
- Status: `DONE` / `BLOCKED`  
- Test result: paste actual response from curl/fetch test
- Any edge case not yet handled (flag, don't silently skip)
