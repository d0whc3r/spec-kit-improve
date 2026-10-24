# AGENTS.md

This repo ships the Improve extension for Spec Kit. The extension is Markdown only: one command and three templates. A host agent runs `/speckit.improve.run`, audits a codebase, and writes spec prompts under `specs/improves/` in that codebase.

## Commands

Run these from the repo root. The repo uses Node 24 (`.nvmrc`) and pnpm 12 (`packageManager` in `package.json`).

| Command          | What it does                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `pnpm install`   | Installs the tools. Husky adds a pre-commit hook that runs oxfmt on staged files.             |
| `pnpm check`     | Validates the manifest, checks metadata sync, checks the format, and lints shipped content.   |
| `pnpm format`    | Formats all files with oxfmt.                                                                 |
| `pnpm sync`      | Copies the identity fields from `package.json` into `extension.yml` and `catalog.json`.       |
| `pnpm build`     | Builds `dist/improve-<version>.zip` and validates the unpacked copy. Needs `zip` and `unzip`. |
| `pnpm web:build` | Copies `examples/` into `web/public/` and builds the site into `web/dist/`.                   |

CI (`.github/workflows/ci.yml`) runs `pnpm check`, `pnpm build`, and `pnpm web:build` on every pull request.

To test the command in a real Spec Kit project, run `specify extension add --dev <path-to-this-repo> --force` in that project.

## Layout

| Path                              | Role                                                                                                                                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `commands/speckit.improve.run.md` | The only command. It ships in the zip.                                                                                                    |
| `templates/`                      | The three references the command reads at runtime. They ship in the zip.                                                                  |
| `extension.yml`                   | The Spec Kit manifest.                                                                                                                    |
| `catalog.json`                    | The entry for the upstream catalog submission.                                                                                            |
| `.extensionignore`                | Keeps `--dev` installs equal to the zip. Keep it in step with `INCLUDE` in `.github/scripts/build-zip.mjs`.                               |
| `.github/scripts/`                | Release, sync, and lint scripts (zx). Shared helpers are in `lib/`.                                                                       |
| `docs/`                           | The user wiki source. A push to `main` that changes `docs/` updates the wiki.                                                             |
| `web/`                            | The GitHub Pages site (Vite and TypeScript).                                                                                              |
| `examples/`                       | Real example output. The wiki and the site link to these files.                                                                           |
| `.agents/skills/`                 | Contributor skills. `.claude/skills/` holds symlinks to them. Use `maintain-docs` after a change to the command, templates, or manifests. |

## Rules

1. The command never tells an agent to change source code. Its only writes go to `specs/improves/`.
2. When you change the command surface, change these files together: the command file, `provides.commands` in `extension.yml`, the `provides.commands` count in `catalog.json`, and `REQUIRED` in `.github/scripts/validate-manifest.mjs`.
3. A rename or a removal of the command is a breaking change. Use a `BREAKING CHANGE:` footer. The release preset (angular) ignores a `feat!:` header.
4. `package.json` owns the description, author, homepage, repository, license, and keywords. Edit them there, then run `pnpm sync`.
5. Shipped content (`commands/`, `templates/`) uses plain English and no em dash. `.github/scripts/lint-content.mjs` enforces this rule and the template heading order.
6. The command file names Spec Kit commands with tokens, such as `__SPECKIT_COMMAND_SPECIFY__`. Spec Kit replaces each token at install with the agent's form: `/speckit.specify`, `/speckit-specify`, or `$speckit-specify`. Do not write a `/` before a token. Spec Kit copies `templates/` without changes, so the templates use the dot form.
7. Commits follow Conventional Commits. semantic-release cuts a release on every push to `main`: `fix:` gives a patch, `feat:` gives a minor version.
8. The extension requires Spec Kit `>=0.12.17`. To change the minimum, edit `requires.speckit_version` in `extension.yml` and `catalog.json` together, then update the docs that state it.
9. Renovate (`renovate.json`) is the only dependency bot. Its updates use `chore:` commits, because no npm package ships in the zip.

## Gotchas

- Do not edit `CHANGELOG.md` or the release fields in `catalog.json` (`version`, `download_url`, `sha256`, timestamps). The release pipeline writes them.
- Do not change pinned release URLs (`.../releases/download/vX.Y.Z/improve-X.Y.Z.zip`) by hand. `semantic-release-prepare.mjs` rewrites them in `README.md`, `WORKFLOW.md`, `docs/`, and `web/index.html`.
- Links between wiki pages use `Page-Name.md`. `stage-wiki.mjs` removes `.md` for the wiki.
- `/specs/` is gitignored. It holds local dogfood output from this repo.
- `/improve/` is a gitignored local clone of the upstream `shadcn/improve` skill. The extension derives from it.

<!-- CODEGRAPH_START -->

## CodeGraph

`.mcp.json` configures the CodeGraph MCP server. Use `codegraph_explore` first for structural questions, such as callers, definitions, and impact. Use grep for literal text.

<!-- CODEGRAPH_END -->
