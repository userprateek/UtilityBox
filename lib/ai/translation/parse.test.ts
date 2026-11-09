import { parseTranslatedDocument } from './parse';

describe('parseTranslatedDocument', () => {
  it('parses fenced JSON and keeps block ids', () => {
    const raw = `\`\`\`json
{"sourceLanguage":"en","targetLanguage":"hi","pages":[{"pageNumber":1,"width":100,"height":200,"blocks":[{"id":"p1-b1","type":"heading","originalText":"Hello","translatedText":"नमस्ते","uncertain":false,"bbox":{"x":0.1,"y":0.1,"width":0.5,"height":0.1}}]}]}
\`\`\``;

    const parsed = parseTranslatedDocument(raw);
    expect(parsed.targetLanguage).toBe('hi');
    expect(parsed.pages[0]?.blocks[0]?.id).toBe('p1-b1');
    expect(parsed.pages[0]?.blocks[0]?.translatedText).toBe('नमस्ते');
  });

  it('rejects empty documents', () => {
    expect(() => parseTranslatedDocument('{"sourceLanguage":"en","targetLanguage":"hi","pages":[]}')).toThrow(
      /no pages/i
    );
  });
});
