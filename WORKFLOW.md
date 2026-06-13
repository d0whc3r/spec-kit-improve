# How to Use the Improve Extension

This document explains how to install the extension, what each command needs as input, what it produces as output, and in what order to run them.

---

## Prerequisites

- Spec Kit `>=0.2.0` initialized in your project (`specify init`). The extension hands work to the core lifecycle commands (`/speckit.specify`, `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`), so they must be available.
- A git repository (required for the `planned_at` stamp and the drift checks inside every prompt; `/speckit.specify` also creates feature branches).
- A working verification command (tests, typecheck, lint) helps a lot: it becomes the verification gate inside every prompt. If the repo has none, the audit will tell you and usually proposes "establish a verification baseline" as the first prompt.

---

## Install

Install directly from the latest release. This needs no catalog setup and is the recommended path:

```bash
specify extension add improve --from https://github.com/d0whc3r/spec-kit-improve/releases/download/v1.0.0/improve-1.0.0.zip
```

Change the version in the URL to pin a different release.

Prefer to install and update by name with `specify extension add improve`? That resolves the extension from Spec Kit's community catalog, which ships as discovery only (`install_allowed: false`). Approve it once, then add and update by name:

```bash
specify extension catalog add https://raw.githubusercontent.com/github/spec-kit/main/extensions/catalog.community.json --name community --install-allowed
specify extension add improve
specify extension update improve
```

If `specify extension add improve` fails with `installation is not allowed from that catalog`, that is why.

After install, the `/speckit.improve` slash command becomes available in your assistant.

---

## The Command

| Command            | Reads                      | Writes                      | Role                                                                            |
| ------------------ | -------------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| `/speckit.improve` | the repository (read-only) | `specs/<spec>/improve/*.md` | Full audit, or one prompt for a named change; a re-run keeps the backlog honest |

The command never modifies source code. All advisor output lands under `specs/<spec-name>/improve/`. Turning a prompt into code belongs to the spec-kit lifecycle (`/speckit.specify` through `/speckit.implement`), and merging is always your decision.

---

## Input and Output Flow

```
 you                               the extension                          specs/<spec>/improve/
 ───                               ─────────────                          ─────────────────────

 /speckit.improve          ──→  recon → audit → vet → confirm   ──→  <plan-name>.md (status TODO)
                                                    │
                                you pick findings ──┘

 /speckit.improve <desc>   ──→  recon → investigate ────────────────→ <plan-name>.md (status TODO)

 /speckit.improve (re-run) ──→  dedupe + drift-refresh ─────────────→ refreshed prompts (or REJECTED)

 then hand off each TODO prompt to the spec-kit lifecycle:

 /speckit.specify <prompt body> ──→ /speckit.clarify ──→ /speckit.plan ──→ /speckit.tasks ──→ /speckit.implement
```

---

## Recommended Order

A typical first run, start to finish:

```
1. /speckit.improve                        (or "quick" to keep it cheap)
2. Reply with the findings to plan         ("plan 1, 3 and 5")
3. Read the prompts in specs/*/improve/    (they are meant to be reviewed)
4. /speckit.specify <prompt body>          (turns one TODO prompt into a spec)
5. /speckit.clarify, /speckit.plan, /speckit.tasks, /speckit.implement
6. Next session: /speckit.improve          (a re-run refreshes drifted prompts)
```

Before a PR, `/speckit.improve branch` does the same thing scoped to just what your branch changes.

---

## Command Details

### `/speckit.improve`

Full workflow: recon the repo, audit it across nine categories (correctness, security, performance, tests, tech debt, dependencies, DX, docs, direction), vet every finding by re-reading the cited code, present a leverage-ordered findings table, and turn your selection into spec prompts.

```text
/speckit.improve
/speckit.improve quick            # hotspots only, top findings
/speckit.improve deep             # every package, every category
/speckit.improve security        # one category, in depth
/speckit.improve branch          # only what the current branch changes
/speckit.improve next            # feature direction, 4-6 grounded suggestions
/speckit.improve --issues        # also publish prompts as GitHub issues
```

Modifiers compose: `quick security`, `deep --issues`.

**A specific change (skip the audit).** Pass a free-form change description instead of a modifier and the command skips discovery: you already know what you want, so it does light recon, investigates just that change, and writes one self-contained prompt for it.

```text
/speckit.improve migrate the config loader to zod
/speckit.improve add rate limiting to the public API --issues
```

### Handing a prompt to spec-kit

A `TODO` prompt is the feature description input for `/speckit.specify`. The prompt is already self-contained, so the handoff is mechanical: invoke `/speckit.specify` with the full prompt body (Objective, Current context, Detailed instructions) as its argument. `/speckit.specify` creates the feature branch and `spec.md`; read the spec against the prompt and fix any gaps forward through `/speckit.clarify` (the core's own job), never by editing source. From there the standard lifecycle takes over: `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`. Implementation belongs to spec-kit core, not to this extension. Once an implementation lands, you may mark the prompt `status: DONE` to keep the backlog readable; nothing sets it automatically.

```text
/speckit.specify <prompt body>
/speckit.specify specs/harden-auth/improve/add-rate-limiting.md   # if your assistant reads the file
```

### Re-running to refresh the backlog

A re-run of `/speckit.improve` keeps the backlog honest; there is no separate reconcile command. Before writing new prompts, the command sweeps the existing `specs/*/improve/*.md`: it dedupes findings already covered by a `TODO` or `DONE` prompt, drift-checks every `TODO` against its `planned_at` SHA and refreshes the ones whose code moved, and marks a prompt `REJECTED` (with a one-line rationale) when the finding no longer holds. `DONE` and `REJECTED` prompts are left as the record.

```text
/speckit.improve
```

---

## The Improve Backlog

All advisor output lives inside `specs/`, scoped to the spec it belongs to:

```
specs/
├── 003-user-auth/                     # an existing feature directory
│   └── improve/
│       └── add-rate-limiting.md       # one spec prompt per improvement
└── harden-auth/                       # a dedicated theme directory
    └── improve/
        ├── rotate-session-tokens.md
        └── add-csrf-protection.md
```

Placement: if an existing feature directory `specs/<NNN-name>/` covers the affected area, the prompt goes in that directory's `improve/` folder. Otherwise the advisor creates a dedicated theme directory (`specs/<theme-slug>/improve/`) that related improvements share.

Each prompt is fully self-contained: an Objective, Current context with `file:line` code excerpts and verified commands, numbered testable Requirements, machine-checkable Acceptance criteria, Scope boundaries, and Risks and notes. Its YAML frontmatter is the status record: `status`, `priority`, `effort`, `risk`, `category`, `depends`, `planned_at` (the commit the prompt was written against, used for drift checks), and `issue`. Status values: TODO, DONE, REJECTED.

There is no index file. The command discovers the backlog by globbing `specs/*/improve/*.md` and reading frontmatter. If prompts already exist from a previous run, a re-run reconciles instead of duplicating: findings already planned or rejected are skipped, and ordering is encoded through the `priority` and `depends` fields.

---

## Common Refusals

| Situation                               | Behavior                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| You ask it to implement a fix directly  | Declines and points at the prompt; handing it to `/speckit.specify` is how it becomes code.     |
| The audit finds credentials in the repo | Reports `file:line` and credential type only; never the value. Recommends rotation.             |
| A re-run finds a prompt's code drifted  | Re-verifies the finding, refreshes the excerpts, and bumps `planned_at`; never leaves it stale. |
| A re-run finds the premise is gone      | Marks the prompt `REJECTED` with a one-line rationale.                                          |
| `branch` on the default branch          | Says so and offers a full audit instead.                                                        |
