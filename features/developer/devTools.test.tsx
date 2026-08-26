import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DevToolsWorkspace } from './DevToolsWorkspace';
import { ToolMetadata } from '@/types/tool';

const mockUuidTool: ToolMetadata = {
  slug: 'uuid',
  name: 'UUID v4 Generator',
  shortDescription: 'Generate UUID v4 strings',
  description: 'Generate UUID v4 strings in bulk',
  category: 'developer',
  iconName: 'Key',
  supportedInputFormats: ['text/plain'],
  seoTitle: 'UUID Generator',
  seoDescription: 'UUID Generator online',
  keywords: ['uuid'],
};

const mockUrlTool: ToolMetadata = {
  ...mockUuidTool,
  slug: 'url-encoder',
  name: 'URL Encoder & Decoder',
};

const mockJwtTool: ToolMetadata = {
  ...mockUuidTool,
  slug: 'jwt-decoder',
  name: 'JWT Token Decoder',
};

describe('Developer Tools Suite', () => {
  describe('UUID Generator', () => {
    it('generates bulk UUID v4 strings', () => {
      render(<DevToolsWorkspace tool={mockUuidTool} />);

      expect(screen.getByText(/UUID v4 Bulk Generator/i)).toBeInTheDocument();
      expect(screen.getByText('Copy All UUIDs')).toBeInTheDocument();
    });
  });

  describe('URL Encoder & Decoder', () => {
    it('encodes and decodes URL strings', () => {
      render(<DevToolsWorkspace tool={mockUrlTool} />);

      const textarea = screen.getByPlaceholderText(/Type or paste URL parameter string here/i) as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'hello world & test' } });

      const encodeBtn = screen.getByText('Encode URL');
      fireEvent.click(encodeBtn);

      expect(textarea.value).toBe('hello%20world%20%26%20test');

      const decodeBtn = screen.getByText('Decode URL');
      fireEvent.click(decodeBtn);

      expect(textarea.value).toBe('hello world & test');
    });
  });

  describe('JWT Token Decoder', () => {
    it('decodes base64url encoded JWT tokens', () => {
      render(<DevToolsWorkspace tool={mockJwtTool} />);

      const sampleJwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const textarea = screen.getByPlaceholderText(/Paste your JWT token string here/i);
      fireEvent.change(textarea, { target: { value: sampleJwt } });

      expect(screen.getByText(/HEADER: Algorithm & Token Type/i)).toBeInTheDocument();
      expect(screen.getByText(/PAYLOAD: Data Claims & Expiry/i)).toBeInTheDocument();
    });
  });

  describe('Base64 Encoder & Decoder', () => {
    it('encodes and decodes base64 strings', () => {
      const mockBase64Tool: ToolMetadata = {
        ...mockUuidTool,
        slug: 'base64-converter',
        name: 'Base64 Encoder & Decoder',
      };

      render(<DevToolsWorkspace tool={mockBase64Tool} />);

      expect(screen.getAllByText('Base64 Encoder & Decoder')[0]).toBeInTheDocument();
      const textarea = screen.getByPlaceholderText(/Type or paste raw text or Base64 string here/i);
      fireEvent.change(textarea, { target: { value: 'Hello World' } });

      const encodeBtn = screen.getByText('Encode to Base64');
      fireEvent.click(encodeBtn);

      expect(screen.getByText('SGVsbG8gV29ybGQ=')).toBeInTheDocument();
    });
  });
});
