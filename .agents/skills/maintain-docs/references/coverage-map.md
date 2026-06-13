# Coverage Map

For each user-facing page, the canonical sources it documents and the
specific facts it asserts. Use this in Phase 2 of `maintain-docs` to
figure out which sources to re-check when a page is suspected of drift.

The reverse direction (canonical file → which pages depend on it) is at
the bottom.

Only user-facing pages appear here. Contributor and tooling docs
(`CONTRIBUTING.md`, `AGENTS.md`/`CLAUDE.md`) are out of this skill's
scope and are intentionally absent.

## Wiki pages

### `docs/Home.md`

Documents: the extension purpose, the command at a glance, the
reading order, the hard rules.

Asserts:

- Extension purpose paragraph (matches `README.md` lead and
  `extension.yml.extension.description`).
- The "Command / What it does / Writes" table (must be
  byte-equivalent to the same table in `README.md`).
- The links to every other wiki page.

Re-check whenever: a command is added or removed; the description in
`extension.yml` changes; a wiki page is added or removed.

### `docs/Getting-Started.md`

Documents: install, first run, basic usage.

Asserts:

- Spec Kit version requirement (must match `extension.yml.requires.speckit_version`).
- Install URL with pinned version (must match
  `extension.yml.extension.version` and `catalog.json.version`).
- The command and what it writes.
- The example output paths under `specs/<spec>/improve/`.

Scope rule: this page covers the user install paths (catalog install and
pinned-version install). It does not cover the dev install
(`specify extension add --dev`); that is a contributor step and lives in
`CONTRIBUTING.md`.

Re-check whenever: version bumps; install paths change;
`/speckit.improve` reads/writes change.

### `docs/Commands.md`

Documents: every command in full.

Asserts:

- A "Rules" section plus one section per
  command in `commands/`.
- Each section's "Reads" and "Writes" must match the command file body.
- The audit command's modifiers (`quick`/`deep`, focus category,
  `branch`, `next`, `--issues`) match the command file.
- Output sections list must match the corresponding template under
  `templates/`.
- The "Refusal summary" must include every refusal condition the command
  bodies define.

Re-check whenever: any file under `commands/` or `templates/` changes.

### `docs/Workflow.md`

Documents: the input/output flow and the audit-then-handoff loop.

Asserts:

- The recommended order: run `/speckit.improve` to audit and write
  prompts, hand each prompt to the spec-kit lifecycle
  (`/speckit.specify` → `/speckit.clarify` → `/speckit.plan` →
  `/speckit.tasks` → `/speckit.implement`), and re-run `/speckit.improve`
  to refresh drifted prompts.
- The improve backlog layout: spec prompt files under
  `specs/<spec>/improve/` with descriptive names.
- The status lifecycle the prompt frontmatter records.

Re-check whenever: a new command lands; the backlog layout or the status
lifecycle changes.

### `docs/Examples.md`

Documents: a sample findings table and the spec prompt it produced.

Asserts:

- The output layout matches the templates: spec prompt files under
  `specs/<spec>/improve/` with descriptive names (for example
  `fix-n-plus-one.md`).
- Section structure of each example prompt matches the current
  `templates/improve-spec-prompt-template.md`.

Re-check whenever: `templates/*.md` changes shape. The example bodies are
illustrative and do not need byte-exact match, but section names,
ordering, and presence of required sections must match the current
template.

### `docs/Spec-Prompt-Format.md`

Documents: what makes a spec prompt processable by `/speckit.specify`
with zero extra context. The "Spec Prompt Format" page.

Asserts:

- The required frontmatter fields and the status values they record.
- The body section list, matching
  `templates/improve-spec-prompt-template.md`.
- That `[NEEDS CLARIFICATION]` markers are preserved literally.

Re-check whenever: `templates/improve-spec-prompt-template.md` changes;
the frontmatter status lifecycle changes.

### `docs/Troubleshooting.md`

Documents: refusals, common breakages, and install errors.

Asserts:

- Each refusal condition the command prompts can produce, matching the
  "Refusal summary" in `docs/Commands.md`.
- The installation-errors section (the catalog `install_allowed: false`
  case), matching the install paths in `README.md`.

Re-check whenever: a command file adds or renames a refusal condition;
the install paths change.

### `docs/FAQ.md`

Documents: conceptual questions and design rationale, from the user's
point of view.

Asserts: rationale that may reference the output style, the advisor
boundary (read-only, never implements), or the "prompt is the product"
framing. Drift here is rare; most edits are additive.

Re-check whenever: a frequently asked question surfaces in issues that is
not yet covered; the behavior the FAQ describes changes.

### `docs/Architecture.md`

Documents: how the extension works at runtime, for a user who wants to
understand what happens when they run a command.

Scope rule: this page is "how it works", not "how it ships". It covers
what the extension is (text, no runtime), how a command resolves and what
it reads and writes, and the advisor boundary. It does **not** cover the
repo source tree, the release pipeline, `semantic-release`, CI, or repo
governance. Those are contributor concerns in `CONTRIBUTING.md`. It also
does not name specific assistants; refer generically to "the host agent"
when needed.

Asserts:

- The runtime invocation flow (command → prompt → template → output
  path) matches the actual command and template files.
- The advisor boundary matches the hard rules the commands enforce (the
  only writes go to `specs/<spec>/improve/`).

Re-check whenever: a command's read/write behavior changes; the advisor
boundary changes.

