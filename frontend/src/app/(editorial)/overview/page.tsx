'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  StatusTicket,
  NavArch,
  AssessmentBoard,
  MetricArch,
  type NavClause,
  type AssessmentQuestion,
} from '@/components/editorial';

/* ── Static clause data (maps to ISO 9001 clauses 4-10) ── */
const clauses: NavClause[] = [
  { id: 'ctx', label: 'Context', clauseNumber: '04', href: '#' },
  { id: 'ldr', label: 'Leadership', clauseNumber: '05', href: '#' },
  { id: 'pln', label: 'Planning', clauseNumber: '06', href: '#' },
  { id: 'sup', label: 'Support', clauseNumber: '07', href: '#' },
  { id: 'ops', label: 'Operation', clauseNumber: '08', href: '#' },
  { id: 'evl', label: 'Evaluation', clauseNumber: '09', href: '#' },
  { id: 'imp', label: 'Improvement', clauseNumber: '10', href: '#' },
];

/* ── Per-clause question sets ── */
type ClauseData = {
  clauseTitle: string;
  clauseItalic: string;
  metaLabel: string;
  questions: AssessmentQuestion[];
};

const clauseQuestions: Record<string, ClauseData> = {
  ctx: {
    clauseTitle: 'Clause 04',
    clauseItalic: 'Context',
    metaLabel: 'Organizational Context',
    questions: [
      {
        id: 'c4-1',
        title: '4.1 Understanding the Organization',
        description:
          'Determine external and internal issues relevant to the organization\'s purpose and strategic direction that affect its ability to achieve the intended results of its QMS.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c4-2',
        title: '4.2 Interested Parties',
        description:
          'Determine the interested parties relevant to the QMS and the requirements of these interested parties.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c4-3',
        title: '4.3 Scope of the QMS',
        description:
          'Determine the boundaries and applicability of the QMS to establish its scope, considering the external and internal issues and the requirements of relevant interested parties.',
        status: 'review',
        done: false,
      },
      {
        id: 'c4-4',
        title: '4.4 QMS and Its Processes',
        description:
          'Establish, implement, maintain and continually improve a QMS, including the processes needed and their interactions.',
        status: 'action',
        done: false,
      },
    ],
  },
  ldr: {
    clauseTitle: 'Clause 05',
    clauseItalic: 'Leadership',
    metaLabel: 'Leadership Commitment',
    questions: [
      {
        id: 'c5-1',
        title: '5.1.1 Leadership & Commitment',
        description:
          'Top management shall demonstrate leadership and commitment with respect to the QMS by taking accountability for its effectiveness.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c5-2',
        title: '5.1.2 Customer Focus',
        description:
          'Top management shall demonstrate leadership and commitment with respect to customer focus by ensuring customer and applicable statutory/regulatory requirements are determined and met.',
        status: 'review',
        done: false,
      },
      {
        id: 'c5-3',
        title: '5.2 Quality Policy',
        description:
          'Top management shall establish, implement, and maintain a quality policy appropriate to the purpose and context of the organization.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c5-4',
        title: '5.3 Roles, Responsibilities & Authorities',
        description:
          'Top management shall ensure responsibilities and authorities for relevant roles are assigned, communicated, and understood within the organization.',
        status: 'action',
        done: false,
      },
    ],
  },
  pln: {
    clauseTitle: 'Clause 06',
    clauseItalic: 'Planning',
    metaLabel: 'Risk-Based Thinking',
    questions: [
      {
        id: 'c6-1',
        title: '6.1 Actions to Address Risks',
        description:
          'When planning for the QMS, consider the issues and determine the risks and opportunities that need to be addressed.',
        status: 'review',
        done: false,
      },
      {
        id: 'c6-2',
        title: '6.2 Quality Objectives',
        description:
          'Establish quality objectives at relevant functions, levels and processes needed for the QMS, consistent with the quality policy.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c6-3',
        title: '6.3 Planning of Changes',
        description:
          'When determining the need for changes to the QMS, changes shall be carried out in a planned manner.',
        status: 'action',
        done: false,
      },
    ],
  },
  sup: {
    clauseTitle: 'Clause 07',
    clauseItalic: 'Support',
    metaLabel: 'Resource Allocation',
    questions: [
      {
        id: 'c7-1',
        title: '7.1.1 General Resources',
        description:
          'Determine and provide resources needed for the establishment, implementation, maintenance and continual improvement of the QMS.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c7-2',
        title: '7.1.2 People',
        description:
          'Determine and provide the persons necessary for the effective implementation of its QMS and for the operation and control of its processes.',
        status: 'review',
        done: false,
      },
      {
        id: 'c7-3',
        title: '7.1.3 Infrastructure',
        description:
          'Determine, provide and maintain the infrastructure necessary for the operation of processes and to achieve conformity of products and services.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c7-5',
        title: '7.1.5 Monitoring & Measuring',
        description:
          'Determine and provide the resources needed to ensure valid and reliable results when monitoring or measuring is used to verify conformity.',
        status: 'action',
        done: false,
      },
    ],
  },
  ops: {
    clauseTitle: 'Clause 08',
    clauseItalic: 'Operation',
    metaLabel: 'Operational Planning',
    questions: [
      {
        id: 'c8-1',
        title: '8.1 Operational Planning & Control',
        description:
          'Plan, implement and control the processes needed to meet requirements for the provision of products and services.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c8-2',
        title: '8.2 Requirements for Products & Services',
        description:
          'Establish processes for communicating with customers, determining and reviewing requirements for products and services.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c8-4',
        title: '8.4 Control of External Processes',
        description:
          'Ensure that externally provided processes, products and services conform to requirements.',
        status: 'review',
        done: false,
      },
      {
        id: 'c8-5',
        title: '8.5 Production & Service Provision',
        description:
          'Implement production and service provision under controlled conditions including use of suitable monitoring and measurement resources.',
        status: 'action',
        done: false,
      },
    ],
  },
  evl: {
    clauseTitle: 'Clause 09',
    clauseItalic: 'Evaluation',
    metaLabel: 'Performance Evaluation',
    questions: [
      {
        id: 'c9-1',
        title: '9.1 Monitoring, Measurement, Analysis',
        description:
          'Determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation.',
        status: 'review',
        done: false,
      },
      {
        id: 'c9-2',
        title: '9.2 Internal Audit',
        description:
          'Conduct internal audits at planned intervals to provide information on whether the QMS conforms to requirements and is effectively implemented.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c9-3',
        title: '9.3 Management Review',
        description:
          'Top management shall review the organization\'s QMS at planned intervals to ensure its continuing suitability, adequacy, effectiveness.',
        status: 'compliant',
        done: true,
      },
    ],
  },
  imp: {
    clauseTitle: 'Clause 10',
    clauseItalic: 'Improvement',
    metaLabel: 'Continual Improvement',
    questions: [
      {
        id: 'c10-1',
        title: '10.1 General',
        description:
          'Determine and select opportunities for improvement and implement any necessary actions to meet customer requirements and enhance satisfaction.',
        status: 'compliant',
        done: true,
      },
      {
        id: 'c10-2',
        title: '10.2 Nonconformity & Corrective Action',
        description:
          'When a nonconformity occurs, react to it, evaluate the need for action, implement any action needed, review effectiveness, and update risks/opportunities.',
        status: 'review',
        done: false,
      },
      {
        id: 'c10-3',
        title: '10.3 Continual Improvement',
        description:
          'Continually improve the suitability, adequacy and effectiveness of the QMS, considering analysis, evaluation and management review outputs.',
        status: 'action',
        done: false,
      },
    ],
  },
};

