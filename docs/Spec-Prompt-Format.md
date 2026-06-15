# Spec Prompt Format

Every improvement the advisor identifies becomes a **spec prompt**: a markdown
file written to be processed by the spec-kit lifecycle. The prompt is the
input `/speckit.specify` uses to generate the feature spec; `/speckit.clarify`,
`/speckit.plan`, `/speckit.tasks`, and `/speckit.implement` take it from
there.

The consumer of a spec prompt has **zero context**: it has not seen the
advisor session, the audit, the other prompts, or any prior conversation. The
format exists so the prompt works with nothing else.

The authoritative template ships with the extension:
[`templates/improve-spec-prompt-template.md`](../templates/improve-spec-prompt-template.md).
For a filled-in prompt, see [Examples](Examples.md).

## The three properties

1. **Self-contained context.** Everything needed is in the file: affected
   files, code excerpts, conventions, commands. If anything requires knowledge
   from the advisor session, that knowledge gets inlined.
2. **Testable requirements.** Every requirement and acceptance criterion can
   be checked, not judged.
3. **Hard boundaries.** An explicit out-of-scope list, so the spec generated
   from the prompt does not sprawl into adjacent code.

## File placement and naming

Prompts live inside `specs/`, scoped to the spec they belong to:

```
specs/<spec-name>/improve/<NNN>-<plan-name>.md
```

- If an existing feature directory `specs/<NNN-name>/` covers the area the
  improvement touches, the prompt goes in that directory's `improve/` folder.
- Otherwise the advisor creates a dedicated theme directory:
  `specs/<theme-slug>/improve/`. Related improvements share the
  theme directory, for example `specs/harden-auth/improve/001-rotate-session-tokens.md`
  and `specs/harden-auth/improve/002-add-csrf-protection.md`.
- `<plan-name>` is a short imperative slug. `<NNN>` is a zero-padded
  execution-order prefix, applied to a folder's `TODO` prompts only when it
  holds two or more: a topological sort of `depends` (dependencies first),
  tie-broken by `priority`. It is derived from the frontmatter, never
  contradicts it, and is reassigned on each re-run; a lone prompt takes no
  prefix. `depends` references siblings by their `<plan-name>` slug, so
  renumbering never breaks a link.
- The prefix is scoped to its own `improve/` folder (contiguous `001..N`
  there, and two folders may each start at `001`). It is not spec-kit's global
  `specs/<NNN>-name/` feature number, which `/speckit.specify` assigns from its
  own sequential counter when a prompt becomes a spec, so it never aligns with
  the existing spec directories and cannot collide with them.

There is no central index file. Commands discover the backlog by globbing
`specs/*/improve/*.md` and reading frontmatter.

## Frontmatter

Every prompt starts with YAML frontmatter. It is the prompt's status record:

```yaml
---
status: TODO # TODO | DONE | REJECTED
priority: P1 # P1 | P2 | P3
effort: M # S | M | L
risk: LOW # LOW | MED | HIGH
category: perf # bug | security | perf | tests | tech-debt | migration | dx | docs | direction
depends: [] # <plan-name> slugs of sibling prompts that must be DONE first
planned_at: abc1234 # short SHA of the commit the prompt was written against
issue: "" # GitHub issue URL, only when published via --issues
---
```

Status meanings:

| Status   | Meaning                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------- |
| TODO     | Written and ready to hand to `/speckit.specify`.                                                     |
| DONE     | Optional. You set it once the implementation has landed; nothing sets it automatically.              |
| REJECTED | A re-run of `/speckit.improve` sets this when a finding no longer holds, with one line of rationale. |

The `planned_at` SHA is the drift contract: a re-run of `/speckit.improve` can
mechanically check whether the codebase changed under the prompt with one
`git diff --stat <planned_at>..HEAD -- <affected paths>`.

## Section by section

### Title

An imperative title: what will be true after the improvement lands.

### Objective

What this improvement achieves and why it matters. 2 to 5 sentences: the
problem, its concrete cost today, and the measurable outcome once the spec
generated from this prompt is implemented. Written so `/speckit.specify` can
derive user scenarios and success criteria directly from it.

### Current context

The facts about the code as it exists today, inlined. Never "as discussed" or
"see audit":

- The affected components and files, each with one line on its role.
- Short excerpts of the current code (with `file:line` markers), enough to
  confirm the right location and to survive a drift check.
- The repo conventions that apply, with one exemplar file to match.
- Any documented vocabulary or design constraints the implementation must
  honor, quoted from the intent and design docs found during recon (the
  relevant `CONTEXT.md` terms, `DESIGN.md` tokens or components, or the ADR the
  work must stay consistent with), since the spec author and implementer have
  not read those docs.
- The exact build / test / lint / typecheck commands for this repo (verified
  during recon, not guessed); these become verification gates in the
  generated spec and tasks.

### Detailed instructions

The requirements and acceptance criteria the generated spec must encode, in
four parts:

**Requirements.** Numbered, testable statements of WHAT must change, not how:

```markdown
- R1: The order-list endpoint resolves customer names in a single query.
- R2: The public response shape does not change; clients depend on it.
```

**Acceptance criteria.** Machine-checkable where possible. All must hold for
the prompt to be DONE:

```markdown
- [ ] `pnpm test -- orders` passes, including a new regression test for <X>
- [ ] `grep -rn "<old pattern>" src/` returns no matches
- [ ] <observable behavior>: <command or check> -> <expected result>
```

**Scope boundaries.** Two lists. In scope: the only areas the implementation
should touch. Out of scope: things that look related but must not change, each
with a one-line reason (deprecated paths, behavior other code depends on,
public contracts).

**Risks and notes.** Anything the spec author and implementer should know:
assumptions that could be false (and what to do if they are), future changes
that will interact with this, what a reviewer should scrutinize.

## The quality bar

Every prompt is checked against this list before it is finished. The handoff
relies on it: `/speckit.specify` consumes the prompt with zero context, so any
gap here becomes a gap in the generated spec for `/speckit.clarify` to catch.

- Could `/speckit.specify` generate a correct spec from this file plus the
  repo alone? If anything requires knowledge from the advisor session, inline
  that knowledge.
- Is every requirement a testable statement, and every acceptance criterion a
  command or check with an expected result, not a judgment ("make sure it
  works")?
- Does the Current context name exact files and symbols with `file:line`
  markers, and do the excerpts match the live code at `planned_at`?
- Are the scope boundaries explicit enough that the generated spec will not
  sprawl into adjacent code?
- No secret values anywhere in the file; locations and credential types only.
- The `planned_at` SHA is filled in, and every slug in `depends` resolves to a
  sibling prompt in the same `improve/` folder.
