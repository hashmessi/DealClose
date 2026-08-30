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

const addressesToTest = [
  "2646 Green St, San Francisco, CA 94123", // Famous Pacific Heights SF home
  "10697 Somma Way, Los Angeles, CA 90077", // Bel Air luxury residence
  "10480 Sunset Blvd, Los Angeles, CA 90077", // Holmby Hills residence
  "2100 Waverley St, Palo Alto, CA 94301", // Classic Palo Alto Silicon Valley residence
  "742 Evergreen Terrace, Springfield, OR 97477",
  "10080 Cielo Dr, Beverly Hills, CA 90210",
  "1380 Waverly Rd, San Marino, CA 91108"
];

async function testAddress(address) {
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing Address: "${address}"`);
  const serpApiKey = process.env.SERPAPI_KEY;
  const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(
    address + " property details market comps price Zillow Redfin"
  )}&api_key=${serpApiKey}`;

  const t0 = Date.now();
  const serpRes = await fetch(serpUrl);
  const serpData = await serpRes.json();
  const serpTime = Date.now() - t0;

  console.log(`SerpApi: ${serpRes.status} in ${serpTime}ms`);
  if (serpData.knowledge_graph) {
    console.log(`Knowledge Graph:`, serpData.knowledge_graph.title || "Yes", serpData.knowledge_graph.type || "");
  }
  const comps = (serpData.organic_results || []).slice(0, 3).map(r => ({
    title: r.title,
    snippet: r.snippet?.slice(0, 100)
  }));
  console.log(`Top Comps:`, comps);
}

async function run() {
  for (const addr of addressesToTest.slice(0, 4)) {
    await testAddress(addr);
  }
}

run();
