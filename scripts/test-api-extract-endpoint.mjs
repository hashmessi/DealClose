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

const addresses = [
  "2646 Green St, San Francisco, CA 94123",
  "10480 Sunset Blvd, Los Angeles, CA 90077",
  "2100 Waverley St, Palo Alto, CA 94301"
];

async function testOne(address) {
  console.log(`\n======================================================`);
  console.log(`TESTING: ${address}`);
  console.log(`======================================================`);
  const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    address + " property details market comps price Zillow Redfin"
  )}&api_key=${process.env.SERPAPI_KEY}`;
  const serpRes = await fetch(serpUrl);
  const rawSerpData = await serpRes.json();

  const res = await fetch("http://localhost:3000/api/ai/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address,
      rawSerpData,
      dealId: "deal_test_" + Date.now()
    })
  });
  const data = await res.json();
  console.log("Offer Price:", `$${data.dealTerms?.offer_price?.toLocaleString()}`);
  console.log("Flagged Fields:", data.flaggedFields);
  console.log("Confidence Scores for Flagged Fields:", data.flaggedFields.map(f => `${f}: ${data.confidenceScores?.[f]}%`));
}

async function run() {
  for (const a of addresses) {
    await testOne(a);
  }
}

run();
