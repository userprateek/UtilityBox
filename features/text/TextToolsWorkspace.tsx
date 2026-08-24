'use client';

import React, { useState } from 'react';
import { Type, FileText, Copy, Check, Trash2, ListFilter, AlignLeft } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import styles from './TextTools.module.scss';

export interface TextToolsWorkspaceProps {
  tool: ToolMetadata;
}

export const TextToolsWorkspace: React.FC<TextToolsWorkspaceProps> = ({ tool }) => {
  const [text, setText] = useState<string>(
    'DocsWala is a 100% free and private suite of client-side browser tools.'
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setText('');
  };

  // Word counter statistics
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s+/g, '').length;
  const sentenceCount = trimmed ? (text.match(/[^.!?]+[.!?]+/g) || [text]).length : 0;
  const paragraphCount = trimmed ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);

  // Case Conversion Functions
  const toUppercase = () => setText(text.toUpperCase());
  const toLowercase = () => setText(text.toLowerCase());
  const toTitleCase = () => {
    setText(
      text.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      )
    );
  };
  const toSentenceCase = () => {
    setText(
      text.toLowerCase().replace(/(^\s*|\.\s*)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase())
    );
  };
  const toCamelCase = () => {
    setText(
      text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
          index === 0 ? letter.toLowerCase() : letter.toUpperCase()
        )
        .replace(/\s+/g, '')
    );
  };
  const toKebabCase = () => {
    setText(
      text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
    );
  };

  // Duplicate Lines Handler
  const handleRemoveDuplicates = () => {
    const lines = text.split('\n');
    const uniqueLines = Array.from(new Set(lines));
    setText(uniqueLines.join('\n'));
  };

  const handleSortLines = () => {
    const lines = text.split('\n');
    lines.sort((a, b) => a.localeCompare(b));
    setText(lines.join('\n'));
  };

  const isWordCounter = tool.slug === 'word-counter';
  const isCaseConverter = tool.slug === 'case-converter';
  const isRemoveDuplicates = tool.slug === 'remove-duplicates';

  return (
    <div className={styles.workspace}>
      <ToolHeader tool={tool} />

      <div className={styles.grid}>
        {/* Input Text Area */}
        <div className={styles.mainCol}>
          <Card variant="glass" padding="md" className={styles.editorCard}>
            <div className={styles.toolbar}>
              <span className={styles.toolbarTitle}>
                <AlignLeft size={16} /> Input Text
              </span>
              <div className={styles.toolActions}>
                <button type="button" className={styles.actionBtn} onClick={handleCopy}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button type="button" className={styles.actionBtn} onClick={handleClear}>
                  <Trash2 size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <textarea
              className={styles.textarea}
              rows={10}
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Case Converter Controls */}
            {isCaseConverter && (
              <div className={styles.buttonGroup}>
                <span className={styles.groupLabel}>1-Click Case Transforms:</span>
                <div className={styles.btnsRow}>
                  <button type="button" className={styles.transformBtn} onClick={toUppercase}>
                    UPPERCASE
                  </button>
                  <button type="button" className={styles.transformBtn} onClick={toLowercase}>
                    lowercase
                  </button>
                  <button type="button" className={styles.transformBtn} onClick={toTitleCase}>
                    Title Case
                  </button>
                  <button type="button" className={styles.transformBtn} onClick={toSentenceCase}>
                    Sentence case
                  </button>
                  <button type="button" className={styles.transformBtn} onClick={toCamelCase}>
                    camelCase
                  </button>
                  <button type="button" className={styles.transformBtn} onClick={toKebabCase}>
                    kebab-case
                  </button>
                </div>
              </div>
            )}

            {/* Remove Duplicates Controls */}
            {isRemoveDuplicates && (
              <div className={styles.buttonGroup}>
                <span className={styles.groupLabel}>Line Operations:</span>
                <div className={styles.btnsRow}>
                  <button
                    type="button"
                    className={styles.transformBtn}
                    onClick={handleRemoveDuplicates}
                  >
                    Remove Duplicate Lines
                  </button>
                  <button type="button" className={styles.transformBtn} onClick={handleSortLines}>
                    Sort Lines A-Z
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Stats Column */}
        <div className={styles.statsCol}>
          <Card variant="glass" padding="md" className={styles.statsCard}>
            <h3 className={styles.statsHeader}>
              <FileText size={18} /> Real-Time Text Stats
            </h3>

            <div className={styles.statsList}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{wordCount.toLocaleString()}</span>
                <span className={styles.statLabel}>Words</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{charCount.toLocaleString()}</span>
                <span className={styles.statLabel}>Characters</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{charNoSpaces.toLocaleString()}</span>
                <span className={styles.statLabel}>Chars (No Spaces)</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{sentenceCount.toLocaleString()}</span>
                <span className={styles.statLabel}>Sentences</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{paragraphCount.toLocaleString()}</span>
                <span className={styles.statLabel}>Paragraphs</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statNum}>~{readingTimeMin} min</span>
                <span className={styles.statLabel}>Est. Reading Time</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
