"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/page-header";
import { TaskProgress } from "@/components/task-progress";
import { useTask } from "@/hooks/use-task";
import { usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

const RANGES = [
  { id: "r1", label: "1,000万〜5,000万の範囲からランダム", min: 10_000_000, max: 50_000_000 },
  { id: "r2", label: "5,000万〜1億の範囲からランダム", min: 50_000_000, max: 100_000_000 },
  { id: "r3", label: "1億〜21億の範囲からランダム", min: 100_000_000, max: 2_100_000_000 },
];

const MAX_SCORE = 2_147_483_647;

export default function HighScorePage() {
  const { account, setHighScore, hydrated } = usePlayer();
  const task = useTask();
  const [mode, setMode] = useState("r1");
  const [custom, setCustom] = useState("");
  const [preview, setPreview] = useState<number | null>(null);

  const resolveScore = (): number | null => {
    if (mode === "custom") {
      const n = Number(custom.replace(/[^\d]/g, ""));
      if (!n || n <= 0) return null;
      return Math.min(n, MAX_SCORE);
    }
    const r = RANGES.find((r) => r.id === mode)!;
    return Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
  };

  const run = () => {
    const score = resolveScore();
    if (score === null) {
      toast.error("スコアを入力してください");
      return;
    }
    task.start({
      durationMs: 2200,
      steps: ["アカウントを確認中", "ハイスコアを更新中"],
      onDone: () => {
        setHighScore(score);
        setPreview(score);
        toast.success(`ハイスコアを ${formatNum(score)} に更新しました`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Trophy}
        iconCls="border-sky-400/25 bg-sky-400/10 text-sky-300"
        title="ハイスコア更新"
        description="ハイスコアを指定範囲または指定スコアへ変更します"
      />

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
          <RadioGroup value={mode} onValueChange={setMode} className="space-y-3">
            {RANGES.map((r) => (
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

          {mode === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="score">スコア (最大 {formatNum(MAX_SCORE)})</Label>
              <Input
                id="score"
                inputMode="numeric"
                placeholder="例: 150000000"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>
          )}

          {preview !== null && (
            <div className="rounded-md border border-sky-500/30 bg-sky-500/10 p-3 text-sm">
              直近の実行結果:{" "}
              <span className="font-semibold tabular-nums">
                {formatNum(preview)}
              </span>
            </div>
          )}

          <TaskProgress
            running={task.running}
            progress={task.progress}
            label={task.running ? ["アカウントを確認中", "ハイスコアを更新中"][task.stepIndex] : undefined}
          />

          <Button
            className="w-full"
            size="lg"
            disabled={task.running || !hydrated}
            onClick={run}
          >
            {task.running ? "実行中..." : "ハイスコアを更新する"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
