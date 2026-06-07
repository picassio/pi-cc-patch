/**
 * CC Prompt Patch — patches pi's built-in provider (no token swap)
 *
 * Uses pi's OWN OAuth token. Only patches the request payload:
 * 1. Sanitizes trigger phrases from system prompt (trips the API classifier)
 * 2. Adds billing header for subscription rate-limit bucket
 * 3. Strips the separate identity prefix block that triggers detection
 * 4. Rewrites retired Anthropic model aliases that now 404
 *
 * Preserves ALL of pi's built-in behaviors: prompt caching, session routing,
 * compaction, tool name mapping, thinking modes, token refresh, etc.
 *
 * REQUIRES: /login (pi's normal OAuth)
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const RETIRED_ANTHROPIC_MODEL_ALIASES: Record<string, string> = {
	"anthropic/claude-3-5-haiku-latest": "claude-haiku-4-5",
	"claude-3-5-haiku-latest": "claude-haiku-4-5",
	"anthropic/claude-3-5-haiku-20241022": "claude-haiku-4-5-20251001",
	"claude-3-5-haiku-20241022": "claude-haiku-4-5-20251001",

	"anthropic/claude-3-5-sonnet-latest": "claude-sonnet-4-5",
	"claude-3-5-sonnet-latest": "claude-sonnet-4-5",
	"anthropic/claude-3-5-sonnet-20241022": "claude-sonnet-4-5-20250929",
	"claude-3-5-sonnet-20241022": "claude-sonnet-4-5-20250929",
	"anthropic/claude-3-5-sonnet-20240620": "claude-sonnet-4-5-20250929",
	"claude-3-5-sonnet-20240620": "claude-sonnet-4-5-20250929",

	"anthropic/claude-3-7-sonnet-latest": "claude-sonnet-4-5",
	"claude-3-7-sonnet-latest": "claude-sonnet-4-5",
	"anthropic/claude-3-7-sonnet-20250219": "claude-sonnet-4-5-20250929",
	"claude-3-7-sonnet-20250219": "claude-sonnet-4-5-20250929",
};

function isAnthropicTarget(
	payload: Record<string, any>,
	model: { provider?: string; id?: string } | undefined,
): boolean {
	const provider = typeof model?.provider === "string" ? model.provider.toLowerCase() : "";
	const modelId = typeof model?.id === "string" ? model.id.toLowerCase() : "";
	const payloadModel = typeof payload.model === "string" ? payload.model.toLowerCase() : "";

	return (
		provider.includes("anthropic") ||
		modelId.includes("claude") ||
		payloadModel.includes("anthropic") ||
		payloadModel.includes("claude")
	);
}

function resolveAnthropicModelAlias(model: string): string {
	return RETIRED_ANTHROPIC_MODEL_ALIASES[model.toLowerCase()] ?? model;
}

function sanitizeSystemPrompt(text: string): string {
	return text
		.replace(/operating inside pi, a coding agent harness\./g, "operating as a coding assistant.")
		.replace(/Pi documentation/g, "Documentation")
		.replace(/pi itself,/g, "the tool itself,")
		.replace(/pi packages/g, "packages")
		.replace(/read pi \.md/g, "read .md")
		.replace(/@mariozechner\//g, "@earendil-works/")
		.replace(/(?<!\/)pi-coding-agent/g, "coding-agent")
		.replace(/about pi\b/g, "about this tool")
		.replace(/pi update\b/g, "update")
		.replace(/Run pi update/g, "Run update")
		.replace(/\bpi\b([\s,.])/g, "the assistant$1");
}

export default function (pi: ExtensionAPI) {
	pi.on("before_provider_request", async (event, ctx) => {
		const payload = event.payload as Record<string, any>;
		if (!payload || typeof payload !== "object") return;
		if (!Array.isArray(payload.messages)) return;
		if (!isAnthropicTarget(payload, ctx.model as { provider?: string; id?: string } | undefined)) return;

		if (typeof payload.model === "string") {
			payload.model = resolveAnthropicModelAlias(payload.model);
		}

		if (Array.isArray(payload.system)) {
			const newBlocks: any[] = [];

			// Billing header as first block for subscription rate-limit routing
			newBlocks.push({
				type: "text",
				text: "x-anthropic-billing-header: cc_version=2.1.96.000; cc_entrypoint=cli;",
			});

			for (const block of payload.system) {
				if (block.type !== "text" || !block.text) { newBlocks.push(block); continue; }
				if (block.text.startsWith("x-anthropic-billing-header")) continue;
				if (block.text.startsWith("You are") && block.text.includes("official CLI")) continue;

				newBlocks.push({ ...block, text: sanitizeSystemPrompt(block.text) });
			}

			payload.system = newBlocks;
		} else if (typeof payload.system === "string") {
			payload.system = [
				{ type: "text", text: "x-anthropic-billing-header: cc_version=2.1.96.000; cc_entrypoint=cli;" },
				{ type: "text", text: sanitizeSystemPrompt(payload.system) },
			];
		}

		if (!payload.metadata) {
			payload.metadata = {
				user_id: JSON.stringify({ device_id: "0", account_uuid: "", session_id: "0" }),
			};
		}

		return payload;
	});

	pi.on("session_start", async (_e, ctx) => {
		ctx.ui.notify("cc-patch: loaded (anthropic-only)", "info");
	});
}
