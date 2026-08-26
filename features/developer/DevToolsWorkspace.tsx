'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Key, Link, Shield, Copy, Check, RefreshCw, Code, Trash2, Sparkles } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Card } from '@/components/common/Card/Card';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import {
  decodeBase64Text,
  decodeJwt,
  decodeUrl,
  encodeBase64Text,
  encodeUrl,
  generateUuidV4Batch,
} from './codecs';
import styles from './DevTools.module.scss';

export interface DevToolsWorkspaceProps {
  tool: ToolMetadata;
}

export const DevToolsWorkspace: React.FC<DevToolsWorkspaceProps> = ({ tool }) => {
  return (
    <div className={styles.workspace}>
      <ToolHeader tool={tool} />
      {tool.slug === 'uuid' && <UuidGenerator />}
      {tool.slug === 'url-encoder' && <UrlEncoder />}
      {tool.slug === 'jwt-decoder' && <JwtDecoder />}
      {tool.slug === 'base64-converter' && (
        <Base64Converter maxFileSizeMB={tool.maxFileSizeMB ?? 10} />
      )}
    </div>
  );
};

function UuidGenerator() {
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback((count: number) => {
    const next = generateUuidV4Batch(count);
    setGeneratedUuids(next);
  }, []);

  useEffect(() => {
    generate(uuidCount);
  }, [uuidCount, generate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUuids.join('\n'));
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
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
        <button type="button" className={styles.generateBtn} onClick={() => generate(uuidCount)}>
          <RefreshCw size={14} /> Re-Generate
        </button>
      </div>

      <div className={styles.outputBox}>
        <pre className={styles.preText}>{generatedUuids.join('\n')}</pre>
      </div>

      <div className={styles.actionsRow}>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied UUIDs!' : 'Copy All UUIDs'}</span>
        </button>
      </div>
    </Card>
  );
}

function UrlEncoder() {
  const [input, setInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUrlEncode = () => {
    setUrlError(null);
    setInput(encodeUrl(input));
  };

  const handleUrlDecode = () => {
    const result = decodeUrl(input);
    if (!result.ok) {
      setUrlError(result.error);
      return;
    }
    setUrlError(null);
    setInput(result.value);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
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
        onChange={(e) => {
          setInput(e.target.value);
          setUrlError(null);
        }}
      />

      {urlError && <div className={styles.errorBox}>⚠️ {urlError}</div>}

      <div className={styles.actionsRow}>
        <button type="button" className={styles.generateBtn} onClick={handleUrlEncode}>
          Encode URL
        </button>
        <button type="button" className={styles.generateBtn} onClick={handleUrlDecode}>
          Decode URL
        </button>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : 'Copy Result'}</span>
        </button>
      </div>
    </Card>
  );
}

function JwtDecoder() {
  const [input, setInput] = useState<string>('');

  const jwtResult = useMemo(() => decodeJwt(input), [input]);

  return (
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

      {jwtResult && !jwtResult.ok && <div className={styles.errorBox}>⚠️ {jwtResult.error}</div>}

      {jwtResult && jwtResult.ok && (
        <div className={styles.jwtResultsGrid}>
          <div className={styles.jwtBlock}>
            <h4 className={styles.jwtBlockTitle}>HEADER: Algorithm & Token Type</h4>
            <pre className={styles.preJson}>{JSON.stringify(jwtResult.header, null, 2)}</pre>
          </div>

          <div className={styles.jwtBlock}>
            <h4 className={styles.jwtBlockTitle}>PAYLOAD: Data Claims & Expiry</h4>
            <pre className={styles.preJson}>{JSON.stringify(jwtResult.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </Card>
  );
}

function Base64Converter({ maxFileSizeMB }: { maxFileSizeMB: number }) {
  const [base64Tab, setBase64Tab] = useState<'text' | 'file'>('text');
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64Error, setBase64Error] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    rawBase64: string;
  } | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyText = async (textToCopy: string, key: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedKey(key);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleBase64EncodeText = () => {
    try {
      setBase64Error(null);
      setBase64Output(encodeBase64Text(base64Input));
    } catch {
      setBase64Error('Failed to encode input text to Base64.');
    }
  };

  const handleBase64DecodeText = () => {
    try {
      setBase64Error(null);
      setBase64Output(decodeBase64Text(base64Input));
    } catch {
      setBase64Error('Invalid Base64 string provided for decoding.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const maxBytes = maxFileSizeMB * 1024 * 1024;

    if (!file) return;

    if (file.size > maxBytes) {
      setFileBase64(null);
      setBase64Error(`File exceeds the ${maxFileSizeMB}MB limit.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = (reader.result as string) || '';
      const rawBase64 = dataUrl.split(',')[1] || dataUrl;
      setBase64Error(null);
      setFileBase64({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        rawBase64,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <Card variant="glass" padding="lg" className={styles.toolCard}>
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
                        onClick={() => handleCopyText(base64Output, 'text-result')}
                      >
                        {copiedKey === 'text-result' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedKey === 'text-result' ? 'Copied!' : 'Copy Result'}
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

          {base64Error && <div className={styles.errorBox}>⚠️ {base64Error}</div>}

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
                    onClick={() => handleCopyText(fileBase64.dataUrl, 'data-url')}
                  >
                    {copiedKey === 'data-url' ? <Check size={14} /> : <Copy size={14} />} Copy Data
                    URL
                  </button>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => handleCopyText(fileBase64.rawBase64, 'raw-base64')}
                  >
                    {copiedKey === 'raw-base64' ? <Check size={14} /> : <Copy size={14} />} Copy Raw
                    Base64
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
  );
}
