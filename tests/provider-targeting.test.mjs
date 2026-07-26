import assert from "node:assert/strict";
import test from "node:test";

import extension from "../index.ts";

function registerHandler() {
	let handler;
	extension({
		on(event, candidate) {
			if (event === "before_provider_request") handler = candidate;
		},
	});
	assert.equal(typeof handler, "function");
	return handler;
}

const oauthIdentity = {
	type: "text",
	text: "You are Claude Code, Anthropic's official CLI for Claude.",
	cache_control: { type: "ephemeral" },
};

function clone(value) {
	return structuredClone(value);
}

test("rewrites direct Anthropic OAuth payloads", async () => {
	const handler = registerHandler();
	const payload = {
		model: "claude-opus-5",
		messages: [{ role: "user", content: "hello" }],
		system: [oauthIdentity, { type: "text", text: "You are operating inside pi, a coding agent harness." }],
	};

	const result = await handler(
		{ payload },
		{ model: { provider: "anthropic", id: "claude-opus-5" } },
	);

	assert.equal(result, payload);
	assert.match(payload.system[0].text, /^x-anthropic-billing-header:/);
	assert.equal(payload.system.some((block) => block.text?.includes("official CLI")), false);
	assert.equal(payload.system[1].text, "You are operating as a coding assistant.");
	assert.equal(typeof payload.metadata.user_id, "string");
});

test("leaves direct Anthropic API-key payloads unchanged", async () => {
	const handler = registerHandler();
	const payload = {
		model: "claude-opus-5",
		messages: [{ role: "user", content: "hello" }],
		system: [{ type: "text", text: "You are operating inside pi, a coding agent harness." }],
	};
	const before = clone(payload);

	const result = await handler(
		{ payload },
		{ model: { provider: "anthropic", id: "claude-opus-5" } },
	);

	assert.equal(result, undefined);
	assert.deepEqual(payload, before);
});

test("leaves Amazon Bedrock Claude payloads unchanged", async () => {
	const handler = registerHandler();
	const payload = {
		modelId: "global.anthropic.claude-opus-5",
		messages: [{ role: "user", content: [{ text: "hello" }] }],
		system: [{ text: "normal bedrock prompt" }],
		inferenceConfig: { maxTokens: 128000 },
	};
	const before = clone(payload);

	const result = await handler(
		{ payload },
		{ model: { provider: "amazon-bedrock", id: "global.anthropic.claude-opus-5" } },
	);

	assert.equal(result, undefined);
	assert.deepEqual(payload, before);
});

test("leaves OpenRouter Claude payloads unchanged", async () => {
	const handler = registerHandler();
	const payload = {
		model: "anthropic/claude-opus-5",
		messages: [{ role: "user", content: "hello" }],
		system: [{ type: "text", text: "You are operating inside pi, a coding agent harness." }],
	};
	const before = clone(payload);

	const result = await handler(
		{ payload },
		{ model: { provider: "openrouter", id: "anthropic/claude-opus-5" } },
	);

	assert.equal(result, undefined);
	assert.deepEqual(payload, before);
});
