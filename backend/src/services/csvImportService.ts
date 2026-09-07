import { parse } from 'csv-parse';
import { prisma } from '../config/database';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import fs from 'fs';

interface CSVRow {
  standardReference: string;
  standardText: string;
  auditQuestion: string;
  score1Criteria: string;
  score2Criteria: string;
  score3Criteria: string;
  guidance?: string;
}

interface ImportResult {
  success: boolean;
  sectionsCreated: number;
  sectionsUpdated: number;
  questionsCreated: number;
  questionsUpdated: number;
  errors: ImportError[];
  warnings: string[];
}

interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export class CSVImportService {
  /**
   * Import ISO 9001 standards and questions from CSV file
   */
  async importFromFile(filePath: string): Promise<ImportResult> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return this.importFromContent(content);
  }

  /**
   * Import ISO 9001 standards and questions from CSV content
   */
  async importFromContent(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      sectionsCreated: 0,
      sectionsUpdated: 0,
      questionsCreated: 0,
      questionsUpdated: 0,
      errors: [],
      warnings: [],
    };

    const rows = await this.parseCSV(csvContent);

    if (rows.length === 0) {
      result.errors.push({
        row: 0,
        field: 'file',
        message: 'CSV file is empty or has no valid data rows',
      });
      return result;
    }

    // Validate all rows first
    const validatedRows = this.validateRows(rows, result);

    if (result.errors.length > 0) {
      return result;
    }

    // Group rows by section
    const sectionMap = this.groupBySection(validatedRows);

    // Import sections and questions
    try {
      await prisma.$transaction(async (tx: any) => {
        for (const [sectionNumber, sectionData] of sectionMap) {
          // Create or update section
          const existingSection = await tx.iSOStandardSection.findUnique({
            where: { sectionNumber },
          });

          let sectionId: string;

          if (existingSection) {
            await tx.iSOStandardSection.update({
              where: { sectionNumber },
              data: {
                title: sectionData.title,
                description: sectionData.description,
                order: this.calculateSectionOrder(sectionNumber),
                parentId: await this.getParentSectionId(tx, sectionNumber),
              },
            });
            sectionId = existingSection.id;
            result.sectionsUpdated++;
          } else {
            const section = await tx.iSOStandardSection.create({
              data: {
                sectionNumber,
                title: sectionData.title,
                description: sectionData.description,
                order: this.calculateSectionOrder(sectionNumber),
                parentId: await this.getParentSectionId(tx, sectionNumber),
              },
            });
            sectionId = section.id;
            result.sectionsCreated++;
          }

          // Create or update questions
          for (const question of sectionData.questions) {
            const existingQuestion = await tx.auditQuestion.findUnique({
              where: { questionNumber: question.questionNumber },
            });

            if (existingQuestion) {
              await tx.auditQuestion.update({
                where: { questionNumber: question.questionNumber },
                data: {
                  questionText: question.questionText,
                  guidance: question.guidance,
                  score1Criteria: question.score1Criteria,
                  score2Criteria: question.score2Criteria,
                  score3Criteria: question.score3Criteria,
                  standardReference: question.standardReference,
                  order: question.order,
                  sectionId,
                },
              });
              result.questionsUpdated++;
            } else {
              await tx.auditQuestion.create({
                data: {
                  questionNumber: question.questionNumber,
                  questionText: question.questionText,
                  guidance: question.guidance,
                  score1Criteria: question.score1Criteria,
                  score2Criteria: question.score2Criteria,
                  score3Criteria: question.score3Criteria,
                  standardReference: question.standardReference,
                  order: question.order,
                  sectionId,
                },
              });
              result.questionsCreated++;
            }
          }
        }
      });

      result.success = true;
    } catch (error) {
      logger.error('CSV import failed:', error);
      result.errors.push({
        row: 0,
        field: 'database',
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    return result;
  }

  /**
   * Parse CSV content into rows
   */
  private async parseCSV(content: string): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
      const rows: CSVRow[] = [];

      parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      })
        .on('data', (row: CSVRow) => {
          rows.push(row);
        })
        .on('error', (error) => {
          reject(new ValidationError(`CSV parsing error: ${error.message}`));
        })
        .on('end', () => {
          resolve(rows);
        });
    });
  }

  /**
   * Validate all CSV rows
   */
  private validateRows(rows: CSVRow[], result: ImportResult): CSVRow[] {
    const validRows: CSVRow[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 for header row and 1-based index

      // Validate required fields
      if (!row.standardReference?.trim()) {
        result.errors.push({
          row: rowNumber,
          field: 'standardReference',
          message: 'Standard reference is required',
        });
        return;
      }

      if (!row.standardText?.trim()) {
        result.errors.push({
          row: rowNumber,
          field: 'standardText',
          message: 'Standard text is required',
        });
        return;
      }

      if (!row.auditQuestion?.trim()) {
        result.errors.push({
          row: rowNumber,
          field: 'auditQuestion',
          message: 'Audit question is required',
        });
        return;
      }

      if (!row.score1Criteria?.trim()) {
        result.errors.push({
          row: rowNumber,
          field: 'score1Criteria',
          message: 'Score 1 criteria is required',
        });
        return;
      }

      if (!row.score2Criteria?.trim()) {
        result.errors.push({
          row: rowNumber,
          field: 'score2Criteria',
          message: 'Score 2 criteria is required',
        });
        return;
      }

      if (!row.score3Criteria?.trim()) {
        result.errors.push({
          row: rowNumber,
          field: 'score3Criteria',
          message: 'Score 3 criteria is required',
        });
        return;
      }

      // Validate standard reference format (e.g., 4.1, 4.2.1, 9.2)
      if (!/^\d+(\.\d+)*$/.test(row.standardReference.trim())) {
        result.errors.push({
          row: rowNumber,
          field: 'standardReference',
          message: 'Invalid standard reference format (expected: X.X.X)',
          value: row.standardReference,
        });
        return;
      }

      validRows.push(row);
    });

    return validRows;
  }

  /**
   * Group rows by section
   */
  private groupBySection(rows: CSVRow[]): Map<string, {
    title: string;
    description: string;
    questions: {
      questionNumber: string;
      questionText: string;
      guidance?: string;
      score1Criteria: string;
      score2Criteria: string;
      score3Criteria: string;
      standardReference: string;
      order: number;
    }[];
  }> {
    const sectionMap = new Map();
    const questionCountBySection = new Map<string, number>();

    for (const row of rows) {
      const sectionNumber = this.extractSectionNumber(row.standardReference);

      if (!sectionMap.has(sectionNumber)) {
        sectionMap.set(sectionNumber, {
          title: this.extractSectionTitle(row.standardText),
          description: row.standardText,
          questions: [],
        });
        questionCountBySection.set(sectionNumber, 0);
      }

      const currentCount = questionCountBySection.get(sectionNumber)! + 1;
      questionCountBySection.set(sectionNumber, currentCount);

      sectionMap.get(sectionNumber).questions.push({
        questionNumber: `${row.standardReference}.${currentCount}`,
        questionText: row.auditQuestion,
        guidance: row.guidance || undefined,
        score1Criteria: row.score1Criteria,
        score2Criteria: row.score2Criteria,
        score3Criteria: row.score3Criteria,
        standardReference: row.standardReference,
        order: currentCount,
      });
    }

    return sectionMap;
  }

  /**
   * Extract main section number (e.g., "4.1" from "4.1.2")
   */
  private extractSectionNumber(reference: string): string {
    const parts = reference.split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1]}`;
    }
    return parts[0];
  }

  /**
   * Extract section title from standard text
   */
  private extractSectionTitle(text: string): string {
    // Try to extract title from patterns like "4.1 Understanding the organization..."
    const match = text.match(/^\d+\.\d+\s+(.+?)(?:\.|$)/);
    if (match) {
      return match[1].trim();
    }
    // Return first 100 characters if no pattern match
    return text.substring(0, 100).trim();
  }

  /**
   * Calculate section order based on section number
   */
  private calculateSectionOrder(sectionNumber: string): number {
    const parts = sectionNumber.split('.').map(Number);
    // Create a sortable number: 4.1 -> 410, 4.2 -> 420, 10.1 -> 1010
    return parts.reduce((acc, part, index) => {
      return acc + part * Math.pow(100, 2 - index);
    }, 0);
  }

  /**
   * Get parent section ID
   */
  private async getParentSectionId(tx: any, sectionNumber: string): Promise<string | null> {
    const parts = sectionNumber.split('.');
    if (parts.length <= 1) {
      return null;
    }

    const parentNumber = parts.slice(0, -1).join('.');
    const parent = await tx.iSOStandardSection.findUnique({
      where: { sectionNumber: parentNumber },
    });

    return parent?.id || null;
  }
}

export const csvImportService = new CSVImportService();
