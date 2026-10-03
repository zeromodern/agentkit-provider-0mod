var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ActionProvider, CreateAction, WalletProvider } from "@coinbase/agentkit";
import { z } from "zod";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";
let cachedFetchClient = null;
function getFetchClient() {
    if (cachedFetchClient)
        return cachedFetchClient;
    const pkey = process.env.PAYER_PRIVATE_KEY || process.env.EVM_PRIVATE_KEY || process.env.X402_PRIVATE_KEY;
    if (!pkey) {
        cachedFetchClient = fetch;
        return fetch;
    }
    try {
        const client = new x402Client();
        const formattedKey = (pkey.startsWith("0x") ? pkey : `0x${pkey}`);
        registerExactEvmScheme(client, { signer: privateKeyToAccount(formattedKey) });
        cachedFetchClient = wrapFetchWithPayment(fetch, client);
        return cachedFetchClient;
    }
    catch (err) {
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
async function safeFetchGateway(endpoint, payload) {
    try {
        const fetchFn = getFetchClient();
        const res = await fetchFn(`https://api.0mod.com/api/v1/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (res.status === 402) {
            let paymentInfo = {};
            const paymentHeader = res.headers.get("payment-required") || res.headers.get("x-payment-response");
            try {
                paymentInfo = await res.json();
            }
            catch {
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
    }
    catch (error) {
        return JSON.stringify({
            error: true,
            message: "Network call to gateway failed",
            details: error?.message || String(error),
        });
    }
}
export class ZeroModActionProvider extends ActionProvider {
    constructor() {
        super("0mod-gateway", []);
    }
    async stealthDom(_walletProvider, args) {
        return safeFetchGateway("stealth-dom", args);
    }
    async airgapScrub(_walletProvider, args) {
        return safeFetchGateway("airgap-scrub", args);
    }
    async domainCheck(_walletProvider, args) {
        return safeFetchGateway("domain-check", args);
    }
    async dexPrice(_walletProvider, args) {
        return safeFetchGateway("dex-price-summary", args);
    }
    async imageOcr(_walletProvider, args) {
        return safeFetchGateway("image-ocr-shrink", args);
    }
    async cryptoCoverage(_walletProvider, args) {
        return safeFetchGateway("crypto/coverage", args);
    }
    async cryptoSpreadCandles(_walletProvider, args) {
        return safeFetchGateway("crypto/spread-candles", args);
    }
    async cryptoDislocations(_walletProvider, args) {
        return safeFetchGateway("crypto/dislocations", args);
    }
    async cryptoExecutionLatency(_walletProvider, args) {
        return safeFetchGateway("crypto/execution-latency", args);
    }
    async cryptoImpactSimulation(_walletProvider, args) {
        return safeFetchGateway("crypto/impact-simulation", args);
    }
    supportsNetwork = (network) => network.protocolFamily === "evm";
}
__decorate([
    CreateAction({
        name: "stealth_dom_fetch",
        description: "Fetch web pages from Cloudflare edge bypassing simple IP blocks",
        schema: StealthDomSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "stealthDom", null);
__decorate([
    CreateAction({
        name: "airgap_pii_scrub",
        description: "Redact SSN, phone, email, ZIP from text using Cloudflare Workers AI",
        schema: AirgapScrubSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "airgapScrub", null);
__decorate([
    CreateAction({
        name: "domain_check",
        description: "Query global RDAP registry from edge for domain availability and WHOIS status",
        schema: DomainCheckSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "domainCheck", null);
__decorate([
    CreateAction({
        name: "dex_price_summary",
        description: "Fetch real-time DEX price, 24h volume, liquidity, and top pair stats across chains",
        schema: DexPriceSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "dexPrice", null);
__decorate([
    CreateAction({
        name: "image_ocr_shrink",
        description: "Extract clean text and table markdown from images via Workers AI Vision Llama 3.2",
        schema: ImageOcrSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "imageOcr", null);
__decorate([
    CreateAction({
        name: "crypto_coverage",
        description: "Check data coverage, supported pairs, and date boundaries for crypto telemetry",
        schema: CryptoCoverageSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "cryptoCoverage", null);
__decorate([
    CreateAction({
        name: "crypto_spread_candles",
        description: "Fetch cross-venue CEX-DEX spread candles (OHLC) for a token pair",
        schema: CryptoSpreadCandlesSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "cryptoSpreadCandles", null);
__decorate([
    CreateAction({
        name: "crypto_dislocations",
        description: "Fetch cross-venue market dislocation and spread arbitrage events for a token pair",
        schema: CryptoDislocationsSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "cryptoDislocations", null);
__decorate([
    CreateAction({
        name: "crypto_execution_latency",
        description: "Benchmark cross-venue execution speed, venue latencies, and fill rates",
        schema: CryptoExecutionLatencySchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "cryptoExecutionLatency", null);
__decorate([
    CreateAction({
        name: "crypto_impact_simulation",
        description: "Simulate order-book impact for a given order size: expected fill price, slippage, fill ratio, and executable levels consumed",
        schema: CryptoImpactSimulationSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "cryptoImpactSimulation", null);
export const zeroModActionProvider = () => new ZeroModActionProvider();
