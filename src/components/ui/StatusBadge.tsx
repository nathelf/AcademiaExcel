import { cn } from "@/lib/utils";

type Status = "pago" | "pendente" | "atrasado" | "aberto";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pago: { label: "Pago", className: "status-paid" },
  pendente: { label: "Pendente", className: "status-pending" },
  atrasado: { label: "Atrasado", className: "status-overdue" },
  aberto: { label: "Em Aberto", className: "status-pending" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
