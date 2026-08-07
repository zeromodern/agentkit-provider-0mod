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
    async ragShrink(_walletProvider, args) {
        return safeFetchGateway("rag-shrink", args);
    }
    async codeDenoise(_walletProvider, args) {
        return safeFetchGateway("code-denoise", args);
    }
    async domainCheck(_walletProvider, args) {
        return safeFetchGateway("domain-check", args);
    }
    async dexPrice(_walletProvider, args) {
        return safeFetchGateway("dex-price-summary", args);
    }
    async xSentiment(_walletProvider, args) {
        return safeFetchGateway("x-sentiment", args);
    }
    async imageOcr(_walletProvider, args) {
        return safeFetchGateway("image-ocr-shrink", args);
    }
    async embedText(_walletProvider, args) {
        return safeFetchGateway("embed-text", args);
    }
    async embedMultilingual(_walletProvider, args) {
        return safeFetchGateway("embed-multilingual", args);
    }
    async summarize(_walletProvider, args) {
        return safeFetchGateway("summarize", args);
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
        name: "rag_shrink_html",
        description: "Compress raw HTML down to structured headings and markdown for RAG",
        schema: RagShrinkSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "ragShrink", null);
__decorate([
    CreateAction({
        name: "code_denoise",
        description: "Strip comments, docstrings, whitespace, and sourcemaps from code to compress LLM prompt window",
        schema: CodeDenoiseSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "codeDenoise", null);
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
        name: "x_sentiment",
        description: "Analyze market & social sentiment for topics/tokens using Workers AI Llama 3.1",
        schema: XSentimentSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "xSentiment", null);
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
        name: "embed_text",
        description: "Generates 768-dimensional dense vector embeddings for RAG & semantic search via BAAI BGE-Base",
        schema: EmbedTextSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "embedText", null);
__decorate([
    CreateAction({
        name: "embed_multilingual",
        description: "Generates 1024-dimensional dense vector embeddings for multilingual & long text via BAAI BGE-Large",
        schema: EmbedMultilingualSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "embedMultilingual", null);
__decorate([
    CreateAction({
        name: "summarize_text",
        description: "Executive TL;DR text summarizer producing structured bullet points via Workers AI Llama 3.1",
        schema: SummarizeSchema,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [WalletProvider, void 0]),
    __metadata("design:returntype", Promise)
], ZeroModActionProvider.prototype, "summarize", null);
export const zeroModActionProvider = () => new ZeroModActionProvider();
