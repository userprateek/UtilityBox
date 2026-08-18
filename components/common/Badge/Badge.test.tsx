import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders label and variants properly', () => {
    render(<Badge variant="success">Success Status</Badge>);
    expect(screen.getByText('Success Status')).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    render(
      <Badge variant="primary" icon={<span data-testid="badge-icon">★</span>}>
        Popular
      </Badge>
    );

    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });
});
