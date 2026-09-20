"use client";

import { useState } from "react";
import {
  Coins,
  Package,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { TaskProgress } from "@/components/task-progress";
import { useTask } from "@/hooks/use-task";
import { MAX_LEVEL, usePlayer } from "@/lib/player-store";
import { formatJa, formatNum } from "@/lib/format";

const SET_STEPS = [
  "コイン2億枚を付与中",
  "プレイヤーレベルをMAXに変更中",
  "反映を確認中",
];
const COIN_STEPS = ["アカウントを確認中", "コインを付与中", "残高を反映中"];
const LEVEL_STEPS = ["アカウントを確認中", "レベルを変更中"];
const SCORE_STEPS = ["アカウントを確認中", "ハイスコアを更新中"];

const SCORE_RANGES = [
  { id: "r1", label: "1,000万〜5,000万の範囲からランダム", min: 10_000_000, max: 50_000_000 },
  { id: "r2", label: "5,000万〜1億の範囲からランダム", min: 50_000_000, max: 100_000_000 },
  { id: "r3", label: "1億〜21億の範囲からランダム", min: 100_000_000, max: 2_100_000_000 },
];
const MAX_SCORE = 2_147_483_647;

export default function BoostPage() {
  const { account, addCoins, setLevel, setHighScore, hydrated } = usePlayer();
  const task = useTask();

  const [coinMode, setCoinMode] = useState("100m");
  const [coinCustom, setCoinCustom] = useState("");
  const [levelMode, setLevelMode] = useState("max");
  const [levelCustom, setLevelCustom] = useState("");
  const [scoreMode, setScoreMode] = useState("r1");
  const [scoreCustom, setScoreCustom] = useState("");
  const [scorePreview, setScorePreview] = useState<number | null>(null);

  const coinAmount =
    coinMode === "100m"
      ? 100_000_000
      : coinMode === "200m"
        ? 200_000_000
        : Number(coinCustom.replace(/[^\d]/g, "")) || 0;

  const levelTarget =
    levelMode === "max"
      ? MAX_LEVEL
      : Math.min(MAX_LEVEL, Math.max(1, Number(levelCustom.replace(/[^\d]/g, "")) || 0));

  const run = (steps: string[], durationMs: number, onDone: () => void) =>
    task.start({ durationMs, steps, onDone });

  const runSet = () =>
    run(SET_STEPS, 3200, () => {
      addCoins(200_000_000);
      setLevel(MAX_LEVEL);
      toast.success("セット代行が完了しました");
    });

  const runCoins = () => {
    if (coinAmount <= 0) {
      toast.error("枚数を入力してください");
      return;
    }
    run(COIN_STEPS, 2200, () => {
      addCoins(coinAmount);
      toast.success(`${formatJa(coinAmount)}枚を付与しました`);
    });
  };

  const runLevel = () => {
    if (levelMode === "custom" && (!levelCustom || levelTarget <= 0)) {
      toast.error("レベルを入力してください");
      return;
    }
    run(LEVEL_STEPS, 2000, () => {
      setLevel(levelTarget);
      toast.success(`プレイヤーレベルを Lv.${formatNum(levelTarget)} に変更しました`);
    });
  };

  const resolveScore = (): number | null => {
    if (scoreMode === "custom") {
      const n = Number(scoreCustom.replace(/[^\d]/g, ""));
      if (!n || n <= 0) return null;
      return Math.min(n, MAX_SCORE);
    }
    const r = SCORE_RANGES.find((r) => r.id === scoreMode)!;
    return Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
  };

  const runScore = () => {
    const score = resolveScore();
    if (score === null) {
      toast.error("スコアを入力してください");
      return;
    }
    run(SCORE_STEPS, 2200, () => {
      setHighScore(score);
      setScorePreview(score);
      toast.success(`ハイスコアを ${formatNum(score)} に更新しました`);
    });
  };

  const progress = (steps: string[]) => (
    <TaskProgress
      running={task.running}
      progress={task.progress}
      label={task.running ? steps[task.stepIndex] : undefined}
    />
  );

  const runButton = (label: string, onClick: () => void, disabled = false) => (
    <Button
      className="w-full"
      size="lg"
      disabled={task.running || !hydrated || disabled}
      onClick={onClick}
    >
      {task.running ? "実行中..." : label}
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Sparkles}
        iconCls="border-violet-400/25 bg-violet-400/10 text-violet-300"
        title="強化"
        description="セット代行・コイン・レベル・ハイスコアをまとめて実行します"
      />

      <Tabs defaultValue="set">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="set">
            <Package className="mr-1.5 size-4" />
            セット代行
          </TabsTrigger>
          <TabsTrigger value="coins">
            <Coins className="mr-1.5 size-4" />
            コイン
          </TabsTrigger>
          <TabsTrigger value="level">
            <TrendingUp className="mr-1.5 size-4" />
            レベル
          </TabsTrigger>
          <TabsTrigger value="score">
            <Trophy className="mr-1.5 size-4" />
            ハイスコア
          </TabsTrigger>
        </TabsList>

        <TabsContent value="set" className="mt-4">
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5 text-primary" />
                セット内容
              </CardTitle>
              <CardDescription>
                1回のボタンで以下をまとめて実行します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="size-4 text-amber-400" />
                    コイン増加
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums">+2億枚</p>
                  <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                    現在: {hydrated ? formatNum(account.coins) : "—"} 枚 →{" "}
                    {hydrated ? formatNum(account.coins + 200_000_000) : "—"} 枚
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="size-4 text-emerald-400" />
                    プレイヤーレベル
                  </div>
                  <p className="mt-2 text-2xl font-bold tabular-nums">
                    Lv.{MAX_LEVEL} (MAX)
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                    現在: Lv.{hydrated ? formatNum(account.level) : "—"} → Lv.
                    {MAX_LEVEL}
                  </p>
                </div>
              </div>
              {progress(SET_STEPS)}
              {runButton("セット代行を実行する", runSet)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coins" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Coins className="size-5 text-amber-400" />
                現在のコイン:{" "}
                <span className="tabular-nums">
                  {hydrated ? `${formatNum(account.coins)} 枚` : "—"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <RadioGroup value={coinMode} onValueChange={setCoinMode} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="100m" id="c1" />
                  <Label htmlFor="c1">1億枚</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="200m" id="c2" />
                  <Label htmlFor="c2">2億枚</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="custom" id="c3" />
                  <Label htmlFor="c3">枚数指定</Label>
                </div>
              </RadioGroup>

              {coinMode === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="amount">増加させる枚数</Label>
                  <Input
                    id="amount"
                    inputMode="numeric"
                    placeholder="例: 50000000"
                    value={coinCustom}
                    onChange={(e) => setCoinCustom(e.target.value)}
                  />
                  {coinAmount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formatJa(coinAmount)}枚 ({formatNum(coinAmount)}枚)
                    </p>
                  )}
                </div>
              )}

              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                実行後のコイン:{" "}
                <span className="font-semibold tabular-nums">
                  {hydrated ? `${formatNum(account.coins + coinAmount)} 枚` : "—"}
                </span>
              </div>

              {progress(COIN_STEPS)}
              {runButton("コインを増加する", runCoins, coinAmount <= 0)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="level" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-5 text-emerald-400" />
                現在のレベル:{" "}
                <span className="tabular-nums">
                  Lv.{hydrated ? formatNum(account.level) : "—"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <RadioGroup value={levelMode} onValueChange={setLevelMode} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="max" id="l1" />
                  <Label htmlFor="l1">MAX (Lv.{MAX_LEVEL})</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="custom" id="l2" />
                  <Label htmlFor="l2">レベル指定</Label>
                </div>
              </RadioGroup>

              {levelMode === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="lv">変更先のレベル (1〜{MAX_LEVEL})</Label>
                  <Input
                    id="lv"
                    inputMode="numeric"
                    placeholder="例: 500"
                    value={levelCustom}
                    onChange={(e) => setLevelCustom(e.target.value)}
                  />
                </div>
              )}

              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                実行後のレベル:{" "}
                <span className="font-semibold tabular-nums">
                  Lv.{formatNum(levelTarget)}
                </span>
              </div>

              {progress(LEVEL_STEPS)}
              {runButton("レベルを変更する", runLevel)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="score" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="size-5 text-sky-400" />
                現在のハイスコア:{" "}
                <span className="tabular-nums">
                  {hydrated ? formatNum(account.highScore) : "—"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <RadioGroup value={scoreMode} onValueChange={setScoreMode} className="space-y-3">
                {SCORE_RANGES.map((r) => (
                  <div key={r.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={r.id} id={r.id} />
                    <Label htmlFor={r.id}>{r.label}</Label>
                  </div>
                ))}
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="custom" id="hs-custom" />
                  <Label htmlFor="hs-custom">スコア指定</Label>
                </div>
              </RadioGroup>

              {scoreMode === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="score">スコア (最大 {formatNum(MAX_SCORE)})</Label>
                  <Input
                    id="score"
                    inputMode="numeric"
                    placeholder="例: 150000000"
                    value={scoreCustom}
                    onChange={(e) => setScoreCustom(e.target.value)}
                  />
                </div>
              )}

              {scorePreview !== null && (
                <div className="rounded-md border border-sky-500/30 bg-sky-500/10 p-3 text-sm">
                  直近の実行結果:{" "}
                  <span className="font-semibold tabular-nums">
                    {formatNum(scorePreview)}
                  </span>
                </div>
              )}

              {progress(SCORE_STEPS)}
              {runButton("ハイスコアを更新する", runScore)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardDescription className="px-1">
        ※UIモックのため、実際の処理は行われず画面表示のみ更新されます。
      </CardDescription>
    </div>
  );
}
