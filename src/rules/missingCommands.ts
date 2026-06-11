import { Finding } from '../types';

const INSTALL_PATTERNS = [
  /\bnpm\s+(ci|install|i)\b/i,
  /\byarn\s+(install|add)\b/i,
  /\bpnpm\s+(install|i)\b/i,
  /\bbun\s+(install|i)\b/i,
  /\bgo\s+(get|install|mod\s+download)\b/i,
  /\bpip\s+install\b/i,
  /\bpython\s+-m\s+pip\s+install\b/i,
  /\bcargo\s+(build|install)\b/i,
  /install(ation)?\s+(instructions|steps|command)/i,
];

const TEST_PATTERNS = [
  /\bnpm\s+(test|run\s+test)\b/i,
  /\byarn\s+test\b/i,
  /\bpnpm\s+test\b/i,
  /\bbun\s+test\b/i,
  /\bgo\s+test\b/i,
  /\bpytest\b/i,
  /\bjest\b/i,
  /\bvitest\b/i,
  /\bcargo\s+test\b/i,
  /test(ing|s)?\s+(instructions|command|script|how to)/i,
];

const LINT_PATTERNS = [
  /\bnpm\s+run\s+lint\b/i,
  /\byarn\s+lint\b/i,
  /\bpnpm\s+lint\b/i,
  /\beslint\b/i,
  /\bprettier\b/i,
  /\bgolangci-lint\b/i,
  /\bruff\b/i,
  /\bclippy\b/i,
  /\blint(ing)?\s+(instructions|command|script|how to)/i,
];

function hasAnyPattern(content: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(content));
}

export function checkMissingCommands(content: string): Finding[] {
  const findings: Finding[] = [];

  if (!hasAnyPattern(content, INSTALL_PATTERNS)) {
    findings.push({
      type: 'warning',
      rule: 'missing-commands',
      message: 'No install command or installation instructions detected',
    });
  }

  if (!hasAnyPattern(content, TEST_PATTERNS)) {
    findings.push({
      type: 'warning',
      rule: 'missing-commands',
      message: 'No test command or testing instructions detected',
    });
  }

  if (!hasAnyPattern(content, LINT_PATTERNS)) {
    findings.push({
      type: 'warning',
      rule: 'missing-commands',
      message: 'No lint command or linting instructions detected',
    });
  }

  return findings;
}
