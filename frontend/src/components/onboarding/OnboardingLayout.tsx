import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const STEP_LABELS = ['Company Info', 'Readiness Check', 'Divisions', 'Departments', 'Roles'];

export default function OnboardingLayout({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Set up your company</CardTitle>
          <CardDescription>Step {step} of {STEP_LABELS.length} — {STEP_LABELS[step - 1]}</CardDescription>
          <div className="flex gap-1 mt-2">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-[var(--brand-soft)]' : 'bg-[var(--stone-200)]'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
