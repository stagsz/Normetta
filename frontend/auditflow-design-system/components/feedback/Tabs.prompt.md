Segmented tab switcher with optional count pills; you render the panels.

```jsx
<Tabs defaultValue="open" onChange={setTab} tabs={[
  { id: 'all', label: 'All clauses', count: 142 },
  { id: 'open', label: 'Open findings', count: 8 },
  { id: 'done', label: 'Closed' },
]} />
```
