import { getLocale } from '@/lib/locale';

const sv = {
  brand: 'Normetta',
  nav: {
    platform: 'Plattform',
    howItWorks: 'Så fungerar det',
    pricing: 'Priser',
    blog: 'Blogg',
    signIn: 'Logga in',
    start: 'Kom igång',
  },
  hero: {
    eyebrow: 'ISO 9001:2015 · Byggt för europeiska SME-företag',
    h1: 'Vet att du är redo för revisionen – <em>innan</em> revisorn vet det.',
    sub: 'Normetta kartlägger ditt kvalitetssystem mot varje klausul i ISO 9001, poängsätter din revisionsberedskap i realtid och följer varje avvikelse till stängning. Data lagras i EU och du är igång på en eftermiddag – inga konsulter, ingen införandeprocess på sex månader.',
    actions: {
      primary: 'Starta ditt gratisprov i 30 dagar →',
      secondary: 'Se hur det fungerar ↓',
    },
    note: 'Fullständig klausulstruktur i ISO 9001:2015 · data lagras i EU',
    mockup: {
      title: 'Revisionsberedskap',
      live: 'Live',
      status: 'Exempelarbetsyta · Övervakningsrevision om 41 dagar',
      readiness: 'Beredskap',
      openNcrs: 'Öppna NCR',
      overdue: 'Försenade åtgärder',
    },
  },
  stats: {
    clauses: {
      count: 7,
      label: 'klausuler',
      detail:
        'fullständig täckning av ISO 9001:2015 klausul 4–10 – varje krav kartlagt',
    },
    auditTypes: {
      count: 4,
      label: 'revisionstyper',
      detail:
        'intern, extern, övervaknings- och certifieringsrevisioner planerade på ett ställe',
    },
    spreadsheets: {
      count: 0,
      label: 'kalkylblad',
      detail:
        'NCR:er, korrigerande åtgärder och bevis finns i ett system – inte i Excel',
    },
  },
  features: {
    eyebrow: 'Plattformen',
    heading: 'Allt revisorn kommer att efterfråga. Inget du behöver leta efter.',
    sub: 'Byggt specifikt för ISO 9001 – inte en generisk uppgiftslista retrofierad med compliance-etiketter.',
    items: [
      {
        num: '01',
        title: 'Självutvärdering',
        desc: 'Guidade arbetsflöden klausurs för klausul med bevisinsamling, poängsättning och gap-analys på ett ställe.',
      },
      {
        num: '02',
        title: 'Revisionsplanering & genomförande',
        desc: 'Planera revisioner, tilldela interna revisorer, definiera scope och kör strukturerade revisionssamtal med realtidsuppföljning.',
      },
      {
        num: '03',
        title: 'NCR-hantering',
        desc: 'Dokumentera, kategorisera och tilldela NCR:er med allvaretssklassificering. Full revisionsspår från upptäckt till stängning.',
      },
      {
        num: '04',
        title: 'Korrigerande åtgärder (CAPA)',
        desc: 'Rotorsaksanalys, handlingsplanering, ansvarstilldelning och verifiering av effektivitet – slutet CAPA-cykel.',
      },
      {
        num: '05',
        title: 'Rapportering & analys',
        desc: 'Ledningspaneler, trendanalys och compliance-rapporter redo för management review och certifieringsorgan.',
      },
      {
        num: '06',
        title: 'Rollbaserad åtkomst',
        desc: 'Admin, kvalitetsansvarig och revisroll med granulerade behörigheter. Varje användare ser exakt vad de behöver agera på.',
      },
    ],
  },
  story: {
    eyebrow: 'Så fungerar det',
    heading: 'Från första gap till signerat certifikat.',
    steps: [
      {
        title: 'Planera din revision',
        desc: 'Definiera scope, välj ISO 9001-klausuler, sätt schemaläggning och tilldela revisionsteam. Mallar ingår.',
      },
      {
        title: 'Utför & bevara',
        desc: 'Kör strukturerade intervjuer och observationer. Bifoga bevis direkt till findings när du arbetar – inte efteråt.',
      },
      {
        title: 'Hantera finding',
        desc: 'Skapa non-conformities och observationer. Tilldela ägare, deadline och korrigerande åtgärder omedelbart.',
      },
      {
        title: 'Stäng loopen',
        desc: 'Följ CAPA-slutförande, verifiera effektivitet och generera den slutliga revisionsrapporten i ett klick.',
      },
    ],
    panels: [
      {
        label: 'Revisionsplan · Scope & team',
        rows: [
          { text: 'Scope – klausul 4–10, produktionsplats', status: 'Definierad' },
          { text: 'Lead revisorn – tilldelad', status: 'Redo' },
          { text: 'Checklista delad med team', status: 'Skickad' },
          { text: 'Schema – 12–14 maj', status: 'Bokat' },
        ],
      },
      {
        label: 'Självutvärdering · Klausultäckning',
        clauses: [
          { name: 'Klausul 4 – Organisationskontext', pct: 92 },
          { name: 'Klausul 7 – Stöd', pct: 64 },
          { name: 'Klausul 8 – Verksamhet', pct: 48 },
          { name: 'Klausul 9 – Prestation utvärdering', pct: 71 },
        ],
      },
      {
        label: 'NCR-tavla · Denna vecka',
        rows: [
          { text: 'Kalibreringsjournaler – momentdragare', status: 'Major' },
          { text: 'Leverantörsgodkännande försenat', status: 'Minor' },
          { text: 'Utbildningsmatris – svetscertifikat', status: 'Minor' },
          { text: 'Dokumentkontroll – föråldrad SOP v3', status: 'Stängd' },
        ],
      },
      {
        label: 'Stängning · Certifieringsrevision',
        rows: [
          { text: 'Korrigerande åtgärder verifierade', status: 'Klar' },
          { text: 'Interna revisionsrapporter (12 m)', status: 'Redo' },
          { text: 'Management review-protokoll', status: 'Redo' },
          { text: 'Slutlig revisionsrapport', status: 'Genererad' },
        ],
      },
    ],
  },
  tour: {
    eyebrow: 'Produktrundtur',
    heading: 'Se Normetta i praktiken.',
    sub:
      'Den faktiska produkten – dashboard, självutvärderingar, non-conformities, korrigerande åtgärder och rapporter – på under tjugo sekunder.',
    videoAria:
      'Produktrundtur av Normetta: dashboard, självutvärdering, NCR, korrigerande åtgärder och rapporter',
  },
  coverage: {
    eyebrow: 'Täckning',
    heading: 'Fullständig ISO 9001:2015 klausultäckning.',
    sub:
      'Varje krav kartlagt – från organisatorisk kontext till management review, verksamhet och kontinuerlig förbättring.',
  },
  pricing: {
    eyebrow: 'Priser',
    heading: 'Roligt prissättning. Inga överraskningar.',
    sub: 'Alla planer inkluderar fullständig ISO 9001:2015 klausultäckning. Gratis under beta.',
    free: {
      name: 'Gratis',
      price: '€0',
      per: 'för alltid – upp till 10 användare',
      features: [
        'Obegränsade revisioner',
        'Självutvärderingsmodul',
        'NCR & CAPA-spårning',
        'Fullständig ISO 9001:2015 klausultäckning',
        'Grundläggande rapportering & dashboard',
        'E-postsupport',
      ],
      cta: 'Starta 30-dagars prov',
    },
    pro: {
      name: 'Professionell',
      price: 'Kommer snart',
      per: 'upp till 50 användare – gå med i väntelistan',
      features: [
        'Allt i Gratis',
        'Avancerad analys & anpassade paneler',
        'Bilagor & lagring',
        'Revisionsrapportgenerering (PDF)',
        'Rollbaserad åtkomstkontroll',
        'Stöd för flera avdelningar och enheter',
        'Prioriterad support',
      ],
      cta: 'Starta 30-dagars prov',
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Anpassat',
      per: '50+ användare – skräddarsytt för din organisation',
      features: [
        'Allt i Professionell',
        'SSO / SAML-integration',
        'Anpassade revisionsmallar',
        'API-åtkomst',
        'Flerplatshantering',
        'Dedikerad onboarding & utbildning',
        'SLA-backad support',
      ],
      cta: 'Kontakta sälj',
    },
  },
  cta: {
    heading: 'Din nästa revision kan bli den <em>lugna</em>.',
    sub: 'Installeras på några minuter. Inga konsulter, ingen utbildningsdag krävs.',
    cta: 'Starta 30-dagars gratispröva →',
  },
  footer: {
    tagline:
      'ISO 9001 kvalitetsledning och revisionsplattform. Byggd för team som tar compliance på största allvar.',
    product: 'Produkt',
    useCases: 'Användningsområden',
    company: 'Företag',
    links: {
      features: 'Funktioner',
      pricing: 'Priser',
      blog: 'Blogg',
      internalAudits: 'Interna revisioner',
      selfAssessments: 'Självutvärdering',
      managementReview: 'Management review',
      contact: 'Kontakt',
      privacy: 'Integritetspolicy',
      terms: 'Villkor',
    },
    bottom: '© 2026 Normetta. Alla rättigheter reserverade.',
    isoLabel: 'ISO 9001:2015 Kvalitetsledningsplattform',
  },
  common: {
    openNcr: 'Öppna',
    review: 'Översyn',
    closed: 'Stängd',
    ready: 'Redo',
    verified: 'Verifierad',
    major: 'Major',
    minor: 'Minor',
    done: 'Klar',
    sent: 'Skickad',
    defined: 'Definierad',
    booked: 'Bokat',
  },
};

