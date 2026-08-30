import fs from "fs";

const env = fs.readFileSync(".env.local", "utf8");
let key = "";
env.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) key = l.split("=").slice(1).join("=").replace(/["\n\r]/g, "").trim();
});

const candidates = [
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "z-ai/glm-5.2:free",
  "minimax/minimax-m2.7:free",
  "liquid/lfm-2.5-2.6b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free"
];

async function testPrompt(model) {
  const t0 = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "HTTP-Referer": "https://dealclose.ai",
        "X-Title": "DealClose",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a real estate assistant. Return ONLY valid JSON: {\"offer_price\": 1200000, \"earnest_money\": 36000, \"closing_days\": 30, \"contingency_financing\": true, \"contingency_inspection\": true, \"seller_concessions\": 10000, \"closing_costs_buyer\": 24000, \"closing_costs_seller\": 18000, \"confidence_scores\": {\"offer_price\": 95, \"earnest_money\": 92, \"closing_days\": 90, \"contingency_financing\": 88, \"contingency_inspection\": 94, \"seller_concessions\": 70, \"closing_costs_buyer\": 91, \"closing_costs_seller\": 75}, \"rationale\": \"Market comps benchmarked.\"}" },
          { role: "user", content: "Property: 2646 Green St, San Francisco, CA" }
        ],
        max_tokens: 300,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(6000)
    });
    const ms = Date.now() - t0;
    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.slice(0, 80).replace(/[\r\n]/g, " ");
      console.log(`[PASS] ${model} (${ms}ms): ${text}`);
    } else {
      console.log(`[FAIL ${res.status}] ${model} (${ms}ms)`);
    }
  } catch (e) {
    console.log(`[ERR] ${model}: ${e.message}`);
  }
}

async function run() {
  for (const m of candidates) {
    await testPrompt(m);
  }
}

run();
