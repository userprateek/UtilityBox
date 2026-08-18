import {
  getAllTools,
  getToolBySlug,
  getToolsByCategory,
  getPopularTools,
  searchTools,
  TOOL_REGISTRY,
} from './registry';

describe('Tool Registry', () => {
  it('contains valid metadata for all registered tools', () => {
    const tools = getAllTools();
    expect(tools.length).toBeGreaterThan(0);

    tools.forEach((tool) => {
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.shortDescription).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(tool.seoTitle).toBeTruthy();
      expect(tool.seoDescription).toBeTruthy();
      expect(tool.keywords.length).toBeGreaterThan(0);
      expect(tool.supportedInputFormats.length).toBeGreaterThan(0);
    });
  });

  it('retrieves specific tool by slug', () => {
    const tool = getToolBySlug('image-compressor');
    expect(tool).toBeDefined();
    expect(tool?.name).toBe('Image Compressor');
    expect(tool?.category).toBe('image');
  });

  it('returns undefined for non-existent slug', () => {
    const tool = getToolBySlug('non-existent-tool-xyz');
    expect(tool).toBeUndefined();
  });

  it('filters tools by category accurately', () => {
    const imageTools = getToolsByCategory('image');
    expect(imageTools.length).toBeGreaterThan(0);
    imageTools.forEach((t) => expect(t.category).toBe('image'));

    const pdfTools = getToolsByCategory('pdf');
    expect(pdfTools.length).toBeGreaterThan(0);
    pdfTools.forEach((t) => expect(t.category).toBe('pdf'));
  });

  it('filters popular tools', () => {
    const popularTools = getPopularTools();
    expect(popularTools.length).toBeGreaterThan(0);
    popularTools.forEach((t) => expect(t.isPopular).toBe(true));
  });

  it('searches tools by query terms across name, description, and keywords', () => {
    const searchCompress = searchTools('compress');
    expect(searchCompress.length).toBeGreaterThan(0);
    expect(searchCompress.some((t) => t.slug === 'image-compressor')).toBe(true);
    expect(searchCompress.some((t) => t.slug === 'pdf-compressor')).toBe(true);

    const searchPdf = searchTools('pdf');
    expect(searchPdf.length).toBeGreaterThan(0);
    searchPdf.forEach((t) => {
      const match =
        t.name.toLowerCase().includes('pdf') ||
        t.category === 'pdf' ||
        t.keywords.some((k) => k.toLowerCase().includes('pdf'));
      expect(match).toBe(true);
    });
  });

  it('returns all tools when search query is empty', () => {
    const results = searchTools('   ');
    expect(results.length).toBe(Object.keys(TOOL_REGISTRY).length);
  });
});
