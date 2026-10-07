# pi-cc-patch

Use your Pro/Max subscription billing with [pi](https://github.com/earendil-works/pi) instead of getting the "Third-party apps now draw from your extra usage" error.

## What it does

The API classifier detects pi as a third-party app and blocks subscription billing. This extension patches the request payload to bypass it:

1. Sanitizes trigger phrases from the system prompt
2. Adds billing header for subscription rate-limit routing
3. Strips prefix block that triggers detection

Version 1.0.3 advertises Claude Code 2.1.280 in the subscription billing block to meet the minimum version reported by Anthropic for Opus 5.5. The previous 2.1.261 identity is rejected with `claude_code_version_too_old`. This updates the request identity; model availability still depends on Pi's model catalog and your Anthropic account.

Scope: this patch runs only for direct Anthropic OAuth requests, identified by Pi's OAuth-only Claude Code identity block. Anthropic API-key, Amazon Bedrock, OpenRouter, gateway, and other provider requests are left unchanged.

No token swap, no SDK dependency, no proxy. Just a `before_provider_request` hook. Pi's built-in provider handles everything else — caching, token refresh, thinking, streaming, tool mapping.

## Install

```bash
pi install git:github.com/picassio/pi-cc-patch
```

Then restart pi. Use `/login` if you haven't already.

## Verify locally

```bash
npm test
```

The tests cover Opus 5.5 and Fable 5.1 OAuth payload rewriting, replacement of an older billing block, preservation of existing metadata and prompt cache settings, and unchanged API-key/Bedrock/OpenRouter requests. They do not verify live API acceptance or billing.

To try the working tree before publishing, start Pi with `pi -e ./index.ts`, select Opus 5.5 via `/model`, and send a short prompt. Avoid loading another copy of this extension at the same time.

## Uninstall

```bash
pi remove git:github.com/picassio/pi-cc-patch
```
