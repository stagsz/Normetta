'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { betaInviteApi } from '@/lib/api';
import { Loader2, Shield, CheckCircle, AlertCircle, Send } from 'lucide-react';

// ---- schemas ----
const createSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const joinSchema = z.object({
  slugOrUrl: z.string().min(1, 'Please enter an invite link or company slug'),
});

type CreateFormData = z.infer<typeof createSchema>;
type JoinFormData = z.infer<typeof joinSchema>;
type Mode = 'choose' | 'create' | 'join';

interface ValidatedInvite {
  id: string;
  code: string;
  email: string | null;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  organization: { id: string; name: string; slug: string } | null;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
}

// ---- icon ----
function UserPlusIcon() {
  return (
    <svg className="w-10 h-10 text-[var(--brand-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );
}

// ---- sub-forms ----
function CreateForm({
  onBack,
  betaInviteCode,
  betaInviteData,
}: {
  onBack: () => void;
  betaInviteCode?: string;
  betaInviteData?: ValidatedInvite | null;
}) {
  const router = useRouter();
  const setPersonal = useOnboardingStore((s) => s.setPersonal);
  const setBetaInviteCode = useOnboardingStore((s) => s.setBetaInviteCode);
  const setBetaInviteValidated = useOnboardingStore((s) => s.setBetaInviteValidated);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: betaInviteData?.email ?? '',
    },
  });

  const onSubmit = async (data: CreateFormData) => {
    // If email was pre-filled from invite, verify it matches
    if (betaInviteData?.email && betaInviteData.email !== data.email) {
      toast.error('Email must match the invite reservation');
      return;
    }

    setPersonal({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });

    if (betaInviteCode) {
      setBetaInviteCode(betaInviteCode);
      setBetaInviteValidated(true);
      router.push(`/onboarding?beta_invite=${betaInviteCode}`);
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register('firstName')}
          type="text"
          label="First name"
          placeholder="John"
          error={errors.firstName?.message}
          autoComplete="given-name"
        />
        <Input
          {...register('lastName')}
          type="text"
          label="Last name"
          placeholder="Doe"
          error={errors.lastName?.message}
          autoComplete="family-name"
        />
      </div>

      <Input
        {...register('email')}
        type="email"
        label="Email address"
        placeholder="you@company.com"
        error={errors.email?.message}
        autoComplete="email"
        disabled={!!betaInviteData?.email}
      />
      {betaInviteData?.email && (
        <p className="text-xs text-[var(--brand-strong)] flex items-center gap-1">
          <CheckCircle size={12} /> This invite is reserved for this email
        </p>
      )}

      <Input
        {...register('password')}
        type="password"
        label="Password"
        placeholder="At least 8 characters"
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <Input
        {...register('confirmPassword')}
        type="password"
        label="Confirm password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Continue to setup
      </Button>

      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back
      </Button>
    </form>
  );
}

function JoinForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
  });

  const onSubmit = async (data: JoinFormData) => {
    const raw = data.slugOrUrl.trim();
    let slug: string;
    try {
      const url = new URL(raw);
      const parts = url.pathname.replace(/\/$/, '').split('/');
      slug = parts[parts.length - 1];
    } catch {
      slug = raw.replace(/\/$/, '').split('/').pop() ?? raw;
    }

    if (!slug) {
      toast.error('Could not extract a valid slug from the provided input.');
      return;
    }

    router.push(`/join/${slug}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('slugOrUrl')}
        type="text"
        label="Invite link or company slug"
        placeholder="acme-corp  or  https://…/join/acme-corp"
        error={errors.slugOrUrl?.message}
        autoComplete="off"
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Find organisation
      </Button>

      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        Back
      </Button>
    </form>
  );
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('choose');
  const [betaInviteCode, setBetaInviteCode] = useState<string | null>(null);
  const [betaInviteData, setBetaInviteData] = useState<ValidatedInvite | null>(null);
  const [betaInviteLoading, setBetaInviteLoading] = useState(false);
  const [betaInviteError, setBetaInviteError] = useState<string | null>(null);

  // Check for beta_invite in query params on mount
  useEffect(() => {
    const code = searchParams?.get('beta_invite') || searchParams?.get('invite_code');
    if (code) {
      setBetaInviteCode(code);
      validateInvite(code);
      setMode('create');
    }
  }, [searchParams]);

  const validateInvite = async (code: string) => {
    setBetaInviteLoading(true);
    setBetaInviteError(null);
    try {
      const res = await betaInviteApi.validateCode(code);
      const data = res.data?.data;
      if (data.valid) {
        setBetaInviteData(data.invite);
      } else {
        setBetaInviteError(data.reason || 'Invalid invitation code');
      }
    } catch {
      setBetaInviteError('Failed to validate invitation');
    } finally {
      setBetaInviteLoading(false);
    }
  };

  if (betaInviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-full flex items-center justify-center mb-4">
              <Loader2 className="animate-spin text-[var(--brand-strong)]" size={28} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-strong)] mb-2">Validating invitation...</h2>
            <p className="text-[var(--text-muted)]">Please wait while we verify your beta invite code.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (betaInviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-strong)] mb-2">Invalid Invitation</h2>
            <p className="text-[var(--text-muted)]">{betaInviteError}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/register')}>
              Continue without invitation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const showInviteBanner = Boolean(betaInviteCode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-[var(--brand-soft)] rounded-2xl flex items-center justify-center mb-4 shadow-[var(--shadow-sm)]">
            {showInviteBanner ? <Send className="w-8 h-8 text-[var(--brand-strong)]" /> : <UserPlusIcon />}
          </div>
          <CardTitle className="text-2xl">
            {showInviteBanner ? 'Beta Invitation' : mode === 'create' && 'Create a new company'}
            {mode === 'join' && 'Join an existing company'}
          </CardTitle>
          <CardDescription>
            {showInviteBanner && betaInviteData?.organization?.name
              ? `Exclusive beta access for ${betaInviteData.organization.name}`
              : showInviteBanner
              ? 'You have been invited to join the Normetta beta program'
              : mode === 'choose' && 'How would you like to use Normetta?'}
            {mode === 'create' && !showInviteBanner && 'Enter your details to set up your organisation'}
            {mode === 'join' && !showInviteBanner && 'Enter your invite link or company slug'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {showInviteBanner && betaInviteData && (
            <div className="mb-6 p-4 bg-[var(--brand-soft)] rounded-lg border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-[var(--brand)] mb-2">
                <Shield size={18} />
                <span className="font-medium">Valid beta invitation</span>
              </div>
              <p className="text-sm text-[var(--brand)] font-mono bg-[var(--brand-soft)] px-2 py-1 rounded">{betaInviteData.code}</p>
              {betaInviteData.email && (
                <p className="text-sm text-[var(--brand)] mt-1">Reserved for: <strong>{betaInviteData.email}</strong></p>
              )}
              <p className="text-xs text-[var(--brand-strong)] mt-1">
                {betaInviteData.usedCount} of {betaInviteData.maxUses} uses • Expires {new Date(betaInviteData.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {mode === 'choose' && !showInviteBanner && (
            <div className="space-y-3">
              <Button className="w-full" onClick={() => setMode('create')}>
                Create a new company
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setMode('join')}>
                Join an existing company
              </Button>
              <p className="text-center text-sm text-[var(--text-muted)] pt-2">
                Already have an account?{' '}
                <Link href="/login" className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {mode === 'create' && <CreateForm
            onBack={() => { setMode('choose'); setBetaInviteCode(null); setBetaInviteData(null); }}
            betaInviteCode={betaInviteCode ?? undefined}
            betaInviteData={betaInviteData ?? undefined}
          />}

          {mode === 'join' && <JoinForm onBack={() => setMode('choose')} />}

          {(mode !== 'choose' || showInviteBanner) && (
            <p className="text-center text-sm text-[var(--text-muted)] mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium">
                Sign in
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterPageInner />
    </Suspense>
  );
}
