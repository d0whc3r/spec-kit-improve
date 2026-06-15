# Frequently Asked Questions

## Why does the advisor never implement anything?

Because the prompt is the product. The extension splits the work where the
economics split: an expensive, high-ceiling model does the part where
intelligence compounds (understanding the codebase, judging what matters,
specifying the fix), and the spec-kit pipeline does the execution. An advisor
that "just fixes it while it's in there" burns the expensive model on the
cheap part, and leaves nothing behind that the lifecycle, another agent, or a
human can pick up, review, or re-run.

It is also a safety property: a tool that only ever writes to
`specs/<spec-name>/improve/` cannot break your build, your tests, or your git
history.

## Why must every prompt work with zero context?

Because its consumer has none. `/speckit.specify` has not seen the advisor
session, the audit, or any other prompt. A prompt processable with zero
context is a prompt with no hidden assumptions: all context inlined, numbered
testable requirements, acceptance criteria that are commands with expected
results, and hard scope boundaries. Writing to that bar forces the advisor to
fully resolve the problem instead of leaving "you know what I mean" gaps. The
same properties are exactly what make the prompt reviewable by a human.

## How is this different from just asking my agent to fix things?

Asking an agent to fix things couples three jobs into one session: deciding
what is worth doing, specifying it, and doing it. You get one diff, produced
by one model, with the reasoning gone when the session ends. The improve loop
separates them: the audit produces a vetted, evidence-backed list of what is
worth doing; the prompts capture the specification durably in your repo; and
execution flows through the spec-kit lifecycle, where the spec, the plan, and
the tasks are all reviewable artifacts. You also get a review step in the
middle, which is where most bad changes should die.

## Can I hand prompts to humans?

Yes. Self-containment cuts both ways: a prompt that needs no session context
for `/speckit.specify` needs none for a person either. The Objective plus the
Acceptance criteria read as a normal engineering task description, and the
requirements, scope boundaries, and risks are what a careful senior engineer
would write in a good ticket. The `--issues` modifier exists for exactly this:
it publishes each prompt as a GitHub issue, body unedited.

## Who turns a prompt into code?

The spec-kit lifecycle. Hand a `TODO` prompt's body to `/speckit.specify`,
which generates the feature spec; then carry it through `/speckit.clarify`
(which resolves any gap the spec dropped), `/speckit.plan`, `/speckit.tasks`,
and `/speckit.implement`. Implementation belongs to spec-kit core, not to this
extension. The prompt is self-contained, so the handoff is just pasting the
prompt body into `/speckit.specify`; it carries everything it needs.

## What happens to secrets found during an audit?

The finding reports the `file:line` and the credential type only ("Stripe live
key at `config.ts:12`"), never the value, because findings and prompts get
committed. The fix sketch always includes rotation, not just removal: a
committed secret is burned even after deletion.

## Why did `specify extension add improve` fail with a catalog error?

Spec Kit ships the community catalog as discovery only
(`install_allowed: false`), so it lists the extension but will not install it
until you opt in. The quickest fix is a direct install:

```bash
specify extension add improve --from https://github.com/d0whc3r/spec-kit-improve/releases/download/v1.0.0/improve-1.0.0.zip
```

See [Troubleshooting](Troubleshooting.md#installation-errors) for both opt-in
paths in full.

## Will the extension ever modify my code?

No. The advisor's only writes go under `specs/<spec-name>/improve/`. Code
changes happen through the standard spec-kit lifecycle: `/speckit.specify`
generates the spec, `/speckit.plan` and `/speckit.tasks` design the work, and
`/speckit.implement` executes it, all under your control. The extension stops
at spec creation; it never merges, pushes, or commits to your branch.

## What if my repo has no tests or a broken build?

The audit notices during recon and usually proposes "establish a verification
baseline" as the first prompt, ordered (via `depends`) before any risky one.
Every prompt's acceptance criteria are built on the repo's verification
commands, so a one-command way to know the codebase works is the foundation
the rest of the backlog stands on.

## What happens to prompts after they are done or rejected?

They stay. Prompt files are never deleted; they are the record of what was
done and why. You may mark a prompt `DONE` once its implementation lands;
REJECTED prompts keep one line of rationale in their frontmatter so a re-run of
`/speckit.improve` does not surface the finding again.

## Can prompts become GitHub issues?

Yes, with the explicit `--issues` flag on `/speckit.improve`. Each prompt
is published with its full text as the
issue body, labeled `improve` plus its category, and the issue URL is recorded
in the prompt's `issue` frontmatter field. The prompt file remains the source
of truth; the issue is distribution. Issues are never created without the
flag. If the repo is public, the command warns you first and asks for
confirmation before publishing any prompt that describes a security
vulnerability or a credential location, so a sensitive finding is not exposed
in a public issue by accident.

## How do I update the extension?

If you installed directly with `--from`, rerun the install command with a
newer release URL. If you approved the community catalog, update by name:

```bash
specify extension update improve
```

Either way, your `specs/` tree is untouched; it lives in your repo, not in the
extension directory.
