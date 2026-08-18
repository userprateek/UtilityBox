import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, LoadingState, ErrorState, Alert } from './index';

describe('States and Alert Components', () => {
  describe('EmptyState', () => {
    it('renders title and description', () => {
      render(
        <EmptyState
          title="No documents"
          description="Upload files to begin"
          action={<button>Add Files</button>}
        />
      );

      expect(screen.getByText('No documents')).toBeInTheDocument();
      expect(screen.getByText('Upload files to begin')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Files' })).toBeInTheDocument();
    });
  });

  describe('LoadingState', () => {
    it('renders loading message', () => {
      render(<LoadingState message="Optimizing PDF..." description="Please wait" />);

      expect(screen.getByText('Optimizing PDF...')).toBeInTheDocument();
      expect(screen.getByText('Please wait')).toBeInTheDocument();
    });
  });

  describe('ErrorState', () => {
    it('renders error title and triggers retry action', () => {
      const handleRetry = jest.fn();
      render(
        <ErrorState title="Conversion Failed" message="File is corrupted" onRetry={handleRetry} />
      );

      expect(screen.getByText('Conversion Failed')).toBeInTheDocument();
      expect(screen.getByText('File is corrupted')).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Alert', () => {
    it('renders alert message and dismisses when close is clicked', () => {
      const handleClose = jest.fn();
      render(
        <Alert type="error" title="File Warning" onClose={handleClose}>
          Unsupported format
        </Alert>
      );

      expect(screen.getByText('File Warning')).toBeInTheDocument();
      expect(screen.getByText('Unsupported format')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close alert/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
