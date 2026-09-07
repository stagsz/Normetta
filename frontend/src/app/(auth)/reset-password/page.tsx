'use client';

import { Suspense, useState } from 'react';
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
import { Shield, KeyRound, AlertTriangle } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const token = searchParams?.get('token') ?? null;

  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Missing or invalid reset link');
      return;
    }
    try {
      await authApi.resetPassword(token, data.newPassword);
      setDone(true);
      toast.success('Password updated');
      setTimeout(() => router.push('/login'), 1500);
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
          <CardTitle className="text-2xl font-display">Choose a new password</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">
            {done
              ? 'All done — redirecting you to sign in'
              : 'Enter a new password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token && !done ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--text-muted)]">
                  This reset link is missing its token or has already been used.
                  Please request a new one.
                </p>
              </div>
              <Button type="button" className="w-full" onClick={() => router.push('/forgot-password')}>
                Request a new link
              </Button>
            </div>
          ) : done ? (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-[var(--brand-soft)]/40 p-4">
                <KeyRound className="w-5 h-5 text-[var(--brand-strong)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--text-muted)]">
                  Your password has been reset. You can now sign in with your new password.
                </p>
              </div>
              <Button type="button" className="w-full" onClick={() => router.push('/login')}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                {...register('newPassword')}
                id="newPassword"
                type="password"
                label="New password"
                placeholder="At least 8 characters"
                error={errors.newPassword?.message}
                autoComplete="new-password"
              />

              <Input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                label="Confirm new password"
                placeholder="Re-enter your new password"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />

              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Reset password
              </Button>

              <p className="text-center text-sm text-[var(--text-muted)]">
                <Link
                  href="/login"
                  className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium transition-colors"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)]">
          <div className="w-8 h-8 border-2 border-[var(--brand-soft)] border-t-[var(--brand-strong)] rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
