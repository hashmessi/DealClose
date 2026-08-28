# DealClose — Post-Deployment Verification Protocol

> **Senior DevOps & QA Protocol**  
> *"Do not claim deployment success until it is actually verified across all 8 boundaries."*

---

## 8-Step Verification Matrix

| # | Boundary | Method / Command | Expected Output | Status |
|---|---|---|---|:---:|
| 1 | **Build Integrity** | `npm run build` | Turbopack compilation with 0 errors and 0 warnings | ✅ PASS |
| 2 | **Application Startup** | `curl -I http://localhost:3000` | HTTP 200 OK with `Content-Type: text/html` | ✅ PASS |
| 3 | **Frontend Rendering** | Browser navigation to `/` | Brutalist layout loads, fonts render, pipeline step bar is idle | ✅ PASS |
| 4 | **Backend Health Check** | `GET /api/test/connections` | `{ serpapi: ok, ai: ok, xano: ok, pdf: ok, foxit: ok }` | ✅ PASS |
| 5 | **State & Audit Vault** | `GET /api/deal/audit?dealId=test` | HTTP 200 OK returning structured audit certificate object | ✅ PASS |
| 6 | **Critical API (Intake)** | `POST /api/deal` with valid address | Returns `{ success: true, dealId: "...", data: {...} }` | ✅ PASS |
| 7 | **AI Structuring & Fallback** | `POST /api/ai/extract` | Returns `{ success: true, dealTerms: {...}, confidenceScores: {...} }` | ✅ PASS |
| 8 | **Primary User Journey** | Full end-to-end dry run | 01 Intake -> 02 AI -> 03 HITL Gate -> 04 PDF -> 05 Foxit eSign | ✅ PASS |

---

## Step-by-Step Verification Runbook

### Step 1: Verify Production Build
```bash
npx tsc --noEmit
npm run build
```
- **Verification Rule:** Must exit with code `0`. Static and dynamic API routes must be listed without type errors.

---

### Step 2: Verify Application Startup & Route Availability
```bash
# Verify base page response
curl -I http://localhost:3000
```
- **Expected:** `HTTP/1.1 200 OK`

---

### Step 3: Verify Frontend Visual & Interactive State
1. Open `http://localhost:3000` (or your deployed Vercel domain).
2. Confirm the **Pipeline Progress Bar** displays all 5 stages:
   - `01 MARKET INTEL (SerpApi)`
   - `02 AI STRUCTURE (OpenRouter AI)`
   - `03 HUMAN REVIEW (Trust Gate)`
   - `04 PDF COMPILE (Nutrient DWS)`
   - `05 ESIGN (Foxit)`
3. Confirm the demo address pills are clickable and populate the input field.

---

### Step 4: Verify Backend Health Check Endpoint
```bash
curl http://localhost:3000/api/test/connections
```
- **Expected Response:**
```json
{
  "success": true,
  "endpoints": {
    "dealIntake": "online",
    "aiStructuring": "online",
    "documentGeneration": "online",
    "esign": "online",
    "auditTrail": "online"
  }
}
```

---

### Step 5: Verify Persistent Audit Vault
```bash
# 1. Post a test audit log
curl -X POST http://localhost:3000/api/deal/audit \
  -H "Content-Type: application/json" \
  -d '{"dealId":"audit_verify_001","auditLogs":[{"field":"seller_concessions","ai_value":"7500","final_value":"10000","changed_by_human":true}]}'

# 2. Query the record back
curl "http://localhost:3000/api/deal/audit?dealId=audit_verify_001"
```
- **Expected:** Returns `certificateHash`, `auditCount: 1`, and `status: "human_verified"`.

---

### Step 6: Verify Critical API (SerpApi Intake)
```bash
curl -X POST http://localhost:3000/api/deal \
  -H "Content-Type: application/json" \
  -d '{"address":"500 Howard St, San Francisco, CA 94105"}'
```
- **Expected:** Returns `success: true` and populated `data.knowledge_graph` or `data.organic_results`.

---

### Step 7: Verify AI Structuring & Failover Chain
```bash
curl -X POST http://localhost:3000/api/ai/extract \
  -H "Content-Type: application/json" \
  -d '{"address":"500 Howard St, San Francisco, CA 94105","dealId":"deal_test_1"}'
```
- **Expected:** Returns `success: true`, `dealTerms.offer_price > 0`, `confidenceScores`, and at least 2 `flaggedFields` for human review.

---

### Step 8: Execute Primary User Journey (End-to-End)
1. **Intake:** Click `500 Howard St, San Francisco, CA 94105` → Click **Start Deal →**.
2. **Review Intel:** Confirm the collapsible *Live Market Intelligence* panel opens and displays comps.
3. **AI Structuring:** Click **Run AI Structuring →**. Confirm the 3-step micro-progress indicators animate and resolve.
4. **Human Review Gate:** 
   - Notice flagged fields (e.g. `seller_concessions`, `closing_costs_seller`).
   - Modify one field value → Click **Authorize Override**.
   - For remaining fields, click **Accept AI Value**.
5. **PDF Compilation:** Click **Finalize & Generate Offer PDF →**.
   - Confirm Nutrient DWS PDF renders in the inline iframe viewport.
   - Confirm **Trust Audit Trail** renders with override badges.
   - Click **⤓ Export Certificate (.JSON)** and verify the downloaded file.
6. **Foxit eSign Dispatch:** Enter buyer email → Click **Send for Signature via Foxit eSign →**.
   - Confirm the black **DEAL CLOSED** card renders with Envelope ID and complete audit summary.
   - Click **Start a New Deal →** to verify atomic state reset.

---

## Verdict
When all 8 checks succeed, the build is **100% Certified Production Ready**.
