import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileDropzone } from './FileDropzone';

describe('FileDropzone Component', () => {
  it('renders title, subtitle, and supported format badges', () => {
    render(
      <FileDropzone
        onFilesSelected={jest.fn()}
        acceptFormats={['image/jpeg', 'image/png', 'application/pdf']}
        maxFiles={10}
        maxFileSizeMB={25}
      />
    );

    expect(screen.getByText(/Drop your files here/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Files/i)).toBeInTheDocument();
    expect(screen.getByText('JPEG')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('triggers onFilesSelected when files are uploaded via input', () => {
    const handleFilesSelected = jest.fn();
    const { container } = render(
      <FileDropzone onFilesSelected={handleFilesSelected} acceptFormats={['image/jpeg']} />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(handleFilesSelected).toHaveBeenCalledTimes(1);
  });

  it('opens file picker dialog when button or dropzone is clicked', () => {
    const { container } = render(<FileDropzone onFilesSelected={jest.fn()} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click');

    const selectButton = screen.getByRole('button', { name: /select files/i });
    fireEvent.click(selectButton);

    expect(clickSpy).toHaveBeenCalled();
  });
});
