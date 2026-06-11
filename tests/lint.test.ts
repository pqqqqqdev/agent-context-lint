import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { lintDirectory } from '../src/index';
import { scanDirectory } from '../src/scanner';

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'acl-test-'));
}

function writeFile(dir: string, rel: string, content: string) {
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

describe('scanner', () => {
  it('finds supported files recursively and ignores node_modules/.git', () => {
    const tmp = createTempDir();
    writeFile(tmp, 'AGENTS.md', '# agents');
    writeFile(tmp, 'README.md', '# readme');
    writeFile(tmp, 'docs/guide.md', '# guide');
    writeFile(tmp, '.github/copilot-instructions.md', '# copilot');
    writeFile(tmp, 'node_modules/pkg/AGENTS.md', 'bad');
    writeFile(tmp, '.git/AGENTS.md', 'bad');
    writeFile(tmp, 'src/ignore.md', 'no');

    const reports = scanDirectory(tmp);
    const rels = reports.map(r => r.relativePath).sort();
    expect(rels).toEqual([
      '.github/copilot-instructions.md',
      'AGENTS.md',
      'README.md',
      'docs/guide.md',
    ]);
  });
});

describe('lintDirectory integration', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = createTempDir();
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('produces correct counts and applies all rules', () => {
    const bloated = `AGENTS instructions here.
make it better
fix everything
rm -rf node_modules
npm test
# duplicate
# duplicate
`.repeat(200); // make huge >3000 tokens easily

    writeFile(tmp, 'AGENTS.md', bloated);

    const res = lintDirectory(tmp);
    expect(res.files.length).toBe(1);
    expect(res.errorCount).toBeGreaterThan(0); // token + dangerous
    expect(res.warningCount).toBeGreaterThan(0);
    const findings = res.files[0].findings.map(f => f.rule);
    expect(findings).toContain('token-budget');
    expect(findings).toContain('dangerous-commands');
    expect(findings).toContain('vague-instructions');
    expect(findings).toContain('duplicate-lines');
  });

  it('respects --max-tokens override', () => {
    const med = 'x'.repeat(2000 * 4);
    writeFile(tmp, 'AGENTS.md', med);

    const resDefault = lintDirectory(tmp);
    expect(resDefault.files[0].findings.some(f => f.type === 'error')).toBe(false);

    const resSmall = lintDirectory(tmp, { maxTokens: 1500 });
    expect(resSmall.files[0].findings.some(f => f.type === 'error' && f.rule === 'token-budget')).toBe(true);
  });

  it('returns exit-friendly result (errors >0 only for errors)', () => {
    writeFile(tmp, 'AGENTS.md', 'Just normal text with npm install and npm test and npm run lint.');
    const res = lintDirectory(tmp);
    expect(res.errorCount).toBe(0);
    // may have missing? No, we have commands so no missing findings
    expect(res.files[0].findings.filter(f => f.rule === 'missing-commands')).toHaveLength(0);
  });

  it('json mode shape is stable', () => {
    writeFile(tmp, 'CLAUDE.md', 'Use npm test');
    const res = lintDirectory(tmp, { json: true });
    expect(res.targetDir).toBeDefined();
    expect(typeof res.totalTokens).toBe('number');
  });
});
