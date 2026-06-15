# After the prompts: handoff and issues

The advisor's job ends at the prompt. `/speckit.improve` writes self-contained spec prompts under `specs/<spec-name>/improve/`; this file covers the two things that happen next: handing a prompt to the spec-kit lifecycle, and publishing prompts as GitHub issues with the `--issues` modifier.

The founding rule survives unchanged: **the advisor never edits source code.** `/speckit.improve` writes only under `specs/<spec-name>/improve/`. Turning a prompt into source changes belongs to the spec-kit core lifecycle: `/speckit.specify` generates the spec, `/speckit.clarify` resolves ambiguity, `/speckit.plan` and `/speckit.tasks` design the work, `/speckit.implement` executes it.

---

## Handoff: hand a prompt to spec-kit

A `TODO` prompt is the feature description input for `/speckit.specify`. The prompt is already self-contained, so the handoff is mechanical, but report it clearly so the user knows the exact next steps.

1. **Confirm the prompt is current.** A prompt is a frozen snapshot of the code at its `planned_at` SHA. If time has passed since it was written, re-running `/speckit.improve` first refreshes any drifted prompts (see "Re-running on an existing backlog" in the command); never hand a stale prompt to `/speckit.specify`.
2. **Invoke `/speckit.specify`** with the full prompt body (Objective, Current context, Detailed instructions) as its argument. If the host agent cannot invoke another command directly, print the exact `/speckit.specify` invocation with the prompt body inlined for the user to run.
3. **Verify the generated spec.** `/speckit.specify` creates the feature branch and `spec.md`. Read it against the prompt: every requirement encoded, every acceptance criterion represented in the success criteria, scope boundaries respected. Flag anything dropped or distorted; fix forward through `/speckit.clarify`, never by editing source. This is the core's own job, so lean on `/speckit.clarify` and `/speckit.analyze` rather than re-deriving the check here.
4. **Carry it through the lifecycle.** The standard order, all outside the improve extension: `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`. The improve extension stops at the prompt; implementation, review, and merging belong to the spec-kit lifecycle and the user.

Optional bookkeeping: once a prompt's implementation has landed, the user may mark its frontmatter `status: DONE` to keep the backlog readable. Nothing requires it; git history and the `specs/` tree are the system of record.

---

## Issues: publish prompts as GitHub issues

`--issues` is a modifier on `/speckit.improve` (`/speckit.improve --issues`, `/speckit.improve security --issues`). The flag is the user's authorization to create issues. Never create them without it.

1. Preflight: `gh auth status` succeeds and the repo has a GitHub remote. If either fails, write the prompt files as normal and say why issues were skipped.
2. Visibility check: `gh repo view --json visibility`. If the repo is **public**, warn the user that issues are publicly visible and get explicit confirmation before publishing any prompt that describes a security vulnerability, credential location, or other sensitive finding.
3. Show the list of titles about to become issues; confirm once if interactive.
4. Per prompt: `gh issue create --title "<prompt title>" --body-file <prompt file>`. Labels: `improve` plus the category. Apply only if the labels exist or can be created without erroring; skip labels rather than fail.
5. Record each issue URL in the prompt's `issue` frontmatter field.

The prompt file remains the source of truth; the issue is distribution. The self-containment rule pays off here: the issue body needs no edits to make sense to whoever (or whatever) picks it up.
