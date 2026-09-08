# Cloudflare Turnstile — signup form integration

Purpose: put a near-invisible challenge on the trial-signup form so bot signups stop polluting your conversion numbers, without adding friction for real visitors.

## 1. Create the widget (Cloudflare dashboard)

1. Cloudflare dashboard → **Turnstile** → **Add widget**.
2. Hostname: `normetta.com` (add any subdomains that host the form too).
3. Widget mode: **Managed** (Cloudflare decides invisible vs. interactive challenge based on risk — best default, least friction for real users).
4. Save. You get two keys:
   - **Site key** — public, goes in your HTML.
   - **Secret key** — private, goes on your server only. Never ship it to the browser or commit it to the repo; store it as an environment variable / Cloudflare secret.

## 2. Frontend: render the widget on the form

Add the script once (e.g. in `<head>`), and the widget div inside the signup `<form>`:

```html
<script
  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
  async
  defer
></script>

<form action="/api/trial-signup" method="POST">
  <input type="email" name="email" required />
  <!-- other signup fields -->

  <div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>

  <button type="submit">Start 30-day free trial</button>
</form>
```

Because the widget sits inside the `<form>`, Turnstile auto-creates a hidden field named `cf-turnstile-response` and submits its token along with the rest of the form — no extra JS wiring needed for a plain HTML form.

## 3. Backend: verify the token before creating the trial account

**Rule: never trust the frontend token by itself.** Always call Cloudflare's `siteverify` endpoint server-side and only proceed if `success: true`. Tokens expire after 5 minutes and can only be used once, so verify immediately on submit.

Endpoint: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`

### Option A — Cloudflare Pages Function (if the signup form is served from Cloudflare Pages)

`functions/api/trial-signup.js`:

```js
export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const token = formData.get("cf-turnstile-response");
  const email = formData.get("email");

  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY, // set via `wrangler secret put TURNSTILE_SECRET_KEY`
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP"),
      }),
    }
  );
  const verify = await verifyRes.json();

  if (!verify.success) {
    return new Response(
      JSON.stringify({ error: "Verification failed", codes: verify["error-codes"] }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // token is good — proceed with real trial signup logic (create account, send email, etc.)
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### Option B — generic Node/Express backend (if the site/API isn't on Cloudflare Pages Functions)

```js
import express from "express";
const app = express();
app.use(express.urlencoded({ extended: true }));

app.post("/api/trial-signup", async (req, res) => {
  const token = req.body["cf-turnstile-response"];
  const email = req.body.email;

  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: req.ip,
      }),
    }
  );
  const verify = await verifyRes.json();

  if (!verify.success) {
    return res.status(400).json({ error: "Verification failed", codes: verify["error-codes"] });
  }

  // token is good — proceed with real trial signup logic
  res.json({ ok: true });
});
```

## 4. What this buys you for the bot-traffic diagnosis

Once this is live, compare signup attempts before/after:
- Attempts that never even render/submit the widget (JS-less scrapers) → gone immediately.
- Attempts where `siteverify` returns `success: false` → still-automated but token-capable clients, now blocked before an account is created.
- What's left going through to real signups is your actual human conversion number — the thing worth optimizing next.

## Notes

- Managed mode is invisible for most legitimate visitors; only suspicious sessions get an interactive checkbox. This avoids adding real friction to genuine trial signups.
- If you later add Turnstile to other forms (contact sales, waitlist), reuse the same widget/site key or create a separate widget per form if you want separate analytics per surface.
- Common `error-codes` to watch for: `timeout-or-duplicate` (token reused/expired — usually a double-submit or slow network), `invalid-input-response` (malformed/expired token — often a scripted client sending a garbage or empty token).
