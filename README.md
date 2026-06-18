# pi-cc-patch

Use your Pro/Max subscription billing with [pi](https://github.com/mariozechner/pi-coding-agent) instead of getting the "Third-party apps now draw from your extra usage" error.

## What it does

The API classifier detects pi as a third-party app and blocks subscription billing. This extension patches the request payload to bypass it:

1. Sanitizes trigger phrases from the system prompt
2. Adds billing header for subscription rate-limit routing
3. Strips prefix block that triggers detection

Scope: this patch only runs for Anthropic/Claude provider requests. Other providers are left unchanged.

No token swap, no SDK dependency, no proxy. Just a `before_provider_request` hook. Pi's built-in provider handles everything else — caching, token refresh, thinking, streaming, tool mapping.

## Install

```bash
pi install git:github.com/picassio/pi-cc-patch
```

Then restart pi. Use `/login` if you haven't already.

## Optional: CLIProxyAPI sidecar

This repo also includes an optional provider scaffold for [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI). Use this when you want CLIProxyAPI to own the Claude Code cloaking/signing and account routing instead of relying only on pi's `before_provider_request` hook.

Build and start CLIProxyAPI:

```bash
git clone https://github.com/router-for-me/CLIProxyAPI /tmp/CLIProxyAPI
cd /tmp/CLIProxyAPI
go build -o /tmp/cliproxyapi ./cmd/server
/tmp/cliproxyapi -config /path/to/pi-cc-patch/cliproxy.config.yaml -local-model
```

Add Claude OAuth credentials to CLIProxyAPI:

```bash
/tmp/cliproxyapi -config /path/to/pi-cc-patch/cliproxy.config.yaml -claude-login -no-browser
```

Then run pi with the local sidecar provider:

```bash
pi -e /path/to/pi-cc-patch/cliproxy-provider.ts --model cliproxy-claude/claude-haiku-4-5
```

The sidecar path requires at least one healthy Claude auth entry in `~/.cli-proxy-api`. Without one, requests will fail before reaching Anthropic.

## Uninstall

```bash
pi remove git:github.com/picassio/pi-cc-patch
```
