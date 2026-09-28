/**
 * Single source of truth for "incoming intent -> screen" mapping (WU3 / D-02).
 *
 * Deliberately free of `react-native`, `expo-router`, `expo-linking` and every
 * store, so both channels that can move the user (a `vetconnect://` URL and a
 * push-notification tap) resolve through the same table and both stay unit
 * testable without rendering anything.
 *
 * Route contract (SSOT = the file names under `app/(app)/`):
 *   call/[consultationId].tsx          -> `consultationId`
 *   consultation/[id].tsx              -> `id`
 *   prescriptions/[id].tsx             -> `id`
 *   chat/[consultationId].tsx          -> `consultationId`
 *   review/[consultationId].tsx        -> `consultationId`
 *
 * The param name is NOT the id name: the URL and the notification payload say
 * `consultationId`, the consultation detail file reads `id`. Getting that wrong
 * renders the screen with `undefined` and a blank page, so the mapping keeps
 * both names explicitly instead of assuming they match.
 */

export const APP_SCHEME = 'vetconnect';

export type DeepLinkScreen = 'call' | 'consultation' | 'prescriptions' | 'chat' | 'review';

interface ScreenContract {
  /** Directory under `app/(app)/` that owns the screen. */
  path: string;
  /** Route param exactly as the screen file declares it (`[x]`). */
  param: string;
}

const SCREENS: Record<DeepLinkScreen, ScreenContract> = {
  call: { path: 'call', param: 'consultationId' },
  consultation: { path: 'consultation', param: 'id' },
  prescriptions: { path: 'prescriptions', param: 'id' },
  chat: { path: 'chat', param: 'consultationId' },
  review: { path: 'review', param: 'consultationId' },
};

export interface DeepLinkTarget {
  screen: DeepLinkScreen;
  /** Param name the destination screen reads. */
  param: string;
  /** Decoded identifier carried by the URL or the payload. */
  id: string;
}

const SCHEME_SEPARATOR = '://';

function decodeSegment(segment: string): string | null {
  try {
    const decoded = decodeURIComponent(segment).trim();
    return decoded.length > 0 ? decoded : null;
  } catch {
    // Malformed percent-encoding: an unusable id is a miss, not a crash.
    return null;
  }
}

/**
 * Parses `vetconnect://<screen>/<id>` into a routable target.
 *
 * Accepts both the two-slash and three-slash native forms (`vetconnect://call/x`
 * and `vetconnect:///call/x`) because `URL` parsing puts the first segment in
 * `host` and the rest in `pathname`. Query strings and fragments are dropped:
 * they never address a different screen.
 *
 * Returns `null` for anything that does not address exactly one known screen,
 * which is what drives the `+not-found` route.
 */
export function parseDeepLink(url: string | null | undefined): DeepLinkTarget | null {
  if (typeof url !== 'string') return null;

  const trimmed = url.trim();
  const separatorIndex = trimmed.indexOf(SCHEME_SEPARATOR);
  if (separatorIndex === -1) return null;

  if (trimmed.slice(0, separatorIndex).toLowerCase() !== APP_SCHEME) return null;

  const path = trimmed.slice(separatorIndex + SCHEME_SEPARATOR.length).split(/[?#]/)[0] ?? '';
  const segments = path.split('/').filter((segment) => segment.length > 0);

  // Exactly one screen segment and one id segment. Anything deeper is ambiguous
  // and must land on `+not-found` instead of being silently truncated.
  if (segments.length !== 2) return null;

  const [screenSegment, idSegment] = segments;
  const screen = screenSegment as DeepLinkScreen;
  const contract = SCREENS[screen];
  if (!contract) return null;

  const id = decodeSegment(idSegment);
  if (!id) return null;

  return { screen, param: contract.param, id };
}

/**
 * Builds the expo-router href for a target.
 *
 * The id is re-encoded because it was decoded during parsing, and a decoded
 * `/` would otherwise smuggle an extra path segment into the href.
 */
export function buildDeepLinkHref(target: DeepLinkTarget): string {
  const { path } = SCREENS[target.screen];
  return `/(app)/${path}/${encodeURIComponent(target.id)}`;
}

/** Convenience: URL in, expo-router href out. `null` when unmatched. */
export function resolveDeepLinkHref(url: string | null | undefined): string | null {
  const target = parseDeepLink(url);
  return target ? buildDeepLinkHref(target) : null;
}

/**
 * Push payload contract, taken from the `Notification.type` comment in
 * `backend/prisma/schema.prisma` (SSOT level 1):
 * `"CALL_INCOMING | MESSAGE_NEW | PRESCRIPTION_NEW | SYSTEM"`.
 */
interface NotificationRule {
  screen: DeepLinkScreen;
  /** Payload keys accepted for the id, in priority order. */
  idKeys: string[];
}

const NOTIFICATION_RULES: Record<string, NotificationRule> = {
  CALL_INCOMING: { screen: 'call', idKeys: ['consultationId'] },
  MESSAGE_NEW: { screen: 'consultation', idKeys: ['consultationId'] },
  PRESCRIPTION_NEW: { screen: 'prescriptions', idKeys: ['prescriptionId', 'id'] },
};

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolves a push-notification `data` payload to an expo-router href.
 *
 * `SYSTEM` notifications and payloads without a usable id resolve to `null` so
 * the tap is ignored instead of navigating somewhere arbitrary. `data` comes
 * from a remote payload, so every field is shape-checked.
 */
export function resolveNotificationHref(data: unknown): string | null {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return null;

  const payload = data as Record<string, unknown>;
  const type = readString(payload, 'type');
  if (!type) return null;

  const rule = NOTIFICATION_RULES[type];
  if (!rule) return null;

  for (const key of rule.idKeys) {
    const id = readString(payload, key);
    if (id) {
      return buildDeepLinkHref({
        screen: rule.screen,
        param: SCREENS[rule.screen].param,
        id,
      });
    }
  }

  return null;
}
