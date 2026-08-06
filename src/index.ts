import { ActionProvider, CreateAction, Network, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";

const StealthDomSchema = z.object({
  url: z.string().url().describe("Target URL to fetch from edge"),
});

const AirgapScrubSchema = z.object({
  text: z.string().describe("Input text containing potential PII"),
  strictMode: z.boolean().optional().describe("Enable Llama 3.1 edge AI redaction"),
});

const RagShrinkSchema = z.object({
  html: z.string().describe("Raw HTML string to shrink for RAG context"),
});

export class ZeroModActionProvider extends ActionProvider<WalletProvider> {
  constructor() {
    super("0mod-gateway", []);
  }

  @CreateAction({
    name: "stealth_dom_fetch",
    description: "Fetch web pages from Cloudflare edge bypassing simple IP blocks",
    schema: StealthDomSchema,
  })
  async stealthDom(walletProvider: WalletProvider, args: z.infer<typeof StealthDomSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/stealth-dom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  @CreateAction({
    name: "airgap_pii_scrub",
    description: "Redact SSN, phone, email, ZIP from text using Cloudflare Workers AI",
    schema: AirgapScrubSchema,
  })
  async airgapScrub(walletProvider: WalletProvider, args: z.infer<typeof AirgapScrubSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/airgap-scrub", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  @CreateAction({
    name: "rag_shrink_html",
    description: "Compress raw HTML down to structured headings and markdown for RAG",
    schema: RagShrinkSchema,
  })
  async ragShrink(walletProvider: WalletProvider, args: z.infer<typeof RagShrinkSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/rag-shrink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  supportsNetwork = (network: Network) => network.protocolFamily === "evm";
}

export const zeroModActionProvider = () => new ZeroModActionProvider();
