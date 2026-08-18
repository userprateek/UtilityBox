'use client';

import { useState, useCallback, useRef } from 'react';
import { ProcessingStatus, ProcessingProgress } from '@/types/tool';

interface UseFileProcessorOptions<TInput, TOutput> {
  processFn?: (
    input: TInput,
    onProgress: (progress: ProcessingProgress) => void
  ) => Promise<TOutput>;
  onSuccess?: (result: TOutput) => void;
  onError?: (error: Error) => void;
}

export function useFileProcessor<TInput = unknown, TOutput = unknown>(
  options: UseFileProcessorOptions<TInput, TOutput> = {}
) {
  const { processFn, onSuccess, onError } = options;
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState<ProcessingProgress>({ percentage: 0 });
  const [result, setResult] = useState<TOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isCancelledRef = useRef<boolean>(false);

  const execute = useCallback(
    async (input: TInput) => {
      if (!processFn) {
        setStatus('completed');
        return null;
      }

      setStatus('processing');
      setProgress({ percentage: 0 });
      setError(null);
      isCancelledRef.current = false;

      try {
        const output = await processFn(input, (prog) => {
          if (!isCancelledRef.current) {
            setProgress(prog);
          }
        });

        if (isCancelledRef.current) {
          setStatus('cancelled');
          return null;
        }

        setResult(output);
        setStatus('completed');
        setProgress({ percentage: 100 });
        onSuccess?.(output);
        return output;
      } catch (err: unknown) {
        if (isCancelledRef.current) {
          setStatus('cancelled');
          return null;
        }
        const errorMsg =
          err instanceof Error ? err.message : 'An unexpected error occurred during processing.';
        setError(errorMsg);
        setStatus('error');
        onError?.(err instanceof Error ? err : new Error(errorMsg));
        return null;
      }
    },
    [processFn, onSuccess, onError]
  );

  const cancel = useCallback(() => {
    isCancelledRef.current = true;
    setStatus('cancelled');
  }, []);

  const reset = useCallback(() => {
    isCancelledRef.current = false;
    setStatus('idle');
    setProgress({ percentage: 0 });
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    progress,
    result,
    error,
    isProcessing: status === 'processing' || status === 'preparing',
    isCompleted: status === 'completed',
    isError: status === 'error',
    execute,
    cancel,
    reset,
  };
}
