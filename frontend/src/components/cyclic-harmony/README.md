# Cyclic Harmony Design System

A calm, flowing design system for multi-step processes and guided workflows. Perfect for assessments, audits, onboarding sequences, and progress tracking interfaces.

## Philosophy

Cyclic Harmony emphasizes:
- **Calm guidance**: Users flow through processes without stress
- **Visual progression**: Green gradients show advancement (lighter → darker)
- **Breathing space**: Generous padding, nothing cramped
- **Organic shapes**: Crowned rectangles create a soft, natural feel
- **Intentional motion**: Subtle animations enhance, not distract

## Color Palette

### Primary Greens
```typescript
harmony: {
  sage: '#8BAA7E',      // Light, starting point
  olive: '#5C7C52',     // Medium, active state
  forest: '#3D5A3A',    // Dark, completion
  lime: '#A8C499',      // Accent, highlights
}
```

### Neutrals
```typescript
harmony: {
  'warm-white': '#F5F5F0',    // Card backgrounds
  'light-beige': '#E8E8E0',   // Borders, dividers
  'warm-gray': '#D8D8D0',     // Page background
  'dark-text': '#333333',     // Primary text
}
```

### Usage Guidelines
- Use **gradient progression** (lime → sage → olive → forest) to show user advancement
- **Sage** for pending/initial states
- **Lime** for in-progress/partial states
- **Olive** for active/current states
- **Forest** for completed/successful states

## Shape Language

### Crowned Rectangles
Every card features:
- **Rounded corners**: 16-24px border radius
- **Semi-circle arc on top**: The "crown"
  - Height = 40-50% of card width
  - Created with `clip-path: ellipse(50% 100% at 50% 0%)`
- **Subtle elevation**: `shadow-crown` (0 4px 12px rgba(0,0,0,0.08))
- **Consistent padding**: 32px internal spacing

## Typography

### Font Stack
```css
font-family: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Poppins', 'Inter', 'sans-serif'],
}
```

### Guidelines
- **Headers**: `font-display font-bold`, minimal text
- **Body**: Regular weight, 16-18px, `leading-generous` (1.6)
- **Labels**: Medium weight, part of visual rhythm
- **Principle**: Icons + short labels > paragraphs

## Components

### 1. CrownedCard
Base component for all Cyclic Harmony cards.

```tsx
import { CrownedCard } from '@/components/cyclic-harmony';

<CrownedCard
  crownColor="sage" // 'sage' | 'olive' | 'forest' | 'lime' | 'gradient'
  elevation="md"    // 'sm' | 'md' | 'lg'
  interactive={true}
  active={false}
  disabled={false}
  onClick={() => {}}
  crownHeight={45} // percentage
>
  <p>Your content here</p>
</CrownedCard>
```

**Props:**
- `crownColor`: Determines crown background color
- `elevation`: Shadow depth
- `interactive`: Enables hover/click states
- `active`: Highlights with ring
- `disabled`: Reduces opacity, disables interaction
- `crownHeight`: Crown height as % of card width (default: 45)

### 2. ProcessStageCard
Displays a single stage in a multi-step process.

```tsx
import { ProcessStageCard } from '@/components/cyclic-harmony';
import { FileCheck } from 'lucide-react';

<ProcessStageCard
  icon={FileCheck}
  title="Context of Organization"
  description="Understanding organizational context and stakeholders"
  stageNumber="01"
  status="active" // 'pending' | 'active' | 'completed'
  progress={65}   // 0-100
  onClick={() => navigate('/section/1')}
/>
```

**Auto-styling by status:**
- `pending` + 0% progress → sage crown, 40% opacity
- `pending` + >0% progress → lime crown, full opacity
- `active` → gradient crown, ring highlight
- `completed` → forest crown, checkmark overlay

### 3. QuestionCard
Audit question with scoring interface.

```tsx
import { QuestionCard } from '@/components/cyclic-harmony';

<QuestionCard
  questionNumber="4.1.1"
  questionText="Does the organization determine external and internal issues?"
  guidance="Consider PESTLE factors, stakeholder requirements..."
  score={score}
  justification={justification}
  onScoreChange={(score) => setScore(score)}
  onJustificationChange={(text) => setJustification(text)}
  disabled={false}
/>
```

**Features:**
- Color-coded score buttons (1=red, 2=yellow, 3=green)
- Crown color matches selected score
- Auto-save compatible justification textarea
- Checkmark on selected score

### 4. SectionFlowNavigation
Horizontal scrollable process flow.

```tsx
import { SectionFlowNavigation } from '@/components/cyclic-harmony';

const sections: SectionStage[] = [
  {
    id: '1',
    title: 'Context',
    icon: FolderTree,
    sectionNumber: '4',
    progress: 100,
    totalQuestions: 12,
    answeredQuestions: 12,
  },
  // ...more sections
];

<SectionFlowNavigation
  sections={sections}
  activeSectionId={activeId}
  onSectionChange={setActiveId}
/>
```

**Features:**
- Auto-scroll navigation with arrow buttons
- Progress connectors between stages
- Summary stats at bottom
- Responsive horizontal scrolling

