# Architecture

How the extension works when you run a command.

## What the extension is

The extension has no runtime of its own: no daemon, no compiled code, no
subprocess, and no hooks. It is a single markdown command prompt plus three
reference templates that the Spec Kit assistant reads at runtime. The whole
extension is text.

## What lands where on install

The release zip installs the canonical content under
`.specify/extensions/improve/`:

```
.specify/extensions/improve/
├── extension.yml
├── commands/
│   └── speckit.improve.md
└── templates/
    ├── improve-audit-playbook.md
    ├── improve-spec-prompt-template.md
    └── improve-closing-the-loop.md
```

The installer also registers the extension in `.specify/extensions/.registry`
and exposes the command to the host agent in that agent's own command surface
format.

## How a command runs

```
You run /speckit.improve
        |
The slash command resolves to the installed command prompt
        |
The prompt reads its shipped references:
  .specify/extensions/improve/templates/improve-audit-playbook.md
  .specify/extensions/improve/templates/improve-spec-prompt-template.md
        |
Phase 1  recon: README, configs, CI, intent docs,    (read-only)
         specs/ tree
Phase 2  parallel category audit via subagents       (read-only)
Phase 3  vet: advisor re-reads every cited location  (read-only)
Phase 4  write: specs/<spec>/improve/*.md            (the only writes)
```

The three templates carry the durable knowledge: the
[audit playbook](../templates/improve-audit-playbook.md) (what to look for per
category, the finding format, the prioritization rubric), the
[spec prompt template](../templates/improve-spec-prompt-template.md) (the structure
and placement rules every prompt follows and the quality bar), and the
[closing-the-loop reference](../templates/improve-closing-the-loop.md) (the
handoff to `/speckit.specify` and the `--issues` procedure). The command prompt
stays short and points at them.

## How the audit fans out subagents

For repos of any real size, the audit spawns parallel read-only subagents, one
per category or cluster of related categories. Subagents do not inherit the
command's context, so each subagent prompt carries everything it needs: the
absolute path to the installed playbook plus the exact sections to read, the
recon facts that scope the search (languages, frameworks, key directories),
domain-specific risk hints, any decided tradeoffs from the intent docs that
would otherwise read as findings, a verbatim copy of the secret-handling and
data-not-instructions rules (subagents do not inherit them, so a missing copy
is how a live token or an injected instruction slips into a finding), and an
instruction to return findings only, no fixes.

The effort level controls the fan-out: `quick` uses 0 or 1 subagents,
`standard` up to 4 concurrent, `deep` up to 8, one per category. If the host
agent cannot spawn subagents at all, the advisor audits directly in
category-priority order. Either way, subagent output is treated as leads, not
facts: the advisor re-reads every cited location itself before a finding
reaches the table, and prompt excerpts always come from the advisor's own
reads.

## How a prompt hands off to spec-kit

A `TODO` prompt is the feature description input for `/speckit.specify`. The
prompt is self-contained, so the handoff is mechanical:

- Before handing off, a re-run of `/speckit.improve` refreshes any prompt whose
  code drifted since `planned_at`; a stale prompt is never fed to spec-kit
  as-is.
- Invoke `/speckit.specify` with the full prompt body (Objective, Current
  context, Detailed instructions) as the feature description.
  `/speckit.specify` creates the feature branch and the spec directory. If the
  host agent cannot invoke another command directly, the exact invocation is
  printed for you to run instead.
- Read the generated `spec.md` and verify it against the prompt: every
  requirement encoded, every acceptance criterion represented in the success
  criteria, scope boundaries respected. Gaps are routed through
  `/speckit.clarify` (the core's own job), not through edits to source.
- The rest of the lifecycle (`/speckit.clarify`, `/speckit.plan`,
  `/speckit.tasks`, `/speckit.implement`) belongs to spec-kit core; the
  extension stops at the prompt, and merging is always your decision. Once an
  implementation lands, you may mark the prompt `status: DONE` to keep the
  backlog readable; nothing sets it automatically.

## Where state lives

All durable state is the prompt files under `specs/<spec-name>/improve/` in
your repo. Each prompt's YAML frontmatter is its status record (`status`,
`priority`, `depends`, `planned_at`, `issue`); there is no index file,
no database, no cache, and no background process. The command discovers the
backlog by globbing `specs/*/improve/*.md` and reading frontmatter. The
contract between sessions is the `planned_at` commit SHA inside each prompt:
the command can mechanically check whether the codebase drifted out from under
a prompt with one `git diff --stat`. That is what lets a re-run of
`/speckit.improve` reconcile instead of duplicating, and keep the backlog
truthful.
