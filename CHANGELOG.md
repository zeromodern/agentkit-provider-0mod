# Changelog

All notable changes to **`@zeromodern/agentkit-provider-0mod`** are documented in
this file.

- Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- Versioning: [SemVer](https://semver.org/). `package.json` `version` is the
  single source of truth (see `RELEASING.md`).
- Published to npm from a GitHub Release; the release tag MUST equal
  `package.json` `version` (guarded in `.github/workflows/publish.yml`).

## [2.0.0] - 2026-09-29

### Removed (BREAKING)
- **Retired 9 actions** from the Coinbase AgentKit provider registry so it
  exposes exactly the frozen **10-SKU** x402 catalogue. Any consumer importing a
  removed action will now fail to resolve it — this is why the bump is **MAJOR**:
  - `rag_shrink_html` (`/api/v1/rag-shrink`)
  - `code_denoise` (`/api/v1/code-denoise`)
  - `x_sentiment` (`/api/v1/x-sentiment`)
  - `embed_text` (`/api/v1/embed-text`)
  - `embed_multilingual` (`/api/v1/embed-multilingual`)
  - `summarize_text` (`/api/v1/summarize`)
  - `crypto_shadow_capacity` (`/api/v1/crypto/shadow-capacity`)
  - `crypto_labeled_dislocations` (`/api/v1/crypto/labeled-dislocations`)
  - `crypto_attributed_executions` (`/api/v1/crypto/attributed-executions`)
- Removed the now-orphaned Zod argument schemas for the dropped actions.

### Changed
- `README.md` action table trimmed to the retained 10 actions (names unchanged),
  with prices off the `/api/v1/discovery` manifest of record.
- Rebuilt the committed `build/index.js` so the published artifact matches source.

### Retained actions (frozen 10)
`stealth_dom_fetch`, `airgap_pii_scrub`, `domain_check`, `dex_price_summary`,
`image_ocr_shrink`, `crypto_coverage`, `crypto_spread_candles`,
`crypto_dislocations`, `crypto_execution_latency`, `crypto_impact_simulation`.

### Version
- **MAJOR `1.5.0 → 2.0.0`** — removing public actions is a breaking public API
  change (SemVer Rule 2). Retained action **names** are unchanged, so callers of
  the surviving 10 are unaffected.

## [1.5.0]
- Added `labeled-dislocations`, `attributed-executions`, `impact-simulation`
  actions. (Superseded by 2.0.0.)

[2.0.0]: https://github.com/zeromodern/agentkit-provider-0mod/releases/tag/v2.0.0
