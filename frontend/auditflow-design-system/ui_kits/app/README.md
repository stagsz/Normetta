# Normetta — App UI kit

High-fidelity recreation of the Normetta self-assessment web app, composed from
the design system's component primitives (`window.AuditFlowDesignSystem_900961`).

## Run
Open `index.html`. It loads React + Babel + the compiled `_ds_bundle.js`, then the
local screen scripts. The flow is interactive:

1. **Login** (`Login.jsx`) — split sign-in screen. "Sign in" enters the app.
2. **Dashboard** (`Dashboard.jsx`) — readiness gauge, at-a-glance stats, conformity-by-clause table, blocking-nonconformity callout.
3. **Self-assessment** (`Assessment.jsx`) — clause-by-clause question flow: pick a conformity outcome, log evidence + notes, Save & next. Left rail tracks per-question status.
4. **Findings** (`Findings.jsx`) — filterable table of nonconformities / observations with owners, due dates, severity.

Other nav items render a placeholder (out of scope for the kit).

## Files
| File | Role |
|---|---|
| `index.html` | App shell + view router (sign-in → dashboard → assessment → findings) |
| `Sidebar.jsx` | Dark nav rail, org switcher, user footer |
| `TopBar.jsx` | Page header, search, notifications |
| `Login.jsx` | Auth screen with brand panel |
| `Dashboard.jsx` | Overview screen |
| `Assessment.jsx` | Self-assessment workflow (interactive) |
| `Findings.jsx` | Findings table |
| `icons.jsx` | Lucide icon set (`window.AFIcon`) |
| `data.jsx` | Mock ISO 9001 clauses, findings, questions (`window.AFData`) |

## Notes
- Screens compose DS components (Card, Button, ConformanceBadge, ScoreGauge, ProgressBar,
  Tabs, Input, Avatar, Callout) rather than re-implementing them.
- Mock data only; no backend. Conformance outcomes map to the four-state semantic palette.
