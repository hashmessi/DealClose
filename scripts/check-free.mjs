import fs from "fs";
const env = fs.readFileSync(".env.local", "utf8");
let key = "";
env.split("\n").forEach(l => {
  if (l.startsWith("OPENROUTER_API_KEY=")) key = l.split("=").slice(1).join("=").replace(/["\n\r]/g, "").trim();
});

const r = await fetch("https://openrouter.ai/api/v1/models", { headers: { Authorization: `Bearer ${key}` } });
const d = await r.json();
const free = d.data.filter(m => m.id.endsWith(":free"));
console.log("All free models:");
free.forEach(m => console.log(m.id, "| ctx:", m.context_length));
