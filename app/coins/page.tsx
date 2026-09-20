"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
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
import { TaskProgress } from "@/components/task-progress";
import { useTask } from "@/hooks/use-task";
import { usePlayer } from "@/lib/player-store";
import { formatJa, formatNum } from "@/lib/format";

export default function CoinsPage() {
  const { account, addCoins, hydrated } = usePlayer();
  const task = useTask();
  const [mode, setMode] = useState("100m");
  const [custom, setCustom] = useState("");

  const amount =
    mode === "100m"
      ? 100_000_000
      : mode === "200m"
        ? 200_000_000
        : Number(custom.replace(/[^\d]/g, "")) || 0;

  const run = () => {
    if (amount <= 0) {
      toast.error("枚数を入力してください");
      return;
    }
    task.start({
      durationMs: 2200,
      steps: ["アカウントを確認中", "コインを付与中", "残高を反映中"],
      onDone: () => {
        addCoins(amount);
        toast.success(`${formatJa(amount)}枚を付与しました`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">コイン増加</h1>
        <p className="text-sm text-muted-foreground">
          コイン数を指定して増加させます
        </p>
      </div>

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
          <RadioGroup value={mode} onValueChange={setMode} className="space-y-3">
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

          {mode === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="amount">増加させる枚数</Label>
              <Input
                id="amount"
                inputMode="numeric"
                placeholder="例: 50000000"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
              {amount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formatJa(amount)}枚 ({formatNum(amount)}枚)
                </p>
              )}
            </div>
          )}

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            実行後のコイン:{" "}
            <span className="font-semibold tabular-nums">
              {hydrated ? `${formatNum(account.coins + amount)} 枚` : "—"}
            </span>
          </div>

          <TaskProgress
            running={task.running}
            progress={task.progress}
            label={
              task.running ? ["アカウントを確認中", "コインを付与中", "残高を反映中"][task.stepIndex] : undefined
            }
          />

          <Button
            className="w-full"
            size="lg"
            disabled={task.running || !hydrated || amount <= 0}
            onClick={run}
          >
            {task.running ? "実行中..." : "コインを増加する"}
          </Button>
        </CardContent>
      </Card>
      <CardDescription className="px-1">
        ※UIモックのため、実際の処理は行われず画面表示のみ更新されます。
      </CardDescription>
    </div>
  );
}
