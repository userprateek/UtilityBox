'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, RotateCcw, Sparkles, X } from 'lucide-react';
import { ToolMetadata } from '@/types/tool';
import { Button } from '@/components/common/Button/Button';
import { Card } from '@/components/common/Card/Card';
import { Select } from '@/components/common/Select/Select';
import { Alert } from '@/components/common/States/Alert';
import { ProgressBar } from '@/components/common/ProgressBar/ProgressBar';
import { ToolHeader } from '@/components/tool/ToolHeader/ToolHeader';
import { FileDropzone } from '@/components/file-upload/FileDropzone/FileDropzone';
import { AUTO_DETECT_CODE, TRANSLATION_LANGUAGES, websiteLanguageToTarget } from '@/lib/ai/translation/languages';
import { downloadBlob, formatBytes, generateDownloadFilename } from '@/lib/file/fileUtils';
import { trackToolDownload, trackToolUse } from '@/lib/analytics/gtag';
import styles from './DocumentTranslatorWorkspace.module.scss';

export interface DocumentTranslatorWorkspaceProps {
  tool: ToolMetadata;
}

interface StreamEvent {
  type: string;
  id?: string;
  label?: string;
  message?: string;
  code?: string;
  mimeType?: string;
  fileName?: string;
  data?: string;
  strategy?: string;
}

const SOURCE_OPTIONS = [
  { value: AUTO_DETECT_CODE, label: 'Auto detect' },
  ...TRANSLATION_LANGUAGES.map((lang) => ({
    value: lang.code,
    label: `${lang.name} (${lang.nativeName})`,
  })),
];

const TARGET_OPTIONS = TRANSLATION_LANGUAGES.map((lang) => ({
  value: lang.code,
  label: `${lang.name} (${lang.nativeName})`,
}));

