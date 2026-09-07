# Normetta Design System

> **Normetta** is a self-assessment app for **ISO 9001:2015** quality management.
> Quality teams use it to assess their management system against every clause,
> capture evidence, log findings, and walk into a certification audit knowing
> exactly where they stand.

This repository is the Normetta design system: brand, tokens, components, and a
full app UI kit. Consuming projects link the single entry point **`styles.css`**.

---

## ⚠️ Provenance & substitutions (please review)

No codebase, Figma, brand assets, or fonts were provided — **Normetta's brand was
designed from scratch** to fit the product domain. The following are deliberate
inventions to be confirmed or replaced:

- **Logo** (`assets/logo-*.svg`) — an original mark: a checkmark that flows upward
  (audit ✓ + forward progress). Replace with the real logo when available.
- **Fonts** — substituted from Google Fonts (see `tokens/fonts.css`):
  Fraunces (editorial serif display), IBM Plex Sans (UI/body), IBM Plex Mono (data/clause
  refs), Space Grotesk (compact UI headings). Swap for licensed brand faces if they differ.
- **Palette** — luminous teal primary (`--teal-500`) on a dark, teal-biased "precision
  instrument" theme + cloud neutrals + brass certification accent + natural-pigment
  ISO-conformance semantics (moss / ochre / garnet). Legacy `--clay-*`/`--stone-*` ramp
  names are kept as aliases mapped onto the teal theme for back-compat.
- **Company name in the kit** ("Northwind Mfg.") is placeholder tenant data.

**Sources given:** company description only — *"Normetta, a self assessment app for ISO 9001."*
No links, repos, or files were attached.

---

## Content fundamentals

**Voice: the calm, exacting quality manager.** Authoritative but never bureaucratic.
We translate dense ISO language into plain, actionable English. Confident, precise,
reassuring — we reduce audit anxiety.

- **Person.** Address the user as **you** ("Continue your self-assessment",
  "Know exactly where you stand"). The product refers to itself as **Normetta**, not "we".
- **Casing.** Sentence case everywhere — buttons, headings, nav, table headers.
  Never Title Case UI. (`Continue self-assessment`, not `Continue Self-Assessment`.)
- **Tone.** Direct and outcome-oriented. Lead with the state of the system, then the
  action: *"2 nonconformities are blocking your certification audit → Review findings."*
- **Domain vocabulary is exact.** Use ISO terms precisely: *clause*, *conformity*,
  *nonconformity* (major/minor), *observation*, *finding*, *evidence*, *control*,
  *management review*, *corrective action*. Never soften "nonconformity" to "issue".
- **Numbers are concrete.** "113 controls", "92% readiness", "12 of 14 reviewed".
  Clause and finding references are monospaced (`9.1.2`, `NC-2026-0184`).
- **No emoji.** Status is communicated with the conformance color + glyph system,
  never with emoji. Tone is professional B2B.
- **Microcopy examples.**
  - Empty: *"No open findings — every assessed control is conformant."*
  - Warning: *"Risk register not reviewed since last management review."*
  - CTA: *"Log finding" · "Save & next" · "Export readiness report".*

---

## Visual foundations

**Overall feel: engineered confidence.** Swiss-clean structure, generous whitespace,
hairline rules, restrained color until status demands attention. It should feel like a
precision instrument, not a consumer app.

### Color — "precision instrument" palette
- **Teal** (`--teal-500` `#14B8A6`, exposed as `--brand`) is the primary brand/action color —
  links, primary buttons, active nav, focus rings. Luminous and precise; deliberately not the
  cliché SaaS blue/purple. `--brand-strong` (`--teal-400`) brightens it on dark grounds.
- The default theme is **dark**: teal-biased **ink** grounds (`--ink-0` page → `--ink-3`
  raised) with **cloud** neutrals for text (`--cloud-100` strongest → `--cloud-600` subtle).
  Reference the semantic vars (`--text-body`, `--text-strong`, `--surface-*`, `--border`),
  not raw ramps. A light-value variant reusing the same semantic names is defined lower in
  `tokens/colors.css`. Legacy `--clay-*`/`--stone-*` names remain as aliases → teal.
- **Brass** (`--brass-500`) is a certification-seal accent, used sparingly.
- **Conformance semantics** are the emotional core and map to ISO outcomes, tuned to natural
  pigments: moss green = **conformant**, ochre = **observation**, garnet red =
  **nonconformity**, dashed stone = **not assessed**. Each has bg/line/fg/solid roles
  (`--status-*`). Garnet is kept clearly distinct from the teal brand so a finding never
  reads as a brand action.
- Color is used **sparingly** — grounds are near-black ink; saturated color almost always
  means brand or status.

### Type
- **Fraunces** (editorial serif) for display: hero headings and big numerals; its italic
  carries the brand voice. **Space Grotesk** is retained for compact UI headings (h3–h5,
  card titles), tight tracking (`-0.02em`), weights 500–700.
