import * as React from 'react';

/**
 * Checkbox with optional label and description. Works controlled (`checked` +
 * `onChange`) or uncontrolled (`defaultChecked`).
 */
export interface CheckboxProps {
  label?: string;
  /** Secondary line under the label */
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
