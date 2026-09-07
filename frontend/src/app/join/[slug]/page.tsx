'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { orgInviteApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield } from 'lucide-react';

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function JoinPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [orgName, setOrgName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    orgInviteApi.getOrg(slug)
      .then((res) => {
        setOrgName(res.data?.data?.name ?? slug);
      })
      .catch(() => {
        setNotFound(true);
      });
  }, [slug]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await orgInviteApi.join(slug, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <p className="text-2xl font-bold text-[var(--text-strong)] mb-2">404</p>
            <p className="text-[var(--text-muted)]">This invite link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-[var(--brand-strong)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-strong)] mb-2">Request sent!</h2>
            <p className="text-[var(--text-muted)]">
              Your join request has been submitted. An admin will review and approve it shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-sunken)] py-12 px-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-lg)]">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 bg-[var(--brand-soft)] rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-[var(--brand-strong)]" />
          </div>
          <CardTitle className="text-xl">
            Join {orgName ?? '...'}
          </CardTitle>
          <CardDescription>Create an account to request access</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-3">
              <Input
                {...register('firstName')}
                id="firstName"
                label="First name"
                placeholder="Jane"
                error={errors.firstName?.message}
              />
              <Input
                {...register('lastName')}
                id="lastName"
                label="Last name"
                placeholder="Doe"
                error={errors.lastName?.message}
              />
            </div>
            <Input
              {...register('email')}
              id="email"
              type="email"
              label="Email"
              placeholder="jane@company.com"
              error={errors.email?.message}
            />
            <Input
              {...register('password')}
              id="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
            />
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              label="Confirm password"
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Request to Join
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
