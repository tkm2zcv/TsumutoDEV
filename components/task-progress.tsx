"use client";

import { Progress } from "@/components/ui/progress";

export function TaskProgress({
  running,
  progress,
  label,
}: {
  running: boolean;
  progress: number;
  label?: string;
}) {
  if (!running) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label ?? "実行中..."}</span>
        <span className="tabular-nums">{Math.floor(progress)}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
