'use client';

export interface NavClause {
  id: string;
  label: string;
  clauseNumber: string;
  href: string;
}

interface NavArchProps {
  clauses: NavClause[];
  activeClauseId?: string;
  topLabel?: string;
  bottomLabel?: string;
  onClauseClick?: (clause: NavClause) => void;
}

export function NavArch({
  clauses,
  activeClauseId,
  topLabel = 'Clauses 04-10',
  bottomLabel = 'Auditor_Req',
  onClauseClick,
}: NavArchProps) {
  return (
    <aside className="ed-module ed-nav-arch ed-animate-in-delay-1">
      <span className="ed-meta">{topLabel}</span>
      <ul className="ed-nav-list">
        {clauses.map((clause) => (
          <li
            key={clause.id}
            className={activeClauseId === clause.id ? 'active' : ''}
          >
            <a
              href={clause.href}
              onClick={(e) => {
                e.preventDefault();
                onClauseClick?.(clause);
              }}
            >
              {clause.label}
              <span className="ed-sup">{clause.clauseNumber}</span>
            </a>
          </li>
        ))}
      </ul>
      <span className="ed-meta ed-nav-arch__bottom-meta">{bottomLabel}</span>
    </aside>
  );
}
