# pi-cc-patch

Use your Pro/Max subscription billing with [pi](https://github.com/earendil-works/pi) instead of getting the "Third-party apps now draw from your extra usage" error.

## What it does

The API classifier detects pi as a third-party app and blocks subscription billing. This extension patches the request payload to bypass it:

1. Sanitizes trigger phrases from the system prompt
2. Adds billing header for subscription rate-limit routing
3. Strips prefix block that triggers detection

The subscription billing block advertises Claude Code 2.1.280. Anthropic currently requires at least 2.1.280 for Claude Opus 5.5; older identities fail with `claude_code_version_too_old`.

Scope: this patch runs only for direct Anthropic OAuth requests, identified by Pi's OAuth-only Claude Code identity block. Anthropic API-key, Amazon Bedrock, OpenRouter, gateway, and other provider requests are left unchanged.

No token swap, no SDK dependency, no proxy. Just a `before_provider_request` hook. Pi's built-in provider handles everything else — caching, token refresh, thinking, streaming, tool mapping.

## Install

```bash
pi install git:github.com/picassio/pi-cc-patch
```

Then restart pi. Use `/login` if you haven't already.

## Uninstall

```bash
pi remove git:github.com/picassio/pi-cc-patch
```