### 5. ProgressConnector
Dotted arc paths between stages.

```tsx
import { ProgressConnector } from '@/components/cyclic-harmony';

<ProgressConnector
  active={isActive}
  completed={isCompleted}
/>
```

**Visual states:**
- Default: warm-gray dotted arc
- Active: sage dotted arc with animated flow
- Completed: forest solid arc with arrow

### 6. NavigationButtons
Previous/Next section navigation.

```tsx
import { NavigationButtons } from '@/components/cyclic-harmony';

<NavigationButtons
  onPrevious={handlePrev}
  onNext={handleNext}
  hasPrevious={index > 0}
  hasNext={index < total - 1}
  previousLabel="4.1 Understanding the Organization"
  nextLabel="4.3 Scope of QMS"
/>
```

**Features:**
- Previous: white with sage border
- Next: gradient lime → sage background
- Hover animations (slight translate)
- Auto-disable when no previous/next

### 7. SaveStatusBadge
Auto-save status indicator.

```tsx
import { SaveStatusBadge } from '@/components/cyclic-harmony';

<SaveStatusBadge
  status={saveStatus} // 'idle' | 'saving' | 'saved' | 'error'
  lastSaved={lastSavedDate}
  pendingCount={3}
  error={errorMessage}
/>
```

**States:**
- `saving`: Blue with spinning loader
- `saved`: Lime/sage with checkmark, shows time since
- `error`: Red with alert icon
- `idle`: Gray with cloud icon

## Interactive States

### Hover
```css
hover:-translate-y-1
hover:shadow-crown-hover
transition-all duration-300
```

### Active
```css
scale-[1.02]
ring-2 ring-harmony-forest ring-offset-2
```

### Disabled
```css
opacity-50
grayscale
cursor-not-allowed
```

## Animations

### Available Animations
```typescript
animate-lift           // Lift -4px on Y axis
animate-scale-subtle   // Scale to 1.02
animate-fade-in        // Fade from 0 to 1 opacity
animate-slide-up       // Slide from +20px with fade
animate-progress-flow  // Pulsing opacity for connectors
```

### Staggered Reveals
Use `animationDelay` for sequential reveals:

```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-slide-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <QuestionCard {...item} />
  </div>
))}
```

## Layout Patterns

### Horizontal Process Flow
```tsx
<div className="flex items-center gap-0">
  <ProcessStageCard {...stage1} />
  <ProgressConnector active />
  <ProcessStageCard {...stage2} />
  <ProgressConnector />
  <ProcessStageCard {...stage3} />
</div>
```

### Vertical Question Stack
```tsx
<div className="space-y-6">
  {questions.map(q => (
    <QuestionCard key={q.id} {...q} />
  ))}
</div>
```

## Complete Example

See `/frontend/src/app/(dashboard)/assessments/[id]/audit-harmony/page.tsx` for a full implementation of the Cyclic Harmony design system in an ISO 9001 audit flow.

### Key Integration Points:
1. **Section navigation**: Horizontal crowned cards with progress
2. **Question display**: Stacked crowned question cards
3. **Auto-save feedback**: Status badge in header
4. **Progressive disclosure**: Navigate section-by-section
5. **Visual feedback**: Crown colors show completion state

## Best Practices

### Do's ✅
- Use green gradients to show progression
- Maintain generous padding (32px minimum)
- Leverage crown shapes for all major components
- Use subtle animations (300ms duration)
- Show status through color (sage → lime → olive → forest)
- Keep text minimal, icon-first where possible

### Don'ts ❌
- Don't cram content (maintain breathing room)
- Don't use harsh transitions (keep it calm)
- Don't ignore the crown shape (it's the signature)
- Don't use colors outside the harmony palette
- Don't skip interactive states (hover/active/disabled)
- Don't forget accessibility (focus states, ARIA labels)

## Accessibility

All components include:
- Proper `aria-label` attributes
- Keyboard navigation support (`tabIndex`, focus states)
- Disabled state handling
- Color contrast meeting WCAG AA standards
- Screen reader compatible structure

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires support for:
- CSS Grid
- CSS Custom Properties
- `clip-path`
- CSS Animations

## Dependencies

```json
{
  "tailwindcss": "^3.4.0",
  "lucide-react": "^0.400.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

## Migration from Existing UI

To migrate existing components:

1. **Replace standard cards** with `CrownedCard`
2. **Update color scheme** to harmony palette
3. **Add crown colors** based on state (pending/active/completed)
4. **Increase padding** to 32px minimum
5. **Add subtle animations** on mount/hover
6. **Replace linear navigation** with `SectionFlowNavigation`

## Theming

To customize the color palette, update `tailwind.config.ts`:

```typescript
harmony: {
  sage: '#8BAA7E',    // Your colors here
  olive: '#5C7C52',
  forest: '#3D5A3A',
  lime: '#A8C499',
  // ...
}
```

## Credits

Designed for ISO 9001 Self-Assessment Application
Created with ❤️ using the Cyclic Harmony philosophy
