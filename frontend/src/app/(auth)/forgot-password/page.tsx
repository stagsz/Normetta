'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { getAuthErrorInfo, isNetworkError } from '@/lib/auth-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, MailCheck } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await authApi.forgotPassword(data.email);
      const devResetToken = (response.data as { devResetToken?: string }).devResetToken;
      if (devResetToken && typeof window !== 'undefined') {
        setDevResetLink(`${window.location.origin}/reset-password?token=${devResetToken}`);
      }
      setSubmitted(true);
      toast.success('Reset link sent');
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        return;
      }
      const errorInfo = getAuthErrorInfo(err);
      toast.error(errorInfo.message, {
        description: errorInfo.title !== 'Error' ? errorInfo.title : undefined,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-soft)]/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-[var(--shadow-lg)] relative">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-[var(--brand-soft)] rounded-2xl flex items-center justify-center mb-4 shadow-[var(--shadow-sm)]">
            <Shield className="w-9 h-9 text-[var(--brand-strong)]" />
          </div>
          <CardTitle className="text-2xl font-display">Reset your password</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            {submitted
              ? 'Check your inbox for the next step'
              : 'Enter your account email and we’ll send you a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-[var(--brand-soft)]/40 p-4">
                <MailCheck className="w-5 h-5 text-[var(--brand-strong)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--text-muted)]">
                  If an account exists for that email, a password reset link is on its way.
                  The link expires in 1 hour.
                </p>
              </div>

              {devResetLink && (
                <div className="rounded-xl border border-dashed border-[var(--border-default)] p-4">
                  <p className="text-xs font-medium text-[var(--brand-strong)] mb-1">
                    Dev mode — SMTP not required
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Open the reset link directly:
                  </p>
                  <a
                    href={devResetLink}
                    className="text-sm text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium break-all underline"
                  >
                    {devResetLink}
                  </a>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                {...register('email')}
                id="email"
                type="email"
                label="Email address"
                placeholder="you@company.com"
                error={errors.email?.message}
                autoComplete="email"
              />

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Send reset link
              </Button>

              <p className="text-center text-sm text-[var(--text-muted)]">
                Remembered it?{' '}
                <Link
                  href="/login"
                  className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
