'use client';

import React, { useState } from 'react';
import {
  FileCheck,
  Users,
  Target,
  Settings,
  BookOpen,
  Shield,
  FolderTree,
  ClipboardList,
} from 'lucide-react';
import {
  CrownedCard,
  ProcessStageCard,
  ProgressConnector,
  QuestionCard,
  SectionFlowNavigation,
  NavigationButtons,
  SaveStatusBadge,
  type SectionStage,
} from '@/components/cyclic-harmony';

/**
 * Design Showcase - Demonstrates all Cyclic Harmony components
 * Navigate to /design-showcase to view
 */
export default function DesignShowcasePage() {
  const [selectedScore, setSelectedScore] = useState<0 | 1 | 2 | 3 | 4 | 5 | null>(2);
  const [justification, setJustification] = useState(
    'The organization has partially implemented external and internal issue determination processes. PESTLE analysis is conducted annually, but stakeholder engagement could be more systematic.'
  );
  const [activeSectionId, setActiveSectionId] = useState('2');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');

  const sampleSections: SectionStage[] = [
    {
      id: '1',
      title: 'Context of Organization',
      icon: FolderTree,
      sectionNumber: '4',
      description: 'Understanding the organization and its context',
      progress: 100,
      totalQuestions: 12,
      answeredQuestions: 12,
    },
    {
      id: '2',
      title: 'Leadership',
      icon: Users,
      sectionNumber: '5',
      description: 'Leadership and commitment to QMS',
      progress: 65,
      totalQuestions: 15,
      answeredQuestions: 10,
    },
    {
      id: '3',
      title: 'Planning',
      icon: Target,
      sectionNumber: '6',
      description: 'Actions to address risks and opportunities',
      progress: 30,
      totalQuestions: 18,
      answeredQuestions: 5,
    },
    {
      id: '4',
      title: 'Support',
      icon: Settings,
      sectionNumber: '7',
      description: 'Resources, competence, and awareness',
      progress: 0,
      totalQuestions: 20,
      answeredQuestions: 0,
    },
    {
      id: '5',
      title: 'Operation',
      icon: BookOpen,
      sectionNumber: '8',
      description: 'Operational planning and control',
      progress: 0,
      totalQuestions: 25,
      answeredQuestions: 0,
    },
    {
      id: '6',
      title: 'Performance Evaluation',
      icon: FileCheck,
      sectionNumber: '9',
      description: 'Monitoring, measurement, analysis',
      progress: 0,
      totalQuestions: 16,
      answeredQuestions: 0,
    },
    {
      id: '7',
      title: 'Improvement',
      icon: Shield,
      sectionNumber: '10',
      description: 'Nonconformity and corrective action',
      progress: 0,
      totalQuestions: 10,
      answeredQuestions: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-harmony-warm-white">
      {/* Header */}
      <div className="bg-[var(--surface-card)] border-b border-harmony-light-beige">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <h1 className="font-display font-bold text-4xl text-harmony-dark-text mb-2">
            Cyclic Harmony Design System
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-generous">
            A showcase of all components in the Cyclic Harmony design system
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-12 space-y-16">
        {/* Color Palette */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="h-32 bg-harmony-sage rounded-crown mb-3 shadow-crown" />
              <p className="font-medium text-harmony-dark-text">Sage</p>
              <p className="text-sm text-[var(--text-muted)]">#8BAA7E</p>
            </div>
            <div>
              <div className="h-32 bg-harmony-olive rounded-crown mb-3 shadow-crown" />
              <p className="font-medium text-harmony-dark-text">Olive</p>
              <p className="text-sm text-[var(--text-muted)]">#5C7C52</p>
            </div>
            <div>
              <div className="h-32 bg-harmony-forest rounded-crown mb-3 shadow-crown" />
              <p className="font-medium text-harmony-dark-text">Forest</p>
              <p className="text-sm text-[var(--text-muted)]">#3D5A3A</p>
            </div>
            <div>
              <div className="h-32 bg-harmony-lime rounded-crown mb-3 shadow-crown" />
              <p className="font-medium text-harmony-dark-text">Lime</p>
              <p className="text-sm text-[var(--text-muted)]">#A8C499</p>
            </div>
          </div>
        </section>

        {/* CrownedCard Variations */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Crowned Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CrownedCard crownColor="sage">
              <h3 className="font-display font-bold text-lg text-harmony-dark-text mb-2">
                Sage Crown
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Used for pending or initial states
              </p>
            </CrownedCard>

            <CrownedCard crownColor="lime">
              <h3 className="font-display font-bold text-lg text-harmony-dark-text mb-2">
                Lime Crown
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Used for in-progress states
              </p>
            </CrownedCard>

            <CrownedCard crownColor="olive">
              <h3 className="font-display font-bold text-lg text-harmony-dark-text mb-2">
                Olive Crown
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Used for active states
              </p>
            </CrownedCard>

            <CrownedCard crownColor="forest">
              <h3 className="font-display font-bold text-lg text-harmony-dark-text mb-2">
                Forest Crown
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Used for completed states
              </p>
            </CrownedCard>
          </div>

          <div className="mt-6">
            <CrownedCard crownColor="gradient" className="max-w-2xl">
              <h3 className="font-display font-bold text-xl text-harmony-dark-text mb-2">
                Gradient Crown
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Special gradient crown showing progression from lime through sage to olive.
                Used for highlighted or actively selected items.
              </p>
            </CrownedCard>
          </div>
        </section>

        {/* Interactive States */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Interactive States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CrownedCard crownColor="sage" interactive>
              <h3 className="font-display font-bold text-lg text-harmony-dark-text mb-2">
                Interactive
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Hover to see lift effect and shadow deepening
              </p>
            </CrownedCard>

            <CrownedCard crownColor="olive" active>
              <h3 className="font-display font-bold text-lg text-harmony-dark-text mb-2">
                Active State
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Ring highlight with subtle scale
              </p>
            </CrownedCard>

            <CrownedCard crownColor="sage" disabled>
              <h3 className="font-display font-bold text-lg text-harmony-dark-text mb-2">
                Disabled
              </h3>
              <p className="text-[var(--text-muted)] leading-generous">
                Reduced opacity and grayscale filter
              </p>
            </CrownedCard>
          </div>
        </section>

        {/* Process Stage Cards */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Process Stage Cards
          </h2>
          <div className="flex items-center gap-0 overflow-x-auto pb-4">
            <ProcessStageCard
              icon={FolderTree}
              title="Context"
              description="Understanding organizational context"
              stageNumber="01"
              status="completed"
              progress={100}
            />
            <ProgressConnector completed />
            <ProcessStageCard
              icon={Users}
              title="Leadership"
              description="Leadership and commitment"
              stageNumber="02"
              status="active"
              progress={65}
            />
            <ProgressConnector active />
            <ProcessStageCard
              icon={Target}
              title="Planning"
              description="Risk and opportunity planning"
              stageNumber="03"
              status="pending"
              progress={30}
            />
            <ProgressConnector />
            <ProcessStageCard
              icon={Settings}
              title="Support"
              description="Resources and competence"
              stageNumber="04"
              status="pending"
              progress={0}
            />
          </div>
        </section>

        {/* Section Flow Navigation */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Section Flow Navigation
          </h2>
          <SectionFlowNavigation
            sections={sampleSections}
            activeSectionId={activeSectionId}
            onSectionChange={setActiveSectionId}
          />
        </section>

        {/* Question Card */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Question Card
          </h2>
          <QuestionCard
            questionNumber="4.1.1"
            questionText="Does the organization determine external and internal issues that are relevant to its purpose and strategic direction?"
            guidance="Consider using PESTLE analysis (Political, Economic, Social, Technological, Legal, Environmental factors) to identify external issues. Internal issues may include organizational culture, values, knowledge, and performance."
            score={selectedScore}
            justification={justification}
            onScoreChange={setSelectedScore}
            onJustificationChange={setJustification}
          />
        </section>

        {/* Navigation Buttons */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Navigation Buttons
          </h2>
          <CrownedCard crownColor="lime" crownHeight={20}>
            <NavigationButtons
              onPrevious={() => alert('Previous clicked')}
              onNext={() => alert('Next clicked')}
              hasPrevious={true}
              hasNext={true}
              previousLabel="4.1 Understanding the Organization"
              nextLabel="4.3 Determining Scope of QMS"
            />
          </CrownedCard>
        </section>

        {/* Save Status Badge */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Save Status Badge
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <SaveStatusBadge status="idle" pendingCount={3} />
              <SaveStatusBadge status="saving" />
              <SaveStatusBadge status="saved" lastSaved={new Date(Date.now() - 120000)} />
              <SaveStatusBadge status="error" error="Network connection lost" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSaveStatus('idle')}
                className="px-4 py-2 rounded-xl bg-[var(--surface-sunken)] hover:bg-[var(--stone-200)] text-sm font-medium"
              >
                Idle
              </button>
              <button
                onClick={() => setSaveStatus('saving')}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-200 text-sm font-medium"
              >
                Saving
              </button>
              <button
                onClick={() => setSaveStatus('saved')}
                className="px-4 py-2 rounded-xl bg-green-50 hover:bg-green-200 text-sm font-medium"
              >
                Saved
              </button>
              <button
                onClick={() => setSaveStatus('error')}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-200 text-sm font-medium"
              >
                Error
              </button>
            </div>
          </div>
        </section>

        {/* Typography Scale */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Typography
          </h2>
          <CrownedCard crownColor="sage">
            <div className="space-y-4">
              <div>
                <h1 className="font-display font-bold text-4xl text-harmony-dark-text">
                  Display Heading (4xl)
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">font-display font-bold text-4xl</p>
              </div>
              <div>
                <h2 className="font-display font-bold text-3xl text-harmony-dark-text">
                  Section Heading (3xl)
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">font-display font-bold text-3xl</p>
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-harmony-dark-text">
                  Card Heading (2xl)
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">font-display font-bold text-2xl</p>
              </div>
              <div>
                <h4 className="font-display font-bold text-xl text-harmony-dark-text">
                  Component Heading (xl)
                </h4>
                <p className="text-sm text-[var(--text-muted)] mt-1">font-display font-bold text-xl</p>
              </div>
              <div>
                <p className="text-base text-[var(--text-body)] leading-generous">
                  Body text with generous line height (1.6). This is the standard text size used
                  throughout the application for readability and breathing space.
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">text-base leading-generous</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Small text for labels and secondary information
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">text-sm</p>
              </div>
            </div>
          </CrownedCard>
        </section>

        {/* Shadows & Elevation */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Shadows & Elevation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--surface-card)] rounded-crown p-8 shadow-[var(--shadow-sm)]">
              <h4 className="font-display font-bold text-harmony-dark-text mb-2">
                Small (sm)
              </h4>
              <p className="text-[var(--text-muted)] text-sm">Subtle depth for secondary elements</p>
            </div>
            <div className="bg-[var(--surface-card)] rounded-crown p-8 shadow-crown">
              <h4 className="font-display font-bold text-harmony-dark-text mb-2">
                Medium (crown)
              </h4>
              <p className="text-[var(--text-muted)] text-sm">Default shadow for cards</p>
            </div>
            <div className="bg-[var(--surface-card)] rounded-crown p-8 shadow-crown-hover">
              <h4 className="font-display font-bold text-harmony-dark-text mb-2">
                Large (crown-hover)
              </h4>
              <p className="text-[var(--text-muted)] text-sm">Elevated state on hover</p>
            </div>
          </div>
        </section>

        {/* Design Principles */}
        <section>
          <h2 className="font-display font-bold text-3xl text-harmony-dark-text mb-6">
            Design Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CrownedCard crownColor="forest">
              <h3 className="font-display font-bold text-xl text-harmony-dark-text mb-4">
                Visual Progression
              </h3>
              <p className="text-[var(--text-muted)] leading-generous mb-3">
                Green gradients show advancement through the process:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-harmony-sage" />
                  <span className="text-sm">Sage → Starting point, pending</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-harmony-lime" />
                  <span className="text-sm">Lime → In progress, partial</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-harmony-olive" />
                  <span className="text-sm">Olive → Active, current</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-harmony-forest" />
                  <span className="text-sm">Forest → Complete, success</span>
                </div>
              </div>
            </CrownedCard>

            <CrownedCard crownColor="olive">
              <h3 className="font-display font-bold text-xl text-harmony-dark-text mb-4">
                Breathing Space
              </h3>
              <p className="text-[var(--text-muted)] leading-generous mb-3">
                Every element has room to exist:
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>• Minimum 32px padding in cards</li>
                <li>• Line height of 1.6 (generous)</li>
                <li>• Ample gap between elements (24px+)</li>
                <li>• Never cramped, always calm</li>
              </ul>
            </CrownedCard>
          </div>
        </section>
      </div>
    </div>
  );
}
