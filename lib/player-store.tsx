"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { currentMonthKey } from "./format";

export const MAX_LEVEL = 999;
export const FREEPLAY_COST_MEDALS = 500;
export const FREEPLAY_LIMIT = 3;
export const FREEPLAY_DURATION_MS = 30 * 60 * 1000;

const STORAGE_KEY = "tsumutodev.store.v1";

export type InboxItem = { id: string; label: string; amount: number };

export type ActivityItem = { id: string; label: string; at: number };

export type AccountProfile = {
  id: string;
  name: string;
  transferCode: string;
  coins: number;
  rubies: number;
  hearts: number;
  medals: number;
  level: number;
  highScore: number;
  monthKey: string;
  monthlyCoinsAdded: number;
  maxedTsums: string[];
  freeplayUsed: number;
  freeplayUntil: number | null;
  inboxHearts: InboxItem[];
  inboxMedals: InboxItem[];
  activity: ActivityItem[];
};

type Store = { accounts: AccountProfile[]; currentId: string };

function genCode() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${seg()}-${seg()}-${seg()}`;
}

function heartItems(n: number): InboxItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `h-${i}`,
    label: "フレンドからのハート",
    amount: 1,
  }));
}

function medalItems(n: number): InboxItem[] {
  const labels = ["イベント報酬", "ログインボーナス", "ミッション報酬", "ビンゴ報酬"];
  return Array.from({ length: n }, (_, i) => ({
    id: `m-${i}`,
    label: labels[i % labels.length],
    amount: 50,
  }));
}

function normalizeMonth(a: AccountProfile): AccountProfile {
  const key = currentMonthKey();
  const withDefaults = { ...a, activity: a.activity ?? [] };
  if (withDefaults.monthKey === key) return withDefaults;
  return {
    ...withDefaults,
    monthKey: key,
    monthlyCoinsAdded: 0,
    freeplayUsed: 0,
  };
}

function makeGuest(index: number): AccountProfile {
  const rnd = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  return {
    id: `guest-${Date.now()}-${index}`,
    name: `ゲスト${String(index).padStart(3, "0")}`,
    transferCode: genCode(),
    coins: rnd(0, 5_000_000),
    rubies: rnd(0, 400),
    hearts: rnd(0, 5),
    medals: rnd(0, 2_000),
    level: rnd(1, 200),
    highScore: rnd(500_000, 15_000_000),
    monthKey: currentMonthKey(),
    monthlyCoinsAdded: 0,
    maxedTsums: [],
    freeplayUsed: 0,
    freeplayUntil: null,
    inboxHearts: heartItems(rnd(3, 15)),
    inboxMedals: medalItems(rnd(2, 8)),
    activity: [],
  };
}

const DEFAULT_STORE: Store = {
  currentId: "main",
  accounts: [
    {
      id: "main",
      name: "メインアカウント",
      transferCode: "DEMO-MAIN-0001",
      coins: 12_345_678,
      rubies: 342,
      hearts: 8,
      medals: 1_250,
      level: 127,
      highScore: 8_765_432,
      monthKey: currentMonthKey(),
      monthlyCoinsAdded: 150_000_000,
      maxedTsums: [],
      freeplayUsed: 1,
      freeplayUntil: null,
      inboxHearts: heartItems(14),
      inboxMedals: medalItems(6),
      activity: [
        {
          id: "seed-1",
          label: "ハートを14件受け取りました",
          at: Date.now() - 42 * 60_000,
        },
        {
          id: "seed-2",
          label: "ハイスコアを 62,481,900 に更新",
          at: Date.now() - 3 * 60_000,
        },
        {
          id: "seed-3",
          label: "コイン +1億5,000万枚",
          at: Date.now() - 60_000,
        },
      ],
    },
  ],
};

export type PlayerContextValue = {
  account: AccountProfile;
  accounts: AccountProfile[];
  hydrated: boolean;
  addActivity: (label: string) => void;
  addCoins: (n: number) => void;
  setLevel: (n: number) => void;
  setHighScore: (n: number) => void;
  maxTsums: (ids: string[]) => void;
  spendCoins: (n: number) => void;
  buyFreeplay: () => void;
  expireFreeplay: () => void;
  collect: (type: "hearts" | "medals", id?: string) => void;
  createGuestAccount: () => AccountProfile;
  issueTransferCode: () => string;
  loginWithCode: (code: string) => boolean;
  switchAccount: (id: string) => void;
};

const Ctx = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(DEFAULT_STORE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Store;
        if (parsed.accounts?.length) {
          setStore({
            currentId: parsed.currentId,
            accounts: parsed.accounts.map(normalizeMonth),
          });
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {}
  }, [store, hydrated]);

  const updateAccount = useCallback(
    (fn: (a: AccountProfile) => AccountProfile) => {
      setStore((s) => ({
        ...s,
        accounts: s.accounts.map((a) =>
          a.id === s.currentId ? fn(normalizeMonth(a)) : a
        ),
      }));
    },
    []
  );

  const pushActivity = (
    a: AccountProfile,
    label: string
  ): AccountProfile => ({
    ...a,
    activity: [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label, at: Date.now() },
      ...a.activity,
    ].slice(0, 30),
  });

  const addActivity = useCallback(
    (label: string) => updateAccount((a) => pushActivity(a, label)),
    [updateAccount]
  );

  const addCoins = useCallback(
    (n: number) =>
      updateAccount((a) =>
        pushActivity(
          {
            ...a,
            coins: a.coins + n,
            monthlyCoinsAdded: a.monthlyCoinsAdded + n,
          },
          `コイン +${Math.floor(n / 100_000_000) > 0 ? `${Math.floor(n / 100_000_000)}億${Math.floor((n % 100_000_000) / 10_000) > 0 ? `${Math.floor((n % 100_000_000) / 10_000)}万` : ""}枚` : `${n.toLocaleString("ja-JP")}枚`}`
        )
      ),
    [updateAccount]
  );

  const setLevel = useCallback(
    (n: number) =>
      updateAccount((a) =>
        pushActivity(
          { ...a, level: n },
          `プレイヤーレベルを Lv.${n.toLocaleString("ja-JP")} に変更`
        )
      ),
    [updateAccount]
  );

  const setHighScore = useCallback(
    (n: number) =>
      updateAccount((a) =>
        pushActivity(
          { ...a, highScore: n },
          `ハイスコアを ${n.toLocaleString("ja-JP")} に更新`
        )
      ),
    [updateAccount]
  );

  const maxTsums = useCallback(
    (ids: string[]) =>
      updateAccount((a) =>
        pushActivity(
          { ...a, maxedTsums: [...new Set([...a.maxedTsums, ...ids])] },
          `ツム${ids.length}体をレベルMAXに変更`
        )
      ),
    [updateAccount]
  );

  const spendCoins = useCallback(
    (n: number) => updateAccount((a) => ({ ...a, coins: a.coins - n })),
    [updateAccount]
  );

  const buyFreeplay = useCallback(
    () =>
      updateAccount((a) =>
        pushActivity(
          {
            ...a,
            medals: a.medals - FREEPLAY_COST_MEDALS,
            freeplayUsed: a.freeplayUsed + 1,
            freeplayUntil: Date.now() + FREEPLAY_DURATION_MS,
          },
          "フリープレイを購入(30分タイマー開始)"
        )
      ),
    [updateAccount]
  );

  const expireFreeplay = useCallback(
    () => updateAccount((a) => ({ ...a, freeplayUntil: null })),
    [updateAccount]
  );

  const collect = useCallback(
    (type: "hearts" | "medals", id?: string) =>
      updateAccount((a) => {
        const items = type === "hearts" ? a.inboxHearts : a.inboxMedals;
        const targets = id ? items.filter((i) => i.id === id) : items;
        const sum = targets.reduce((t, i) => t + i.amount, 0);
        const rest = items.filter((i) => !targets.includes(i));
        const next =
          type === "hearts"
            ? { ...a, hearts: a.hearts + sum, inboxHearts: rest }
            : { ...a, medals: a.medals + sum, inboxMedals: rest };
        return pushActivity(
          next,
          `${type === "hearts" ? "ハート" : "メダル"}を${targets.length}件受け取り(+${sum.toLocaleString("ja-JP")})`
        );
      }),
    [updateAccount]
  );

  const createGuestAccount = useCallback(() => {
    const acc = pushActivity(
      makeGuest(store.accounts.length + 1),
      "ゲストアカウントを作成"
    );
    setStore((s) => ({
      accounts: [...s.accounts, acc],
      currentId: acc.id,
    }));
    return acc;
  }, [store.accounts.length]);

  const issueTransferCode = useCallback(() => {
    const code = genCode();
    updateAccount((a) =>
      pushActivity({ ...a, transferCode: code }, "引き継ぎコードを発行")
    );
    return code;
  }, [updateAccount]);

  const loginWithCode = useCallback(
    (code: string) => {
      const hit = store.accounts.find(
        (a) => a.transferCode.toUpperCase() === code.trim().toUpperCase()
      );
      if (!hit) return false;
      setStore((s) => ({
        ...s,
        currentId: hit.id,
        accounts: s.accounts.map((a) =>
          a.id === hit.id
            ? pushActivity(a, "引き継ぎコードでログイン")
            : a
        ),
      }));
      return true;
    },
    [store.accounts]
  );

  const switchAccount = useCallback((id: string) => {
    setStore((s) => ({ ...s, currentId: id }));
  }, []);

  const account =
    store.accounts.find((a) => a.id === store.currentId) ?? store.accounts[0];

  const value = useMemo<PlayerContextValue>(
    () => ({
      account,
      accounts: store.accounts,
      hydrated,
      addActivity,
      addCoins,
      setLevel,
      setHighScore,
      maxTsums,
      spendCoins,
      buyFreeplay,
      expireFreeplay,
      collect,
      createGuestAccount,
      issueTransferCode,
      loginWithCode,
      switchAccount,
    }),
    [
      account,
      store.accounts,
      hydrated,
      addActivity,
      addCoins,
      setLevel,
      setHighScore,
      maxTsums,
      spendCoins,
      buyFreeplay,
      expireFreeplay,
      collect,
      createGuestAccount,
      issueTransferCode,
      loginWithCode,
      switchAccount,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlayer must be used within PlayerProvider");
  return v;
}
