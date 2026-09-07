'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Calendar, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usersApi } from '@/lib/api';
import {
  useCreateCorrectiveAction,
  useUpdateCorrectiveAction,
  CorrectiveAction,
} from '@/hooks/useCorrectiveActions';
import { toast } from 'sonner';

const priorityOptions = [
  { value: 'LOW', label: 'Low', color: 'bg-[var(--surface-sunken)] text-[var(--text-muted)]' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-50 text-amber-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-50 text-red-700' },
] as const;

interface UserOption {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface CorrectiveActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ncrId: string;
  action?: CorrectiveAction; // If provided, we're editing an existing action
}

export function CorrectiveActionFormModal({
  isOpen,
  onClose,
  ncrId,
  action,
}: CorrectiveActionFormModalProps) {
  const isEditing = !!action;

  // Form state
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [targetDate, setTargetDate] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [assignedUser, setAssignedUser] = useState<UserOption | null>(null);

  // User search state
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);

  // Mutations
  const createAction = useCreateCorrectiveAction();
  const updateAction = useUpdateCorrectiveAction();

  const isSubmitting = createAction.isPending || updateAction.isPending;

  // Initialize form when editing
  useEffect(() => {
    if (action) {
      setDescription(action.description);
      setPriority(action.priority);
      setTargetDate(action.targetDate ? action.targetDate.split('T')[0] : '');
      setAssignedToId(action.assignedToId);
      if (action.assignedTo) {
        setAssignedUser({
          id: action.assignedTo.id,
          email: action.assignedTo.email,
          firstName: action.assignedTo.firstName,
          lastName: action.assignedTo.lastName,
        });
      } else {
        setAssignedUser(null);
      }
    } else {
      // Reset form for new action
      setDescription('');
      setPriority('MEDIUM');
      setTargetDate('');
      setAssignedToId(null);
      setAssignedUser(null);
    }
    setUserSearch('');
    setUserSearchResults([]);
  }, [action, isOpen]);

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.length < 2) {
        setUserSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await usersApi.list({
          search: userSearch,
          isActive: true,
          limit: 10,
        });
        setUserSearchResults(response.data.users || []);
      } catch {
        setUserSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [userSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user: UserOption) => {
    setAssignedToId(user.id);
    setAssignedUser(user);
    setUserSearch('');
    setShowUserDropdown(false);
  };

  const handleClearUser = () => {
    setAssignedToId(null);
    setAssignedUser(null);
    setUserSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      const data = {
        description: description.trim(),
        priority,
        assignedToId: assignedToId || null,
        targetDate: targetDate || null,
      };

      if (isEditing && action) {
        await updateAction.mutateAsync({
          id: action.id,
          data,
        });
        toast.success('Corrective action updated');
      } else {
        await createAction.mutateAsync({
          ncrId,
          data,
        });
        toast.success('Corrective action created');
      }

      onClose();
    } catch {
      toast.error(isEditing ? 'Failed to update corrective action' : 'Failed to create corrective action');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[var(--brand-strong)]" />
            {isEditing ? 'Edit Corrective Action' : 'Add Corrective Action'}
          </CardTitle>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the corrective action to be taken..."
                className="w-full rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-body)] mb-2">
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    disabled={isSubmitting}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      priority === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-[var(--brand)]`
                        : 'bg-[var(--surface-sunken)] text-[var(--text-muted)] hover:bg-[var(--stone-200)]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div ref={userSearchRef}>
              <label htmlFor="assignee" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Assign To
                  <span className="text-[var(--text-subtle)] font-normal">(optional)</span>
                </div>
              </label>

              {assignedUser ? (
                <div className="flex items-center justify-between p-3 bg-[var(--surface-sunken)] rounded-md border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand-strong)] text-sm font-medium">
                      {assignedUser.firstName[0]}{assignedUser.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-strong)]">
                        {assignedUser.firstName} {assignedUser.lastName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{assignedUser.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearUser}
                    className="text-[var(--text-subtle)] hover:text-red-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center border border-[var(--border-default)] rounded-md bg-[var(--surface-card)] px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-[var(--brand)] focus-within:border-transparent">
                    <Search className="h-4 w-4 text-[var(--text-subtle)] flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      onFocus={() => setShowUserDropdown(true)}
                      className="flex-1 text-sm outline-none placeholder:text-[var(--text-subtle)]"
                      disabled={isSubmitting}
                    />
                    {isSearching && (
                      <svg
                        className="h-4 w-4 animate-spin text-[var(--text-subtle)]"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* User dropdown */}
                  {showUserDropdown && userSearch.length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-md shadow-[var(--shadow-lg)] max-h-48 overflow-auto">
                      {userSearchResults.length > 0 ? (
                        userSearchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleSelectUser(user)}
                            className="w-full px-3 py-2 text-left hover:bg-[var(--surface-sunken)] flex items-center gap-2"
                          >
                            <div className="h-8 w-8 rounded-full bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand-strong)] text-sm font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text-strong)] truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-sm text-[var(--text-muted)] text-center">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Target Date */}
            <div>
              <label htmlFor="targetDate" className="block text-sm font-medium text-[var(--text-body)] mb-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Target Date
                  <span className="text-[var(--text-subtle)] font-normal">(optional)</span>
                </div>
              </label>
              <input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-md border border-[var(--border-default)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isEditing ? 'Save Changes' : 'Create Action'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
