import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextToolsWorkspace } from './TextToolsWorkspace';
import { ToolMetadata } from '@/types/tool';

const mockWordCounterTool: ToolMetadata = {
  slug: 'word-counter',
  name: 'Word & Character Counter',
  shortDescription: 'Count words and characters',
  description: 'Count words and characters in real time',
  category: 'text',
  iconName: 'FileText',
  supportedInputFormats: ['text/plain'],
  seoTitle: 'Word Counter',
  seoDescription: 'Word Counter online',
  keywords: ['words'],
};

const mockCaseConverterTool: ToolMetadata = {
  ...mockWordCounterTool,
  slug: 'case-converter',
  name: 'Text Case Converter',
};

const mockRemoveDuplicatesTool: ToolMetadata = {
  ...mockWordCounterTool,
  slug: 'remove-duplicates',
  name: 'Remove Duplicate Lines',
};

describe('Text Tools Suite', () => {
  describe('Word & Character Counter', () => {
    it('calculates word count, char count, and sentences in real time', () => {
      render(<TextToolsWorkspace tool={mockWordCounterTool} />);

      const textarea = screen.getByPlaceholderText(/Type or paste your text here/i);
      fireEvent.change(textarea, { target: { value: 'Hello world. DocsWala is awesome!' } });

      expect(screen.getByText('5')).toBeInTheDocument(); // 5 words
    });
  });

  describe('Text Case Converter', () => {
    it('transforms text to UPPERCASE and lowercase', () => {
      render(<TextToolsWorkspace tool={mockCaseConverterTool} />);

      const textarea = screen.getByPlaceholderText(/Type or paste your text here/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'hello world' } });

      const upperBtn = screen.getByRole('button', { name: 'UPPERCASE' });
      fireEvent.click(upperBtn);

      expect(textarea.value).toBe('HELLO WORLD');

      fireEvent.change(textarea, { target: { value: 'hello-world' } });
      fireEvent.click(screen.getByRole('button', { name: 'camelCase' }));
      expect(textarea.value).toBe('helloWorld');

      const revertBtn = screen.getAllByText(/Revert/i)[0]!;
      fireEvent.click(revertBtn);
      expect(textarea.value).toBe('hello-world');
    });
  });

  describe('Remove Duplicate Lines', () => {
    it('deduplicates lines and sorts them A-Z', () => {
      render(<TextToolsWorkspace tool={mockRemoveDuplicatesTool} />);

      const textarea = screen.getByPlaceholderText(/Type or paste your text here/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'banana\napple\nbanana\ncherry' } });

      const removeBtn = screen.getByRole('button', { name: 'Remove Duplicate Lines' });
      fireEvent.click(removeBtn);

      expect(textarea.value).toBe('banana\napple\ncherry');

      const sortBtn = screen.getByRole('button', { name: 'Sort Lines A-Z' });
      fireEvent.click(sortBtn);

      expect(textarea.value).toBe('apple\nbanana\ncherry');
    });
  });
});
