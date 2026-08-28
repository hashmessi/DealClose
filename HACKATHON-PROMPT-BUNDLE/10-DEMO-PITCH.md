# PROMPT 10 — DEMO SCRIPT & PITCH PREP
## Agent: Product Strategist + Demo Coach
## Time Budget: 15 minutes max

---

## CONTEXT
Product: [NAME]
Problem solved: [1 sentence]
Live URL: [URL from Prompt 09]
Core flow: [PASTE]
Judging criteria: [Innovation / Impact / Technical Depth / Completeness]

---

## YOUR JOB
Build the demo script and pitch narrative. Judges decide in the first 60 seconds. Make those 60 seconds count.

---

## PITCH STRUCTURE (3 minutes total)

### 00:00–00:20 — THE HOOK
One sentence. What pain. Who feels it. Why it sucks today.
> "Every [user] has to [painful thing] and it [consequence]. We fixed that."

Do NOT start with "Hi, we built an AI app that..."

### 00:20–00:40 — THE INSIGHT
What's the non-obvious idea that makes your solution work?
> "The key insight is [X] — which nobody else has done because [reason]."

This is your differentiator. Say it clearly.

### 00:40–01:30 — LIVE DEMO (the most important part)
Walk through the core flow. Live. On the real URL.
- Input something real (not placeholder data)
- Show the AI doing something impressive
- Show the result in a way that makes judges say "oh"

**Demo script:**
1. Open [URL]
2. [Do action 1] → say: "[what this is and why it matters]"
3. [Do action 2] → say: "[what happens now]"
4. [Show result] → say: "[what this means for the user]"

Keep talking during AI loading — don't stand in silence.
Pre-warm: run the demo once before presenting so it's cached/fast.

### 01:30–02:00 — TECHNICAL DEPTH (for technical judges)
> "Under the hood: [what AI model + why], [what data flow], [what makes it non-trivial]."

Name specific technologies. Judges respect specificity.

### 02:00–02:30 — IMPACT & VISION
> "This helps [user] by [quantifiable outcome]. We could extend this to [next logical step]."

Don't oversell. One real impact statement is better than five vague ones.

### 02:30–03:00 — CLOSE
> "It's live at [URL]. Here's the repo. Thank you."

No long goodbye. End clean.

---

## DEMO FAILURE CONTINGENCY PLAN

### If AI is slow
→ Pre-computed result ready in a tab. Show it and say "here's an example output we ran earlier."

### If live URL is down
→ Have `npm run dev` + ngrok running as backup.

### If a judge asks a hard technical question
→ "Great question. [Direct answer]. We handle [edge case] by [approach]."
→ Never say "we didn't think about that." Say "that's on the roadmap — here's how we'd approach it."

### If asked "why is this better than ChatGPT?"
→ "ChatGPT is a general tool. We built a specific workflow that [does X automatically] — [user] doesn't need prompt engineering, they just [do action]."

---

## JUDGE Q&A PREP

| Question | Answer |
|----------|--------|
| How does the AI work? | [model] + [specific prompt technique] + [output format] |
| How do you handle bad AI output? | [validation layer you built] |
| Is this scalable? | "For a hackathon, we optimized for correctness. For production: [brief answer]" |
| What's the business model? | [1 sentence — even if rough] |
| What would you build next? | [most impactful P1 feature] |

---

## PRE-DEMO CHECKLIST (run 10 min before presenting)
- [ ] Live URL loads without error
- [ ] Core flow runs end-to-end
- [ ] Demo data is ready (real, not Lorem Ipsum)
- [ ] Browser is full screen, no irrelevant tabs visible
- [ ] ngrok or backup is ready
- [ ] Each team member knows their speaking part
- [ ] Timer set for 3 minutes

## OUTPUT
Deliver: Finalized pitch script + demo walkthrough steps + Q&A answers
