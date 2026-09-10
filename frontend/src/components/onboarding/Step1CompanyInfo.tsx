'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingApi } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  industry: z.string().optional(),
  country: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Step1CompanyInfo() {
  const { company, setCompany, setStep } = useOnboardingStore();
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: company.name,
      slug: company.slug,
      industry: company.industry ?? '',
      country: company.country ?? '',
    },
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (nameValue && !company.slug) {
      setValue('slug', slugify(nameValue));
    }
  }, [nameValue, setValue, company.slug]);

  const handleSlugBlur = async (slug: string) => {
    if (!slug || slug.length < 2) return;
    setCheckingSlug(true);
    setSlugAvailable(null);
    try {
      const res = await onboardingApi.checkSlug(slug);
      setSlugAvailable(res.data?.data?.available ?? false);
    } catch {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const onSubmit = (data: FormData) => {
    setCompany({
      name: data.name,
      slug: data.slug,
      industry: data.industry || undefined,
      country: data.country || undefined,
    });
    setStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('name')}
        id="name"
        label="Company name"
        placeholder="Acme Corp"
        error={errors.name?.message}
      />

      <div>
        <Input
          {...register('slug')}
          id="slug"
          label="URL slug"
          placeholder="acme-corp"
          error={errors.slug?.message}
          onBlur={(e) => handleSlugBlur(e.target.value)}
        />
        {checkingSlug && <p className="mt-1 text-xs text-[var(--text-muted)]">Checking availability...</p>}
        {!checkingSlug && slugAvailable === true && (
          <p className="mt-1 text-xs text-[var(--brand-strong)]">Slug is available</p>
        )}
        {!checkingSlug && slugAvailable === false && (
          <p className="mt-1 text-xs text-red-600">Slug is already taken</p>
        )}
      </div>

      <Input
        {...register('industry')}
        id="industry"
        label="Industry (optional)"
        placeholder="Manufacturing"
        error={errors.industry?.message}
      />

      <Input
        {...register('country')}
        id="country"
        label="Country (optional)"
        placeholder="United States"
        error={errors.country?.message}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
