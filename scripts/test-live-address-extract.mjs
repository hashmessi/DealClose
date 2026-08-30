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

const testAddrs = [
  "2646 Green St, San Francisco, CA 94123",
  "10480 Sunset Blvd, Los Angeles, CA 90077",
  "2100 Waverley St, Palo Alto, CA 94301",
  "1380 Waverly Rd, San Marino, CA 91108"
];

async function testAddr(address) {
  console.log(`\n======================================================`);
  console.log(`TESTING LIVE ADDRESS: ${address}`);
  console.log(`======================================================`);

  // Step 1: SerpApi
  const serpRes = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    address + " property details market comps price Zillow Redfin"
  )}&api_key=${process.env.SERPAPI_KEY}`);
  const serpData = await serpRes.json();
  console.log(`1. SerpApi: OK (${serpData.organic_results?.length} organic results)`);
  if (serpData.organic_results?.length) {
    console.log(`   Sample organic result: "${serpData.organic_results[0].title}"`);
    console.log(`   Snippet: "${serpData.organic_results[0].snippet?.slice(0, 120)}..."`);
  }

  // Step 2: OpenRouter AI structuring
  const serpSignal = (serpData.organic_results || []).slice(0, 3).map(r => r.snippet).join("\n");
  const userContent = `Property Address: ${address}\n\nMarket Intelligence:\n${serpSignal}`;

  const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://dealclose.ai",
      "X-Title": "DealClose",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
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
  console.log(`2. OpenRouter AI response:`);
  console.log(aiData.choices?.[0]?.message?.content?.slice(0, 300) || aiData);
}

async function main() {
  for (const addr of testAddrs) {
    await testAddr(addr);
    break; // test first one first
  }
}

main();
