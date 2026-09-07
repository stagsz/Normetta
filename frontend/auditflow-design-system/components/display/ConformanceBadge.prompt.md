The canonical ISO finding-outcome badge — use it wherever a clause or finding status appears.

```jsx
<ConformanceBadge status="conformant" />
<ConformanceBadge status="nonconformity" variant="solid" />
```

States: `conformant` (green ✓) · `observation` (amber !) · `nonconformity` (red ✕) · `notassessed` (dashed slate). Each carries its own glyph; set `showIcon={false}` for a text-only pill.
