# Tool routing and integrated sources

Capabilities have one owner. Do not install the upstream instruction collections beside this package or load overlapping manuals wholesale. Use an existing compatible runtime; install a missing runtime only when needed and authorized, and pin the version used. This package does not include upstream binaries, browser distributions or native analysis engines.

| Capability owner | Integration | When to use |
| --- | --- | --- |
| Workflow and evidence | This package's consolidated cloning procedure, informed by JCodesMore's clone-website workflow and webEmbedding's structured capture | Every clone |
| Simplicity | Consolidated Ponytail principles in SKILL.md | Every phase; do not load another simplicity workflow |
| Browser actions/scenarios | One active permitted controller; Playwright integration is preferred for a new controlled test harness when permitted | Navigation, capture, reproducible tests |
| Browser alternative | agent-browser, if it is the permitted available controller | Substitute for browser actions, not a second parallel controller |
| CSS/network diagnosis | Chrome DevTools MCP, when available | Focused matched-rule, request, console or runtime evidence not available from the controller |
| Source recovery | Wakaru | Source-map extraction, supported bundle splitting, syntax recovery |
| Obfuscation recovery | webcrack | Only when supported obfuscation remains after source maps/simple recovery |
| Cross-artifact evidence | REA Web/JavaScript CLI or available MCP tools | Unresolved relationships, captured bundle analysis, scenario/evidence comparison |
| Pixel comparison | Pixelmatch through scripts/cloner.mjs | PNG comparison and diff artifact |

## Browser adapters

Active host rules take precedence over tool preferences. Use the supplied browser API if the host requires it. Otherwise reuse Playwright/Playwright CLI or agent-browser already available. Use separate contexts for original and clone, with identical viewport, device scale, browser engine, color scheme, language and timezone; do not mix controllers for the same context.

- **Playwright:** use installed APIs or CLI help and the official skill only for the needed commands. Preserve traces/screenshots and actual browser failures. Screenshot assertion defaults can disable animation: that is useful for static comparison but is not motion verification.
- **agent-browser:** read its installed `skills get core` for version-matched commands; load `dogfood` only for exploratory QA. Do not import Slack, Electron, cloud provider or API-client workflows into the cloner. Export observations into the common inventory/check format.
- **Chrome DevTools:** verify advertised tools. Prefer matched CSS rules for cascade questions and request evidence for download failures. Do not register another MCP server merely to obtain an equivalent screenshot command.

## Source-analysis adapters

- Start with inventoried files and source maps. Recover to a new analysis directory, never over the source or final app. Compare recovered modules to original bytes before adopting them.
- **Wakaru:** consult the installed version's help. Select supported bundle/source-map operations; use their module counts, warnings and provenance. A module recovery is not proof of a working application. REA's Wakaru integration may have stricter host requirements than Wakaru's own CLI; check the selected route.
- **webcrack:** use its installed supported API/CLI only for a concrete supported obfuscation/bundle. Review runtime prerequisites and execution behavior before processing untrusted input. Keep recovered code isolated; do not import it into the agent's process to inspect it.
- **REA:** use only advertised Web/JavaScript operations relevant to the current question, such as page/script/network inspection, controlled scenarios, captured-bundle analysis and capture comparison. Reuse retained evidence and honor partial coverage. Prefer an installed CLI for a focused task rather than registering a broad MCP inventory. Do not copy REA's native, firmware, Android, .NET or Electron references into this package. If upstream distributes only the complete runtime, it remains an optional external runtime; do not claim a web-only binary distribution. Ghidra/Hopper/IDA are not prerequisites for ordinary websites.

## Upstream sources

Maintainer-owned sources used for integration design; verify actual versions before use:

- JCodesMore/ai-website-cloner-template — https://github.com/JCodesMore/ai-website-cloner-template — MIT.
- DietrichGebert/ponytail — https://github.com/DietrichGebert/ponytail — MIT.
- microsoft/playwright-cli — https://github.com/microsoft/playwright-cli — Apache-2.0.
- ChromeDevTools/chrome-devtools-mcp — https://github.com/ChromeDevTools/chrome-devtools-mcp — Apache-2.0.
- vercel-labs/agent-browser — https://github.com/vercel-labs/agent-browser — Apache-2.0.
- pionxzh/wakaru — https://github.com/pionxzh/wakaru — Apache-2.0.
- j4k0xb/webcrack — https://github.com/j4k0xb/webcrack — MIT.
- morluto/rea — https://github.com/morluto/rea — MIT.
- jongko54/webEmbedding — https://github.com/jongko54/webEmbedding — MIT. Integrate capture, inventory and verification concepts; iframe/embed/remote-preview routing is not a standalone clone.
- mapbox/pixelmatch — https://github.com/mapbox/pixelmatch — ISC.
- pngjs/pngjs — https://github.com/pngjs/pngjs — MIT; PNG decoding/encoding only.

No other cloner package is incorporated. Upstream tools retain their own licenses and are not rebranded as this package's code.
