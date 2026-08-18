import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageCompressorOptions } from './ImageCompressorOptions';

describe('ImageCompressorOptions Component', () => {
  it('renders quality slider, format select, and metadata checkbox', () => {
    render(<ImageCompressorOptions />);

    expect(screen.getByText(/Image Quality Level/i)).toBeInTheDocument();
    expect(screen.getByText(/Target Output Format/i)).toBeInTheDocument();
    expect(screen.getByText(/Strip EXIF metadata/i)).toBeInTheDocument();
  });

  it('notifies parent component when quality slider changes', () => {
    const handleChange = jest.fn();
    render(<ImageCompressorOptions onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '60' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        quality: 60,
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
