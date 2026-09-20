import { cn } from "cn";
import type { Tsum } from "@/lib/tsums";

export function TsumAvatar({
  tsum,
  size = "md",
  className,
}: {
  tsum: Tsum;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeCls =
    size === "sm"
      ? "size-9 text-lg"
      : size === "lg"
        ? "size-16 text-4xl"
        : "size-12 text-2xl";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border",
        sizeCls,
        className
      )}
      style={{
        backgroundColor: `oklch(0.35 0.08 ${tsum.hue})`,
        borderColor: `oklch(0.55 0.12 ${tsum.hue})`,
      }}
      aria-hidden
    >
      {tsum.emoji}
    </div>
  );
}
