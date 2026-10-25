# Common evidence and checker

## Workspace contract

`clone.json` is editable task input. `inventory.json` is the discovery/coverage ledger. `checks.json` holds observations. Keep captures/downloads in the workspace outside the deliverable repository. Use relative evidence paths inside this workspace; do not embed machine-specific paths into the skill or public app.

`clone.json` fields: `schemaVersion: 1`, `sourceUrl`, `localUrl`, `outputDirectory`, `strategy` (`auto|reuse|rebuild|hybrid`), `backend` (`demo|real|none`), `viewports` (objects with unique `name`, positive `width`/`height`), `requiredChecks` (check IDs), `blockedHosts`, `removeTerms` and `intentionalChanges`. Defaults are supplied by `init`; URLs and output location must be set before validation. Host rules match a host and its subdomains, never arbitrary substrings.

`checks.json` has `schemaVersion: 1` and `checks`. Each check has a unique `id`, `category`, `status` (`pass|fail|unknown`), nonempty `detail`, and an `evidence` array of existing relative file paths. Use `unknown` for unavailable/partial observations. Do not edit raw reference facts to obtain a pass.

Core required IDs are `build`, `render`, `assets`, `visual`, `interaction`, `motion`, `responsive`, `runtime`, `offline`, `links`, `cleanup`, `review`. A genuinely absent feature, such as animation, can pass its category only after evidence establishes that absence; explain the observed boundary. A successful check needs evidence. An intentionally network-dependent real integration fails strict offline operation and must be reported as a limitation.

Each route's `checkIds` expands the coverage matrix: include separate observed checks for desktop and mobile rendering, visual comparisons and meaningful unique interactions. A shared-template test does not replace each page's content/asset/render check. Bind IDs to scenario/state/viewports; include discovered exceptional layouts and required extra sizes.

## Reproducible comparison

1. Use identical engine/version, viewport/device scale, color scheme, locale and state. Wait for font/media readiness and the intended phase, not an arbitrary universal sleep. Keep source versions and intended-change exemptions explicit.
2. Capture viewport/section pairs as well as the full page after real scrolling. Compare text wrapping, geometry, typography, assets and actual content. Pixel score is supplementary; a tiny missing control can matter more than a large similar background.
3. For stable static PNG pairs use `diff` below. Default per-pixel threshold is 0.1 and maximum different-pixel ratio 0.01. Mismatched image sizes fail. Calibrate repeated source captures to identify noise; do not increase thresholds to hide actual drift. Record any adjusted threshold and reason in the report.
4. Evaluate motion separately with real inputs and matched phases: initial/active/settled, direction, trigger, pinning, progress, timing and interruption. Do not claim motion parity from frozen screenshots or equal animation counts. Review WebGL/canvas on available real hardware and disclose GPU/fallback limits.
5. Replay interaction scenarios against the clone: navigation, menu close/Escape/focus, tabs, accordions, sliders, filters, functional URL state and local demo validation. Capture errors, failed requests, downloads and protocol/new-tab navigation.
6. Verify independence with a fresh context, cache/service-worker effects controlled, source origin blocked, and all non-approved remote resources blocked. Exercise lazy media and interactions. A previously warmed cache is not an offline test. Record failures and intentional external integrations.
7. Independently review paired artifacts. Fix supported differences; repeated passes use the same reference and coverage denominator. Re-capture a changed original as a new reference run.

The browser probe is a read-only inventory aid, not a complete network recorder or screenshot checker. Its observations are limited to the current DOM/state. Use the controller's request/console capture and scenario output for behavior over time. Do not mark an entire category passed from probe output alone.

## Included commands

From a shell permitted by the environment:

```sh
node <skill>/scripts/cloner.mjs init <workspace>
node <skill>/scripts/cloner.mjs validate <workspace>
node <skill>/scripts/cloner.mjs audit <workspace> <probe.json>
node <skill>/scripts/cloner.mjs diff <reference.png> <local.png> <diff.png> [maxRatio] [threshold]
node <skill>/scripts/cloner.mjs report <workspace>
```

`init` refuses existing configuration and never overwrites evidence. `validate` checks structure and coverage references, not website fidelity. `audit` detects blocked/source hosts, remote dependencies, cleanup terms, unloaded images and overflow in a supplied local probe. A clean single-state audit remains unknown because it cannot establish whole-site parity. `diff` prints JSON, writes a new diff PNG and exits nonzero on a difference above its bound; use a new output path for each run. It refuses to overwrite existing output. Install the two pinned PNG dependencies with `npm ci --ignore-scripts` in this skill directory when image comparison is required. Do not install dependencies into the website just to run the checker.

`report` writes `report.json` and `report.md` in the workspace. It refuses invalid structures; missing evidence, missing required checks, incomplete discovery and unresolved routes remain unknown. Overall fail outranks unknown, which outranks pass. A partial run cannot improve its score by dropping unfinished pages. HTML/visual reports may be added for the current task, but the JSON result is the common machine-readable output.

## Validate the skill itself

Run `node --test scripts/cloner.test.mjs` and the host's available skill validator after changes. Neutral generated fixtures must cover missing evidence, unresolved coverage, route exclusions, image mismatch, configuration errors and overwrite protection. Forward-test the instructions independently when delegation is available and authorized; do not use a previous customer's website as a required test dependency.
