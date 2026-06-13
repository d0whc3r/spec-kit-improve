# Commands

Deep reference for the `/speckit.improve` command. The canonical command
definition lives in [`commands/`](../commands/) in the repo; this page
describes its behavior from the user's side.

## Rules the command always follows

1. **Never modify source code.** The only files the advisor creates or
   modifies live under `specs/<spec-name>/improve/` (created if absent).
   Turning a prompt into code belongs to the spec-kit lifecycle, and merging
   is always your decision.
2. **Never run commands that mutate your working tree.** No installs, no
   builds that write artifacts outside ignored dirs, no git commits, no
   formatters. Read, search, and read-only analysis only (for example
   `tsc --noEmit`, lint in check mode, `npm audit`). One scoped exception:
   `gh issue create` under an explicit `--issues` flag.
3. **Every prompt is fully self-contained.** The spec-kit pipeline has not
   seen the advisor session. A prompt that references "the pattern discussed
   above" is broken.
4. **Never reproduce secret values.** Findings and prompts reference the
   `file:line` and credential type only, and always recommend rotation.

## `/speckit.improve`

Full workflow: recon the repo, audit it across nine categories, vet every
finding by re-reading the cited code, present a leverage-ordered findings
table, and turn your selection into spec prompts.

| Reads                      | Writes                      |
| -------------------------- | --------------------------- |
| the repository (read-only) | `specs/<spec>/improve/*.md` |

```text
/speckit.improve
/speckit.improve quick           # hotspots only, top findings
/speckit.improve deep            # every package, every category
/speckit.improve security       # one category, in depth
/speckit.improve branch         # only what the current branch changes
/speckit.improve next           # feature direction, 4-6 grounded suggestions
/speckit.improve --issues       # also publish prompts as GitHub issues
```

Modifiers compose unless stated otherwise: `quick security`, `deep --issues`.

### The four phases

**Phase 1: Recon (always).** Reads the README, agent context files, root
configs, CI config, and the directory structure, plus the existing `specs/`
tree (which feature directories exist and which already have an `improve/`
folder; this decides where each prompt lives). Identifies languages,
frameworks, the exact build / test / lint / typecheck commands (these become
verification gates in every prompt), and repo conventions that prompts tell
spec-kit to match. If the repo has no working verification command, that is
recorded; "establish a verification baseline" is often finding #1.

**Phase 2: Audit (parallel).** Audits across the categories defined in the
shipped [audit playbook](../templates/improve-audit-playbook.md):
correctness/bugs, security, performance, test coverage, tech debt and
architecture, dependencies and migrations, DX and tooling, docs, and direction
(features and what to build next). For repos of any real size, the advisor
fans out parallel read-only subagents, one per category or cluster. If the
host agent cannot spawn subagents, it audits directly in category-priority
order. Every finding needs evidence (`file:line`), impact, effort (S/M/L),
fix risk, and confidence.

**Phase 3: Vet, prioritize, confirm.** Subagents over-report, so the advisor
re-reads every cited location before presenting anything. Three failure
classes get filtered: by-design behavior reported as a bug or vulnerability,
mis-attributed evidence (real finding, wrong file or line), and duplicates.
Rejections are listed in the final report so they are not re-audited next run.
The advisor also reads the frontmatter of every existing prompt under
`specs/*/improve/`: findings already covered by a TODO or DONE
prompt are not re-planned, and REJECTED findings are not re-surfaced. The
vetted table is ordered by leverage (impact / effort, weighted by confidence).
Direction findings are presented separately, after the table, as options with
trade-offs rather than problems ranked against bugs. The advisor then asks
which findings to turn into prompts (default suggestion: the top 3 to 5) and
surfaces dependency ordering. If running non-interactively, it writes prompts
for the top 3 to 5 by leverage and records that default in the final report.

