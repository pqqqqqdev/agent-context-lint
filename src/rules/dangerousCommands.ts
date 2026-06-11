import { Finding } from '../types';

const DANGEROUS_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*|--force)\b/i, label: 'rm -rf (or force recursive remove)' },
  { pattern: /\bchmod\s+777\b/i, label: 'chmod 777' },
  { pattern: /\bcurl\b[^\n]*\|\s*sh\b/i, label: 'curl | sh (pipe to shell)' },
  { pattern: /\bwget\b[^\n]*\|\s*sh\b/i, label: 'wget | sh (pipe to shell)' },
  { pattern: /\bsudo\b/i, label: 'sudo (privilege escalation)' },
];

const NEGATION_WORDS = /\b(never|do not|don't|dont|avoid|warning|dangerous|unsafe|prohibited|forbidden|not recommended)\b/i;

export function checkDangerousCommands(content: string): Finding[] {
  const lines = content.split(/\r?\n/);
  const findings: Finding[] = [];

  lines.forEach((line, idx) => {
    for (const { pattern, label } of DANGEROUS_PATTERNS) {
      if (pattern.test(line) && !NEGATION_WORDS.test(line)) {
        const snippet = line.trim().length > 80 ? line.trim().slice(0, 77) + '...' : line.trim();
        findings.push({
          type: 'error',
          rule: 'dangerous-commands',
          message: `Dangerous shell command detected: ${label}`,
          line: idx + 1,
          snippet,
        });
        break; // avoid duplicate findings for same line
      }
    }
  });

  return findings;
}
