'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { assessmentsApi, nonConformitiesApi } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

export type CommandItem =
  | { id: string; type: 'assessment'; title: string; subtitle?: string; href: string }
  | { id: string; type: 'ncr'; title: string; subtitle?: string; href: string };

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debouncedQuery = useDebounce(query, 250);

  const navigate = useCallback((item: CommandItem) => {
    onClose();
    router.push(item.href);
  }, [router, onClose]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setItems([]);
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive((prev) => (items.length ? (prev + 1) % items.length : 0));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((prev) => (items.length ? (prev - 1 + items.length) % items.length : 0));
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const current = items[active];
        if (current) navigate(current);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, items, active, onClose, navigate]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const q = debouncedQuery.trim();
    setLoading(true);
    (async () => {
      try {
        const [assessmentsRes, ncrsRes] = await Promise.all([
          assessmentsApi.list({ q, pageSize: 5 }),
          nonConformitiesApi.list({ search: q, pageSize: 5 }),
        ]);
        if (cancelled) return;
        const out: CommandItem[] = [];
        const aData = (assessmentsRes as any)?.data?.data as Array<any> | undefined;
        if (aData) {
          for (const a of aData) {
            out.push({
              id: `assessment:${a.id}`,
              type: 'assessment',
              title: a.title,
              subtitle: String(a.status ?? '').replace(/_/g, ' ') || 'Assessment',
              href: `/assessments/${a.id}`,
            });
          }
        }
        const nData = (ncrsRes as any)?.data?.data as Array<any> | undefined;
        if (nData) {
          for (const n of nData) {
            out.push({
              id: `ncr:${n.id}`,
              type: 'ncr',
              title: n.title,
              subtitle: `${String(n.severity ?? '').replace(/_/g, ' ')} · ${String(n.status ?? '').replace(/_/g, ' ')}`,
              href: `/non-conformities/${n.id}`,
            });
          }
        }
        setItems(out.slice(0, 10));
        setActive(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const typeLabel = (type: CommandItem['type']) =>
    type === 'assessment' ? 'Assessment' : 'NCR';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 top-[18vh] mx-auto max-w-2xl">
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[var(--shadow-lg)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 border-b border-[var(--border-subtle)]">
            <Search className="text-[var(--text-subtle)]" size={18} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assessments, NCRs, clauses..."
              className="w-full bg-transparent py-4 text-sm font-medium text-[var(--text-strong)] placeholder:text-[var(--text-subtle)] outline-none"
            />
            <kbd className="bg-[var(--surface-sunken)] text-[var(--text-subtle)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-[10px] font-bold">esc</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {query.trim().length < 2 ? (
              <div className="px-4 py-10 text-center text-xs text-[var(--text-muted)]">Type at least 2 characters to search.</div>
            ) : items.length === 0 && !loading ? (
              <div className="px-4 py-10 text-center text-xs text-[var(--text-muted)]">No matches.</div>
            ) : (
              <div>
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => navigate(item)}
                    className={`w-full text-left px-4 py-3 border-b border-[var(--border-subtle)] last:border-b-0 transition-colors ${
                      index === active ? 'bg-[var(--surface-sunken)]' : 'hover:bg-[var(--surface-sunken)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-strong)] truncate">{item.title}</div>
                        {item.subtitle && <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.subtitle}</div>}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">
                        {typeLabel(item.type)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
