Accessible headless carousel — swipe, arrow keys, dots, and prev/next buttons. Never autoplays; respects `prefers-reduced-motion`.

```jsx
// Page variant — one item per view, all slides stay mounted (form-safe)
<Carousel variant="page" index={q} onSlideChange={setQ} ariaLabel="Assessment questions">
  {questions.map(item => <QuestionCard key={item.ref} q={item} />)}
</Carousel>

// Row variant — scroll-snap card row
<Carousel variant="row" slideWidth={300} gap={16} ariaLabel="Recent assessments">
  {items.map(it => <MiniCard key={it.id} {...it} />)}
</Carousel>
```

Use **page** for question flows / one-up galleries (controlled via `index` + `onSlideChange` to sync with external nav), **row** for horizontally scrollable card lists. Drag starting on a button/input/link is ignored so inner controls stay clickable.
