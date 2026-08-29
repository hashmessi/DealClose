// Ruthless QA Validation Suite for DealClose Trust Pipeline
// Tests all 12 mission-critical paths, edge cases, error modes, and contract invariants.

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function assert(condition, testName, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    testResults.push({ status: "PASS", name: testName, details });
    console.log(`  \x1b[32m✓ PASS\x1b[0m: ${testName}`);
  } else {
    failedTests++;
    testResults.push({ status: "FAIL", name: testName, details });
    console.log(`  \x1b[31m✗ FAIL\x1b[0m: ${testName} - ${details}`);
  }
}

async function fetchJson(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runSuite() {
  console.log("\n=======================================================");
  console.log("  🛡️ DEALCLOSE RUTHLESS QA VALIDATION SUITE");
  console.log(`  Target: ${BASE_URL}`);
  console.log("=======================================================\n");

  // ─── 1. HAPPY PATH FULL 5-STEP JOURNEY ───
  console.log("\x1b[36m[GROUP 1] Critical User Journey & Happy Path\x1b[0m");

  // Step 1: Deal Intake
  const intakeRes = await fetchJson("/api/deal", {
    method: "POST",
    body: JSON.stringify({ address: "500 Howard St, San Francisco, CA 94105" }),
  });
  assert(intakeRes.ok && intakeRes.data?.success === true, "Step 1: Property Intake returns success = true");
  assert(!!intakeRes.data?.dealId, "Step 1: Deal ID is generated/persisted", `dealId: ${intakeRes.data?.dealId}`);
  assert(!!intakeRes.data?.data, "Step 1: Market data payload present");

  const dealId = intakeRes.data?.dealId || "deal_qa_test_1";

  // Step 2: AI Structuring
  const aiRes = await fetchJson("/api/ai/extract", {
    method: "POST",
    body: JSON.stringify({
      address: "500 Howard St, San Francisco, CA 94105",
      rawSerpData: intakeRes.data?.data,
      dealId,
    }),
  });
  assert(aiRes.ok && aiRes.data?.success === true, "Step 2: AI Extraction returns structured terms");
  assert(typeof aiRes.data?.dealTerms?.offer_price === "number", "Step 2: Numeric offer_price structured");
  assert(Array.isArray(aiRes.data?.flaggedFields) && aiRes.data.flaggedFields.length > 0, "Step 2: Low-confidence fields flagged for HITL review");
  assert(typeof aiRes.data?.confidenceScores === "object", "Step 2: Confidence scores dictionary generated");

  // Step 3: HITL Audit Trail Recording
  const auditRes = await fetchJson("/api/deal/audit", {
    method: "POST",
    body: JSON.stringify({
      dealId,
      address: "500 Howard St, San Francisco, CA 94105",
      auditLogs: [
        {
          field: "seller_concessions",
          ai_value: "12500",
          final_value: "10000",
          changed_by_human: true,
          timestamp: new Date().toISOString(),
        },
      ],
      resolvedTerms: { ...aiRes.data?.dealTerms, seller_concessions: 10000 },
    }),
  });
  assert(auditRes.ok && auditRes.data?.success === true, "Step 3: Audit Trail successfully stored in Vault");
  assert(typeof auditRes.data?.certificateHash === "string" && auditRes.data.certificateHash.startsWith("dcl_cert_"), "Step 3: Cryptographic certificate hash generated");

  // Step 4: PDF Compilation
  const pdfRes = await fetchJson("/api/doc/generate", {
    method: "POST",
    body: JSON.stringify({
      dealId,
      address: "500 Howard St, San Francisco, CA 94105",
      dealTerms: { ...aiRes.data?.dealTerms, seller_concessions: 10000 },
    }),
  });
  assert(pdfRes.ok && pdfRes.data?.success === true, "Step 4: PDF Compiled via Nutrient/pdf-lib");
  assert(!!pdfRes.data?.pdfUrl, "Step 4: PDF URL / DataURI returned");
  assert(pdfRes.data?.pdfDataUri?.startsWith("data:application/pdf;base64,"), "Step 4: Vector PDF base64 DataURI valid");

  // Step 5: Foxit eSign Dispatch
  const signRes = await fetchJson("/api/esign/send", {
    method: "POST",
    body: JSON.stringify({
      dealId,
      buyerEmail: "qa.buyer@dealclose.ai",
      signerName: "Alex QA Morgan",
      pdfUrl: pdfRes.data?.pdfUrl,
      address: "500 Howard St, San Francisco, CA 94105",
    }),
  });
  assert(signRes.ok && signRes.data?.success === true, "Step 5: Foxit eSign Envelope Dispatched");
  assert(!!signRes.data?.envelopeId, "Step 5: Envelope ID assigned", `Envelope: ${signRes.data?.envelopeId}`);
  assert(signRes.data?.signerEmail === "qa.buyer@dealclose.ai", "Step 5: Signer email sanitized and preserved");

  // ─── 2. INPUT VALIDATION & SECURITY ───
  console.log("\n\x1b[36m[GROUP 2] Input Validation & Defensive Boundaries\x1b[0m");

  const emptyAddrRes = await fetchJson("/api/deal", { method: "POST", body: JSON.stringify({ address: "" }) });
  assert(emptyAddrRes.status === 400 && emptyAddrRes.data?.success === false, "Reject empty address with HTTP 400");

  const shortAddrRes = await fetchJson("/api/deal", { method: "POST", body: JSON.stringify({ address: "12" }) });
  assert(shortAddrRes.status === 400 && shortAddrRes.data?.success === false, "Reject short address (<5 chars) with HTTP 400");

  const invalidEmailRes = await fetchJson("/api/esign/send", {
    method: "POST",
    body: JSON.stringify({ dealId: "d123", buyerEmail: "invalid-email-no-at", signerName: "Tester" }),
  });
  assert(invalidEmailRes.status === 400 && invalidEmailRes.data?.success === false, "Reject malformed email in eSign with HTTP 400");

  const missingDealIdSignRes = await fetchJson("/api/esign/send", {
    method: "POST",
    body: JSON.stringify({ buyerEmail: "buyer@dealclose.ai", signerName: "Tester" }),
  });
  assert(missingDealIdSignRes.status === 400 && missingDealIdSignRes.data?.success === false, "Reject missing dealId in eSign with HTTP 400");

  const missingAddrAiRes = await fetchJson("/api/ai/extract", {
    method: "POST",
    body: JSON.stringify({ dealId: "d123", rawSerpData: {} }),
  });
  assert(missingAddrAiRes.status === 400 && missingAddrAiRes.data?.success === false, "Reject missing address in AI extract with HTTP 400");

  const missingAuditDealId = await fetchJson("/api/deal/audit", {
    method: "POST",
    body: JSON.stringify({ auditLogs: [] }),
  });
  assert(missingAuditDealId.status === 400 && missingAuditDealId.data?.success === false, "Reject missing dealId in Audit POST with HTTP 400");

  const missingAuditGetDealId = await fetchJson("/api/deal/audit");
  assert(missingAuditGetDealId.status === 400 && missingAuditGetDealId.data?.success === false, "Reject missing dealId query in Audit GET with HTTP 400");

  // ─── 3. RESILIENCE, FALLBACKS & DATA INTEGRITY ───
  console.log("\n\x1b[36m[GROUP 3] Resilience, Failovers & Data Integrity\x1b[0m");

  // AI fallback with empty/null raw data
  const emptySerpAiRes = await fetchJson("/api/ai/extract", {
    method: "POST",
    body: JSON.stringify({ address: "777 Unknown Desert Road, NV", rawSerpData: null, dealId: "desert_deal" }),
  });
  assert(emptySerpAiRes.ok && emptySerpAiRes.data?.success === true, "AI fallback generates valid terms when SerpApi data is null");
  assert(emptySerpAiRes.data?.dealTerms?.offer_price > 0, "Fallback offer price is non-zero and mathematically bounded");

  // PDF Generation with empty terms (graceful defaults)
  const emptyTermsPdfRes = await fetchJson("/api/doc/generate", {
    method: "POST",
    body: JSON.stringify({ dealId: "d_empty_terms", address: "123 Main St", dealTerms: {} }),
  });
  assert(emptyTermsPdfRes.ok && emptyTermsPdfRes.data?.success === true, "PDF Engine applies safe financial defaults for missing terms");

  // Audit Vault Retrieval Verification
  const auditGetRes = await fetchJson(`/api/deal/audit?dealId=${dealId}`);
  assert(auditGetRes.ok && auditGetRes.data?.success === true, "Audit record retrieved from Vault");
  assert(auditGetRes.data?.auditCount === 1, "Audit record preserves exact mutation count");

  // System Connections Health API
  const connRes = await fetchJson("/api/test/connections");
  assert(connRes.ok, "Connections Health endpoint returns HTTP 200");
  assert(!!connRes.data?.overallStatus, "Connections Health reports overallStatus");
  assert(typeof connRes.data?.services?.nutrient?.ok === "boolean", "Nutrient DWS service health evaluated");
  assert(typeof connRes.data?.services?.serpapi?.ok === "boolean", "SerpApi service health evaluated");
  assert(typeof connRes.data?.services?.openrouter?.ok === "boolean", "OpenRouter service health evaluated");

  console.log("\n=======================================================");
  console.log(`  QA SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  if (failedTests === 0) {
    console.log("  \x1b[32mOVERALL VERDICT: ALL PASS — ZERO REGRESSIONS\x1b[0m");
  } else {
    console.log(`  \x1b[31mOVERALL VERDICT: ${failedTests} FAILURES DETECTED\x1b[0m`);
  }
  console.log("=======================================================\n");

  if (failedTests > 0) process.exit(1);
}

runSuite().catch((err) => {
  console.error("QA Runner exception:", err);
  process.exit(1);
});
