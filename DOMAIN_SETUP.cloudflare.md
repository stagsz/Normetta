# Cloudflare DNS Setup for `audit-flow.org` → Vercel

Use this inside Cloudflare DNS for the `audit-flow.org` zone.

## Step 1 — Add the root domain record

In Cloudflare DNS, add:

**Option A: CNAME at root (preferred)**
- Type: `CNAME`
- Name: `@`
- Target: `cname.vercel-dns.com`
- Proxy status: DNS only while verifying
- TTL: 1 minute

**Option B: A records (if Cloudflare blocks `@` CNAME)**
- Type: `A`
- Name: `@`
- Content: `76.76.21.21`
- Proxy status: DNS only while verifying
- TTL: 1 minute

Add a second A record:
- Type: `A`
- Name: `@`
- Content: `76.76.19.129`

## Step 2 — Add the WWW record

- Type: `CNAME`
- Name: `www`
- Content: `cname.vercel-dns.com`
- Proxy status: DNS only while verifying
- TTL: 1 minute

## Step 3 — Configure redirect rule for www → non-www

In Vercel Project Settings:
1. Go to **Settings → Domains**
2. Set `audit-flow.org` as primary domain
3. Vercel will handle the proper configuration

In Cloudflare DNS, keep both `audit-flow.org` and `www.audit-flow.org` pointing to Vercel.

## Step 4 — Vercel configuration

1. In Vercel → Project → Settings → Domains, add:
   - `audit-flow.org`
   - `www.audit-flow.org`

2. In Vercel → Settings → Environment Variables, add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://audit-flow.org/_/backend/api`
   - Target: Production

3. Redeploy the latest `main` branch

## Step 5 — Verify

After DNS propagates (usually 5-30 minutes):
- https://audit-flow.org
- https://audit-flow.org/_/backend/api/health

Both should return 200.

## Notes
- Keep Cloudflare proxy OFF until Vercel confirms the domain is working
- The old Vercel URL `audit-flow-zeta.vercel.app` remains available
