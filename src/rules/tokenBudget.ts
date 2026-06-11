import { Finding } from '../types';
import { estimateTokens } from '../scanner';

const DEFAULT_WARN_THRESHOLD = 1500;
const DEFAULT_ERROR_THRESHOLD = 3000;

export interface TokenBudgetOptions {
  warnThreshold?: number;
  errorThreshold?: number;
}

export function checkTokenBudget(
  content: string,
  options: TokenBudgetOptions = {}
): Finding[] {
  const tokens = estimateTokens(content);
  const warnThreshold = options.warnThreshold ?? DEFAULT_WARN_THRESHOLD;
  const errorThreshold = options.errorThreshold ?? DEFAULT_ERROR_THRESHOLD;

  const findings: Finding[] = [];

  if (tokens > errorThreshold) {
    findings.push({
      type: 'error',
      rule: 'token-budget',
      message: `File exceeds maximum token budget: ${tokens} tokens (limit: ${errorThreshold})`,
    });
  } else if (tokens > warnThreshold) {
    findings.push({
      type: 'warning',
      rule: 'token-budget',
      message: `File is large: ${tokens} tokens (warning threshold: ${warnThreshold})`,
    });
  }

  return findings;
}
