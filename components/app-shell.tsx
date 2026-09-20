"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coins,
  Dices,
  HeartHandshake,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Menu,
  Package,
  Star,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

const NAV_SECTIONS = [
  {
    label: "情報",
    items: [{ href: "/", label: "ダッシュボード", icon: LayoutDashboard }],
  },
  {
    label: "強化",
    items: [
      { href: "/set", label: "セット代行", icon: Package },
      { href: "/coins", label: "コイン増加", icon: Coins },
      { href: "/level", label: "プレイヤーレベル", icon: TrendingUp },
      { href: "/tsums", label: "ツムレベルMAX", icon: Star },
      { href: "/highscore", label: "ハイスコア更新", icon: Trophy },
    ],
  },
  {
    label: "実行",
    items: [
      { href: "/gacha", label: "ガチャ自動", icon: Dices },
      { href: "/freeplay", label: "フリープレイ購入", icon: Timer },
      { href: "/inbox", label: "ハート・メダル", icon: Inbox },
    ],
  },
  {
    label: "アカウント",
    items: [{ href: "/account", label: "アカウント管理", icon: KeyRound }],
  },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { account } = usePlayer();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-4">
        <HeartHandshake className="size-6 text-pink-400" />
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight">ツムツム代行パネル</span>
          <Badge variant="secondary" className="text-[10px]">
            MOCK
          </Badge>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1 px-2 text-[11px] font-medium tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <Separator />
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground">{account.name}</p>
        <p className="text-sm font-medium tabular-nums">
          <Coins className="mr-1 inline size-3.5 text-amber-400" />
          {formatNum(account.coins)}
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card md:block">
        <NavContent />
      </aside>
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="メニュー">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="font-bold">ツムツム代行パネル</span>
      </header>
      <main className="md:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
