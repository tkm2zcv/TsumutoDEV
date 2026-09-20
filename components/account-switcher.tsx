"use client";

import { Ghost } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayer } from "@/lib/player-store";

export function AccountSwitcher() {
  const { account, accounts, switchAccount, hydrated, gachaRun } = usePlayer();
  return (
    <Select
      value={account.id}
      disabled={!hydrated}
      onValueChange={(id) => {
        const target = accounts.find((a) => a.id === id);
        if (!target || id === account.id) return;
        switchAccount(id);
        toast.info(
          `「${target.name}」に切り替えました${gachaRun ? "(ガチャ実行中のアカウントは継続します)" : ""}`
        );
      }}
    >
      <SelectTrigger className="h-9 w-auto min-w-40 gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-[9px] font-bold text-white">
          {account.name.slice(0, 1)}
        </span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            <span className="flex items-center gap-2">
              {a.name}
              {a.guest && <Ghost className="size-3 text-muted-foreground" />}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