export const DocumentTranslatorWorkspace: React.FC<DocumentTranslatorWorkspaceProps> = ({
  tool,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState(AUTO_DETECT_CODE);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [busy, setBusy] = useState(false);
  const [statusLabel, setStatusLabel] = useState('');
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string>('');
  const [resultMime, setResultMime] = useState<string>('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setTargetLanguage(websiteLanguageToTarget(document.documentElement.lang));
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  const clearResult = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setResultBlob(null);
    setResultName('');
    setResultMime('');
  }, [resultUrl]);

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const next = Array.from(incoming)[0];
      if (!next) return;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      clearResult();
      setError(null);
      setStatusLog([]);
      setFile(next);
      setPreviewUrl(next.type.startsWith('image/') ? URL.createObjectURL(next) : null);
    },
    [clearResult, previewUrl]
  );

  const removeFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setStatusLog([]);
    clearResult();
  }, [clearResult, previewUrl]);

  const languageOptionsReady = useMemo(() => TARGET_OPTIONS, []);

  const translate = useCallback(async () => {
    if (!file || busy) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    clearResult();
    setStatusLog(['Understanding document']);
    setStatusLabel('Understanding document');
    trackToolUse(tool.slug, 'translate');

    try {
      const form = new FormData();
      form.set('file', file);
      form.set('sourceLanguage', sourceLanguage);
      form.set('targetLanguage', targetLanguage);

      const response = await fetch('/api/translate-document', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as StreamEvent;
        throw new Error(payload.message || 'Translation failed.');
      }

      if (!response.body) {
        throw new Error('Translation failed.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let leftover = '';

      const handleEvent = (event: StreamEvent) => {
        if (event.type === 'stage' && event.label) {
          setStatusLabel(event.label);
          setStatusLog((prev) => (prev.includes(event.label!) ? prev : [...prev, event.label!]));
        }
        if (event.type === 'fallback' && event.label) {
          setStatusLabel(event.label);
          setStatusLog((prev) => [...prev, event.label!]);
        }
        if (event.type === 'error') {
          throw new Error(
            event.message ||
              "We couldn't translate this document successfully. The document may be unsupported or its content may not be extractable."
          );
        }
        if (event.type === 'done' && event.data && event.mimeType) {
          const bytes = Uint8Array.from(atob(event.data), (char) => char.charCodeAt(0));
          const blob = new Blob([bytes], { type: event.mimeType });
          const url = URL.createObjectURL(blob);
          setResultBlob(blob);
          setResultUrl(url);
          setResultMime(event.mimeType);
          setResultName(
            generateDownloadFilename(file.name, 'document-translator', event.mimeType.split('/')[1])
          );
          setStatusLabel('Ready to download');
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        leftover += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = leftover.split('\n');
        leftover = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          handleEvent(JSON.parse(line) as StreamEvent);
        }
        if (done) {
          if (leftover.trim()) handleEvent(JSON.parse(leftover) as StreamEvent);
          break;
        }
      }
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return;
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't translate this document successfully. The document may be unsupported or its content may not be extractable."
      );
    } finally {
      setBusy(false);
    }
  }, [busy, clearResult, file, sourceLanguage, targetLanguage, tool.slug]);

  const download = useCallback(() => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, resultName || generateDownloadFilename(file?.name || 'document', 'document-translator'));
    trackToolDownload(tool.slug);
  }, [file?.name, resultBlob, resultName, tool.slug]);

  return (
    <div className={styles.wrapper}>
      <ToolHeader tool={tool} />

      <div className={styles.grid}>
        <Card className={styles.card}>
          {!file ? (
            <FileDropzone
              onFilesSelected={handleFiles}
              acceptFormats={tool.supportedInputFormats as string[]}
              maxFiles={1}
              maxFileSizeMB={tool.maxFileSizeMB}
              helperText={`One PDF or image, up to ${tool.maxFileSizeMB} MB`}
              privacyNote="This file is uploaded to the DocsWala server and sent to Google Gemini. DocsWala does not keep a copy after the response."
            />
          ) : (
            <>
              <div className={styles.fileMeta}>
                <span>
                  {file.name} · {formatBytes(file.size)}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={removeFile} disabled={busy}>
                  <X size={14} />
                  Remove
                </Button>
              </div>
              <div className={styles.previewBox}>
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Upload preview" className={styles.previewImage} />
                ) : (
                  <p>PDF selected — translation will keep the page order.</p>
                )}
              </div>
            </>
          )}

          <div className={styles.langRow}>
            <Select
              label="Document language"
              options={SOURCE_OPTIONS}
              value={sourceLanguage}
              onChange={(event) => setSourceLanguage(event.target.value)}
              helperText="Source language of the uploaded file, not the website language."
            />
            <Select
              label="Translate into"
              options={languageOptionsReady}
              value={targetLanguage}
              onChange={(event) => setTargetLanguage(event.target.value)}
              helperText="Defaults to the current website language. You can change it."
            />
          </div>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="primary"
              onClick={translate}
              isLoading={busy}
              disabled={!file || busy}
              leftIcon={<Sparkles size={16} />}
            >
              Translate
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearResult();
                setError(null);
                setStatusLog([]);
              }}
              disabled={busy || (!resultBlob && !error)}
              leftIcon={<RotateCcw size={16} />}
            >
              Try another language
            </Button>
          </div>

          {busy && (
            <>
              <ProgressBar percentage={statusLog.length * 20} label={statusLabel} showPercentageText={false} />
              <ul className={styles.statusList}>
                {statusLog.map((item) => (
                  <li
                    key={item}
                    className={`${styles.statusItem} ${item === statusLabel ? styles.statusActive : ''}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {error && (
            <Alert type="error" title="Translation could not finish">
              {error}
            </Alert>
          )}

          <p className={styles.notice}>
            This file is uploaded to the DocsWala server, which sends it to Google Gemini.
            DocsWala does not keep the file after the response. Google&apos;s retention of the
            document is covered by Google&apos;s policies. Other DocsWala file tools stay in the
            browser.
          </p>
        </Card>

        <Card className={styles.card}>
          <h2>Translated preview</h2>
          {!resultUrl ? (
            <p className={styles.notice}>
              The translated PDF or image will appear here. Output is a document, not plain text.
            </p>
          ) : (
            <>
              <div className={styles.previewBox}>
                {resultMime.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Translated preview" className={styles.previewImage} />
                ) : (
                  <iframe title="Translated PDF" src={resultUrl} className={styles.previewFrame} />
                )}
              </div>
              <Button type="button" variant="primary" onClick={download} leftIcon={<Download size={16} />}>
                Download translated file
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
