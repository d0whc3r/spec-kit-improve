# Spec Prompt Template

Every improvement the advisor identifies becomes a **spec prompt**: a markdown file written to be processed by the spec-kit lifecycle. The prompt is the input `/speckit.specify` uses to generate the feature spec; `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, and `/speckit.implement` take it from there.

The consumer of a spec prompt has **zero context**: it has not seen the advisor session, the audit, the other prompts, or any prior conversation. Three properties make a prompt processable with nothing else:

1. **Self-contained context**: everything needed is in the file: affected files, code excerpts, conventions, commands.
2. **Testable requirements**: every requirement and acceptance criterion can be checked, not judged.
3. **Hard boundaries**: an explicit out-of-scope list, so the spec generated from the prompt does not sprawl into adjacent code.

## File placement and naming

Prompts live inside `specs/`, scoped to the spec they belong to:

```
specs/<spec-name>/improve/<NNN>-<plan-name>.md
```

Placement rules:

- If an existing feature directory `specs/<NNN-name>/` covers the area the improvement touches, place the prompt in that directory's `improve/` folder.
- Otherwise create a dedicated space: `specs/<theme-slug>/improve/`. Related improvements share the theme directory, e.g. `specs/harden-auth/improve/001-rotate-session-tokens.md` and `specs/harden-auth/improve/002-add-csrf-protection.md`.
- `<plan-name>` is a short imperative slug. `<NNN>` is a zero-padded execution-order prefix (see below).

There is no central index file. `/speckit.improve` discovers the backlog by globbing `specs/*/improve/*.md` and reading frontmatter.

### Execution-order prefix

The `<NNN>` prefix tells the reader which prompt to run first when an `improve/` folder holds several. It is derived, not authored: it renders the order already encoded by `depends` and `priority`, so it can never contradict them.

- Number a folder's `TODO` prompts only when it holds two or more. A lone prompt takes no prefix; there is nothing to order it against.
- The order is a topological sort of the `depends` graph (every dependency comes before the prompt that needs it), tie-broken by `priority` (P1 before P2 before P3), then by leverage.
- `DONE` and `REJECTED` prompts are out of the run queue: leave their filenames as they are, never renumber them.
- The prefix is positional, so `/speckit.improve` reassigns it on every re-run as the backlog shifts (a new prompt slots in, a finished one drops out). Because `depends` references siblings by their `<plan-name>` slug, not by path, renaming never breaks a dependency link.
- The prefix is scoped to its own `improve/` folder, not global. The `TODO` prompts in one folder run `001..N` contiguously, with no gaps or duplicates; two different folders may each start at `001`, which is not a collision. It is **not** spec-kit's feature number: `/speckit.specify` assigns the global `specs/<NNN>-name/` directory number from its own sequential counter when a prompt becomes a spec, so do not try to align the prefix with existing spec directories. On re-run, rescan the folder's existing prefixes and renumber the whole `TODO` set rather than guessing the next free number.

## Frontmatter

Every prompt starts with this YAML frontmatter. It is the prompt's status record:

```yaml
---
status: TODO # TODO | DONE | REJECTED
priority: P1 # P1 | P2 | P3
effort: M # S | M | L
risk: LOW # LOW | MED | HIGH
category: perf # bug | security | perf | tests | tech-debt | migration | dx | docs | direction
depends: [] # <plan-name> slugs of sibling prompts in this improve/ folder that must be DONE first, e.g. [rotate-session-tokens]
planned_at: abc1234 # short SHA of the commit the prompt was written against
issue: "" # GitHub issue URL, only when published via --issues
---
```

Status meanings: `TODO` (written and ready to hand to `/speckit.specify`), `DONE` (optional: the user marks this once the implementation has landed; nothing sets it automatically), `REJECTED` (with a one-line rationale, e.g. `status: REJECTED # fixed independently`; a re-run of `/speckit.improve` sets this when a prompt's finding no longer holds).

## Template

```markdown
# <Imperative title: what will be true after this improvement lands>

## Objective

What this improvement achieves and why it matters. 2-5 sentences: the
problem, its concrete cost today, and the measurable outcome once the spec
generated from this prompt is implemented. Written so `/speckit.specify` can
derive user scenarios and success criteria directly from it.

## Current context

The facts about the code as it exists today, inlined. Never "as discussed"
or "see audit":

- The affected components and files, each with one line on its role:
  - `src/orders/api.ts`: order-list endpoint; contains the N+1 (lines 130-160)
- Short excerpts of the current code (with `file:line` markers), enough to
  confirm the right location and to survive a drift check.
- The repo conventions that apply, with one exemplar file to match:
  "Error handling follows the Result pattern; see `src/lib/result.ts` and its
  use in `src/users/api.ts:40-60`."
- Any documented vocabulary or design constraints the implementation must
  honor, inlined from the intent/design docs found in recon: the relevant
  `CONTEXT.md` terms to use in names and comments, the `DESIGN.md`
  tokens/components to reuse, or the ADR whose decision this work must stay
  consistent with. Quote the specific lines; the spec author and implementer
  have not read those docs.
- The exact build / test / lint / typecheck commands for this repo
  (verified during recon, not guessed); these become verification gates in
  the generated spec and tasks.

## Detailed instructions

The requirements and acceptance criteria the generated spec must encode.

### Requirements

Numbered, testable statements of WHAT must change, not how:

- R1: The order-list endpoint resolves customer names in a single query.
- R2: The public response shape does not change; clients depend on it.

### Acceptance criteria

Machine-checkable where possible. ALL must hold for this prompt to be DONE:

- [ ] `pnpm test -- orders` passes, including a new regression test for <X>
- [ ] `grep -rn "<old pattern>" src/` returns no matches
- [ ] <observable behavior>: <command or check> -> <expected result>

### Scope boundaries

**In scope**: the only areas the implementation should touch.

- `src/orders/api.ts`
- `src/orders/api.test.ts` (create)

**Out of scope**: things that look related but must not change, each with a
one-line reason:

- `src/orders/legacy-api.ts`: deprecated path, v1 clients still pinned to it.
- Any change to the public response shape.

### Risks and notes

Anything the spec author and implementer should know: assumptions that could
be false (and what to do if they are), future changes that will interact with
this, what a reviewer should scrutinize.
```

## Quality bar: check before finishing each prompt

- Could `/speckit.specify` generate a correct spec from this file plus the repo alone? If anything requires knowledge from the advisor session, inline that knowledge.
- Is every requirement a testable statement, and every acceptance criterion a command or check with an expected result, not a judgment ("make sure it works")?
- Does the Current context name exact files and symbols with `file:line` markers, and do the excerpts match the live code at `planned_at`?
- Are the scope boundaries explicit enough that the generated spec will not sprawl into adjacent code?
- No secret values anywhere in the file; locations and credential types only.
- `planned_at` SHA is filled in, and every slug in `depends` resolves to a sibling prompt in the same `improve/` folder.
