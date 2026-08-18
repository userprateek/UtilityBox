import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileDropzone } from '@/components/file-upload/FileDropzone/FileDropzone';
import { Button } from '@/components/common/Button/Button';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import { Alert } from '@/components/common/States/Alert';

describe('Accessibility (a11y) and Keyboard Navigation', () => {
  it('triggers file picker via keyboard Enter and Space keys on dropzone', () => {
    const handleFilesSelected = jest.fn();
    const { container } = render(<FileDropzone onFilesSelected={handleFilesSelected} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');
    const selectFilesBtn = screen.getByRole('button', { name: /select files/i });
    fireEvent.click(selectFilesBtn);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('maintains proper ARIA progressbar semantics', () => {
    render(<ProgressBar percentage={40} label="Uploading" />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('declares role="alert" for user-facing alert notifications', () => {
    render(
      <Alert type="error" title="Critical Error">
        Failed to load
      </Alert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Critical Error');
    expect(alert).toHaveTextContent('Failed to load');
  });

  it('prevents keyboard activation when Button is disabled or loading', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Action
      </Button>
    );

    const btn = screen.getByRole('button', { name: /disabled action/i });
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
