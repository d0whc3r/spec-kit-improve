# Examples

A real worked example of what the extension produces, shipped in the repo
under [`examples/`](../examples/). The audit ran against a TypeScript monorepo
(a component registry CLI plus its documentation site); the artifact is the
spec prompt that landed in the target repo's `specs/` tree, scoped under
`specs/registry-cli/improve/`.

## The findings table

After recon, a parallel category audit, and a vetting pass, the advisor
presented this leverage-ordered table:

| #   | Finding                                                                              | Category  | Impact | Effort | Risk | Confidence |
| --- | ------------------------------------------------------------------------------------ | --------- | ------ | ------ | ---- | ---------- |
| 1   | Shadow-config resolution duplicated in `search.ts`/`view.ts`, copies already drifted | tech-debt | HIGH   | M      | LOW  | HIGH       |
| 2   | O(n^2) icon migration loop (`migrate-icons.ts:168`)                                  | perf      | MED    | S      | LOW  | HIGH       |
| 3   | Registry fetch swallows HTTP errors, CLI reports "0 components" instead of failing   | bug       | HIGH   | S      | LOW  | HIGH       |
| 4   | No characterization tests on the config resolver feeding findings 1 and 3            | tests     | HIGH   | M      | LOW  | HIGH       |

Things to notice:

- Every finding cites evidence (`migrate-icons.ts:168`), not a vibe.
- The table is ordered by leverage (impact / effort, weighted by confidence),
  not by category or severity label.
- Finding 4 is a dependency: if the user selects the config-resolver refactor,
  the advisor surfaces that characterization tests should land first.

## The rejected findings

The audit also rejected findings during vetting, and recorded why in the final
report so they do not come back next run:

```
- [SEC-01] https_proxy env var "SSRF": by-design. Standard proxy convention,
  every CLI honors it. Not a finding.
- [PERF-03] "Bundle ships moment.js": false attribution. The dependency is
  dev-only and tree-shaken out of the published bundle; verified in the
  build output.
```

These show the two main vetting failure classes: by-design behavior reported
as a vulnerability, and mis-attributed evidence. Subagents over-report; the
advisor re-reads every cited location before anything reaches you.

## Where the prompt landed

The target repo had no existing feature directory covering the CLI, so the
advisor created the dedicated theme space `specs/registry-cli/improve/`; the
prompts for findings #3 and #4 would land in the same folder. With a single
prompt present it carries no number prefix; once #3 and #4 land, the advisor
numbers the folder's TODO prompts (`001-`, `002-`, ...) by execution order.
There is no index file: each prompt is self-indexing through its YAML
frontmatter, which carries status, priority, dependencies, and the commit it
was planned against.

## Anatomy of the prompt

The spec prompt for finding #1 is shipped in full:
[`specs/registry-cli/improve/extract-shadow-config-resolution.md`](../examples/specs/registry-cli/improve/extract-shadow-config-resolution.md).
Read it with spec-kit's eyes, top to bottom:

**Frontmatter.** `status: TODO`, `priority: P1`, `effort: M`, `risk: LOW`,
`category: tech-debt`, an empty `depends` list, and `planned_at: 4f9c2e1`, the
commit the prompt was written against. If in-scope files change after that
commit, the drift check (`git diff --stat 4f9c2e1..HEAD -- <affected paths>`)
catches it before the prompt is processed.

**Objective.** The duplicated logic has already drifted (`search.ts` handles
the `registries` override map, `view.ts` does not), and the next divergence
will be user-visible. Written so `/speckit.specify` can derive user scenarios
and success criteria directly from it.

**Current context.** Exact files with their roles, a short excerpt of the
duplicated code with `file:line` markers, the repo conventions to match with
an exemplar ("helpers are pure functions in `packages/cli/src/utils/`, named
`<verb>-<noun>.ts`, with a colocated test using vitest"), and a table of the
repo's real verification commands with expected results
(`pnpm --filter cli typecheck` -> exit 0). Recon'd, not guessed.

**Requirements.** Five numbered, testable statements of WHAT must change. R3
even flags an intentional behavior change: `view` gains the override handling
it was missing, because the drift is the bug.

**Acceptance criteria.** Machine-checkable, including a grep:
`grep -rn "mergeRegistries" packages/cli/src/commands/` must return no
matches, proving the logic lives only in the new utility.

**Scope boundaries.** In scope: four named files (two created, two modified).
Out of scope, with reasons: the upstream config loader (other commands depend
on its exact behavior), the docs site (re-implements a display-only variant on
purpose), and any change to the CLI's public flags or output shape.

**Risks and notes.** Specific to this prompt's actual risks. The sharpest one:
if `view.test.ts` asserts the _absence_ of override handling, the drift is
load-bearing and the prompt's premise is wrong; stop and report instead of
forcing the change.

## What to take from it

The prompt contains everything `/speckit.specify` needs and nothing it must
guess: context, excerpts, commands, requirements, boundaries, and risks. That
is the bar every prompt is written and reviewed against;
[Spec Prompt Format](Spec-Prompt-Format.md) covers it section by section.