/* ── Compute readiness score from all questions ── */
function computeScore(data: Record<string, ClauseData>): number {
  let total = 0;
  let done = 0;
  for (const clause of Object.values(data)) {
    for (const q of clause.questions) {
      total++;
      if (q.done) done++;
    }
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/* ── Count open actions across all clauses ── */
function countOpenActions(data: Record<string, ClauseData>): number {
  let count = 0;
  for (const clause of Object.values(data)) {
    for (const q of clause.questions) {
      if (!q.done) count++;
    }
  }
  return count;
}

/* ══════════════════════════════════════════════════════════
   Page Component
   ══════════════════════════════════════════════════════════ */

export default function EditorialOverviewPage() {
  const [activeClause, setActiveClause] = useState('sup');
  const [questionData, setQuestionData] =
    useState<Record<string, ClauseData>>(clauseQuestions);

  const currentClause = questionData[activeClause];
  const score = computeScore(questionData);
  const openActions = countOpenActions(questionData);

  const handleClauseClick = useCallback((clause: NavClause) => {
    setActiveClause(clause.id);
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      setQuestionData((prev) => {
        const clause = prev[activeClause];
        if (!clause) return prev;
        return {
          ...prev,
          [activeClause]: {
            ...clause,
            questions: clause.questions.map((q) =>
              q.id === id
                ? {
                    ...q,
                    done: !q.done,
                    status: !q.done ? 'compliant' as const : q.status === 'compliant' ? 'review' as const : q.status,
                  }
                : q
            ),
          },
        };
      });
    },
    [activeClause]
  );

  return (
    <>
      {/* Back to regular dashboard */}
      <Link href="/dashboard" className="ed-back-link">
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <div className="ed-canvas">
        <StatusTicket
          title="Quality"
          titleItalic="Management"
          score={score}
        />

        <NavArch
          clauses={clauses}
          activeClauseId={activeClause}
          onClauseClick={handleClauseClick}
        />

        <AssessmentBoard
          clauseTitle={currentClause.clauseTitle}
          clauseItalic={currentClause.clauseItalic}
          metaLabel={currentClause.metaLabel}
          questions={currentClause.questions}
          onToggle={handleToggle}
        />

        <MetricArch
          value={openActions}
          metricLabel="Open Actions"
        />
      </div>
    </>
  );
}
