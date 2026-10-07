# Payment & Legal Setup - Implementation Plan (Mollie)

## Status: READY FOR IMPLEMENTATION ✅

This document tracks the complete setup of payment processing and legal compliance for AuditFlow using **Mollie** (European payment processor).

---

## 1. Legal Documents ✅ COMPLETE

### Created Files
- [x] `/docs/legal/TERMS_OF_SERVICE.md` - Complete ToS with GDPR compliance
- [x] `/docs/legal/PRIVACY_POLICY.md` - EU/GDPR-compliant privacy policy

### Key Features
- **Terms of Service:**
  - 3-tier pricing (Starter €49, Professional €149, Enterprise custom)
  - 14-day free trial policy
  - Refund policy (30 days for annual, no refunds for monthly)
  - Cancellation terms
  - Data ownership and security commitments
  - GDPR data processing agreement references
  - Swedish jurisdiction (Stockholm courts)

- **Privacy Policy:**
  - Full GDPR compliance (data subject rights, DPO contact)
  - EU data residency (Supabase eu-west-1)
  - Clear data retention periods
  - Third-party processor disclosure (Mollie, Vercel, Supabase)
  - Cookie policy (essential only, no tracking)
  - Data export and portability provisions

### Action Items
- [ ] **Replace placeholder address** in both docs:
  - Find: `[Your registered business address in Sweden]`
  - Replace with: Actual Greisz Consulting address (Guldkällegatan 37, 414 49 Göteborg, Sweden)
- [ ] **Set up email addresses:**
  - hello@auditflow.io (general support)
  - privacy@auditflow.io (GDPR inquiries)
  - dpo@auditflow.io (Data Protection Officer)
- [ ] **Legal review** (optional but recommended before launch):
  - Swedish lawyer for ToS/contract law compliance
  - GDPR specialist for privacy policy

---

## 2. Database Schema ✅ COMPLETE

### Created Files
- [x] `/supabase/migrations/007_payment_subscription_schema.sql`

### Tables Created
1. **subscription_plans** - Reference table for pricing tiers
2. **subscriptions** - Organization subscriptions with Mollie integration
3. **payments** - Payment history and invoice tracking
4. **subscription_usage** - Usage metrics for seat management
5. **mollie_webhook_events** - Webhook audit log

### Key Fields for Mollie
- `mollie_customer_id` - Mollie customer reference
- `mollie_subscription_id` - Mollie subscription reference
- `mollie_mandate_id` - SEPA Direct Debit mandate reference
- `mollie_payment_method_id` - Stored payment method token
- `method` - Payment method used (creditcard, sepa, ideal, bancontact, etc.)

### Helper Functions
- `has_active_subscription(org_id)` - Check if org has valid subscription
- `get_org_user_count(org_id)` - Get current user count
- `can_add_user(org_id)` - Enforce seat limits

### Action Items
- [ ] **Run migration:**
  ```bash
  # Connect to Supabase
  npx supabase db push --project-ref fqnorsqggyshqfmihivw
  # Or manually via SQL Editor in Supabase Dashboard
  ```
- [ ] **Update Mollie Price IDs** after creating recurring prices in Mollie:
  ```sql
  UPDATE subscription_plans SET mollie_price_id_monthly = 'prc_...' WHERE id = 'starter';
  UPDATE subscription_plans SET mollie_price_id_annual = 'prc_...' WHERE id = 'starter';
  -- Repeat for all plans
  ```

---

## 3. Mollie Integration 🚧 IN PROGRESS

### Why Mollie?
- **European** (Dutch), GDPR-native provider
- **Full subscription management** — create/update/cancel/pause, trials, proration
- **SEPA Direct Debit** — critical for EU B2B customers (invoice → auto-collect)
- **Local methods** — iDEAL (NL), Bancontact (BE), Sofort (DE), Cards, Swish via cards
- **VAT handling** — auto-calculates, validates VAT numbers (VIES), reverse-charge for B2B
- **Developer experience** — clean REST API, webhooks, test mode, great docs
- **Pricing** — €0.25 + 1.8% (cards), €0.25 + 0.8% (SEPA DD), no monthly fee

### Action Items

