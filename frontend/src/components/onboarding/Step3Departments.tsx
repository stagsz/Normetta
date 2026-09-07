'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { X } from 'lucide-react';

const SUGGESTIONS = ['Quality', 'Operations', 'HR', 'Finance', 'IT'];

export default function Step3Departments() {
  const { divisions, departments, addDepartment, removeDepartment, setStep } = useOnboardingStore();
  const [inputValue, setInputValue] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');

  const handleAdd = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addDepartment(trimmed, selectedDivisionId || undefined);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  const divisionOptions = divisions.map((d) => ({ value: d.id, label: d.name }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-muted)]">
        Add departments to your company. You can assign them to a division.
      </p>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleAdd(s)}
            className="px-3 py-1 text-xs rounded-full border border-[var(--border-subtle)] bg-[var(--brand-soft)] text-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors"
          >
            + {s}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          id="department-input"
          placeholder="Department name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {divisionOptions.length > 0 && (
          <Select
            options={divisionOptions}
            placeholder="Division"
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            className="w-40"
          />
        )}
        <Button type="button" variant="outline" onClick={() => handleAdd(inputValue)}>
          Add
        </Button>
      </div>

      {departments.length > 0 && (
        <ul className="space-y-2">
          {departments.map((d) => {
            const div = divisions.find((div) => div.id === d.divisionId);
            return (
              <li key={d.id} className="flex items-center justify-between bg-[var(--surface-sunken)] rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm text-[var(--text-strong)]">{d.name}</span>
                  {div && (
                    <span className="ml-2 text-xs text-[var(--text-subtle)]">({div.name})</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeDepartment(d.id)}
                  className="text-[var(--text-subtle)] hover:text-red-500 transition-colors"
                  aria-label={`Remove ${d.name}`}
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button type="button" className="flex-1" onClick={() => setStep(5)}>
          Continue
        </Button>
      </div>
    </div>
  );
}
