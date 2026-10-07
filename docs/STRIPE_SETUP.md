# Stripe Integration Setup Guide

## Overview

AuditFlow uses Stripe for payment processing, subscription management, and billing. This guide covers:

1. Stripe account setup
2. Product and pricing configuration
3. Backend integration
4. Webhook configuration
5. Testing workflow

---

## 1. Stripe Account Setup

### 1.1 Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Choose business type: **SaaS**
3. Complete business verification (required before going live)

### 1.2 Enable Required Features
Enable these in Dashboard → Settings:
- **Customer Portal** (for self-service subscription management)
- **Invoices** (auto-send receipts)
- **Tax** (auto-calculate VAT for EU customers)

---

## 2. Create Products & Prices

### 2.1 Starter Plan
```
Product Name: AuditFlow Starter
Description: Up to 10 users • Unlimited audits • ISO 9001:2015 coverage

Prices:
  - Monthly: €49.00 (recurring)
  - Annual: €529.20 (recurring, 10% discount)
```

### 2.2 Professional Plan
```
Product Name: AuditFlow Professional
Description: Up to 50 users • Advanced analytics • PDF reports • Priority support

Prices:
  - Monthly: €149.00 (recurring)
  - Annual: €1,609.20 (recurring, 10% discount)
```

### 2.3 Enterprise Plan
```
Product Name: AuditFlow Enterprise
Description: Custom pricing for 50+ users • SSO • API access • Dedicated support

Pricing: Contact sales (manual invoicing via Stripe Invoices)
```

### Copy Price IDs

After creating prices, copy the IDs:
```
price_1ABC... (Starter Monthly)
price_1DEF... (Starter Annual)
price_1GHI... (Professional Monthly)
price_1JKL... (Professional Annual)
```

Update `supabase/migrations/007_payment_subscription_schema.sql`:
```sql
UPDATE subscription_plans SET stripe_price_id_monthly = 'price_1ABC...' WHERE id = 'starter';
UPDATE subscription_plans SET stripe_price_id_annual = 'price_1DEF...' WHERE id = 'starter';
-- ... repeat for other plans
```

---

## 3. Backend Integration

### 3.1 Install Stripe SDK
```bash
cd backend
npm install stripe --save
npm install @types/stripe --save-dev
```

### 3.2 Environment Variables

Add to `backend/.env`:
```bash
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_... # Created in step 4

# Pricing (optional, can also query from Supabase)
STRIPE_PRICE_STARTER_MONTHLY=price_1ABC...
STRIPE_PRICE_STARTER_ANNUAL=price_1DEF...
STRIPE_PRICE_PRO_MONTHLY=price_1GHI...
STRIPE_PRICE_PRO_ANNUAL=price_1JKL...

# Frontend URL (for redirects)
FRONTEND_URL=https://audit-flow-zeta.vercel.app
```

---

## 4. Webhook Configuration

### 4.1 Create Webhook Endpoint

Stripe needs to notify your backend of events (payment success, subscription updated, etc.)

**Endpoint URL:**
```
https://audit-flow-zeta.vercel.app/_/backend/api/webhooks/stripe
```

### 4.2 Configure in Stripe Dashboard

1. Go to Dashboard → Developers → Webhooks
2. Click **Add endpoint**
3. URL: `https://audit-flow-zeta.vercel.app/_/backend/api/webhooks/stripe`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end` (3 days before trial ends)
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Copy the **Signing secret** (`whsec_...`) → add to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## 5. Payment Flow Implementation

### 5.1 Checkout Session (New Subscription)

**Frontend calls:** `POST /api/subscriptions/checkout`

**Backend creates Stripe Checkout Session:**
```typescript
// backend/api/subscriptions/checkout.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create checkout session
const session = await stripe.checkout.sessions.create({
  customer_email: user.email,
  client_reference_id: organization.id, // Link to your org
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_1ABC...', // Stripe Price ID
    quantity: 1,
  }],
  subscription_data: {
    trial_period_days: 14, // 14-day trial
    metadata: {
      organization_id: organization.id,
      plan_id: 'starter',
    },
  },
  success_url: `${process.env.FRONTEND_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/pricing`,
});

// Return session ID to frontend
return { sessionId: session.id };
```

**Frontend redirects user to Stripe Checkout:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
await stripe.redirectToCheckout({ sessionId });
```

### 5.2 Webhook Handler (Record Subscription)

**Backend receives webhook:** `POST /api/webhooks/stripe`

