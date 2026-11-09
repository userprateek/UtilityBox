import React from 'react';
import { render, screen } from '@testing-library/react';
import { QuickLaunch } from './QuickLaunch';
import { QUICK_LAUNCH_SLUGS } from '@/config/homepage/quickLaunch';

describe('QuickLaunch', () => {
  it('links six registry tools and the tools directory', () => {
    render(<QuickLaunch />);

    const expected = [
      ['Image Compressor', '/image-compressor'],
      ['Image Resizer', '/image-resizer'],
      ['PDF Merger', '/pdf-merger'],
      ['PDF Splitter', '/pdf-splitter'],
      ['Image to PDF', '/image-to-pdf'],
      ['QR Code Generator', '/qr-code-generator'],
    ] as const;

    expect(QUICK_LAUNCH_SLUGS).toHaveLength(6);
    for (const [name, href] of expected) {
      const link = screen.getByRole('link', { name: new RegExp(name) });
      expect(link).toHaveAttribute('href', href);
    }

    expect(screen.getByRole('link', { name: /View All Tools/ })).toHaveAttribute('href', '/tools');
  });
});
