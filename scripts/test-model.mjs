import fs from "fs";
import path from "path";

const envContent = fs.readFileSync(".env.local", "utf-8");
let key = "";
envContent.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) {
    key = l.split("=")[1].replace(/["']/g, "").trim();
  }
});

async function test() {
  console.log("Testing google/gemma-4-31b-it:free with OpenRouter...");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://dealclose.ai",
      "X-Title": "DealClose",
    },
    body: JSON.stringify({
      model: "google/gemma-4-31b-it:free",
      messages: [{ role: "user", content: "Reply with JSON: {\"status\": \"ok\"}" }],
    }),
  });

  console.log("HTTP status:", res.status);
  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

test();
