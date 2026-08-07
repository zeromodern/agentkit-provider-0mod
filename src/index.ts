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

const EmbedTextSchema = z.object({
  text: z.union([z.string(), z.array(z.string())]).describe("Text string or array of strings to generate 768-dim BGE-Base embeddings for"),
});

const EmbedMultilingualSchema = z.object({
  text: z.union([z.string(), z.array(z.string())]).describe("Text string or array of strings to generate 1024-dim BGE-Large embeddings for"),
});

const SummarizeSchema = z.object({
  text: z.string().describe("Source text payload to summarize"),
  format: z.enum(["bullets", "paragraph", "executive"]).optional().describe("Summary output style format"),
  maxLength: z.number().optional().describe("Target word count limit"),
});

async function safeFetchGateway(endpoint: string, payload: Record<string, any>): Promise<string> {
  try {
    const res = await fetch(`https://api.0mod.com/api/v1/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 402) {
      let paymentInfo: any = {};
      const paymentHeader = res.headers.get("payment-required") || res.headers.get("x-payment-response");
      try {
        paymentInfo = await res.json();
      } catch {
        paymentInfo = { raw: await res.text() };
      }
      return JSON.stringify({
        error: true,
        status: 402,
        message: "HTTP 402 Payment Required — payment verification required",
        paymentHeader,
        paymentRequirements: paymentInfo,
      });
    }

    if (!res.ok) {
      const errorText = await res.text();
      return JSON.stringify({
        error: true,
        status: res.status,
        message: `Gateway call failed with status ${res.status}`,
        details: errorText.slice(0, 500),
      });
    }

    return JSON.stringify(await res.json());
  } catch (error: any) {
    return JSON.stringify({
      error: true,
      message: "Network call to gateway failed",
      details: error?.message || String(error),
    });
  }
}

export class ZeroModActionProvider extends ActionProvider<WalletProvider> {
  constructor() {
    super("0mod-gateway", []);
  }

  @CreateAction({
    name: "stealth_dom_fetch",
    description: "Fetch web pages from Cloudflare edge bypassing simple IP blocks",
    schema: StealthDomSchema,
  })
  async stealthDom(_walletProvider: WalletProvider, args: z.infer<typeof StealthDomSchema>): Promise<string> {
    return safeFetchGateway("stealth-dom", args);
  }

  @CreateAction({
    name: "airgap_pii_scrub",
    description: "Redact SSN, phone, email, ZIP from text using Cloudflare Workers AI",
    schema: AirgapScrubSchema,
  })
  async airgapScrub(_walletProvider: WalletProvider, args: z.infer<typeof AirgapScrubSchema>): Promise<string> {
    return safeFetchGateway("airgap-scrub", args);
  }

  @CreateAction({
    name: "rag_shrink_html",
    description: "Compress raw HTML down to structured headings and markdown for RAG",
    schema: RagShrinkSchema,
  })
  async ragShrink(_walletProvider: WalletProvider, args: z.infer<typeof RagShrinkSchema>): Promise<string> {
    return safeFetchGateway("rag-shrink", args);
  }

  @CreateAction({
    name: "code_denoise",
    description: "Strip comments, docstrings, whitespace, and sourcemaps from code to compress LLM prompt window",
    schema: CodeDenoiseSchema,
  })
  async codeDenoise(_walletProvider: WalletProvider, args: z.infer<typeof CodeDenoiseSchema>): Promise<string> {
    return safeFetchGateway("code-denoise", args);
  }

  @CreateAction({
    name: "domain_check",
    description: "Query global RDAP registry from edge for domain availability and WHOIS status",
    schema: DomainCheckSchema,
  })
  async domainCheck(_walletProvider: WalletProvider, args: z.infer<typeof DomainCheckSchema>): Promise<string> {
    return safeFetchGateway("domain-check", args);
  }

  @CreateAction({
    name: "dex_price_summary",
    description: "Fetch real-time DEX price, 24h volume, liquidity, and top pair stats across chains",
    schema: DexPriceSchema,
  })
  async dexPrice(_walletProvider: WalletProvider, args: z.infer<typeof DexPriceSchema>): Promise<string> {
    return safeFetchGateway("dex-price-summary", args);
  }

  @CreateAction({
    name: "x_sentiment",
    description: "Analyze market & social sentiment for topics/tokens using Workers AI Llama 3.1",
    schema: XSentimentSchema,
  })
  async xSentiment(_walletProvider: WalletProvider, args: z.infer<typeof XSentimentSchema>): Promise<string> {
    return safeFetchGateway("x-sentiment", args);
  }

  @CreateAction({
    name: "image_ocr_shrink",
    description: "Extract clean text and table markdown from images via Workers AI Vision Llama 3.2",
    schema: ImageOcrSchema,
  })
  async imageOcr(_walletProvider: WalletProvider, args: z.infer<typeof ImageOcrSchema>): Promise<string> {
    return safeFetchGateway("image-ocr-shrink", args);
  }

  @CreateAction({
    name: "embed_text",
    description: "Generates 768-dimensional dense vector embeddings for RAG & semantic search via BAAI BGE-Base",
    schema: EmbedTextSchema,
  })
  async embedText(_walletProvider: WalletProvider, args: z.infer<typeof EmbedTextSchema>): Promise<string> {
    return safeFetchGateway("embed-text", args);
  }

  @CreateAction({
    name: "embed_multilingual",
    description: "Generates 1024-dimensional dense vector embeddings for multilingual & long text via BAAI BGE-Large",
    schema: EmbedMultilingualSchema,
  })
  async embedMultilingual(_walletProvider: WalletProvider, args: z.infer<typeof EmbedMultilingualSchema>): Promise<string> {
    return safeFetchGateway("embed-multilingual", args);
  }

  @CreateAction({
    name: "summarize_text",
    description: "Executive TL;DR text summarizer producing structured bullet points via Workers AI Llama 3.1",
    schema: SummarizeSchema,
  })
  async summarize(_walletProvider: WalletProvider, args: z.infer<typeof SummarizeSchema>): Promise<string> {
    return safeFetchGateway("summarize", args);
  }

  supportsNetwork = (network: Network) => network.protocolFamily === "evm";
}

export const zeroModActionProvider = () => new ZeroModActionProvider();
