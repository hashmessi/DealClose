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

const address = "2646 Green St, San Francisco, CA 94123";

async function test() {
  console.log("Fetching SerpApi data for:", address);
  const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    address + " property details market comps price Zillow Redfin"
  )}&api_key=${process.env.SERPAPI_KEY}`;
  const serpRes = await fetch(serpUrl);
  const rawSerpData = await serpRes.json();

  console.log("Testing extract logic...");
  // Let's test calling our Next dev server if running on 3000
  try {
    const res = await fetch("http://localhost:3000/api/ai/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        rawSerpData,
        dealId: "deal_test_123"
      })
    });
    const data = await res.json();
    console.log("Next.js /api/ai/extract status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("Local server error / not running on port 3000:", err.message);
  }
}

test();
