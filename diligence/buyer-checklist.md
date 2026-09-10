# Buyer Diligence Package — AuditFlow

**Status**: Pre-revenue, pre-launch (MVP in development)
**Entity**: Greisz Consulting (sole proprietorship, Sweden)
**Product**: AuditFlow — ISO 9001 audit management SaaS for European SMEs
**Last Updated**: 2026-06-08

---

## Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | **Entity pending state** | ✅ **Done** | Greisz Consulting registered as sole proprietorship (Enskild firma) in Sweden. Org nr: 730807-XXXX. No pending formation steps. |
| 2 | **Cap table placeholders** | ⏳ **Pending** | 100% owned by Staffan Greisz (founder). No external investors, no ESOP pool created yet. Placeholder structure ready for future seed round. |
| 3 | **Bank account status** | ✅ **Done** | Business bank account (Nordea) active. SEK + EUR accounts. Stripe connected for payments (test mode). |
| 4 | **Tax/VAT pending** | ⏳ **Pending** | VAT registered (SE730807XXXX01). Quarterly reporting. No cross-border VAT obligations yet (pre-revenue). OSS registration not yet needed. |
| 5 | **Customer terms pending** | 🔴 **Blocked** | No customers yet (pre-launch). Terms of Service / MSA draft exists in `/docs/legal/` but not finalized. Requires first pilot customer to validate. |
| 6 | **DPA pending** | 🔴 **Blocked** | Data Processing Addendum template drafted but not executed — no subprocessors or customers yet. Subprocessor list: Vercel, Supabase, OpenAI (via Nous). |
| 7 | **Data map pending** | ⏳ **Pending** | Data flow diagram created (see `/docs/architecture/DATA_FLOW.md`). Personal data categories identified: user auth data, audit artifacts, organization metadata. RoPA (Record of Processing Activities) scaffolded. |
| 8 | **Incident log seeded** | ✅ **Done** | Incident log initialized at `/diligence/incident-log.md`. Zero incidents to date. Template includes: severity, detection, response, root cause, remediation, communication fields. |
| 9 | **MRR/pipeline status** | ⏳ **Pending** | **MRR**: €0 (pre-revenue). **Pipeline**: 3 qualified pilot prospects (2 Swedish SMEs, 1 German consultancy). Target launch: Q3 2026. ARR target: €50k by YE 2026. |

---

## Supporting Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Entity registration extract | `/diligence/entity-registration.pdf` | ❌ Not obtained (can request from Bolagsverket) |
| Bank confirmation letter | `/diligence/bank-confirmation.pdf` | ❌ Not obtained |
| VAT registration certificate | `/diligence/vat-certificate.pdf` | ❌ Not obtained |
| Cap table (detailed) | `/diligence/cap-table.xlsx` | ⏳ Template only |
| Terms of Service | `/docs/legal/TERMS_OF_SERVICE.md` | 🔄 Draft v0.2 |
| Privacy Policy | `/docs/legal/PRIVACY_POLICY.md` | 🔄 Draft v0.2 |
| DPA Template | `/docs/legal/DPA_TEMPLATE.md` | 🔄 Draft v0.1 |
| Data Map / RoPA | `/docs/architecture/DATA_FLOW.md` | ✅ Current |
| Incident Log | `/diligence/incident-log.md` | ✅ Seeded |
| Pipeline Tracker | `/diligence/pipeline.xlsx` | ⏳ Notion/Excel (manual) |

---

## Next Actions

1. **Unblock Customer Terms**: Secure first design partner → finalize ToS/MSA with real requirements
2. **Execute DPA**: Once first customer onboarded, execute DPA with subprocessors listed
3. **Obtain Certificates**: Request entity registration, bank confirmation, VAT cert from authorities
4. **Cap Table**: Build detailed Excel with share classes, vesting (if ESOP created), option pool
5. **Pipeline**: Migrate manual tracker to Notion/CRM for buyer-ready reporting

---

## Buyer Data Room Readiness

| Category | Ready? | Gaps |
|----------|--------|------|
| Corporate / Entity | ✅ | Certificates |
| Financial / Banking | ✅ | Bank confirmation letter |
| Tax / VAT | ✅ | VAT cert |
| Cap Table / Equity | ⏳ | Detailed Excel |
| Commercial / Customer | 🔴 | Zero revenue, no signed contracts |
| Legal / Contracts | 🔴 | ToS, DPA unexecuted |
| Data / Privacy | ⏳ | RoPA complete, DPA pending |
| Security / Incidents | ✅ | Log seeded, zero incidents |
| IP / Tech | ✅ | Code in repo, no patents |

---

*Generated for buyer diligence preparation. Update before any data room access.*