- **IBM Plex Sans** for all UI and body, 15px default, weights 400–600.
- **IBM Plex Mono** for data: clause refs, finding IDs, scores, dates, percentages —
  always `tabular-nums`. This mono treatment is a signature of the brand.
- Uppercase eyebrows (`.af-eyebrow`): 11px, `0.08em` tracking, semibold, muted.

### Spacing & layout
- **4px base grid** (`--space-*`). Cards pad 20–24px; page gutters 28px; control heights
  30/38/46px. Sidebar 248px.
- Layouts are column-structured with clear hairline dividers. Tables use a raised
  (`--surface-2`) header row, hairline row separators, monospace for IDs/refs.

### Shape, borders, elevation
- **Radii are precise, not pill-soft:** 5px controls, 8px inner, 12px cards, 16px large.
  Status pills and avatars are the only fully-round elements.
- **Borders are hairline** (`1px var(--border)`). Most separation is a border, not
  a shadow.
- **Shadows are soft, warm-tinted, layered** (`--shadow-xs → lg`). Cards rest on an
  ambient `--shadow-md` so they lift off the page; depth (gradients, bevels, drop
  shadows) is reserved for **interactive and brand** elements — primary buttons, the
  logomark, the readiness gauge — while surfaces, tables, and text stay flat and calm.
  That contrast is what makes the depth read as premium rather than dated.

### Backgrounds & imagery
- Surfaces are flat: raised ink cards (`--surface-1/2`) on the near-black `--ink-0` page. **No decorative gradients on content.**
- The single intentional texture is a faint **blueprint grid** (32px) used only on the dark
  brand panels (login) — evoking engineering/measurement. Low opacity, never on content.
- No photography in the core app. If imagery is added, keep it cool-toned and structural.

### Motion
- Subtle and functional. `--dur-fast 120ms` for hovers, `--dur-medium 200ms` for toggles,
  `--dur-slow 320ms` for progress/gauge fills. Easing `--ease-standard`/`--ease-emphasized`.
- **No bounces, no infinite loops.** Progress bars and the readiness gauge animate their fill;
  the **ScoreGauge** counts up from 0 (easeOutCubic) on mount as the product's hero moment.

### Interaction states
- **Hover:** primary buttons deepen to `--teal-700`; secondary/ghost get a subtle cloud tint;
  nav items lighten text to white on the dark rail.
- **Press:** the cap physically sinks — 1px downward nudge, the top-light gradient flips,
  and an inset shadow replaces the bevel highlight (buttons feel depressed).
- **Primary buttons** carry a brushed-metal finish: a multi-stop teal gradient with a hard
  reflection break mid-cap and a reflected-light foot, set in a crisp bevel. The logomark
  is likewise dimensional (gradient face, top highlight, drop shadow).
- **Focus:** 3px teal focus ring (`--ring`), never a bare outline.
- **Selected:** tinted status background + matching 1.5px border (assessment outcome cards).

### Transparency & blur
- Used minimally: subtle white-alpha fills on the dark sidebar (`rgba(255,255,255,0.05–0.08)`)
  for the org switcher and hover. No glassmorphism on light surfaces.

---

## Iconography

- **Icon system: [Lucide](https://lucide.dev)** (MIT) — stroke-based, 2px weight, round
  caps/joins, 24px grid. Chosen for its technical-yet-approachable line style that matches
  the engineered-confidence voice.
- In the UI kit, the icons used are **embedded as path data** in
  `ui_kits/app/icons.jsx` (so the kit renders offline) and exposed as `window.AFIcon`
  — `<Icon name="clipboard-check" size={18} />`. In production, install `lucide-react`.
- **No emoji, ever.** **No unicode glyphs as icons.** Status uses the dedicated
  ConformanceBadge glyph set (✓ / ! / ✕ / dashed-circle), drawn as small inline SVG within
  the component so semantics travel with the color.
- Sizes: 15–18px inline/UI, 20px in stat tiles, 40px in empty states. Stroke 1.9–2.2px.
- The brand logomark is the one bespoke piece of iconography (`assets/logo-mark.svg`).

---

## Index / manifest

**Root**
- `styles.css` — entry point (imports only). Consumers link this.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill manifest for use in Claude Code.

**`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `elevation.css`, `base.css`

**`assets/`** — `logo-mark.svg`, `logo-full.svg`, `logo-full-dark.svg`

**`components/`** (React primitives — `window.AuditFlowDesignSystem_900961`)
- `forms/` — **Button**, **IconButton**, **Input**, **Select**, **Checkbox**, **Switch**
- `display/` — **Card**, **ClauseStrip**, **Badge**, **ConformanceBadge**, **Avatar**, **ProgressBar**
- `feedback/` — **Callout**, **Tabs**, **ScoreGauge**
- `navigation/` — **Carousel** (page + row variants; swipe / keyboard / dots, a11y, reduced-motion)

**`ui_kits/app/`** — full Normetta app recreation (Login, Dashboard, Assessment, Findings). See its `README.md`.

**`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.
