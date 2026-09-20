"use client";

import { useState } from "react";
import { Check, Copy, Ghost, KeyRound, Trash2, UserPlus } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayer } from "@/lib/player-store";
import { formatNum } from "@/lib/format";

export default function GuestPage() {
  const {
    account,
    accounts,
    hydrated,
    createGuestAccount,
    issueTransferCode,
    deleteAccount,
    switchAccount,
  } = usePlayer();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const guests = accounts.filter((a) => a.guest);
  const currentIsGuest = account.guest;

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
        icon={Ghost}
        iconCls="border-violet-400/25 bg-violet-400/10 text-violet-300"
        title="ゲストアカウント"
        description="ゲストアカウントの作成と引き継ぎコードの発行を行います"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-5 text-violet-300" />
              ゲスト作成・コード発行
            </CardTitle>
            <CardDescription>
              引き継ぎコードは選択中のゲストアカウントに対して発行されます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={onCreateGuest} disabled={!hydrated}>
                <UserPlus className="mr-2 size-4" />
                ゲストアカウント作成
              </Button>
              <Button
                variant="secondary"
                onClick={onIssueCode}
                disabled={!hydrated || !currentIsGuest}
              >
                <KeyRound className="mr-2 size-4" />
                引き継ぎコードを発行
              </Button>
            </div>

            {currentIsGuest ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {account.name} の引き継ぎコード
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
            ) : (
              <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                ※コード発行はゲストアカウント選択中のみ可能です。一覧からゲストを選択してください
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ゲストアカウント一覧</CardTitle>
            <CardDescription>
              作成したゲストアカウントが表示されます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {guests.length === 0 ? (
              <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                ゲストアカウントはまだありません
              </p>
            ) : (
              <ScrollArea className="max-h-[52vh] pr-2">
              <ul className="divide-y">
                {guests.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {a.name}
                        {a.id === account.id && (
                          <Badge variant="secondary" className="ml-2 text-[10px]">
                            現在
                          </Badge>
                        )}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {a.transferCode}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-[10px] tabular-nums">
                        Lv.{formatNum(a.level)}
                      </Badge>
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
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ゲストアカウントを削除しますか?</DialogTitle>
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