### `docs/_Sidebar.md`

Documents: wiki navigation.

Asserts: one bullet per wiki page that exists, in reading order, plus
external links (Repo / Issues / Discussions, and a Contributing link that
points to `CONTRIBUTING.md` at the repo root by absolute URL).

Re-check whenever: a wiki page is added or removed; the repo URL changes.

### `docs/_Footer.md`

Documents: a footer line for the wiki.

Asserts: copyright and a link back to the repo. Rarely changes.

### `docs/README.md`

Repo-only meta-doc about the `docs/` folder (excluded from the published
wiki). Maintain only its reading-order link list so it matches the pages
that exist, and its editing voice rules. The wiki-publishing mechanics
(the sync workflow, the staging script) are tooling and live in
`CONTRIBUTING.md`, not here.

Re-check whenever: a wiki page is added or removed.

## Root markdown

### `README.md`

Documents: the same things `docs/Home.md` documents plus install and
quickstart. The repo's front door.

Asserts:

- Description paragraph (must match `extension.yml.extension.description`
  in intent).
- The "Command / What it does / Writes" table (must be
  byte-equivalent to `docs/Home.md`).
- Install paths and pinned version (must match `extension.yml.extension.version`).
- Links to every `docs/*.md` page that exists (as wiki URLs).
- A single Contributing pointer to `CONTRIBUTING.md` at the repo root.

Re-check whenever: command count changes; version bumps; a wiki page is
added.

### `WORKFLOW.md`

Documents: the canonical usage narrative. Longer-form than
`docs/Workflow.md`, still written for the user running the commands.

Asserts: same flow as `docs/Workflow.md` but with more context. Treat the
two as a long/short pair. When `docs/Workflow.md` updates, `WORKFLOW.md`
may also need an update.

Re-check whenever: `docs/Workflow.md` changes; commands are added.

### `CHANGELOG.md`

Documents: per-version change log.

Asserts: top entry version matches `extension.yml.extension.version`
(unless an `[Unreleased]` block is open).

Re-check whenever: the version bumps. The release pipeline edits this
file; the skill only verifies the top entry version is consistent and
does not edit it unless explicitly asked.

## Website

### `web/index.html`

Documents: the public, short front door to the extension. A single page
covering the purpose, the command, getting started, the workflow,
and a FAQ subset. Deployed to GitHub Pages.

Asserts:

- The hero purpose paragraph (matches `extension.yml.extension.description`
  and the `README.md` lead).
- The hero badges: command count, `Requires Spec Kit >= 0.2.0`, license.
- The command (same command name and what it writes as
  `docs/Home.md`; HTML form, not byte-equivalent).
- The install snippets and the pinned release URL (must match the version
  in `README.md` and `docs/Getting-Started.md`).
- The `specs/<spec>/improve/` output paths and example prompt names.
- The FAQ entries (a subset of `docs/FAQ.md`; must not contradict it).
- The repository, wiki, issues, and discussions links.

Edit content only. Do not restyle `web/src/styles.css` or rewrite
the TypeScript under `web/src/`. `web/README.md` is a repo-only meta-doc about the folder,
maintained like `docs/README.md`.

Re-check whenever: a command is added or removed; the description in
`extension.yml` changes; the version bumps; an FAQ answer in
`docs/FAQ.md` changes in a way the website echoes.

## Out of scope (do not maintain as user docs)

- `CONTRIBUTING.md` — the contributor home: repo layout, dev install,
  pipeline checks, release procedure, catalog submission, style coupling,
  branch naming. User-facing pages link here for contributor questions;
  the skill does not edit it.
- `AGENTS.md` / `CLAUDE.md` — agent behavioral guidelines and the
  advisor boundary rule. Repo governance, not user docs.
- `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md` — standard repo
  files. Leave alone unless explicitly asked.

## Canonical sources → pages that depend on them

Use this when you know which source changed and want to find every
user-facing page that might need a touch.

| Canonical file                            | Pages to re-check                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `extension.yml` (commands/version)        | `README.md`, `docs/Home.md`, `docs/Commands.md`, `docs/Getting-Started.md`, `docs/Architecture.md`, `CHANGELOG.md`, `web/index.html` |
| `extension.yml.extension.description`     | `README.md`, `docs/Home.md`, `web/index.html`                                                       |
| `catalog.json` (version, counts)          | `README.md`, `docs/Getting-Started.md`, `web/index.html`                                            |
| `commands/speckit.improve.md`             | `docs/Commands.md`, `docs/Troubleshooting.md`, `docs/Examples.md`, `docs/Workflow.md`, `docs/Architecture.md` |
| `templates/improve-spec-prompt-template.md` | `docs/Commands.md` (output sections), `docs/Examples.md` (example bodies), `docs/Spec-Prompt-Format.md` (frontmatter and section list) |
| `templates/improve-audit-playbook.md`     | `docs/Commands.md` (audit phases and categories), `docs/Workflow.md`                                |
| `templates/improve-closing-the-loop.md`   | `docs/Commands.md` (handoff, re-run for drift, `--issues`), `docs/Workflow.md` (status lifecycle)   |
| `docs/FAQ.md` (echoed answers)            | `web/index.html` (FAQ subset)                                                                       |
| New file at `docs/<Page>.md`              | `docs/Home.md`, `docs/_Sidebar.md`, `docs/README.md`, `README.md` (if linked there)                  |
