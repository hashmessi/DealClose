async function allFree() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  const data = await res.json();
  const free = data.data.filter(m => m.id.endsWith(":free"));
  console.log(`Total ${free.length} free models on OpenRouter:`);
  free.forEach(m => console.log(m.id));
}
allFree();
