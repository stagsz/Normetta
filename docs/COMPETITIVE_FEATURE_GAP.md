# Competitive Feature Gap Analysis — AuditFlow vs. Market

**Created:** 2026-06-04
**Purpose:** Reference for future feature prioritization and GTM positioning
**Source:** Web research on ISO 9001 software competitors (Compliance Automation + Traditional QMS categories)

---

## Feature Gap Table

| Feature | AuditFlow | Vanta | Thoropass | ComplyJet | QT9 | ETQ | MasterControl | Qualio | SimplerQMS | Dcycle |
|---------|-----------|-------|-----------|-----------|-----|-----|---------------|--------|------------|--------|
| **Self-assessment wizard** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **ISO 9001 clause coverage** | ✅ | Partial | Partial | Partial | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **NCR/CAPA tracking** | ✅ | Limited | Limited | Limited | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Audit planning/execution** | ✅ | ❌ | ✅ (bundled) | Limited | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Document control** | Basic | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Supplier management** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Training management** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ESG/sustainability link** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audit bundling (in-house)** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **300+ SaaS integrations** | ❌ | ✅ | ✅ | ✅ | Limited | Limited | Limited | Salesforce | Limited | Limited |
| **Pricing transparency** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | Partial | ✅ | ? |

---

## Legend

- ✅ = Full native support
- Partial = Framework add-on or limited capability
- Limited = Basic support, not core workflow
- ❌ = Not available / not core to product
- ? = Unknown / not publicly documented

---

## AuditFlow's Current Strengths (Green Row)

1. **Self-assessment wizard** — Unique in market; no competitor has this as core feature
2. **Transparent per-seat pricing** — Only ComplyJet and SimplerQMS match this
3. **ISO 9001-native clause coverage** — Purpose-built, not adapted from infosec
4. **NCR/CAPA + audit planning in one tool** — Most competitors separate these

---

## Priority Gaps to Address (Roadmap Candidates)

### High Impact / Differentiating
| Gap | Why It Matters | Effort |
|-----|----------------|--------|
| Supplier management | Required for ISO 9001 §8.4; manufacturing SMBs need this | Medium |
| Document control (versioning, approval workflows) | Core QMS requirement; current "Basic" is a blocker for Professional tier | High |
| Training management | ISO 9001 §7.2/7.3; easy win, integrates with user management | Low |

### Strategic / Moat-Building
| Gap | Why It Matters | Effort |
|-----|----------------|--------|
| ESG/sustainability link (CSRD, Taxonomy) | Dcycle is only one doing this; emerging buyer demand | High |
| Integration framework (start with 10 key: Slack, Teams, GitHub, Jira, Google Drive, OneDrive, Zapier) | Compliance Automation wins on integrations; SMBs expect this | Medium |
| Certification body partnerships / "audit-ready" export | Direct path to revenue; differentiates vs. both categories | Low-Medium |

### Table Stakes (Must-Have for Professional/Enterprise)
| Gap | Why It Matters | Effort |
|-----|----------------|--------|
| Advanced reporting / custom dashboards | Professional tier expects this | Medium |
| Role-based access control (already in plan) | Enterprise requirement | Low |
| Multi-site / division support | Enterprise requirement | Medium |
| API access | Enterprise/integration requirement | Medium |

---

## Positioning Insights

### vs. Compliance Automation (Vanta, Thoropass, ComplyJet, Secureframe)
- **Our wedge:** "ISO 9001 is not a checkbox — it's your operating system"
- **Their weakness:** ISO 9001 is an add-on; no self-assessment; no NCR/CAPA depth
- **Win message:** "Start with self-assessment today. Graduate to full QMS when ready."

### vs. Traditional QMS (QT9, ETQ, MasterControl, Qualio, SimplerQMS, Ideagen)
- **Our wedge:** "Enterprise QMS power at 1/10th the price, no 6-month implementation"
- **Their weakness:** Expensive, complex, sales-led, no self-assessment entry point
- **Win message:** "Same CAPA, audit, document power. Self-serve onboarding. Transparent pricing."

---

## Pricing Context

| Competitor | Model | Est. Annual Cost (20 users) |
|------------|-------|----------------------------|
| **AuditFlow Starter** | €49/mo (10 users) | **€588** |
| **AuditFlow Professional** | €149/mo (50 users) | **€1,788** |
| ComplyJet | Flat/company | $5,000–$8,000 |
| SimplerQMS | All-in | ~$14,400 |
| QT9 | Concurrent licenses | $10,000+ |
| Qualio | Per user | $12,000 + $3,000/user = $72,000 |
| MasterControl | Enterprise | $25,000+ |
| ETQ/Ideagen | Enterprise | $25,000–$50,000+ |

**Insight:** AuditFlow is **10–40x cheaper** than Traditional QMS and **3–12x cheaper** than Compliance Automation for equivalent seat counts.

---

## Next Steps (When Ready)

1. **Validate supplier management demand** — Survey 5–10 pilot users
2. **Spec document control v2** — Versioning, approval chains, audit trail
3. **Design integration framework** — Start with Zapier + 3 native (Slack, Teams, Google Drive)
4. **Map certification body partnerships** — Identify 3–5 in Sweden/EU for "audit-ready" program
5. **Build "ISO 9001 Readiness Score" free tool** — Lead magnet, drives self-assessment signups

---

## Related Files

- `/docs/PAYMENT_LEGAL_PLAN.md` — Pricing tiers defined
- `/docs/STRIPE_SETUP.md` → to be replaced by `/docs/MOLLIE_SETUP.md`
- `/frontend/src/app/page.tsx` — Landing page with current pricing
- `/supabase/migrations/007_payment_subscription_schema.sql` — Subscription schema