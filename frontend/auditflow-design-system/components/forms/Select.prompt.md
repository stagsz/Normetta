Styled native dropdown with a custom chevron.

```jsx
<Select label="Conformity rating" placeholder="Select…" options={[
  { value: 'conformant', label: 'Conformant' },
  { value: 'observation', label: 'Observation' },
  { value: 'nonconformity', label: 'Nonconformity' },
]} />
```

`options` accepts plain strings or `{ value, label }`. Sizes `sm`/`md`/`lg`.
