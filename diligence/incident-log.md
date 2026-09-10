# Incident Log — AuditFlow

**Entity**: Greisz Consulting (AuditFlow)
**Last Updated**: 2026-06-08
**Total Incidents**: 0

---

## Incident Template

For each incident, record:

| Field | Description |
|-------|-------------|
| **ID** | Sequential: INC-YYYY-NNN |
| **Date/Time (UTC)** | Detection timestamp |
| **Severity** | SEV-1 (Critical) / SEV-2 (Major) / SEV-3 (Minor) / SEV-4 (Info) |
| **Category** | Security / Availability / Data Integrity / Privacy / Operational |
| **Detection Method** | Monitoring alert / Customer report / Internal discovery / Penetration test / Audit |
| **Affected Systems** | Frontend / Backend / Database / Auth / Third-party (specify) |
| **Impact Description** | User-facing impact, data affected, SLA breach |
| **Root Cause** | 5 Whys analysis result |
| **Response Actions** | Immediate containment, investigation steps |
| **Remediation** | Fix deployed, config change, process update |
| **Communication** | Internal (Slack/email), Customer (status page/email), Regulatory (if applicable) |
| **Postmortem Link** | Confluence/Notion/GitHub issue URL |
| **Status** | Open / Investigating / Resolved / Closed |
| **Owner** | Assigned responder |

---

## Incident Entries

*No incidents recorded to date.*

---

## Severity Definitions

| Level | Name | Response Time | Examples |
|-------|------|---------------|----------|
| SEV-1 | Critical | < 15 min | Data breach, total outage, auth bypass, PII exposure |
| SEV-2 | Major | < 1 hour | Partial outage, major feature broken, performance degradation > 50% |
| SEV-3 | Minor | < 4 hours | Single user affected, non-critical bug, cosmetic issue |
| SEV-4 | Info | Next business day | Failed login attempts (no breach), info-only alerts |

---

## Escalation Contacts

| Role | Name | Contact |
|------|------|---------|
| Primary On-Call | Staffan Greisz | +46 7X XXX XXXX / staffan@greisz.se |
| Secondary | — | — |
| Legal / DPO | Staffan Greisz | staffan@greisz.se |
| Infra (Supabase) | Supabase Support | dashboard.supabase.com/support |
| Infra (Vercel) | Vercel Support | vercel.com/support |

---

## Compliance Notes

- **GDPR Art. 33**: Personal data breach → notify supervisory authority within 72 hours
- **GDPR Art. 34**: High risk to individuals → notify affected data subjects without undue delay
- **ISO 9001**: Nonconformity handling (Clause 10.2) — applies to quality-related incidents
- **Audit Trail**: All incidents must be traceable for buyer diligence and certification audits

---

## Review Cadence

| Review | Frequency | Owner | Output |
|--------|-----------|-------|--------|
| Incident trends | Monthly | Staffan | Summary report, action items |
| Process effectiveness | Quarterly | Staffan | Updated runbooks, runbook tests |
| Postmortem completion | Per incident | Owner | Published postmortem within 5 business days of resolution |

---

*Maintain this log continuously. Export for buyer data room on request.*