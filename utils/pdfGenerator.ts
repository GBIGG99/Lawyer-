import { jsPDF } from 'jspdf';
import { type SearchResult, type SearchParams, type DocumentAnalysisResult, type MultiDocumentAnalysisResult } from '../types';

/**
 * Strips raw markdown syntax while preserving readability for clean legal print typography
 */
export function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') // Remove markdown headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold **text**
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic *text*
    .replace(/__([^_]+)__/g, '$1') // Remove __text__
    .replace(/_([^_]+)_/g, '$1') // Remove _text_
    .replace(/`([^`]+)`/g, '$1') // Remove inline code `text`
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert [text](url) to text
    .replace(/^[-*+]\s+/gm, '• ') // Standardize bullet points
    .replace(/^\s*>\s+/gm, '') // Remove blockquotes
    .replace(/```[a-z]*\n[\s\S]*?\n```/g, '') // Remove code blocks
    .trim();
}

/**
 * Normalizes multi-line text into clean lines that fit legal print standards
 */
function wrapAndFormatText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const resultLines: string[] = [];
  
  paragraphs.forEach(paragraph => {
    if (paragraph.trim() === '') {
      resultLines.push('');
    } else {
      const wrapped = doc.splitTextToSize(paragraph, maxWidth) as string[];
      resultLines.push(...wrapped);
    }
  });
  
  return resultLines;
}

/**
 * Helper class that manages auto-pagination, margins, headers, cards, and professional legal formatting
 */
class PDFReportBuilder {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  leftMargin: number;
  rightMargin: number;
  topMargin: number;
  bottomMargin: number;
  contentWidth: number;
  y: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth(); // 215.9mm
    this.pageHeight = this.doc.internal.pageSize.getHeight(); // 279.4mm
    this.leftMargin = 18;
    this.rightMargin = 18;
    this.topMargin = 22;
    this.bottomMargin = 22;
    this.contentWidth = this.pageWidth - this.leftMargin - this.rightMargin;
    this.y = this.topMargin;
  }

  checkPageBreak(neededHeight: number): boolean {
    if (this.y + neededHeight > this.pageHeight - this.bottomMargin) {
      this.doc.addPage();
      this.y = this.topMargin + 6; // Leave space for running header
      return true;
    }
    return false;
  }

  addHeaderBand(title: string, subtitle: string, documentBadge: string, accentColor: [number, number, number] = [16, 185, 129]) {
    // Dark top band
    this.doc.setFillColor(15, 23, 42); // Slate 900
    this.doc.rect(0, 0, this.pageWidth, 42, 'F');

    // Colored accent top stripe
    this.doc.setFillColor(...accentColor);
    this.doc.rect(0, 0, this.pageWidth, 3, 'F');

    // Header text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('Helvetica', 'bold');
    this.doc.setFontSize(13);
    this.doc.text('NEURAL SENSE LEGAL INTELLIGENCE', this.leftMargin, 14);

    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(148, 163, 184); // Slate 400
    this.doc.text('COLORADO COURT SYSTEM PREPARATION & STRATEGIC LITIGATION DOSSIER', this.leftMargin, 19);

    // Title of Document
    this.doc.setFont('Helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(title.toUpperCase(), this.leftMargin, 28);

    // Subtitle & Timestamp
    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(203, 213, 225); // Slate 300
    const dateStr = `DATE: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} // CLASSIFICATION: CONFIDENTIAL WORK PRODUCT`;
    this.doc.text(dateStr, this.leftMargin, 34);

    // Document Badge (top right)
    this.doc.setFillColor(30, 41, 59); // Slate 800
    this.doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    this.doc.setLineWidth(0.3);
    const badgeText = documentBadge.toUpperCase();
    const badgeWidth = this.doc.getTextWidth(badgeText) + 8;
    this.doc.roundedRect(this.pageWidth - this.rightMargin - badgeWidth, 12, badgeWidth, 7, 1.5, 1.5, 'FD');
    this.doc.setTextColor(...accentColor);
    this.doc.setFont('Helvetica', 'bold');
    this.doc.setFontSize(7.5);
    this.doc.text(badgeText, this.pageWidth - this.rightMargin - badgeWidth + 4, 16.5);

    this.y = 50;
  }

  addMetaGrid(items: { label: string; value: string }[]) {
    this.checkPageBreak(18);
    const colCount = Math.min(items.length, 3);
    const colWidth = (this.contentWidth - (colCount - 1) * 3) / colCount;
    const boxHeight = 13;

    items.forEach((item, idx) => {
      const col = idx % colCount;
      const row = Math.floor(idx / colCount);
      const x = this.leftMargin + col * (colWidth + 3);
      const curY = this.y + row * (boxHeight + 2);

      // Check break if new row starts
      if (col === 0 && row > 0) {
        this.checkPageBreak(boxHeight + 2);
      }

      this.doc.setFillColor(248, 250, 252); // Slate 50
      this.doc.setDrawColor(226, 232, 240); // Slate 200
      this.doc.setLineWidth(0.2);
      this.doc.roundedRect(x, curY, colWidth, boxHeight, 1, 1, 'FD');

      this.doc.setFont('Helvetica', 'bold');
      this.doc.setFontSize(7);
      this.doc.setTextColor(100, 116, 139); // Slate 500
      this.doc.text(item.label.toUpperCase(), x + 3, curY + 4.5);

      this.doc.setFont('Helvetica', 'bold');
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(15, 23, 42); // Slate 900
      const safeVal = item.value || 'N/A';
      const truncated = this.doc.splitTextToSize(safeVal, colWidth - 6)[0] || safeVal;
      this.doc.text(truncated, x + 3, curY + 9.5);
    });

    const totalRows = Math.ceil(items.length / colCount);
    this.y += totalRows * (boxHeight + 2) + 4;
  }

  addSectionHeading(title: string, accentColor: [number, number, number] = [16, 185, 129]) {
    this.checkPageBreak(14);
    this.y += 2;
    // Left marker bar
    this.doc.setFillColor(...accentColor);
    this.doc.rect(this.leftMargin, this.y, 2.5, 6, 'F');

    // Title
    this.doc.setFont('Helvetica', 'bold');
    this.doc.setFontSize(10.5);
    this.doc.setTextColor(15, 23, 42); // Slate 900
    this.doc.text(title.toUpperCase(), this.leftMargin + 5, this.y + 4.8);

    // Thin underline
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.leftMargin + 5, this.y + 7.5, this.pageWidth - this.rightMargin, this.y + 7.5);

    this.y += 11;
  }

  addCalloutBox(title: string, text: string, colorType: 'emerald' | 'amber' | 'red' | 'slate' = 'emerald') {
    const colorMap = {
      emerald: {
        border: [16, 185, 129] as [number, number, number],
        bg: [240, 253, 244] as [number, number, number],
        title: [4, 120, 87] as [number, number, number]
      },
      amber: {
        border: [245, 158, 11] as [number, number, number],
        bg: [254, 252, 232] as [number, number, number],
        title: [180, 83, 9] as [number, number, number]
      },
      red: {
        border: [239, 68, 68] as [number, number, number],
        bg: [254, 242, 242] as [number, number, number],
        title: [185, 28, 28] as [number, number, number]
      },
      slate: {
        border: [100, 116, 139] as [number, number, number],
        bg: [248, 250, 252] as [number, number, number],
        title: [30, 41, 59] as [number, number, number]
      }
    };

    const scheme = colorMap[colorType];
    const cleanText = stripMarkdown(text);
    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(9);
    const lines = this.doc.splitTextToSize(cleanText, this.contentWidth - 10) as string[];
    const boxHeight = lines.length * 4.8 + 12;

    this.checkPageBreak(boxHeight);

    // Background
    this.doc.setFillColor(...scheme.bg);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.2);
    this.doc.roundedRect(this.leftMargin, this.y, this.contentWidth, boxHeight, 1.5, 1.5, 'FD');

    // Left colored accent border
    this.doc.setFillColor(...scheme.border);
    this.doc.rect(this.leftMargin, this.y, 2, boxHeight, 'F');

    // Title
    this.doc.setFont('Helvetica', 'bold');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(...scheme.title);
    this.doc.text(title.toUpperCase(), this.leftMargin + 5, this.y + 5.5);

    // Text lines
    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(51, 65, 85); // Slate 700
    let textY = this.y + 10;
    lines.forEach(line => {
      this.doc.text(line, this.leftMargin + 5, textY);
      textY += 4.8;
    });

    this.y += boxHeight + 4;
  }

  addParagraph(text: string, options?: { fontSize?: number; isBold?: boolean; color?: [number, number, number]; indent?: number; lineSpacing?: number }) {
    const fontSize = options?.fontSize || 9;
    const isBold = options?.isBold || false;
    const color = options?.color || [51, 65, 85];
    const indent = options?.indent || 0;
    const lineSpacing = options?.lineSpacing || 4.8;

    this.doc.setFont('Helvetica', isBold ? 'bold' : 'normal');
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...color);

    const cleanText = stripMarkdown(text);
    const lines = this.doc.splitTextToSize(cleanText, this.contentWidth - indent) as string[];

    lines.forEach(line => {
      this.checkPageBreak(lineSpacing + 1);
      this.doc.text(line, this.leftMargin + indent, this.y);
      this.y += lineSpacing;
    });

    this.y += 1.5;
  }

  addBullet(text: string, prefix: string = '•', bulletColor: [number, number, number] = [16, 185, 129]) {
    const cleanText = stripMarkdown(text);
    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(9);
    const lines = this.doc.splitTextToSize(cleanText, this.contentWidth - 8) as string[];

    this.checkPageBreak(lines.length * 4.8 + 2);

    // Draw bullet symbol / tag
    this.doc.setFont('Helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...bulletColor);
    this.doc.text(prefix, this.leftMargin, this.y);

    // Draw lines
    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(51, 65, 85);

    lines.forEach((line, idx) => {
      if (idx > 0) this.checkPageBreak(4.8);
      this.doc.text(line, this.leftMargin + 6, this.y);
      this.y += 4.8;
    });

    this.y += 1;
  }

  addTacticalCard(badge: string, text: string, colorType: 'red' | 'emerald' | 'amber' | 'blue' = 'emerald') {
    const colorMap = {
      emerald: {
        badgeBg: [16, 185, 129] as [number, number, number],
        badgeText: [255, 255, 255] as [number, number, number],
        cardBg: [248, 250, 252] as [number, number, number],
      },
      red: {
        badgeBg: [239, 68, 68] as [number, number, number],
        badgeText: [255, 255, 255] as [number, number, number],
        cardBg: [254, 242, 242] as [number, number, number],
      },
      amber: {
        badgeBg: [245, 158, 11] as [number, number, number],
        badgeText: [255, 255, 255] as [number, number, number],
        cardBg: [255, 251, 235] as [number, number, number],
      },
      blue: {
        badgeBg: [59, 130, 246] as [number, number, number],
        badgeText: [255, 255, 255] as [number, number, number],
        cardBg: [239, 246, 255] as [number, number, number],
      }
    };

    const scheme = colorMap[colorType];
    const cleanText = stripMarkdown(text);
    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(8.5);
    const lines = this.doc.splitTextToSize(cleanText, this.contentWidth - 8) as string[];
    const cardHeight = lines.length * 4.6 + 9;

    this.checkPageBreak(cardHeight);

    // Card background
    this.doc.setFillColor(...scheme.cardBg);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.2);
    this.doc.roundedRect(this.leftMargin, this.y, this.contentWidth, cardHeight, 1.2, 1.2, 'FD');

    // Badge
    this.doc.setFillColor(...scheme.badgeBg);
    const badgeWidth = this.doc.getTextWidth(badge) + 6;
    this.doc.roundedRect(this.leftMargin + 3, this.y + 2.5, badgeWidth, 5, 1, 1, 'F');
    this.doc.setTextColor(...scheme.badgeText);
    this.doc.setFont('Helvetica', 'bold');
    this.doc.setFontSize(7);
    this.doc.text(badge, this.leftMargin + 6, this.y + 6);

    // Content lines
    this.doc.setFont('Helvetica', 'normal');
    this.doc.setFontSize(8.5);
    this.doc.setTextColor(51, 65, 85);
    let lineY = this.y + 6;
    lines.forEach((l, idx) => {
      if (idx === 0) {
        this.doc.text(l, this.leftMargin + badgeWidth + 6, lineY);
      } else {
        lineY += 4.6;
        this.doc.text(l, this.leftMargin + 4, lineY);
      }
    });

    this.y += cardHeight + 2.5;
  }

  renderMarkdownSection(markdownText: string) {
    if (!markdownText) return;
    const lines = markdownText.split('\n');

    lines.forEach(rawLine => {
      const trimmed = rawLine.trim();
      if (!trimmed) {
        this.y += 2;
        return;
      }

      if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        const title = trimmed.replace(/^#+\s*/, '');
        this.checkPageBreak(8);
        this.doc.setFont('Helvetica', 'bold');
        this.doc.setFontSize(9.5);
        this.doc.setTextColor(30, 41, 59);
        this.doc.text(title, this.leftMargin, this.y);
        this.y += 5.5;
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const bulletText = trimmed.replace(/^[-*•]\s*/, '');
        this.addBullet(bulletText);
      } else {
        this.addParagraph(trimmed);
      }
    });
  }

  finalizeAndSave(filename: string, runningTitle: string = 'NEURAL SENSE LEGAL STRATEGY REPORT') {
    const totalPages = this.doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);

      // Running header on pages > 1
      if (i > 1) {
        this.doc.setFont('Helvetica', 'normal');
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(148, 163, 184); // Slate 400
        const headerTitle = runningTitle.length > 55 ? `${runningTitle.substring(0, 52)}...` : runningTitle;
        this.doc.text(headerTitle.toUpperCase(), this.leftMargin, 11);
        
        const docketTag = 'LEGAL INTELLIGENCE DOSSIER // PRIVILEGED';
        this.doc.text(docketTag, this.pageWidth - this.rightMargin - this.doc.getTextWidth(docketTag), 11);

        this.doc.setDrawColor(226, 232, 240);
        this.doc.setLineWidth(0.2);
        this.doc.line(this.leftMargin, 13, this.pageWidth - this.rightMargin, 13);
      }

      // Running footer on all pages
      this.doc.setDrawColor(226, 232, 240);
      this.doc.setLineWidth(0.2);
      this.doc.line(this.leftMargin, this.pageHeight - 13, this.pageWidth - this.rightMargin, this.pageHeight - 13);

      this.doc.setFont('Helvetica', 'normal');
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(148, 163, 184); // Slate 400
      this.doc.text('CONFIDENTIAL WORK PRODUCT // PREPARED FOR CASE LITIGATION COUNSEL', this.leftMargin, this.pageHeight - 8.5);

      const pageStr = `Page ${i} of ${totalPages}`;
      this.doc.text(pageStr, this.pageWidth - this.rightMargin - this.doc.getTextWidth(pageStr), this.pageHeight - 8.5);
    }

    const docName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    this.doc.save(docName);
  }
}

