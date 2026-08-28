# PROMPT 02 — ARCHITECTURE & DATABASE SCHEMA
## Agent: Software Architect + Database Engineer
## Time Budget: 20 minutes max

---

## CONTEXT
Product: [NAME from Prompt 01]
Core Flow: [PASTE from Prompt 01]
Stack: [PASTE locked stack from Prompt 01]

---

## YOUR JOB
Design the minimum correct architecture and database schema to ship the core flow. Nothing speculative. Nothing over-engineered.

---

## OUTPUT FORMAT (strict)

### 1. ARCHITECTURE DIAGRAM (ASCII or list)
Show: Frontend → API layer → Backend services → Database → External APIs
Be explicit about what runs where.

### 2. DIRECTORY STRUCTURE
```
/
├── app/           # Next.js app router (or equivalent)
│   ├── api/       # API routes
│   └── (routes)/  # Pages
├── components/    # Reusable UI
├── lib/           # Shared utilities, DB client, AI client
├── types/         # TypeScript contracts
└── .env.example   # All required env vars listed
```

### 3. DATABASE SCHEMA
For each table/collection:
```sql
-- Table: [name]
CREATE TABLE [name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  [field] [type] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index: [reason]
CREATE INDEX ON [name]([field]);
```
Only create tables that P0 features actually need.

### 4. API ROUTES (P0 only)
| Method | Route | Input | Output | Auth Required |
|--------|-------|-------|--------|---------------|
| POST | /api/[x] | {field} | {result} | Yes |

### 5. ENVIRONMENT VARIABLES
```env
# All required. No optional vars until P0 is done.
NEXT_PUBLIC_APP_URL=
DATABASE_URL=
OPENAI_API_KEY=
[OTHER]=
```

### 6. EXTERNAL API CONTRACTS
For each 3rd-party API used:
- Name: 
- Endpoint: (verified, not invented)
- Auth method: 
- Rate limit: 
- Failure behavior: 

### 7. DATA FLOW (P0 feature only)
User action → API call → DB query → AI call → response → UI update
Write it as a numbered sequence.

---

## RULES
- No tables that aren't read or written in the P0 flow
- No microservices — monorepo unless explicitly required
- Every env var must map to a real service you are actually using
- Do not design for scale you won't reach during the hackathon
