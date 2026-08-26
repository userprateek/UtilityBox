export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateUuidV4Batch(count: number): string[] {
  const safeCount = Math.max(0, Math.floor(count));
  return Array.from({ length: safeCount }, () => generateUuidV4());
}

export function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

export type UrlDecodeResult = { ok: true; value: string } | { ok: false; error: string };

export function decodeUrl(input: string): UrlDecodeResult {
  try {
    return { ok: true, value: decodeURIComponent(input) };
  } catch {
    return { ok: false, error: 'Invalid percent-encoded URL string.' };
  }
}

export function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(base64);
  }
}

export type JwtDecodeResult =
  | { ok: true; header: object; payload: object }
  | { ok: false; error: string };

export function decodeJwt(token: string): JwtDecodeResult | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  try {
    const parts = trimmed.split('.');
    const part0 = parts[0];
    const part1 = parts[1];
    if (parts.length >= 2 && part0 && part1) {
      return {
        ok: true,
        header: JSON.parse(decodeBase64Url(part0)) as object,
        payload: JSON.parse(decodeBase64Url(part1)) as object,
      };
    }
    return { ok: false, error: 'Invalid JWT Token structure (Expected Header.Payload.Signature)' };
  } catch {
    return { ok: false, error: 'Failed to decode JWT base64 JSON token string.' };
  }
}

export function encodeBase64Text(input: string): string {
  return btoa(
    encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1: string) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

export function stripDataUrlPrefix(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes(';base64,')) {
    return trimmed.split(';base64,')[1] || trimmed;
  }
  return trimmed;
}

export function decodeBase64Text(input: string): string {
  const cleanInput = stripDataUrlPrefix(input);
  return decodeURIComponent(
    atob(cleanInput)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
