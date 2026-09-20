"use client";

import { useEffect, useRef, useState } from "react";
import { CircleStop, Play, Repeat } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/page-header";
import { TargetAccountBar } from "@/components/target-account-bar";
import { useRunConfirm } from "@/components/confirm-run-dialog";
import { usePlayer } from "@/lib/player-store";
import { formatJa, formatNum } from "@/lib/format";

const AMOUNTS = [
  { id: "1m", label: "100万枚", value: 1_000_000 },
  { id: "5m", label: "500万枚", value: 5_000_000 },
  { id: "10m", label: "1,000万枚", value: 10_000_000 },
];

const PLAYS = [
  { id: "p10", label: "10回", value: 10 },
  { id: "p30", label: "30回", value: 30 },
  { id: "p50", label: "50回", value: 50 },
];

export default function RepeatPage() {
  const { account, addCoins, addActivity, hydrated } = usePlayer();
  const confirm = useRunConfirm();
  const [amountMode, setAmountMode] = useState("1m");
  const [amountCustom, setAmountCustom] = useState("");
  const [playMode, setPlayMode] = useState("p10");
  const [playCustom, setPlayCustom] = useState("");
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const perPlay =
    amountMode === "custom"
      ? Number(amountCustom.replace(/[^\d]/g, "")) || 0
      : AMOUNTS.find((a) => a.id === amountMode)!.value;
  const plays =
    playMode === "custom"
      ? Math.min(999, Number(playCustom.replace(/[^\d]/g, "")) || 0)
      : PLAYS.find((p) => p.id === playMode)!.value;
  const total = perPlay * plays;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setDone((d) => {
        if (d + 1 >= plays) {
          clearInterval(t);
          setRunning(false);
          addActivity(
            `リピートコイン ${formatNum(perPlay)}枚×${plays}回 = 合計${formatJa(perPlay * plays)}枚`
          );
          toast.success(
            `リピートコイン完了: ${formatJa(perPlay * plays)}枚を付与しました`
          );
        }
        return d + 1;
      });
      addCoins(perPlay, { silent: true });
    }, 600);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const start = () => {
    if (perPlay <= 0 || plays <= 0) {
      toast.error("枚数と回数を指定してください");
      return;
    }
    confirm.request({
      title: "リピートコインの実行確認",
      rows: [
        {
          label: "内容",
          value: `${formatNum(perPlay)}枚 × ${plays}回`,
        },
        { label: "合計", value: `${formatJa(total)}枚` },
        {
          label: "実行後",
          value: `${formatNum(account.coins + total)} 枚`,
        },
      ],
      action: () => {
        setDone(0);
        setRunning(true);
        toast.info("リピートコインを開始しました");
      },
    });
  };

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    if (done > 0) {
      addActivity(
        `リピートコイン ${formatNum(perPlay)}枚×${done}回(途中停止) = 合計${formatJa(perPlay * done)}枚`
      );
      toast.info(`${done}回で停止しました(合計 ${formatJa(perPlay * done)}枚)`);
    } else {
      toast.info("停止しました");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Repeat}
        iconCls="border-amber-400/25 bg-amber-400/10 text-amber-300"
        title="リピートコイン"
        description="指定した枚数のコイン獲得を繰り返し実行します"
      />

      <TargetAccountBar />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Repeat className="size-5 text-amber-400" />
            現在のコイン:{" "}
            <span className="tabular-nums">
              {hydrated ? `${formatNum(account.coins)} 枚` : "—"}
            </span>
          </CardTitle>
          <CardDescription>
            1プレイあたりの獲得枚数と回数を指定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              1プレイあたりの枚数
            </Label>
            <RadioGroup
              value={amountMode}
              onValueChange={setAmountMode}
              className="flex flex-wrap gap-x-4 gap-y-2"
              disabled={running}
            >
              {AMOUNTS.map((a) => (
                <div key={a.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={a.id} id={a.id} />
                  <Label htmlFor={a.id} className="text-sm font-normal">
                    {a.label}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="ra-custom" />
                <Label htmlFor="ra-custom" className="text-sm font-normal">
                  枚数指定
                </Label>
              </div>
            </RadioGroup>
            {amountMode === "custom" && (
              <div className="flex items-center gap-2">
                <Input
                  inputMode="numeric"
                  placeholder="例: 2000000"
                  value={amountCustom}
                  onChange={(e) => setAmountCustom(e.target.value)}
                  className="h-8"
                  disabled={running}
                />
                {perPlay > 0 && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatJa(perPlay)}枚
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">プレイ回数</Label>
            <RadioGroup
              value={playMode}
              onValueChange={setPlayMode}
              className="flex flex-wrap gap-x-4 gap-y-2"
              disabled={running}
            >
              {PLAYS.map((p) => (
                <div key={p.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={p.id} id={p.id} />
                  <Label htmlFor={p.id} className="text-sm font-normal">
                    {p.label}
                  </Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="rp-custom" />
                <Label htmlFor="rp-custom" className="text-sm font-normal">
                  回数指定
                </Label>
              </div>
            </RadioGroup>
            {playMode === "custom" && (
              <Input
                inputMode="numeric"
                placeholder="1〜999回"
                value={playCustom}
                onChange={(e) => setPlayCustom(e.target.value)}
                className="h-8"
                disabled={running}
              />
            )}
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-sm tabular-nums">
            合計獲得: <span className="font-semibold">{formatJa(total)}枚</span>
            <span className="ml-2 text-xs text-muted-foreground">
              ({formatNum(perPlay)}枚 × {plays}回)
            </span>
            <br />
            実行後のコイン:{" "}
            <span className="font-semibold">
              {hydrated ? `${formatNum(account.coins + total)} 枚` : "—"}
            </span>
          </div>

          {running && (
            <div className="space-y-1.5">
              <Progress value={(done / plays) * 100} />
              <p className="text-xs text-muted-foreground tabular-nums">
                {done}/{plays}回 完了・累計 +{formatNum(perPlay * done)}枚
              </p>
            </div>
          )}

          {running ? (
            <Button
              className="w-full"
              size="lg"
              variant="destructive"
              onClick={stop}
            >
              <CircleStop className="mr-2 size-5" />
              停止する
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              disabled={!hydrated || perPlay <= 0 || plays <= 0}
              onClick={start}
            >
              <Play className="mr-2 size-5" />
              リピート実行を開始
            </Button>
          )}
        </CardContent>
      </Card>

      {confirm.dialog}
    </div>
  );
}
