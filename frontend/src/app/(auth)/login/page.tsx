'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getAuthErrorInfo, isNetworkError } from '@/lib/auth-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authApi.login(data.email, data.password);
      const { user, accessToken, refreshToken } = response.data.data;

      setAuth(user, accessToken, refreshToken);
      toast.success('Welcome back!');
      router.push('/dashboard');
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
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--brand-soft)]/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-[var(--shadow-lg)] relative">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-[var(--brand-soft)] rounded-2xl flex items-center justify-center mb-4 shadow-[var(--shadow-sm)]">
            <Shield className="w-9 h-9 text-[var(--brand-strong)]" />
          </div>
          <CardTitle className="text-2xl font-display">ISO 9001 Audit Management</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
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

            <Input
              {...register('password')}
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--brand-strong)] focus:ring-[var(--brand-strong)] border-[var(--border-default)] rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-[var(--text-muted)]">Remember me</label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
              Sign in
            </Button>

            <p className="text-center text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[var(--brand-strong)] hover:text-[var(--brand)] font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
