import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
  });

  it('renders correctly and toggles theme when clicked', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringMatching(/switch to dark mode/i));

    act(() => {
      fireEvent.click(button);
    });

    expect(localStorage.getItem('docswala-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(button).toHaveAttribute('aria-label', expect.stringMatching(/switch to light mode/i));

    act(() => {
      fireEvent.click(button);
    });

    expect(localStorage.getItem('docswala-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('renders switch row variant properly', () => {
    render(<ThemeToggle variant="row" />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Light Mode')).toBeInTheDocument();

    const rowButton = screen.getByRole('button');
    act(() => {
      fireEvent.click(rowButton);
    });

    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(localStorage.getItem('docswala-theme')).toBe('dark');
  });
});
