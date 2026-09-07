'use client';

import { CheckItem, type CheckStatus } from './CheckItem';

export interface AssessmentQuestion {
  id: string;
  title: string;
  description: string;
  status: CheckStatus;
  done: boolean;
}

interface AssessmentBoardProps {
  clauseTitle: string;
  clauseItalic: string;
  metaLabel?: string;
  questions: AssessmentQuestion[];
  onToggle?: (id: string) => void;
}

export function AssessmentBoard({
  clauseTitle,
  clauseItalic,
  metaLabel = 'Resource Allocation',
  questions,
  onToggle,
}: AssessmentBoardProps) {
  return (
    <main className="ed-module ed-board ed-animate-in-delay-2">
      <div className="ed-board__header">
        <h2>
          {clauseTitle}: <em>{clauseItalic}</em>
        </h2>
        <span className="ed-meta">{metaLabel}</span>
      </div>
      <div>
        {questions.map((q) => (
          <CheckItem
            key={q.id}
            id={q.id}
            title={q.title}
            description={q.description}
            status={q.status}
            done={q.done}
            onToggle={onToggle}
          />
        ))}
      </div>
    </main>
  );
}
