import { Finding } from '../types';

const VAGUE_PHRASES = [
  'make it better',
  'fix everything',
  'be careful',
  'use best practices',
  'clean code',
  'improve this',
  'handle edge cases',
  'do it right',
  'make sure it works', // bonus common vague
];

export function checkVagueInstructions(content: string): Finding[] {
  const lines = content.split(/\r?\n/);
  const findings: Finding[] = [];
  const lowerPhrases = VAGUE_PHRASES.map(p => p.toLowerCase());

  lines.forEach((line, idx) => {
    const lower = line.toLowerCase();
    for (const phrase of lowerPhrases) {
      if (lower.includes(phrase)) {
        const snippet = line.trim().length > 80 ? line.trim().slice(0, 77) + '...' : line.trim();
        findings.push({
          type: 'warning',
          rule: 'vague-instructions',
          message: `Vague instruction detected: "${phrase}"`,
          line: idx + 1,
          snippet,
        });
        break; // one finding per line max
      }
    }
  });

  return findings;
}