/**
 * Options for generating comprehensive strategic analysis reports
 */
export interface GenerateStrategicAnalysisPDFOptions {
  output: SearchResult;
  searchParams?: SearchParams | null;
  strategicAudit?: string | null;
  execSummary?: string | null;
  filename?: string;
}

/**
 * Generates and downloads a formal, comprehensive PDF report of the current workspace analysis and strategic summary findings
 */
export function generateStrategicAnalysisPDF({
  output,
  searchParams,
  strategicAudit,
  execSummary,
  filename
}: GenerateStrategicAnalysisPDFOptions): void {
  const builder = new PDFReportBuilder();

  const queryTitle = searchParams?.query || 'Legal Strategic Analysis';
  const cleanFilename = filename || `strategic_analysis_${(searchParams?.query || 'report').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${Date.now()}.pdf`;

  // 1. Header Band
  builder.addHeaderBand(
    'Strategic Analysis & Adversarial Case Dossier',
    queryTitle,
    output.caseStatus || (searchParams?.deepThinking ? 'Deep Protocol' : 'Verified Intel'),
    [16, 185, 129] // Emerald accent
  );

  // 2. Operational Parameters Grid
  const metaItems = [
    { label: 'Target Inquiry', value: queryTitle },
    { label: 'Jurisdiction', value: searchParams?.jurisdiction ? searchParams.jurisdiction.replace(/_/g, ' ').toUpperCase() : 'COLORADO STATEWIDE' },
    { label: 'Case Status / Type', value: `${output.caseStatus || searchParams?.caseStatus || 'ACTIVE'} // ${output.caseType || searchParams?.caseType || 'GENERAL'}` },
    { label: 'Analysis Protocol', value: searchParams?.deepThinking ? 'DEEP REASONING + COGNITIVE EXPANSION' : searchParams?.conceptSearch ? 'VECTOR PRINCIPLE EMBEDDINGS' : 'NEURAL STATUTORY SEARCH' },
    { label: 'Factual Favorability', value: output.winningProbability || 'FAVORABLE POSTURE (HIGH)' },
    { label: 'Audited Timestamp', value: new Date().toLocaleDateString() }
  ];
  builder.addMetaGrid(metaItems);

  // 3. Case Overview & Posture
  if (output.caseSummary || output.caseStatus || output.caseType) {
    builder.addSectionHeading('1. Case Overview & Procedural Posture', [16, 185, 129]);
    if (output.caseSummary) {
      builder.addCalloutBox('Procedural Synopsis', output.caseSummary, 'slate');
    }
  }

  // 4. Executive Summary / Executive Synthesis
  const effectiveExecSummary = execSummary || output.executiveSummary;
  if (effectiveExecSummary) {
    builder.addSectionHeading('2. Executive Synthesis & Core Strategic Directives', [16, 185, 129]);
    builder.addCalloutBox('Executive Summary for Lead Counsel', effectiveExecSummary, 'emerald');
  }

  // 5. Strategic Briefing / Core Substantive Findings
  builder.addSectionHeading(effectiveExecSummary ? '3. Strategic Briefing & Substantive Findings' : '2. Strategic Briefing & Substantive Findings', [16, 185, 129]);
  builder.renderMarkdownSection(output.summary);

  // 6. Adversarial Tactics & Defense Battlefield Matrix
  if (output.adversarialStrategy) {
    builder.addSectionHeading('Adversarial Strategy & Neutralization Matrix', [239, 68, 68]);

    // Prosecutor / Opposing Strikes
    if (output.adversarialStrategy.prosecutorMoves && output.adversarialStrategy.prosecutorMoves.length > 0) {
      builder.addParagraph('Anticipated Opposing Strikes & Prosecution Vectors:', { isBold: true, color: [185, 28, 28], fontSize: 8.5 });
      output.adversarialStrategy.prosecutorMoves.forEach((move, i) => {
        builder.addTacticalCard(`STRIKE 0${i + 1}`, move, 'red');
      });
      builder.y += 2;
    }

    // Defense Counters
    if (output.adversarialStrategy.defenseCounters && output.adversarialStrategy.defenseCounters.length > 0) {
      builder.addParagraph('Defense Counter-Measures & Procedural Shield:', { isBold: true, color: [4, 120, 87], fontSize: 8.5 });
      output.adversarialStrategy.defenseCounters.forEach((counter, i) => {
        builder.addTacticalCard(`COUNTER 0${i + 1}`, counter, 'emerald');
      });
      builder.y += 2;
    }

    // Hidden Risks & Vulnerabilities
    if (output.adversarialStrategy.hiddenRisks && output.adversarialStrategy.hiddenRisks.length > 0) {
      builder.addParagraph('Latent Systemic Risks & Jurisdictional Exposure:', { isBold: true, color: [180, 83, 9], fontSize: 8.5 });
      output.adversarialStrategy.hiddenRisks.forEach((risk, i) => {
        builder.addTacticalCard(`RISK 0${i + 1}`, risk, 'amber');
      });
      builder.y += 2;
    }
  }

  // 7. Strategic Argumentation Audit (if audited)
  if (strategicAudit) {
    builder.addSectionHeading('Strategic Argumentation Audit & Tactical Deconstruction', [245, 158, 11]);
    builder.addCalloutBox('Deep Reasoning Audit Findings', strategicAudit, 'amber');
  }

  // 8. Strategic Telemetry & Readiness Index
  if (output.telemetry) {
    builder.addSectionHeading('Strategic Telemetry & Readiness Index', [59, 130, 246]);
    const telemetryItems = [
      { label: 'Readiness Score', value: `${output.telemetry.readinessScore || 85} / 100` },
      { label: 'Complexity Index', value: `${output.telemetry.complexityIndex || 6} / 10` },
      { label: 'Evidence Factor', value: `${output.telemetry.strategicFactors?.evidence || 7} / 10` },
      { label: 'Procedural Rigor', value: `${output.telemetry.strategicFactors?.procedural || 8} / 10` },
      { label: 'Opponent Vulnerability', value: `${output.telemetry.strategicFactors?.opponentVulnerability || 6} / 10` },
      { label: 'Threat Nodes Identified', value: `${(output.telemetry.threatMatrix || []).length} Active Hazards` }
    ];
    builder.addMetaGrid(telemetryItems);

    if (output.telemetry.threatMatrix && output.telemetry.threatMatrix.length > 0) {
      output.telemetry.threatMatrix.forEach(node => {
        builder.addBullet(`${node.label} — [Impact: ${node.impact}/10 | Probability: ${node.probability}/10]`, '⚠', [245, 158, 11]);
      });
      builder.y += 2;
    }
  }

  // 9. Semantic Doctrinal Precedents & Vector Matches
  if (output.conceptMatches && output.conceptMatches.length > 0) {
    builder.addSectionHeading('Semantic Doctrinal Precedents & Vector Matches', [16, 185, 129]);
    output.conceptMatches.forEach((m, idx) => {
      const matchScore = Math.round(m.relevanceScore * 100);
      builder.addCalloutBox(
        `${idx + 1}. ${m.principle} (${matchScore}% Semantic Match) // ${m.landmarkPrecedent}`,
        `Jurisdiction / Doctrine: ${m.jurisdiction} (${m.doctrine})\nCore Holding: ${m.holdingSummary}\nStrategic Kill Switch: ${m.strategicApplication}`,
        'slate'
      );
    });
  }

  // 10. Temporal Milestones & Procedural Timeline
  if (output.timelineEvents && output.timelineEvents.length > 0) {
    builder.addSectionHeading('Procedural Timeline & Key Events', [100, 116, 139]);
    output.timelineEvents.forEach(evt => {
      const trackBadge = evt.narrativeTrack ? `[${evt.narrativeTrack.toUpperCase()}] ` : '';
      const citationBadge = evt.citation ? ` (${evt.citation})` : '';
      builder.addBullet(`${evt.date}: ${trackBadge}${evt.description}${citationBadge}`, '📅', [59, 130, 246]);
    });
    builder.y += 2;
  }

  // 11. Identified Judicial Profiles
  if (output.identifiedJudges && output.identifiedJudges.length > 0) {
    builder.addSectionHeading('Identified Judicial Bench Intel', [100, 116, 139]);
    const judgeNames = output.identifiedJudges.map(j => j.name).join(', ');
    builder.addParagraph(`Presiding / Referenced Judicial Officers: ${judgeNames}`, { isBold: true, color: [30, 41, 59] });
  }

  // 12. Verified Authorities & Cited Precedents
  if (output.sources && output.sources.length > 0) {
    builder.addSectionHeading('Verified Legal Authorities & Sources Cited', [100, 116, 139]);
    output.sources.forEach((src, idx) => {
      builder.addBullet(`${src.title} — ${src.uri}`, `[${idx + 1}]`, [100, 116, 139]);
    });
  }

  // Finalize and save PDF
  builder.finalizeAndSave(cleanFilename, `STRATEGIC ANALYSIS: ${queryTitle}`);
}

