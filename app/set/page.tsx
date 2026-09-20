"use client";

import { Coins, Package, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { TaskProgress } from "@/components/task-progress";
import { useTask } from "@/hooks/use-task";
import { MAX_LEVEL, usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

const STEPS = ["コイン2億枚を付与中", "プレイヤーレベルをMAXに変更中", "反映を確認中"];

export default function SetPage() {
  const { account, addCoins, setLevel, hydrated } = usePlayer();
  const task = useTask();

  const run = () => {
    task.start({
      durationMs: 3200,
      steps: STEPS,
      onDone: () => {
        addCoins(200_000_000);
        setLevel(MAX_LEVEL);
        toast.success("セット代行が完了しました");
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        iconCls="border-violet-400/25 bg-violet-400/10 text-violet-300"
        title="セット代行"
        description="コイン2億枚増加 + プレイヤーレベルMAXを一括実行します"
      />

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

          <TaskProgress
            running={task.running}
            progress={task.progress}
            label={task.running ? STEPS[task.stepIndex] : undefined}
          />

          <Button
            className="w-full"
            size="lg"
            disabled={task.running || !hydrated}
            onClick={run}
          >
            {task.running ? "実行中..." : "セット代行を実行する"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
