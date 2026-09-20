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
      <CardContent className="flex items-start justify-between gap-2 pt-5">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 truncate text-2xl font-bold tracking-tight tabular-nums">
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
            iconCls
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}
