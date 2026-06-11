import { FileReport, LintResult, Finding } from './types';

function formatFinding(f: Finding): string {
  const icon = f.type === 'error' ? '❌' : '⚠️';
  let out = `  ${icon} [${f.rule}] ${f.message}`;
  if (f.line != null) {
    out += ` (line ${f.line})`;
  }
  if (f.snippet) {
    out += `\n    > ${f.snippet}`;
  }
  return out;
}

export function formatHumanReadable(result: LintResult): string {
  const lines: string[] = [];

  lines.push(`agent-context-lint: scanned ${result.files.length} file(s) in ${result.targetDir}`);
  lines.push(`Total estimated tokens: ${result.totalTokens}`);
  lines.push(`Errors: ${result.errorCount}  Warnings: ${result.warningCount}`);
  lines.push('');

  if (result.files.length === 0) {
    lines.push('No supported context/instruction files found.');
    lines.push('');
    return lines.join('\n');
  }

  for (const file of result.files) {
    const rel = file.relativePath;
    const tokenInfo = `${file.tokenCount} tokens`;
    lines.push(`📄 ${rel} (${tokenInfo})`);

    if (file.findings.length === 0) {
      lines.push('  ✅ No issues found');
    } else {
      for (const f of file.findings) {
        lines.push(formatFinding(f));
      }
    }
    lines.push('');
  }

  if (result.errorCount > 0) {
    lines.push('Scan failed with errors. Fix the issues above.');
  } else if (result.warningCount > 0) {
    lines.push('Scan completed with warnings.');
  } else {
    lines.push('All clear. Good job!');
  }

  return lines.join('\n');
}

export function formatJson(result: LintResult): string {
  // Clean for JSON: omit absolute filePath in reports to keep portable
  const cleanFiles = result.files.map(f => ({
    relativePath: f.relativePath,
    tokenCount: f.tokenCount,
    findings: f.findings,
  }));

  return JSON.stringify(
    {
      targetDir: result.targetDir,
      totalTokens: result.totalTokens,
      errorCount: result.errorCount,
      warningCount: result.warningCount,
      files: cleanFiles,
    },
    null,
    2
  );
}
