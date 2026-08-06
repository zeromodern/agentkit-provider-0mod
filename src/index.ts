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

const CodeDenoiseSchema = z.object({
  code: z.string().describe("Code content to strip comments and docstrings from"),
  language: z.string().optional().describe("Programming language"),
});

const DomainCheckSchema = z.object({
  domain: z.string().describe("Domain name to check RDAP availability"),
});

const DexPriceSchema = z.object({
  query: z.string().describe("Token symbol or contract address"),
});

const XSentimentSchema = z.object({
  topic: z.string().describe("Topic, ticker, or text sample to analyze"),
});

const ImageOcrSchema = z.object({
  imageUrl: z.string().url().describe("Public image URL to extract text and tables from"),
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

  @CreateAction({
    name: "code_denoise",
    description: "Strip comments, docstrings, whitespace, and sourcemaps from code to compress LLM prompt window",
    schema: CodeDenoiseSchema,
  })
  async codeDenoise(walletProvider: WalletProvider, args: z.infer<typeof CodeDenoiseSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/code-denoise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  @CreateAction({
    name: "domain_check",
    description: "Query global RDAP registry from edge for domain availability and WHOIS status",
    schema: DomainCheckSchema,
  })
  async domainCheck(walletProvider: WalletProvider, args: z.infer<typeof DomainCheckSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/domain-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  @CreateAction({
    name: "dex_price_summary",
    description: "Fetch real-time DEX price, 24h volume, liquidity, and top pair stats across chains",
    schema: DexPriceSchema,
  })
  async dexPrice(walletProvider: WalletProvider, args: z.infer<typeof DexPriceSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/dex-price-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  @CreateAction({
    name: "x_sentiment",
    description: "Analyze market & social sentiment for topics/tokens using Workers AI Llama 3.1",
    schema: XSentimentSchema,
  })
  async xSentiment(walletProvider: WalletProvider, args: z.infer<typeof XSentimentSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/x-sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  @CreateAction({
    name: "image_ocr_shrink",
    description: "Extract clean text and table markdown from images via Workers AI Vision Llama 3.2",
    schema: ImageOcrSchema,
  })
  async imageOcr(walletProvider: WalletProvider, args: z.infer<typeof ImageOcrSchema>): Promise<string> {
    const res = await fetch("https://api.0mod.com/api/v1/image-ocr-shrink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return JSON.stringify(await res.json());
  }

  supportsNetwork = (network: Network) => network.protocolFamily === "evm";
}

export const zeroModActionProvider = () => new ZeroModActionProvider();
