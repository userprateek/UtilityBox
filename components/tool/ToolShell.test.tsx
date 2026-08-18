import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToolShell } from './ToolShell/ToolShell';
import { ToolMetadata } from '@/types/tool';

describe('ToolShell Workflow Integration', () => {
  const mockTool: ToolMetadata = {
    slug: 'image-compressor',
    name: 'Image Compressor',
    shortDescription: 'Compress images securely',
    description: 'Reduce file sizes in browser',
    category: 'image',
    iconName: 'Minimize2',
    supportedInputFormats: ['image/jpeg', 'image/png'],
    maxFiles: 5,
    maxFileSizeMB: 50,
    seoTitle: 'Image Compressor',
    seoDescription: 'Compress photos',
    keywords: ['compress'],
    features: ['Instant preview', 'Zero server upload'],
  };

  it('renders initial dropzone and capabilities', () => {
    render(<ToolShell tool={mockTool} />);

    expect(screen.getByText('Image Compressor')).toBeInTheDocument();
    expect(screen.getByText('Drop your files here, or')).toBeInTheDocument();
    expect(screen.getByText('Instant preview')).toBeInTheDocument();
    expect(screen.getByText('Zero server upload')).toBeInTheDocument();
  });

  it('transitions from dropzone to workspace when file is uploaded, runs process, and displays download', async () => {
    const mockProcess = jest.fn(async (files, onProgress) => {
      onProgress({ percentage: 100 });
      return files;
    });

    const { container } = render(
      <ToolShell
        tool={mockTool}
        onProcess={mockProcess}
        optionsSlot={<div data-testid="custom-options">Quality Settings</div>}
        processButtonLabel="Compress Now"
      />
    );

    // Initial dropzone
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['mock-image-content'], 'test.png', { type: 'image/png' });

    // Upload file
    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Workspace rendered
    expect(screen.getByText('Selected Files')).toBeInTheDocument();
    expect(screen.getByText('test.png')).toBeInTheDocument();
    expect(screen.getByTestId('custom-options')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compress Now' })).toBeInTheDocument();

    // Trigger process
    const processBtn = screen.getByRole('button', { name: 'Compress Now' });
    await act(async () => {
      fireEvent.click(processBtn);
    });

    expect(mockProcess).toHaveBeenCalled();

    // Completion state
    expect(screen.getByText('Processing Complete!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download files/i })).toBeInTheDocument();

    // Reset workflow
    const resetBtn = screen.getByRole('button', { name: /process another/i });
    act(() => {
      fireEvent.click(resetBtn);
    });

    // Returned to dropzone
    expect(screen.getByText('Drop your files here, or')).toBeInTheDocument();
  });
});
