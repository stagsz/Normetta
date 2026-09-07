'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useAssessment, useUpdateAssessment } from '@/hooks/useAssessments';
import { assessmentsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const editAssessmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scope: z.string().optional(),
  objectives: z.string().optional(),
  scheduledDate: z.string().optional(),
  dueDate: z.string().optional(),
});

type EditAssessmentFormData = z.infer<typeof editAssessmentSchema>;

function EditAssessmentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton width={300} height={32} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton width="100%" height={40} />
          <Skeleton width="100%" height={100} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = (params?.id ?? '') as string;

  const { data, isLoading, isError } = useAssessment(assessmentId);
  const updateAssessment = useUpdateAssessment();

  const assessment = data?.data;

  // Parse objectives from JSON if it's a string
  const parseObjectives = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') {
      try {
        const parsed = JSON.parse(obj);
        return Array.isArray(parsed) ? parsed.join('\n') : '';
      } catch {
        return obj;
      }
    }
    if (Array.isArray(obj)) return obj.join('\n');
    return '';
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditAssessmentFormData>({
    resolver: zodResolver(editAssessmentSchema),
    values: assessment ? {
      title: assessment.title || '',
      description: assessment.description || '',
      scope: assessment.scope || '',
      objectives: parseObjectives(assessment.objectives),
      scheduledDate: assessment.scheduledDate
        ? new Date(assessment.scheduledDate).toISOString().split('T')[0]
        : '',
      dueDate: assessment.dueDate
        ? new Date(assessment.dueDate).toISOString().split('T')[0]
        : '',
    } : {
      title: '',
      description: '',
      scope: '',
      objectives: '',
      scheduledDate: '',
      dueDate: '',
    },
  });

  const onSubmit = async (data: EditAssessmentFormData) => {
    try {
      // Convert objectives string to array
      const objectivesArray = data.objectives
        ? typeof data.objectives === 'string'
          ? data.objectives.split('\n').filter(o => o.trim())
          : data.objectives
        : [];

      await updateAssessment.mutateAsync({
        id: assessmentId,
        ...data,
        objectives: objectivesArray,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
      toast.success('Assessment updated successfully');
      router.push(`/assessments/${assessmentId}`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update assessment');
    }
  };

  if (isLoading) {
    return <EditAssessmentSkeleton />;
  }

  if (isError || !assessment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/assessments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">Assessment Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/assessments/${assessmentId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Edit Assessment</h1>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[var(--text-body)] mb-2">
                Title *
              </label>
              <input
                {...register('title')}
                id="title"
                type="text"
                placeholder="Assessment title"
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-[var(--shadow-sm)] focus:outline-none focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-body)] mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                id="description"
                placeholder="Assessment description"
                rows={4}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-[var(--shadow-sm)] focus:outline-none focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Scope */}
            <div>
              <label htmlFor="scope" className="block text-sm font-medium text-[var(--text-body)] mb-2">
                Scope
              </label>
              <textarea
                {...register('scope')}
                id="scope"
                placeholder="Assessment scope"
                rows={3}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-[var(--shadow-sm)] focus:outline-none focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              />
              {errors.scope && <p className="mt-1 text-sm text-red-600">{errors.scope.message}</p>}
            </div>

            {/* Objectives */}
            <div>
              <label htmlFor="objectives" className="block text-sm font-medium text-[var(--text-body)] mb-2">
                Objectives
              </label>
              <textarea
                {...register('objectives')}
                id="objectives"
                placeholder="Assessment objectives"
                rows={3}
                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-[var(--shadow-sm)] focus:outline-none focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              />
              {errors.objectives && <p className="mt-1 text-sm text-red-600">{errors.objectives.message}</p>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-[var(--text-body)] mb-2">
                  Scheduled Date
                </label>
                <input
                  {...register('scheduledDate')}
                  id="scheduledDate"
                  type="date"
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-[var(--shadow-sm)] focus:outline-none focus:ring-[var(--brand)] focus:border-[var(--brand)]"
                />
                {errors.scheduledDate && <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>}
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-[var(--text-body)] mb-2">
                  Due Date
                </label>
                <input
                  {...register('dueDate')}
                  id="dueDate"
                  type="date"
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-[var(--shadow-sm)] focus:outline-none focus:ring-[var(--brand)] focus:border-[var(--brand)]"
                />
                {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" loading={isSubmitting}>
                Save Changes
              </Button>
              <Link href={`/assessments/${assessmentId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
