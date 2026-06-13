// Pipeline: lint extension content (markdown templates and command bodies).
//
// Per template:
//   - No em dash.
//   - Canonical mandatory headings present and in order.
//   - Optional headings (when present) appear after the mandatory ones and in
//     declared order. Optional headings may carry a " _(optional)_" suffix.
//   - The command file references the template and any extra refs.
//   - No banned AI-tell phrases.
// Then an oxfmt --check pass over commands, templates, and README.
//
// Usage: node lint-content.mjs

import path from "node:path";
import { $, fs } from "zx";
import { repoRoot, isMain } from "./lib/repo.mjs";
import { logger } from "./lib/log.mjs";

const log = logger("lint-content");

const BANNED_PHRASES = ["delve", "tapestry", "in essence", "navigate the landscape"];
const SPEC_PROMPT_TEMPLATE = "templates/improve-spec-prompt-template.md";
const CLOSING_THE_LOOP = "templates/improve-closing-the-loop.md";

// The canonical command and its skill mirror(s). Their bodies must stay
// identical (AGENTS.md "Agent Boundaries"); only the frontmatter may differ
// (mirrors add name/compatibility/metadata). .claude/skills/* are symlinks to
// .agents/skills/*, so only the .agents mirror needs comparing.
const COMMAND_MIRRORS = [
  {
    canonical: "commands/speckit.improve.md",
    mirror: ".agents/skills/speckit-improve/SKILL.md",
  },
];

// Each entry pairs a shipped reference template with the command that must
// point executors at it. `mandatory` lists the template's stable top-level
// headings in canonical order.
const TEMPLATES = [
  {
    template: "templates/improve-audit-playbook.md",
    command: "commands/speckit.improve.md",
    mandatory: [
      "1. Correctness / Bugs",
      "2. Security",
      "3. Performance",
      "4. Test Coverage",
      "5. Tech Debt & Architecture",
      "6. Dependencies & Migrations",
      "7. DX & Tooling",
      "8. Docs",
      "9. Direction: features & where to take this next",
      "Finding format",
      "Prioritization rubric",
    ],
    optional: [],
    extraRefs: [SPEC_PROMPT_TEMPLATE, CLOSING_THE_LOOP],
  },
  {
    template: SPEC_PROMPT_TEMPLATE,
    command: "commands/speckit.improve.md",
    mandatory: [
      "File placement and naming",
      "Frontmatter",
      "Template",
      "Quality bar: check before finishing each prompt",
    ],
    optional: [],
    extraRefs: [CLOSING_THE_LOOP],
  },
  {
    template: CLOSING_THE_LOOP,
    command: "commands/speckit.improve.md",
    mandatory: ["Handoff: hand a prompt to spec-kit", "Issues: publish prompts as GitHub issues"],
    optional: [],
    extraRefs: [SPEC_PROMPT_TEMPLATE],
  },
];

const read = (rel) => fs.readFileSync(path.join(repoRoot, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(repoRoot, rel));

// Drop a leading YAML frontmatter block (from the first `---` line to the next
// `---` line). The body uses `---` as a markdown rule, so only the leading
// block is stripped. Files without frontmatter are returned unchanged.
function stripFrontmatter(text) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return text;
  let i = 1;
  while (i < lines.length && lines[i] !== "---") i++;
  if (i >= lines.length) return text; // no closing fence: treat all as body
  return lines.slice(i + 1).join("\n");
}

// Fail when a mirror's body diverges from its canonical command's body.
function lintMirrors(fail) {
  for (const { canonical, mirror } of COMMAND_MIRRORS) {
    if (!exists(canonical)) {
      fail(`${canonical} missing`);
      continue;
    }
    if (!exists(mirror)) {
      fail(`${mirror} missing (mirror of ${canonical})`);
      continue;
    }
    if (stripFrontmatter(read(canonical)).trim() !== stripFrontmatter(read(mirror)).trim()) {
      fail(`mirror body diverged: ${mirror} does not match ${canonical} (frontmatter aside)`);
    }
  }
}

// 1-based line of the first heading line, or 0 if absent.
function headingLine(lines, heading) {
  const idx = lines.findIndex((l) => l === `## ${heading}` || l === `## ${heading} _(optional)_`);
  return idx === -1 ? 0 : idx + 1;
}

function lintTemplate(spec, fail) {
  if (!exists(spec.template)) {
    fail(`${spec.template} missing`);
    return;
  }
  const text = read(spec.template);
  const lines = text.split("\n");

  if (text.includes("—")) fail(`em dash found in ${spec.template}`);

  // Single ordered cursor across mandatory then optional headings.
  let last = 0;
  const checkOrder = (headings, required) => {
    for (const h of headings) {
      const line = headingLine(lines, h);
      if (line === 0) {
        if (required) fail(`missing mandatory heading in ${spec.template}: ## ${h}`);
        continue;
      }
      if (line <= last) {
        fail(
          `heading out of canonical order in ${spec.template}: ## ${h} (line ${line}, previous at ${last})`,
        );
      }
      last = line;
    }
  };
  checkOrder(spec.mandatory, true);
  checkOrder(spec.optional, false);

  // Command file references.
  if (!exists(spec.command)) {
    fail(`${spec.command} missing`);
  } else {
    const cmd = read(spec.command);
    for (const ref of [spec.template, ...spec.extraRefs]) {
      if (!cmd.includes(ref)) fail(`${spec.command} does not reference ${ref}`);
    }
  }

  for (const phrase of BANNED_PHRASES) {
    if (text.toLowerCase().includes(phrase)) {
      fail(`banned phrase "${phrase}" found in ${spec.template}`);
    }
  }
}

export async function lintContent() {
  let failed = false;
  const fail = (msg) => {
    log.fail(msg);
    failed = true;
  };

  for (const spec of TEMPLATES) lintTemplate(spec, fail);

  lintMirrors(fail);

  // oxfmt pass over the shipped markdown.
  const oxfmt = path.join(repoRoot, "node_modules/.bin/oxfmt");
  if (fs.existsSync(oxfmt)) {
    const res = await $({ cwd: repoRoot, nothrow: true })`${oxfmt} --check ${[
      "commands/**/*.md",
      "templates/**/*.md",
      "README.md",
    ]}`;
    if (res.exitCode !== 0) fail("oxfmt reported unformatted markdown files");
  }

  if (failed) return false;
  log.ok("content lint passed");
  return true;
}

if (isMain(import.meta.url)) {
  if (!(await lintContent())) process.exit(1);
}
