# Contributing to agent-context-lint

Thank you for your interest in improving agent-context-lint!

## Development

1. Fork and clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```
5. Run the CLI locally (after build):
   ```bash
   node dist/cli.js .
   # or with tsx if you have it installed: npx tsx src/cli.ts .
   ```

## Adding or modifying rules

- Rules live in `src/rules/`.
- Each rule exports a function that receives file content and returns `Finding[]`.
- Add corresponding tests in `tests/rules.test.ts` (or a dedicated test file).
- Update the main `lintDirectory` flow in `src/index.ts` if the rule needs options or special handling.
- Keep rules deterministic and fast (no network, no heavy computation).

## Reporting issues

When filing bugs, please include:
- The version of agent-context-lint (`agent-context-lint --version`)
- A minimal reproduction (a small example file that triggers the issue)
- Expected vs actual behavior
- Output with `--json` if relevant

## Pull Requests

- Keep PRs focused.
- Include tests for new behavior.
- Run `npm test` locally before pushing.
- Update README / examples when user-facing behavior changes.
- Follow existing code style (simple, readable TypeScript, no unnecessary abstractions).

## Code of Conduct

Be respectful and constructive. We welcome contributors of all experience levels.
