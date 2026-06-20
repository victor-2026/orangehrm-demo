# OrangeHRM Demo — E2E Test Suite

## Boundaries

| Directory/File | Agent Action |
|---------------|-------------|
| `e2e/*.spec.ts` | **edit** — add/modify tests |
| `pom/*.ts` | **edit** — page object methods |
| `k6/*.js` | **edit** — load test scripts |
| `helpers/*.ts` | **ask** — fixtures, credentials |
| `playwright.config.ts` | **ask** — global config |
| `exploration/` | **never** — auto-generated |
| `package.json` | **ask** — scripts/deps |
| `AGENTS.md` | **ask** — agent rules |
| `*.txt`, `*.pdf`, `*.rtf` | **never** — CV/docs |

## Architecture

```
OrangeHRM/
├── e2e/              — test specs (auth, admin, pim, leave, etc.)
├── pom/              — Page Object Models
├── k6/               — load test scripts
├── helpers/          — fixtures, credentials
├── exploration/      — auto-generated site map + screenshots
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Sources of Truth (resolution order)
1. `AGENTS.md` — this file
2. `session-checkpoint.md` — active session state
3. `~/.opencode-memory.md` — global memory across projects
4. Installed skills (`~/.config/opencode/skills/`)

## Agent Rules
- **No secrets in code** — credentials in `helpers/credentials.ts` only
- **No dated facts** — timestamps generated in tests (`Date.now()`)
- **No model-specific instructions** — rules apply to any agent
- **Keep AGENTS.md ≤ 32 KiB** — current: ~1 KiB

## Quality Gates (3-Layer Model)

Every AI-generated test must pass these 6 gates before shipping. Based on Anton Gulin's 3-Layer Architecture (Orchestration → Execution → Evidence).

| Gate | Pass condition | Layer |
|------|---------------|-------|
| Scope | The test maps to one named risk | Orchestration |
| Data | Test data setup is explicit | Orchestration |
| State | Browser state is controlled | Execution |
| Run | The test passes in CI | Execution |
| Evidence | Trace or equivalent proof exists | Evidence |
| Review | A human can explain the failure mode | Evidence |

## Quick Start
```bash
npm test              # headless
npm run test:headed   # visible browser
npm run explore       # re-generate site exploration
npm run test:smoke    # smoke tests only
npm run test:k6       # k6 load test
npm run test:k6:local # k6 load test (local Docker)
```

## Communication — Full File Paths (MANDATORY)

In opencode-desktop TUI (macOS): **only `mailto:` is clickable**. file://, /Users/.../path, markdown links = NOT clickable.

**Always provide: full absolute path + bash code block with `code` command.**

```
File: /Users/victor/.../file.md
```bash
code /Users/victor/.../file.md
```
```

For multiple files: one bash code block with multiple `code` lines.
For email: use `mailto:user@domain` (clickable!).

Full rule + examples: `~/.opencode-memory.md` → "Communication Style — File Paths"
