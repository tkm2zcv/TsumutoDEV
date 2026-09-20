"use client";

import { useMemo, useState } from "react";
import { Download, History, Search, Timer } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayer } from "@/lib/player-store";

function fmtTime(at: number) {
  return new Date(at).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ActivityPage() {
  const { accounts, hydrated } = usePlayer();
  const [accountId, setAccountId] = useState("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const merged = accounts.flatMap((a) =>
      a.activity.map((e) => ({
        id: `${a.id}-${e.id}`,
        accountId: a.id,
        accountName: a.name,
        guest: a.guest,
        label: e.label,
        at: e.at,
      }))
    );
    return merged
      .filter(
        (r) =>
          (accountId === "all" || r.accountId === accountId) &&
          (query === "" ||
            r.label.toLowerCase().includes(query.trim().toLowerCase()) ||
            r.accountName.toLowerCase().includes(query.trim().toLowerCase()))
      )
      .sort((a, b) => b.at - a.at);
  }, [accounts, accountId, query]);

  const exportCsv = () => {
    const header = "日時,アカウント,種別,内容\n";
    const body = rows
      .map((r) =>
        [
          new Date(r.at).toLocaleString("ja-JP"),
          r.accountName,
          r.guest ? "ゲスト" : "連携",
          `"${r.label.replace(/"/g, '""')}"`,
        ].join(",")
      )
      .join("\n");
    const blob = new Blob(["﻿" + header + body], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tsumutodev-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length}件の履歴をCSVで保存しました`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={History}
        iconCls="border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
        title="実行履歴"
        description="全アカウントの操作履歴を横断して確認・出力します"
      />

      <Card>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-9"
                placeholder="内容・アカウント名で検索"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのアカウント</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportCsv}
              disabled={rows.length === 0}
            >
              <Download className="mr-1.5 size-4" />
              CSV出力
            </Button>
          </div>
          <CardDescription>{rows.length}件を表示</CardDescription>
        </CardHeader>
        <CardContent>
          {!hydrated || rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              履歴がありません
            </p>
          ) : (
            <ul className="divide-y">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 py-2.5 text-sm"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Timer className="size-3 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{r.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.accountName}
                      {r.guest && (
                        <Badge
                          variant="secondary"
                          className="ml-1.5 text-[9px]"
                        >
                          ゲスト
                        </Badge>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {fmtTime(r.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
