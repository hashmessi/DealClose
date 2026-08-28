# DealClose — Production Setup & Deployment Guide

> **DevNetwork [API + Cloud + AI] Hackathon 2026**  
> Target Platform: **Vercel** (Recommended) / Node.js 18+ / Docker

---

## 1. Architecture & Runtime Overview

DealClose is a Next.js 16 (App Router + Turbopack) full-stack web application designed for zero-config serverless deployment.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────┐
│             Next.js App Router (Vercel Serverless)          │
│  ├─ /                    -> Interactive Trust Pipeline UI   │
│  ├─ /test                -> Live System Health Check        │
│  ├─ /api/deal            -> SerpApi Grounding Proxy         │
│  ├─ /api/ai/extract      -> OpenRouter LLM + Cache Engine   │
│  ├─ /api/doc/generate    -> Nutrient DWS / PDF-Lib Engine   │
│  ├─ /api/esign/send      -> Foxit eSign Dispatch            │
│  └─ /api/deal/audit      -> Audit Vault (GET/POST)          │
└───────────────┬───────────────────────────┬─────────────────┘
                │                           │
   ┌────────────▼────────────┐ ┌────────────▼─────────────┐
   │ Third-Party API Partners│ │   Xano Backend Vault     │
   │ ├─ SerpApi (Comps)      │ │ ├─ Deal Records          │
   │ ├─ OpenRouter (LLM)     │ │ ├─ Immutable Audit Trail │
   │ ├─ Nutrient DWS (PDF)   │ │ └─ User State            │
   │ └─ Foxit eSign (Auth)   │ └──────────────────────────┘
   └─────────────────────────┘
```

---

## 2. Environment Variables & Secrets Configuration

Create a `.env.local` file (for local development) or populate Environment Variables in Vercel Project Settings:

| Variable | Required | Description | Example / Fallback |
|---|:---:|---|---|
| `SERPAPI_KEY` | **Recommended** | Google Search API key from SerpApi.com | `serp_api_xxx` *(Pre-seeded demo fallback if empty)* |
| `OPENROUTER_API_KEY` | **Recommended** | API key for LLM structuring | `sk-or-v1-xxx` *(Deterministic ground truth fallback if empty)* |
| `XANO_API_URL` | Optional | Base URL for Xano workspace table API | `https://x8ki-letl-twmt.n7.xano.io/api:xxx` |
| `FOXIT_CLIENT_ID` | Optional | Foxit eSign API Client ID | `demo_client_id` *(Instant envelope dispatcher if empty)* |
| `FOXIT_CLIENT_SECRET` | Optional | Foxit eSign API Client Secret | `demo_secret` |
| `NUTRIENT_API_KEY` | Optional | Nutrient DWS Document engine API Key | `demo_nutrient_key` |
| `NEXT_PUBLIC_APP_URL` | Optional | Production URL for origin headers | `https://dealclose.vercel.app` |

---

## 3. Quickstart: Local Verification

```bash
# 1. Clone repository
git clone https://github.com/your-team/dealclose.git
cd dealclose

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Verify TypeScript & Type Check
npx tsc --noEmit

# 5. Run Next.js Production Build
npm run build

# 6. Start Production Server
npm start
# Server listens on http://localhost:3000
```

---

## 4. Deployment Option A: Vercel (Recommended)

1. **Push to GitHub / GitLab:**
   ```bash
   git add .
   git commit -m "feat: complete dealclose trust pipeline"
   git push origin main
   ```
2. **Import Project into Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository `dealclose`.
   - Framework Preset: **Next.js**.
   - Root Directory: `./`.
   - Build Command: `npm run build` (or `next build`).
   - Output Directory: `.next`.
3. **Set Environment Variables:**
   - Under **Project Settings → Environment Variables**, add `SERPAPI_KEY`, `OPENROUTER_API_KEY`, `XANO_API_URL`, `FOXIT_CLIENT_ID`.
4. **Deploy:**
   - Click **Deploy**. Vercel will build and assign an SSL-secured `https://dealclose-xxx.vercel.app` URL within ~60 seconds.

---

## 5. Deployment Option B: Standalone Node.js / Docker

To deploy on Railway, Render, AWS ECS, or a private VPS:

### `Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t dealclose:latest .
docker run -p 3000:3000 --env-file .env.local dealclose:latest
```

---

## 6. Pre-Pitch Warm-up Checklist

Before presenting live in front of the judges:
1. Open the production URL in Google Chrome / Brave.
2. Navigate to `/test` to verify all API routes return green (`200 OK`).
3. Click the first demo pill: `500 Howard St, San Francisco, CA 94105`.
4. Click **Start Deal →** once to warm the serverless instance and LRU cache.
5. You are 100% ready for an unbroken, 0-latency live judge demo.
