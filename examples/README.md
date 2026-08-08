# Examples

A real worked example of what the Improve Extension produces. The audit was run against a TypeScript monorepo (a component registry CLI plus its documentation site); the artifact here is the spec prompt that landed in the target repo's `specs/improves/` folder.

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

| File                                                                                                             | What it is                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [specs/improves/001-extract-shadow-config-resolution.md](specs/improves/001-extract-shadow-config-resolution.md) | The spec prompt produced for finding #1, written for `/speckit.specify` to process. |

For the walkthrough of this example, section by section, including why the prompt landed where it did and what to look for in each part, see the [Examples](https://github.com/d0whc3r/spec-kit-improve/wiki/Examples) wiki page.
