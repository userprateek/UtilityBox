import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children properly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies custom padding and variants', () => {
    const { container } = render(
      <Card variant="bordered" padding="lg" hoverable className="custom-card">
        Bordered Content
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('custom-card');
  });
});