/**
 * Generates an executive, high-contrast Tactical Evidence Audit Report PDF for a single document
 */
export function generateTacticalAuditPDF(title: string, rawContent: string, filename: string, structuredData?: DocumentAnalysisResult) {
  const builder = new PDFReportBuilder();
  const docFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // 1. Header Band
  builder.addHeaderBand(
    'Tactical Evidence Audit Brief',
    title,
    structuredData?.status ? structuredData.status.toUpperCase() : 'AUDIT_VERIFIED',
    [239, 68, 68] // Red accent for evidentiary audit
  );

  // 2. Metadata Grid
  const metaItems = [
    { label: 'Dossier File', value: title },
    { label: 'Audit Status', value: structuredData?.status === 'reviewed' ? 'VERIFIED (ACTIVE)' : 'TACTICAL REVIEW' },
    { label: 'Timestamp', value: new Date().toLocaleDateString() },
    { label: 'Attacks Identified', value: `${(structuredData?.keyArguments || []).length} Strategic Strikes` },
    { label: 'Actionable Steps', value: `${(structuredData?.actionableInsights || []).length} Neutralization Steps` },
    { label: 'Annotations', value: `${(structuredData?.annotations || []).length} Recorded Annotations` }
  ];
  builder.addMetaGrid(metaItems);

  // If structuredData is available, format structured sections
  if (structuredData) {
    // Strategic Summary
    builder.addSectionHeading('1. Strategic Analysis Summary', [239, 68, 68]);
    builder.renderMarkdownSection(structuredData.strategicSummary);

    // Credibility Attack Vectors
    if (structuredData.keyArguments && structuredData.keyArguments.length > 0) {
      builder.addSectionHeading('2. Credibility Attack Vectors & Loopholes', [239, 68, 68]);
      structuredData.keyArguments.forEach((arg, idx) => {
        builder.addTacticalCard(`STRIKE 0${idx + 1}`, arg, 'red');
      });
      builder.y += 2;
    }

    // Detected Overarching Entities
    if (structuredData.identifiedEntities && structuredData.identifiedEntities.length > 0) {
      builder.addSectionHeading('3. Detected Overarching Entities', [100, 116, 139]);
      const entityItems = structuredData.identifiedEntities.map(ent => ({
        label: ent.type.toUpperCase(),
        value: ent.value
      }));
      builder.addMetaGrid(entityItems);
    }

    // Neutralization Roadmap
    if (structuredData.actionableInsights && structuredData.actionableInsights.length > 0) {
      builder.addSectionHeading('4. Neutralization Actions Roadmap', [16, 185, 129]);
      structuredData.actionableInsights.forEach((action, idx) => {
        builder.addTacticalCard(`ACTION 0${idx + 1}`, action, 'emerald');
      });
      builder.y += 2;
    }

    // Annotations (if present)
    if (structuredData.annotations && structuredData.annotations.length > 0) {
      builder.addSectionHeading('5. Evidentiary Annotations & Procedural Strikes', [245, 158, 11]);
      structuredData.annotations.forEach(ann => {
        const quoteStr = ann.quote ? `\nQuote: "${ann.quote}"` : '';
        builder.addCalloutBox(
          `[${ann.type.toUpperCase()}] Priority: ${ann.priority.toUpperCase()}`,
          `${ann.text}${quoteStr}`,
          ann.type === 'risk' || ann.type === 'procedural_strike' ? 'red' : ann.type === 'opportunity' ? 'emerald' : 'amber'
        );
      });
    }
  } else {
    // Fallback: parse rawContent
    builder.addSectionHeading('Strategic Analysis Summary', [239, 68, 68]);
    builder.renderMarkdownSection(rawContent);
  }

  builder.finalizeAndSave(docFilename, `TACTICAL AUDIT: ${title}`);
}

