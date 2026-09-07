# Cyclic Harmony - Quick Reference Card

## Import Statement

```tsx
import {
  CrownedCard,
  ProcessStageCard,
  QuestionCard,
  SectionFlowNavigation,
  NavigationButtons,
  SaveStatusBadge,
  ProgressConnector,
} from '@/components/cyclic-harmony';
```

## Colors

| Color | Hex | Usage |
|-------|-----|-------|
| `harmony-sage` | #8BAA7E | Pending, initial state |
| `harmony-lime` | #A8C499 | In progress, partial |
| `harmony-olive` | #5C7C52 | Active, current |
| `harmony-forest` | #3D5A3A | Completed, success |
| `harmony-warm-white` | #F5F5F0 | Card backgrounds |
| `harmony-light-beige` | #E8E8E0 | Borders, dividers |
| `harmony-warm-gray` | #D8D8D0 | Page background |
| `harmony-dark-text` | #333333 | Primary text |

## Component Cheatsheet

### CrownedCard

```tsx
<CrownedCard
  crownColor="sage" // 'sage' | 'olive' | 'forest' | 'lime' | 'gradient'
  elevation="md"    // 'sm' | 'md' | 'lg'
  interactive       // Enables hover effects
  active            // Shows ring highlight
  disabled          // Reduces opacity
  crownHeight={45}  // 20-60 recommended
  onClick={fn}
>
  Content
</CrownedCard>
```

### ProcessStageCard

```tsx
<ProcessStageCard
  icon={IconComponent}
  title="Section Title"
  description="Brief description"
  stageNumber="01"
  status="active" // 'pending' | 'active' | 'completed'
  progress={65}   // 0-100
  onClick={fn}
/>
```

### QuestionCard

```tsx
<QuestionCard
  questionNumber="4.1.1"
  questionText="Question text"
  guidance="Optional guidance"
  score={2}         // 1 | 2 | 3 | null
  justification=""
  onScoreChange={setScore}
  onJustificationChange={setJustification}
  disabled={false}
/>
```

### SectionFlowNavigation

```tsx
const sections: SectionStage[] = [{
  id: '1',
  title: 'Section',
  icon: Icon,
  sectionNumber: '4',
  progress: 50,
  totalQuestions: 10,
  answeredQuestions: 5,
}];

<SectionFlowNavigation
  sections={sections}
  activeSectionId="1"
  onSectionChange={setActiveId}
/>
```

### NavigationButtons

```tsx
<NavigationButtons
  onPrevious={handlePrev}
  onNext={handleNext}
  hasPrevious={true}
  hasNext={true}
  previousLabel="Previous Section"
  nextLabel="Next Section"
/>
```

### SaveStatusBadge

```tsx
<SaveStatusBadge
  status="saved" // 'idle' | 'saving' | 'saved' | 'error'
  lastSaved={date}
  pendingCount={3}
  error="Error message"
/>
```

### ProgressConnector

```tsx
<ProgressConnector
  active={true}
  completed={false}
/>
```

## Tailwind Classes

### Typography
```
font-display font-bold          // Headers
text-harmony-dark-text          // Body text
leading-generous                // Line height 1.6
```

### Spacing
```
p-8                            // Card padding (32px)
space-y-6                      // Vertical rhythm
gap-4                          // Element gaps
```

### Borders
```
rounded-crown                  // 1.5rem (24px)
rounded-crown-lg               // 2rem (32px)
border-harmony-light-beige     // Border color
```

### Shadows
```
shadow-crown                   // Default elevation
shadow-crown-hover             // Hover elevation
shadow-crown-active            // Pressed state
```

### Animations
```
animate-fade-in                // Fade in on mount
animate-slide-up               // Slide up with fade
animate-progress-flow          // Pulsing for connectors
```

### Interactive States
```
hover:-translate-y-1           // Lift on hover
hover:shadow-crown-hover       // Deepen shadow
transition-all duration-300    // Smooth transitions
```

## Common Patterns

### Staggered Animation

```tsx
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    <Component {...item} />
  </div>
))}
```

### Crown Color by State

```tsx
const crownColor = {
  pending: 'sage',
  active: 'gradient',
  inProgress: 'lime',
  completed: 'forest',
}[state];
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => (
    <CrownedCard key={item.id} crownColor="sage">
      {item.content}
    </CrownedCard>
  ))}
</div>
```

### Horizontal Flow with Connectors

```tsx
<div className="flex items-center gap-0">
  <ProcessStageCard {...stage1} />
  <ProgressConnector completed />
  <ProcessStageCard {...stage2} />
  <ProgressConnector active />
  <ProcessStageCard {...stage3} />
</div>
```

## Design Principles

✅ **Breathing Space**: 32px minimum padding
✅ **Visual Progression**: Lighter → darker greens
✅ **Crowned Shapes**: Semi-circle arcs on cards
✅ **Calm Animations**: 300ms transitions
✅ **Minimal Text**: Icons + short labels
✅ **Generous Line Height**: 1.6 for body text

## File Locations

```
frontend/
├── src/
│   ├── components/
│   │   └── cyclic-harmony/
│   │       ├── CrownedCard.tsx
│   │       ├── ProcessStageCard.tsx
│   │       ├── QuestionCard.tsx
│   │       ├── SectionFlowNavigation.tsx
│   │       ├── NavigationButtons.tsx
│   │       ├── SaveStatusBadge.tsx
│   │       ├── ProgressConnector.tsx
│   │       ├── index.ts
│   │       ├── README.md
│   │       └── QUICK_REFERENCE.md
│   └── app/
│       └── (dashboard)/
│           ├── design-showcase/
│           │   └── page.tsx
│           └── assessments/
│               └── [id]/
│                   └── audit-harmony/
│                       └── page.tsx
└── tailwind.config.ts
```

## Quick Links

- **Full Documentation**: `README.md`
- **Integration Guide**: `/CYCLIC_HARMONY_INTEGRATION.md`
- **Design Showcase**: Navigate to `/design-showcase`
- **Example Page**: `audit-harmony/page.tsx`

---

**Pro Tip**: Start with the design showcase page to see all components in action, then reference this card while building!
