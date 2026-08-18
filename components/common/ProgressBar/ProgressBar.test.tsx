import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar Component', () => {
  it('renders percentage and label', () => {
    render(<ProgressBar percentage={65} label="Processing photos..." />);

    expect(screen.getByText('Processing photos...')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '65');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps values below 0 and above 100', () => {
    const { rerender } = render(<ProgressBar percentage={-20} />);
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');

    rerender(<ProgressBar percentage={150} />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });
});
