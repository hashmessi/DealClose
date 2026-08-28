# PROMPT 09 — DEPLOYMENT
## Agent: DevOps / Deployment Engineer
## Time Budget: 30 minutes max

---

## CONTEXT
Platform: [Vercel / Railway / Render / Fly.io — pick one]
Project root: [path]
Framework: [Next.js / Express / FastAPI]
Env vars required: [PASTE full list from Prompt 02]
Build command: `npm run build` (adjust if different)

---

## YOUR JOB
Deploy the application to a live URL. The URL must work before the demo. Execute every step. Do not stop until you have a working live URL.

---

## VERCEL DEPLOYMENT (recommended for Next.js)

### Step 1: Verify Build Locally
```bash
npm run build
# Must complete with zero errors
# If it fails — fix before continuing. Deploying a broken build wastes time.
```

### Step 2: Git Commit Everything
```bash
git add .
git commit -m "feat: working P0 implementation"
git push origin main
```
Verify: `.env.local` is NOT in the commit (it must be in `.gitignore`).

### Step 3: Deploy to Vercel
**Option A — Vercel CLI (fastest)**
```bash
npm install -g vercel
vercel --yes
# Follow prompts: link to project, deploy to production
vercel --prod
```

**Option B — Vercel Dashboard**
1. Go to vercel.com → New Project → Import Git repo
2. Set framework preset: Next.js
3. Add all environment variables (see Step 4)
4. Deploy

### Step 4: Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
[PASTE each var from .env.local — name and value]
```
Critical: Do NOT skip any variable. Missing env vars cause silent runtime failures.

### Step 5: Verify Deployment
- Open the live URL
- Execute the core flow end-to-end
- Check browser console for errors
- Check Vercel Function Logs for API errors

---

## RAILWAY DEPLOYMENT (for Express/FastAPI backends)

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

Add env vars:
```bash
railway variables set KEY=value
```

---

## COMMON DEPLOYMENT FAILURES & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| Build fails in CI | Missing dependency | Add to `dependencies` not `devDependencies` |
| Env var undefined at runtime | Not set in dashboard | Add all vars in platform env settings |
| 500 on all API routes | Database URL wrong for prod | Update `DATABASE_URL` to production DB URL |
| CORS error in production | Hardcoded localhost URL | Use env var for API base URL |
| Function timeout | AI call too slow | Set `maxDuration = 60` in route config |
| Supabase RLS blocking | Auth session not passed | Verify server-side Supabase client config |

### Next.js Specific
```typescript
// app/api/[route]/route.ts — increase timeout for AI routes
export const maxDuration = 60 // seconds
export const dynamic = 'force-dynamic'
```

---

## POST-DEPLOYMENT CHECKLIST
- [ ] Live URL loads without error
- [ ] Core flow works on live URL (not just locally)
- [ ] All API routes return correct responses
- [ ] Auth works (login/session) if applicable
- [ ] AI feature produces real output
- [ ] No env vars exposed in browser source
- [ ] Deployment URL is shareable (not behind auth by default)

---

## OUTPUT
- Live URL: [paste here]
- Core flow verified: `YES` / `NO — [issue]`
- Deployment time: [N minutes]
- Status: `DEPLOYED` / `FAILED — [blocker]`

---

## IF DEPLOYMENT FAILS IN 20 MINUTES
Run locally and demo via localhost with ngrok:
```bash
npm run dev &
npx ngrok http 3000
```
This gives a public URL for demo. Not ideal but better than no demo.
