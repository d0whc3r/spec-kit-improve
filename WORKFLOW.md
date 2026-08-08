# How to Use the Improve Extension

The usage guide lives in the [project wiki](https://github.com/d0whc3r/spec-kit-improve/wiki), authored under [`docs/`](docs/). This page routes you to the right part of it so the procedure is documented once.

## Install

```bash
specify extension add improve --from https://github.com/d0whc3r/spec-kit-improve/releases/download/v1.1.0/improve-1.1.0.zip
```

Requires Spec Kit `>= 0.2.0` initialized in the project and a git repository. Prerequisites, the by-name install through the community catalog, and the first-run walkthrough are in [Getting Started](docs/Getting-Started.md).

## The command

| Command                | Reads                      | Writes                | Role                                                                            |
| ---------------------- | -------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `/speckit.improve.run` | the repository (read-only) | `specs/improves/*.md` | Full audit, or one prompt for a named change; a re-run keeps the backlog honest |

The command never modifies source code. All advisor output lands in one flat folder, `specs/improves/`. Turning a prompt into code belongs to the spec-kit lifecycle (`/speckit.specify` through `/speckit.implement`), and merging is always your decision.

## Where each topic is documented

| You want                                                                                                     | Read                                             |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Install, prerequisites, first run                                                                            | [Getting Started](docs/Getting-Started.md)       |
| Every modifier (`quick`, `deep`, focus category, `branch`, `next`, `--issues`), the four phases, the handoff | [Commands](docs/Commands.md)                     |
| The audit-handoff-rerun loop, the backlog layout, the status lifecycle                                       | [Workflow](docs/Workflow.md)                     |
| A real findings table and the prompt it produced                                                             | [Examples](docs/Examples.md)                     |
| What goes inside a prompt and why                                                                            | [Spec Prompt Format](docs/Spec-Prompt-Format.md) |
| Install errors, refusals, drifted prompts                                                                    | [Troubleshooting](docs/Troubleshooting.md)       |
| Design rationale                                                                                             | [FAQ](docs/FAQ.md)                               |
| What happens at runtime when you invoke the command                                                          | [Architecture](docs/Architecture.md)             |

Contributor topics (repo layout, dev install, release procedure) are in [CONTRIBUTING.md](CONTRIBUTING.md).
