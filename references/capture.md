# Discover and capture

## Inventory before implementation

1. Read workspace instructions and existing routes; identify the exact source origin(s) from the request. Inspect existing output before creating a project. Compare normalized names to avoid duplicate folders.
2. Gather sitemap indexes and rendered internal links, then inspect navigation, footer, client transitions, pagination and search/filter states. Inspect script/route manifests or REA findings only to resolve discovery gaps. A candidate is not a confirmed page.
3. Normalize origins, fragments and tracking parameters for deduplication. Preserve functional query parameters, significant case, encoded segments and trailing-slash behavior. Track redirect aliases. Do not enumerate arbitrary identifiers or treat every query combination as another page.
4. Confirm candidates through observed requests and meaningful rendered content. Record forbidden, missing, unavailable and unknown routes. A soft 404 with status 200 is not confirmed content. Stop infinite spaces at the agreed scope and report the boundary.

Use `inventory.json` with `schemaVersion: 1`, `discoveryComplete`, `discoveryLimits` and `routes`. Each route has a unique `id`, `path`, `sourceUrl`, `originEvidence`, `status` (`confirmed`, `candidate`, `excluded`, `unavailable`), optional `reason`, and nonempty required `checkIds`. Confirmed and unresolved in-scope routes remain in the coverage denominator. Exclusions require a recorded reason; a capture failure is not an exclusion.

## Observe rules, not one screenshot

Capture each required page at mobile and desktop sizes. Add tablet/wide views and both sides of discovered breakpoints for shared layouts and exceptional pages. Baseline sizes are configured per run; never silently reduce a requested matrix.

Scroll with actual user-style inputs to load lazy resources and exercise scroll listeners. Record initial, active and settled states of menus, carousels, accordions, dialogs, headers and pinned scenes. Include reverse scroll, keyboard/focus behavior, carousel boundaries and relevant validation states. Do not submit a live original form, buy, send messages or change accounts just to discover a page; use source evidence or an authorized test instance.

Every observation records source URL, time, viewport, device scale, browser/version, color scheme, locale, relevant state, action sequence, scroll landmark and evidence path. Pair by semantic section/state rather than only absolute scroll Y when page heights differ. Keep reference captures immutable and version a changed original separately.

## Assets and source-first reconstruction

Capture response bodies with a permitted browser or HTTP downloader. Use browser-observed requests to resolve negotiated font/media variants. A filename suffix does not prove MIME type. For every retained asset record URL, local relative path, content type, byte size, hash and observed references; add dimensions/font weight where relevant.

Traverse CSS imports and URLs, HTML src/srcset/posters, lazy states, script imports, referenced JSON, SVGs and media. Discover alternate states before declaring assets complete. Preserve query-sensitive file variants using stable names/hashes. Verify every local reference resolves. Prevent paths from escaping the selected download root.

Separate reusable runtime code from analytics, remote service clients and captured research. Never package browser profiles, cookies, HAR authorization headers, tokens, private response bodies or storage state. Redact or exclude sensitive captures before retaining evidence. Rights and requested modifications belong in project configuration.

## Bounded network behavior

Start conservatively, normally one source request at a time. Reuse successful downloads; honor Retry-After and apply bounded backoff on 429/503. Report persistent upstream failures rather than changing identities or bypassing a protection. Validate response type/content before accepting a download; an error HTML body saved as a font is still a failed font.

If capture is partial, preserve what succeeded and its gaps. Do not fill missing source facts with invented content or silently substitute stock assets.
