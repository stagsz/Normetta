# Normetta Domain Setup

This document contains the exact steps to map `normetta.com` and `audit-flow.org` to the Normetta Vercel project.

## Project reference
- GitHub repo: https://github.com/stagsz/Normetta
- Vercel project: Normetta
- Current preview URL: https://normetta-zeta.vercel.app
- Production URL: https://www.normetta.com

---

## Step 1 — Confirm Vercel project and production branch

1. Open https://vercel.com and sign in as the project owner.
2. Select the **Normetta** project.
3. Go to **Settings → Git**.
4. Ensure the **Production Branch** is `main`.
5. Confirm that the repository origin is `https://github.com/stagsz/Normetta`.

---

## Step 2 — Add the production domain in Vercel

1. In the project, go to **Settings → Domains**.
2. Click **Add Domain**.
3. Enter: `www.normetta.com`
4. Click **Add**.
5. Also add `normetta.com` if you want apex traffic.

Vercel typically requires one of:
- **ALIAS/ANAME** at the domain apex → `cname.vercel-dns.com` or project target
- **A records** → `76.76.21.21` depending on Vercel guidance at add time
- **CNAME** for `www` or subdomains if used

Use exactly what Vercel shows in that modal; instructions change rarely but reflect the current account/project state.

---

## Step 3 — Configure the DNS at your registrar

1. Log in to your domain registrar for `normetta.com`.
2. Open DNS management for the zone.
3. Add the record Vercel displayed in Step 2 for `www.normetta.com`.
4. If you want apex `normetta.com` as well:
   - add the ALIAS/ANAME or A record Vercel showed for the root zone.

Propagation time:
- A/ALIAS: a few minutes to a few hours
- CNAME: usually faster

---

## Step 4 — Add the environment variable in Vercel

1. In the project, go to **Settings → Environment Variables**.
2. Add/update:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://www.normetta.com/_/backend/api`
   - Target: Production
3. Save.

This makes the frontend talk to the correct backend URL once the custom domain is live.

---

## Step 5 — Trigger a production deploy

Preferred: push the latest `main` branch to GitHub and let Vercel auto-deploy.

```bash
cd C:/Users/staff/anthropicFun/boardroom/AuditFlow
git add .
git commit -m "Use normetta.com as production domain"
git push origin main
```

Alternative: redeploy from the Vercel dashboard if you do not want to push right now.

---

## Step 6 — Verify

1. Open https://www.normetta.com
2. Confirm the landing page loads.
3. Open https://www.normetta.com/_/backend/api/health
4. Confirm the backend health responds.

If either fails:
- re-check the DNS record in Step 3
- re-check the Vercel domain entry in Step 2
- confirm the latest deploy finished in Vercel Deployments

---

## Notes
- Do not remove the old `normetta-zeta.vercel.app` URL until the custom domain is confirmed working.
- `audit-flow-backup-20260709` exists locally; remote history is unchanged on GitHub because no backup remote was pushed.
