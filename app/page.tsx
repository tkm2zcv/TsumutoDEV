"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  Coins,
  Dices,
  Gem,
  Heart,
  Inbox,
  Medal,
  Package,
  Star,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { AccountSwitcher } from "@/components/account-switcher";
import { usePlayer } from "@/lib/player-store";
import { formatJa, formatNum, monthLabel } from "@/lib/format";

/** 当月増加コインを日別に配分した擬似推移(見た目用) */
function buildSeries(total: number, days: number): number[] {
  if (days <= 0) return [0];
  const weights = Array.from({ length: days }, (_, i) => {
    const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    return 0.4 + r;
  });
  const wSum = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return weights.map((w) => {
    acc += (w / wSum) * total;
    return acc;
  });
}

function Sparkline({ series }: { series: number[] }) {
  const W = 560;
  const H = 96;
  const max = Math.max(...series, 1);
  const pts = series.map(
    (v, i) =>
      `${(i / Math.max(1, series.length - 1)) * W},${H - (v / max) * (H - 10)}`
  );
  const path = `M0,${H} L${pts.join(" L")} L${W},${H} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-24 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="coinArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.155 85)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.78 0.155 85)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="url(#coinArea)" />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="oklch(0.78 0.155 85)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const QUICK_ACTIONS = [
  { href: "/boost", icon: Package, label: "強化", desc: "セット/コイン/レベル/スコア" },
  { href: "/gacha", icon: Dices, label: "ガチャ自動", desc: "コイン切れまで" },
  { href: "/tsums", icon: Star, label: "ツムMAX", desc: "選択して実行" },
  { href: "/inbox", icon: Inbox, label: "受け取り", desc: "ハート・メダル" },
];

function timeAgo(at: number, now: number): string {
  const diff = Math.max(0, now - at);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "たった今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

export default function DashboardPage() {
  const { account, hydrated } = usePlayer();
  const now = Date.now();
  const today = new Date().getDate();
  const series = useMemo(
    () => buildSeries(account.monthlyCoinsAdded, today),
    [account.monthlyCoinsAdded, today]
  );
  const todayAdded =
    series.length >= 2 ? series[series.length - 1] - series[series.length - 2] : series[0] ?? 0;
  const v = (n: number) => (hydrated ? formatNum(n) : "—");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-widest text-muted-foreground">
            OVERVIEW
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            ダッシュボード
          </h1>
        </div>
        <AccountSwitcher />
      </div>

      {/* ヒーローカード: 今月の増加コイン */}
      <Card className="card-hover relative overflow-hidden border-primary/20">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(420px 180px at 85% 0%, oklch(0.78 0.155 85 / 12%), transparent 70%)",
          }}
        />
        <CardHeader className="relative flex-row items-center justify-between pb-1">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarClock className="size-4 text-primary" />
            今月の増加コイン
          </CardTitle>
          <Badge variant="secondary" className="tabular-nums">
            {hydrated ? `${monthLabel(account.monthKey)}分` : "—"}
          </Badge>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <p className="text-4xl font-bold tracking-tight tabular-nums md:text-5xl">
                <span className="text-gradient-gold">
                  {hydrated ? formatJa(account.monthlyCoinsAdded) : "—"}
                </span>
                <span className="ml-1 text-2xl text-muted-foreground">枚</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                本日 +{hydrated ? formatJa(todayAdded) : "—"}・当月分のみ表示・翌月0リセット
              </p>
            </div>
            <div className="w-full max-w-md flex-1">
              <Sparkline series={hydrated ? series : [0]} />
              <p className="mt-1 text-right text-[10px] tracking-wide text-muted-foreground">
                日別の増加推移(累計)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ステータス */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          icon={Coins}
          iconCls="border-amber-400/20 bg-amber-400/10 text-amber-300"
          label="コイン"
          value={`${v(account.coins)} 枚`}
          sub={hydrated ? `${formatJa(account.coins)}枚` : undefined}
        />
        <StatCard
          icon={Gem}
          iconCls="border-rose-400/20 bg-rose-400/10 text-rose-300"
          label="ルビー"
          value={`${v(account.rubies)} 個`}
        />
        <StatCard
          icon={Heart}
          iconCls="border-pink-400/20 bg-pink-400/10 text-pink-300"
          label="ハート"
          value={`${v(account.hearts)} 個`}
        />
        <StatCard
          icon={Medal}
          iconCls="border-yellow-300/20 bg-yellow-300/10 text-yellow-200"
          label="メダル"
          value={`${v(account.medals)} 枚`}
        />
        <StatCard
          icon={TrendingUp}
          iconCls="border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          label="プレイヤーレベル"
          value={hydrated ? `Lv.${formatNum(account.level)}` : "—"}
          sub={hydrated && account.level >= 999 ? "MAX" : undefined}
        />
        <StatCard
          icon={Trophy}
          iconCls="border-sky-400/20 bg-sky-400/10 text-sky-300"
          label="ハイスコア"
          value={v(account.highScore)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* クイックアクション */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">クイックアクション</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="card-hover group flex items-center gap-3 rounded-lg border bg-muted/20 px-3.5 py-3"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-accent text-muted-foreground transition-colors group-hover:bg-primary/15 group-hover:text-primary">
                  <a.icon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* 最近のアクティビティ */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Activity className="size-4 text-muted-foreground" />
              最近のアクティビティ
            </CardTitle>
            <Link
              href="/activity"
              className="text-xs text-primary hover:underline"
            >
              すべて表示
            </Link>
          </CardHeader>
          <CardContent>
            {!hydrated || account.activity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                まだ実行履歴がありません
              </p>
            ) : (
              <ul className="space-y-1">
                {account.activity.slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent/40"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Timer className="size-3 text-muted-foreground" />
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {timeAgo(item.at, now)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
