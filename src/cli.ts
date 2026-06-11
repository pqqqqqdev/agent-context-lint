#!/usr/bin/env node

import { lintDirectory } from './index';
import { formatHumanReadable, formatJson } from './reporter';
import { LintOptions } from './types';

function printHelp(): void {
  console.log(`agent-context-lint - Lint AI agent context/instruction files

Usage:
  agent-context-lint [path] [options]

Arguments:
  path                 Directory to scan (default: current directory ".")

Options:
  --json               Output results as JSON
  --max-tokens <N>     Set custom max token threshold for errors (default: 3000)
  --help, -h           Show this help
  --version, -v        Show version

Exit codes:
  0  No errors found (warnings are allowed)
  1  One or more errors found

Examples:
  agent-context-lint .
  agent-context-lint ./my-repo --json
  agent-context-lint . --max-tokens 2000
`);
}

function printVersion(): void {
  // Read from package.json at runtime
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../package.json');
    console.log(pkg.version || '0.0.0');
  } catch {
    console.log('0.1.0');
  }
}

function parseArgs(argv: string[]): { target: string; options: LintOptions; help: boolean; version: boolean } {
  const args = argv.slice(2);
  let target = '.';
  const options: LintOptions = {};
  let help = false;
  let version = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--version' || arg === '-v') {
      version = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--max-tokens') {
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        const n = parseInt(next, 10);
        if (!isNaN(n) && n > 0) {
          options.maxTokens = n;
        } else {
          console.error('Error: --max-tokens expects a positive integer');
          process.exit(1);
        }
        i++;
      } else {
        console.error('Error: --max-tokens requires a value');
        process.exit(1);
      }
    } else if (!arg.startsWith('-')) {
      // positional target dir, take first
      if (target === '.') {
        target = arg;
      }
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  return { target, options, help, version };
}

function main(): void {
  const { target, options, help, version } = parseArgs(process.argv);

  if (help) {
    printHelp();
    process.exit(0);
  }
  if (version) {
    printVersion();
    process.exit(0);
  }

  try {
    const result = lintDirectory(target, options);

    if (options.json) {
      console.log(formatJson(result));
    } else {
      console.log(formatHumanReadable(result));
    }

    // Exit code: 1 only on errors (warnings ok)
    if (result.errorCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Unexpected error:', err?.message || err);
    process.exit(1);
  }
}

main();
