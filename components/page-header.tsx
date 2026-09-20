import { cn } from "cn";

export function PageHeader({
  icon: Icon,
  iconCls,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  iconCls?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border",
            iconCls ?? "border-primary/25 bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
