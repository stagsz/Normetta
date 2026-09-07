'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useOnboardingStore, PermissionLevel } from '@/stores/onboardingStore';
import { onboardingApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { X, Lock } from 'lucide-react';

const PERMISSION_OPTIONS = [
  { value: 'MANAGER', label: 'Manager' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'VIEWER', label: 'Viewer' },
];

export default function Step4Roles() {
  const store = useOnboardingStore();
  const { setAuth } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('AUDITOR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    const name = inputValue.trim();
    if (!name) return;
    store.addRole(name, permissionLevel);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const orgData = {
        company: store.company,
        profile: store.profile,
        divisions: store.divisions.map((d) => ({ name: d.name })),
        departments: store.departments.map((d) => ({
          name: d.name,
          divisionIndex: d.divisionId
            ? store.divisions.findIndex((div) => div.id === d.divisionId)
            : undefined,
        })),
        roles: store.roles.map((r) => ({ name: r.name, permissionLevel: r.permissionLevel })),
      };

      // If user is already logged in, use setup-org (no user creation needed)
      const isLoggedIn = !!localStorage.getItem('accessToken');
      let inviteUrl: string;

      if (isLoggedIn) {
        const res = await onboardingApi.setupOrg(orgData);
        inviteUrl = res.data.data.inviteUrl ?? '';
      } else {
        const res = await onboardingApi.setup({ ...store.personal, ...orgData });
        const { user, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setAuth(user, accessToken, refreshToken);
        inviteUrl = res.data.data.inviteUrl ?? '';
      }

      store.setInviteUrl(inviteUrl);
      store.setStep(6);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Setup failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">
        Define custom roles for your team. Admin is always included.
      </p>

      {/* Locked admin role */}
      <div className="flex items-center justify-between bg-[var(--surface-sunken)] rounded-lg px-3 py-2 opacity-70">
        <span className="text-sm font-medium text-[var(--text-body)]">Admin</span>
        <Lock size={14} className="text-[var(--text-subtle)]" />
      </div>

      <div className="flex gap-2">
        <Input
          id="role-input"
          placeholder="Role name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Select
          options={PERMISSION_OPTIONS}
          value={permissionLevel}
          onChange={(e) => setPermissionLevel(e.target.value as PermissionLevel)}
          className="w-36"
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {store.roles.length > 0 && (
        <ul className="space-y-2">
          {store.roles.map((r) => (
            <li key={r.id} className="flex items-center justify-between bg-[var(--surface-sunken)] rounded-lg px-3 py-2">
              <div>
                <span className="text-sm text-[var(--text-strong)]">{r.name}</span>
                <span className="ml-2 text-xs text-[var(--text-subtle)] capitalize">({r.permissionLevel})</span>
              </div>
              <button
                type="button"
                onClick={() => store.removeRole(r.id)}
                className="text-[var(--text-subtle)] hover:text-red-500 transition-colors"
                aria-label={`Remove ${r.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => store.setStep(4)}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={handleFinish} loading={isSubmitting}>
          Finish Setup
        </Button>
      </div>
    </div>
  );
}
