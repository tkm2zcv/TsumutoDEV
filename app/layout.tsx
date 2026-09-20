import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { PlayerProvider } from "@/lib/player-store";

export const metadata: Metadata = {
  title: "ツムツム代行パネル",
  description: "ツムツム代行作業用の管理画面(UIモック)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="antialiased">
        <PlayerProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" richColors />
        </PlayerProvider>
      </body>
    </html>
  );
}
