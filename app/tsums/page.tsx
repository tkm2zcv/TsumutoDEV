"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, FileUp, Search, Send, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader } from "@/components/page-header";
import { TargetAccountBar } from "@/components/target-account-bar";
import { useRunConfirm } from "@/components/confirm-run-dialog";
import { TsumAvatar } from "@/components/tsum-avatar";
import { TaskProgress } from "@/components/task-progress";
import { useTask } from "@/hooks/use-task";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlayer } from "@/lib/player-store";
import { TSUMS, tsumLevel, type Tsum } from "@/lib/tsums";
import { cn } from "cn";

function TsumCard({
  tsum,
  level,
  selected,
  disabled,
  onToggle,
}: {
  tsum: Tsum;
  level: number;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-colors",
        disabled && "cursor-not-allowed opacity-45",
        selected
          ? "border-primary bg-primary/10"
          : "hover:border-foreground/30 hover:bg-accent/40"
      )}
    >
      {selected && !disabled && (
        <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary">
          <Check className="size-3 text-primary-foreground" />
        </span>
      )}
      <TsumAvatar tsum={tsum} />
      <span className="w-full truncate text-xs font-medium">{tsum.name}</span>
      <Badge variant={disabled ? "default" : "outline"} className="text-[10px]">
        {disabled ? "MAX済み" : `Lv.${level}`}
      </Badge>
    </button>
  );
}