const en = {
  brand: 'Normetta',
  nav: {
    platform: 'Platform',
    howItWorks: 'How it works',
    pricing: 'Pricing',
    blog: 'Blog',
    signIn: 'Sign in',
    start: 'Get started',
  },
  hero: {
    eyebrow: 'ISO 9001:2015 · Built for European SMEs',
    h1: 'Know you’re audit-ready — <em>before</em> the auditor does.',
    sub: 'Normetta maps your quality system to every ISO 9001 clause, scores your readiness in real time, and tracks each nonconformity to closure. Hosted in the EU, set up in an afternoon — no consultants, no six-month rollout.',
    actions: {
      primary: 'Start your 30-day free trial →',
      secondary: 'See how it works ↓',
    },
    note: 'Full ISO 9001:2015 clause structure · data hosted in the EU',
    mockup: {
      title: 'Audit readiness',
      live: 'Live',
      status: 'Example workspace · Surveillance audit in 41 days',
      readiness: 'Readiness',
      openNcrs: 'Open NCRs',
      overdue: 'Overdue actions',
    },
  },
  stats: {
    clauses: {
      count: 7,
      label: 'clauses',
      detail: 'full coverage of ISO 9001:2015 clauses 4 through 10 — every requirement mapped',
    },
    auditTypes: {
      count: 4,
      label: 'audit types',
      detail: 'internal, external, surveillance and certification audits planned in one place',
    },
    spreadsheets: {
      count: 0,
      label: 'spreadsheets',
      detail: 'NCRs, corrective actions and evidence live in one system — not in Excel',
    },
  },
  features: {
    eyebrow: 'The platform',
    heading: 'Everything the auditor will ask for. Nothing you have to hunt down.',
    sub: 'Built specifically for ISO 9001 — not a generic task tracker retrofitted with compliance labels.',
    items: [
      {
        num: '01',
        title: 'Self-assessment management',
        desc: 'Guided clause-by-clause workflows with evidence collection, scoring and gap analysis in one place.',
      },
      {
        num: '02',
        title: 'Audit planning & execution',
        desc: 'Schedule audits, assign internal auditors, define scope, and run structured audit sessions with real-time progress.',
      },
      {
        num: '03',
        title: 'Non-conformity tracking',
        desc: 'Document, categorize and assign NCRs with severity grading. Full audit trail from discovery through resolution.',
      },
      {
        num: '04',
        title: 'Corrective actions (CAPA)',
        desc: 'Root cause analysis, action planning, owner assignment and effectiveness verification — closed-loop CAPA.',
      },
      {
        num: '05',
        title: 'Reporting & analytics',
        desc: 'Executive dashboards, trend analysis and compliance reports ready for management review and certification bodies.',
      },
      {
        num: '06',
        title: 'Role-based access',
        desc: 'Admin, quality manager and auditor roles with granular permissions. Each user sees exactly what they need to act on.',
      },
    ],
  },
  story: {
    eyebrow: 'How it works',
    heading: 'From first gap to signed certificate.',
    steps: [
      {
        title: 'Plan your audit',
        desc: 'Define scope, select ISO 9001 clauses, set the schedule, and assign the audit team. Templates included.',
      },
      {
        title: 'Execute & evidence',
        desc: 'Run structured interviews and observations. Attach evidence directly to findings while you work, not after.',
      },
      {
        title: 'Manage findings',
        desc: 'Raise non-conformities and observations. Assign owners, due dates, and corrective actions immediately.',
      },
      {
        title: 'Close the loop',
        desc: 'Track CAPA completion, verify effectiveness, and generate the final audit report in one click.',
      },
    ],
    panels: [
      {
        label: 'Audit plan · Scope & team',
        rows: [
          { text: 'Scope — clauses 4–10, production site', status: 'Defined' },
          { text: 'Lead auditor — assigned', status: 'Ready' },
          { text: 'Checklist shared with team', status: 'Sent' },
          { text: 'Schedule — 12–14 May', status: 'Booked' },
        ],
      },
      {
        label: 'Self-assessment · Clause coverage',
        clauses: [
          { name: 'Clause 4 — Context of the organization', pct: 92 },
          { name: 'Clause 7 — Support', pct: 64 },
          { name: 'Clause 8 — Operation', pct: 48 },
          { name: 'Clause 9 — Performance evaluation', pct: 71 },
        ],
      },
      {
        label: 'NCR board · This week',
        rows: [
          { text: 'Calibration records — torque tools', status: 'Major' },
          { text: 'Supplier evaluation overdue', status: 'Minor' },
          { text: 'Training matrix — welding certs', status: 'Minor' },
          { text: 'Document control — obsolete SOP v3', status: 'Closed' },
        ],
      },
      {
        label: 'Close-out · Certification audit',
        rows: [
          { text: 'Corrective actions verified', status: 'Done' },
          { text: 'Internal audit reports (12 mo)', status: 'Ready' },
          { text: 'Management review minutes', status: 'Ready' },
          { text: 'Final audit report', status: 'Generated' },
        ],
      },
    ],
  },
  tour: {
    eyebrow: 'Product tour',
    heading: 'See Normetta in action.',
    sub:
      'The actual product — dashboard, self-assessments, non-conformities, corrective actions and reports — in under twenty seconds.',
    videoAria:
      'Product tour of Normetta: dashboard, self-assessments, non-conformities, corrective actions and reports',
  },
  coverage: {
    eyebrow: 'Coverage',
    heading: 'Full ISO 9001:2015 clause coverage.',
    sub:
      'Every requirement mapped — from organizational context to management review, operations, and continuous improvement.',
  },
  pricing: {
    eyebrow: 'Pricing',
    heading: 'Straightforward plans. No surprises.',
    sub: 'All plans include full ISO 9001:2015 clause coverage. Free while in beta.',
    free: {
      name: 'Free',
      price: '€0',
      per: 'forever — up to 10 users',
      features: [
        'Unlimited audits',
        'Self-assessment module',
        'NCR & CAPA tracking',
        'Full ISO 9001:2015 clause coverage',
        'Basic reporting & dashboards',
        'Email support',
      ],
      cta: 'Start 30-day trial',
    },
    pro: {
      name: 'Professional',
      price: 'Coming soon',
      per: 'up to 50 users — join the waitlist',
      features: [
        'Everything in Free',
        'Advanced analytics & custom dashboards',
        'Evidence attachment & storage',
        'Audit report generation (PDF)',
        'Role-based access control',
        'Multi-department & division support',
        'Priority support',
      ],
      cta: 'Start 30-day trial',
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      per: '50+ users — tailored to your org',
      features: [
        'Everything in Professional',
        'SSO / SAML integration',
        'Custom audit templates',
        'API access',
        'Multi-site management',
        'Dedicated onboarding & training',
        'SLA-backed support',
      ],
      cta: 'Contact sales',
    },
  },
  cta: {
    heading: 'Your next audit could be <em>the calm one</em>.',
    sub: 'Set up in minutes. No consultants, no training day required.',
    cta: 'Start 30-day free trial →',
  },
  footer: {
    tagline:
      'ISO 9001 quality management and audit platform. Built for teams that take compliance seriously.',
    product: 'Product',
    useCases: 'Use cases',
    company: 'Company',
    links: {
      features: 'Features',
      pricing: 'Pricing',
      blog: 'Blog',
      internalAudits: 'Internal audits',
      selfAssessments: 'Self-assessments',
      managementReview: 'Management review',
      contact: 'Contact',
      privacy: 'Privacy policy',
      terms: 'Terms of service',
    },
    bottom: '© 2026 Normetta. All rights reserved.',
    isoLabel: 'ISO 9001:2015 Quality Management Platform',
  },
  common: {
    openNcr: 'Open',
    review: 'Review',
    closed: 'Closed',
    ready: 'Ready',
    verified: 'Verified',
    major: 'Major',
    minor: 'Minor',
    done: 'Done',
    sent: 'Sent',
    defined: 'Defined',
    booked: 'Booked',
  },
};

export type LandingMessages = typeof sv;

export const landingMessages: Record<'sv' | 'en', LandingMessages> = {
  sv,
  en,
};

export function useLocaleMessages(): LandingMessages {
  const locale = typeof window === 'undefined' ? 'sv' : getLocale();
  return landingMessages[locale];
}
