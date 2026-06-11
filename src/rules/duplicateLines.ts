import { Finding } from '../types';

export function checkDuplicateLines(content: string): Finding[] {
  const lines = content.split(/\r?\n/);
  const lineCounts = new Map<string, number[]>();

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (isIgnoredStructuralOrBlankLine(trimmed)) return;
    if (!lineCounts.has(trimmed)) {
      lineCounts.set(trimmed, []);
    }
    lineCounts.get(trimmed)!.push(idx + 1);
  });

  const findings: Finding[] = [];

  for (const [lineText, lineNumbers] of lineCounts.entries()) {
    if (lineNumbers.length > 1) {
      const snippet = lineText.length > 80 ? lineText.slice(0, 77) + '...' : lineText;
      findings.push({
        type: 'warning',
        rule: 'duplicate-lines',
        message: `Duplicated line appears ${lineNumbers.length} times (lines ${lineNumbers.join(', ')})`,
        snippet,
      });
    }
  }

  return findings;
}

function isIgnoredStructuralOrBlankLine(trimmed: string): boolean {
  if (trimmed.length === 0) return true; // blank lines
  if (trimmed.startsWith('```')) return true; // markdown code fences: ```, ```bash, ```json, etc.
  // exact common structural tokens from code blocks / json / md
  if (trimmed === '{' || trimmed === '}' || trimmed === '[' || trimmed === ']' ||
      trimmed === '],' || trimmed === '},' || trimmed === '{' || trimmed === '}' ) {
    return true;
  }
  // punctuation-only lines (e.g. ---, ===, ..., ,, ;, etc. common in md and samples)
  if (/^[\{\}\[\]\(\),;:.`'"\-_*#>+\/\\|~!@%^&*=]+$/.test(trimmed)) return true;
  return false;
}
