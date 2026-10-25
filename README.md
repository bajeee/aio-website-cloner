# AIO Website Cloner

One agent skill for inspecting, reconstructing and checking independently hosted websites. It selects reuse, source recovery, rebuild or a hybrid after inspection. Backend behavior defaults to an explicit local demo and can be configured per project.

## Install

Copy this directory into your agent's skills directory, or install it from its published Git repository using your agent's supported skill installer. Invoke `$aio-website-cloner` with the source URL, scope and output directory. Automatic discovery remains enabled where supported.

Node.js 22+ is needed for the included helpers. Image diffs use two pinned dependencies:

```sh
npm ci --ignore-scripts
npm test
```

No nine-skill installation is required. Browser automation uses one permitted controller already available to the agent. REA, Wakaru, webcrack and browser-specific CLIs are optional external runtimes selected only for concrete tasks; their binaries and browser distributions are not bundled here.

## Included

- One consolidated workflow with Ponytail simplicity principles.
- Route/state/asset discovery, source-first reconstruction and targeted JavaScript recovery guidance.
- One evidence contract, neutral browser probe, PNG diff and coverage report.
- Targeted integrations for Playwright, Chrome DevTools, agent-browser, REA Web/JS, Wakaru and webcrack; capture concepts from webEmbedding.
- Analyze, clone, check, resume and export modes through the agent workflow.

The helper CLI is not an autonomous website cloning engine. The agent performs browser observation and reconstruction; helpers make repeated evidence checks reproducible. Required browser/API access and runtime packages must actually be available.

See [SKILL.md](SKILL.md) for the entrypoint and [tool routing](references/tools.md) for upstream integrations/licenses. No customer-specific examples, project defaults, browser profiles or credentials are included. This package does not guarantee recovery of private server source or perfect equivalence for every website.
