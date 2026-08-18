import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageCompressorOptions } from './ImageCompressorOptions';

describe('ImageCompressorOptions Component', () => {
  it('renders target size presets, resolution modes, format select, and metadata checkbox', () => {
    render(<ImageCompressorOptions />);

    expect(screen.getAllByText(/Target File Size/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/50 KB/i)).toBeInTheDocument();
    expect(screen.getAllByText(/100 KB/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Keep Original/i)).toBeInTheDocument();
    expect(screen.getByText(/Scale %/i)).toBeInTheDocument();
    expect(screen.getByText(/Govt \/ Form Presets/i)).toBeInTheDocument();
    expect(screen.getByText(/Custom W × H/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Output Format/i)).toBeInTheDocument();
    expect(screen.getByText(/Strip EXIF metadata/i)).toBeInTheDocument();
  });

  it('switches target size preset when 50 KB button is clicked', () => {
    const handleChange = jest.fn();
    render(<ImageCompressorOptions onChange={handleChange} />);

    const btn50 = screen.getByRole('button', { name: /50 KB/i });
    fireEvent.click(btn50);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        targetKb: 50,
        targetSizeEnabled: true,
      })
    );
  });

  it('switches to Scale % mode and adjusts percentage slider', () => {
    const handleChange = jest.fn();
    render(<ImageCompressorOptions onChange={handleChange} />);

    const scalePctBtn = screen.getByText(/Scale %/i);
    fireEvent.click(scalePctBtn);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0]!, { target: { value: '50' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        scaleMode: 'percentage',
        scalePercentage: 50,
      })
    );
  });

  it('switches to Govt Presets mode and selects Passport size', () => {
    const handleChange = jest.fn();
    render(<ImageCompressorOptions onChange={handleChange} />);

    const govtBtn = screen.getByText(/Govt \/ Form Presets/i);
    fireEvent.click(govtBtn);

    const passportCard = screen.getByText(/Passport Size/i);
    fireEvent.click(passportCard);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        scaleMode: 'preset',
        dimensionPreset: 'passport',
      })
    );
  });

  it('notifies parent component when format selector changes', () => {
    const handleChange = jest.fn();
    render(<ImageCompressorOptions onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'image/webp' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        outputFormat: 'image/webp',
      })
    );
  });
});