**Phase 4: Write the spec prompts.** One prompt per selected finding,
following the shipped [prompt template](../templates/improve-spec-prompt-template.md)
and its placement rules: an improvement that touches the area of an existing
feature directory goes in that directory's `improve/` folder; anything else
gets a dedicated theme directory (`specs/<theme-slug>/improve/`) shared by
related improvements. Code excerpts come from the advisor's own reads, never
from a subagent's report. Every prompt stamps the commit it was written
against (`git rev-parse --short HEAD`) in its `planned_at` frontmatter field,
used for drift detection. The phase ends with a report: each prompt's path,
the recommended execution order with dependencies, what was considered and
rejected, and the suggested next step. See
[Spec Prompt Format](Spec-Prompt-Format.md) for what goes inside each prompt.

If prompts already exist from a previous run, the audit reconciles instead of
duplicating: findings already planned or rejected are skipped, ordering is
encoded through the `priority` and `depends` fields, and each touched folder's
`<NNN>` filename prefixes are renumbered to match.

### Effort modifiers: `quick` and `deep`

|            | `quick`                                        | `standard` (default)                                      | `deep`                                        |
| ---------- | ---------------------------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| Coverage   | Recon hotspots only: high-churn, critical code | Hotspot-weighted, key packages                            | Whole repo, every package                     |
| Subagents  | 0-1 (sweep directly when feasible)             | Up to 4 concurrent                                        | Up to 8 concurrent, one per category          |
| Breadth    | Medium                                         | Very thorough for correctness + security, medium for rest | Very thorough everywhere                      |
| Categories | correctness, security, tests                   | all nine                                                  | all nine                                      |
| Findings   | top ~6, HIGH-confidence only                   | full table                                                | full table incl. LOW-confidence "investigate" |

Whatever the level, the final report says what was _not_ audited.

### Focus categories

Pass one of `security`, `perf`, `tests`, `bugs`, `tech-debt`, `deps`, `dx`,
`docs` to run recon, then audit only that category in depth, then write
prompts.

### `branch`

Audits only the current working branch's changes: the files changed since the
merge-base with the default branch, plus their direct importers and callers.
Light recon, all categories, usually no subagents. Every finding is tagged
`introduced` (by this branch) or `pre-existing` (in touched files), and the
table separates them, so the branch is not blamed for legacy debt. If you are
on the default branch or zero commits ahead, the command says so and offers a
full audit instead. Run this before opening a PR.

### `next`

Aliases: `features`, `roadmap`. Runs recon, then audits only the direction
category, in more depth: 4 to 6 grounded suggestions, each with evidence from
the repo itself, trade-offs, and a coarse effort estimate. Selected ones
become design/spike prompts (investigate, prototype, define the API, list open
questions), not build-everything prompts.

### `--issues`

Also publishes each written prompt as a GitHub issue. The flag is your
authorization; issues are never created without it. Preflight: `gh auth
status` must succeed and the repo must have a GitHub remote; if either fails,
the prompt files are written as normal and the command says why issues were
skipped. Each issue gets the prompt title and the prompt file as its body,
labels `improve` plus the category (skipped rather than failed if a label
cannot be created), and its URL recorded in the prompt's `issue` frontmatter
field. The prompt file remains the source of truth; the issue is distribution.

### A specific change (skip the audit)

Pass a free-form change description instead of a modifier and the audit skips
discovery and prioritization: you already know what you want, so it produces one
self-contained prompt for exactly that change.

```text
/speckit.improve migrate the config loader to zod
/speckit.improve add rate limiting to the public API --issues
```

To pick the mode, the command strips the recognized modifiers and category
keywords from the input; substantive free-form text that remains triggers this
targeted scope, otherwise the full discovery audit runs.

How it works:

1. **Recon, scoped to the change**: reads the README, agent context files, root
   configs, and the existing `specs/` tree (to decide placement); identifies the
   exact verification commands and the conventions that apply to the area being
   changed, with one exemplar file to match.
2. **Investigate**: reads the files the change touches, traces callers and
   dependents, and confirms the current state first-hand. If the description is
   too ambiguous to specify honestly, the advisor first resolves each ambiguity
   from the codebase itself; only what is left becomes questions to you, asked
   one at a time, each with a recommended answer.
