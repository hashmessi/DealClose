# PROMPT 03 — PROJECT SCAFFOLD & SETUP
## Agent: Full-Stack Engineer
## Time Budget: 30 minutes max

---

## CONTEXT
Stack: [PASTE locked stack]
Project name: [NAME]
Architecture: [PASTE from Prompt 02]
Env vars needed: [PASTE from Prompt 02]

---

## YOUR JOB
Scaffold the project from zero to running dev server with correct structure, all dependencies installed, env configured, and basic routing in place. Execute every command. Do not describe — do.

---

## EXECUTION CHECKLIST (run in order)

### 1. INIT PROJECT
```bash
# Next.js (adjust for your stack)
npx create-next-app@latest [project-name] \
  --typescript --tailwind --eslint --app --src-dir=false \
  --import-alias "@/*" --use-npm
cd [project-name]
```

### 2. INSTALL CORE DEPENDENCIES
```bash
# Install only what P0 features require
npm install [list exact packages here]
# e.g: npm install @supabase/supabase-js openai zod react-hook-form
```

### 3. CREATE .env.local
```env
# Fill all values. If value is unknown, use PLACEHOLDER and flag it.
[ALL VARS from architecture prompt]
```

### 4. CREATE DIRECTORY STRUCTURE
Create all folders from the architecture plan.
Create empty index files in each to confirm structure.

### 5. SETUP DATABASE CLIENT
Create `lib/db.ts` (or equivalent) — singleton client, properly typed.

### 6. SETUP AI CLIENT
Create `lib/ai.ts` — singleton AI client with correct model, timeout config.

### 7. SETUP TYPE CONTRACTS
Create `types/index.ts` with all core domain types matching the DB schema.

### 8. CREATE BASE LAYOUT
- Root layout with correct metadata, font, and global CSS
- Basic nav (even if unstyled — just routing works)
- Error boundary at root

### 9. VERIFY RUNNING
```bash
npm run dev
# Expected: dev server on http://localhost:3000, zero console errors
```

### 10. VERIFY BUILD (optional, only if time allows)
```bash
npm run build
```

---

## OUTPUT AFTER EXECUTION
Report:
- `DONE`: Dev server running, all routes accessible
- `BLOCKED`: [specific error] — [how you fixed or what's needed]
- All installed package versions (critical for debugging later)

## RULES
- Do not add any UI styling yet — that is Prompt 05's job
- Do not implement features yet — structure only
- If a dependency install fails, try an alternative. Do not block on it.
- .env.local must never be committed — verify .gitignore includes it
