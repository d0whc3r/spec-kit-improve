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
opt in.

The quickest way past it is the direct install, which needs no catalog config
and is the only way to pin a specific version:

```bash
specify extension add improve --from https://github.com/d0whc3r/spec-kit-improve/releases/download/v1.1.0/improve-1.1.0.zip
```

If you would rather install and update by name, approve the catalog once.
Both paths are written out in
[Getting Started](Getting-Started.md#step-1-install-the-extension). Community
extensions are author-maintained and not reviewed by Spec Kit; review the
source before approving a catalog.

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

The command declines some requests by design. Each refusal and the exact
behavior it produces is listed in
[Commands: Refusal summary](Commands.md#refusal-summary). None of them is a
bug; each is a hard rule doing its job.

What to do when you hit one: the advisor never modifies source code, so "just
fix it for me" will always be declined. If you want the change made, hand the
prompt body to `/speckit.specify` and carry the generated spec through the
spec-kit lifecycle; the prompt file is also a complete handoff for another
agent or a human. If the refusal was a drift or a rejected premise, see
[Prompts have drifted](#prompts-have-drifted) below.

## "This host agent can't spawn subagents"

The audit phase uses subagents, and it degrades instead of stopping: it audits
directly in category-priority order instead of fanning out one subagent per
category. Findings and prompts are unaffected; the audit is just slower.

Handing a prompt to `/speckit.specify` needs no subagents, but it does need to
invoke another command. If the host agent cannot invoke `/speckit.specify`
directly, print the exact invocation (with the prompt body inlined) and run it
yourself.

## The repo is not a git repository

`/speckit.improve.run` leans on git for the `planned_at` stamp and the mechanical
drift check inside every prompt, so without it the staleness contract has
nothing to anchor to. `/speckit.specify` also creates feature
branches, which requires git. Fix:

```bash
git init
git add -A && git commit -m "baseline"
```

Then rerun the command.

## Prompts have drifted

Symptoms: a prompt's drift check reports changed affected files, or its
"Current context" excerpts no longer match the live code. This is normal;
codebases move under TODO prompts. The fix is to re-run `/speckit.improve.run`:
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
`--issues`. On a public repo the command also asks for confirmation before
publishing a prompt that describes a security or credential finding; if you
decline, those issues are skipped while the prompt files stay on disk. Labels
(`improve` plus the category) are applied only if they exist or can be created
without erroring; missing labels are skipped, never a failure.

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
