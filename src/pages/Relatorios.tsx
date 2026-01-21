import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { DfcFilters } from "@/components/dfc/DfcFilters";
import { DfcCharts } from "@/components/dfc/DfcCharts";
import { DfcLegend } from "@/components/dfc/DfcLegend";
import { DfcRow, DfcTable } from "@/components/dfc/DfcTable";

type DfcRowRaw = {
  empresa_id: string;
  mes: string;
  codigo: string;
  nome: string;
  tipo_linha_dfc: "normal" | "subtotal" | "total";
  valor: number;
  av_percent: number | null;
  ah_percent: number | null;
};

function DfcTableSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={`dfc-row-skeleton-${index}`}
          className="h-6 w-full animate-pulse rounded bg-muted/50"
        />
      ))}
    </div>
  );
}

function DfcChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[...Array(2)].map((_, index) => (
        <div
          key={`dfc-chart-skeleton-${index}`}
          className="kpi-card h-80 animate-pulse bg-muted/40"
        />
      ))}
    </div>
  );
}

const buildMonthRange = (ano: string, mesInicial: string, mesFinal: string) => {
  const start = Number(mesInicial);
  const end = Number(mesFinal);
  const startMonth = Math.min(start, end);
  const endMonth = Math.max(start, end);
  const meses: string[] = [];
  for (let month = startMonth; month <= endMonth; month += 1) {
    const mm = String(month).padStart(2, "0");
    meses.push(`${ano}-${mm}-01`);
  }
  return meses;
};

