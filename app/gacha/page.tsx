"use client";

import { useState } from "react";
import { CircleStop, Dices, Play } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/page-header";
import { TargetAccountBar } from "@/components/target-account-bar";
import { useRunConfirm } from "@/components/confirm-run-dialog";
import { usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

const GACHAS = [
  { id: "premium", name: "プレミアムガチャ", cost: 30_000 },
  { id: "pickup", name: "ピックアップガチャ", cost: 30_000 },
  { id: "select", name: "セレクトガチャ", cost: 45_000 },
] as const;

export default function GachaPage() {
  const { account, accounts, gachaRun, startGacha, stopGacha, hydrated } =
    usePlayer();
  const confirm = useRunConfirm();
  const [gachaId, setGachaId] = useState<string>("premium");

  const gacha = GACHAS.find((g) => g.id === gachaId)!;
  const running = gachaRun !== null;
  const runningAccount = accounts.find((a) => a.id === gachaRun?.accountId);
  const runningCoins = runningAccount?.coins ?? account.coins;

  const start = () =>
    confirm.request({
      title: "ガチャ自動実行の確認",
      rows: [
        { label: "対象ガチャ", value: gacha.name },
        { label: "消費", value: `${formatNum(gacha.cost)}コイン/回` },
        { label: "停止条件", value: "コイン不足 or 手動停止" },
      ],
      action: () => {
        startGacha(gacha, account.id);
        toast.info(`${gacha.name}の自動実行を開始しました`);
      },
    });

  const stop = () => {
    stopGacha();
    toast.info("ガチャ自動実行を停止しました");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Dices}
        iconCls="border-violet-400/25 bg-violet-400/10 text-violet-300"
        title="ガチャ自動"
        description="コインがなくなるまで自動でガチャを回します"
      />

      <TargetAccountBar />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dices className="size-5 text-violet-400" />
            対象ガチャを選択
          </CardTitle>
          <CardDescription>
            実行中はページを離れても自動で回り続けます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RadioGroup
            value={running ? gachaRun.gachaId : gachaId}
            onValueChange={setGachaId}
            className="space-y-3"
            disabled={running}
          >
            {GACHAS.map((g) => (
              <div key={g.id} className="flex items-center space-x-3">
                <RadioGroupItem value={g.id} id={g.id} />
                <Label htmlFor={g.id} className="flex-1">
                  {g.name}
                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                    {formatNum(g.cost)}コイン/回
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {running && (
            <p className="rounded-md border border-violet-400/30 bg-violet-400/10 px-3 py-2 text-xs text-violet-200">
              実行対象: {runningAccount?.name ?? "—"}(開始時のアカウントに固定)
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">実行回数</p>
              <p className="text-xl font-bold tabular-nums">
                {gachaRun?.count ?? 0}回
              </p>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">消費コイン</p>
              <p className="text-xl font-bold tabular-nums">
                {formatNum(gachaRun?.spent ?? 0)}
              </p>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">残りコイン</p>
              <p className="text-xl font-bold tabular-nums">
                {hydrated ? formatNum(runningCoins) : "—"}
              </p>
            </div>
          </div>

          {running ? (
            <Button
              className="w-full"
              size="lg"
              variant="destructive"
              onClick={stop}
            >
              <CircleStop className="mr-2 size-5" />
              停止する({gachaRun.name}・{gachaRun.count}回実行中)
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              disabled={!hydrated || account.coins < gacha.cost}
              onClick={start}
            >
              <Play className="mr-2 size-5" />
              自動実行を開始
            </Button>
          )}
          {account.coins < gacha.cost && !running && hydrated && (
            <p className="text-center text-xs text-destructive">
              コインが不足しています
            </p>
          )}
          {running && (
            <Badge className="mx-auto flex w-fit animate-pulse">実行中</Badge>
          )}
        </CardContent>
      </Card>

      {confirm.dialog}
    </div>
  );
}
