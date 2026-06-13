# Getting Started

Five minutes from zero to your first spec prompt.

## Prerequisites

- Spec Kit `>= 0.2.0` initialized in your project. Verify with:
  ```bash
  specify --version
  ls .specify
  ```
  The extension hands work to the core lifecycle commands
  (`/speckit.specify`, `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`,
  `/speckit.implement`), so they must be available.
- A git repository. Every prompt stamps the commit it was written against in
  its `planned_at` frontmatter field (for drift detection), and
  `/speckit.specify` creates feature branches, which requires git.
- A working verification command (tests, typecheck, lint) helps a lot: it
  becomes the verification gate inside every prompt. If the repo has none, the
  audit will tell you and usually proposes "establish a verification baseline"
  as the first prompt.

If you do not have a Spec Kit project yet:

```bash
specify init my-project
cd my-project
```

## Step 1: Install the extension

The recommended install resolves a release directly from the download URL.
This needs no catalog setup and always works:

```bash
specify extension add improve --from https://github.com/d0whc3r/spec-kit-improve/releases/download/v1.0.0/improve-1.0.0.zip
```

Change the version in the URL to pin a different release.

Prefer to install and update by name with `specify extension add improve`?
That resolves the extension from Spec Kit's community catalog, which ships as
discovery only (`install_allowed: false`). Approve it once:

```bash
specify extension catalog add https://raw.githubusercontent.com/github/spec-kit/main/extensions/catalog.community.json --name community --install-allowed
specify extension add improve
```

See [Troubleshooting](Troubleshooting.md#installation-errors) for the full
explanation of the community catalog error.

Confirm install:

```bash
cat .specify/extensions/.registry        # 'improve' entry should be present
ls .specify/extensions/improve           # extension.yml, commands/, templates/
```

After install, the `/speckit.improve` slash command becomes available in your assistant.

## Step 2: Run your first audit

```text
/speckit.improve quick
```

`quick` keeps the first run cheap: it audits only the recon hotspots, covers
the correctness, security, and tests categories, and reports the top ~6
high-confidence findings. Drop the modifier for the standard full audit across
all nine categories.

The advisor recons the repo (languages, build and test commands, conventions),
audits it, vets every finding by re-reading the cited code, and presents a
findings table ordered by leverage:

```text
| # | Finding                              | Category | Impact | Effort | Risk | Evidence |
```

Every row carries `file:line` evidence. No vibes-only findings.

## Step 3: Pick the findings to plan

The audit ends by asking which findings to turn into spec prompts, with a
default suggestion of the top 3 to 5. Reply with your selection:

```text
plan 1, 3 and 5
```

The advisor writes one spec prompt per selected finding, placed inside
`specs/`: in an existing feature directory's `improve/` folder when one covers
the affected area, otherwise in a new theme directory shared by related
improvements:

```
specs/
└── harden-auth/
    └── improve/
        ├── rotate-session-tokens.md
        └── add-csrf-protection.md
```

There is no index file; each prompt's YAML frontmatter carries its status,
priority, dependencies, and the commit it was planned against.

## Step 4: Read the prompts

Prompts are meant to be reviewed before processing. Open one and read the
Objective and the Acceptance criteria; together they tell you what you are
approving.

## Step 5: Hand a prompt to spec-kit

A `TODO` prompt is the feature description for `/speckit.specify`. Invoke it
with the prompt body:

```text
/speckit.specify <body of rotate-session-tokens.md>
```

`/speckit.specify` creates the feature branch and `spec.md` from the prompt.
Read the spec against the prompt, then continue with the standard spec-kit
lifecycle:

```text
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

`/speckit.clarify` resolves anything the spec dropped. Implementation belongs
to spec-kit core, not to this extension. Once it lands, you may mark the prompt
`status: DONE` to keep the backlog readable.

## Next session

```text
/speckit.improve
```

A re-run keeps the backlog truthful: it dedupes against the prompts already on
disk, drift-checks every TODO prompt and refreshes the ones whose code moved,
and marks REJECTED any finding that no longer holds.

## What next

- Skim [Commands](Commands.md) for the full reference, including the audit
  modifiers (`deep`, `branch`, `next`, `--issues`, focus categories).
- Read [Workflow](Workflow.md) for the full loop and the prompt status
  lifecycle.
- Read [Examples](Examples.md) to see a real findings table and the spec
  prompt it produced.
- Read [Spec Prompt Format](Spec-Prompt-Format.md) for what goes inside each prompt.
- When something refuses to run, jump to [Troubleshooting](Troubleshooting.md).
