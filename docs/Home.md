# Improve Extension Wiki

A Spec Kit extension that audits any codebase as a senior advisor and writes
prioritized, self-contained spec prompts under `specs/` that the spec-kit
lifecycle can process. The advisor never implements anything itself: the
expensive, high-ceiling model does the part where intelligence compounds
(understanding, judging, specifying), and the spec-kit pipeline does the
execution. The prompt is the product.

```
you       ->  /speckit.improve                             (expensive model, advises)
specs/    ->  <spec>/improve/fix-n-plus-one.md              (self-contained spec prompts)
spec-kit  ->  /speckit.specify ... /speckit.implement       (the lifecycle executes)
```

## Start here

| Page                                        | When to read                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| [Getting Started](Getting-Started.md)       | First install, zero to first spec prompt in five minutes.                |
| [Commands](Commands.md)                     | Deep reference for the `/speckit.improve` command.                       |
| [Workflow](Workflow.md)                     | The audit-handoff-rerun loop and the backlog layout.                     |
| [Examples](Examples.md)                     | A real findings table and the spec prompt it produced.                   |
| [Spec Prompt Format](Spec-Prompt-Format.md) | What makes a prompt processable by `/speckit.specify` with zero context. |
| [Troubleshooting](Troubleshooting.md)       | Common breakages, refusals, and their fixes.                             |
| [FAQ](FAQ.md)                               | Conceptual questions and design rationale.                               |
| [Architecture](Architecture.md)             | How the extension works when you run a command.                          |

## The command at a glance

| Command            | What it does                                                                                                                                                                                        | Writes                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `/speckit.improve` | Full audit (recon, parallel category audit, vetted findings, spec prompts), or one prompt for a specific change you name. A re-run dedupes against existing prompts and refreshes any that drifted. | `specs/<spec>/improve/*.md` |

Modifiers: `quick` / `deep` (effort), a focus category (`security`,
`perf`, `tests`, ...), `branch` (only what the current branch changes), `next`
(feature direction), `--issues` (also publish prompts as GitHub issues). Pass a
free-form change description instead of a modifier to skip the audit and write a
single prompt for just that change. All covered in [Commands](Commands.md).

Each `TODO` prompt is a feature description for `/speckit.specify`: hand it the
prompt body, then carry the generated spec through `/speckit.clarify`,
`/speckit.plan`, `/speckit.tasks`, and `/speckit.implement`.

## Hard rules

- **Never modifies source code itself.** The only writes go to
  `specs/<spec-name>/improve/`; turning a prompt into code belongs to the
  spec-kit lifecycle, and merging is always yours.
- **Never runs commands that mutate your working tree.** Read, search, and
  read-only analysis only.
- **Never reproduces secret values.** Locations and credential types only,
  rotation always recommended.
- Asked to implement? It declines and points at the prompt; handing it to
  `/speckit.specify` is how it becomes code.

## External links

- Repository: <https://github.com/d0whc3r/spec-kit-improve>
- Issues: <https://github.com/d0whc3r/spec-kit-improve/issues>
- Discussions: <https://github.com/d0whc3r/spec-kit-improve/discussions>
- Spec Kit core: <https://github.com/github/spec-kit>
