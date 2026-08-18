import { renderHook, act } from '@testing-library/react';
import { useFileProcessor } from './useFileProcessor';

describe('useFileProcessor hook integration', () => {
  it('runs successful processing lifecycle from idle to completed', async () => {
    const mockProcessFn = jest.fn(async (input: string, onProgress) => {
      onProgress({ percentage: 50, currentStep: 'Halfway' });
      onProgress({ percentage: 100, currentStep: 'Finished' });
      return `Processed: ${input}`;
    });

    const handleSuccess = jest.fn();

    const { result } = renderHook(() =>
      useFileProcessor({
        processFn: mockProcessFn,
        onSuccess: handleSuccess,
      })
    );

    expect(result.current.status).toBe('idle');
    expect(result.current.isProcessing).toBe(false);

    let executionPromise: Promise<string | null>;
    act(() => {
      executionPromise = result.current.execute('test-payload');
    });

    await act(async () => {
      await executionPromise;
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.progress.percentage).toBe(100);
    expect(result.current.result).toBe('Processed: test-payload');
    expect(handleSuccess).toHaveBeenCalledWith('Processed: test-payload');
  });

  it('captures processing error and updates error state', async () => {
    const mockProcessFn = jest.fn(async () => {
      throw new Error('Corrupted vector stream in PDF.');
    });

    const handleError = jest.fn();

    const { result } = renderHook(() =>
      useFileProcessor({
        processFn: mockProcessFn,
        onError: handleError,
      })
    );

    let executionPromise: Promise<unknown>;
    act(() => {
      executionPromise = result.current.execute('error-input');
    });

    await act(async () => {
      await executionPromise;
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe('Corrupted vector stream in PDF.');
    expect(handleError).toHaveBeenCalled();
  });

  it('handles cancellation properly', () => {
    const { result } = renderHook(() => useFileProcessor());

    act(() => {
      result.current.cancel();
    });

    expect(result.current.status).toBe('cancelled');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
  });
});
