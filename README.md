# agent-context-lint

[![CI](https://github.com/pqqqqqdev/agent-context-lint/actions/workflows/ci.yml/badge.svg)](https://github.com/pqqqqqdev/agent-context-lint/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@pqqqqqdev/agent-context-lint.svg)](https://www.npmjs.com/package/@pqqqqqdev/agent-context-lint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A command-line linter that audits AI coding-agent context and instruction files for repositories.

It helps maintainers reduce:
- Token bloat
- Duplicated instructions
- Vague agent instructions ("make it better", "use best practices", etc.)
- Missing project commands (install, test, lint)
- Dangerous shell commands suggested to agents (recursive force-removal, privilege escalation, shell-piped downloads, etc.)

**No web UI. No React. Just a fast, focused CLI.**

## Supported Files

- `AGENTS.md`
- `CLAUDE.md`
- `.cursorrules`
- `.windsurfrules`
- `.github/copilot-instructions.md`
- `README.md`
- `docs/**/*.md`

## Installation

```bash
# Global (recommended for daily use)
npm install -g @pqqqqqdev/agent-context-lint

# Or use npx (no install)
npx @pqqqqqdev/agent-context-lint .

# Local dev install
npm install --save-dev @pqqqqqdev/agent-context-lint
```

## Usage

```bash
# Lint current directory
agent-context-lint .

# Lint a specific repo
agent-context-lint /path/to/repo

# JSON output (for CI, scripts, or piping)
agent-context-lint . --json

# Custom token budget (error threshold)
agent-context-lint . --max-tokens 2000

# Help
agent-context-lint --help
```

## CLI Options

| Option            | Description                                      |
|-------------------|--------------------------------------------------|
| `[path]`          | Directory to scan (default: `.`)                 |
| `--json`          | Emit machine-readable JSON instead of text       |
| `--max-tokens N`  | Override error threshold (default 3000). Warning threshold adapts to min(1500, N/2) |
| `--help`, `-h`    | Show help                                        |
| `--version`, `-v` | Show version                                     |

## Exit Codes

- `0` -- Success (no errors). Warnings are acceptable.
- `1` -- One or more **errors** were found.

## Example Output (Human Readable)

```
agent-context-lint: scanned 2 file(s) in /Users/dev/my-repo
Total estimated tokens: 8724
Errors: 2  Warnings: 5

AGENTS.md (6840 tokens)
  [error] [token-budget] File exceeds maximum token budget: 6840 tokens (limit: 3000)
  [error] [dangerous-commands] Dangerous shell command detected: [forceful recursive removal] (line 12)
    > [example: destructive removal command]
  [warning] [vague-instructions] Vague instruction detected: "make it better" (line 4)
    > Always make it better when you touch code.
  [warning] [duplicate-lines] Duplicated line appears 3 times (lines 19, 27, 41)
    > Always run the tests.

README.md (1884 tokens)
  [warning] [token-budget] File is large: 1884 tokens (warning threshold: 1500)
  [warning] [missing-commands] No lint command or linting instructions detected

Scan failed with errors. Fix the issues above.
```

## Example JSON Output

```json
{
  "targetDir": "/Users/dev/my-repo",
  "totalTokens": 8724,
  "errorCount": 2,
  "warningCount": 5,
  "files": [
    {
      "relativePath": "AGENTS.md",
      "tokenCount": 6840,
      "findings": [
        {
          "type": "error",
          "rule": "token-budget",
          "message": "File exceeds maximum token budget: 6840 tokens (limit: 3000)"
        }
      ]
    }
  ]
}
```

## Rules

| Rule                | Severity          | Description |
|---------------------|-------------------|-------------|
| `token-budget`      | warning / error   | Warn >1500 tokens, error >3000 (or `--max-tokens`) |
| `duplicate-lines`   | warning           | Repeated non-blank lines inside the same file |
| `vague-instructions`| warning           | Phrases like "make it better", "fix everything", "be careful", "use best practices", "clean code", "improve this", "handle edge cases" |
| `dangerous-commands`| error             | forceful recursive removal, world-writable permissions, shell-piped downloads, privilege escalation |
| `missing-commands`  | warning           | No recognizable install, test, or lint instructions |

## Examples

See the `examples/` directory:

- `examples/bloated-AGENTS.md` -- triggers many rules
- `examples/clean-AGENTS.md` -- minimal good example

Run against the examples (the files use demo names, so copy/rename first or run from a temp dir):

```bash
# Example of testing the bloated case
mkdir -p /tmp/bloated-demo && cp examples/bloated-AGENTS.md /tmp/bloated-demo/AGENTS.md
agent-context-lint /tmp/bloated-demo
# (manually remove /tmp/bloated-demo afterward)
```

## Why This Exists

AI coding agents (Cursor, Claude, Copilot, Windsurf, etc.) are powerful, but their instruction files often grow out of control. Large, repetitive, or vague context wastes tokens and leads to poor or unsafe suggestions.

`agent-context-lint` gives maintainers an easy, automated way to keep these files healthy.

## Development

```bash
git clone https://github.com/pqqqqqdev/agent-context-lint.git
cd agent-context-lint
npm install
npm run build
npm test
```

To test the CLI against the source without global install:

```bash
npm run build
node dist/cli.js .
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
