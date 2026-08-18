import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdfSplitterOptions } from './PdfSplitterOptions';

describe('PdfSplitterOptions Component', () => {
  it('renders split mode buttons (all pages, custom range, fixed interval)', () => {
    render(<PdfSplitterOptions />);

    expect(screen.getAllByText(/Extract All Pages/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Custom Page Range/i)).toBeInTheDocument();
    expect(screen.getByText(/Split Every N Pages/i)).toBeInTheDocument();
  });

  it('switches to custom range mode and updates range input', () => {
    const handleChange = jest.fn();
    render(<PdfSplitterOptions onChange={handleChange} />);

    const rangeBtn = screen.getByText(/Custom Page Range/i);
    fireEvent.click(rangeBtn);

    const input = screen.getByPlaceholderText(/1-3, 5/i);
    fireEvent.change(input, { target: { value: '2-4, 7' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'range',
        pageRange: '2-4, 7',
      })
    );
  });
});
