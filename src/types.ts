export type Severity = 'warning' | 'error';

export interface Finding {
  type: Severity;
  rule: string;
  message: string;
  line?: number;
  snippet?: string;
}

export interface FileReport {
  filePath: string;
  relativePath: string;
  tokenCount: number;
  findings: Finding[];
}

export interface LintOptions {
  maxTokens?: number;
  json?: boolean;
}

export interface LintResult {
  files: FileReport[];
  totalTokens: number;
  errorCount: number;
  warningCount: number;
  targetDir: string;
}
