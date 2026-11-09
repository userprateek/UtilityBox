import { getAllTools } from '@/config/tools/registry';
import { TOOL_CATEGORIES_LIST } from '@/config/tools/categories';
import { CATEGORY_HI, TOOL_HI, hindiForKnownLabel } from './catalog';

describe('website translation catalog', () => {
  it('has Hindi copy for every registered tool and category', () => {
    const tools = getAllTools();
    expect(Object.keys(TOOL_HI)).toHaveLength(tools.length);

    for (const tool of tools) {
      const copy = TOOL_HI[tool.slug];
      expect(copy?.short.length).toBeGreaterThan(8);
      expect(copy?.description.length).toBeGreaterThan(8);
      expect(copy?.short).not.toBe(tool.shortDescription);
    }

    for (const category of TOOL_CATEGORIES_LIST) {
      const copy = CATEGORY_HI[category.id];
      expect(copy?.label.length).toBeGreaterThan(1);
      expect(copy?.description.length).toBeGreaterThan(8);
      expect(copy?.audience.length).toBeGreaterThan(8);
    }
  });

  it('maps the shared process labels used by the tool shell', () => {
    expect(hindiForKnownLabel('Compress Images')).toBe('इमेज कंप्रेस करें');
    expect(hindiForKnownLabel('Process Files')).toBe('फ़ाइल प्रोसेस करें');
    expect(hindiForKnownLabel('Compress Now')).toBeUndefined();
  });
});
