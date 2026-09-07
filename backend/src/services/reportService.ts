import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { AssessmentStatus, NCRStatus, Severity, UserRole } from '../types/enums';

// PowerPoint support
let PptxGenJs: any;
try {
  PptxGenJs = require('pptxgenjs');
} catch {
  console.warn('PowerPoint support unavailable: pptxgenjs is not installed.');
}

// ---------------------------------------------------------------------------
// Report design system
// A single source of truth for the branded PDF template. Colours are neutral
// and brand-agnostic today (teal accent matching the app), but centralised so a
// future per-organization theme only needs to override THEME.
// ---------------------------------------------------------------------------
const THEME = {
  BRAND: '#0d9488',        // teal accent (matches app UI)
  BRAND_DARK: '#0f766e',   // deeper teal for gradients/bands
  INK: '#0f172a',          // near-black headings
  BODY: '#334155',         // body copy
  MUTED: '#64748b',        // secondary / captions
  LINE: '#e2e8f0',         // hairlines & table rules
  ZEBRA: '#f8fafc',        // alternating row tint
  SURFACE: '#f1f5f9',      // card / panel fill
  SUCCESS: '#16a34a',
  WARNING: '#d97706',
  DANGER: '#dc2626',
  WHITE: '#ffffff',
};

// Backwards-compatible alias so existing helpers keep working.
const COLORS = {
  PRIMARY: THEME.BRAND,
  SECONDARY: THEME.MUTED,
  SUCCESS: THEME.SUCCESS,
  WARNING: THEME.WARNING,
  DANGER: THEME.DANGER,
  LIGHT_GRAY: THEME.SURFACE,
  DARK_GRAY: THEME.BODY,
  WHITE: THEME.WHITE,
};

// A4 page geometry (points)
const PAGE = {
  WIDTH: 595.28,
  HEIGHT: 841.89,
  MARGIN: 50,
  get CONTENT_WIDTH() { return this.WIDTH - this.MARGIN * 2; },
  get RIGHT() { return this.WIDTH - this.MARGIN; },
  HEADER_H: 46,   // running header band height on inner pages
  BODY_TOP: 78,   // where body content starts on inner pages
  FOOTER_Y: 800,  // baseline for footer text
};

const REPORT_LABEL = 'ISO 9001:2015 Assessment Report';

interface SectionScore {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  score: number;
  actualScore: number;
  maxPossibleScore: number;
  questionsAnswered: number;
  totalQuestions: number;
}

interface ReportData {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    auditType: string;
    scope: string | null;
    objectives: string | null;
    overallScore: number | null;
    sectionScores: string | null;
    scheduledDate: Date | null;
    dueDate: Date | null;
    completedDate: Date | null;
    createdAt: Date;
    organization: {
      id: string;
      name: string;
    };
    leadAuditor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    teamMembers: Array<{
      role: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
  };
  findings: Array<{
    id: string;
    score: number | null;
    justification: string | null;
    question: {
      id: string;
      questionNumber: string;
      questionText: string;
      standardReference: string | null;
    };
    section: {
      id: string;
      sectionNumber: string;
      title: string;
    } | null;
  }>;
  nonConformities: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    rootCause: string | null;
    correctiveActions: Array<{
      id: string;
      description: string;
      status: string;
      priority: string;
      targetDate: Date | null;
      completedDate: Date | null;
    }>;
  }>;
  sectionBreakdown: SectionScore[];
}

export class ReportService {
  /**
   * Generate a PDF report for an assessment
   * Returns a buffer containing the PDF data
   */
  async generateAssessmentReport(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Buffer> {
    // Fetch all data needed for the report
    const reportData = await this.getReportData(assessmentId, organizationId, userId, userRole);

    // Generate the PDF
    return this.createPDF(reportData);
  }

  /**
   * Fetch all data needed for the report
   */
  private async getReportData(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ): Promise<ReportData> {
    // Fetch the assessment with all related data
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        leadAuditor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    // Check if user has permission to generate report
    const canGenerateReport = this.canAccessReport(assessment, userId, userRole);
    if (!canGenerateReport) {
      throw new AuthorizationError('You do not have permission to generate reports for this assessment');
    }

    // Reports can only be generated for COMPLETED or UNDER_REVIEW assessments
    if (assessment.status !== AssessmentStatus.COMPLETED && assessment.status !== AssessmentStatus.UNDER_REVIEW) {
      throw new ValidationError(
        `Reports can only be generated for completed or under review assessments. Current status: ${assessment.status}`
      );
    }

    // Findings = attention-needed responses on the 1-5 scale: scores 1-3 need tracking
    const findings = await prisma.questionResponse.findMany({
      where: {
        assessmentId,
        isDraft: false,
        score: {
          lte: 3,
        },
      },
      include: {
        question: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            standardReference: true,
          },
        },
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
      },
      orderBy: [
        { score: 'asc' },
        { sectionId: 'asc' },
      ],
    });

    // Fetch non-conformities with corrective actions
    const nonConformities = await prisma.nonConformity.findMany({
      where: {
        assessmentId,
      },
      include: {
        correctiveActions: {
          select: {
            id: true,
            description: true,
            status: true,
            priority: true,
            targetDate: true,
            completedDate: true,
          },
          orderBy: {
            priority: 'desc',
          },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { status: 'asc' },
      ],
    });

    // Parse section scores from the assessment
    let sectionBreakdown: SectionScore[] = [];
    if (assessment.sectionScores && typeof assessment.sectionScores === 'string') {
      try {
        sectionBreakdown = JSON.parse(assessment.sectionScores) as SectionScore[];
      } catch {
        sectionBreakdown = [];
      }
    }

    return {
      assessment: {
        ...assessment,
        objectives: typeof assessment.objectives === 'string' ? assessment.objectives : null,
        sectionScores: typeof assessment.sectionScores === 'string' ? assessment.sectionScores : null,
      },
      findings,
      nonConformities,
      sectionBreakdown,
    };
  }

