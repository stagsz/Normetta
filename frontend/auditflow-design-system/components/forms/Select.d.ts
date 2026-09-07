import * as React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Styled native select with custom chevron. Options accept strings or
 * `{ value, label }` objects.
 */
export interface SelectProps {
  label?: string;
  hint?: string;
  value?: string;
  defaultValue?: string;
  options: Array<string | SelectOption>;
  placeholder?: string;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function Select(props: SelectProps): JSX.Element;
