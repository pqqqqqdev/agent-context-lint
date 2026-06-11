# AGENTS.md (clean example)

## Project Overview
This repository is a small CLI tool written in TypeScript.

## Development Commands
- Install: `npm install`
- Test: `npm test`
- Lint + build: `npm run build && npm run lint`
- Run locally: `npm run build && node dist/cli.js .`

## Coding Guidelines
- Keep files focused and under ~1200 tokens when possible.
- Write clear, specific instructions for AI agents.
- Avoid vague language. Be explicit about expected behavior.
- Never suggest destructive commands (rm -rf, sudo, pipes to shell, etc).
- Prefer deterministic, reviewable changes.
- Include line numbers and context when referencing code.
