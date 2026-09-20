"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Trash2, UserPlus, UserRound } from "lucide-react";
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
    createGuestAccount,
    issueTransferCode,
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

  const onCreateGuest = () => {
    const acc = createGuestAccount();
    toast.success(`ゲストアカウント「${acc.name}」を作成し切り替えました`);
  };

  const onIssueCode = () => {
    const c = issueTransferCode();
    toast.success(`新しい引き継ぎコードを発行しました: ${c}`);
  };

  const onAddByCode = () => {
    const res = addAccountByCode(code, name);
    if (!res) {
      toast.error("引き継ぎコードを入力してください");
      return;
    }
    if (res.existed) {
      toast.info(`登録済みの「${res.account.name}」に切り替えました`);
    } else {
      toast.success(`「${res.account.name}」を追加して切り替えました`);
    }
    setCode("");
    setName("");
  };

  const onDelete = (id: string) => {
    const target = accounts.find((a) => a.id === id);
    deleteAccount(id);
    setDeleting(null);
    toast.success(
      `「${target?.name ?? "アカウント"}」を削除しました`,
      { description: id === account.id ? "別のアカウントに切り替えました" : undefined }
    );
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
            <UserPlus className="size-5" />
            アカウント追加(コード)
          </CardTitle>
          <CardDescription>
            お客様のアカウントなど、引き継ぎコードで複数のアカウントを追加できます。未登録のコードはモック上で新規アカウントとして扱います
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="add-name">表示名(任意)</Label>
            <Input
              id="add-name"
              placeholder="例: お客様A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Label htmlFor="code">引き継ぎコード</Label>
          <div className="flex gap-2">
            <Input
              id="code"
              className="font-mono"
              placeholder="XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={onAddByCode} disabled={!hydrated}>
              追加
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
                <div className="flex items-center gap-2">
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
        </CardContent>
      </Card>

      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>アカウントを削除しますか?</DialogTitle>
            <DialogDescription>
              「{accounts.find((a) => a.id === deleting)?.name}」を一覧から削除します。この操作は元に戻せません。
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
