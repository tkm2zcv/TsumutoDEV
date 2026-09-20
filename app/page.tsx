"use client";

import Link from "next/link";
import {
  CalendarClock,
  Coins,
  Gem,
  Heart,
  Medal,
  TrendingUp,
  Trophy,
  UserRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlayer } from "@/lib/player-store";
import { formatJa, formatNum, monthLabel } from "@/lib/format";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconCls,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  iconCls: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={`size-4 ${iconCls}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && (
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { account, hydrated } = usePlayer();
  const v = (n: number) => (hydrated ? formatNum(n) : "—");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground">
            現在のプレイヤー情報
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <UserRound className="size-3.5" />
          {account.name}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          icon={Coins}
          label="コイン"
          value={`${v(account.coins)} 枚`}
          sub={hydrated ? formatJa(account.coins) + "枚" : undefined}
          iconCls="text-amber-400"
        />
        <StatCard
          icon={Gem}
          label="ルビー"
          value={`${v(account.rubies)} 個`}
          iconCls="text-rose-400"
        />
        <StatCard
          icon={Heart}
          label="ハート"
          value={`${v(account.hearts)} 個`}
          iconCls="text-pink-400"
        />
        <StatCard
          icon={Medal}
          label="メダル"
          value={`${v(account.medals)} 枚`}
          iconCls="text-yellow-300"
        />
        <StatCard
          icon={TrendingUp}
          label="プレイヤーレベル"
          value={hydrated ? `Lv.${formatNum(account.level)}` : "—"}
          iconCls="text-emerald-400"
        />
        <StatCard
          icon={Trophy}
          label="ハイスコア"
          value={v(account.highScore)}
          iconCls="text-sky-400"
        />
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            今月の増加コイン
          </CardTitle>
          <CalendarClock className="size-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tabular-nums text-amber-300">
            {hydrated
              ? `${monthLabel(account.monthKey)}の増加コイン：${formatJa(account.monthlyCoinsAdded)}枚`
              : "—"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            当月分のみ表示。翌月になると0枚から再集計されます。
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/set">セット代行を実行</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/coins">コイン増加</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account">アカウント管理</Link>
        </Button>
      </div>
    </div>
  );
}
