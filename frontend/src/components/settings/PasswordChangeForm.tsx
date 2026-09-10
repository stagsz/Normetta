'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function PasswordChangeForm() {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < MIN_PASSWORD_LENGTH) {
      newErrors.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    } else if (formData.newPassword.length > MAX_PASSWORD_LENGTH) {
      newErrors.newPassword = `Password must be no more than ${MAX_PASSWORD_LENGTH} characters`;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Password changed successfully');
      // Clear form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
    if (!password) {
      return { label: '', color: '', width: '0%' };
    }

    let strength = 0;
    if (password.length >= MIN_PASSWORD_LENGTH) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { label: 'Weak', color: 'bg-[var(--status-fail-solid)]', width: '33%' };
    } else if (strength <= 4) {
      return { label: 'Medium', color: 'bg-[var(--status-obs-solid)]', width: '66%' };
    } else {
      return { label: 'Strong', color: 'bg-[var(--status-pass-solid)]', width: '100%' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--surface-sunken)] flex items-center justify-center">
            <Lock className="h-5 w-5 text-[var(--text-muted)]" />
          </div>
          <div>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              error={errors.currentPassword}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              tabIndex={-1}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                label="New Password"
                value={formData.newPassword}
                onChange={handleChange('newPassword')}
                error={errors.newPassword}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-8 text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-[var(--stone-200)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Password strength: <span className="font-medium">{passwordStrength.label}</span>
                </p>
              </div>
            )}

            {/* Password Requirements */}
            <ul className="text-xs text-[var(--text-muted)] space-y-1 mt-2">
              <li className="flex items-center gap-1.5">
                <Check
                  className={`h-3.5 w-3.5 ${
                    formData.newPassword.length >= MIN_PASSWORD_LENGTH
                      ? 'text-green-500'
                      : 'text-[var(--text-subtle)]'
                  }`}
                />
                At least {MIN_PASSWORD_LENGTH} characters
              </li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
