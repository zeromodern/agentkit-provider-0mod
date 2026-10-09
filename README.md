# @zeromodern/agentkit-provider-0mod

[![npm](https://img.shields.io/npm/v/@zeromodern/agentkit-provider-0mod?style=flat-square)](https://www.npmjs.com/package/@zeromodern/agentkit-provider-0mod) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Coinbase AgentKit](https://github.com/coinbase/agentkit) action provider delivering **institutional CEX-DEX crypto arbitrage and real-time execution telemetry** alongside modular edge developer utilities for autonomous AI agents. Per-call micropayments are settled on Base USDC via HTTP 402.

## Wallet & Network Prerequisites

0mod gateway utilities use **x402 HTTP 402 micropayments** on Base EVM:
- **Network:** Base Mainnet (`eip155:8453`)
- **Asset:** USDC on Base
- **Environment Variable:** `PAYER_PRIVATE_KEY=0x...` (or `EVM_PRIVATE_KEY` / `X402_PRIVATE_KEY`)

When `PAYER_PRIVATE_KEY` is present in your bot's environment, actions transparently sign payment authorizations and execute with zero manual intervention.

## Requirements

- Node.js >= 18
- npm >= 9

## Install

```bash
npm install @zeromodern/agentkit-provider-0mod
```

## Setup & Code Example

```typescript
import { AgentKit } from "@coinbase/agentkit";
import { zeroModActionProvider, ZeroModActionProvider } from "@zeromodern/agentkit-provider-0mod";

// Set PAYER_PRIVATE_KEY in process.env for automatic 402 payment signing
process.env.PAYER_PRIVATE_KEY = "0x_your_private_key_here";

const agentKit = await AgentKit.from({
  actionProviders: [
    zeroModActionProvider(),
  ],
});

// Call an action directly using the provider
const provider = new ZeroModActionProvider();
const resultJson = await provider.domainCheck(null, { domain: "base.org" });
console.log("Domain Check Output:", JSON.parse(resultJson));
```

## Practical Real-World Example: Quant Backtest Sprint ($1k/mo Subscription Alternative)

Institutional crypto data feeds (Kaiko, Amberdata, CoinMetrics) charge **$1,000 to $3,000/month** recurring minimum commitments for cross-venue spread OHLC candles, market dislocations, and execution latency benchmarks.

With `@zeromodern/agentkit-provider-0mod`, quants and autonomous AI agents pay strictly per telemetry slice via HTTP 402 micropayments on Base USDC. Pricing is dynamically negotiated per request via the gateway's HTTP 402 challenge header (view live rates at [api.0mod.com](https://api.0mod.com)), allowing a complete 24-hour high-resolution strategy backtest to execute for micropayments instead of an enterprise $1,000/month commitment.

See [`examples/quant_backtest_sprint.ts`](./examples/quant_backtest_sprint.ts) for the full runnable script.


## Available Actions

> 💡 **Pricing**: The table below lists per-call USDC prices as published by the gateway discovery manifest. For live rates and endpoint status, visit [api.0mod.com](https://api.0mod.com) or `GET https://api.0mod.com/api/v1/discovery`. All calls are settled per request via HTTP 402 micropayments on Base USDC.

### Institutional Crypto Telemetry & Execution Analytics
| Action Name | Gateway Endpoint | Price (USDC) | Description | Input Schema Example |
| :--- | :--- | :--- | :--- | :--- |
| `crypto_dislocations` | `GET /crypto/dislocations` | $0.04500 | Cross-venue market dislocation & spread arbitrage events | `{ "pair": "AERO/USD", "date": "2026-09-14" }` |
| `crypto_execution_latency` | `GET /crypto/execution-latency` | $0.07500 | Benchmark cross-venue execution speed, venue latencies, and fill rates | `{ "date": "2026-09-14" }` |
| `crypto_impact_simulation` | `POST /crypto/impact-simulation` | $0.07500 | Simulate order-book impact: expected fill price, slippage, fill ratio & levels | `{ "pair": "AERO/USD", "side": "buy", "size_usd": 10000 }` |
| `crypto_spread_candles` | `GET /crypto/spread-candles` | $0.01500 | Cross-venue CEX-DEX 15m spread candles (OHLC raw & net bps) | `{ "pair": "AERO/USD", "date": "2026-09-14" }` |
| `crypto_coverage` | `GET /crypto/coverage` | Free | Check active data coverage, supported pairs (13+ pairs), and date boundaries | `{ "pair": "AERO/USD" }` |

### Modular Edge Utilities & Developer Tools
| Action Name | Gateway Endpoint | Price (USDC) | Description | Input Schema Example |
| :--- | :--- | :--- | :--- | :--- |
| `dex_price_summary` | `POST /dex-price-summary` | $0.00150 | Real-time DEX token price, volume, liquidity across chains | `{ "query": "USDC" }` |
| `stealth_dom_fetch` | `POST /stealth-dom` | $0.00400 | Headless web page fetch from Cloudflare edge | `{ "url": "https://example.com" }` |
| `airgap_pii_scrub` | `POST /airgap-scrub` | $0.00400 | Redact SSN, credit cards, phones, emails via Workers AI | `{ "text": "Call me at 555-0199" }` |
| `domain_check` | `POST /domain-check` | $0.00800 | Query global RDAP registry for domain availability & nameservers | `{ "domain": "example.com" }` |
| `image_ocr_shrink` | `POST /image-ocr-shrink` | $0.00800 | Vision OCR text and table extraction from images | `{ "imageUrl": "https://..." }` |

### Usage Example — `crypto_impact_simulation` (pre-trade order impact)

Simulates consuming order-book depth for a given `side` and size (`size_usd` **or** `size_base`). Outputs `expected_fill_price`, `slippage_bps`, `fillable_size_base`/`fillable_size_usd`, `fill_ratio`, `full_fill_probability`, `partial_fill_probability`, `executable`, and `levels_consumed`.

```typescript
const raw = await provider.cryptoImpactSimulation({} as any, {
  pair: "AERO/USD",
  side: "buy",
  size_usd: 10000,
});
const sim = JSON.parse(raw);
console.log(
  `executable=${sim.executable} fill_price=${sim.expected_fill_price} ` +
  `slippage=${sim.slippage_bps}bps fill_ratio=${sim.fill_ratio} ` +
  `full=${sim.full_fill_probability} partial=${sim.partial_fill_probability} ` +
  `levels=${sim.levels_consumed}`
);
```

## Ecosystem Packages

- 🤖 **MCP Server (Any AI Agent):** [`@zeromodern/mcp-server-0mod`](https://github.com/zeromodern/mcp-server-0mod)
- 🟣 **ElizaOS Plugin:** [`@zeromodern/eliza-plugin-0mod`](https://github.com/zeromodern/eliza-plugin-0mod)
- 🔵 **Coinbase AgentKit Provider:** [`@zeromodern/agentkit-provider-0mod`](https://github.com/zeromodern/agentkit-provider-0mod)
- ⚡️ **Live Gateway Service:** [api.0mod.com](https://api.0mod.com)

## Troubleshooting

- **Import error:** Make sure you're importing from `@zeromodern/agentkit-provider-0mod`.
- **Payment / Auth errors:** Ensure `PAYER_PRIVATE_KEY` is set with a valid Base EVM private key holding a USDC balance for x402 micropayments.

## Release Process

Releases are cut manually by the owner via a **GitHub Release** — publishing to
npm is triggered by creating the Release, and the owner chooses the
major/minor/patch bump. See [RELEASING.md](./RELEASING.md) for the full steps.

## License

MIT
