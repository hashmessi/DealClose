import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
let key = "";
envContent.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) {
    key = l.split("=")[1].replace(/["']/g, "").trim();
  }
});

async function testFallback() {
  console.log("Testing OpenRouter fallback chain...");
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
      models: [
        "google/gemma-4-31b-it:free",
        "nvidia/nemotron-3.5-lightning:free",
        "dots-studio/dots-3-note-preview:free"
      ],
      messages: [{ role: "user", content: "Reply with the exact word: OK" }],
      max_tokens: 10,
    }),
  });

  console.log("HTTP status:", res.status);
  const data = await res.json();
  console.log("Response Choice:", data.choices?.[0]?.message?.content);
  console.log("Model Used:", data.model);
}

testFallback();
