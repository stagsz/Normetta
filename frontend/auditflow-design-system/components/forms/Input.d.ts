import * as React from 'react';

/**
 * Text input with optional label, hint, error, and leading icon.
 * The whole field (label + control + message) renders as one block.
 */
export interface InputProps {
  label?: string;
  /** Helper text below the field */
  hint?: string;
  /** Error message; turns the field red and replaces the hint */
  error?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  /** @default "text" */
  type?: string;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input(props: InputProps): JSX.Element;
