# Security Policy

## Supported versions

This extension follows semantic versioning. Only the latest minor release line
receives security fixes. Older releases are left in place but not patched.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1   | No        |

## Threat model in scope

The extension audits a local repository read-only and writes Markdown spec
prompts under `specs/<spec-name>/improve/`. It does not run as a service and
has no network surface of its own. In-scope concerns are:

- A malicious manifest, template, or command file that could trick a host AI
  agent into running unintended actions, exfiltrating data, or writing files
  outside `specs/<spec-name>/improve/`.
- Supply-chain risks in the published release zip or its GitHub Actions
  workflows.
- A prompt or template change that would cause the advisor to reproduce
  secret values (credentials, tokens, `.env` contents) inside findings,
  spec prompts, or published GitHub issues, instead of referencing
  `file:line` and the credential type only.

Out of scope:

- Issues caused by the host AI agent itself (Claude Code, Spec Kit core).
  Report those upstream.
- Vulnerabilities found _by_ the audit in your own codebase. Those belong in
  your own tracker, not this repo.
- General Markdown rendering issues in third-party viewers.

## Reporting a vulnerability

Do not open a public issue or discussion for a suspected vulnerability.

Use GitHub's private vulnerability reporting:

<https://github.com/d0whc3r/spec-kit-improve/security/advisories/new>

In your report please include:

1. A clear description of the impact.
2. Reproduction steps, including the minimal repository shape and the
   exact command invocation.
3. The extension version (`extension.yml` `version`) and the host agent.
4. Any logs, generated artifacts, or screenshots that demonstrate the issue.

You can expect:

- An acknowledgement within 5 business days.
- A triage decision within 10 business days.
- A patched release tagged with a CVE-style note in `CHANGELOG.md` once a fix
  is available.

If you do not get a response within 10 business days, escalate by mentioning
`@d0whc3r` on a separate, non-sensitive issue asking only that the advisory
be triaged.

## Coordinated disclosure

We prefer coordinated disclosure. Please give us a reasonable window to ship
a fix before publishing details. We will credit reporters in `CHANGELOG.md`
unless they ask to remain anonymous.
