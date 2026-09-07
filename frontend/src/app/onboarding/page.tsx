'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { betaInviteApi } from '@/lib/api';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import Step1CompanyInfo from '@/components/onboarding/Step1CompanyInfo';
import Step2ReadinessCheck from '@/components/onboarding/Step2ReadinessCheck';
import Step3Divisions from '@/components/onboarding/Step2Divisions';
import Step4Departments from '@/components/onboarding/Step3Departments';
import Step5Roles from '@/components/onboarding/Step4Roles';
import Step6AIInterview from '@/components/onboarding/Step6AIInterview';
import OnboardingComplete from '@/components/onboarding/OnboardingComplete';
import { Loader2, CheckCircle } from 'lucide-react';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { step, betaInviteValidated, betaInviteCode, setBetaInviteCode, setBetaInviteValidated, reset } = useOnboardingStore();

  useEffect(() => {
    const code = searchParams?.get('beta_invite') || searchParams?.get('invite_code');
    if (code && !betaInviteValidated && betaInviteCode !== code) {
      const validateInvite = async () => {
        try {
          const res = await betaInviteApi.validateCode(code);
          const data = res.data?.data;
          if (data.valid) {
            setBetaInviteCode(code);
            setBetaInviteValidated(true);
          }
        } catch {
          // Invalid code, just continue normal flow
        }
      };
      validateInvite();
    }
  }, [searchParams, betaInviteCode, betaInviteValidated, setBetaInviteCode, setBetaInviteValidated]);

  if (step === 6) return <Step6AIInterview />;
  if (step === 7) return <OnboardingComplete />;

  return (
    <OnboardingLayout step={step}>
      {step === 1 && <Step1CompanyInfo />}
      {step === 2 && <Step2ReadinessCheck />}
      {step === 3 && <Step3Divisions />}
      {step === 4 && <Step4Departments />}
      {step === 5 && <Step5Roles />}
    </OnboardingLayout>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-full flex items-center justify-center mb-4">
              <Loader2 className="animate-spin text-[var(--brand-strong)]" size={28} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-strong)] mb-2">Loading...</h2>
            <p className="text-[var(--text-muted)]">Please wait.</p>
          </div>
        </div>
      }
    >
      <OnboardingContentInner />
    </Suspense>
  );
}

function OnboardingContentInner() {
  const searchParams = useSearchParams();
  const { betaInviteValidated, betaInviteCode } = useOnboardingStore();

  const code = searchParams?.get('beta_invite') || searchParams?.get('invite_code');
  if (code && !betaInviteValidated && betaInviteCode !== code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-full flex items-center justify-center mb-4">
            <Loader2 className="animate-spin text-[var(--brand-strong)]" size={28} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-strong)] mb-2">Validating invitation...</h2>
          <p className="text-[var(--text-muted)]">Please wait while we verify your beta invite code.</p>
        </div>
      </div>
    );
  }

  return <OnboardingContent />;
}