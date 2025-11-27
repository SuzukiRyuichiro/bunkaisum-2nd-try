# Tauri Session Handling Guide

## Problem Summary

After implementing Tauri, users get redirected to login page after authentication. The session is not maintained in the native app despite successful login.

**Root Cause**: Tauri webviews handle HTTP cookies differently than browsers. Session cookies that work fine in web browsers may not persist correctly in webview environments (WKWebView/WebView2/WebKitGTK).

## Why This Happens

1. **Cookie attribute sensitivity**: `sameSite`, `secure`, and `domain` settings behave differently in webviews
2. **Webview persistence**: Each platform's webview has different cookie storage mechanisms
3. **Protocol mismatches**: Cookies with `secure: true` may fail if Tauri loads via `http://` or custom protocols

## Solution Options

### Option 1: Fix Cookie Configuration (Start Here)

Adjust session cookie settings to work in both web and Tauri:

- Set `sameSite: 'Lax'` (not `Strict` or `None`)
- Make `secure` conditional:
  - `true` for production web
  - `false` for Tauri/local development
- Don't set explicit `domain` attribute (use default)
- Configure `tauri.conf.json` webview security settings properly

**Pros**: Minimal code changes, maintains current architecture
**Cons**: May not work if webview has fundamental cookie limitations

### Option 2: Hybrid Auth Strategy (Recommended if Option 1 fails)

Use different auth mechanisms based on environment:

**Web**: HTTP-only cookies (current setup)
**Tauri**: Token-based auth (JWT in Tauri secure storage)

**Implementation approach**:
1. Login endpoint returns both cookie AND token
2. Tauri app stores token using Tauri's secure storage API
3. Tauri app sends token as `Authorization: Bearer <token>` header
4. Server validates either cookie OR token

**Environment Detection**:
- Client: Check for `window.__TAURI__`
- Server: Check for custom header (e.g., `X-Tauri-App: true`)

**Pros**: Most reliable, maintains security for both platforms
**Cons**: Requires server-side changes to accept both auth methods

### Option 3: Custom URL Protocol

Configure Tauri to use custom protocol (`tauri://localhost`) for better cookie control.

**Pros**: Fine-grained control
**Cons**: More Tauri-specific configuration required

## Recommended Approach

1. **First**: Try Option 1 (cookie configuration fixes)
2. **If that fails**: Implement Option 2 (hybrid strategy)

**Key Principle**: Don't force Tauri to behave exactly like a browser. Adapt your auth strategy to support both environments while keeping them isolated.

## Next Steps

1. Inspect current session cookie configuration in Nuxt
2. Check Tauri webview settings in `tauri.conf.json`
3. Test cookie persistence with adjusted settings
4. If cookies still fail, implement hybrid token-based auth for Tauri

## References

- Current branch: `make-native`
- Tauri security docs: https://tauri.app/v1/guides/security/
- Nuxt auth patterns: https://nuxt.com/docs/getting-started/authentication
