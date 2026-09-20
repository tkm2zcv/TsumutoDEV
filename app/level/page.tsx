"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
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
import { TaskProgress } from "@/components/task-progress";
import { useTask } from "@/hooks/use-task";
import { MAX_LEVEL, usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

export default function LevelPage() {
  const { account, setLevel, hydrated } = usePlayer();
  const task = useTask();
  const [mode, setMode] = useState("max");
  const [custom, setCustom] = useState("");

  const target =
    mode === "max"
      ? MAX_LEVEL
      : Math.min(MAX_LEVEL, Math.max(1, Number(custom.replace(/[^\d]/g, "")) || 0));

  const run = () => {
    if (mode === "custom" && (!custom || target <= 0)) {
      toast.error("レベルを入力してください");
      return;
    }
    task.start({
      durationMs: 2000,
      steps: ["アカウントを確認中", "レベルを変更中"],
      onDone: () => {
        setLevel(target);
        toast.success(`プレイヤーレベルを Lv.${formatNum(target)} に変更しました`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">プレイヤーレベル</h1>
        <p className="text-sm text-muted-foreground">
          プレイヤーレベルを変更します
        </p>
      </div>

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
          <RadioGroup value={mode} onValueChange={setMode} className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="max" id="l1" />
              <Label htmlFor="l1">MAX (Lv.{MAX_LEVEL})</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="custom" id="l2" />
              <Label htmlFor="l2">レベル指定</Label>
            </div>
          </RadioGroup>

          {mode === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="lv">変更先のレベル (1〜{MAX_LEVEL})</Label>
              <Input
                id="lv"
                inputMode="numeric"
                placeholder="例: 500"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>
          )}

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            実行後のレベル:{" "}
            <span className="font-semibold tabular-nums">
              Lv.{formatNum(target)}
            </span>
          </div>

          <TaskProgress
            running={task.running}
            progress={task.progress}
            label={task.running ? ["アカウントを確認中", "レベルを変更中"][task.stepIndex] : undefined}
          />

          <Button
            className="w-full"
            size="lg"
            disabled={task.running || !hydrated}
            onClick={run}
          >
            {task.running ? "実行中..." : "レベルを変更する"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