```typescript
// backend/api/webhooks/stripe.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      
      // Insert into Supabase subscriptions table
      await supabase.from('subscriptions').insert({
        organization_id: subscription.metadata.organization_id,
        plan_id: subscription.metadata.plan_id,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.currency,
      });

      // Update organization status
      await supabase.from('organizations').update({
        subscription_status: subscription.status,
        plan_id: subscription.metadata.plan_id,
        trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      }).eq('id', subscription.metadata.organization_id);
      
      break;

    case 'invoice.payment_succeeded':
      // Record successful payment
      const invoice = event.data.object as Stripe.Invoice;
      await supabase.from('payments').insert({
        subscription_id: invoice.subscription,
        organization_id: invoice.metadata?.organization_id,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent_id: invoice.payment_intent,
        amount: invoice.amount_paid,
        amount_refunded: invoice.amount_refunded || 0,
        currency: invoice.currency,
        status: 'succeeded',
        invoice_number: invoice.number,
        invoice_pdf_url: invoice.invoice_pdf,
        billing_reason: invoice.billing_reason,
        period_start: new Date(invoice.period_start * 1000),
        period_end: new Date(invoice.period_end * 1000),
        paid_at: new Date(invoice.status_transitions.paid_at * 1000),
        tax_amount: invoice.tax || 0,
      });
      break;

    case 'invoice.payment_failed':
      // Handle failed payment (send reminder email, suspend account after grace period)
      break;

    case 'customer.subscription.deleted':
      // Handle cancellation
      await supabase.from('subscriptions').update({
        status: 'canceled',
        canceled_at: new Date(),
      }).eq('stripe_subscription_id', subscription.id);
      break;
  }

  // Log webhook event for debugging
  await supabase.from('stripe_webhook_events').insert({
    id: event.id,
    type: event.type,
    api_version: event.api_version,
    payload: event.data.object,
    processed: true,
    processed_at: new Date(),
  });

  res.json({ received: true });
}
```

---

## 6. Customer Portal (Self-Service)

Allow users to manage their subscription (upgrade, cancel, update payment method) via Stripe Customer Portal.

**Backend endpoint:** `POST /api/subscriptions/portal`

```typescript
const session = await stripe.billingPortal.sessions.create({
  customer: subscription.stripe_customer_id,
  return_url: `${process.env.FRONTEND_URL}/settings/billing`,
});

return { url: session.url }; // Redirect user here
```

**Frontend:**
```typescript
const response = await fetch('/api/subscriptions/portal', { method: 'POST' });
const { url } = await response.json();
window.location.href = url; // Opens Stripe-hosted portal
```

---

## 7. Testing Workflow

### 7.1 Test Mode

Use Stripe test mode during development:
- Test API key: `sk_test_...`
- Test cards: https://stripe.com/docs/testing

**Common test cards:**
```
Success:       4242 4242 4242 4242
Declined:      4000 0000 0000 0002
3D Secure:     4000 0027 6000 3184 (requires authentication)
```

### 7.2 Webhook Testing (Local Development)

Use Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local backend
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### 7.3 End-to-End Test

1. Go to `/pricing` on your frontend
2. Click "Start free trial" on Starter plan
3. Fill out checkout form with test card `4242 4242 4242 4242`
4. Verify:
   - Subscription created in Stripe Dashboard
   - Row inserted in `subscriptions` table (Supabase)
   - Organization `subscription_status` updated to `trialing`
   - Webhook event logged in `stripe_webhook_events` table

---

## 8. Go Live Checklist

Before launching:

- [ ] Complete Stripe account verification (business info, bank account)
- [ ] Switch from test keys to live keys (`sk_live_...`)
- [ ] Update webhook endpoint to use production URL
- [ ] Enable Stripe Tax (auto-calculates VAT for EU customers)
- [ ] Configure Customer Portal branding (Settings → Branding)
- [ ] Set up invoice email template (Settings → Emails)
- [ ] Enable 3D Secure (automatic for EU cards, required by PSD2)
- [ ] Test full payment flow with real credit card (refund after)
- [ ] Set up billing alerts (Dashboard → Notifications)
- [ ] Add Stripe link to footer ("Powered by Stripe" optional but recommended)

---

## 9. Pricing Strategy Notes

### Recommended Trial Strategy
- **14-day free trial** (requires credit card)
- Send reminder emails: Day 7 (halfway), Day 12 (2 days left), Day 14 (trial ending today)
- Auto-convert to paid if card is valid (Stripe handles this)

### Annual vs Monthly
- Offer **10% discount** for annual billing (€529 vs €588)
- Increases customer lifetime value (LTV)
- Reduces churn risk

### VAT Handling (EU Customers)
- Stripe Tax auto-calculates VAT based on customer location
- B2B customers: collect VAT number, validate via VIES, apply reverse charge
- B2C customers: charge VAT at customer's rate

### Upgrade/Downgrade
- **Upgrades:** Immediate (prorated charge)
- **Downgrades:** Effective at end of current period (no prorated refund)

---

## 10. Support & Resources

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Docs:** https://stripe.com/docs
- **API Reference:** https://stripe.com/docs/api
- **Webhook Events:** https://stripe.com/docs/api/events/types
- **Tax Guide:** https://stripe.com/docs/tax
- **PSD2 / SCA:** https://stripe.com/docs/strong-customer-authentication

**Contact Stripe Support:**  
Dashboard → Help → Contact Support (chat or email)

---

**Implementation Status:** Schema ready ✅ | Backend routes needed ⚠️ | Frontend checkout needed ⚠️
