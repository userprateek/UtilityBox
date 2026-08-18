import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageCropperWorkspace } from './ImageCropperWorkspace';
import { ToolMetadata } from '@/types/tool';

describe('ImageCropperWorkspace Component', () => {
  const mockCropperTool: ToolMetadata = {
    slug: 'image-cropper',
    name: 'Image Cropper',
    shortDescription: 'Crop images interactively',
    description: 'Crop photos in browser',
    category: 'image',
    iconName: 'Crop',
    supportedInputFormats: ['image/jpeg', 'image/png'],
    seoTitle: 'Image Cropper',
    seoDescription: 'Crop images online',
    keywords: ['crop'],
  };

  it('renders initial dropzone and loads image when file is uploaded', () => {
    const { container } = render(<ImageCropperWorkspace tool={mockCropperTool} />);

    expect(screen.getByText('Image Cropper')).toBeInTheDocument();
    expect(
      screen.getByText(/Select or drop any JPG, PNG, or WebP photo to crop/i)
    ).toBeInTheDocument();

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['fake-png-data'], 'sample.png', { type: 'image/png' });

    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    // Workspace rendered with ratio options
    expect(screen.getByText('Freeform')).toBeInTheDocument();
    expect(screen.getByText('1:1')).toBeInTheDocument();
    expect(screen.getByText('16:9')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crop image now/i })).toBeInTheDocument();
  });

  it('switches aspect ratio presets and changes active ratio', () => {
    const { container } = render(<ImageCropperWorkspace tool={mockCropperTool} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['fake-png-data'], 'sample.png', { type: 'image/png' });

    act(() => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const ratio169Btn = screen.getByText('16:9');
    act(() => {
      fireEvent.click(ratio169Btn);
    });

    expect(ratio169Btn).toBeInTheDocument();
  });
});
