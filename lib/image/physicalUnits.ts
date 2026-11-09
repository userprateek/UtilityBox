export type PhysicalUnit = 'mm' | 'cm' | 'inch';

/**
 * Convert a print length to whole pixels.
 * 25.4 mm, 2.54 cm, and 1 inch are each one inch, so at 300 DPI they are 300 px.
 */
export function physicalLengthToPixels(value: number, unit: PhysicalUnit, dpi: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Length must be greater than 0.');
  }
  if (!Number.isFinite(dpi) || dpi <= 0) {
    throw new Error('DPI must be greater than 0.');
  }
  const inches = unit === 'mm' ? value / 25.4 : unit === 'cm' ? value / 2.54 : value;
  return Math.round(inches * dpi);
}
