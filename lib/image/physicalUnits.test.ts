import { physicalLengthToPixels } from './physicalUnits';
import { calculateTargetDimensions } from './canvasCompressor';

describe('physical print sizes', () => {
  it.each([
    ['mm', 25.4, 300, 300],
    ['mm', 25.4, 150, 150],
    ['mm', 25.4, 72, 72],
    ['cm', 2.54, 300, 300],
    ['cm', 2.54, 150, 150],
    ['inch', 1, 300, 300],
    ['inch', 1, 72, 72],
    ['mm', 35, 300, 413],
  ] as const)('%s %s at %s DPI is %s px', (unit, value, dpi, pixels) => {
    expect(physicalLengthToPixels(value, unit, dpi)).toBe(pixels);
  });

  it('uses both converted sides instead of fitting the source aspect', () => {
    const width = physicalLengthToPixels(25.4, 'mm', 300);
    const height = physicalLengthToPixels(25.4, 'mm', 300);
    expect(
      calculateTargetDimensions(800, 600, {
        scaleMode: 'custom',
        customWidth: width,
        customHeight: height,
        maintainAspectRatio: false,
      })
    ).toEqual({ width: 300, height: 300 });
  });
});
