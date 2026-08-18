import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolsDirectoryClient } from './ToolsDirectoryClient';
import { getAllTools } from '@/config/tools/registry';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe('ToolsDirectoryClient Component Integration', () => {
  const allTools = getAllTools();

  it('renders search input and category filter buttons', () => {
    render(<ToolsDirectoryClient initialTools={allTools} />);

    expect(screen.getByPlaceholderText(/Search all utilities/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /all tools/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /image tools/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pdf tools/i })).toBeInTheDocument();
  });

  it('filters tools when searching with keyword', () => {
    render(<ToolsDirectoryClient initialTools={allTools} />);

    const searchInput = screen.getByPlaceholderText(/Search all utilities/i);

    fireEvent.change(searchInput, { target: { value: 'cropper' } });

    expect(screen.getByText('Image Cropper')).toBeInTheDocument();
    expect(screen.queryByText('PDF Merger')).not.toBeInTheDocument();
  });

  it('filters tools when clicking category tab', () => {
    render(<ToolsDirectoryClient initialTools={allTools} />);

    const pdfTab = screen.getByRole('tab', { name: /pdf tools/i });
    fireEvent.click(pdfTab);

    expect(screen.getByText('PDF Compressor')).toBeInTheDocument();
    expect(screen.getByText('PDF Merger')).toBeInTheDocument();
    expect(screen.queryByText('Image Compressor')).not.toBeInTheDocument();
  });

  it('shows empty state and allows resetting filters when no matches found', () => {
    render(<ToolsDirectoryClient initialTools={allTools} />);

    const searchInput = screen.getByPlaceholderText(/Search all utilities/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistentquery123' } });

    expect(screen.getByText(/No utilities match your search/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset filters/i });
    fireEvent.click(resetBtn);

    expect(screen.queryByText(/No utilities match your search/i)).not.toBeInTheDocument();
    expect(screen.getByText('Image Compressor')).toBeInTheDocument();
  });
});