  /**
   * Create the PDF document
   */
  private createPDF(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: PAGE.BODY_TOP, bottom: 60, left: PAGE.MARGIN, right: PAGE.MARGIN },
        bufferPages: true, // required to stamp page numbers after layout
        info: {
          Title: `Assessment Report - ${data.assessment.title}`,
          Author: 'AuditFlow',
          Subject: 'ISO 9001:2015 Assessment Report',
          Creator: 'AuditFlow',
        },
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cover page (page 0 — no running header)
      this.addCoverPage(doc, data);

      // Content sections — each opens a fresh page via addSectionHeader
      this.addExecutiveSummary(doc, data);
      this.addSectionBreakdown(doc, data);
      this.addFindingsList(doc, data);
      this.addNCRSummary(doc, data);
      this.addRecommendations(doc, data);

      // Stamp running header + footer with page numbers on every inner page
      this.paintChrome(doc, data);

      doc.end();
    });
  }

  /**
   * Draw the running header band and footer (with page numbers) on every page
   * except the cover. Must run after all content is laid out.
   */
  private paintChrome(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const range = doc.bufferedPageRange();
    const total = range.count;
    const pageCount = total - 1; // exclude cover from "Page X of N"

    for (let i = range.start + 1; i < range.start + total; i++) {
      doc.switchToPage(i);

      // Running header band
      doc.rect(0, 0, PAGE.WIDTH, PAGE.HEADER_H).fill(THEME.SURFACE);
      doc.rect(0, PAGE.HEADER_H, PAGE.WIDTH, 2).fill(THEME.BRAND);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(THEME.BRAND)
        .text('AuditFlow', PAGE.MARGIN, 17, { lineBreak: false });
      // Right-aligned title — x computed manually to avoid width/align
      // triggering pdfkit auto-pagination when writing inside a margin.
      const titleText = data.assessment.title;
      doc.font('Helvetica').fontSize(9).fillColor(THEME.MUTED);
      const titleW = Math.min(doc.widthOfString(titleText), PAGE.CONTENT_WIDTH - 80);
      doc.text(titleText, PAGE.RIGHT - titleW, 17, { lineBreak: false, ellipsis: true, width: titleW });

      // Footer hairline
      doc.moveTo(PAGE.MARGIN, PAGE.FOOTER_Y - 8).lineTo(PAGE.RIGHT, PAGE.FOOTER_Y - 8)
        .lineWidth(0.5).strokeColor(THEME.LINE).stroke();
      doc.fontSize(8).font('Helvetica').fillColor(THEME.MUTED)
        .text(REPORT_LABEL, PAGE.MARGIN, PAGE.FOOTER_Y, { lineBreak: false });
      const pageStr = `Page ${i - range.start} of ${pageCount}`;
      doc.text(pageStr, PAGE.RIGHT - doc.widthOfString(pageStr), PAGE.FOOTER_Y, { lineBreak: false });
    }
  }

  /**
   * Add cover page
   */
  private addCoverPage(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { assessment } = data;
    const cx = PAGE.WIDTH / 2;

    // Top brand band
    doc.rect(0, 0, PAGE.WIDTH, 150).fill(THEME.BRAND);
    doc.rect(0, 150, PAGE.WIDTH, 6).fill(THEME.BRAND_DARK);

    doc.fillColor(THEME.WHITE)
      .fontSize(13).font('Helvetica-Bold')
      .text('AUDITFLOW', PAGE.MARGIN, 42, { characterSpacing: 3, lineBreak: false });
    doc.fontSize(30).font('Helvetica-Bold')
      .text('ISO 9001:2015', PAGE.MARGIN, 70, { lineBreak: false });
    doc.fontSize(17).font('Helvetica')
      .text('Assessment Report', PAGE.MARGIN, 108, { lineBreak: false });

    // Title block
    doc.fillColor(THEME.INK).fontSize(22).font('Helvetica-Bold')
      .text(assessment.title, PAGE.MARGIN, 200, { width: PAGE.CONTENT_WIDTH, align: 'center' });
    doc.fillColor(THEME.MUTED).fontSize(13).font('Helvetica')
      .text(assessment.organization.name, PAGE.MARGIN, doc.y + 6,
        { width: PAGE.CONTENT_WIDTH, align: 'center' });

    // Score gauge (centred, given room)
    doc.y = 300;
    this.addScoreGauge(doc, assessment.overallScore, PAGE.WIDTH);

    // Metadata panel
    const panelY = 470;
    const panelH = 200;
    doc.roundedRect(PAGE.MARGIN, panelY, PAGE.CONTENT_WIDTH, panelH, 8)
      .fillAndStroke(THEME.SURFACE, THEME.LINE);
    doc.rect(PAGE.MARGIN, panelY, 4, panelH).fill(THEME.BRAND);

    const rows: Array<[string, string]> = [
      ['Status', assessment.status.replace(/_/g, ' ')],
      ['Audit Type', assessment.auditType.replace(/_/g, ' ')],
      ['Lead Auditor', `${assessment.leadAuditor.firstName} ${assessment.leadAuditor.lastName}`],
      ['Overall Compliance', assessment.overallScore !== null ? `${assessment.overallScore.toFixed(1)}%` : 'N/A'],
      ['Completed', assessment.completedDate ? this.fmtDate(assessment.completedDate) : '—'],
      ['Report Date', this.fmtDate(new Date())],
    ];
    const labelX = PAGE.MARGIN + 28;
    const valueX = PAGE.MARGIN + 190;
    let ry = panelY + 22;
    for (const [label, value] of rows) {
      doc.fontSize(11).font('Helvetica').fillColor(THEME.MUTED)
        .text(label, labelX, ry, { lineBreak: false });
      doc.font('Helvetica-Bold').fillColor(THEME.INK)
        .text(value, valueX, ry, { width: PAGE.RIGHT - valueX - 24, lineBreak: false });
      ry += 22;
      if (label !== rows[rows.length - 1][0]) {
        doc.moveTo(labelX, ry - 6).lineTo(PAGE.RIGHT - 24, ry - 6)
          .lineWidth(0.5).strokeColor(THEME.LINE).stroke();
      }
    }

    // Confidentiality note anchored to bottom
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(THEME.MUTED)
      .text('Confidential — prepared for internal quality management use.',
        PAGE.MARGIN, 760, { width: PAGE.CONTENT_WIDTH, align: 'center' });

    doc.addPage();
    void cx;
  }

  /** Consistent long-form date formatting. */
  private fmtDate(d: Date | string): string {
    return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Add visual score gauge on cover page
   */
  private addScoreGauge(doc: typeof PDFDocument.prototype, score: number | null, pageWidth: number): void {
    const centerX = pageWidth / 2;
    const gaugeY = doc.y + 20;
    const outerRadius = 60;
    const innerRadius = 45;
    const startAngle = Math.PI * 0.75; // Start at 135 degrees (bottom-left)
    const endAngle = Math.PI * 2.25; // End at 405 degrees (bottom-right)
    const totalAngle = endAngle - startAngle;

    // Draw background arc (gray)
    doc.save();
    this.drawArc(doc, centerX, gaugeY + outerRadius, outerRadius, innerRadius, startAngle, endAngle, COLORS.LIGHT_GRAY);

    // Draw score arc (colored based on score)
    if (score !== null && score > 0) {
      const scoreAngle = startAngle + (totalAngle * (score / 100));
      const scoreColor = this.getScoreColor(score);
      this.drawArc(doc, centerX, gaugeY + outerRadius, outerRadius, innerRadius, startAngle, scoreAngle, scoreColor);
    }

    // Draw center circle (white background for text)
    doc.circle(centerX, gaugeY + outerRadius, innerRadius - 5)
      .fill(COLORS.WHITE);

    // Draw score text in center
    const scoreText = score !== null ? `${Math.round(score)}%` : 'N/A';
    const scoreColor = this.getScoreColor(score);
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(scoreColor)
      .text(scoreText, centerX - 30, gaugeY + outerRadius - 12, { width: 60, align: 'center' });

    // Draw label below gauge
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor(COLORS.SECONDARY)
      .text('Overall Compliance', centerX - 50, gaugeY + outerRadius * 2 + 10, { width: 100, align: 'center' });

    // Draw scale markers
    this.drawGaugeMarkers(doc, centerX, gaugeY + outerRadius, outerRadius + 8);

    doc.restore();

    // Update doc.y to account for gauge height
    doc.y = gaugeY + outerRadius * 2 + 35;
  }

  /**
   * Draw an arc segment for the gauge
   */
  private drawArc(
    doc: typeof PDFDocument.prototype,
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number,
    color: string
  ): void {
    const segments = 50; // Number of segments for smooth arc
    const angleStep = (endAngle - startAngle) / segments;

    // Build path for arc segment
    doc.path(`M ${cx + Math.cos(startAngle) * innerRadius} ${cy + Math.sin(startAngle) * innerRadius}`);

    // Inner arc (going forward)
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (angleStep * i);
      const x = cx + Math.cos(angle) * innerRadius;
      const y = cy + Math.sin(angle) * innerRadius;
      doc.lineTo(x, y);
    }

    // Line to outer radius
    doc.lineTo(cx + Math.cos(endAngle) * outerRadius, cy + Math.sin(endAngle) * outerRadius);

    // Outer arc (going backward)
    for (let i = segments; i >= 0; i--) {
      const angle = startAngle + (angleStep * i);
      const x = cx + Math.cos(angle) * outerRadius;
      const y = cy + Math.sin(angle) * outerRadius;
      doc.lineTo(x, y);
    }

    doc.closePath();
    doc.fill(color);
  }

  /**
   * Draw gauge scale markers (0%, 50%, 100%)
   */
  private drawGaugeMarkers(doc: typeof PDFDocument.prototype, cx: number, cy: number, radius: number): void {
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const markers = [
      { value: 0, angle: startAngle },
      { value: 50, angle: startAngle + (endAngle - startAngle) * 0.5 },
      { value: 100, angle: endAngle },
    ];

    doc.fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.SECONDARY);

    for (const marker of markers) {
      const x = cx + Math.cos(marker.angle) * radius;
      const y = cy + Math.sin(marker.angle) * radius;
      const labelX = marker.value === 0 ? x - 15 : marker.value === 100 ? x - 5 : x - 8;
      const labelY = marker.value === 50 ? y - 12 : y - 4;
      doc.text(`${marker.value}`, labelX, labelY);
    }
  }

  /**
   * Add executive summary section
   */
  private addExecutiveSummary(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { assessment, findings, nonConformities } = data;

    this.addSectionHeader(doc, 'Executive Summary');

    // Description
    if (assessment.description) {
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.DARK_GRAY)
        .text(assessment.description)
        .moveDown();
    }

    // Scope
    if (assessment.scope) {
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .text('Scope:')
        .font('Helvetica')
        .fontSize(11)
        .text(assessment.scope)
        .moveDown();
    }

    // Objectives
    if (assessment.objectives) {
      let objectives: string[] = [];
      try {
        objectives = JSON.parse(assessment.objectives) as string[];
      } catch {
        objectives = [assessment.objectives];
      }

      if (objectives.length > 0) {
        doc.font('Helvetica-Bold')
          .fontSize(12)
          .text('Objectives:')
          .font('Helvetica')
          .fontSize(11);

        for (const objective of objectives) {
          doc.text(`• ${objective}`, { indent: 15 });
        }
        doc.moveDown();
      }
    }

    // Key Statistics — visual card grid
    doc.font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(THEME.INK)
      .text('Key Statistics')
      .moveDown(0.6);

    const score1Count = findings.filter(f => f.score === 1).length;
    const score2Count = findings.filter(f => f.score === 2).length;
    const openNCRs = nonConformities.filter(n => n.status !== NCRStatus.CLOSED).length;
    const closedNCRs = nonConformities.filter(n => n.status === NCRStatus.CLOSED).length;
    const criticalNCRs = nonConformities.filter(n => n.severity === Severity.CRITICAL).length;
    const majorNCRs = nonConformities.filter(n => n.severity === Severity.MAJOR).length;

    const cards: Array<{ label: string; value: string; accent: string }> = [
      { label: 'Overall Compliance', value: assessment.overallScore !== null ? `${assessment.overallScore.toFixed(1)}%` : 'N/A', accent: this.getScoreColor(assessment.overallScore) },
      { label: 'Non-Compliant (1)', value: String(score1Count), accent: score1Count > 0 ? THEME.DANGER : THEME.SUCCESS },
      { label: 'Initial / Partial (2)', value: String(score2Count), accent: score2Count > 0 ? THEME.WARNING : THEME.SUCCESS },
      { label: 'Total NCRs', value: String(nonConformities.length), accent: THEME.MUTED },
      { label: 'Open NCRs', value: String(openNCRs), accent: openNCRs > 0 ? THEME.WARNING : THEME.SUCCESS },
      { label: 'Closed NCRs', value: String(closedNCRs), accent: THEME.SUCCESS },
      { label: 'Critical NCRs', value: String(criticalNCRs), accent: criticalNCRs > 0 ? THEME.DANGER : THEME.SUCCESS },
      { label: 'Major NCRs', value: String(majorNCRs), accent: majorNCRs > 0 ? THEME.WARNING : THEME.SUCCESS },
    ];

    const cols = 4;
    const gap = 10;
    const cardW = (PAGE.CONTENT_WIDTH - gap * (cols - 1)) / cols;
    const cardH = 58;
    const gridTop = doc.y;
    cards.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = PAGE.MARGIN + col * (cardW + gap);
      const y = gridTop + row * (cardH + gap);
      doc.roundedRect(x, y, cardW, cardH, 6).fillAndStroke(THEME.WHITE, THEME.LINE);
      doc.rect(x, y, 3, cardH).fill(card.accent);
      doc.fontSize(19).font('Helvetica-Bold').fillColor(card.accent)
        .text(card.value, x + 10, y + 10, { width: cardW - 16, lineBreak: false });
      doc.fontSize(8).font('Helvetica').fillColor(THEME.MUTED)
        .text(card.label.toUpperCase(), x + 10, y + 36, { width: cardW - 16, lineBreak: false });
    });
    doc.y = gridTop + Math.ceil(cards.length / cols) * (cardH + gap);
    doc.moveDown(0.5);

    // Team Members
    if (assessment.teamMembers.length > 0) {
      doc.moveDown()
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Audit Team:')
        .font('Helvetica')
        .fontSize(11);

      for (const member of assessment.teamMembers) {
        doc.text(`• ${member.user.firstName} ${member.user.lastName} (${member.role.replace('_', ' ')})`);
      }
    }

    doc.addPage();
  }

  /**
   * Add section breakdown
   */
  private addSectionBreakdown(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { sectionBreakdown } = data;

    this.addSectionHeader(doc, 'Section Breakdown');

    if (sectionBreakdown.length === 0) {
      doc.fontSize(11)
        .font('Helvetica-Oblique')
        .fillColor(THEME.MUTED)
        .text('No section scores available.')
        .moveDown();
      return;
    }

    // Column layout (x positions + widths) — all within 50..545
    const cSec = PAGE.MARGIN + 8;      // 58
    const cTitle = PAGE.MARGIN + 55;   // 105
    const titleW = 250;                // ends 355
    const cScore = PAGE.MARGIN + 318;  // 368, right-aligned w50 -> 418
    const cQ = PAGE.MARGIN + 372;      // 422, right-aligned w45 -> 467
    const cStatus = PAGE.MARGIN + 425; // 475, w65 -> 540
    const statusW = 65;
    const rowX = PAGE.MARGIN;
    const rowW = PAGE.CONTENT_WIDTH;

    const drawHead = () => {
      const hy = doc.y;
      doc.rect(rowX, hy, rowW, 22).fill(THEME.BRAND);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(THEME.WHITE);
      doc.text('SECTION', cSec, hy + 7, { lineBreak: false });
      doc.text('TITLE', cTitle, hy + 7, { lineBreak: false });
      doc.text('SCORE', cScore, hy + 7, { width: 50, align: 'right', lineBreak: false });
      doc.text('QUEST.', cQ, hy + 7, { width: 45, align: 'right', lineBreak: false });
      doc.text('STATUS', cStatus, hy + 7, { width: statusW, align: 'center', lineBreak: false });
      doc.y = hy + 22;
    };

    drawHead();

    let zebra = false;
    for (const section of sectionBreakdown) {
      // Wrapped title height determines row height
      doc.fontSize(9).font('Helvetica');
      const titleH = doc.heightOfString(section.sectionTitle, { width: titleW });
      const rowH = Math.max(22, titleH + 12);

      // Page break — repeat the header
      if (doc.y + rowH > PAGE.FOOTER_Y - 20) {
        doc.addPage();
        drawHead();
        zebra = false;
      }

      const ry = doc.y;
      if (zebra) doc.rect(rowX, ry, rowW, rowH).fill(THEME.ZEBRA);
      zebra = !zebra;

      const status = section.score >= 80 ? 'Good' : section.score >= 60 ? 'Fair' : 'Poor';
      const color = this.getScoreColor(section.score);
      const textY = ry + 6;

      doc.fontSize(9).font('Helvetica-Bold').fillColor(THEME.INK)
        .text(section.sectionNumber, cSec, textY, { width: 45, lineBreak: false });
      doc.font('Helvetica').fillColor(THEME.BODY)
        .text(section.sectionTitle, cTitle, textY, { width: titleW });
      doc.font('Helvetica-Bold').fillColor(color)
        .text(`${section.score.toFixed(1)}%`, cScore, textY, { width: 50, align: 'right', lineBreak: false });
      doc.font('Helvetica').fillColor(THEME.BODY)
        .text(`${section.questionsAnswered}/${section.totalQuestions}`, cQ, textY, { width: 45, align: 'right', lineBreak: false });
      this.drawPill(doc, status, color, cStatus, textY - 2, statusW);

      doc.moveTo(rowX, ry + rowH).lineTo(PAGE.RIGHT, ry + rowH)
        .lineWidth(0.5).strokeColor(THEME.LINE).stroke();
      doc.y = ry + rowH;
    }

    doc.addPage();
  }

  /** Small rounded status pill with tinted background. */
  private drawPill(doc: typeof PDFDocument.prototype, label: string, color: string, x: number, y: number, w: number): void {
    const pillW = 52;
    const px = x + (w - pillW) / 2;
    doc.save();
    doc.roundedRect(px, y, pillW, 15, 7).fillOpacity(0.14).fill(color).fillOpacity(1);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(color)
      .text(label.toUpperCase(), px, y + 4, { width: pillW, align: 'center', lineBreak: false });
    doc.restore();
  }

  /**
   * Add findings list
   */
  private addFindingsList(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { findings } = data;

    this.addSectionHeader(doc, 'Findings');

    if (findings.length === 0) {
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.SUCCESS)
        .text('No findings with scores below 3 (fully compliant).')
        .moveDown();
      doc.addPage();
      return;
    }

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.DARK_GRAY)
      .text(`Total findings requiring attention: ${findings.length}`)
      .moveDown();

    // Group findings by score
    const score1Findings = findings.filter(f => f.score === 1);
    const score2Findings = findings.filter(f => f.score === 2);

    // Non-compliant findings (Score 1)
    if (score1Findings.length > 0) {
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(COLORS.DANGER)
        .text(`Non-Compliant (Score 1) - ${score1Findings.length} findings`)
        .moveDown(0.5);

      this.addFindingsTable(doc, score1Findings);
    }

    // Partial findings (Score 2)
    if (score2Findings.length > 0) {
      if (score1Findings.length > 0) {
        doc.moveDown();
      }

      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(COLORS.WARNING)
        .text(`Initial / Partial (Score 2) - ${score2Findings.length} findings`)
        .moveDown(0.5);

      this.addFindingsTable(doc, score2Findings);
    }

    doc.addPage();
  }

  /**
   * Add findings table
   */
  private addFindingsTable(doc: typeof PDFDocument.prototype, findings: ReportData['findings']): void {
    for (const finding of findings) {
      // Check if we need a new page
      if (doc.y > 680) {
        doc.addPage();
      }

      const sectionInfo = finding.section
        ? `${finding.section.sectionNumber} - ${finding.section.title}`
        : 'Unknown Section';

      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(COLORS.PRIMARY)
        .text(`${finding.question.questionNumber}: ${sectionInfo}`)
        .font('Helvetica')
        .fontSize(10)
        .fillColor(COLORS.DARK_GRAY)
        .text(finding.question.questionText, { indent: 15 });

      if (finding.justification) {
        doc.font('Helvetica-Oblique')
          .fillColor(COLORS.SECONDARY)
          .text(`Justification: ${finding.justification}`, { indent: 15 });
      }

      if (finding.question.standardReference) {
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor(COLORS.SECONDARY)
          .text(`Standard Reference: ${finding.question.standardReference}`, { indent: 15 });
      }

      doc.moveDown(0.5);
    }
  }

  /**
   * Add NCR summary
   */
  private addNCRSummary(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { nonConformities } = data;

    this.addSectionHeader(doc, 'Non-Conformity Report Summary');

    if (nonConformities.length === 0) {
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.SUCCESS)
        .text('No non-conformities recorded for this assessment.')
        .moveDown();
      doc.addPage();
      return;
    }

    // Summary counts
    const statusCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = {};

    for (const ncr of nonConformities) {
      statusCounts[ncr.status] = (statusCounts[ncr.status] || 0) + 1;
      severityCounts[ncr.severity] = (severityCounts[ncr.severity] || 0) + 1;
    }

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.DARK_GRAY)
      .text(`Total NCRs: ${nonConformities.length}`)
      .moveDown(0.5);

    doc.font('Helvetica-Bold')
      .text('By Status:');
    for (const [status, count] of Object.entries(statusCounts)) {
      doc.font('Helvetica')
        .text(`  • ${status.replace('_', ' ')}: ${count}`);
    }

    doc.moveDown(0.5)
      .font('Helvetica-Bold')
      .text('By Severity:');
    for (const [severity, count] of Object.entries(severityCounts)) {
      const color = severity === Severity.CRITICAL ? COLORS.DANGER
        : severity === Severity.MAJOR ? COLORS.WARNING
        : COLORS.SECONDARY;
      doc.font('Helvetica')
        .fillColor(color)
        .text(`  • ${severity}: ${count}`);
    }

    doc.fillColor(COLORS.DARK_GRAY)
      .moveDown();

    // List each NCR
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .text('NCR Details:')
      .moveDown(0.5);

    for (const ncr of nonConformities) {
      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }

      const severityColor = ncr.severity === Severity.CRITICAL ? COLORS.DANGER
        : ncr.severity === Severity.MAJOR ? COLORS.WARNING
        : COLORS.SECONDARY;

      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(COLORS.PRIMARY)
        .text(ncr.title)
        .font('Helvetica')
        .fontSize(9)
        .fillColor(severityColor)
        .text(`Severity: ${ncr.severity} | Status: ${ncr.status.replace('_', ' ')}`, { indent: 10 })
        .fillColor(COLORS.DARK_GRAY)
        .text(ncr.description, { indent: 10 });

      if (ncr.rootCause) {
        doc.font('Helvetica-Oblique')
          .text(`Root Cause: ${ncr.rootCause}`, { indent: 10 });
      }

      // Corrective actions
      if (ncr.correctiveActions.length > 0) {
        doc.font('Helvetica-Bold')
          .fontSize(9)
          .text(`Corrective Actions (${ncr.correctiveActions.length}):`, { indent: 10 });

        for (const action of ncr.correctiveActions) {
          const actionStatus = action.status.replace('_', ' ');
          doc.font('Helvetica')
            .fontSize(9)
            .text(`  - ${action.description.substring(0, 60)}... [${actionStatus}]`, { indent: 15 });
        }
      }

      doc.moveDown(0.5);
    }

    doc.addPage();
  }

  /**
   * Add recommendations section
   */
  private addRecommendations(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { assessment, findings, nonConformities } = data;

    this.addSectionHeader(doc, 'Recommendations');

    const recommendations: string[] = [];

    // Generate recommendations based on findings
    const criticalFindings = findings.filter(f => f.score === 1);
    if (criticalFindings.length > 0) {
      recommendations.push(
        `Address ${criticalFindings.length} non-compliant finding(s) with highest priority. ` +
        'These represent areas where the QMS does not meet ISO 9001:2015 requirements.'
      );
    }

    const openNCRs = nonConformities.filter(n => n.status !== NCRStatus.CLOSED);
    if (openNCRs.length > 0) {
      recommendations.push(
        `Complete corrective actions for ${openNCRs.length} open NCR(s). ` +
        'Ensure root cause analysis is documented and actions are verified for effectiveness.'
      );
    }

    const criticalNCRs = nonConformities.filter(n => n.severity === Severity.CRITICAL);
    if (criticalNCRs.length > 0) {
      recommendations.push(
        `Prioritize resolution of ${criticalNCRs.length} critical NCR(s). ` +
        'These may pose significant risks to product quality or customer satisfaction.'
      );
    }

    if (assessment.overallScore !== null && assessment.overallScore < 70) {
      recommendations.push(
        'Consider conducting a follow-up assessment after implementing corrective actions ' +
        'to verify improvement in overall compliance score.'
      );
    }

    // Low-scoring sections
    const lowScoringSections = data.sectionBreakdown.filter(s => s.score < 60);
    if (lowScoringSections.length > 0) {
      const sectionNumbers = lowScoringSections.map(s => s.sectionNumber).join(', ');
      recommendations.push(
        `Focus improvement efforts on sections ${sectionNumbers} which scored below 60%.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Continue to maintain current quality management practices.',
        'Schedule periodic surveillance audits to ensure ongoing compliance.',
        'Consider opportunities for continual improvement as defined in Clause 10.'
      );
    }

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.DARK_GRAY);

    for (let i = 0; i < recommendations.length; i++) {
      doc.text(`${i + 1}. ${recommendations[i]}`)
        .moveDown(0.5);
    }

    // Footer
    doc.moveDown(2)
      .fontSize(10)
      .font('Helvetica-Oblique')
      .fillColor(COLORS.SECONDARY)
      .text('This report was generated automatically by the ISO 9001 Audit Management System.', { align: 'center' })
      .text(`Generated on: ${new Date().toISOString()}`, { align: 'center' });
  }

  /**
   * Add section header helper
   */
  private addSectionHeader(doc: typeof PDFDocument.prototype, title: string): void {
    // Accent tab + title
    doc.rect(PAGE.MARGIN, doc.y + 2, 4, 20).fill(THEME.BRAND);
    doc.fontSize(17)
      .font('Helvetica-Bold')
      .fillColor(THEME.INK)
      .text(title, PAGE.MARGIN + 14, doc.y, { lineBreak: false });

    doc.moveDown(0.6);
    doc.moveTo(PAGE.MARGIN, doc.y)
      .lineTo(PAGE.RIGHT, doc.y)
      .lineWidth(1)
      .strokeColor(THEME.LINE)
      .stroke();

    doc.moveDown();
    doc.fillColor(THEME.BODY).font('Helvetica').fontSize(11);
  }

  /**
   * Get color based on score percentage
   */
  private getScoreColor(score: number | null): string {
    if (score === null) return COLORS.SECONDARY;
    if (score >= 80) return COLORS.SUCCESS;
    if (score >= 60) return COLORS.WARNING;
    return COLORS.DANGER;
  }

  /**
   * Generate a PowerPoint report for an assessment
   * Returns a buffer containing the PPTX data
   */
  async generateAssessmentPowerPoint(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Buffer> {
    if (!PptxGenJs) {
      throw new Error('PowerPoint generation is not available. Please install pptxgenjs: npm install pptxgenjs');
    }

    // Fetch all data needed for the report
    const reportData = await this.getReportData(assessmentId, organizationId, userId, userRole);

    // Generate the PowerPoint
    return this.createPowerPoint(reportData);
  }

  /**
   * Create the PowerPoint presentation
   */
  private async createPowerPoint(data: ReportData): Promise<Buffer> {
    const pptx = new PptxGenJs();

    // Set presentation properties
    pptx.author = 'ISO 9001 Audit Management System';
    pptx.company = data.assessment.organization.name;
    pptx.subject = 'Assessment Report';
    pptx.title = `Assessment Report - ${data.assessment.title}`;

    // Define colors
    const colors = {
      primary: '1E40AF',
      secondary: '475569',
      success: '16A34A',
      warning: 'CA8A04',
      danger: 'DC2626',
      lightGray: 'F1F5F9',
      darkGray: '334155',
      white: 'FFFFFF',
      text: '1E293B',
    };

    // 1. Cover Slide
    const coverSlide = pptx.addSlide();
    coverSlide.background = { color: colors.primary };

    coverSlide.addText('ISO 9001:2015', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 0.8,
      fontSize: 44,
      bold: true,
      color: colors.white,
      align: 'center',
    });

    coverSlide.addText('Assessment Report', {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      color: colors.white,
      align: 'center',
    });

    coverSlide.addText(data.assessment.title, {
      x: 1,
      y: 3.5,
      w: 8,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: colors.white,
      align: 'center',
    });

    coverSlide.addText(data.assessment.organization.name, {
      x: 1,
      y: 4.2,
      w: 8,
      h: 0.4,
      fontSize: 18,
      color: colors.white,
      align: 'center',
    });

    const formattedDate = data.assessment.completedDate
      ? new Date(data.assessment.completedDate).toLocaleDateString()
      : new Date().toLocaleDateString();

    coverSlide.addText(`Report Date: ${formattedDate}`, {
      x: 1,
      y: 5,
      w: 8,
      h: 0.3,
      fontSize: 14,
      color: colors.white,
      align: 'center',
    });

    // 2. Executive Summary Slide
    const summarySlide = pptx.addSlide();
    summarySlide.addText('Executive Summary', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: colors.primary,
    });

    const overallScore = data.assessment.overallScore || 0;
    const scorePercentage = Math.round(overallScore * 10) / 10;
    const scoreColor = overallScore >= 80 ? colors.success : overallScore >= 60 ? colors.warning : colors.danger;

    summarySlide.addText(`Overall Compliance Score: ${scorePercentage}%`, {
      x: 1,
      y: 1.2,
      w: 8,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: scoreColor,
      align: 'center',
    });

    summarySlide.addText(`Status: ${data.assessment.status.replace('_', ' ')}`, {
      x: 1,
      y: 2,
      w: 8,
      h: 0.4,
      fontSize: 16,
      align: 'center',
    });

    // Summary stats
    const statsY = 2.8;
    const findings = data.findings;
    const score1Count = findings.filter(f => f.score === 1).length;
    const score2Count = findings.filter(f => f.score === 2).length;

    summarySlide.addText([
      { text: 'Assessment Details:\n\n', options: { fontSize: 16, bold: true } },
      { text: `• Audit Type: ${data.assessment.auditType}\n`, options: { fontSize: 14 } },
      { text: `• Total Findings: ${findings.length}\n`, options: { fontSize: 14 } },
      { text: `• Non-Compliant (Score 1): ${score1Count}\n`, options: { fontSize: 14, color: colors.danger } },
      { text: `• Initial / Partial (Score 2): ${score2Count}\n`, options: { fontSize: 14, color: colors.warning } },
      { text: `• Non-Conformities: ${data.nonConformities.length}\n`, options: { fontSize: 14 } },
      { text: `• Lead Auditor: ${data.assessment.leadAuditor.firstName} ${data.assessment.leadAuditor.lastName}`, options: { fontSize: 14 } },
    ], {
      x: 1.5,
      y: statsY,
      w: 7,
      h: 2.5,
    });

    // 3. Section Breakdown Slide
    if (data.sectionBreakdown && data.sectionBreakdown.length > 0) {
      const breakdownSlide = pptx.addSlide();
      breakdownSlide.addText('Section Compliance Breakdown', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 28,
        bold: true,
        color: colors.primary,
      });

      // Create chart data
      const chartData = data.sectionBreakdown.slice(0, 10).map(section => ({
        name: section.sectionNumber,
        labels: [section.sectionNumber],
        values: [Math.round(section.score)],
      }));

      breakdownSlide.addChart(pptx.ChartType.bar, chartData, {
        x: 1,
        y: 1.2,
        w: 8,
        h: 4,
        chartColors: [colors.primary],
        showValue: true,
        valAxisMaxVal: 100,
        catAxisLabelFontSize: 10,
        valAxisLabelFontSize: 10,
        showTitle: false,
      });
    }

    // 4. Non-Conformities Slide
    if (data.nonConformities.length > 0) {
      const ncrSlide = pptx.addSlide();
      ncrSlide.addText('Non-Conformities Summary', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 28,
        bold: true,
        color: colors.primary,
      });

      const ncrRows = [
        [
          { text: 'Severity', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Title', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Status', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Actions', options: { bold: true, color: colors.white, fill: colors.primary } },
        ],
      ];

      data.nonConformities.slice(0, 8).forEach(ncr => {
        const severityColor = ncr.severity === 'CRITICAL' ? colors.danger : ncr.severity === 'MAJOR' ? colors.warning : colors.secondary;
        ncrRows.push([
          { text: ncr.severity, options: { color: severityColor, bold: true, fill: colors.white } },
          { text: ncr.title.substring(0, 40) + (ncr.title.length > 40 ? '...' : ''), options: { color: colors.text, bold: false, fill: colors.white } },
          { text: ncr.status.replace('_', ' '), options: { color: colors.text, bold: false, fill: colors.white } },
          { text: ncr.correctiveActions.length.toString(), options: { color: colors.text, bold: false, fill: colors.white } },
        ]);
      });

      ncrSlide.addTable(ncrRows, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 4,
        fontSize: 11,
        colW: [1.5, 4.5, 1.8, 1.2],
      });
    }

    // 5. Findings Details Slide
    if (findings.length > 0) {
      const findingsSlide = pptx.addSlide();
      findingsSlide.addText('Key Findings', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 28,
        bold: true,
        color: colors.primary,
      });

      const findingsRows = [
        [
          { text: 'Score', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Section', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Question', options: { bold: true, color: colors.white, fill: colors.primary } },
        ],
      ];

      findings.slice(0, 10).forEach(finding => {
        const scoreColor = finding.score === 1 ? colors.danger : colors.warning;
        const sectionInfo = finding.section
          ? `${finding.section.sectionNumber}`
          : 'N/A';

        findingsRows.push([
          { text: finding.score?.toString() || 'N/A', options: { color: scoreColor, bold: true, fill: colors.white } },
          { text: sectionInfo, options: { color: colors.text, bold: false, fill: colors.white } },
          { text: finding.question.questionText.substring(0, 60) + (finding.question.questionText.length > 60 ? '...' : ''), options: { color: colors.text, bold: false, fill: colors.white } },
        ]);
      });

      findingsSlide.addTable(findingsRows, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 4,
        fontSize: 10,
        colW: [0.8, 1.5, 6.7],
      });
    }

    // 6. Recommendations Slide
    const recommendationsSlide = pptx.addSlide();
    recommendationsSlide.addText('Recommendations', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: colors.primary,
    });

    const recommendations = [];
    if (score1Count > 0) {
      recommendations.push(`• Address ${score1Count} non-compliant finding(s) immediately`);
    }
    if (score2Count > 0) {
      recommendations.push(`• Improve ${score2Count} partially compliant area(s)`);
    }
    if (data.nonConformities.length > 0) {
      const openNCRs = data.nonConformities.filter(ncr => ncr.status === 'OPEN' || ncr.status === 'IN_PROGRESS');
      if (openNCRs.length > 0) {
        recommendations.push(`• Complete ${openNCRs.length} open non-conformity correction(s)`);
      }
    }
    recommendations.push('• Schedule follow-up assessment in 6 months');
    recommendations.push('• Provide training to address identified gaps');
    recommendations.push('• Document all corrective actions and improvements');

    recommendationsSlide.addText(recommendations.join('\n\n'), {
      x: 1,
      y: 1.2,
      w: 8,
      h: 4,
      fontSize: 16,
      bullet: false,
    });

    // Generate buffer
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    return buffer as Buffer;
  }

  /**
   * Check if user can access reports for an assessment
   */
  private canAccessReport(
    assessment: {
      leadAuditorId: string;
      teamMembers: Array<{ user: { id: string } }>;
    },
    userId: string,
    userRole: UserRole
  ): boolean {
    // System admins and quality managers can always access reports
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.QUALITY_MANAGER) {
      return true;
    }

    // Lead auditor can access reports
    if (assessment.leadAuditorId === userId) {
      return true;
    }

    // Team members can access reports
    const isTeamMember = assessment.teamMembers.some(tm => tm.user.id === userId);
    if (isTeamMember) {
      return true;
    }

    // Department heads and viewers can access reports (read-only)
    if (userRole === UserRole.DEPARTMENT_HEAD || userRole === UserRole.VIEWER) {
      return true;
    }

    return false;
  }

  /**
   * Get report filename
   */
  getReportFilename(assessmentTitle: string, format: 'pdf' | 'pptx' = 'pdf'): string {
    const sanitizedTitle = assessmentTitle
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 50);
    const timestamp = new Date().toISOString().split('T')[0];
    return `assessment-report-${sanitizedTitle}-${timestamp}.${format}`;
  }
}

export const reportService = new ReportService();
