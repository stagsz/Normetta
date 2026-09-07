'use client';

interface StatusTicketProps {
  label?: string;
  title: string;
  titleItalic: string;
  scoreLabel?: string;
  score: number;
}

export function StatusTicket({
  label = 'ISO 9001:2015',
  title,
  titleItalic,
  scoreLabel = 'Readiness Score',
  score,
}: StatusTicketProps) {
  return (
    <header className="ed-module ed-ticket ed-animate-in">
      <div className="ed-ticket__title-area">
        <span className="ed-meta">{label}</span>
        <h1>
          {title} <em>{titleItalic}</em>
        </h1>
      </div>
      <div className="ed-ticket__score">
        <span className="ed-meta">{scoreLabel}</span>
        <div className="ed-ticket__score-number">
          {score}
          <span className="ed-sup">%</span>
        </div>
      </div>
    </header>
  );
}
