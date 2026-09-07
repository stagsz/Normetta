import * as React from 'react';

/**
 * Toggle switch for binary settings. `onChange` receives the next boolean.
 */
export interface SwitchProps {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  onChange?: (next: boolean) => void;
}

export function Switch(props: SwitchProps): JSX.Element;
