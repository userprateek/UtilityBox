import {
  decodeBase64Text,
  decodeJwt,
  decodeUrl,
  encodeBase64Text,
  encodeUrl,
  generateUuidV4Batch,
  stripDataUrlPrefix,
  UUID_V4_PATTERN,
} from './codecs';

describe('developer codecs', () => {
  it('generates the requested number of UUID v4 strings', () => {
    const uuids = generateUuidV4Batch(10);
    expect(uuids).toHaveLength(10);
    uuids.forEach((id) => {
      expect(id).toMatch(UUID_V4_PATTERN);
    });
  });

  it('encodes and decodes URL parameter strings', () => {
    const original = 'hello world & test';
    const encoded = encodeUrl(original);
    expect(encoded).toBe('hello%20world%20%26%20test');

    const decoded = decodeUrl(encoded);
    expect(decoded).toEqual({ ok: true, value: original });
  });

  it('returns an error for invalid percent-encoded URLs', () => {
    expect(decodeUrl('%')).toEqual({
      ok: false,
      error: 'Invalid percent-encoded URL string.',
    });
  });

  it('encodes and decodes UTF-8 Base64 text, including data URL prefixes', () => {
    expect(encodeBase64Text('Hello World')).toBe('SGVsbG8gV29ybGQ=');
    expect(decodeBase64Text('SGVsbG8gV29ybGQ=')).toBe('Hello World');
    expect(stripDataUrlPrefix('data:text/plain;base64,SGVsbG8=')).toBe('SGVsbG8=');
    expect(decodeBase64Text('data:text/plain;base64,SGVsbG8=')).toBe('Hello');
  });

  it('decodes JWT header and payload claims', () => {
    const sampleJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    const result = decodeJwt(sampleJwt);
    expect(result?.ok).toBe(true);
    if (result?.ok) {
      expect(result.header).toMatchObject({ alg: 'HS256', typ: 'JWT' });
      expect(result.payload).toMatchObject({ name: 'John Doe', admin: true });
    }
  });
});
