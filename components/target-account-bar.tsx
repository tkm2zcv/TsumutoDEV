"use client";

import { usePlayer } from "@/lib/player-store";
import { AccountSwitcher } from "./account-switcher";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function TargetAccountBar() {
  const { account, confirmBeforeRun, setConfirmBeforeRun, hydrated } =
    usePlayer();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card/70 px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-medium text-muted-foreground">
          実行対象
        </span>
        <AccountSwitcher />
        <Badge
          variant={account.guest ? "secondary" : "outline"}
          className="text-[10px]"
        >
          {account.guest ? "ゲスト" : "連携"}
        </Badge>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Checkbox
          id="confirm-run"
          checked={confirmBeforeRun}
          onCheckedChange={(v) => setConfirmBeforeRun(v === true)}
          disabled={!hydrated}
        />
        <Label
          htmlFor="confirm-run"
          className="cursor-pointer text-xs font-normal text-muted-foreground"
        >
          実行前に確認する
        </Label>
      </div>
    </div>
  );
}
