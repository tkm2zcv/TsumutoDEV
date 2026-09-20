"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Coins,
  Dices,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Menu,
  Sparkles,
  Star,
  Timer,
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
      { href: "/boost", label: "強化", icon: Sparkles },
      { href: "/tsums", label: "ツムレベルMAX", icon: Star },
    ],
  },
  {
    label: "実行",
    items: [
      { href: "/gacha", label: "ガチャ自動", icon: Dices },
      { href: "/freeplay", label: "フリープレイ購入", icon: Timer },
      { href: "/inbox", label: "ハート・メダル", icon: Inbox, badge: true },
    ],
  },
  {
    label: "アカウント",
    items: [{ href: "/account", label: "アカウント管理", icon: KeyRound }],
  },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-lg shadow-[0_4px_16px_-4px_oklch(0.75_0.17_70/50%)]">
        🪙
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight">
          ツムツム代行パネル
        </p>
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground">
          TSUMUTODEV
        </p>
      </div>
      <Badge
        variant="outline"
        className="ml-auto border-primary/30 text-[9px] text-primary"
      >
        MOCK
      </Badge>
    </div>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { account } = usePlayer();
  const inboxCount = account.inboxHearts.length + account.inboxMedals.length;
  return (
    <div className="flex h-full flex-col">
      <Brand />
      <Separator />
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/80">
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
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all",
                      active
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                    )}
                    <item.icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active ? "text-primary" : "group-hover:text-foreground"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {"badge" in item && item.badge && inboxCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold tabular-nums text-primary">
                        {inboxCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <Separator />
      <div className="p-3">
        <div className="rounded-lg border bg-card/60 p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-xs font-bold text-white">
              {account.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{account.name}</p>
              <p className="text-[10px] text-muted-foreground tabular-nums">
                Lv.{formatNum(account.level)}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 rounded-md bg-background/60 px-2 py-1.5">
            <Coins className="size-3.5 text-amber-400" />
            <span className="text-xs font-semibold tabular-nums">
              {formatNum(account.coins)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-scene min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar/80 backdrop-blur md:block">
        <NavContent />
      </aside>
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-background/80 px-4 py-2.5 backdrop-blur-md md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="メニュー"
              className="size-9"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 text-sm">
            🪙
          </div>
          <span className="text-sm font-bold">ツムツム代行パネル</span>
        </div>
      </header>
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
