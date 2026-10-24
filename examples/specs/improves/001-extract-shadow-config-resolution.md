---
status: TODO
priority: P1
effort: M
risk: LOW
category: tech-debt
depends: []
planned_at: 4f9c2e1
issue: ""
---

# Extract shared shadow-config resolution into one utility

## Objective

The logic that resolves a component's shadow registry configuration is implemented twice: once in `search.ts` and once in `view.ts`. The copies have already drifted: `search.ts` handles the `registries` override map while `view.ts` does not, which is the open TODO at `search.ts:31`. Every future registry feature must currently be implemented twice, and the next divergence will be a user-visible inconsistency between `search` and `view` output. After this improvement, the resolution logic lives in one shared utility and both commands behave identically, removing the class of bug.

## Current context

- `packages/cli/src/commands/search.ts`: command entry; lines 24-58 resolve the shadow config inline. Line 31 carries `// TODO: keep in sync with view.ts`.
- `packages/cli/src/commands/view.ts`: command entry; lines 19-47 are a near-identical copy, missing the `registries` override handling.
- `packages/cli/src/utils/`: home of shared helpers; `resolve-paths.ts` is the structural exemplar to match (one exported function, options object, unit test alongside).

Excerpt, `packages/cli/src/commands/search.ts:24-33`:

```ts
const configResult = await loadConfig(cwd);
// TODO: keep in sync with view.ts
const shadow = configResult.config.registries
  ? mergeRegistries(configResult.config.registries, DEFAULT_REGISTRY)
  : DEFAULT_REGISTRY;
```

Repo conventions that apply: helpers are pure functions in `packages/cli/src/utils/`, named `<verb>-<noun>.ts`, with a colocated `<name>.test.ts` using vitest. Error handling follows early-return with typed results; see `packages/cli/src/utils/resolve-paths.ts` and its use in `init.ts:40-55`. Match it.

Verification commands for this repo (verified during recon):

| Purpose   | Command                                   | Expected on success |
| --------- | ----------------------------------------- | ------------------- |
| Install   | `pnpm install`                            | exit 0              |
| Typecheck | `pnpm --filter cli typecheck`             | exit 0, no errors   |
| Tests     | `pnpm --filter cli test -- shadow-config` | all pass            |
| Lint      | `pnpm --filter cli lint`                  | exit 0              |

## Detailed instructions

### Requirements

- R1: A single utility `resolveShadowConfig(config: Config): RegistryConfig` exists in `packages/cli/src/utils/resolve-shadow-config.ts`, ported from the `search.ts` variant (the complete one, including the `registries` override merge), structured after `resolve-paths.ts`.
- R2: Both `search.ts` and `view.ts` call the utility instead of resolving inline; the TODO at `search.ts:31` is gone.
- R3: `view` gains the `registries` override handling it was missing. This is an intentional behavior change: the drift is the bug.
- R4: The utility has characterization tests covering: default registry when no overrides; override map merged over defaults; empty `registries` key treated as absent. Modeled after `resolve-paths.test.ts`.
- R5: The CLI's public flags and output shape do not change.

### Acceptance criteria

- [ ] `pnpm --filter cli typecheck` exits 0
- [ ] `pnpm --filter cli test` exits 0; 3 new tests for `resolveShadowConfig` exist and pass
- [ ] `grep -rn "mergeRegistries" packages/cli/src/commands/` returns no matches (logic lives only in the utility)
- [ ] `grep -n "keep in sync" packages/cli/src/commands/search.ts` returns no matches
- [ ] Existing `search.test.ts` and `view.test.ts` pass unchanged; they characterize the commands' output shape

### Scope boundaries

**In scope**: the only areas the implementation should touch.

- `packages/cli/src/utils/resolve-shadow-config.ts` (create)
- `packages/cli/src/utils/resolve-shadow-config.test.ts` (create)
- `packages/cli/src/commands/search.ts`
- `packages/cli/src/commands/view.ts`

**Out of scope**: things that look related but must not change.

- `packages/cli/src/utils/load-config.ts`: upstream loader, other commands depend on its exact behavior.
- `apps/www/`: the docs site re-implements a display-only variant on purpose.
- Any change to the CLI's public flags or output shape.

### Risks and notes

- If `view.test.ts` asserts the _absence_ of override handling, the drift is load-bearing and this prompt's premise is wrong; stop and report instead of forcing the change.
- A reviewer should scrutinize the `view.ts` switch: `view` intentionally gains behavior; confirm the new output is correct rather than assuming the old output was.
- Future registry features (auth tokens, mirrors) belong in `resolveShadowConfig`, not in the commands.
- Deferred: the docs-site variant in `apps/www/` could share this utility via a package export; out of scope here because it changes the build graph.
