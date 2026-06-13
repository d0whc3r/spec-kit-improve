# Workflow

The extension runs one loop: audit the codebase, pick the findings worth
fixing, get spec prompts written, hand them to the spec-kit lifecycle, and
re-run `/speckit.improve` to refresh the backlog next session. This page covers
the loop, the `specs/<spec>/improve/` backlog it produces, and the status
lifecycle that keeps it truthful.

## Input and output flow

```
 you                               the extension                     specs/<spec>/improve/
 ---                               -------------                     ---------------------

 /speckit.improve          -->  recon > audit > vet > confirm --> <NNN>-<plan-name>.md (status TODO)
                                                    |
                                you pick findings --+

 /speckit.improve <desc>   -->  recon > investigate ------------> <NNN>-<plan-name>.md (status TODO)

 /speckit.improve (re-run) -->  dedupe + drift-refresh ---------> refreshed prompts (or REJECTED)

 then hand off each TODO prompt to the spec-kit lifecycle:

 /speckit.specify <prompt body> --> /speckit.clarify --> /speckit.plan --> /speckit.tasks --> /speckit.implement
```

No command modifies source code. All advisor output lands under
`specs/<spec-name>/improve/`. Turning a prompt into code belongs to the
spec-kit lifecycle (`/speckit.specify` through `/speckit.implement`), and
merging is always your decision.

## The loop, step by step

1. **Audit.** `/speckit.improve` recons the repo, audits it across nine
   categories, vets every finding against the actual code, and presents a
   leverage-ordered findings table with `file:line` evidence.
2. **Pick findings.** The advisor suggests the top 3 to 5 and surfaces
   dependency ordering (for example, characterization tests before the
   refactor they protect). Reply with your selection: "plan 1, 3 and 5".
3. **Prompts.** One self-contained spec prompt per selected finding, placed
   under `specs/<spec>/improve/`. Read them; they are meant to be reviewed.
4. **Hand off.** A `TODO` prompt is the feature description for
   `/speckit.specify`: invoke it with the prompt body, then carry the generated
   spec through the standard lifecycle: `/speckit.clarify`, `/speckit.plan`,
   `/speckit.tasks`, `/speckit.implement`.
5. **Re-run.** Next session, a re-run of `/speckit.improve` refreshes what
   drifted, retires what was fixed independently, and dedupes against the
   prompts already on disk before writing anything new.

A typical first run, start to finish:

```
1. /speckit.improve                        (or "quick" to keep it cheap)
2. Reply with the findings to plan         ("plan 1, 3 and 5")
3. Read the prompts in specs/*/improve/    (they are meant to be reviewed)
4. /speckit.specify <prompt body>          (turns one TODO prompt into a spec)
5. /speckit.clarify, /speckit.plan, /speckit.tasks, /speckit.implement
6. Next session: /speckit.improve          (a re-run refreshes drifted prompts)
```

Before a PR, `/speckit.improve branch` does the same thing scoped to
just what your branch changes.

## The improve backlog

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

Placement: if an existing feature directory `specs/<NNN-name>/` covers the
affected area, the prompt goes in that directory's `improve/` folder.
Otherwise the advisor creates a dedicated theme directory
(`specs/<theme-slug>/improve/`) that related improvements share. Prompt names
are short imperative slugs carrying a zero-padded `<NNN>` execution-order
prefix (`001-`, `002-`, ...) when a folder holds two or more TODO prompts; the
order is a topological sort of `depends`, tie-broken by `priority`, and is
reassigned on each re-run.

Each prompt is fully self-contained (Objective, Current context with
`file:line` excerpts and verified commands, numbered requirements,
machine-checkable acceptance criteria, scope boundaries, risks) and carries
YAML frontmatter as its status record, including the `planned_at` commit it
was written against for mechanical drift checks. See
[Spec Prompt Format](Spec-Prompt-Format.md) for the full anatomy.

There is no index file. Commands discover the backlog by globbing
`specs/*/improve/*.md` and reading frontmatter.

## Status lifecycle

Every prompt has one `status` in its frontmatter:

| Status   | Meaning                                              | Set by                                       |
| -------- | ---------------------------------------------------- | -------------------------------------------- |
| TODO     | Written and ready to hand to `/speckit.specify`.     | The advisor, when the prompt is written.     |
| DONE     | Optional. The implementation has landed.             | You, by hand; nothing sets it automatically. |
| REJECTED | Finding no longer holds, with one line of rationale. | A re-run of `/speckit.improve`.              |

A re-run of `/speckit.improve` is what moves stale prompts forward: it
drift-checks TODOs (refreshing their excerpts and `planned_at` SHA, or marking
them REJECTED if the finding is gone). `DONE` is bookkeeping you set once an
implementation lands; nothing in the extension verifies or sets it. Prompt
files are never deleted; they are the record.

## Re-running `/speckit.improve`

When prompts already exist, a re-run reconciles instead of duplicating:
findings already covered by a TODO or DONE prompt are not re-planned, findings
matching a REJECTED prompt are not re-surfaced unless new evidence changes the
picture, ordering is encoded through the `priority` and `depends` fields, and
the folder's `<NNN>` filename prefixes are renumbered to match.
Run it as often as you like; the backlog accumulates instead of resetting.
