# Examples

A real worked example of what the Improve Extension produces. The audit was run against a TypeScript monorepo (a component registry CLI plus its documentation site); the artifact here is the spec prompt that landed in the target repo's `specs/` tree, scoped under `specs/registry-cli/improve/`.

## The findings table (what the audit presented)

After recon, a parallel category audit, and a vetting pass, the advisor presented this leverage-ordered table:

| #   | Finding                                                                              | Category  | Impact | Effort | Risk | Confidence |
| --- | ------------------------------------------------------------------------------------ | --------- | ------ | ------ | ---- | ---------- |
| 1   | Shadow-config resolution duplicated in `search.ts`/`view.ts`, copies already drifted | tech-debt | HIGH   | M      | LOW  | HIGH       |
| 2   | O(n^2) icon migration loop (`migrate-icons.ts:168`)                                  | perf      | MED    | S      | LOW  | HIGH       |
| 3   | Registry fetch swallows HTTP errors, CLI reports "0 components" instead of failing   | bug       | HIGH   | S      | LOW  | HIGH       |
| 4   | No characterization tests on the config resolver feeding findings 1 and 3            | tests     | HIGH   | M      | LOW  | HIGH       |

...and rejected a few, with reasons recorded in the final report so they don't come back next run:

```
- [SEC-01] https_proxy env var "SSRF": by-design. Standard proxy convention,
  every CLI honors it. Not a finding.
```

## The artifacts in this folder

| File                                                                                                                             | What it is                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [specs/registry-cli/improve/extract-shadow-config-resolution.md](specs/registry-cli/improve/extract-shadow-config-resolution.md) | The spec prompt produced for finding #1, written for `/speckit.specify` to process. |

The target repo had no existing feature directory covering the CLI, so the advisor created the dedicated theme space `specs/registry-cli/improve/`; the prompts for findings #3 and #4 would land in the same folder. Each prompt is self-indexing: the YAML frontmatter carries status, priority, dependencies, and the commit it was planned against, so no separate index file exists.

Read the prompt with spec-kit's eyes: an objective `/speckit.specify` can derive user scenarios from, current-state excerpts to confirm the right location, numbered testable requirements, acceptance criteria with expected results, and a hard out-of-scope list so the generated spec does not sprawl.
