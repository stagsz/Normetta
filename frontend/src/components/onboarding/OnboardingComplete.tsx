'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { CheckCircle, Copy } from 'lucide-react';

export default function OnboardingComplete() {
  const router = useRouter();
  const { inviteUrl, reset } = useOnboardingStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      toast.success('Invite link copied!');
    });
  };

  const handleDashboard = () => {
    reset();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-[var(--brand-strong)]" />
          </div>
          <CardTitle className="text-xl">Setup complete!</CardTitle>
          <CardDescription>
            Your company is ready. Share the invite link below to onboard your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inviteUrl && (
            <div className="flex items-center gap-2 bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl px-3 py-2">
              <span className="flex-1 text-sm text-[var(--text-body)] truncate">{inviteUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[var(--text-subtle)] hover:text-[var(--brand-strong)] transition-colors flex-shrink-0"
                aria-label="Copy invite link"
              >
                <Copy size={16} />
              </button>
            </div>
          )}
          <Button className="w-full" onClick={handleDashboard}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
