# Release Process

`@zeromodern/agentkit-provider-0mod` is published to npm from a **GitHub
Release**. The owner decides the version bump (major / minor / patch) manually —
there is no automatic versioning.

## Steps

1. **Bump the version** on `master` (or your release branch):
   ```bash
   npm version major   # or: minor | patch
   ```
   This updates `package.json` / `package-lock.json` and creates a local
   `vX.Y.Z` commit + tag.
2. **Push the commit and the tag:**
   ```bash
   git push origin master --follow-tags
   ```
3. **Create a GitHub Release** pointing at the matching `vX.Y.Z` tag
   (GitHub → Releases → *Draft a new release* → choose the tag → *Publish release*).
4. **Publishing happens automatically.** Creating the Release triggers
   [`.github/workflows/publish.yml`](./.github/workflows/publish.yml), which:
   - verifies the Release tag matches `package.json` `version` (fails loudly on
     mismatch — a wrong tag can never publish the wrong version),
   - builds the package and runs `npm publish --access public --provenance`.

Do **not** run `npm publish` locally.

## One-time setup

The workflow requires an **`NPM_TOKEN`** repository secret
(Settings → Secrets and variables → Actions): an npm **automation** access token
with publish rights to the `@zeromodern` scope.
