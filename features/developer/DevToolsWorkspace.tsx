'use client';

import React, { useState } from 'react';
import { Key, Link, Shield, Copy, Check, RefreshCw, Code, Trash2, Sparkles } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import styles from './DevTools.module.scss';

export interface DevToolsWorkspaceProps {
  tool: ToolMetadata;
}

export const DevToolsWorkspace: React.FC<DevToolsWorkspaceProps> = ({ tool }) => {
  const [input, setInput] = useState<string>('');
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // UUID v4 Generator
  const generateUuids = () => {
    const arr: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        arr.push(crypto.randomUUID());
      } else {
        // Fallback random UUID v4
        arr.push(
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          })
        );
      }
    }
    setGeneratedUuids(arr);
  };

  // Initial UUID generation
  React.useEffect(() => {
    if (tool.slug === 'uuid') {
      generateUuids();
    }
  }, [tool.slug]);

  // URL Encode / Decode
  const handleUrlEncode = () => setInput(encodeURIComponent(input));
  const handleUrlDecode = () => {
    try {
      setInput(decodeURIComponent(input));
    } catch {
      // ignore
    }
  };

  // JWT Decoder
  let jwtHeader: object | null = null;
  let jwtPayload: object | null = null;
  let jwtError: string | null = null;

  if (tool.slug === 'jwt-decoder' && input.trim()) {
    try {
      const parts = input.trim().split('.');
      const part0 = parts[0];
      const part1 = parts[1];
      if (parts.length >= 2 && part0 && part1) {
        const decodeBase64Url = (str: string) => {
          let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4 !== 0) {
            base64 += '=';
          }
          try {
            return decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
          } catch {
            return atob(base64);
          }
        };

        const headerJson = decodeBase64Url(part0);
        const payloadJson = decodeBase64Url(part1);
        jwtHeader = JSON.parse(headerJson);
        jwtPayload = JSON.parse(payloadJson);
      } else {
        jwtError = 'Invalid JWT Token structure (Expected Header.Payload.Signature)';
      }
    } catch {
      jwtError = 'Failed to decode JWT base64 JSON token string.';
    }
  }

  // Base64 Converter State
  const [base64Tab, setBase64Tab] = useState<'text' | 'file'>('text');
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64Error, setBase64Error] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    rawBase64: string;
  } | null>(null);

  const handleBase64EncodeText = () => {
    try {
      setBase64Error(null);
      const encoded = btoa(
        encodeURIComponent(base64Input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
      setBase64Output(encoded);
    } catch {
      setBase64Error('Failed to encode input text to Base64.');
    }
  };

  const handleBase64DecodeText = () => {
    try {
      setBase64Error(null);
      let cleanInput = base64Input.trim();
      if (cleanInput.includes(';base64,')) {
        cleanInput = cleanInput.split(';base64,')[1] || cleanInput;
      }
      const decoded = decodeURIComponent(
        atob(cleanInput)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      setBase64Output(decoded);
    } catch {
      setBase64Error('Invalid Base64 string provided for decoding.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = (reader.result as string) || '';
      const rawBase64 = dataUrl.split(',')[1] || dataUrl;
      setFileBase64({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        rawBase64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCopyText = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const isUuid = tool.slug === 'uuid';
  const isUrlEncoder = tool.slug === 'url-encoder';
  const isJwtDecoder = tool.slug === 'jwt-decoder';
  const isBase64 =
    tool.slug === 'base64-converter' ||
    tool.slug === 'base64' ||
    tool.slug === 'base64-encoder' ||
    tool.slug === 'base64-decoder';

  return (
    <div className={styles.workspace}>
      <ToolHeader tool={tool} />

      {/* TOOL 1: UUID Generator */}
      {isUuid && (
        <Card variant="glass" padding="lg" className={styles.toolCard}>
          <div className={styles.cardHeader}>
            <Key size={20} className={styles.headerIcon} />
            <h3 className={styles.cardTitle}>UUID v4 Bulk Generator</h3>
          </div>

          <div className={styles.controlsRow}>
            <span className={styles.label}>Number of UUIDs:</span>
            {[1, 5, 10, 20].map((cnt) => (
              <button
                key={cnt}
                type="button"
                className={`${styles.cntBtn} ${uuidCount === cnt ? styles.cntBtnActive : ''}`}
                onClick={() => setUuidCount(cnt)}
              >
                {cnt} {cnt === 1 ? 'UUID' : 'UUIDs'}
              </button>
            ))}
            <button type="button" className={styles.generateBtn} onClick={generateUuids}>
              <RefreshCw size={14} /> Re-Generate
            </button>
          </div>

          <div className={styles.outputBox}>
            <pre className={styles.preText}>{generatedUuids.join('\n')}</pre>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => handleCopyText(generatedUuids.join('\n'))}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied UUIDs!' : 'Copy All UUIDs'}</span>
            </button>
          </div>
        </Card>
      )}

      {/* TOOL 2: URL Encoder / Decoder */}
      {isUrlEncoder && (
        <Card variant="glass" padding="lg" className={styles.toolCard}>
          <div className={styles.cardHeader}>
            <Link size={20} className={styles.headerIcon} />
            <h3 className={styles.cardTitle}>URL Percent Encoder & Decoder</h3>
          </div>

          <textarea
            className={styles.textarea}
            rows={6}
            placeholder="Type or paste URL parameter string here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className={styles.actionsRow}>
            <button type="button" className={styles.generateBtn} onClick={handleUrlEncode}>
              Encode URL
            </button>
            <button type="button" className={styles.generateBtn} onClick={handleUrlDecode}>
              Decode URL
            </button>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => handleCopyText(input)}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>
        </Card>
      )}

      {/* TOOL 3: JWT Decoder */}
      {isJwtDecoder && (
        <Card variant="glass" padding="lg" className={styles.toolCard}>
          <div className={styles.cardHeader}>
            <Shield size={20} className={styles.headerIcon} />
            <h3 className={styles.cardTitle}>Client-Side JWT Token Decoder</h3>
          </div>

          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Paste your JWT token string here (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {jwtError && <div className={styles.errorBox}>⚠️ {jwtError}</div>}

          {jwtHeader && jwtPayload && (
            <div className={styles.jwtResultsGrid}>
              <div className={styles.jwtBlock}>
                <h4 className={styles.jwtBlockTitle}>HEADER: Algorithm & Token Type</h4>
                <pre className={styles.preJson}>{JSON.stringify(jwtHeader, null, 2)}</pre>
              </div>

              <div className={styles.jwtBlock}>
                <h4 className={styles.jwtBlockTitle}>PAYLOAD: Data Claims & Expiry</h4>
                <pre className={styles.preJson}>{JSON.stringify(jwtPayload, null, 2)}</pre>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TOOL 4: Base64 Encoder & Decoder */}
      {isBase64 && (
        <Card variant="glass" padding="lg" className={styles.toolCard}>
          {/* Mode Switcher Tabs */}
          <div className={styles.navTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${base64Tab === 'text' ? styles.tabBtnActive : ''}`}
              onClick={() => setBase64Tab('text')}
            >
              <Code size={15} /> Text / String Converter
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${base64Tab === 'file' ? styles.tabBtnActive : ''}`}
              onClick={() => setBase64Tab('file')}
            >
              <RefreshCw size={15} /> File to Base64 (Data URL)
            </button>
          </div>

          {base64Tab === 'text' ? (
            <>
              <div className={styles.editorGrid}>
                {/* INPUT PANEL */}
                <div className={styles.editorPanel}>
                  <div className={styles.panelHeader}>
                    <span className={styles.panelTitle}>
                      <Code size={14} /> Input Text / Base64
                    </span>
                    <div className={styles.panelActions}>
                      <span className={styles.badge}>{base64Input.length} chars</span>
                      {base64Input && (
                        <button
                          type="button"
                          className={styles.miniBtn}
                          onClick={() => {
                            setBase64Input('');
                            setBase64Output('');
                            setBase64Error(null);
                          }}
                        >
                          <Trash2 size={12} /> Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    className={styles.textarea}
                    placeholder="Type or paste raw text or Base64 string here..."
                    value={base64Input}
                    onChange={(e) => {
                      setBase64Input(e.target.value);
                      setBase64Error(null);
                    }}
                  />
                </div>

                {/* OUTPUT PANEL */}
                <div className={styles.editorPanel}>
                  <div className={styles.panelHeader}>
                    <span className={styles.panelTitle}>
                      <Sparkles size={14} /> Converted Result
                    </span>
                    <div className={styles.panelActions}>
                      {base64Output && (
                        <>
                          <span className={styles.badge}>{base64Output.length} chars</span>
                          <button
                            type="button"
                            className={styles.miniBtn}
                            onClick={() => handleCopyText(base64Output)}
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            {copied ? 'Copied!' : 'Copy Result'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.outputArea}>
                    {base64Output ? (
                      base64Output
                    ) : (
                      <span style={{ color: 'var(--color-text-faint)' }}>
                        Result will appear here after clicking Encode or Decode...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {base64Error && <div className={styles.errorBox}>⚠️ {base64Error}</div>}

              {/* ACTION TOOLBAR */}
              <div className={styles.actionsRow}>
                <button type="button" className={styles.primaryBtn} onClick={handleBase64EncodeText}>
                  Encode to Base64
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={handleBase64DecodeText}>
                  Decode from Base64
                </button>
                {base64Output && (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={() => {
                      setBase64Input(base64Output);
                      setBase64Output('');
                    }}
                  >
                    Swap Input & Result
                  </button>
                )}
              </div>
            </>
          ) : (
            /* File to Base64 */
            <div className={styles.editorPanel}>
              <div className={styles.controlsRow}>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  id="base64-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="base64-file-input" className={styles.primaryBtn} style={{ cursor: 'pointer' }}>
                  Choose File to Convert to Base64
                </label>
              </div>

              {fileBase64 && (
                <div className={styles.outputBox} style={{ marginTop: '16px' }}>
                  <div className={styles.panelHeader} style={{ marginBottom: '12px' }}>
                    <span className={styles.panelTitle}>
                      File: {fileBase64.name} ({(fileBase64.size / 1024).toFixed(1)} KB)
                    </span>
                    <div className={styles.panelActions}>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopyText(fileBase64.dataUrl)}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />} Copy Data URL
                      </button>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopyText(fileBase64.rawBase64)}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />} Copy Raw Base64
                      </button>
                    </div>
                  </div>
                  <pre className={styles.preText} style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {fileBase64.dataUrl}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
