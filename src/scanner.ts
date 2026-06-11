import * as fs from 'fs';
import * as path from 'path';
import { FileReport } from './types';

const SUPPORTED_BASENAMES = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  '.cursorrules',
  '.windsurfrules',
]);

const SUPPORTED_RELATIVE = new Set([
  '.github/copilot-instructions.md',
]);

function shouldScanFile(filePath: string, rootDir: string): boolean {
  const base = path.basename(filePath);
  const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');

  if (SUPPORTED_BASENAMES.has(base)) {
    return true;
  }
  if (SUPPORTED_RELATIVE.has(rel)) {
    return true;
  }
  // docs/**/*.md
  if (rel.startsWith('docs/') && base.endsWith('.md')) {
    return true;
  }
  // README.md at root or anywhere? spec says README.md, probably any README.md
  if (base === 'README.md') {
    return true;
  }
  return false;
}

function walkDir(dir: string, rootDir: string, files: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const rel = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
        continue;
      }
      walkDir(fullPath, rootDir, files);
    } else if (entry.isFile()) {
      if (shouldScanFile(fullPath, rootDir)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

export function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

export function scanDirectory(targetDir: string): FileReport[] {
  const absTarget = path.resolve(targetDir);
  const foundPaths = walkDir(absTarget, absTarget);

  const reports: FileReport[] = [];

  for (const filePath of foundPaths) {
    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const relativePath = path.relative(absTarget, filePath).replace(/\\/g, '/');
    const tokenCount = estimateTokens(content);

    reports.push({
      filePath,
      relativePath: relativePath || path.basename(filePath),
      tokenCount,
      findings: [],
    });
  }

  // Sort for deterministic output: prefer top level, then alpha
  reports.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  return reports;
}

export function readFileContent(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}
