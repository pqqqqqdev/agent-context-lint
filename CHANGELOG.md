# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-11

### Added
- Initial release of agent-context-lint CLI.
- Recursive scan for AGENTS.md, CLAUDE.md, .cursorrules, .windsurfrules, .github/copilot-instructions.md, README.md, docs/**/*.md.
- Token estimation (chars / 4) with configurable thresholds via --max-tokens.
- Rules:
  - token-budget (warn >1500, error >3000 or custom)
  - duplicate-lines
  - vague-instructions (common filler phrases)
  - dangerous-commands (rm -rf, chmod 777, curl|sh, wget|sh, sudo)
  - missing-commands (install/test/lint detection)
- Human readable output + --json mode.
- Exit code 0 on warnings only, 1 on any errors.
- Full unit tests for all rules.
- examples/ with bloated and clean samples.
- GitHub Actions CI workflow.
- MIT license, README, CONTRIBUTING.md, CHANGELOG.md.
