"use client";

import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [cancel, delay]
  );

  const flush = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      callbackRef.current(...args);
    },
    [cancel]
  );

  useEffect(() => cancel, [cancel]);

  return { debounced, flush, cancel };
}