export default function Relatorios() {
  const { empresaId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [empresaFiltro, setEmpresaFiltro] = useState(
    searchParams.get("empresa") ?? empresaId ?? ""
  );
  const [anoFiltro, setAnoFiltro] = useState(
    searchParams.get("ano") ?? String(new Date().getFullYear())
  );
  const [mesInicial, setMesInicial] = useState(
    searchParams.get("mes_inicio") ?? "01"
  );
  const [mesFinal, setMesFinal] = useState(
    searchParams.get("mes_fim") ?? "12"
  );
  const [linhaSelecionada, setLinhaSelecionada] = useState("");
  const [receitaCodigo, setReceitaCodigo] = useState(
    searchParams.get("receita") ??
      (typeof window !== "undefined"
        ? window.localStorage.getItem("dfc_receita_codigo") ?? ""
        : "")
  );
  const [despesaCodigo, setDespesaCodigo] = useState(
    searchParams.get("despesa") ??
      (typeof window !== "undefined"
        ? window.localStorage.getItem("dfc_despesa_codigo") ?? ""
        : "")
  );

  useEffect(() => {
    if (!empresaFiltro && empresaId) {
      setEmpresaFiltro(empresaId);
    }
  }, [empresaId, empresaFiltro]);

  useEffect(() => {
    if (Number(mesFinal) < Number(mesInicial)) {
      toast.message("Mês final ajustado para o mês inicial.");
      setMesFinal(mesInicial);
    }
  }, [mesInicial, mesFinal]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (empresaFiltro) {
      params.set("empresa", empresaFiltro);
    } else {
      params.delete("empresa");
    }

    params.set("ano", anoFiltro);
    params.set("mes_inicio", mesInicial);
    params.set("mes_fim", mesFinal);
    if (linhaSelecionada) {
      params.set("linha", linhaSelecionada);
    } else {
      params.delete("linha");
    }
    if (receitaCodigo) {
      params.set("receita", receitaCodigo);
    } else {
      params.delete("receita");
    }
    if (despesaCodigo) {
      params.set("despesa", despesaCodigo);
    } else {
      params.delete("despesa");
    }

    setSearchParams(params, { replace: true });
  }, [
    empresaFiltro,
    anoFiltro,
    mesInicial,
    mesFinal,
    linhaSelecionada,
    receitaCodigo,
    despesaCodigo,
    searchParams,
    setSearchParams,
  ]);

  const meses = useMemo(
    () => buildMonthRange(anoFiltro, mesInicial, mesFinal),
    [anoFiltro, mesInicial, mesFinal]
  );

  const dfcQuery = useQuery({
    queryKey: ["dfc_mensal_av", empresaFiltro, anoFiltro, mesInicial, mesFinal],
    enabled: Boolean(empresaFiltro),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
    queryFn: async () => {
      const start = meses[0];
      const end = meses[meses.length - 1];

      const { data, error } = await supabase
        .from("dfc_mensal_av")
        .select("*")
        .eq("empresa_id", empresaFiltro)
        .gte("mes", start)
        .lte("mes", end)
        .order("codigo", { ascending: true })
        .order("mes", { ascending: true });

      if (error) {
        throw error;
      }

      return (data as DfcRowRaw[]) ?? [];
    },
  });

  useEffect(() => {
    if (dfcQuery.error) {
      toast.error("Erro ao carregar DFC: " + dfcQuery.error.message);
    }
  }, [dfcQuery.error]);
  const rows = dfcQuery.data ?? [];

  const dfcRows = useMemo(() => {
    const grouped = new Map<string, DfcRow>();
    rows.forEach((row) => {
      const key = row.codigo;
      if (!grouped.has(key)) {
        grouped.set(key, {
          codigo: row.codigo,
          nome: row.nome,
          tipo: row.tipo_linha_dfc,
          valoresPorMes: {},
        });
      }
      grouped.get(key)!.valoresPorMes[row.mes] = {
        valor: row.valor,
        avPercent: row.av_percent,
        ahPercent: row.ah_percent,
      };
    });
    return Array.from(grouped.values());
  }, [rows]);

  useEffect(() => {
    if (!linhaSelecionada && dfcRows.length > 0) {
      setLinhaSelecionada(searchParams.get("linha") ?? dfcRows[0].codigo);
    }
  }, [dfcRows, linhaSelecionada]);

  useEffect(() => {
    if (!receitaCodigo && dfcRows.length > 0) {
      const found =
        dfcRows.find((linha) => linha.nome.toLowerCase().includes("receita")) ??
        dfcRows[0];
      setReceitaCodigo(found?.codigo ?? "");
    }
  }, [dfcRows, receitaCodigo]);

  useEffect(() => {
    if (!despesaCodigo && dfcRows.length > 1) {
      const found =
        dfcRows.find((linha) => linha.nome.toLowerCase().includes("despesa")) ??
        dfcRows[1];
      setDespesaCodigo(found?.codigo ?? "");
    }
  }, [dfcRows, despesaCodigo]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (receitaCodigo) {
      window.localStorage.setItem("dfc_receita_codigo", receitaCodigo);
    }
    if (despesaCodigo) {
      window.localStorage.setItem("dfc_despesa_codigo", despesaCodigo);
    }
  }, [receitaCodigo, despesaCodigo]);

  const receitaDespesaSeries = meses.map((mes) => ({
    mes,
    receitas: dfcRows
      .find((linha) => linha.codigo === receitaCodigo)
      ?.valoresPorMes[mes]?.valor ?? 0,
    despesas: dfcRows
      .find((linha) => linha.codigo === despesaCodigo)
      ?.valoresPorMes[mes]?.valor ?? 0,
  }));

  const evolucaoSeries = meses.map((mes) => ({
    mes,
    valor:
      dfcRows
        .find((linha) => linha.codigo === linhaSelecionada)
        ?.valoresPorMes[mes]?.valor ?? 0,
  }));

  const handleExportXlsx = () => {
    if (rows.length === 0) {
      toast.message("Nenhum dado para exportar.");
      return;
    }

    const dfcSheetData = [
      [
        "empresa_id",
        "mes",
        "codigo",
        "nome",
        "tipo_linha_dfc",
        "valor",
        "av_percent",
        "ah_percent",
      ],
      ...rows.map((row) => [
        row.empresa_id,
        row.mes,
        row.codigo,
        row.nome,
        row.tipo_linha_dfc,
        row.valor,
        row.av_percent ?? "",
        row.ah_percent ?? "",
      ]),
    ];

    const filtrosSheetData = [
      ["Filtro", "Valor"],
      ["empresa_id", empresaFiltro],
      ["ano", anoFiltro],
      ["mes_inicio", mesInicial],
      ["mes_fim", mesFinal],
      ["linha", linhaSelecionada],
      ["receita_codigo", receitaCodigo],
      ["despesa_codigo", despesaCodigo],
    ];

    const chartReceitaDespesa = [
      ["mes", "receitas", "despesas"],
      ...receitaDespesaSeries.map((item) => [item.mes, item.receitas, item.despesas]),
    ];

    const chartEvolucao = [
      ["mes", "valor"],
      ...evolucaoSeries.map((item) => [item.mes, item.valor]),
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(dfcSheetData),
      "DFC"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(chartReceitaDespesa),
      "Chart_Receita_Despesa"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(chartEvolucao),
      "Chart_Evolucao"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(filtrosSheetData),
      "Filtros"
    );

    XLSX.writeFile(
      workbook,
      `dfc_${empresaFiltro}_${anoFiltro}_${mesInicial}-${mesFinal}.xlsx`
    );
  };

  const handleExportPdf = () => {
    if (rows.length === 0) {
      toast.message("Nenhum dado para exportar.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Não foi possível abrir a janela de impressão.");
      return;
    }

    const header = `
      <tr>
        <th>Linha</th>
        ${meses.map((mes) => `<th>${mes}</th>`).join("")}
        <th>AV%</th>
        <th>AH%</th>
      </tr>
    `;

    const rowsHtml = dfcRows
      .map((linha) => {
        const nivel = linha.codigo.split(".").length - 1;
        const classe = linha.tipo !== "normal" ? "highlight" : "";
        const mesRef = meses[meses.length - 1];
        const ref = mesRef ? linha.valoresPorMes[mesRef] : null;
        return `
          <tr class="${classe}">
            <td style="padding-left:${nivel * 12}px">${linha.nome}</td>
            ${meses
              .map((mes) => {
                const cell = linha.valoresPorMes[mes];
                const valor = cell?.valor ?? 0;
                const negative = valor < 0 ? "negative" : "";
                return `<td class="${negative}">${
                  cell ? valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "-"
                }</td>`;
              })
              .join("")}
            <td>${ref ? ref.avPercent?.toFixed(2) ?? "-" : "-"}</td>
            <td>${ref ? ref.ahPercent?.toFixed(2) ?? "-" : "-"}</td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>DFC</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: right; }
            th:first-child, td:first-child { text-align: left; }
            .highlight { background: #f2f2f2; font-weight: 700; }
            .negative { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h2>DFC - ${anoFiltro} (${mesInicial} a ${mesFinal})</h2>
          <table>
            <thead>${header}</thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Demonstrativo de Fluxo de Caixa (DFC)
          </h1>
          <p className="text-muted-foreground">
            Tabela mensal com análise vertical (AV) e horizontal (AH)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportXlsx}>
            <FileSpreadsheet className="h-4 w-4" />
            Excel (XLSX)
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-card border-border">
        <DfcFilters
          empresaId={empresaFiltro}
          ano={anoFiltro}
          mesInicial={mesInicial}
          mesFinal={mesFinal}
          onEmpresaChange={setEmpresaFiltro}
          onAnoChange={setAnoFiltro}
          onMesInicialChange={setMesInicial}
          onMesFinalChange={setMesFinal}
        />
      </Card>

      {dfcQuery.isLoading ? (
        <DfcTableSkeleton />
      ) : (
        <>
          <DfcLegend />
          <DfcTable
            meses={meses}
            linhas={dfcRows}
            mesReferencia={meses[meses.length - 1] ?? null}
          />
        </>
      )}

      {dfcQuery.isLoading ? (
        <DfcChartsSkeleton />
      ) : (
        <DfcCharts
          meses={meses}
          linhas={dfcRows}
          receitaCodigo={receitaCodigo}
          despesaCodigo={despesaCodigo}
          onReceitaCodigo={setReceitaCodigo}
          onDespesaCodigo={setDespesaCodigo}
          linhaSelecionada={linhaSelecionada}
          onLinhaSelecionada={setLinhaSelecionada}
        />
      )}
    </div>
  );
}
