# Improve Extension for Spec Kit

A Spec Kit extension that audits any codebase as a senior advisor and writes prioritized, self-contained spec prompts under `specs/` that the spec-kit lifecycle can process. The advisor never implements anything itself: the expensive, high-ceiling model does the part where intelligence compounds (understanding, judging, specifying), and the spec-kit pipeline does the execution. The prompt is the product.

```
you       ->  /speckit.improve                             (expensive model, advises)
specs/    ->  <spec>/improve/fix-n-plus-one.md              (self-contained spec prompts)
spec-kit  ->  /speckit.specify ... /speckit.implement       (the lifecycle executes)
```

## Documentation

The full guide lives in the **[project wiki](https://github.com/d0whc3r/spec-kit-improve/wiki)**. This README is the front door only.

| Wiki page                                                                                 | When to read                                                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [Home](https://github.com/d0whc3r/spec-kit-improve/wiki/Home)                             | Overview and reading order.                                              |
| [Getting Started](https://github.com/d0whc3r/spec-kit-improve/wiki/Getting-Started)       | First install, zero to first spec prompt in five minutes.                |
| [Commands](https://github.com/d0whc3r/spec-kit-improve/wiki/Commands)                     | Deep reference for the `/speckit.improve` command.                       |
| [Workflow](https://github.com/d0whc3r/spec-kit-improve/wiki/Workflow)                     | The audit-handoff-rerun loop and the backlog layout.                     |
| [Examples](https://github.com/d0whc3r/spec-kit-improve/wiki/Examples)                     | A real findings table and the spec prompt it produced.                   |
| [Spec Prompt Format](https://github.com/d0whc3r/spec-kit-improve/wiki/Spec-Prompt-Format) | What makes a prompt processable by `/speckit.specify` with zero context. |
| [Troubleshooting](https://github.com/d0whc3r/spec-kit-improve/wiki/Troubleshooting)       | Common breakages, refusals, and their fixes.                             |
| [FAQ](https://github.com/d0whc3r/spec-kit-improve/wiki/FAQ)                               | Conceptual questions and design rationale.                               |
| [Architecture](https://github.com/d0whc3r/spec-kit-improve/wiki/Architecture)             | How the extension works when you run a command.                          |

The wiki is generated from [`docs/`](docs/) on every push to `main`. To browse the same content as plain markdown, open the [docs folder](docs/).

## At a glance

| Command            | What it does                                                                                                                                                                                        | Writes                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `/speckit.improve` | Full audit (recon, parallel category audit, vetted findings, spec prompts), or one prompt for a specific change you name. A re-run dedupes against existing prompts and refreshes any that drifted. | `specs/<spec>/improve/*.md` |

Modifiers: `quick` / `deep` (effort), a focus category (`security`, `perf`, `tests`, ...), `branch` (only what the current branch changes), `next` (feature direction), `--issues` (also publish prompts as GitHub issues). Pass a free-form change description instead of a modifier to skip the audit and write a single prompt for just that change.

Each `TODO` prompt is a feature description for `/speckit.specify`: hand it the prompt body, then carry the generated spec through `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, and `/speckit.implement`.

## Hard rules

- **Never modifies source code itself.** The only writes go to `specs/<spec-name>/improve/`; turning a prompt into code belongs to the spec-kit lifecycle, and merging is always yours.
- **Never runs commands that mutate your working tree.** Read, search, and read-only analysis only.
- **Never reproduces secret values.** Locations and credential types only, rotation always recommended.
- Asked to implement? It declines and points at the prompt; handing it to `/speckit.specify` is how it becomes code.

## Install

Install directly from the latest release. This needs no catalog setup and is the recommended path:

```bash
specify extension add improve --from https://github.com/d0whc3r/spec-kit-improve/releases/download/v1.0.1/improve-1.0.1.zip
```

Change the version in the URL to pin a different release.

Want to install by name with `specify extension add improve`? That resolves the extension from Spec Kit's community catalog, which ships as discovery only (`install_allowed: false`). Approve it once:

```bash
specify extension catalog add https://raw.githubusercontent.com/github/spec-kit/main/extensions/catalog.community.json --name community --install-allowed
specify extension add improve
```

If `specify extension add improve` fails with `installation is not allowed from that catalog`, that is why. See [Troubleshooting](https://github.com/d0whc3r/spec-kit-improve/wiki/Troubleshooting#installation-errors).

For prerequisites and the first-run walkthrough see [Getting Started](https://github.com/d0whc3r/spec-kit-improve/wiki/Getting-Started).

## Credits

The advisor workflow, audit playbook, and spec prompt template are derived from the [improve](https://github.com/shadcn/improve) agent skill by shadcn (MIT), adapted to the Spec Kit extension format.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) at the repo root.

## License

MIT. See [LICENSE](LICENSE).
