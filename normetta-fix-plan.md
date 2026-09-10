# normetta.com — Conversion Fix Plan

Diagnosis: high traffic, near-zero real conversions. Two separate problems are tangled together — traffic quality and page conversion. Fix in this order, because step 1 tells you whether steps 3+ are even needed yet.

## 1. Confirm and cut bot traffic (this week)

- [ ] Check which Cloudflare plan normetta.com is on. Free only gets **Bot Fight Mode** (blunt challenge, no visibility). Pro/Business gets **Super Bot Fight Mode** with a bot score per request and an actual Bot Analytics view — worth knowing before trusting any traffic number.
- [ ] Pull raw traffic patterns before changing anything: request paths, user-agents, geography, session duration, bounce pattern. Real ISO 9001 buyers behave differently from scrapers — they hit pricing, the demo video, maybe the clause matrix; bots hit `/` and leave, or crawl every URL in seconds.
- [ ] Turn on Bot Fight Mode (Free) or Super Bot Fight Mode (Pro+).
- [ ] Add Cloudflare Turnstile to the trial-signup form specifically (see `turnstile-integration.md`). This is the fastest real signal: bots essentially never solve a challenge just to abandon a form, so post-Turnstile signup volume vs. pre-Turnstile tells you how much of your "conversion" funnel was ever human.
- [ ] Re-baseline after ~1 week of clean data. Only then decide whether the *human* conversion rate is actually bad, or was just never being measured.

References: [Cloudflare bot-stopping playbook](https://developers.cloudflare.com/use-cases/solutions/stop-malicious-bots/), [Bot Management overview](https://developers.cloudflare.com/bots/get-started/bot-management/)

## 2. Decide on the AI-crawler block deliberately

- [ ] normetta.com's `robots.txt` currently disallows AI crawlers outright (`ai-train=no`, ClaudeBot and others blocked). That's a legitimate IP-protection choice, but it also means normetta will never get cited by ChatGPT/Perplexity/Claude answers on "ISO 9001 software" — a discovery channel a lean B2B SaaS usually wants. This is in direct tension with the GeoRank project (serving AI-optimized content *to* LLM crawlers). Worth a conscious decision rather than a default: block AI training but allow reference/citation crawlers, or keep the full block — but pick it on purpose.

## 3. Fix the landing page conversion gaps (once traffic is clean)

Reviewed live on normetta.com:

- [ ] **Add social proof.** Currently zero testimonials, logos, or user counts. For compliance software this is usually the single biggest lever — buyers won't trust an audit tool with no evidence anyone else uses it. Even 2–3 early-user quotes or a "used by N companies" counter would help.
- [ ] **Fix the Professional tier pricing gap.** It currently shows "coming soon" + waitlist, sitting between a €0 Free tier and a Custom-priced Enterprise tier — there's no price anchor at all for a mid-size buyer, which is a hard stop for anyone comparing options. Ship a real number, even a placeholder range.
- [ ] **Add compliance/security badges.** The page claims "EU data storage" next to zero third-party certification (SOC 2, ISO 27001) — a credibility gap on a product literally selling compliance trust.
- [ ] **Resolve the language mixing.** Page blends Swedish and English. Decide on one primary language with a real toggle, rather than blended copy, especially if targeting EU SMEs broadly rather than only Swedish buyers.

## Sequence

1. Bot protection + Turnstile on signup (this week)
2. Let 3–7 days of clean data accumulate
3. Decide the robots.txt/AI-crawler question
4. Re-evaluate real conversion rate — if still weak, work the trust-signal and pricing fixes in section 3
