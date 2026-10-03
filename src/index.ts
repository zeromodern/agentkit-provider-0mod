import { ActionProvider, CreateAction, Network, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

let cachedFetchClient: typeof fetch | null = null;

function getFetchClient(): typeof fetch {
  if (cachedFetchClient) return cachedFetchClient;
  const pkey = process.env.PAYER_PRIVATE_KEY || process.env.EVM_PRIVATE_KEY || process.env.X402_PRIVATE_KEY;
  if (!pkey) {
    cachedFetchClient = fetch;
    return fetch;
  }
  try {
    const client = new x402Client();
    const formattedKey = (pkey.startsWith("0x") ? pkey : `0x${pkey}`) as `0x${string}`;
    registerExactEvmScheme(client, { signer: privateKeyToAccount(formattedKey) });
    cachedFetchClient = wrapFetchWithPayment(fetch, client);
    return cachedFetchClient;
  } catch (err) {
    console.error("Failed to initialize x402 auto-payment client:", err);
    cachedFetchClient = fetch;
    return fetch;
  }
}

const StealthDomSchema = z.object({
  url: z.string().url().describe("Target URL to fetch from edge"),
});

const AirgapScrubSchema = z.object({
  text: z.string().describe("Input text containing potential PII"),
  strictMode: z.boolean().optional().describe("Enable Llama 3.1 edge AI redaction"),
});

const DomainCheckSchema = z.object({
  domain: z.string().describe("Domain name to check RDAP availability"),
});

const DexPriceSchema = z.object({
  query: z.string().describe("Token symbol or contract address"),
});

const ImageOcrSchema = z.object({
  imageUrl: z.string().url().describe("Public image URL to extract text and tables from"),
});

const CryptoCoverageSchema = z.object({
  pair: z.string().optional().describe("Optional token pair filter (e.g. AERO/USD)"),
});

const CryptoSpreadCandlesSchema = z.object({
  pair: z.string().describe("Token pair (e.g. AERO/USD)"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  time: z.string().optional().describe("Time slice in HHMM format (default 0000)"),
  interval: z.string().optional().describe("Candle interval (default 15m)"),
});

const CryptoDislocationsSchema = z.object({
  pair: z.string().describe("Token pair (e.g. AERO/USD)"),
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  time: z.string().optional().describe("Time slice in HHMM format (default 0000)"),
});

const CryptoExecutionLatencySchema = z.object({
  date: z.string().optional().describe("Date in YYYY-MM-DD format"),
  time: z.string().optional().describe("Time slice in HHMM format (default 0000)"),
  venue: z.string().optional().describe("Optional venue filter (coinbase | base_dex)"),
});

const CryptoImpactSimulationSchema = z.object({
  pair: z.string().describe("Token pair (e.g. AERO/USD)"),
  side: z.enum(["buy", "sell"]).describe("Order side to simulate"),
  size_usd: z.number().optional().describe("Order size denominated in USD (provide this or size_base)"),
  size_base: z.number().optional().describe("Order size denominated in base token units (provide this or size_usd)"),
});

async function safeFetchGateway(endpoint: string, payload: Record<string, any>): Promise<string> {
  try {
    const fetchFn = getFetchClient();
    const res = await fetchFn(`https://api.0mod.com/api/v1/${endpoint}`, {
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
    name: "image_ocr_shrink",
    description: "Extract clean text and table markdown from images via Workers AI Vision Llama 3.2",
    schema: ImageOcrSchema,
  })
  async imageOcr(_walletProvider: WalletProvider, args: z.infer<typeof ImageOcrSchema>): Promise<string> {
    return safeFetchGateway("image-ocr-shrink", args);
  }

  @CreateAction({
    name: "crypto_coverage",
    description: "Check data coverage, supported pairs, and date boundaries for crypto telemetry",
    schema: CryptoCoverageSchema,
  })
  async cryptoCoverage(_walletProvider: WalletProvider, args: z.infer<typeof CryptoCoverageSchema>): Promise<string> {
    return safeFetchGateway("crypto/coverage", args);
  }

  @CreateAction({
    name: "crypto_spread_candles",
    description: "Fetch cross-venue CEX-DEX spread candles (OHLC) for a token pair",
    schema: CryptoSpreadCandlesSchema,
  })
  async cryptoSpreadCandles(_walletProvider: WalletProvider, args: z.infer<typeof CryptoSpreadCandlesSchema>): Promise<string> {
    return safeFetchGateway("crypto/spread-candles", args);
  }

  @CreateAction({
    name: "crypto_dislocations",
    description: "Fetch cross-venue market dislocation and spread arbitrage events for a token pair",
    schema: CryptoDislocationsSchema,
  })
  async cryptoDislocations(_walletProvider: WalletProvider, args: z.infer<typeof CryptoDislocationsSchema>): Promise<string> {
    return safeFetchGateway("crypto/dislocations", args);
  }

  @CreateAction({
    name: "crypto_execution_latency",
    description: "Benchmark cross-venue execution speed, venue latencies, and fill rates",
    schema: CryptoExecutionLatencySchema,
  })
  async cryptoExecutionLatency(_walletProvider: WalletProvider, args: z.infer<typeof CryptoExecutionLatencySchema>): Promise<string> {
    return safeFetchGateway("crypto/execution-latency", args);
  }

  @CreateAction({
    name: "crypto_impact_simulation",
    description: "Simulate order-book impact for a given order size: expected fill price, slippage, fill ratio, and executable levels consumed",
    schema: CryptoImpactSimulationSchema,
  })
  async cryptoImpactSimulation(_walletProvider: WalletProvider, args: z.infer<typeof CryptoImpactSimulationSchema>): Promise<string> {
    return safeFetchGateway("crypto/impact-simulation", args);
  }

  supportsNetwork = (network: Network) => network.protocolFamily === "evm";
}

export const zeroModActionProvider = () => new ZeroModActionProvider();
