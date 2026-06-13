# Troubleshooting

Common breakages, refusals that are working as intended, and their fixes.

## Installation errors

### "installation is not allowed from that catalog"

```text
Error: 'improve' is available in the 'community' catalog but installation is
not allowed from that catalog.
```

This is expected behavior, not a broken release. Spec Kit ships the community
catalog as **discovery only**. It carries `install_allowed: false` by design,
so the CLI can list community extensions but will not install one until you
opt in. You have two ways to opt in.

**Option A: install directly (recommended).** No catalog config, always works,
and it is the only way to pin a specific version:

```bash
specify extension add improve --from https://github.com/d0whc3r/spec-kit-improve/releases/download/v0.1.0/improve-0.1.0.zip
```

To update later, rerun the same command with a newer version URL.

**Option B: approve the community catalog.** Do this once if you want to
install and update by name:

```bash
specify extension catalog add https://raw.githubusercontent.com/github/spec-kit/main/extensions/catalog.community.json --name community --install-allowed
specify extension add improve
specify extension update improve
```

Community extensions are author-maintained and not reviewed by Spec Kit.
Review the source before approving a catalog.

### The slash commands do not appear in my assistant

1. Confirm the extension is registered:
   ```bash
   cat .specify/extensions/.registry
   ```
   You should see an `improve` entry.
2. Confirm extension files are present:
   ```bash
   ls .specify/extensions/improve
   ```
   You should see `extension.yml`, `commands/`, `templates/`.
3. Restart the host agent. Some agents cache the slash command surface at
   startup. Open a new chat or reload the agent's window.
4. If it still does not appear, reinstall with the direct URL above.

## Refusals that are working as intended

These are not bugs. Each one is a hard rule doing its job.

| Situation                               | Behavior                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| You ask it to implement a fix directly  | Declines and points at the prompt; handing it to `/speckit.specify` is how it becomes code.     |
| The audit finds credentials in the repo | Reports `file:line` and credential type only; never the value. Recommends rotation.             |
| A re-run finds a prompt's code drifted  | Re-verifies the finding, refreshes the excerpts, and bumps `planned_at`; never leaves it stale. |
| A re-run finds the premise is gone      | Marks the prompt `REJECTED` with a one-line rationale.                                          |
| `branch` on the default branch          | Says so and offers a full audit instead.                                                        |

The advisor never modifies source code, so "just fix it for me" will always be
declined. If you want the change made, hand the prompt body to
`/speckit.specify` and carry the generated spec through the spec-kit lifecycle;
the prompt file is also a complete handoff for another agent or a human.

## "This host agent can't spawn subagents"

The audit phase uses subagents, and it degrades instead of stopping: it audits
directly in category-priority order instead of fanning out one subagent per
category. Findings and prompts are unaffected; the audit is just slower.

Handing a prompt to `/speckit.specify` needs no subagents, but it does need to
invoke another command. If the host agent cannot invoke `/speckit.specify`
directly, print the exact invocation (with the prompt body inlined) and run it
yourself.

## The repo is not a git repository

The planning commands lean on git for the `planned_at` stamp and the
mechanical drift check inside every prompt, so without it the staleness
contract has nothing to anchor to. `/speckit.specify` also creates feature
branches, which requires git. Fix:

```bash
git init
git add -A && git commit -m "baseline"
```

Then rerun the command.

## Prompts have drifted

Symptoms: a prompt's drift check reports changed affected files, or its
"Current context" excerpts no longer match the live code. This is normal;
codebases move under TODO prompts. The fix is to re-run `/speckit.improve`:
before writing anything new it drift-checks every TODO prompt, re-verifies and
refreshes the ones whose code moved (new excerpts, new `planned_at` SHA), and
marks REJECTED any finding that was fixed in passing. Re-run it before handing
a prompt to `/speckit.specify` so a stale prompt is never processed.

## A handoff stalled mid-lifecycle

You handed a prompt to `/speckit.specify` but the lifecycle never finished: no
plan or tasks, or an abandoned branch. The prompt stays `TODO`; nothing in the
extension tracks the generated spec. Pick the spec back up where it stalled
(`/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`),
or, if you are abandoning the change, leave the prompt as-is for a later
handoff. The `specs/<feature>/` tree and git history are the record of what got
generated.

## The audit says there is no verification baseline

The repo has no working one-command way to know the codebase works (no tests,
broken build). The audit records this and usually proposes "establish a
verification baseline" as the first prompt, ordered (via `depends`) before any
risky one. Process that prompt first; every later prompt's acceptance criteria
depend on it.

## `--issues` did not create issues

The flag preflights `gh auth status` and a GitHub remote. If either fails, the
prompt files are still written and the command says why issues were skipped.
Run `gh auth login`, confirm `git remote -v` points at GitHub, and rerun with
`--issues`. Labels (`improve` plus the category) are applied only if they
exist or can be created without erroring; missing labels are skipped, never a
failure.

## Filing a bug

When a command misbehaves in a way this page does not explain, file a bug
with:

- Extension version: `grep version .specify/extensions/improve/extension.yml`.
- Spec Kit core version: `specify --version`.
- Host agent name and version.
- The exact command invocation, including modifiers.
- What the command did versus what you expected.

Issues: <https://github.com/d0whc3r/spec-kit-improve/issues>. For security
issues, use private vulnerability reporting instead; see
[SECURITY.md](../SECURITY.md).
