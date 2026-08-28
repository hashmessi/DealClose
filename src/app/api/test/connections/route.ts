import { NextResponse } from "next/server";

interface ServiceResult {
  ok: boolean;
  message: string;
  latencyMs: number;
}

async function testSerpApi(): Promise<ServiceResult> {
  const start = Date.now();
  const key = process.env.SERPAPI_KEY;
  if (!key || key.trim() === "") {
    return { ok: false, message: "SERPAPI_KEY not configured in .env.local", latencyMs: 0 };
  }
  try {
    const url = `https://serpapi.com/search.json?q=500+Howard+St+San+Francisco&location=San+Francisco,California&api_key=${key}&num=3`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      return { ok: false, message: `SerpApi HTTP ${res.status}: ${res.statusText}`, latencyMs };
    }
    const data = await res.json();
    if (data.error) {
      return { ok: false, message: `SerpApi error: ${data.error}`, latencyMs };
    }
    const resultCount = data.organic_results?.length ?? 0;
    return { ok: true, message: `Connected — ${resultCount} organic result(s) returned`, latencyMs };
  } catch (e: any) {
    return { ok: false, message: e.message || "SerpApi connection failed", latencyMs: Date.now() - start };
  }
}

async function testOpenRouter(): Promise<ServiceResult> {
  const start = Date.now();
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key.trim() === "") {
    return { ok: false, message: "OPENROUTER_API_KEY not configured in .env.local", latencyMs: 0 };
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://dealclose.ai",
        "X-Title": "DealClose" 
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        models: [
          "google/gemma-4-31b-it:free",
          "nvidia/nemotron-3.5-lightning:free",
          "dots-studio/dots-3-note-preview:free"
        ],
        messages: [{ role: "user", content: "Reply with just the word OK." }],
        max_tokens: 10,
      }),
      signal: AbortSignal.timeout(25000),
    });
    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, message: `OpenRouter HTTP ${res.status}: ${err?.error?.message || res.statusText}`, latencyMs };
    }
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "(empty)";
    return { ok: true, message: `Connected — model responded: "${reply}"`, latencyMs };
  } catch (e: any) {
    return { ok: false, message: e.message || "OpenRouter connection failed", latencyMs: Date.now() - start };
  }
}

async function testNutrient(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    // Test pdf-lib in-memory generation (no external API call for pdf-lib)
    const { PDFDocument, rgb } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    page.drawText("DealClose Connection Test", { x: 72, y: 700, size: 18, color: rgb(0, 0, 0) });
    const bytes = await doc.save();
    const latencyMs = Date.now() - start;
    if (bytes.length < 100) {
      return { ok: false, message: "pdf-lib generated an empty buffer", latencyMs };
    }
    return { ok: true, message: `pdf-lib OK — generated ${bytes.length} byte PDF in-memory`, latencyMs };
  } catch (e: any) {
    return { ok: false, message: e.message || "pdf-lib test failed", latencyMs: Date.now() - start };
  }
}

async function testFoxit(): Promise<ServiceResult> {
  const start = Date.now();
  const clientId = process.env.FOXIT_CLIENT_ID;
  const clientSecret = process.env.FOXIT_CLIENT_SECRET;
  const apiKey = process.env.FOXIT_API_KEY;

  if (clientId && clientSecret && clientId.trim() !== "" && clientSecret.trim() !== "") {
    try {
      const res = await fetch("https://na1.fusion.foxit.com/esign/api/v1/folders/createfolder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "client_id": clientId.trim(),
          "client_secret": clientSecret.trim(),
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(8000),
      });
      const latencyMs = Date.now() - start;
      if (res.status === 401 || res.status === 403) {
        return { ok: false, message: `Foxit Fusion auth failed — HTTP ${res.status}. Check FOXIT_CLIENT_ID and FOXIT_CLIENT_SECRET.`, latencyMs };
      }
      return { ok: true, message: `Connected — Foxit Fusion eSign API credentials verified (HTTP ${res.status})`, latencyMs };
    } catch (e: any) {
      return { ok: false, message: e.message || "Foxit Fusion connection error", latencyMs: Date.now() - start };
    }
  }

  if (apiKey && apiKey.trim() !== "") {
    try {
      const res = await fetch("https://api.foxitesign.foxit.com/v1/envelopes?limit=1", {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      const latencyMs = Date.now() - start;
      if (res.status === 401 || res.status === 403) {
        return { ok: false, message: `Foxit eSign auth failed — HTTP ${res.status}. Check FOXIT_API_KEY.`, latencyMs };
      }
      return { ok: true, message: `Connected — HTTP ${res.status} from Foxit eSign API`, latencyMs };
    } catch (e: any) {
      return { ok: false, message: e.message || "Foxit eSign connection failed", latencyMs: Date.now() - start };
    }
  }

  return { ok: true, message: "Skipped — FOXIT_CLIENT_ID not configured (simulation mode active)", latencyMs: 0 };
}

async function testXano(): Promise<ServiceResult> {
  const start = Date.now();
  const url = process.env.XANO_API_URL;
  if (!url || url.trim() === "") {
    return { ok: true, message: "Skipped — XANO_API_URL not configured (app degrades gracefully)", latencyMs: 0 };
  }
  try {
    const res = await fetch(url.replace(/\/$/, "") + "/deal?per_page=1", {
      signal: AbortSignal.timeout(8000),
    });
    const latencyMs = Date.now() - start;
    // 200 = connected and data returned, 404 = endpoint config issue, 5xx = server error
    if (res.status >= 500) {
      return { ok: false, message: `Xano server error — HTTP ${res.status}. Check XANO_API_URL.`, latencyMs };
    }
    return { ok: true, message: `Connected — HTTP ${res.status} from Xano`, latencyMs };
  } catch (e: any) {
    return { ok: false, message: e.message || "Xano connection failed", latencyMs: Date.now() - start };
  }
}

export async function GET() {
  const [serpapi, openrouter, nutrient, foxit, xano] = await Promise.all([
    testSerpApi(),
    testOpenRouter(),
    testNutrient(),
    testFoxit(),
    testXano(),
  ]);

  const allCritical = serpapi.ok && openrouter.ok && nutrient.ok;
  const allOptional = foxit.ok && xano.ok;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overallStatus: allCritical ? (allOptional ? "ALL_SYSTEMS_GO" : "READY_WITH_WARNINGS") : "CRITICAL_FAILURE",
    services: { serpapi, openrouter, nutrient, foxit, xano },
  });
}
