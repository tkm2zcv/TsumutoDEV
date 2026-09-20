"use client";

import { useEffect, useRef, useState } from "react";
import { CircleStop, Dices, Play } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TsumAvatar } from "@/components/tsum-avatar";
import { usePlayer } from "@/lib/player-store";
import { TSUMS } from "@/lib/tsums";
import { formatNum } from "@/lib/format";

const GACHAS = [
  { id: "premium", name: "プレミアムガチャ", cost: 30_000 },
  { id: "pickup", name: "ピックアップガチャ", cost: 30_000 },
  { id: "select", name: "セレクトガチャ", cost: 45_000 },
] as const;

type LogEntry = { n: number; tsumId: string; at: string };

export default function GachaPage() {
  const { account, spendCoins, hydrated } = usePlayer();
  const [gachaId, setGachaId] = useState<string>("premium");
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [spent, setSpent] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const coinsRef = useRef(account.coins);
  coinsRef.current = account.coins;

  const gacha = GACHAS.find((g) => g.id === gachaId)!;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      if (coinsRef.current < gacha.cost) {
        setRunning(false);
        toast.warning("コインが不足したため停止しました");
        return;
      }
      const tsum = TSUMS[Math.floor(Math.random() * TSUMS.length)];
      spendCoins(gacha.cost);
      setCount((c) => c + 1);
      setSpent((s) => s + gacha.cost);
      setLog((l) => [
        {
          n: l.length + 1,
          tsumId: tsum.id,
          at: new Date().toLocaleTimeString("ja-JP", { hour12: false }),
        },
        ...l,
      ]);
    }, 900);
    return () => clearInterval(t);
  }, [running, gacha.cost, spendCoins]);

  const start = () => {
    setLog([]);
    setCount(0);
    setSpent(0);
    setRunning(true);
    toast.info(`${gacha.name}の自動実行を開始しました`);
  };

  const stop = () => {
    setRunning(false);
    toast.info("ガチャ自動実行を停止しました");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ガチャ自動</h1>
        <p className="text-sm text-muted-foreground">
          コインがなくなるまで自動でガチャを回します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Dices className="size-5 text-violet-400" />
            対象ガチャを選択
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <RadioGroup
            value={gachaId}
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

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">実行回数</p>
              <p className="text-xl font-bold tabular-nums">{count}回</p>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">消費コイン</p>
              <p className="text-xl font-bold tabular-nums">
                {formatNum(spent)}
              </p>
            </div>
            <div className="rounded-md border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">残りコイン</p>
              <p className="text-xl font-bold tabular-nums">
                {hydrated ? formatNum(account.coins) : "—"}
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
              停止する
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">実行ログ</CardTitle>
          {running && (
            <Badge className="animate-pulse">実行中</Badge>
          )}
        </CardHeader>
        <CardContent>
          {log.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              まだ実行されていません
            </p>
          ) : (
            <ScrollArea className="h-64">
              <ul className="space-y-2">
                {log.map((e) => {
                  const tsum = TSUMS.find((t) => t.id === e.tsumId)!;
                  return (
                    <li
                      key={e.n}
                      className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <TsumAvatar tsum={tsum} size="sm" />
                      <div className="flex-1">
                        <span className="font-medium">{e.n}回目</span>
                        <span className="mx-2 text-muted-foreground">→</span>
                        {tsum.name} を獲得
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {e.at}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
