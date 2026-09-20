"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, LogIn, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

export default function AccountPage() {
  const {
    account,
    accounts,
    hydrated,
    createGuestAccount,
    issueTransferCode,
    loginWithCode,
    switchAccount,
  } = usePlayer();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(account.transferCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const onCreateGuest = () => {
    const acc = createGuestAccount();
    toast.success(`ゲストアカウント「${acc.name}」を作成し切り替えました`);
  };

  const onIssueCode = () => {
    const c = issueTransferCode();
    toast.success(`新しい引き継ぎコードを発行しました: ${c}`);
  };

  const onLogin = () => {
    if (!code.trim()) {
      toast.error("引き継ぎコードを入力してください");
      return;
    }
    if (loginWithCode(code)) {
      toast.success("ログインしました");
      setCode("");
    } else {
      toast.error("引き継ぎコードが見つかりません");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={KeyRound}
        iconCls="border-sky-400/25 bg-sky-400/10 text-sky-300"
        title="アカウント関連"
        description="アカウントの作成・引き継ぎを管理します"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-5" />
            現在のアカウント
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xl font-bold">{account.name}</p>
            <Badge variant="outline">
              Lv.{hydrated ? formatNum(account.level) : "—"}
            </Badge>
            <Badge variant="outline" className="tabular-nums">
              {hydrated ? formatNum(account.coins) : "—"} コイン
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">引き継ぎコード</p>
              <p className="font-mono text-lg tracking-wider">
                {hydrated ? account.transferCode : "—"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={copyCode}>
              {copied ? (
                <Check className="size-4 text-emerald-400" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCreateGuest} disabled={!hydrated}>
              <UserPlus className="mr-2 size-4" />
              ゲストアカウント作成
            </Button>
            <Button variant="secondary" onClick={onIssueCode} disabled={!hydrated}>
              <KeyRound className="mr-2 size-4" />
              引き継ぎコードを発行
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LogIn className="size-5" />
            引き継ぎコードでログイン
          </CardTitle>
          <CardDescription>
            発行済みの引き継ぎコードを入力してアカウントを切り替えます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="code">引き継ぎコード</Label>
          <div className="flex gap-2">
            <Input
              id="code"
              className="font-mono"
              placeholder="XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={onLogin} disabled={!hydrated}>
              ログイン
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">保有アカウント一覧</CardTitle>
          <CardDescription>
            作成したアカウントはここに表示されます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {accounts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-2 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {a.name}
                    {a.id === account.id && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        現在
                      </Badge>
                    )}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {a.transferCode}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={a.id === account.id || !hydrated}
                  onClick={() => {
                    switchAccount(a.id);
                    toast.success(`「${a.name}」に切り替えました`);
                  }}
                >
                  切り替え
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
