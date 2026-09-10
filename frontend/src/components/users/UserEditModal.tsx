'use client';

import { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUpdateUser, User } from '@/hooks/useUsers';
import { toast } from 'sonner';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserEditModal({ isOpen, onClose, user }: UserEditModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  const updateUser = useUpdateUser();
  const isSubmitting = updateUser.isPending;

  // Initialize form when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setErrors({});
    }
  }, [user, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length > 100) {
      newErrors.firstName = 'First name must be 100 characters or less';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length > 100) {
      newErrors.lastName = 'Last name must be 100 characters or less';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!validateForm()) return;

    try {
      await updateUser.mutateAsync({
        userId: user.id,
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        },
      });

      toast.success('User updated successfully');
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Failed to update user';
      toast.error(message);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-[var(--brand-strong)]" />
            Edit User
          </CardTitle>
          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          {/* User avatar and role indicator */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="h-12 w-12 rounded-full bg-[var(--brand-soft)] flex items-center justify-center">
              <span className="text-lg font-medium text-[var(--brand-strong)]">
                {user.firstName?.[0]?.toUpperCase() || ''}
                {user.lastName?.[0]?.toUpperCase() || ''}
              </span>
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Editing user profile</p>
              <p className="text-sm font-medium text-[var(--text-body)]">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  First Name <span className="text-red-500">*</span>
                </div>
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors((prev) => ({ ...prev, firstName: undefined }));
                  }
                }}
                placeholder="Enter first name"
                disabled={isSubmitting}
                className={errors.firstName ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  Last Name <span className="text-red-500">*</span>
                </div>
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors((prev) => ({ ...prev, lastName: undefined }));
                  }
                }}
                placeholder="Enter last name"
                disabled={isSubmitting}
                className={errors.lastName ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-red-500">*</span>
                </div>
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="Enter email address"
                disabled={isSubmitting}
                className={errors.email ? 'border-red-300 focus:ring-red-500' : ''}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
