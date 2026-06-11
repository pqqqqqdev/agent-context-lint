import * as path from 'path';
import { scanDirectory, readFileContent, estimateTokens } from './scanner';
import { FileReport, LintOptions, LintResult, Finding } from './types';
import { checkTokenBudget } from './rules/tokenBudget';
import { checkDuplicateLines } from './rules/duplicateLines';
import { checkVagueInstructions } from './rules/vagueInstructions';
import { checkDangerousCommands } from './rules/dangerousCommands';
import { checkMissingCommands } from './rules/missingCommands';

function applyRulesToFile(report: FileReport, content: string, options: LintOptions): Finding[] {
  const findings: Finding[] = [];

  // token budget: pass maxTokens as errorThreshold
  const tokenOpts: { warnThreshold?: number; errorThreshold?: number } = {};
  if (options.maxTokens != null) {
    tokenOpts.errorThreshold = options.maxTokens;
    // keep warn at 1500 or use half of max if smaller
    tokenOpts.warnThreshold = Math.min(1500, Math.floor(options.maxTokens / 2));
  }
  findings.push(...checkTokenBudget(content, tokenOpts));

  findings.push(...checkDuplicateLines(content));
  findings.push(...checkVagueInstructions(content));
  findings.push(...checkDangerousCommands(content));
  findings.push(...checkMissingCommands(content));

  return findings;
}

export function lintDirectory(targetDir: string, options: LintOptions = {}): LintResult {
  const absDir = path.resolve(targetDir);

  const fileReports = scanDirectory(absDir);

  let totalTokens = 0;
  let errorCount = 0;
  let warningCount = 0;

  const processedFiles: FileReport[] = [];

  for (const report of fileReports) {
    const content = readFileContent(report.filePath);
    const findings = applyRulesToFile(report, content, options);

    // attach
    const updated: FileReport = {
      ...report,
      findings,
    };

    processedFiles.push(updated);

    totalTokens += updated.tokenCount;

    for (const f of findings) {
      if (f.type === 'error') errorCount++;
      else warningCount++;
    }
  }

  return {
    files: processedFiles,
    totalTokens,
    errorCount,
    warningCount,
    targetDir: absDir,
  };
}
