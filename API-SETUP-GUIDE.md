# DealClose API Integration Guide

This guide provides step-by-step instructions for provisioning the API keys required in `.env.local` for the DealClose platform to function end-to-end.

---

## 1. OpenRouter (Gemini 2.0 Flash Lite)
**Purpose:** Structuring raw text into standardized JSON deal terms and calculating confidence scores using a high-quality free model.
**Key:** `OPENROUTER_API_KEY`

1. Go to the [OpenRouter Platform](https://openrouter.ai/).
2. Sign in or create an account.
3. Navigate to **Keys** in the dashboard.
4. Click **Create Key**.
5. Name it `DealClose Hackathon`.
6. Copy the key and paste it into `.env.local` as `OPENROUTER_API_KEY`.
*(OpenRouter provides free credits and free models like google/gemini-2.0-flash-lite-preview-02-05:free).*

---

## 2. SerpApi (Google Search Comps)
**Purpose:** Gathering real-time live market data and property comps.
**Key:** `SERPAPI_KEY`

1. Go to [SerpApi](https://serpapi.com/).
2. Create a free account or log in.
3. Navigate to your **Dashboard**.
4. Locate your **Private API Key**.
5. Copy the key and paste it into `.env.local` as `SERPAPI_KEY`.

---

## 3. Nutrient Document Web Services (DWS)
**Purpose:** Generating and merging the multi-page PDF Purchase Offer document.
**Key:** `NUTRIENT_API_KEY`

1. Go to the [Nutrient API portal](https://www.nutrient.io/products/document-generation-api/).
2. Sign up for a free developer account/trial.
3. Navigate to **API Keys** in the developer console.
4. Generate a new API Key.
5. Copy the key and paste it into `.env.local` as `NUTRIENT_API_KEY`.

---

## 4. Foxit eSign (Fusion Developer Portal)
**Purpose:** Routing the final PDF for legally-binding e-signatures.
**Keys:** `FOXIT_CLIENT_ID` and `FOXIT_CLIENT_SECRET`

1. Go to your **Foxit Developer Dashboard** (where you see **eSign API** on the left).
2. Under "Your credentials are live and pre-filled below":
   - Copy the **CLIENT ID** (e.g., `foxit_aBiY7N...`) and paste it into `.env.local` as `FOXIT_CLIENT_ID`.
   - Click the eye icon or copy button next to **CLIENT SECRET** and paste it into `.env.local` as `FOXIT_CLIENT_SECRET`.
*(For demo purposes, the codebase falls back to a simulated envelope if these are left blank).*

---

## 5. Xano (Backend Database)
**Purpose:** Orchestrating deal states, storing structured data, and maintaining the audit trail.
**Key:** `XANO_API_URL`

1. Go to [Xano](https://xano.com/) and create a free workspace.
2. Create a new instance and add a table named `deal`.
3. In your Xano workspace, go to the **API** tab.
4. Select the default API group for your `deal` table.
5. Locate the **Base API URL** at the top right of the endpoints list.
6. Copy the URL (e.g., `https://x8ki-letl-twmt.n7.xano.io/api:XYZ`) and paste it into `.env.local` as `XANO_API_URL`.
*(For demo purposes, the frontend is configured to degrade gracefully if Xano is not connected).*

---

## Final Verification
Your `.env.local` should look like this:
```env
SERPAPI_KEY="secret_..."
XANO_API_URL="https://...xano.io/api:..."
OPENROUTER_API_KEY="sk-or-v1-..."
NUTRIENT_API_KEY="pdf_live_..."
FOXIT_CLIENT_ID="foxit_..."
FOXIT_CLIENT_SECRET="secret_..."
```

Run `npm run dev` to test the integrations locally.
