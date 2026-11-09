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
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});

    const selectButton = screen.getByRole('button', { name: /select files/i });
    fireEvent.click(selectButton);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const zone = screen.getByLabelText(/upload files by clicking or dragging/i);
    fireEvent.click(zone);
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('is keyboard focusable and opens the file picker with Enter and Space', () => {
    const { container } = render(<FileDropzone onFilesSelected={jest.fn()} />);
    const zone = screen.getByLabelText(/upload files by clicking or dragging/i);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});

    expect(zone).toHaveAttribute('tabindex', '0');
    zone.focus();
    expect(zone).toHaveFocus();

    fireEvent.keyDown(zone, { key: 'Enter' });
    fireEvent.keyDown(zone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('does not open the file picker from the dropzone when a child control handles the key', () => {
    const { container } = render(<FileDropzone onFilesSelected={jest.fn()} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});
    const selectButton = screen.getByRole('button', { name: /select files/i });

    fireEvent.keyDown(selectButton, { key: 'Enter' });
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('is not keyboard activatable when disabled', () => {
    const { container } = render(<FileDropzone onFilesSelected={jest.fn()} disabled />);
    const zone = screen.getByLabelText(/upload files by clicking or dragging/i);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});

    expect(zone).toHaveAttribute('tabindex', '-1');
    expect(zone).toHaveAttribute('aria-disabled', 'true');
    fireEvent.keyDown(zone, { key: 'Enter' });
    fireEvent.click(zone);
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('still forwards drag and drop handlers', () => {
    const onDrop = jest.fn();
    const onDragOver = jest.fn();
    render(
      <FileDropzone
        onFilesSelected={jest.fn()}
        dragProps={{ onDrop, onDragOver }}
      />
    );
    const zone = screen.getByLabelText(/upload files by clicking or dragging/i);
    fireEvent.dragOver(zone);
    fireEvent.drop(zone);
    expect(onDragOver).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledTimes(1);
  });
});
