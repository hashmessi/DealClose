import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
let key = "";
envContent.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) {
    key = l.split("=")[1].replace(/["']/g, "").trim();
  }
});

const candidates = [
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "z-ai/glm-5.2:free",
  "minimax/minimax-m3:free",
  "nvidia/nemotron-3.5-lightning:free",
  "liquid/lfm-2.5-2.6b:free",
  "poolside/laguna-s-2.1:free"
];

async function findWorkingModel() {
  for (const model of candidates) {
    process.stdout.write(`Testing ${model}... `);
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
          model: model,
          messages: [{ role: "user", content: "Reply with the exact word: OK" }],
          max_tokens: 10,
        }),
      });
      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        console.log(`\x1b[32m[SUCCESS!]\x1b[0m Answer: "${data.choices[0].message.content.trim()}"`);
        return model;
      } else {
        console.log(`\x1b[31m[${res.status}]\x1b[0m ${data.error?.message || "Error"}`);
      }
    } catch (e) {
      console.log(`\x1b[31m[ERR]\x1b[0m ${e.message}`);
    }
  }
}

findWorkingModel();
