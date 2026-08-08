import type { AnalysisSection } from '@/types';

// Parses the AI markdown response into structured sections.
// Each section starts with a markdown "# Heading".
export function parseAnalysis(markdown: string): AnalysisSection[] {
  const sections: AnalysisSection[] = [];
  // Split on lines that start with "# " (top-level heading)
  const parts = markdown.split(/^# /m).filter((p) => p.trim().length > 0);

  for (const part of parts) {
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) {
      sections.push({ heading: part.trim(), body: '' });
      continue;
    }
    const heading = part.slice(0, newlineIdx).trim();
    const body = part.slice(newlineIdx + 1).trim();

    // Detect bulleted lists
    const lines = body.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const isList = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l));
    const items = isList
      ? lines.map((l) => l.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''))
      : undefined;

    sections.push({ heading, body: isList ? '' : body, items });
  }

  return sections;
}
