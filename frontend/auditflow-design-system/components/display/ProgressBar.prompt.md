Completion bar; single value or a stacked conformance breakdown.

```jsx
<ProgressBar label="Clause 7 — Support" value={72} showValue />
<ProgressBar segments={[{value:64,tone:'pass'},{value:20,tone:'obs'},{value:9,tone:'fail'}]} />
```

Tones map to conformance colors (`pass`/`obs`/`fail`) or `brand`.
