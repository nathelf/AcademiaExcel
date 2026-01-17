import { cn } from "@/lib/utils";

interface TopListItem {
  name: string;
  value: number;
}

interface TopListProps {
  title: string;
  items: TopListItem[];
  type: "client" | "supplier";
}

export function TopList({ title, items, type }: TopListProps) {
  const maxValue = Math.max(...items.map((item) => item.value));

  return (
    <div className="kpi-card">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground truncate max-w-[150px]">
                {item.name}
              </span>
              <span className="text-muted-foreground font-mono">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.value)}
              </span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  type === "client" ? "bg-primary" : "bg-accent"
                )}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