/**
 * Generates an executive PDF report for Unified Multi-Document Case Analysis
 */
export function generateMultiDocAuditPDF(
  multiDocResult: MultiDocumentAnalysisResult,
  files: DocumentAnalysisResult[],
  filename: string = 'unified_case_synthesis_report.pdf'
) {
  const builder = new PDFReportBuilder();
  const docFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // 1. Header Band
  builder.addHeaderBand(
    'Unified Multi-Dossier Strategic Audit',
    'Comprehensive Case Synthesis & Adversarial Defense Architecture',
    'UNIFIED_SYNTHESIS',
    [239, 68, 68]
  );

  // 2. Dossiers Ingested
  const fileNames = files.map(f => f.fileName).join(', ');
  const metaItems = [
    { label: 'Dossiers Ingested', value: `${files.length} Evidentiary Files` },
    { label: 'Discrepancies Found', value: `${multiDocResult.crossDocumentDiscrepancies.length} Contradictions` },
    { label: 'Overarching Risks', value: `${multiDocResult.overarchingRisks.length} Critical Risks` },
    { label: 'Key Entities Identified', value: `${multiDocResult.keyIdentifiedEntities.length} Entities` },
    { label: 'Roadmap Actions', value: `${multiDocResult.actionableRoadmap.length} Tactical Steps` },
    { label: 'Audit Timestamp', value: new Date().toLocaleDateString() }
  ];
  builder.addMetaGrid(metaItems);

  // Ingested File Names callout
  builder.addCalloutBox('Ingested Case Dossiers', fileNames || 'Multi-Dossier Evidence Layer', 'slate');

  // 3. Unified Case Summary
  builder.addSectionHeading('1. Unified Case Synthesis & Summary', [239, 68, 68]);
  builder.renderMarkdownSection(multiDocResult.caseSummary);

  // 4. Unified Strategic Architecture
  builder.addSectionHeading('2. Master Defense & Litigation Strategy', [16, 185, 129]);
  builder.renderMarkdownSection(multiDocResult.unifiedStrategy);

  // 5. Actionable Roadmap
  if (multiDocResult.actionableRoadmap && multiDocResult.actionableRoadmap.length > 0) {
    builder.addSectionHeading('3. Actionable Procedural Roadmap', [16, 185, 129]);
    multiDocResult.actionableRoadmap.forEach((step, idx) => {
      builder.addTacticalCard(`STEP 0${idx + 1}`, step, 'emerald');
    });
    builder.y += 2;
  }

  // 6. Cross-Document Discrepancies & Contradictions
  if (multiDocResult.crossDocumentDiscrepancies && multiDocResult.crossDocumentDiscrepancies.length > 0) {
    builder.addSectionHeading('4. Cross-Document Discrepancies & Contradictions', [239, 68, 68]);
    multiDocResult.crossDocumentDiscrepancies.forEach((disc, idx) => {
      builder.addCalloutBox(
        `CONTRADICTION 0${idx + 1}: ${disc.topic.toUpperCase()} (Files: ${disc.filesInvolved.join(', ')})`,
        disc.details,
        'red'
      );
    });
  }

  // 7. Overarching Risks
  if (multiDocResult.overarchingRisks && multiDocResult.overarchingRisks.length > 0) {
    builder.addSectionHeading('5. Overarching Case Risks & Hazards', [245, 158, 11]);
    multiDocResult.overarchingRisks.forEach((risk, idx) => {
      builder.addTacticalCard(`RISK 0${idx + 1}`, risk, 'amber');
    });
    builder.y += 2;
  }

  // 8. Key Identified Entities
  if (multiDocResult.keyIdentifiedEntities && multiDocResult.keyIdentifiedEntities.length > 0) {
    builder.addSectionHeading('6. Key Identified Entities & Actors', [100, 116, 139]);
    const entityItems = multiDocResult.keyIdentifiedEntities.map(ent => ({
      label: ent.type.toUpperCase(),
      value: ent.value
    }));
    builder.addMetaGrid(entityItems);
  }

  builder.finalizeAndSave(docFilename, 'UNIFIED MULTI-DOSSIER CASE AUDIT');
}

