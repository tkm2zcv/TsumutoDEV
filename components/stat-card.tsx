import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  icon: Icon,
  iconCls,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  iconCls: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="flex items-center justify-between gap-2 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 truncate text-xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {sub && (
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg border",
            iconCls
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}
