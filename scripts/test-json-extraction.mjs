import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
let key = "";
envContent.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) {
    key = l.split("=")[1].replace(/["']/g, "").trim();
  }
});

async function testExtraction() {
  const prompt = `You are a real estate deal assistant. Return ONLY valid JSON matching:
{
  "offer_price": 750000,
  "earnest_money": 22500,
  "closing_days": 30,
  "contingency_financing": true,
  "contingency_inspection": true,
  "seller_concessions": 5000,
  "closing_costs_buyer": 15000,
  "closing_costs_seller": 10000,
  "confidence_scores": {
    "offer_price": 95,
    "earnest_money": 90,
    "closing_days": 95,
    "contingency_financing": 90,
    "contingency_inspection": 95,
    "seller_concessions": 70,
    "closing_costs_buyer": 90,
    "closing_costs_seller": 75
  },
  "rationale": "Sample comps extraction"
}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://dealclose.ai",
      "X-Title": "DealClose",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  console.log("Raw output:", data.choices?.[0]?.message?.content);
}

testExtraction();
