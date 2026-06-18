import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.registerProvider("cliproxy-claude", {
		baseUrl: "http://127.0.0.1:8317",
		apiKey: "local-pi-cliproxy",
		api: "anthropic-messages",
		models: [
			{
				id: "claude-haiku-4-5",
				name: "Claude Haiku 4.5 via CLIProxyAPI",
				reasoning: true,
				input: ["text", "image"],
				cost: { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 1.25 },
				contextWindow: 200000,
				maxTokens: 64000,
			},
			{
				id: "claude-sonnet-4-5",
				name: "Claude Sonnet 4.5 via CLIProxyAPI",
				reasoning: true,
				input: ["text", "image"],
				cost: { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
				contextWindow: 200000,
				maxTokens: 64000,
			},
			{
				id: "claude-opus-4-6",
				name: "Claude Opus 4.6 via CLIProxyAPI",
				reasoning: true,
				input: ["text", "image"],
				cost: { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 },
				contextWindow: 200000,
				maxTokens: 64000,
			},
		],
	});

	pi.on("session_start", async (_event, ctx) => {
		ctx.ui.notify("cliproxy-claude provider registered", "info");
	});
}
