import * as React from 'react';

export interface TabItem {
  id: string;
  label: string;
  /** Optional count pill (e.g. number of findings) */
  count?: number;
}

/**
 * Segmented tab switcher. Controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`). Renders the tab strip only — you render panels yourself.
 */
export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
}

export function Tabs(props: TabsProps): JSX.Element;
