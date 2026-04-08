# pi-cc-patch

Use your Pro/Max subscription billing with [pi](https://github.com/mariozechner/pi-coding-agent) instead of getting the "Third-party apps now draw from your extra usage" error.

## What it does

The API classifier detects pi as a third-party app and blocks subscription billing. This extension patches the request payload to bypass it:

1. Sanitizes trigger phrases from the system prompt
2. Adds billing header for subscription rate-limit routing
3. Strips prefix block that triggers detection

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
