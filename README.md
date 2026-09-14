# @zeromodern/agentkit-provider-0mod

[![npm](https://img.shields.io/npm/v/@zeromodern/agentkit-provider-0mod?style=flat-square)](https://www.npmjs.com/package/@zeromodern/agentkit-provider-0mod) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Coinbase AgentKit](https://github.com/coinbase/agentkit) action provider for the [0mod API Gateway](https://api.0mod.com). HTTP 402 micropayments on Base EVM are handled automatically.

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

With `@zeromodern/agentkit-provider-0mod`, quants and autonomous AI agents pay strictly per telemetry slice via HTTP 402 micropayments on Base ($0.025 - $0.200 USDC). A complete 24-hour high-resolution strategy backtest across spread candles, dislocations, and venue latencies costs **~$2.50 instead of $1,000/month** (over 99% cost reduction).

See [`examples/quant_backtest_sprint.ts`](./examples/quant_backtest_sprint.ts) for the full runnable script.


## Available Actions

> 💡 **Pricing**: For live per-call pricing and endpoint status across all actions, visit [api.0mod.com](https://api.0mod.com) or fetch `https://api.0mod.com/api/v1/discovery`.

| Action Name | Description | Input Schema Example |
| :--- | :--- | :--- |
| `stealth_dom_fetch` | Headless web page fetch from Cloudflare edge | `{ "url": "https://example.com" }` |
| `airgap_pii_scrub` | Redact SSN, phone, email, ZIP via Workers AI | `{ "text": "Call me at 555-0199" }` |
| `rag_shrink_html` | Strip HTML boilerplate to clean Markdown for RAG | `{ "html": "<html>...</html>" }` |
| `code_denoise` | Remove comments, docstrings, sourcemaps from code | `{ "code": "const x = 1;" }` |
| `domain_check` | Query RDAP registry for domain availability | `{ "domain": "example.com" }` |
| `dex_price_summary` | Real-time DEX token price, volume, liquidity | `{ "query": "USDC" }` |
| `x_sentiment` | Social & market sentiment scoring | `{ "topic": "crypto market" }` |
| `image_ocr_shrink` | Vision OCR text and table extraction | `{ "imageUrl": "https://..." }` |
| `embed_text` | 768-dim text embedding generation | `{ "text": "sample text" }` |
| `embed_multilingual` | 1024-dim multilingual text embedding generation | `{ "text": "sample text" }` |
| `summarize_text` | Executive TL;DR document summarization | `{ "text": "long text string" }` |
| `crypto_coverage` | Check data coverage, supported pairs, and date boundaries | `{ "pair": "AERO/USD" }` |
| `crypto_spread_candles` | Fetch cross-venue CEX-DEX spread candles (OHLC) | `{ "pair": "AERO/USD", "date": "2026-09-14" }` |
| `crypto_dislocations` | Fetch cross-venue market dislocation and spread arbitrage events | `{ "pair": "AERO/USD", "date": "2026-09-14" }` |
| `crypto_execution_latency` | Benchmark cross-venue execution speed, venue latencies, and fill rates | `{ "date": "2026-09-14" }` |
| `crypto_shadow_capacity` | Measure uncaptured arbitrage volume capacity and capital constraint metrics | `{ "date": "2026-09-14" }` |

## Ecosystem Packages

- 🤖 **MCP Server (Any AI Agent):** [`@zeromodern/mcp-server-0mod`](https://github.com/zeromodern/mcp-server-0mod)
- 🟣 **ElizaOS Plugin:** [`@zeromodern/eliza-plugin-0mod`](https://github.com/zeromodern/eliza-plugin-0mod)
- 🔵 **Coinbase AgentKit Provider:** [`@zeromodern/agentkit-provider-0mod`](https://github.com/zeromodern/agentkit-provider-0mod)
- ⚡️ **Live Gateway Service:** [api.0mod.com](https://api.0mod.com)

## Troubleshooting

- **Import error:** Make sure you're importing from `@zeromodern/agentkit-provider-0mod`.
- **Payment / Auth errors:** Ensure `PAYER_PRIVATE_KEY` is set with a valid Base EVM private key holding a USDC balance for x402 micropayments.

## License

MIT
