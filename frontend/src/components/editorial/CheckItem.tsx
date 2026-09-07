'use client';

export type CheckStatus = 'compliant' | 'review' | 'action';

interface CheckItemProps {
  id: string;
  title: string;
  description: string;
  status: CheckStatus;
  done: boolean;
  onToggle?: (id: string) => void;
}

const statusConfig: Record<CheckStatus, { label: string; className: string }> = {
  compliant: { label: 'Compliant', className: 'ed-badge--compliant' },
  review: { label: 'Review', className: 'ed-badge--review' },
  action: { label: 'Action', className: 'ed-badge--action' },
};

export function CheckItem({
  id,
  title,
  description,
  status,
  done,
  onToggle,
}: CheckItemProps) {
  const config = statusConfig[status];

  return (
    <div className="ed-check-item">
      <div
        className={`ed-checkbox ${done ? 'done' : ''}`}
        role="checkbox"
        aria-checked={done}
        aria-label={`Mark ${title} as ${done ? 'incomplete' : 'complete'}`}
        tabIndex={0}
        onClick={() => onToggle?.(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle?.(id);
          }
        }}
      />
      <div className="ed-check-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={`ed-badge ${config.className}`}>{config.label}</div>
    </div>
  );
}
