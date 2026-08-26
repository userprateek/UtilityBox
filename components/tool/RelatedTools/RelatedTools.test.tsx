import React from 'react';
import { render, screen } from '@testing-library/react';
import { RelatedTools } from './RelatedTools';

describe('RelatedTools Component', () => {
  it('renders related tools section with tools from same category', () => {
    render(<RelatedTools currentSlug="image-compressor" limit={3} />);

    expect(screen.getByText(/Related tools/i)).toBeInTheDocument();
    expect(screen.getByText(/Complementary Tools/i)).toBeInTheDocument();

    // Verify it excludes current tool
    expect(screen.queryByRole('heading', { name: /^Image Compressor$/i })).not.toBeInTheDocument();
  });
});
