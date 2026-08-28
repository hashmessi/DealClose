import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
let key = "";
env.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) key = l.split("=").slice(1).join("=").replace(/["\n\r]/g, "").trim();
});

// Tight JSON prompt — same as actual deal extraction
const systemPrompt = `Return ONLY valid JSON. No explanation:
{"offer_price":750000,"earnest_money":22500,"closing_days":30,"contingency_financing":true,"contingency_inspection":true,"seller_concessions":5000,"closing_costs_buyer":15000,"closing_costs_seller":10000,"confidence_scores":{"offer_price":95,"earnest_money":90,"closing_days":95,"contingency_financing":90,"contingency_inspection":95,"seller_concessions":70,"closing_costs_buyer":90,"closing_costs_seller":75},"rationale":"Comps analysis"}`;

const candidates = [
  "inclusionai/ling-3.0-flash-fin:free",
  "minimax/minimax-m2.7:free",
  "z-ai/glm-5.2:free",
  "nvidia/nemotron-3.5-lightning:free",
  "google/gemma-4-26b-a4b-it:free",
];

for (const model of candidates) {
  const t = Date.now();
  process.stdout.write(`${model}: `);
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "HTTP-Referer": "https://dealclose.ai", "X-Title": "DealClose" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: systemPrompt }], max_tokens: 300 }),
      signal: AbortSignal.timeout(15000),
    });
    const ms = Date.now() - t;
    const data = await r.json();
    const text = data.choices?.[0]?.message?.content || "";
    try { JSON.parse(text); console.log(`✅ ${ms}ms — VALID JSON`); } catch { console.log(`⚠️  ${ms}ms — Not JSON: "${text.slice(0, 60)}"`); }
  } catch (e) { console.log(`❌ ${Date.now()-t}ms — ${e.message}`); }
}