3. **Write**: one prompt file into `specs/<spec-name>/improve/<NNN>-<plan-name>.md`
   following the template's placement rules, stamped with the current commit in
   `planned_at`, written so `/speckit.specify` cannot get it wrong. If related
   prompts already exist in the target folder, ordering is encoded through
   `depends` (by sibling slug) and the folder's `<NNN>` prefixes are renumbered;
   a lone prompt in a fresh folder takes no prefix.
4. **Report**: the prompt path, a one-paragraph summary, and any assumptions you
   should confirm before processing it.

If the investigation shows the change is unnecessary or harmful, the advisor
says so and recommends against it instead of writing a prompt for it.

## Handing a prompt to spec-kit

A `TODO` prompt is the feature description input for `/speckit.specify`. The
prompt is already self-contained, so the handoff is mechanical. The improve
extension stops at the prompt; the advisor never edits source itself, and never
merges, pushes, or commits to your branch.

1. **Confirm the prompt is current.** A prompt is a frozen snapshot of the code
   at its `planned_at` SHA. If time has passed since it was written, re-run
   `/speckit.improve` first to refresh any drifted prompts (see
   [Re-running to refresh the backlog](#re-running-to-refresh-the-backlog)
   below); never hand a stale prompt to `/speckit.specify`.
2. **Invoke `/speckit.specify`** with the full prompt body (Objective, Current
   context, Detailed instructions) as its argument. `/speckit.specify` creates
   the feature branch and `spec.md`. If the host agent cannot invoke another
   command directly, print the exact invocation with the prompt body inlined
   for you to run.
3. **Verify the generated spec.** Read `spec.md` against the prompt: every
   requirement encoded, every acceptance criterion represented in the success
   criteria, scope boundaries respected. The prompt was written so a zero-context
   consumer cannot get it wrong, but the core has its own check for what slips
   through: lean on `/speckit.clarify` (and `/speckit.analyze`) to resolve any
   gap, never on edits to source.
4. **Carry it through the lifecycle.** The standard order, all outside the
   improve extension: `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`,
   `/speckit.implement`. Implementation belongs to spec-kit core, not to this
   extension.

```text
/speckit.specify <prompt body>
```

Optional bookkeeping: once a prompt's implementation has landed, you may set its
frontmatter `status: DONE` to keep the backlog readable. Nothing requires it;
git history and the `specs/` tree are the system of record.

## Re-running to refresh the backlog

A re-run of `/speckit.improve` is also how the backlog stays honest over time;
there is no separate command for it. After recon, before writing new prompts,
the command sweeps the existing `specs/*/improve/*.md` and reconciles per
status:

| Status   | What a re-run does                                                                                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TODO     | Runs the drift check against `planned_at`. If drifted: re-verifies the finding still holds, then refreshes the "Current context" excerpts and the `planned_at` SHA. If the finding was fixed in passing, marks REJECTED with a one-line rationale. |
| DONE     | Left as the record. Prompt files are never deleted, and their findings are not re-surfaced.                                                                                                                                                        |
| REJECTED | Left as the record so the finding is not re-audited.                                                                                                                                                                                               |

A re-run also dedupes new findings against the existing backlog: anything
already covered by a TODO or DONE prompt is skipped rather than written twice.
The final report says what was refreshed and what was retired alongside any new
prompts. Run `/speckit.improve` as often as you like; the backlog accumulates
instead of resetting.

## Refusal summary

| Situation                               | Behavior                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| You ask it to implement a fix directly  | Declines and points at the prompt; handing it to `/speckit.specify` is how it becomes code.     |
| The audit finds credentials in the repo | Reports `file:line` and credential type only; never the value. Recommends rotation.             |
| A re-run finds a prompt's code drifted  | Re-verifies the finding, refreshes the excerpts, and bumps `planned_at`; never leaves it stale. |
| A re-run finds the premise is gone      | Marks the prompt `REJECTED` with a one-line rationale.                                          |
| `branch` on the default branch          | Says so and offers a full audit instead.                                                        |

More context on each in [Troubleshooting](Troubleshooting.md).
