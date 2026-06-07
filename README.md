# pi-cc-patch

Use your Pro/Max subscription billing with [pi](https://github.com/earendil-works/pi) instead of getting the "Third-party apps now draw from your extra usage" error.

## What it does

The API classifier detects pi as a third-party app and blocks subscription billing. This extension patches Anthropic/Claude request payloads to bypass it:

1. Sanitizes trigger phrases from the system prompt and text message history
2. Adds billing header for subscription rate-limit routing, even if a later request has no system block
3. Strips prefix block that triggers detection
4. Rewrites retired Anthropic model aliases that now return `404 not_found_error`

Scope: this patch only runs for Anthropic/Claude provider requests. Other providers are left unchanged.

Scope: this patch only runs for Anthropic/Claude provider requests. Other providers are left unchanged.

No token swap, no SDK dependency, no proxy. Just a `before_provider_request` hook. Pi's built-in provider handles everything else — caching, token refresh, thinking, streaming, tool mapping.

## Install

```bash
pi install git:github.com/picassio/pi-cc-patch
```

Then restart pi. Use `/login` if you haven't already.

## Troubleshooting

### Corrupt partial git install

If `pi install git:github.com/picassio/pi-cc-patch` fails because an earlier install left a bad partial clone, remove the cached clone and install again:

```bash
rm -rf ~/.pi/agent/git/github.com/picassio/pi-cc-patch
pi install git:github.com/picassio/pi-cc-patch
pi list
```

`pi list` should include `git:github.com/picassio/pi-cc-patch` after a successful install.

### Retired Claude model aliases

If Anthropic returns `404 not_found_error` for an old alias such as `anthropic/claude-3-5-haiku-latest`, the model alias is retired/removed. That error is not caused by this patch.

This extension rewrites common retired aliases before the provider request is sent, for example:

- `claude-3-5-haiku-latest` → `claude-haiku-4-5`
- `claude-3-5-haiku-20241022` → `claude-haiku-4-5-20251001`
- old Claude 3.5/3.7 Sonnet aliases → Claude Sonnet 4.5

## Uninstall

```bash
pi remove git:github.com/picassio/pi-cc-patch
```
