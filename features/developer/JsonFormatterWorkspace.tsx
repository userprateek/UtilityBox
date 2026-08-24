'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  Braces,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Trash2,
  FileText,
  Minimize2,
  Sliders,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Code,
  Unlock,
  Eye,
} from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { downloadBlob, generateDownloadFilename, formatBytes } from '@/lib/file/fileUtils';
import styles from './DevTools.module.scss';

export interface JsonFormatterWorkspaceProps {
  tool: ToolMetadata;
}

type IndentMode = '2' | '4' | 'tab';
type ViewTab = 'formatted' | 'tree';

const SAMPLE_JSON = `{
  "appName": "DocsWala",
  "version": "1.0.0",
  "privacy": "100% Client-Side",
  "features": [
    "Image Compressor",
    "PDF Merger",
    "Passport Photo Sheet Generator",
    "JSON Formatter & Validator"
  ],
  "author": {
    "name": "DocsWala Team",
    "country": "India"
  },
  "metrics": {
    "activeUsers": 50000,
    "rating": 4.9,
    "isProductionReady": true
  }
}`;

// ----------------------------------------------------------------------------
// Interactive Recursive Collapsible Tree Node Component
// ----------------------------------------------------------------------------
interface JsonTreeNodeProps {
  name?: string;
  data: unknown;
  depth?: number;
  isLast?: boolean;
  defaultExpanded?: boolean;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({
  name,
  data,
  depth = 0,
  isLast = true,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  if (data === null) {
    return (
      <div className={styles.treeRow} style={{ paddingLeft: `${depth * 16}px` }}>
        {name && <span className={styles.treeKey}>"{name}": </span>}
        <span className={styles.treeValNull}>null</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof data === 'boolean') {
    return (
      <div className={styles.treeRow} style={{ paddingLeft: `${depth * 16}px` }}>
        {name && <span className={styles.treeKey}>"{name}": </span>}
        <span className={styles.treeValBoolean}>{data ? 'true' : 'false'}</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof data === 'number') {
    return (
      <div className={styles.treeRow} style={{ paddingLeft: `${depth * 16}px` }}>
        {name && <span className={styles.treeKey}>"{name}": </span>}
        <span className={styles.treeValNumber}>{data}</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof data === 'string') {
    return (
      <div className={styles.treeRow} style={{ paddingLeft: `${depth * 16}px` }}>
        {name && <span className={styles.treeKey}>"{name}": </span>}
        <span className={styles.treeValString}>"{data}"</span>
        {!isLast && ','}
      </div>
    );
  }

  if (typeof data === 'object') {
    const isArray = Array.isArray(data);
    const keys = Object.keys(data as object);
    const openBrack = isArray ? '[' : '{';
    const closeBrack = isArray ? ']' : '}';

    if (keys.length === 0) {
      return (
        <div className={styles.treeRow} style={{ paddingLeft: `${depth * 16}px` }}>
          {name && <span className={styles.treeKey}>"{name}": </span>}
          <span>
            {openBrack}
            {closeBrack}
          </span>
          {!isLast && ','}
        </div>
      );
    }

    return (
      <div>
        <div className={styles.treeRow} style={{ paddingLeft: `${depth * 16}px` }}>
          <button
            type="button"
            className={styles.treeToggleBtn}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse block' : 'Expand block'}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {name && <span className={styles.treeKey}>"{name}": </span>}
          <span>{openBrack}</span>
          {!isExpanded && (
            <span className={styles.treeBadge}>
              {keys.length} {isArray ? 'items' : 'keys'}
            </span>
          )}
          {!isExpanded && <span>{closeBrack}</span>}
          {!isExpanded && !isLast && ','}
        </div>

        {isExpanded && (
          <div>
            {keys.map((key, idx) => (
              <JsonTreeNode
                key={key}
                name={isArray ? undefined : key}
                data={(data as Record<string, unknown>)[key]}
                depth={depth + 1}
                isLast={idx === keys.length - 1}
                defaultExpanded={depth < 2}
              />
            ))}
            <div className={styles.treeRow} style={{ paddingLeft: `${depth * 16}px` }}>
              <span>{closeBrack}</span>
              {!isLast && ','}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

// ----------------------------------------------------------------------------
// Main Workspace Component
// ----------------------------------------------------------------------------
export const JsonFormatterWorkspace: React.FC<JsonFormatterWorkspaceProps> = ({ tool }) => {
  const [input, setInput] = useState<string>(SAMPLE_JSON);
  const [indentMode, setIndentMode] = useState<IndentMode>('2');
  const [viewTab, setViewTab] = useState<ViewTab>('formatted');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandTree, setExpandTree] = useState<boolean>(true);

  let formattedOutput = '';
  let parsedJsonData: unknown = null;
  let isValidJson = false;
  let jsonError: string | null = null;
  let keyCount = 0;
  let byteSize = 0;

  if (input.trim()) {
    try {
      let raw = input.trim();
      // Auto unescape if string starts/ends with quotes and contains escaped quotes
      if (
        (raw.startsWith('"') && raw.endsWith('"')) ||
        (raw.startsWith("'") && raw.endsWith("'"))
      ) {
        try {
          const unescaped = JSON.parse(raw);
          if (typeof unescaped === 'string' && (unescaped.startsWith('{') || unescaped.startsWith('['))) {
            raw = unescaped;
          }
        } catch {
          // ignore
        }
      }

      parsedJsonData = JSON.parse(raw);
      isValidJson = true;

      const indentVal = indentMode === 'tab' ? '\t' : parseInt(indentMode, 10);
      formattedOutput = JSON.stringify(parsedJsonData, null, indentVal);
      byteSize = new Blob([formattedOutput]).size;

      const countKeys = (obj: unknown): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        let count = 0;
        if (Array.isArray(obj)) {
          obj.forEach((item) => {
            count += countKeys(item);
          });
        } else {
          const keys = Object.keys(obj);
          count += keys.length;
          keys.forEach((key) => {
            count += countKeys((obj as Record<string, unknown>)[key]);
          });
        }
        return count;
      };

      keyCount = countKeys(parsedJsonData);
    } catch (err: unknown) {
      isValidJson = false;
      if (err instanceof Error) {
        jsonError = err.message;
      } else {
        jsonError = 'Invalid JSON syntax.';
      }
    }
  }

  // 1-Click Action Handlers
  const handlePrettify = () => {
    if (!input.trim()) return;
    try {
      let raw = input.trim();
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        try {
          const unescaped = JSON.parse(raw);
          if (typeof unescaped === 'string') raw = unescaped;
        } catch {
          // ignore
        }
      }
      const parsed = JSON.parse(raw);
      const indentVal = indentMode === 'tab' ? '\t' : parseInt(indentMode, 10);
      setInput(JSON.stringify(parsed, null, indentVal));
    } catch {
      // keep current input for user review
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      let raw = input.trim();
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        try {
          const unescaped = JSON.parse(raw);
          if (typeof unescaped === 'string') raw = unescaped;
        } catch {
          // ignore
        }
      }
      const parsed = JSON.parse(raw);
      setInput(JSON.stringify(parsed));
    } catch {
      // keep current input for user review
    }
  };

  const handleUnescape = () => {
    if (!input.trim()) return;
    try {
      let text = input.trim();
      if (text.startsWith('"') && text.endsWith('"')) {
        text = JSON.parse(text);
      } else {
        text = text.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }
      const parsed = JSON.parse(text);
      const indentVal = indentMode === 'tab' ? '\t' : parseInt(indentMode, 10);
      setInput(JSON.stringify(parsed, null, indentVal));
    } catch {
      // fallback basic replace unescape
      setInput(input.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text);
    } catch {
      // ignore clipboard permission error
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setInput(text);
    };
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    const textToCopy = isValidJson ? formattedOutput : input;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    const textToDownload = isValidJson ? formattedOutput : input;
    if (!textToDownload) return;

    const blob = new Blob([textToDownload], { type: 'application/json' });
    const filename = generateDownloadFilename('data.json', 'formatted', 'json');
    downloadBlob(blob, filename);
  };

  return (
    <div className={styles.workspace}>
      <ToolHeader tool={tool} />

      <Card variant="glass" padding="lg" className={styles.toolCard}>
        <div className={styles.cardHeader}>
          <Braces size={22} className={styles.headerIcon} />
          <h3 className={styles.cardTitle}>JSON Formatter, Validator & Tree Viewer</h3>
        </div>

        {/* Action Toolbar */}
        <div className={styles.controlsRow}>
          <button type="button" className={styles.generateBtn} onClick={handlePrettify}>
            <Sliders size={14} />
            <span>✨ Beautify / Format</span>
          </button>
          <button type="button" className={styles.cntBtn} onClick={handleMinify} title="Compress JSON into 1 line">
            <Minimize2 size={14} />
            <span>⚡ Minify (Uglify)</span>
          </button>
          <button type="button" className={styles.cntBtn} onClick={handleUnescape} title="Unescape stringified JSON string">
            <Unlock size={14} />
            <span>🔓 Unescape JSON</span>
          </button>
          <button type="button" className={styles.cntBtn} onClick={handlePasteClipboard} title="Paste from clipboard">
            <Clipboard size={14} />
            <span>📋 Paste</span>
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={styles.label}>Indent:</span>
            <button
              type="button"
              className={`${styles.cntBtn} ${indentMode === '2' ? styles.cntBtnActive : ''}`}
              onClick={() => setIndentMode('2')}
            >
              2 Spaces
            </button>
            <button
              type="button"
              className={`${styles.cntBtn} ${indentMode === '4' ? styles.cntBtnActive : ''}`}
              onClick={() => setIndentMode('4')}
            >
              4 Spaces
            </button>
            <button
              type="button"
              className={`${styles.cntBtn} ${indentMode === 'tab' ? styles.cntBtnActive : ''}`}
              onClick={() => setIndentMode('tab')}
            >
              Tab
            </button>
          </div>
        </div>

        {/* Raw Text Input (Copy / Paste area) */}
        <textarea
          className={styles.textarea}
          rows={10}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste or type raw JSON here... (or paste escaped JSON string like {"foo":"bar"})'
          aria-label="JSON Input String"
        />

        {/* Toolbar & Secondary Controls */}
        <div className={styles.actionsRow} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label htmlFor="json-file-upload-input" className={styles.cntBtn} style={{ cursor: 'pointer', margin: 0 }}>
              <FileText size={14} />
              <span>Upload .json File</span>
              <input
                id="json-file-upload-input"
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button type="button" className={styles.cntBtn} onClick={() => setInput(SAMPLE_JSON)}>
              <Code size={14} />
              <span>Load Sample</span>
            </button>
            <button type="button" className={styles.cntBtn} onClick={() => setInput('')} title="Clear text">
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className={styles.copyBtn} onClick={handleCopy} disabled={!input.trim()}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
            <button type="button" className={styles.generateBtn} onClick={handleDownload} disabled={!input.trim()}>
              <Download size={14} />
              <span>Download .json</span>
            </button>
          </div>
        </div>

        {/* Validation Status & Interactive Tree Output */}
        {input.trim() && (
          <div className={styles.outputBox}>
            {isValidJson ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                    <CheckCircle2 size={18} />
                    <strong style={{ fontSize: '0.875rem' }}>Valid JSON Structure</strong>
                  </div>

                  {/* Mode Toggles: Code vs Interactive Tree */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className={`${styles.cntBtn} ${viewTab === 'formatted' ? styles.cntBtnActive : ''}`}
                      onClick={() => setViewTab('formatted')}
                    >
                      <Code size={13} />
                      <span>Code View</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.cntBtn} ${viewTab === 'tree' ? styles.cntBtnActive : ''}`}
                      onClick={() => setViewTab('tree')}
                    >
                      <Eye size={13} />
                      <span>Foldable Tree View</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                  <span>Total Keys: <strong>{keyCount}</strong></span>
                  <span>Formatted Size: <strong>{formatBytes(byteSize)}</strong></span>
                </div>

                {viewTab === 'formatted' ? (
                  <pre className={styles.preJson}>{formattedOutput}</pre>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button
                        type="button"
                        className={styles.cntBtn}
                        onClick={() => setExpandTree(!expandTree)}
                      >
                        {expandTree ? 'Collapse All Blocks' : 'Expand All Blocks'}
                      </button>
                    </div>
                    <div className={styles.jsonTreeContainer}>
                      <JsonTreeNode data={parsedJsonData} defaultExpanded={expandTree} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.errorBox} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <div>
                  <strong>Invalid JSON Syntax:</strong> {jsonError}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
