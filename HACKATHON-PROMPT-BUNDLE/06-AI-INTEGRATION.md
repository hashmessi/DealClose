# PROMPT 06 — AI FEATURE INTEGRATION
## Agent: AI Integration Engineer
## Time Budget: 45 minutes max

---

## CONTEXT
AI model(s) available: [e.g. OpenAI GPT-4o, Gemini Flash, Groq Llama]
Core AI feature: [describe what AI must do — e.g. "analyze resume and return structured gaps"]
Data flowing into AI: [what user input + what from DB]
Expected AI output: [structured JSON / markdown / text]

---

## YOUR JOB
Build the AI integration layer. The output must feel like intelligent product behavior — not a raw chatbot. Every AI call must be engineered: correct model, tuned prompt, structured output, failure handling.

---

## SYSTEM PROMPT ENGINEERING

### Template
```typescript
const SYSTEM_PROMPT = `
You are [specific role, not "AI assistant"].
Your job is to [specific task in 1 sentence].

Input you will receive:
- [field 1]: [description]
- [field 2]: [description]

Output you must return (JSON only, no markdown):
{
  "[key]": "[description and type]",
  "[key]": "[description and type]"
}

Rules:
- [constraint 1]
- [constraint 2]
- If input is insufficient, return: { "error": "reason" }
`
```

### Prompt Engineering Rules
- Be the most specific version of a persona — not "helpful assistant"
- Always instruct JSON output if you need structured data
- Set explicit constraints (max length, format, what to avoid)
- Include a fallback instruction for bad input
- Test the prompt with edge cases before integrating

---

## OUTPUT PARSING & VALIDATION

```typescript
// After AI response
const raw = response.choices[0].message.content

let parsed: ExpectedType
try {
  parsed = JSON.parse(raw)
} catch {
  // AI returned non-JSON — handle gracefully
  return { error: 'AI response parsing failed', raw }
}

// Validate with Zod
const validated = AIOutputSchema.safeParse(parsed)
if (!validated.success) {
  console.error('AI output validation failed', validated.error)
  return { error: 'Invalid AI response structure' }
}

return validated.data
```

---

## STREAMING (if applicable)
```typescript
// For long responses — stream to avoid timeout
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  stream: true,
})

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content || ''
  // Push delta to client via ReadableStream or SSE
}
```

---

## MODEL SELECTION GUIDE
| Use Case | Model | Reason |
|----------|-------|--------|
| Structured extraction | gpt-4o-mini | Fast, cheap, JSON reliable |
| Complex reasoning | gpt-4o | Slower but stronger |
| Real-time streaming | Groq Llama | Fastest response |
| Image analysis | gpt-4o (vision) | Multimodal |
| Embeddings | text-embedding-3-small | Cheapest, good quality |

---

## FAILURE HANDLING MATRIX
| Failure | Cause | Response |
|---------|-------|----------|
| API key invalid | Misconfigured env | 500 + log, generic error to user |
| Rate limit hit | Too many calls | Retry after 1s, max 2 retries |
| Timeout (>30s) | Long prompt | Return partial or timeout error |
| JSON parse fail | Model returned prose | Fallback to regex extract or re-prompt once |
| Empty response | Model refused | Return "Unable to process" message |

---

## COST CONTROL
- Use `max_tokens` — never leave it unlimited in hackathon
- Use `gpt-4o-mini` unless you need `gpt-4o`'s reasoning
- Cache responses where the input is identical (in-memory for hackathon)
- Log every API call cost estimate: `input_tokens * 0.00015 + output_tokens * 0.0006`

---

## INTEGRATION CHECKLIST
- [ ] System prompt returns correct format with happy-path input
- [ ] System prompt handles empty/garbage input (returns error not crash)
- [ ] JSON output parses correctly and matches Zod schema
- [ ] Failure states (timeout, rate limit) are caught and handled
- [ ] AI result is displayed in UI in a readable, non-raw format
- [ ] No API key appears in client-side code or browser network tab

## OUTPUT
- AI feature name: 
- Prompt used: (paste final version)
- Test result with real input: (paste actual output)
- Status: `DONE` / `BLOCKED` / `NEEDS TUNING`