#### A. Mollie Account Setup
- [ ] Create Mollie account (https://www.mollie.com/dashboard/signup)
- [ ] Complete business verification (KYC required before going live)
- [ ] Enable features in Dashboard → Settings:
  - [ ] **Subscriptions** (recurring payments)
  - [ ] **Mandates** (for SEPA Direct Debit)
  - [ ] **Invoices** (auto-send receipts)
  - [ ] **VAT** (auto-calculate for EU customers)

#### B. Create Products & Recurring Prices
- [ ] Create "AuditFlow Starter" product
  - [ ] Monthly recurring price: €49.00 (copy Price ID → update DB)
  - [ ] Annual recurring price: €529.20 (copy Price ID → update DB)
- [ ] Create "AuditFlow Professional" product
  - [ ] Monthly recurring price: €149.00 (copy Price ID → update DB)
  - [ ] Annual recurring price: €1,609.20 (copy Price ID → update DB)
- [ ] Create "AuditFlow Enterprise" product (manual invoicing)
  - [ ] One-off prices or custom per customer

#### C. Backend Implementation
- [ ] Install Mollie SDK:
  ```bash
  cd backend
  npm install @mollie/api-client --save
  ```
- [ ] Add environment variables to `backend/.env`:
  ```bash
  # Mollie API Keys (get from https://www.mollie.com/dashboard/developers/api-keys)
  MOLLIE_API_KEY=test_... # Use live_... for production
  MOLLIE_WEBHOOK_SECRET=... # Set a secure random string for webhook verification
  
  # Frontend URL (for redirects)
  FRONTEND_URL=https://audit-flow-zeta.vercel.app
  ```
- [ ] Create API routes:
  - [ ] `POST /api/subscriptions/checkout` - Create Mollie Checkout Session
  - [ ] `POST /api/subscriptions/portal` - Mollie Customer Portal redirect (or Billing Portal)
  - [ ] `POST /api/webhooks/mollie` - Handle Mollie webhooks
  - [ ] `GET /api/subscriptions/current` - Get org's current subscription

#### D. Frontend Implementation
- [ ] Install Mollie.js (if using Components):
  ```bash
  cd frontend
  npm install @mollie/mollie-js --save
  ```
  OR use hosted Checkout (no frontend SDK needed for redirect flow)
- [ ] Add environment variable to `frontend/.env`:
  ```bash
  NEXT_PUBLIC_MOLLIE_PROFILE_ID=... # Optional, for Components
  ```
- [ ] Create pages:
  - [ ] `/pricing` - Pricing table with "Start trial" buttons
  - [ ] `/checkout` - Redirect to Mollie Checkout
  - [ ] `/onboarding/success` - Post-payment success page
  - [ ] `/settings/billing` - Subscription management (link to Mollie Portal)

#### E. Webhook Configuration
- [ ] Create webhook endpoint in Mollie Dashboard:
  - URL: `https://audit-flow-zeta.vercel.app/_/backend/api/webhooks/mollie`
  - Events to listen to:
    - [ ] `subscription.created`
    - [ ] `subscription.updated`
    - [ ] `subscription.canceled`
    - [ ] `payment.paid`
    - [ ] `payment.failed`
    - [ ] `payment.refunded`
    - [ ] `mandate.created`
    - [ ] `mandate.revoked`
    - [ ] `customer.updated`
- [ ] Copy webhook signing secret → add to `.env` as `MOLLIE_WEBHOOK_SECRET`

#### F. Testing
- [ ] Test checkout flow with test API key
- [ ] Verify subscription created in Mollie Dashboard
- [ ] Verify row inserted in `subscriptions` table (Supabase)
- [ ] Test webhook events (use Mollie CLI or Dashboard test webhooks)
- [ ] Test Customer Portal (update payment method, cancel)
- [ ] Test SEPA Direct Debit mandate flow

---

## 4. Landing Page Integration 🚧 TODO

### Current Status
- Landing page exists as Next.js component at `frontend/src/app/page.tsx`
- Pricing section shows 3 tiers (Starter €49, Professional €149, Enterprise custom)
- CTA buttons need to link to checkout flow

### Action Items
- [ ] Update CTA buttons:
  - "Start free trial" → Link to `/checkout?plan=starter&interval=monthly` (or `annual`)
  - "Schedule a demo" → Link to Calendly or email `hello@auditflow.io`
- [ ] Add legal links to footer:
  - Terms of Service → `/legal/terms`
  - Privacy Policy → `/legal/privacy`
- [ ] Create legal pages:
  - [ ] `/frontend/src/app/legal/terms/page.tsx` (render TERMS_OF_SERVICE.md)
  - [ ] `/frontend/src/app/legal/privacy/page.tsx` (render PRIVACY_POLICY.md)

---

## 5. Email Setup 📧 TODO

### Required Email Addresses
- `hello@auditflow.io` - General support and inquiries
- `privacy@auditflow.io` - GDPR/privacy requests
- `dpo@auditflow.io` - Data Protection Officer (can alias to privacy@)

### Transactional Emails (via Mollie or SendGrid/Resend)
- [ ] Welcome email (after trial starts)
- [ ] Trial ending reminder (Day 7, Day 12, Day 14)
- [ ] Payment successful receipt (auto-sent by Mollie if enabled)
- [ ] Payment failed notification
- [ ] Subscription canceled confirmation
- [ ] Mandate created/revoked (for SEPA DD)

### Action Items
- [ ] Set up custom domain email (via Google Workspace, Proton Mail, or Fastmail)
- [ ] OR forward to existing Greisz email
- [ ] Configure Mollie email settings (Dashboard → Settings → Emails)
- [ ] Add email templates for trial reminders (can use Mollie built-ins)

---

## 6. Go-Live Checklist 🚀

Before launching publicly:

### Legal
- [ ] Replace placeholder addresses in ToS and Privacy Policy
- [ ] Optional: Legal review by Swedish lawyer
- [ ] Ensure GDPR compliance (DPO designated, data processing agreements in place)

### Payments
- [ ] Switch from Mollie test mode to live mode
- [ ] Update API keys to `live_...`
- [ ] Complete Mollie account verification (bank account, business info)
- [ ] Test full payment flow with real card (refund after)

### Website
- [ ] Landing page deployed and accessible at root URL
- [ ] Legal pages accessible and linked from footer
- [ ] Pricing page functional with working checkout
- [ ] 404 and error pages styled

### Infrastructure
- [ ] Run payment schema migration on production Supabase
- [ ] Webhook endpoint verified working (check Mollie Dashboard logs)
- [ ] Environment variables set in Vercel production environment
- [ ] Backups configured (Supabase auto-backups enabled on Pro plan)

### Monitoring
- [ ] Mollie webhook delivery monitoring
- [ ] Payment failure alerts set up
- [ ] Trial expiration reminders scheduled

---

## 7. Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Legal docs (address update) | 30 min | None |
| Email setup | 1 hour | Domain access |
| Mollie account + products | 2 hours | Business verification |
| Backend API routes | 4-6 hours | Mollie Price IDs |
| Frontend checkout flow | 4-6 hours | Backend routes |
| Landing page integration | 2-3 hours | None (can run in parallel) |
| Testing & QA | 3-4 hours | All above complete |
| **Total** | **~2 days** | Sequential dependencies |

---

## 8. Next Steps (Priority Order)

1. **Replace placeholder address** in legal docs (5 min)
2. **Set up email forwarding** for hello@/privacy@/dpo@ (30 min)
3. **Run database migration** (5 min)
4. **Create Mollie account** and recurring prices (2 hours)
5. **Implement backend Mollie routes** (4-6 hours)
6. **Implement frontend checkout** (4-6 hours)
7. **Deploy and test** (3-4 hours)

---

## 9. Files Created

```
AuditFlow/
├── docs/
│   ├── legal/
│   │   ├── TERMS_OF_SERVICE.md      ✅ Complete
│   │   └── PRIVACY_POLICY.md        ✅ Complete
│   ├── MOLLIE_SETUP.md              ✅ To create (this guide)
│   └── PAYMENT_LEGAL_PLAN.md        ✅ This file
└── supabase/
    └── migrations/
        └── 007_payment_subscription_schema.sql  ✅ Complete (Mollie schema)
```

---

## 10. Support Resources

- **Mollie Dashboard:** https://www.mollie.com/dashboard
- **Mollie API Docs:** https://docs.mollie.com/
- **Subscriptions API:** https://docs.mollie.com/reference/v2/subscriptions-api
- **Mandates API (SEPA DD):** https://docs.mollie.com/reference/v2/mandates-api
- **Webhooks:** https://docs.mollie.com/reference/v2/webhooks-api
- **Mollie CLI (for local webhook testing):** https://github.com/mollie/mollie-cli
- **VAT Guide:** https://docs.mollie.com/guides/vat
- **GDPR Resources:** https://gdpr.eu/
- **Swedish Data Protection Authority (IMY):** https://www.imy.se/

---

**Status:** Ready for implementation. All planning docs and schemas complete. Start with Step 1 (address update) and proceed sequentially.

**Questions?** Review `/docs/MOLLIE_SETUP.md` for detailed technical implementation guidance.