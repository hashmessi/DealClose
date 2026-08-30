import fs from "fs";
import path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const targetAddress = "2100 Waverley St, Palo Alto, CA 94301";

async function run() {
  console.log(`=== TESTING FULL LIVE PIPELINE FOR: ${targetAddress} ===`);
  
  // 1. SerpApi
  console.log("\n[1/4] Running Live SerpApi Intake...");
  const t0 = Date.now();
  const serpRes = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    targetAddress + " property details market comps price Zillow Redfin"
  )}&api_key=${process.env.SERPAPI_KEY}`);
  const serpData = await serpRes.json();
  console.log(`✓ SerpApi fetched in ${Date.now() - t0}ms. Results:`, serpData.organic_results?.length || 0);

  // 2. OpenRouter AI structuring
  console.log("\n[2/4] Running OpenRouter AI Structuring...");
  const t1 = Date.now();
  const serpSignal = (serpData.organic_results || []).slice(0, 3).map(r => r.snippet).join("\n");
  const userContent = `Property Address: ${targetAddress}\n\nMarket Intelligence:\n${serpSignal}`;

  const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://dealclose.ai",
      "X-Title": "DealClose",
    },
    body: JSON.stringify({
      model: "minimax/minimax-m2.7:free",
      messages: [
        { 
          role: "system", 
          content: `You are a real estate deal structuring assistant. Analyze property market data and return ONLY a valid JSON object.
Schema:
{
  "offer_price": number,
  "earnest_money": number,
  "closing_days": number,
  "contingency_financing": boolean,
  "contingency_inspection": boolean,
  "seller_concessions": number,
  "closing_costs_buyer": number,
  "closing_costs_seller": number,
  "confidence_scores": {
    "offer_price": number,
    "earnest_money": number,
    "closing_days": number,
    "contingency_financing": number,
    "contingency_inspection": number,
    "seller_concessions": number,
    "closing_costs_buyer": number,
    "closing_costs_seller": number
  },
  "rationale": string
}
Rules: confidence_scores 0-100, at least 2 fields <85. Return ONLY JSON.`
        },
        { role: "user", content: userContent },
      ],
      max_tokens: 450,
      temperature: 0.1,
    }),
  });

  const aiData = await aiRes.json();
  console.log(`✓ OpenRouter returned in ${Date.now() - t1}ms`);
  const rawText = aiData.choices?.[0]?.message?.content || "";
  console.log("Raw AI response:\n", rawText);
}

run();
