import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextToolsWorkspace } from './TextToolsWorkspace';
import { ToolMetadata } from '@/types/tool';

const tool: ToolMetadata = {
  slug: 'word-counter',
  name: 'Word Counter',
  shortDescription: 'Count words',
  description: 'Count words',
  category: 'text',
  iconName: 'Type',
  supportedInputFormats: ['text/plain'],
  seoTitle: 'Word Counter',
  seoDescription: 'Count words',
  keywords: ['words'],
};

describe('word counter', () => {
  it('counts the five-word sample, then still counts a different sentence', () => {
    render(<TextToolsWorkspace tool={tool} />);
    const sample = 'Alpha beta gamma.\n\nDelta delta.';
    fireEvent.change(screen.getByRole('textbox'), { target: { value: sample } });

    expect(screen.getByTestId('word-count')).toHaveTextContent('5');
    expect(screen.getByTestId('char-count')).toHaveTextContent(String(sample.length));
    expect(screen.getByTestId('sentence-count')).toHaveTextContent('2');
    expect(screen.getByTestId('paragraph-count')).toHaveTextContent('2');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Only two' } });
    expect(screen.getByTestId('word-count')).toHaveTextContent('2');
  });
});