export default function TsumsPage() {
  const { account, maxTsums, addActivity, hydrated } = usePlayer();
  const task = useTask();
  const confirm = useRunConfirm();
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [listCopied, setListCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("single");
  const [single, setSingle] = useState<string | null>(null);
  const [multi, setMulti] = useState<Set<string>>(new Set());
  const [importText, setImportText] = useState("");
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [unmatched, setUnmatched] = useState<string[]>([]);
  const [parsed, setParsed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const maxed = useMemo(
    () => new Set(account.maxedTsums),
    [account.maxedTsums]
  );

  const visible = useMemo(
    () =>
      TSUMS.filter(
        (t) =>
          query === "" ||
          t.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query]
  );

  const selectedIds = useMemo(() => {
    if (mode === "single") return single ? [single] : [];
    if (mode === "multi") return [...multi];
    return [...imported];
  }, [mode, single, multi, imported]);

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const parseImport = (text: string) => {
    const names = text
      .split(/\r?\n|,|、/)
      .map((s) => s.trim())
      .filter(Boolean);
    const found = new Set<string>();
    const missed: string[] = [];
    for (const name of names) {
      const hit = TSUMS.find(
        (t) => t.name === name || t.name.includes(name) || name.includes(t.name)
      );
      if (hit && !maxed.has(hit.id)) found.add(hit.id);
      else if (hit && maxed.has(hit.id)) missed.push(`${name}(MAX済み)`);
      else missed.push(name);
    }
    setImported(found);
    setUnmatched(missed);
    setParsed(true);
    toast.info(`${found.size}件のツムを認識しました`);
  };

  const listText = useMemo(
    () => TSUMS.map((t) => t.name).join("\n"),
    []
  );

  const sendList = () => {
    setListDialogOpen(true);
    addActivity(`ツム選択リストを送信(${TSUMS.length}件)`);
  };

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(listText);
      setListCopied(true);
      setTimeout(() => setListCopied(false), 1500);
    } catch {
      toast.error("コピーに失敗しました");
    }
  };

  const downloadList = () => {
    const blob = new Blob([listText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tsum-list.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ツムリストをダウンロードしました");
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setImportText(text);
      parseImport(text);
    };
    reader.readAsText(f);
  };

  const run = () => {
    if (selectedIds.length === 0) {
      toast.error("対象のツムを選択してください");
      return;
    }
    confirm.request({
      title: "ツムレベルMAXの実行確認",
      rows: [
        { label: "対象ツム", value: `${selectedIds.length}体` },
        { label: "実行後", value: "Lv.50 (MAX)" },
      ],
      action: () =>
        task.start({
          durationMs: 2400,
          steps: ["対象ツムを確認中", "レベルをMAXに変更中", "反映を確認中"],
          onDone: () => {
            maxTsums(selectedIds);
            toast.success(`${selectedIds.length}体のツムをレベルMAXにしました`);
            setSingle(null);
            setMulti(new Set());
            setImported(new Set());
          },
        }),
    });
  };

  const renderGrid = (
    sel: Set<string> | string | null,
    onToggle: (id: string) => void
  ) => (
    <ScrollArea className="h-[420px] pr-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {visible.map((t) => {
          const isMaxed = maxed.has(t.id);
          const selected =
            typeof sel === "string" ? sel === t.id : (sel?.has(t.id) ?? false);
          return (
            <TsumCard
              key={t.id}
              tsum={t}
              level={tsumLevel(t, isMaxed)}
              selected={selected}
              disabled={isMaxed || task.running}
              onToggle={() => onToggle(t.id)}
            />
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          該当するツムが見つかりません
        </p>
      )}
    </ScrollArea>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Star}
        iconCls="border-yellow-300/25 bg-yellow-300/10 text-yellow-200"
        title="ツムレベルMAX"
        description="指定したツムのレベルをMAX(Lv.50)にします"
      />

      <TargetAccountBar />

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="size-5 text-yellow-300" />
              ツム一覧
            </CardTitle>
            <Badge variant="secondary" className="tabular-nums">
              MAX済み {maxed.size}/{TSUMS.length}
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="ツム名で検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">単体選択</TabsTrigger>
              <TabsTrigger value="multi">複数選択</TabsTrigger>
              <TabsTrigger value="import">リストインポート</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-3 pt-3">
              <CardDescription>
                ツムを1体選んで実行します
              </CardDescription>
              {renderGrid(single, (id) => setSingle(id === single ? null : id))}
            </TabsContent>

            <TabsContent value="multi" className="space-y-3 pt-3">
              <CardDescription>
                複数のツムを手動で選んでまとめて実行します
              </CardDescription>
              {renderGrid(multi, (id) => setMulti(toggle(multi, id)))}
            </TabsContent>

            <TabsContent value="import" className="space-y-3 pt-3">
              <CardDescription>
                お客様が選択したツム一覧(1行1ツム)を貼り付けてインポートします
              </CardDescription>
              <Textarea
                rows={5}
                placeholder={"例:\nミッキー\nエルサ\nスティッチ"}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => parseImport(importText)}
                >
                  リストを読み込む
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <FileUp className="mr-2 size-4" />
                  ファイルから読み込む
                </Button>
                <Button variant="outline" onClick={sendList}>
                  <Send className="mr-2 size-4" />
                  リストを送る
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.csv"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />
              </div>
              {parsed && (
                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <p>
                    認識: <span className="font-semibold">{imported.size}件</span>
                  </p>
                  {unmatched.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      認識できなかった項目: {unmatched.join("、")}
                    </p>
                  )}
                </div>
              )}
              {renderGrid(imported, (id) =>
                setImported(toggle(imported, id))
              )}
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3 text-sm">
            <span>
              選択中:{" "}
              <span className="font-semibold tabular-nums">
                {selectedIds.length}体
              </span>
            </span>
            <span className="text-muted-foreground">実行後: Lv.50 (MAX)</span>
          </div>

          <TaskProgress
            running={task.running}
            progress={task.progress}
            label={task.running ? ["対象ツムを確認中", "レベルをMAXに変更中", "反映を確認中"][task.stepIndex] : undefined}
          />

          <Button
            className="w-full"
            size="lg"
            disabled={task.running || !hydrated || selectedIds.length === 0}
            onClick={run}
          >
            {task.running
              ? "実行中..."
              : `${selectedIds.length}体をレベルMAXにする`}
          </Button>
          {confirm.dialog}
        </CardContent>
      </Card>

      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5 text-primary" />
              ツム選択リストをお客様へ送信
            </DialogTitle>
            <DialogDescription>
              所持ツム一覧({TSUMS.length}件)をお客様に送り、レベルを上げたいツムを選んでもらいます。返ってきたリストを「リストインポート」で読み込んでください
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-y-auto rounded-lg border bg-muted/20 p-2">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
              {TSUMS.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs hover:bg-accent/50"
                >
                  <TsumAvatar tsum={t} className="size-6 text-xs" />
                  <span className="truncate">{t.name}</span>
                  {maxed.has(t.id) && (
                    <Badge variant="default" className="ml-auto text-[9px]">
                      MAX
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={copyList}>
              {listCopied ? (
                <Check className="mr-2 size-4 text-emerald-400" />
              ) : (
                <Copy className="mr-2 size-4" />
              )}
              リストをコピー
            </Button>
            <Button variant="outline" className="flex-1" onClick={downloadList}>
              <Download className="mr-2 size-4" />
              .txtでダウンロード
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
