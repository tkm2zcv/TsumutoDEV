"use client";

import { useEffect } from "react";
import { Medal, Timer } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/page-header";
import { useNow } from "@/hooks/use-now";
import {
  FREEPLAY_COST_MEDALS,
  FREEPLAY_DURATION_MS,
  FREEPLAY_LIMIT,
  usePlayer,
} from "@/lib/player-store";
import { formatDuration, formatNum } from "@/lib/format";

export default function FreeplayPage() {
  const { account, buyFreeplay, expireFreeplay, hydrated } = usePlayer();
  const now = useNow(1000);

  const active = account.freeplayUntil !== null && account.freeplayUntil > now;
  const remaining = active ? account.freeplayUntil! - now : 0;
  const elapsedPct = active
    ? Math.min(100, (1 - remaining / FREEPLAY_DURATION_MS) * 100)
    : 0;

  useEffect(() => {
    if (
      hydrated &&
      account.freeplayUntil !== null &&
      account.freeplayUntil <= now
    ) {
      expireFreeplay();
      toast.info("フリープレイのタイマーが終了しました");
    }
  }, [now, account.freeplayUntil, hydrated, expireFreeplay]);

  const canBuy =
    hydrated &&
    !active &&
    account.freeplayUsed < FREEPLAY_LIMIT &&
    account.medals >= FREEPLAY_COST_MEDALS;

  const run = () => {
    buyFreeplay();
    toast.success(
      `フリープレイを購入しました(メダル -${FREEPLAY_COST_MEDALS}枚)`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Timer}
        iconCls="border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
        title="フリープレイ購入"
        description={`メダルを使用してフリープレイを購入します(月${FREEPLAY_LIMIT}回まで)`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今月の購入回数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {hydrated ? account.freeplayUsed : "—"}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / {FREEPLAY_LIMIT}回
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              当月分のみカウント。翌月0にリセットされます。
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              所持メダル
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {hydrated ? `${formatNum(account.medals)} 枚` : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              1回あたり {formatNum(FREEPLAY_COST_MEDALS)} メダル消費
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="size-5 text-emerald-400" />
            フリープレイ
          </CardTitle>
          <CardDescription>
            購入した時点から30分のカウントダウンが開始されます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-6 text-center">
            {active ? (
              <>
                <p className="text-sm text-muted-foreground">
                  残り {Math.floor(remaining / 60000)}分
                  {Math.floor((remaining % 60000) / 1000)}秒
                </p>
                <p className="mt-1 font-mono text-5xl font-bold tabular-nums text-emerald-300">
                  {formatDuration(remaining)}
                </p>
                <Progress value={elapsedPct} className="mt-4" />
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">残り --:--</p>
                <p className="mt-1 font-mono text-5xl font-bold tabular-nums text-muted-foreground">
                  30:00
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  タイマーは停止しています
                </p>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ステータス</span>
            {active ? (
              <Badge className="bg-emerald-600">タイマー実行中</Badge>
            ) : account.freeplayUsed >= FREEPLAY_LIMIT ? (
              <Badge variant="destructive">今月の上限に達しました</Badge>
            ) : (
              <Badge variant="secondary">購入可能</Badge>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!canBuy}
            onClick={run}
          >
            <Medal className="mr-2 size-5" />
            {active
              ? "タイマー実行中"
              : account.freeplayUsed >= FREEPLAY_LIMIT
                ? "今月の購入上限(3回)に達しています"
                : account.medals < FREEPLAY_COST_MEDALS
                  ? "メダルが不足しています"
                  : `フリープレイを購入する (${formatNum(FREEPLAY_COST_MEDALS)}メダル)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
