"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlayer } from "@/lib/player-store";

export type RunRequest = {
  title: string;
  rows: { label: string; value: string }[];
  action: () => void;
};

export function useRunConfirm() {
  const { account, confirmBeforeRun } = usePlayer();
  const [pending, setPending] = useState<RunRequest | null>(null);

  const request = (req: RunRequest) =>
    confirmBeforeRun ? setPending(req) : req.action();

  const dialog = (
    <Dialog
      open={pending !== null}
      onOpenChange={(o) => !o && setPending(null)}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-primary" />
            {pending?.title ?? "実行確認"}
          </DialogTitle>
          <DialogDescription>
            対象と内容を確認してから実行してください
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">対象アカウント</span>
            <span className="font-semibold">
              {account.name}
              {account.guest && (
                <Badge variant="secondary" className="ml-1 text-[9px]">
                  ゲスト
                </Badge>
              )}
            </span>
          </div>
          {pending?.rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3">
              <span className="shrink-0 text-muted-foreground">{r.label}</span>
              <span className="text-right font-semibold tabular-nums">
                {r.value}
              </span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPending(null)}>
            キャンセル
          </Button>
          <Button
            onClick={() => {
              pending?.action();
              setPending(null);
            }}
          >
            実行する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { request, dialog };
}
