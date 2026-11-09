import React from 'react';
import { render, screen } from '@testing-library/react';
import { DocumentTranslatorWorkspace } from './DocumentTranslatorWorkspace';
import { getToolBySlug } from '@/config/tools/registry';

describe('DocumentTranslatorWorkspace', () => {
  it('renders upload, language selectors, and the AI privacy notice', () => {
    const tool = getToolBySlug('document-translator');
    expect(tool).toBeDefined();
    render(<DocumentTranslatorWorkspace tool={tool!} />);

    expect(screen.getByRole('heading', { name: /AI Document Translator/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Document language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Translate into/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Translate/i })).toBeDisabled();
    expect(screen.getAllByText(/Google Gemini/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/100% In-Browser Privacy/i)).not.toBeInTheDocument();
  });
});
