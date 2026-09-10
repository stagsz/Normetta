Inline banner for guidance, warnings, and finding alerts.

```jsx
<Callout tone="fail" title="2 nonconformities block certification"
  action={<Button size="sm" variant="danger">Review now</Button>}>
  Clauses 8.5.1 and 9.2.2 have open major findings past their due date.
</Callout>
```

Tones: `info` (default) · `pass` · `obs` · `fail`. Pass `onDismiss` for a closable banner.
