import { cn } from "@/lib/utils";

export type DfcCell = {
  valor: number;
  avPercent: number | null;
  ahPercent: number | null;
};

export type DfcRow = {
  codigo: string;
  nome: string;
  tipo: "normal" | "subtotal" | "total";
  valoresPorMes: Record<string, DfcCell>;
};

type DfcTableProps = {
  meses: string[];
  linhas: DfcRow[];
  mesReferencia: string | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatPercent = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "-";
  return `${value.toFixed(2)}%`;
};

const formatMes = (mes: string) => {
  const date = new Date(`${mes}T00:00:00`);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
};

export function DfcTable({ meses, linhas, mesReferencia }: DfcTableProps) {
  const totalGeral =
    [...linhas]
      .filter((linha) => linha.tipo === "total")
      .sort((a, b) => a.codigo.split(".").length - b.codigo.split(".").length)[0] ??
    null;

  const linhasExibidas = totalGeral
    ? linhas.filter((linha) => linha.codigo !== totalGeral.codigo)
    : linhas;

  const renderLinha = (linha: DfcRow, extraClass?: string) => {
    const nivel = linha.codigo.split(".").length - 1;
    const isHighlight = linha.tipo !== "normal";
    const referencia = mesReferencia ? linha.valoresPorMes[mesReferencia] : null;

    return (
      <tr
        key={`${linha.codigo}-${extraClass ?? "main"}`}
        className={cn(
          isHighlight && "bg-muted/40 font-semibold",
          extraClass,
          "transition-colors"
        )}
      >
        <td>
          <div
            className="flex items-center"
            style={{ paddingLeft: `${nivel * 16}px` }}
            title={linha.codigo}
          >
            <span className="text-foreground">{linha.nome}</span>
          </div>
        </td>
        {meses.map((mes) => {
          const cell = linha.valoresPorMes[mes];
          const valor = cell?.valor ?? 0;
          const isNegative = valor < 0;
          return (
            <td
              key={`${linha.codigo}-${mes}`}
              className={cn("text-right", isNegative && "text-destructive")}
            >
              {cell ? formatCurrency(valor) : "-"}
            </td>
          );
        })}
        <td className="text-right">
          {referencia ? formatPercent(referencia.avPercent) : "-"}
        </td>
        <td className="text-right">
          {referencia ? formatPercent(referencia.ahPercent) : "-"}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-x-auto">
      <table className="table-excel">
        <thead>
          <tr>
            <th className="min-w-[260px]">Linha</th>
            {meses.map((mes) => (
              <th key={mes} className="text-right min-w-[140px]">
                {formatMes(mes)}
              </th>
            ))}
            <th className="text-right min-w-[90px]">AV%</th>
            <th className="text-right min-w-[90px]">AH%</th>
          </tr>
        </thead>
        <tbody>
          {totalGeral && renderLinha(totalGeral, "sticky top-0 z-10 shadow-sm")}
          {linhasExibidas.map((linha) => renderLinha(linha))}
          {totalGeral && renderLinha(totalGeral, "sticky bottom-0 z-10 shadow-sm")}
          {linhasExibidas.length === 0 && (
            <tr>
              <td colSpan={meses.length + 3} className="text-center text-muted-foreground">
                Nenhum dado encontrado para o período selecionado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
