import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders label and handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input label="Username" placeholder="Enter name" onChange={handleChange} />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Enter name');

    fireEvent.change(input, { target: { value: 'john_doe' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('renders helper text when no error is present', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('renders left and right icons', () => {
    render(
      <Input
        leftIcon={<span data-testid="left-icon">🔍</span>}
        rightIcon={<span data-testid="right-icon">✕</span>}
      />
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});
