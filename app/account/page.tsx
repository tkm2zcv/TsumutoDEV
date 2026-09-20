"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  KeyRound,
  LogIn,
  Trash2,
  UserRound,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

export default function AccountPage() {
  const {
    account,
    accounts,
    hydrated,
    addAccountByCode,
    deleteAccount,
    switchAccount,
  } = usePlayer();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(account.transferCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const onAddByCode = () => {
    const res = addAccountByCode(code, name);
    if (!res) {
      toast.error("引き継ぎコードを入力してください");
      return;
    }
    if (res.existed) {
      toast.info(`登録済みの「${res.account.name}」にログインしました`);
    } else {
      toast.success(`「${res.account.name}」を追加してログインしました`);
    }
    setCode("");
    setName("");
  };

  const onDelete = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    deleteAccount(id);
    setDeleting(null);
    toast.success(`「${target?.name ?? "アカウント"}」を削除しました`, {
      description:
        id === account.id ? "別のアカウントに切り替えました" : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={KeyRound}
        iconCls="border-sky-400/25 bg-sky-400/10 text-sky-300"
        title="アカウント管理"
        description="引き継ぎコードでのログインと保有アカウントの管理を行います"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-5" />
                現在のアカウント
                <Badge
                  variant={account.guest ? "secondary" : "outline"}
                  className="ml-1 text-[10px]"
                >
                  {account.guest ? "ゲスト" : "連携"}
                </Badge>
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
                  <p className="text-xs text-muted-foreground">
                    引き継ぎコード
                  </p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LogIn className="size-5 text-sky-300" />
                コードでログイン
              </CardTitle>
              <CardDescription>
                引き継ぎコードを入力してアカウントを追加・切り替えます(ゲストアカウントも可)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-name" className="text-xs">
                  表示名(任意)
                </Label>
                <Input
                  id="add-name"
                  placeholder="例: お客様A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs">
                  引き継ぎコード
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    className="h-8 font-mono"
                    placeholder="XXXX-XXXX-XXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <Button
                    onClick={onAddByCode}
                    disabled={!hydrated}
                    size="sm"
                    className="shrink-0"
                  >
                    ログイン
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">保有アカウント一覧</CardTitle>
            <CardDescription>
              ゲスト・連携アカウントの切り替えと削除ができます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[52vh] overflow-y-auto pr-2">
            <ul className="divide-y">
              {accounts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-2 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {a.name}
                      {a.guest && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          ゲスト
                        </Badge>
                      )}
                      {a.id === account.id && (
                        <Badge className="ml-2 text-[10px]">現在</Badge>
                      )}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {a.transferCode}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={!hydrated}
                      onClick={() => setDeleting(a.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アカウントを削除しますか?</DialogTitle>
            <DialogDescription>
              「{accounts.find((a) => a.id === deleting)?.name}
              」を一覧から削除します。この操作は元に戻せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleting && onDelete(deleting)}
            >
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
