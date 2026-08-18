import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdfToImageOptionsComponent } from './PdfToImageOptions';

describe('PdfToImageOptionsComponent', () => {
  it('renders image format and resolution select options', () => {
    render(<PdfToImageOptionsComponent />);

    expect(screen.getByLabelText(/Output Image Format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Render Resolution/i)).toBeInTheDocument();
    expect(screen.getByText(/All Pages/i)).toBeInTheDocument();
    expect(screen.getByText(/Specific Pages/i)).toBeInTheDocument();
  });

  it('switches to specific pages mode and triggers onChange', () => {
    const handleChange = jest.fn();
    render(<PdfToImageOptionsComponent onChange={handleChange} />);

    const specificBtn = screen.getByText(/Specific Pages/i);
    fireEvent.click(specificBtn);

    const input = screen.getByPlaceholderText(/1-3, 5, 8/i);
    fireEvent.change(input, { target: { value: '1, 4' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSelection: 'custom',
        customPages: '1, 4',
      })
    );
  });
});
