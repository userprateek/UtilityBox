'use client';

import React, { useState } from 'react';
import { Key, Link, Shield, Copy, Check, RefreshCw, Code, Trash2 } from 'lucide-react';
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
        const headerJson = atob(part0.replace(/-/g, '+').replace(/_/g, '/'));
        const payloadJson = atob(part1.replace(/-/g, '+').replace(/_/g, '/'));
        jwtHeader = JSON.parse(headerJson);
        jwtPayload = JSON.parse(payloadJson);
      } else {
        jwtError = 'Invalid JWT Token structure (Expected Header.Payload.Signature)';
      }
    } catch (err) {
      jwtError = 'Failed to decode JWT base64 JSON token string.';
    }
  }

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
    </div>
  );
};
