import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageResizerOptions } from './ImageResizerOptions';

describe('ImageResizerOptions Component', () => {
  it('renders pixels, percentage, print size modes, and presets', () => {
    render(<ImageResizerOptions />);

    expect(screen.getByText(/Pixels \(px\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Percentage \(%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Size/i)).toBeInTheDocument();
    expect(screen.getByText(/Passport \(35×45mm\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Signature \(3:1\)/i)).toBeInTheDocument();
  });

  it('shows width and height inputs in print size mode with passport millimetre defaults', () => {
    const handleChange = jest.fn();
    render(<ImageResizerOptions onChange={handleChange} />);

    fireEvent.click(screen.getByText(/Print Size/i));

    expect(screen.getByText(/Width \(mm\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Height \(mm\)/i)).toBeInTheDocument();
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        unit: 'mm',
        width: 35,
        height: 45,
      })
    );
  });

  it('switches to percentage mode and updates slider', () => {
    const handleChange = jest.fn();
    render(<ImageResizerOptions onChange={handleChange} />);

    const pctBtn = screen.getByText(/Percentage \(%\)/i);
    fireEvent.click(pctBtn);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '50' } });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        unit: 'percentage',
        percentage: 50,
      })
    );
  });

  it('selects preset when clicked', () => {
    const handleChange = jest.fn();
    render(<ImageResizerOptions onChange={handleChange} />);

    const passportPreset = screen.getByText(/Passport \(35×45mm\)/i);
    fireEvent.click(passportPreset);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 413,
        height: 531,
      })
    );
  });
});
