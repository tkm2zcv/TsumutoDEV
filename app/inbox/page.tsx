"use client";

import { Heart, Inbox, Medal } from "lucide-react";
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
import { usePlayer, type InboxItem } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

function InboxSection({
  title,
  icon: Icon,
  iconCls,
  items,
  unit,
  onCollectOne,
  onCollectAll,
  disabled,
}: {
  title: string;
  icon: React.ElementType;
  iconCls: string;
  items: InboxItem[];
  unit: string;
  onCollectOne: (id: string) => void;
  onCollectAll: () => void;
  disabled: boolean;
}) {
  const total = items.reduce((t, i) => t + i.amount, 0);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className={`size-5 ${iconCls}`} />
            {title}
          </CardTitle>
          <CardDescription>
            受け取り可能: {items.length}件 (合計 {formatNum(total)}
            {unit})
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          disabled={disabled || items.length === 0}
          onClick={onCollectAll}
        >
          すべて受け取る
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            受け取れる{title}はありません
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 py-2.5 text-sm"
              >
                <span>{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold tabular-nums">
                    +{formatNum(item.amount)}
                    {unit}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onCollectOne(item.id)}
                  >
                    受け取る
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function InboxPage() {
  const { account, collect, hydrated } = usePlayer();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Inbox}
        iconCls="border-pink-400/25 bg-pink-400/10 text-pink-300"
        title="ハート・メダル受け取り"
        description="ゲーム内の受け取り可能なアイテムを自動で受け取ります"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              所持ハート
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-pink-300">
              {hydrated ? `${formatNum(account.hearts)} 個` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              所持メダル
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums text-yellow-300">
              {hydrated ? `${formatNum(account.medals)} 枚` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <InboxSection
        title="ハート"
        icon={Heart}
        iconCls="text-pink-400"
        items={account.inboxHearts}
        unit="個"
        disabled={!hydrated}
        onCollectOne={(id) => {
          collect("hearts", id);
          toast.success("ハートを受け取りました");
        }}
        onCollectAll={() => {
          collect("hearts");
          toast.success("ハートをすべて受け取りました");
        }}
      />

      <InboxSection
        title="メダル"
        icon={Medal}
        iconCls="text-yellow-300"
        items={account.inboxMedals}
        unit="枚"
        disabled={!hydrated}
        onCollectOne={(id) => {
          collect("medals", id);
          toast.success("メダルを受け取りました");
        }}
        onCollectAll={() => {
          collect("medals");
          toast.success("メダルをすべて受け取りました");
        }}
      />
    </div>
  );
}
