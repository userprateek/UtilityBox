import { test, expect } from '@playwright/test';
import fs from 'fs';
import { fixture } from '../helpers/paths';

test.describe('API routes', () => {
  test('POST /api/image/compress returns a compressed image', async ({ request }) => {
    const res = await request.post('/api/image/compress', {
      multipart: {
        file: {
          name: 'blue.jpg',
          mimeType: 'image/jpeg',
          buffer: fs.readFileSync(fixture.jpeg),
        },
        quality: '0.5',
      },
    });
    expect(res.ok(), await res.text()).toBeTruthy();
    const buf = Buffer.from(await res.body());
    expect(buf.length).toBeGreaterThan(32);
    expect(buf[0]).toBe(0xff);
  });

  test('POST /api/image/compress without file is 400', async ({ request }) => {
    const res = await request.post('/api/image/compress', { multipart: { quality: '0.5' } });
    expect(res.status()).toBe(400);
  });

  test('POST /api/translate-document without file is 400', async ({ request }) => {
    const res = await request.post('/api/translate-document', {
      multipart: { sourceLanguage: 'en', targetLanguage: 'hi' },
    });
    expect(res.status()).toBe(400);
  });
});
