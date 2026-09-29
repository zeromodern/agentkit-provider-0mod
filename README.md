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

With `@zeromodern/agentkit-provider-0mod`, quants and autonomous AI agents pay strictly per telemetry slice via HTTP 402 micropayments on Base USDC. Pricing is dynamically negotiated per request via the gateway's HTTP 402 challenge header (view live rates at [api.0mod.com](https://api.0mod.com)), allowing a complete 24-hour high-resolution strategy backtest to execute for micropayments instead of an enterprise $1,000/month commitment.

See [`examples/quant_backtest_sprint.ts`](./examples/quant_backtest_sprint.ts) for the full runnable script.


## Available Actions

> 💡 **Pricing**: The table below lists per-call USDC prices as published by the gateway discovery manifest. For live rates and endpoint status, visit [api.0mod.com](https://api.0mod.com) or `GET https://api.0mod.com/api/v1/discovery`. All calls are settled per request via HTTP 402 micropayments on Base USDC.

| Action Name | Gateway Endpoint | Price (USDC) | Description | Input Schema Example |
| :--- | :--- | :--- | :--- | :--- |
| `stealth_dom_fetch` | `POST /stealth-dom` | $0.00400 | Headless web page fetch from Cloudflare edge | `{ "url": "https://example.com" }` |
| `airgap_pii_scrub` | `POST /airgap-scrub` | $0.00400 | Redact SSN, phone, email, ZIP via Workers AI | `{ "text": "Call me at 555-0199" }` |
| `rag_shrink_html` | `POST /rag-shrink` | $0.00250 | Strip HTML boilerplate to clean Markdown for RAG | `{ "html": "<html>...</html>" }` |
| `code_denoise` | `POST /code-denoise` | $0.00400 | Remove comments, docstrings, sourcemaps from code | `{ "code": "const x = 1;" }` |
| `domain_check` | `POST /domain-check` | $0.00800 | Query RDAP registry for domain availability | `{ "domain": "example.com" }` |
| `dex_price_summary` | `POST /dex-price-summary` | $0.00150 | Real-time DEX token price, volume, liquidity | `{ "query": "USDC" }` |
| `x_sentiment` | `POST /x-sentiment` | $0.00450 | Social & market sentiment scoring | `{ "topic": "crypto market" }` |
| `image_ocr_shrink` | `POST /image-ocr-shrink` | $0.00800 | Vision OCR text and table extraction | `{ "imageUrl": "https://..." }` |
| `embed_text` | `POST /embed-text` | $0.00400 | 768-dim text embedding generation | `{ "text": "sample text" }` |
| `embed_multilingual` | `POST /embed-multilingual` | $0.00500 | 1024-dim multilingual text embedding generation | `{ "text": "sample text" }` |
| `summarize_text` | `POST /summarize` | $0.00700 | Executive TL;DR document summarization | `{ "text": "long text string" }` |
| `crypto_coverage` | `GET /crypto/coverage` | Free | Check data coverage, supported pairs, and date boundaries | `{ "pair": "AERO/USD" }` |
| `crypto_spread_candles` | `GET /crypto/spread-candles` | $0.01500 | Fetch cross-venue CEX-DEX spread candles (OHLC) | `{ "pair": "AERO/USD", "date": "2026-09-14" }` |
| `crypto_dislocations` | `GET /crypto/dislocations` | $0.04500 | Fetch cross-venue market dislocation and spread arbitrage events | `{ "pair": "AERO/USD", "date": "2026-09-14" }` |
| `crypto_execution_latency` | `GET /crypto/execution-latency` | $0.07500 | Benchmark cross-venue execution speed, venue latencies, and fill rates | `{ "date": "2026-09-14" }` |
| `crypto_shadow_capacity` | `GET /crypto/shadow-capacity` | $0.15000 | Measure uncaptured arbitrage volume capacity and capital constraint metrics | `{ "date": "2026-09-14" }` |
| `crypto_labeled_dislocations` | `GET /crypto/labeled-dislocations` | $0.07500 | ML-labeled dislocation events with persistence, on-chain capture, slippage & regime annotations | `{ "pair": "AERO/USD", "date": "2026-09-14", "time": "1400" }` |
| `crypto_attributed_executions` | `GET /crypto/attributed-executions` | $0.07500 | Strategy-attributed executions with per-arm realized PnL, volume, fills & belt cost | `{ "pair": "AERO/USD", "date": "2026-09-14" }` |
| `crypto_impact_simulation` | `POST /crypto/impact-simulation` | $0.07500 | Simulate order-book impact: expected fill price, slippage, fill ratio & executable levels | `{ "pair": "AERO/USD", "side": "buy", "size_usd": 10000 }` |

### Usage Examples — v1.5.0 Actions

#### 1. `crypto_labeled_dislocations` — ML-labeled dislocation feed

Returns dislocations annotated with validation status (`status`, `status_v2`), persistence flags (`persisted_30s`, `persisted_60s`), on-chain capture (`captured_onchain`), and realized economics (`raw_spread_bps`, `trade_spread_bps`, `net_spread_bps`, `liquidity_depth_usd`, `slippage_bps`, `sim_net_bps`, `dex_fee_embedded`) plus the detected `regime`.

```typescript
const raw = await provider.cryptoLabeledDislocations({} as any, {
  pair: "AERO/USD",
  date: "2026-09-14",
  time: "1400",
});
const slice = JSON.parse(raw);
for (const d of slice.dislocations ?? []) {
  console.log(
    `${d.timestamp} ${d.direction} ${d.status}/${d.status_v2} ` +
    `net=${d.net_spread_bps}bps persisted30s=${d.persisted_30s} ` +
    `onchain=${d.captured_onchain} regime=${d.regime}`
  );
}
```

#### 2. `crypto_attributed_executions` — per-strategy-attribution ledger

Returns execution fills attributed to a strategy `config_hash` and bandit `arm_id`, with realized net PnL (`realized_net_usd`), traded `volume_usd`, `fills`, and gateway `belt_cost`.

```typescript
const raw = await provider.cryptoAttributedExecutions({} as any, {
  pair: "AERO/USD",
  date: "2026-09-14",
});
const report = JSON.parse(raw);
for (const e of report.executions ?? []) {
  console.log(
    `${e.timestamp} cfg=${e.config_hash} arm=${e.arm_id} ` +
    `net=$${e.realized_net_usd} vol=$${e.volume_usd} ` +
    `fills=${e.fills} belt=$${e.belt_cost}`
  );
}
```

#### 3. `crypto_impact_simulation` — pre-trade order impact

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

## License

MIT
