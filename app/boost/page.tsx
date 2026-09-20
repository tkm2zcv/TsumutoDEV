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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/page-header";
import { TaskProgress } from "@/components/task-progress";
import { useTask } from "@/hooks/use-task";
import { MAX_LEVEL, usePlayer } from "@/lib/player-store";
import { formatJa, formatNum } from "@/lib/format";

const SCORE_RANGES = [
  { id: "r1", label: "1,000万〜5,000万 ランダム", min: 10_000_000, max: 50_000_000 },
  { id: "r2", label: "5,000万〜1億 ランダム", min: 50_000_000, max: 100_000_000 },
  { id: "r3", label: "1億〜21億 ランダム", min: 100_000_000, max: 2_100_000_000 },
];
const MAX_SCORE = 2_147_483_647;

function Head({
  icon: Icon,
  iconCls,
  title,
  right,
}: {
  icon: typeof Coins;
  iconCls: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex size-7 items-center justify-center rounded-lg border ${iconCls}`}>
        <Icon className="size-4" />
      </span>
      <span className="text-sm font-bold">{title}</span>
      {right && <span className="ml-auto text-xs text-muted-foreground tabular-nums">{right}</span>}
    </div>
  );
}

function Radio({ value, id, label }: { value: string; id: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className="text-sm font-normal">{label}</Label>
    </div>
  );
}

function SetCard() {
  const { addCoins, setLevel, hydrated } = usePlayer();
  const task = useTask();
  const run = () =>
    task.start({
      durationMs: 3200,
      steps: ["コイン2億枚を付与中", "レベルをMAXに変更中", "反映を確認中"],
      onDone: () => {
        addCoins(200_000_000);
        setLevel(MAX_LEVEL);
        toast.success("セット代行が完了しました");
      },
    });
  return (
    <Card className="border-primary/40">
      <CardHeader className="pb-3">
        <Head icon={Package} iconCls="border-primary/30 bg-primary/10 text-primary" title="セット代行" />
        <CardDescription className="text-xs">コイン2億枚 + レベルMAXを一括</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Coins className="size-3.5 text-amber-400" />コイン
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">+2億枚</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5 text-emerald-400" />レベル
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">Lv.{MAX_LEVEL}</p>
          </div>
        </div>
        <TaskProgress running={task.running} progress={task.progress}
          label={task.running ? ["コイン付与中", "レベル変更中", "確認中"][task.stepIndex] : undefined} />
        <Button className="w-full" disabled={task.running || !hydrated} onClick={run}>
          {task.running ? "実行中..." : "セット代行を実行する"}
        </Button>
      </CardContent>
    </Card>
  );
}

function CoinsCard() {
  const { account, addCoins, hydrated } = usePlayer();
  const task = useTask();
  const [mode, setMode] = useState("100m");
  const [custom, setCustom] = useState("");
  const amount =
    mode === "100m" ? 100_000_000
    : mode === "200m" ? 200_000_000
    : Number(custom.replace(/[^\d]/g, "")) || 0;
  const run = () => {
    if (amount <= 0) { toast.error("枚数を入力してください"); return; }
    task.start({
      durationMs: 2200,
      steps: ["アカウントを確認中", "コインを付与中", "残高を反映中"],
      onDone: () => { addCoins(amount); toast.success(`${formatJa(amount)}枚を付与しました`); },
    });
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <Head icon={Coins} iconCls="border-amber-400/25 bg-amber-400/10 text-amber-300" title="コイン増加"
          right={hydrated ? `${formatNum(account.coins)} 枚` : "—"} />
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup value={mode} onValueChange={setMode} className="flex flex-wrap gap-x-4 gap-y-2">
          <Radio value="100m" id="c1" label="1億枚" />
          <Radio value="200m" id="c2" label="2億枚" />
          <Radio value="custom" id="c3" label="枚数指定" />
        </RadioGroup>
        {mode === "custom" && (
          <div className="flex items-center gap-2">
            <Input inputMode="numeric" placeholder="例: 50000000" value={custom}
              onChange={(e) => setCustom(e.target.value)} className="h-8" />
            {amount > 0 && <span className="shrink-0 text-xs text-muted-foreground">{formatJa(amount)}枚</span>}
          </div>
        )}
        <p className="text-xs text-muted-foreground tabular-nums">
          実行後: {hydrated ? `${formatNum(account.coins + amount)} 枚` : "—"}
        </p>
        <TaskProgress running={task.running} progress={task.progress}
          label={task.running ? ["確認中", "付与中", "反映中"][task.stepIndex] : undefined} />
        <Button className="w-full" disabled={task.running || !hydrated || amount <= 0} onClick={run}>
          {task.running ? "実行中..." : "コインを増加する"}
        </Button>
      </CardContent>
    </Card>
  );
}

function LevelCard() {
  const { account, setLevel, hydrated } = usePlayer();
  const task = useTask();
  const [mode, setMode] = useState("max");
  const [custom, setCustom] = useState("");
  const target =
    mode === "max" ? MAX_LEVEL
    : Math.min(MAX_LEVEL, Math.max(1, Number(custom.replace(/[^\d]/g, "")) || 0));
  const run = () => {
    if (mode === "custom" && (!custom || target <= 0)) { toast.error("レベルを入力してください"); return; }
    task.start({
      durationMs: 2000,
      steps: ["アカウントを確認中", "レベルを変更中"],
      onDone: () => { setLevel(target); toast.success(`Lv.${formatNum(target)} に変更しました`); },
    });
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <Head icon={TrendingUp} iconCls="border-emerald-400/25 bg-emerald-400/10 text-emerald-300" title="プレイヤーレベル"
          right={hydrated ? `Lv.${formatNum(account.level)}` : "—"} />
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup value={mode} onValueChange={setMode} className="flex flex-wrap gap-x-4 gap-y-2">
          <Radio value="max" id="l1" label={`MAX (Lv.${MAX_LEVEL})`} />
          <Radio value="custom" id="l2" label="レベル指定" />
        </RadioGroup>
        {mode === "custom" && (
          <Input inputMode="numeric" placeholder={`1〜${MAX_LEVEL}`} value={custom}
            onChange={(e) => setCustom(e.target.value)} className="h-8" />
        )}
        <p className="text-xs text-muted-foreground tabular-nums">
          実行後: Lv.{formatNum(target)}
        </p>
        <TaskProgress running={task.running} progress={task.progress}
          label={task.running ? ["確認中", "変更中"][task.stepIndex] : undefined} />
        <Button className="w-full" disabled={task.running || !hydrated} onClick={run}>
          {task.running ? "実行中..." : "レベルを変更する"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ScoreCard() {
  const { account, setHighScore, hydrated } = usePlayer();
  const task = useTask();
  const [mode, setMode] = useState("r1");
  const [custom, setCustom] = useState("");
  const run = () => {
    let score: number | null;
    if (mode === "custom") {
      const n = Number(custom.replace(/[^\d]/g, ""));
      score = n > 0 ? Math.min(n, MAX_SCORE) : null;
    } else {
      const r = SCORE_RANGES.find((r) => r.id === mode)!;
      score = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
    }
    if (score === null) { toast.error("スコアを入力してください"); return; }
    task.start({
      durationMs: 2200,
      steps: ["アカウントを確認中", "ハイスコアを更新中"],
      onDone: () => { setHighScore(score); toast.success(`ハイスコアを ${formatNum(score)} に更新しました`); },
    });
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <Head icon={Trophy} iconCls="border-sky-400/25 bg-sky-400/10 text-sky-300" title="ハイスコア更新"
          right={hydrated ? formatNum(account.highScore) : "—"} />
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup value={mode} onValueChange={setMode} className="grid gap-2">
          {SCORE_RANGES.map((r) => <Radio key={r.id} value={r.id} id={r.id} label={r.label} />)}
          <Radio value="custom" id="hs-custom" label="スコア指定" />
        </RadioGroup>
        {mode === "custom" && (
          <Input inputMode="numeric" placeholder={`最大 ${formatNum(MAX_SCORE)}`} value={custom}
            onChange={(e) => setCustom(e.target.value)} className="h-8" />
        )}
        <TaskProgress running={task.running} progress={task.progress}
          label={task.running ? ["確認中", "更新中"][task.stepIndex] : undefined} />
        <Button className="w-full" disabled={task.running || !hydrated} onClick={run}>
          {task.running ? "実行中..." : "ハイスコアを更新する"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function BoostPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        icon={Sparkles}
        iconCls="border-violet-400/25 bg-violet-400/10 text-violet-300"
        title="強化"
        description="セット代行・コイン・レベル・ハイスコアを1画面で実行します"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SetCard />
        <CoinsCard />
        <LevelCard />
        <ScoreCard />
      </div>
      <CardDescription className="px-1 text-xs">
        ※UIモックのため、実際の処理は行われず画面表示のみ更新されます。
      </CardDescription>
    </div>
  );
}
