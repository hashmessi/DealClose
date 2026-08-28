import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
let key = "";
env.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) key = l.split("=").slice(1).join("=").replace(/["\n\r]/g, "").trim();
});

const SYSTEM_PROMPT = `You are a real estate deal structuring assistant. Analyze property market data and return ONLY a valid JSON object — no explanation, no markdown, no preamble.

Required JSON schema (all fields required):
{"offer_price":number,"earnest_money":number,"closing_days":number,"contingency_financing":boolean,"contingency_inspection":boolean,"seller_concessions":number,"closing_costs_buyer":number,"closing_costs_seller":number,"confidence_scores":{"offer_price":number,"earnest_money":number,"closing_days":number,"contingency_financing":number,"contingency_inspection":number,"seller_concessions":number,"closing_costs_buyer":number,"closing_costs_seller":number},"rationale":string}

Rules: confidence_scores 0-100, at least 2 fields below 85, offer_price 97-99% of market value. Return ONLY JSON.`;

const serpSignal = `Property: 500 Howard St, San Francisco CA | Type: Commercial/Mixed Use | Est. Value: $2,800,000 | Year Built: 1985 | Last Sold: $1,200,000 (2019)
High-rise commercial building located in SoMa, San Francisco. Recent comps show sales at $2.7M-$3.1M range. Current market cap rate 4.2%. Seller concessions rare in SF market.`;

function parseJsonSafe(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const fm = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fm) { try { return JSON.parse(fm[1].trim()); } catch {} }
  const bm = text.match(/\{[\s\S]*\}/);
  if (bm) { try { return JSON.parse(bm[0]); } catch {} }
  return null;
}

const models = ["minimax/minimax-m2.7:free", "z-ai/glm-5.2:free", "nvidia/nemotron-3.5-lightning:free"];

for (const model of models) {
  const t = Date.now();
  process.stdout.write(`\nTesting ${model}...\n`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": "https://dealclose.ai", "X-Title": "DealClose" },
      body: JSON.stringify({ model, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: `Property Address: 500 Howard St, San Francisco, CA\n\nMarket Intelligence:\n${serpSignal}` }], max_tokens: 800 }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const ms = Date.now() - t;
    if (!res.ok) { console.log(`  ❌ HTTP ${res.status} (${ms}ms)`); continue; }
    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    const parsed = parseJsonSafe(rawText);
    if (parsed && typeof parsed.offer_price === "number") {
      console.log(`  ✅ VALID JSON in ${ms}ms`);
      console.log(`     offer_price: $${parsed.offer_price.toLocaleString()}`);
      console.log(`     earnest_money: $${parsed.earnest_money?.toLocaleString()}`);
      console.log(`     flagged: ${Object.entries(parsed.confidence_scores||{}).filter(([,v])=>v<85).map(([k])=>k).join(", ")}`);
      break;
    } else {
      console.log(`  ⚠️  Not JSON (${ms}ms): "${rawText.slice(0, 100)}"`);
    }
  } catch (e) {
    clearTimeout(timer);
    console.log(`  ❌ ${e.name === "AbortError" ? "TIMEOUT 30s" : e.message} (${Date.now()-t}ms)`);
  }
}
