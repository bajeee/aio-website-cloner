# Deliver and publish

Keep one project directory per requested project, with a configurable deliverable subdirectory (for example GitHub) when requested. Reuse existing spellings; never scaffold a second populated project under an alternate name. Keep research and captured originals outside the deliverable repository.

Export required runtime source/assets, lockfile, minimal build/preview configuration, concise run instructions and required licenses. Exclude analysis engines, browser profiles, cookies, tokens, original HARs, screenshots, agent instructions, dependency caches, build caches and unrelated starter integrations. Do not remove files from an existing authored project merely because a new-export whitelist would omit them.

Verify a clean production build and route refresh behavior. Make the local demo boundary and external integrations clear. Retain the report and exact source commit used for the build. Do not claim that a successful local build verifies the deployed runtime.

Use the user's requested host/repository and account. Creating public repositories, deploying, changing domains and adding profile showcases are separate capabilities: proceed when already authorized, otherwise deliver the concrete local result first. No hosting vendor or publication service is mandatory for this skill.

On Windows/network shares, prefer building on a writable local filesystem if the toolchain cannot build reliably on UNC paths. Keep one explicitly identified source of truth, preserve Git metadata, and synchronize only the intended source changes. Verify resolved paths and collisions before moving or deleting anything. Do not make duplicate project folders to work around spelling or build-path problems.

Return the preview/artifact location, verified route coverage, actual checks and remaining differences. Include exact failure scope for inaccessible originals, proprietary server behavior, unavailable assets or GPU restrictions. State how a later run can resume the saved workspace.
