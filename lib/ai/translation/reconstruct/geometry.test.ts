import { TranslatedBlock } from '../types';
import {
  anchorPageToMeasuredRegions,
  groupLinesIntoParagraphs,
  MeasuredRegion,
} from './geometry';

function block(text: string, x: number, y: number, width: number, height: number): TranslatedBlock {
  return {
    id: text,
    type: 'paragraph',
    originalText: text,
    translatedText: text,
    uncertain: false,
    bbox: { x, y, width, height },
  };
}

describe('paragraph geometry', () => {
  it('joins stacked lines of one paragraph and keeps a distant line separate', () => {
    const regions = groupLinesIntoParagraphs(
      [
        { text: 'The public library opens at nine', x: 0.08, y: 0.1, width: 0.7, height: 0.02 },
        { text: 'in the evening.', x: 0.08, y: 0.128, width: 0.4, height: 0.02 },
        { text: 'A separate note.', x: 0.08, y: 0.4, width: 0.4, height: 0.02 },
      ],
      'p1'
    );

    expect(regions).toHaveLength(2);
    expect(regions[0]?.text).toContain('public library');
    expect(regions[0]?.text).toContain('evening');
    expect(regions[0]?.bbox.height).toBeGreaterThan(0.04);
    expect(regions[0]?.bbox.width).toBeGreaterThan(0.7);
    expect(regions[1]?.text).toBe('A separate note.');
  });

  it('expands a partial model box to the measured paragraph', () => {
    const measured: MeasuredRegion[] = [
      {
        id: 'p1-b1',
        text: 'The public library opens at nine in the evening.',
        lineHeight: 0.02,
        bbox: { x: 0.07, y: 0.09, width: 0.8, height: 0.07 },
      },
    ];
    const placed = anchorPageToMeasuredRegions(
      [block('सार्वजनिक पुस्तकालय', 0.08, 0.1, 0.25, 0.02)],
      measured
    );

    expect(placed).toHaveLength(1);
    expect(placed[0]?.bbox).toEqual(measured[0]?.bbox);
    expect(placed[0]?.translatedText).toContain('पुस्तकालय');
  });

  it('puts every line translation inside the one measured paragraph when model boxes miss it', () => {
    const measured: MeasuredRegion[] = [
      {
        id: 'p1-b1',
        text: 'full paragraph',
        lineHeight: 0.02,
        bbox: { x: 0.08, y: 0.1, width: 0.8, height: 0.08 },
      },
    ];
    const placed = anchorPageToMeasuredRegions(
      [
        block('पहली पंक्ति', 0.08, 0.7, 0.4, 0.02),
        block('दूसरी पंक्ति', 0.08, 0.75, 0.4, 0.02),
      ],
      measured
    );

    expect(placed).toHaveLength(1);
    expect(placed[0]?.bbox).toEqual(measured[0]?.bbox);
    expect(placed[0]?.translatedText).toContain('पहली पंक्ति');
    expect(placed[0]?.translatedText).toContain('दूसरी पंक्ति');
  });
});
