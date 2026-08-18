import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option One' },
    { value: 'option2', label: 'Option Two' },
    { value: 'option3', label: 'Option Three', disabled: true },
  ];

  it('renders label and options', () => {
    render(<Select label="Choose Option" options={options} defaultValue="option1" />);

    expect(screen.getByLabelText('Choose Option')).toBeInTheDocument();
    expect(screen.getByText('Option One')).toBeInTheDocument();
    expect(screen.getByText('Option Two')).toBeInTheDocument();
    expect(screen.getByText('Option Three')).toBeDisabled();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when error prop is passed', () => {
    render(<Select options={options} error="Please choose an option" />);
    expect(screen.getByText('Please choose an option')).toBeInTheDocument();
  });
});
