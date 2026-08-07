# @zeromodern/agentkit-provider-0mod

[![npm](https://img.shields.io/npm/v/@zeromodern/agentkit-provider-0mod?style=flat-square)](https://www.npmjs.com/package/@zeromodern/agentkit-provider-0mod) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

Coinbase AgentKit action provider for the [0mod API Gateway](https://api.0mod.com). HTTP 402 micropayments on Base handled automatically.

## Requirements

- Node.js >= 18
- npm >= 9

## Install

```bash
npm install @zeromodern/agentkit-provider-0mod
```

## Setup

```typescript
import { AgentKit } from "@coinbase/agentkit";
import { zeroModActionProvider } from "@zeromodern/agentkit-provider-0mod";

const agentKit = await AgentKit.from({
  actionProviders: [
    zeroModActionProvider(),
  ],
});
```

Set your API key:

```env
ZERO_API_KEY=your_api_key_here
```

## Actions

| Action | Description |
|--------|-------------|
| `stealth_dom_fetch` | Headless web page fetch from Cloudflare edge |
| `airgap_pii_scrub` | Redact SSN, phone, email, ZIP via Workers AI |
| `rag_shrink_html` | Strip HTML boilerplate to clean Markdown for RAG |
| `code_denoise` | Remove comments, docstrings, sourcemaps from code |
| `domain_check` | Query RDAP registry for domain availability |
| `dex_price` | Real-time DEX token price, volume, liquidity |
| `x_sentiment` | Social & market sentiment scoring |
| `image_ocr` | Vision OCR text and table extraction |
| `embed_text` | Text embedding generation |
| `embed_multilingual` | Multilingual text embedding generation |
| `summarize` | Document summarization |

## Troubleshooting

- **Import error:** Make sure you're importing from `@zeromodern/agentkit-provider-0mod`, not `@0mod/agentkit-provider`.
- **Authentication errors:** Ensure `ZERO_API_KEY` is set and valid. Check [api.0mod.com](https://api.0mod.com) for key status.
- **Action failures:** Check that the target URL or input is reachable. The 402 payment must succeed on Base before the tool executes.

## License

MIT
