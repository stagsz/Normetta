'use client';

import { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function HelpPage() {
  const [expandedSection, setExpandedSection] = useState<string>('getting-started');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? '' : id);
  };

  const sections: Section[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Welcome to ISO 9001 Self-Assessment</h3>
            <p className="text-[var(--text-muted)] mb-4">
              This application helps you conduct ISO 9001:2015 Quality Management System assessments,
              track non-conformities, and manage corrective actions.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-base mb-2">Quick Start Guide</h4>
            <ol className="list-decimal list-inside space-y-2 text-[var(--text-muted)]">
              <li>
                <span className="font-medium text-[var(--text-strong)]">Create an Assessment</span> - Navigate to
                Assessments and click New Assessment
              </li>
              <li>
                <span className="font-medium text-[var(--text-strong)]">Choose a Template</span> - Select from
                predefined templates or create a full assessment
              </li>
              <li>
                <span className="font-medium text-[var(--text-strong)]">Conduct the Audit</span> - Answer
                questions, provide justifications, and upload evidence
              </li>
              <li>
                <span className="font-medium text-[var(--text-strong)]">Review Results</span> - View compliance
                scores and identify areas for improvement
              </li>
              <li>
                <span className="font-medium text-[var(--text-strong)]">Manage Non-Conformities</span> - Create
                and track corrective actions for any issues found
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'templates',
      title: 'Assessment Templates',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Shorter, Focused Assessments</h3>
            <p className="text-[var(--text-muted)] mb-4">
              Instead of always conducting full 73-section assessments, you can now choose from
              predefined templates that focus on specific areas of ISO 9001:2015.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-200 mb-1">Full ISO 9001:2015 Assessment</h4>
                  <p className="text-sm text-blue-300 mb-2">73 sections - All Clauses (4-10)</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Comprehensive assessment covering all ISO 9001:2015 requirements. Best for
                    certification audits and complete QMS reviews.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-400/25 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-200 mb-1">Quick Check Assessment</h4>
                  <p className="text-sm text-green-300 mb-2">Approximately 20 sections - Essential Requirements</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Focused assessment covering essential QMS requirements. Ideal for quarterly
                    reviews and management meetings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-400/25 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-200 mb-1">Leadership & Planning Focus</h4>
                  <p className="text-sm text-purple-300 mb-2">Approximately 15 sections - Clauses 5, 6</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Targeted assessment focusing on leadership, quality policy, organizational roles,
                    and planning. Perfect for management reviews.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-400/25 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-orange-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-200 mb-1">Operations & Delivery Focus</h4>
                  <p className="text-sm text-orange-300 mb-2">Approximately 15 sections - Clause 8</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Deep dive into operational processes including customer requirements, design,
                    supplier management, and production control.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-400/25 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-indigo-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-indigo-200 mb-1">Documentation & Support Review</h4>
                  <p className="text-sm text-indigo-300 mb-2">Approximately 12 sections - Clause 7</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Focused review of support processes including resources, competence, awareness,
                    and documented information.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--brand-soft)] border border-[var(--border-default)] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-[var(--text-link)] mt-0.5" />
                <div>
                  <h4 className="font-medium text-[var(--text-link)] mb-1">Strategic Planning Assessment</h4>
                  <p className="text-sm text-[var(--text-body)] mb-2">Approximately 18 sections - Clauses 4, 6, 9, 10</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Strategic-level assessment covering context, planning, performance evaluation, and
                    improvement. Suitable for annual strategic reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-sunken)] border border-[var(--border-subtle)] rounded-xl p-4 mt-4">
            <h4 className="font-medium text-[var(--text-strong)] mb-2">How Templates Work</h4>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-[var(--text-subtle)] mt-0.5 flex-shrink-0" />
                <span>
                  When creating an assessment, select a template to focus on specific areas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-[var(--text-subtle)] mt-0.5 flex-shrink-0" />
                <span>
                  During the audit, only relevant sections will be displayed based on your template
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-[var(--text-subtle)] mt-0.5 flex-shrink-0" />
                <span>Complete assessments faster with targeted, focused audits</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-[var(--text-subtle)] mt-0.5 flex-shrink-0" />
                <span>Use different templates for quarterly checks vs. certification audits</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'user-roles',
      title: 'User Roles & Permissions',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Role-Based Access Control</h3>
            <p className="text-[var(--text-muted)] mb-4">
              The application uses role-based permissions to control what users can see and do.
            </p>
          </div>

          <div className="space-y-3">
            <div className="border rounded-xl p-4">
              <h4 className="font-medium text-[var(--text-strong)] mb-2">System Admin</h4>
              <p className="text-sm text-[var(--text-muted)] mb-2">Full system access and control</p>
              <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1">
                <li>Manage users and roles</li>
                <li>Configure system settings</li>
                <li>Access all assessments and data</li>
                <li>Create and manage templates</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h4 className="font-medium text-[var(--text-strong)] mb-2">Quality Manager</h4>
              <p className="text-sm text-[var(--text-muted)] mb-2">QMS oversight and management</p>
              <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1">
                <li>Create and manage assessments</li>
                <li>Assign auditors to assessments</li>
                <li>Review and approve findings</li>
                <li>Generate reports</li>
                <li>Manage non-conformities and corrective actions</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h4 className="font-medium text-[var(--text-strong)] mb-2">Internal Auditor</h4>
              <p className="text-sm text-[var(--text-muted)] mb-2">Conduct audits and document findings</p>
              <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1">
                <li>Conduct assigned assessments</li>
                <li>Answer questions and provide evidence</li>
                <li>Document non-conformities</li>
                <li>Track corrective actions</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h4 className="font-medium text-[var(--text-strong)] mb-2">Department Head</h4>
              <p className="text-sm text-[var(--text-muted)] mb-2">View and respond to findings</p>
              <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1">
                <li>View assessments for their department</li>
                <li>Respond to non-conformities</li>
                <li>Update corrective action status</li>
              </ul>
            </div>

            <div className="border rounded-xl p-4">
              <h4 className="font-medium text-[var(--text-strong)] mb-2">Viewer</h4>
              <p className="text-sm text-[var(--text-muted)] mb-2">Read-only access</p>
              <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1">
                <li>View assessment results</li>
                <li>View reports and dashboards</li>
                <li>No editing capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'scoring',
      title: 'Scoring System',
      icon: <Star className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Understanding Assessment Scores</h3>
            <p className="text-[var(--text-muted)] mb-4">
              The application uses a 0-5 maturity scale to assess QMS compliance and effectiveness.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[var(--surface-sunken)] border border-[var(--border-default)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--status-na-solid)] text-white font-semibold flex items-center justify-center text-sm">
                  0
                </div>
                <h4 className="font-medium text-[var(--text-strong)]">Not Applicable (N/A)</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                This requirement does not apply to your organization or process. No action needed.
              </p>
            </div>

            <div className="bg-[var(--status-fail-bg)] border border-[var(--status-fail-line)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--status-fail-solid)] text-white font-semibold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-medium text-[var(--status-fail-fg)]">Non-Compliant</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Requirement is not met. Significant gaps exist. Immediate corrective action required.
              </p>
            </div>

            <div className="bg-orange-500/10 border border-orange-400/25 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-semibold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-medium text-orange-200">Initial</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Basic processes exist but are informal. Documentation is minimal. Inconsistent
                implementation.
              </p>
            </div>

            <div className="bg-[var(--status-obs-bg)] border border-[var(--status-obs-line)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--status-obs-solid)] text-white font-semibold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-medium text-[var(--status-obs-fg)]">Developing</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Processes are documented and generally followed. Some monitoring in place. Room for
                improvement.
              </p>
            </div>

            <div className="bg-[var(--status-pass-bg)] border border-[var(--status-pass-line)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--status-pass-solid)] text-white font-semibold flex items-center justify-center text-sm">
                  4
                </div>
                <h4 className="font-medium text-[var(--status-pass-fg)]">Established</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Processes are well-defined, consistently implemented, and monitored. Meets ISO 9001
                requirements.
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/25 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-sm">
                  5
                </div>
                <h4 className="font-medium text-blue-200">Optimizing</h4>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Processes are optimized through continual improvement. Data-driven decisions. Best
                practice performance.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'workflow',
      title: 'Assessment Workflow',
      icon: <ClipboardList className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Complete Assessment Process</h3>
            <p className="text-[var(--text-muted)] mb-4">
              Follow this workflow to conduct a complete ISO 9001 assessment.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold flex items-center justify-center text-sm">
                  1
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-strong)] mb-1">Create Assessment</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Navigate to Assessments → New Assessment. Select a template, set dates, and assign
                  team members.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold flex items-center justify-center text-sm">
                  2
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-strong)] mb-1">Conduct Audit</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Open the assessment and click "Start Audit". Navigate through sections, answer
                  questions, and provide justifications.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold flex items-center justify-center text-sm">
                  3
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-strong)] mb-1">Upload Evidence</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  For each response, upload supporting documents, images, or links to demonstrate
                  compliance.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold flex items-center justify-center text-sm">
                  4
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-strong)] mb-1">Review Results</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  View the assessment dashboard to see overall scores, section breakdown, and
                  compliance gaps.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold flex items-center justify-center text-sm">
                  5
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-strong)] mb-1">Create Non-Conformities</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  For low-scoring responses, create non-conformity reports documenting the issue and
                  root cause.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold flex items-center justify-center text-sm">
                  6
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-strong)] mb-1">Assign Corrective Actions</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Create corrective actions for each non-conformity, assign owners, set target dates,
                  and track completion.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold flex items-center justify-center text-sm">
                  7
                </div>
              </div>
              <div>
                <h4 className="font-medium text-[var(--text-strong)] mb-1">Generate Reports</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  Download PDF reports or export data to CSV for management review and record keeping.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: <HelpCircle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">
              How often should I conduct assessments?
            </h4>
            <p className="text-sm text-[var(--text-muted)]">
              ISO 9001 requires internal audits at planned intervals. Most organizations conduct full
              assessments annually and quick checks quarterly. Use different templates for different
              purposes.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">Can I edit responses after submission?</h4>
            <p className="text-sm text-[var(--text-muted)]">
              Yes, responses can be edited until the assessment is marked as completed. The system
              auto-saves your progress every 30 seconds.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">
              What's the difference between templates?
            </h4>
            <p className="text-sm text-[var(--text-muted)]">
              Templates determine which ISO 9001 sections are included in your assessment. Use focused
              templates (like "Leadership Focus") for targeted reviews, or "Full Assessment" for
              comprehensive audits.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">How do I upload evidence?</h4>
            <p className="text-sm text-[var(--text-muted)]">
              While answering questions during an audit, click the "Upload Evidence" button. You can
              upload documents (PDF, Word, Excel), images, or add web links as supporting evidence.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">What score do I need to pass?</h4>
            <p className="text-sm text-[var(--text-muted)]">
              ISO 9001 doesn't define a "pass" score. Aim for scores of 4 (Established) or 5
              (Optimizing). Scores of 1-2 indicate non-conformities that require corrective action.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">
              Who can see my assessment results?
            </h4>
            <p className="text-sm text-[var(--text-muted)]">
              Access is role-based. Quality Managers and System Admins can see all assessments.
              Internal Auditors see assessments they're assigned to. Department Heads see assessments
              relevant to their department.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">Can I customize templates?</h4>
            <p className="text-sm text-[var(--text-muted)]">
              Currently, you can choose from 6 predefined templates. Custom template creation is
              planned for a future release. System Admins can request custom templates by contacting
              your system administrator.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-[var(--text-strong)] mb-2">How long are records kept?</h4>
            <p className="text-sm text-[var(--text-muted)]">
              All assessment records, evidence, and corrective actions are retained indefinitely in
              the system. You can archive old assessments to remove them from active views while
              preserving the data.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)] flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-[var(--brand-strong)]" />
          Help & Documentation
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Learn how to use the ISO 9001 Self-Assessment application effectively
        </p>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setExpandedSection('getting-started')}
              className="flex items-center gap-3 p-3 rounded-xl border hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors text-left"
            >
              <Zap className="h-5 w-5 text-[var(--brand-strong)]" />
              <div>
                <div className="font-medium text-sm">Getting Started</div>
                <div className="text-xs text-[var(--text-muted)]">Quick start guide</div>
              </div>
            </button>

            <button
              onClick={() => setExpandedSection('templates')}
              className="flex items-center gap-3 p-3 rounded-xl border hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors text-left"
            >
              <FileText className="h-5 w-5 text-[var(--brand-strong)]" />
              <div>
                <div className="font-medium text-sm">Templates</div>
                <div className="text-xs text-[var(--text-muted)]">Learn about assessment templates</div>
              </div>
            </button>

            <button
              onClick={() => setExpandedSection('scoring')}
              className="flex items-center gap-3 p-3 rounded-xl border hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors text-left"
            >
              <Star className="h-5 w-5 text-[var(--brand-strong)]" />
              <div>
                <div className="font-medium text-sm">Scoring System</div>
                <div className="text-xs text-[var(--text-muted)]">Understand assessment scores</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <Card key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full text-left"
            >
              <CardHeader className="cursor-pointer hover:bg-[var(--surface-sunken)] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--brand-soft)] rounded-xl">{section.icon}</div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown className="h-5 w-5 text-[var(--text-subtle)]" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-[var(--text-subtle)]" />
                  )}
                </div>
              </CardHeader>
            </button>

            {expandedSection === section.id && (
              <CardContent className="pt-0">{section.content}</CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Support */}
      <Card className="bg-gradient-to-br from-[var(--surface-sunken)] to-[var(--surface-sunken)] border-[var(--border-subtle)]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-[var(--brand-strong)]" />
            <div>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>Contact your system administrator for support</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)]">
            For technical support, custom template requests, or questions about your organization's
            QMS processes, please contact your Quality Manager or System Administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
