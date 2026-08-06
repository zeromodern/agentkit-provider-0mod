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
export class ZeroModActionProvider extends ActionProvider {
    constructor() {
        super("0mod-gateway", []);
    }
    async stealthDom(walletProvider, args) {
        const res = await fetch("https://api.0mod.com/api/v1/stealth-dom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args),
        });
        return JSON.stringify(await res.json());
    }
    async airgapScrub(walletProvider, args) {
        const res = await fetch("https://api.0mod.com/api/v1/airgap-scrub", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args),
        });
        return JSON.stringify(await res.json());
    }
    async ragShrink(walletProvider, args) {
        const res = await fetch("https://api.0mod.com/api/v1/rag-shrink", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args),
        });
        return JSON.stringify(await res.json());
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
export const zeroModActionProvider = () => new ZeroModActionProvider();