/**
 * Generates a formal, print-ready Colorado court pleading PDF (used for motions)
 */
export function generateCourtPleadingPDF(title: string, rawContent: string, filename: string) {
  // Setup standard US Letter page (215.9mm x 279.4mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 25.4; // 1 inch left margin (Standard Court standard)
  const rightMargin = 25.4; // 1 inch right margin
  const topMargin = 25.4; // 1 inch top margin
  const bottomMargin = 25.4; // 1 inch bottom margin
  const maxTextWidth = pageWidth - leftMargin - rightMargin;

  doc.setFont('Courier', 'normal');
  doc.setFontSize(12);

  const lines = wrapAndFormatText(doc, rawContent, maxTextWidth);

  // Split lines into pages
  const pages: string[][] = [[]];
  lines.forEach(line => {
    const currentPageLines = pages[pages.length - 1];
    const estimatedY = topMargin + currentPageLines.length * 6.5;
    if (estimatedY > pageHeight - bottomMargin - 10) {
      pages.push([]);
    }
    pages[pages.length - 1].push(line);
  });

  // Render pages
  pages.forEach((pageLines, pageIdx) => {
    if (pageIdx > 0) {
      doc.addPage();
    }

    doc.setFont('Courier', 'normal');
    doc.setFontSize(12);
    let y = topMargin;

    pageLines.forEach(line => {
      if (line.trim() === '') {
        y += 8;
      } else {
        const isHeader = line.toUpperCase().includes('STATE OF COLORADO') || 
                       line.toUpperCase().includes('DISTRICT COURT') || 
                       line.toUpperCase().startsWith('CASE NO:') || 
                       line.toUpperCase().includes('RESPONDENT') || 
                       line.toUpperCase().includes('PETITIONER');
        
        if (isHeader) {
          doc.setFont('Courier', 'bold');
        } else {
          doc.setFont('Courier', 'normal');
        }

        doc.text(line, leftMargin, y);
        y += 6.5;
      }
    });

    // Add pleading footer
    doc.setFont('Courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(`COLORADO COURT SYSTEM PREPARATION-ASSISTANT`, leftMargin, pageHeight - 12);
    
    const pageStr = `Page ${pageIdx + 1} of ${pages.length}`;
    doc.text(pageStr, pageWidth - rightMargin - doc.getTextWidth(pageStr), pageHeight - 12);
    doc.setTextColor(0, 0, 0);
  });

  const docName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(docName);
}
