import { User } from '../types';

/**
 * Builds the JavaScript that seeds the embedded web client's session (WU5 / D-03).
 *
 * The web SPA reads its access token from `localStorage` at MODULE LOAD
 * (`web/src/services/api.ts`), which happens while the bundle's first module is
 * evaluated. Injecting credentials after `page:ready` is therefore too late;
 * the only correct moment is `injectedJavaScriptBeforeContentLoaded`, which runs
 * after the document exists (so the correct origin's storage is addressable)
 * and before any of the page's own scripts.
 *
 * Pure string construction, no React, so it is unit-testable.
 */

/** Must match the key `web/src/services/api.ts` reads and writes. */
export const WEB_TOKEN_STORAGE_KEY = 'vetconnect_token';
/** Must match the key `web/src/context/AuthContext.tsx` reads and writes. */
export const WEB_USER_STORAGE_KEY = 'vetconnect_user';

const STORAGE_PREFIX = 'window.localStorage';

/**
 * Returns a script that writes both storage keys and evaluates to `true`.
 *
 * The trailing `true` is required: `react-native-webview` logs a warning when an
 * injected script evaluates to anything else. The `try/catch` keeps a storage
 * failure (private mode, disabled WebView storage) from aborting the document.
 */
export function buildAuthSeedScript(accessToken: string, user: User): string {
  const token = JSON.stringify(accessToken);
  const userJson = JSON.stringify(user);

  return (
    'try{' +
    `${STORAGE_PREFIX}.setItem(${JSON.stringify(WEB_TOKEN_STORAGE_KEY)},${token});` +
    `${STORAGE_PREFIX}.setItem(${JSON.stringify(WEB_USER_STORAGE_KEY)},${userJson});` +
    '}catch(e){};' +
    'true;'
  );
}

/**
 * Hosts that resolve to the handset itself rather than to a development machine.
 *
 * `new URL` is not used on purpose: Hermes ships a partial `URL` and relying on
 * it for a correctness check would be a latent runtime difference between Node
 * (tests) and the device.
 */
const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

/**
 * Bracketed IPv6 literals are matched as a unit: the character class below
 * stops at `:`, so `[::1]` would otherwise be truncated to `[`.
 */
const HOST_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/(?:[^@/?#]*@)?(\[[^\]]*\]|[^:/?#]*)/;

export function parseHost(url: string): string | null {
  const match = HOST_PATTERN.exec(url.trim());
  if (!match) return null;
  return match[1].replace(/^\[|\]$/g, '').toLowerCase();
}

/**
 * True when the configured web base URL points back at the device itself.
 *
 * `http://localhost:5173` is the development default, and on a real handset
 * `localhost` is the phone, not the laptop running Vite. The call screen fails
 * with an opaque WebView load error in that case, so it is detected up front
 * and reported explicitly.
 */
export function isLoopbackUrl(url: string): boolean {
  const host = parseHost(url);
  return host !== null && LOOPBACK_HOSTS.has(host);
}

/** Joins the web base URL and the call path without doubling or losing slashes. */
export function resolveWebCallUrl(baseUrl: string, consultationId: string): string {
  const base = baseUrl.trim().replace(/\/+$/, '');
  return `${base}/call/${encodeURIComponent(consultationId)}`;
}
