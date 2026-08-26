'use client';

import React, { useState } from 'react';
import { Type, FileText, Trash2, ListFilter, AlignLeft, RotateCcw } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { CopyButton } from '@/components/common/CopyButton/CopyButton';
import styles from './TextTools.module.scss';

export interface TextToolsWorkspaceProps {
  tool: ToolMetadata;
}

export const TextToolsWorkspace: React.FC<TextToolsWorkspaceProps> = ({ tool }) => {
  const [text, setText] = useState<string>(
    'DocsWala is a 100% free and private suite of client-side browser tools.'
  );
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  const pushHistory = (currentText: string) => {
    setHistoryStack((prev) => [...prev, currentText]);
  };

  const handleRevert = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setText(previous ?? '');
  };

  const handleClear = () => {
    if (text) {
      pushHistory(text);
      setText('');
    }
  };

  // Word counter statistics
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s+/g, '').length;
  const sentenceCount = trimmed
    ? (trimmed.match(/[^.!?]+(?:[.!?]+|$)/g) || [trimmed]).filter((s) => s.trim()).length
    : 0;
  const paragraphCount = trimmed ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);

  // Case Conversion Functions
  const applyTransform = (transformFn: (t: string) => string) => {
    const next = transformFn(text);
    if (next !== text) {
      pushHistory(text);
      setText(next);
    }
  };

  const toUppercase = () => applyTransform((t) => t.toUpperCase());
  const toLowercase = () => applyTransform((t) => t.toLowerCase());
  const toTitleCase = () => {
    applyTransform((t) =>
      t.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
    );
  };
  const toSentenceCase = () => {
    applyTransform((t) =>
      t
        .toLowerCase()
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_m, p1: string, p2: string) => p1 + p2.toUpperCase())
    );
  };
  const toCamelCase = () => {
    applyTransform((t) => {
      const words = t
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[\s_\-]+/)
        .filter(Boolean);
      return words
        .map((word, index) => {
          const lower = word.toLowerCase();
          if (index === 0) return lower;
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
    });
  };
  const toKebabCase = () => {
    applyTransform((t) =>
      t
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
    );
  };

  // Duplicate Lines Handler
  const handleRemoveDuplicates = () => {
    applyTransform((t) => {
      const lines = t.split('\n');
      const uniqueLines = Array.from(new Set(lines));
      return uniqueLines.join('\n');
    });
  };

  const handleSortLines = () => {
    applyTransform((t) => {
      const lines = t.split('\n');
      lines.sort((a, b) => a.localeCompare(b));
      return lines.join('\n');
    });
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
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleRevert}
                  disabled={historyStack.length === 0}
                  title="Revert to previous text"
                >
                  <RotateCcw size={14} />
                  <span>Revert</span>
                </button>
                <CopyButton
                  className={styles.actionBtn}
                  text={text}
                  idleLabel="Copy"
                  copiedLabel="Copied"
                  iconSize={14}
                />
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
                  <button
                    type="button"
                    className={styles.revertBtn}
                    onClick={handleRevert}
                    disabled={historyStack.length === 0}
                    title="Revert to previous text"
                  >
                    <RotateCcw size={14} />
                    <span>Revert / Undo</span>
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
                  <button
                    type="button"
                    className={styles.revertBtn}
                    onClick={handleRevert}
                    disabled={historyStack.length === 0}
                    title="Revert to previous text"
                  >
                    <RotateCcw size={14} />
                    <span>Revert / Undo</span>
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
