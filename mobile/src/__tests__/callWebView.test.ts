import {
  WEB_TOKEN_STORAGE_KEY,
  WEB_USER_STORAGE_KEY,
  buildAuthSeedScript,
  isLoopbackUrl,
  parseHost,
  resolveWebCallUrl,
} from '../lib/webviewBridge';
import { User } from '../types';

/**
 * Exercises the real production helpers in `src/lib/webviewBridge.ts`.
 *
 * The previous version of this file built the dead `window.initLiveKitCall`
 * string inside the test body and asserted that the string it had just built
 * contained its own token. That identifier has zero occurrences in `web/`.
 */
const user = {
  id: 'user-1',
  email: 'tutor@example.com',
  firstName: 'Ana',
  lastName: 'Ruiz',
  role: 'CLIENT',
  ratingAvg: 0,
  ratingCount: 0,
  isOnline: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as User;

describe('web client credential seeding', () => {
  const script = buildAuthSeedScript('jwt-abc', user);

  it('uses the storage keys the web client actually reads', () => {
    // web/src/services/api.ts and web/src/context/AuthContext.tsx
    expect(WEB_TOKEN_STORAGE_KEY).toBe('vetconnect_token');
    expect(WEB_USER_STORAGE_KEY).toBe('vetconnect_user');
  });

  it('seeds both keys before the page scripts run', () => {
    expect(script).toContain(`window.localStorage.setItem("vetconnect_token","jwt-abc")`);
    expect(script).toContain(`window.localStorage.setItem("vetconnect_user",`);
    expect(script).toContain('"id":"user-1"');
  });

  it('evaluates to true, as react-native-webview requires', () => {
    expect(script.trimEnd().endsWith('true;')).toBe(true);
  });

  it('swallows a storage failure instead of aborting the document', () => {
    expect(script).toContain('try{');
    expect(script).toContain('}catch(e){};');
  });

  it('does not reference the dead initLiveKitCall bridge', () => {
    expect(script).not.toContain('initLiveKitCall');
  });

  it('escapes a token containing quote characters', () => {
    // Guards against breaking out of the injected string literal.
    const escaped = buildAuthSeedScript('a"b\\c', user);
    expect(escaped).toContain('window.localStorage.setItem("vetconnect_token","a\\"b\\\\c")');
  });
});

describe('web call base URL resolution', () => {
  it('joins the base URL and the call path', () => {
    expect(resolveWebCallUrl('https://app.vetconnect.com.ar', 'cons-1')).toBe(
      'https://app.vetconnect.com.ar/call/cons-1'
    );
  });

  it('does not double the separator when the base URL has a trailing slash', () => {
    expect(resolveWebCallUrl('https://app.vetconnect.com.ar/', 'cons-1')).toBe(
      'https://app.vetconnect.com.ar/call/cons-1'
    );
  });

  it('preserves a non-default port', () => {
    expect(resolveWebCallUrl('http://192.168.1.10:5173', 'cons-1')).toBe(
      'http://192.168.1.10:5173/call/cons-1'
    );
  });

  it('encodes the consultation id', () => {
    expect(resolveWebCallUrl('https://app.vetconnect.com.ar', 'a b')).toBe(
      'https://app.vetconnect.com.ar/call/a%20b'
    );
  });
});

describe('loopback base URL detection', () => {
  it.each(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://0.0.0.0:5173', 'http://[::1]:5173'])(
    'flags %s as resolving to the handset itself',
    (url) => {
      expect(isLoopbackUrl(url)).toBe(true);
    }
  );

  it.each([
    'https://app.vetconnect.com.ar',
    'http://192.168.1.10:5173',
    'https://localhost.example.com',
    'http://mylocalhost:5173',
  ])('does not flag %s', (url) => {
    expect(isLoopbackUrl(url)).toBe(false);
  });

  it('does not throw on a value that is not a URL', () => {
    expect(isLoopbackUrl('')).toBe(false);
    expect(isLoopbackUrl('not a url')).toBe(false);
  });

  it('parses the host without relying on a complete URL implementation', () => {
    // Hermes ships a partial `URL`; this is regex based on purpose.
    expect(parseHost('https://user:pw@app.vetconnect.com.ar:8443/x')).toBe(
      'app.vetconnect.com.ar'
    );
    expect(parseHost('http://[::1]:5173')).toBe('::1');
    expect(parseHost('nonsense')).toBeNull();
  });
});
