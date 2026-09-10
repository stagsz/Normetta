---
name: auditflow-design
description: Use this skill to generate well-branded interfaces and assets for Normetta (a self-assessment app for ISO 9001), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out
and create static HTML files for the user to view — link `styles.css` for tokens and load
`_ds_bundle.js` to use the React components (`window.AuditFlowDesignSystem_900961`). If
working on production code, copy assets and read the rules here to become an expert in
designing with this brand.

Key facts:
- **Brand color** luminous **teal** `--teal-500` on a dark, teal-biased "precision
  instrument" theme; **cloud** neutrals; **brass** certification accent used sparingly;
  **conformance semantics** drive most color (moss green=conformant, ochre=observation,
  garnet=nonconformity, stone=not assessed). Reference semantic vars (`--brand`,
  `--text-body`), not raw ramps. Legacy `--clay-*`/`--stone-*` names remain as aliases.
- **Type:** Fraunces (editorial serif display), IBM Plex Sans (UI/body),
  IBM Plex Mono (clause refs, IDs, data), Space Grotesk (compact UI headings).
- **Voice:** calm, exacting quality manager — sentence case, address the user as "you",
  exact ISO vocabulary, no emoji.
- **Components** live in `components/`; the full app recreation in `ui_kits/app/`.
- **Specimen cards** in `guidelines/` document tokens visually.

If the user invokes this skill without any other guidance, ask them what they want to build
or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.
