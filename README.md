# `@0mod/agentkit-provider`

Coinbase AgentKit Action Provider for **0mod API Gateway** (`api.0mod.com`) using HTTP 402 Payment Required micropayments on Base.

## Supported Actions

1. `stealth_dom_fetch`: Headless web page fetch from Cloudflare edge.
2. `airgap_pii_scrub`: Redacts SSNs, phone numbers, emails, and ZIP codes using Workers AI.
3. `rag_shrink_html`: Strips HTML boilerplate down to clean Markdown/headings for RAG.

## Usage in AgentKit

```typescript
import { AgentKit } from "@coinbase/agentkit";
import { zeroModActionProvider } from "@0mod/agentkit-provider";

const agentKit = await AgentKit.from({
  actionProviders: [
    zeroModActionProvider(),
  ],
});
```
