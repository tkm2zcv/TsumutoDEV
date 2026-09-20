"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TaskOptions = {
  durationMs?: number;
  steps?: string[];
  onDone?: () => void;
};

export function useTask() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    ({ durationMs = 1800, steps = [], onDone }: TaskOptions = {}) => {
      if (running) return;
      setRunning(true);
      setProgress(0);
      setStepIndex(0);
      const startedAt = Date.now();
      timer.current = setInterval(() => {
        const p = Math.min(100, ((Date.now() - startedAt) / durationMs) * 100);
        setProgress(p);
        if (steps.length > 0) {
          setStepIndex(
            Math.min(steps.length - 1, Math.floor((p / 100) * steps.length))
          );
        }
        if (p >= 100) {
          stop();
          onDone?.();
        }
      }, 80);
    },
    [running, stop]
  );

  return { running, progress, stepIndex, start, stop };
}
