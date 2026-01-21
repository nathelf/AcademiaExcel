import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DfcRow } from "./DfcTable";

type DfcChartsProps = {
  meses: string[];
  linhas: DfcRow[];
  receitaCodigo: string;
  despesaCodigo: string;
  onReceitaCodigo: (value: string) => void;
  onDespesaCodigo: (value: string) => void;
  linhaSelecionada: string;
  onLinhaSelecionada: (value: string) => void;
};

const formatMes = (mes: string) => {
  const date = new Date(`${mes}T00:00:00`);
  return date.toLocaleDateString("pt-BR", { month: "short" });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const findLinhaPorNome = (linhas: DfcRow[], texto: string) =>
  linhas.find((linha) => linha.nome.toLowerCase().includes(texto));

export function DfcCharts({
  meses,
  linhas,
  receitaCodigo,
  despesaCodigo,
  onReceitaCodigo,
  onDespesaCodigo,
  linhaSelecionada,
  onLinhaSelecionada,
}: DfcChartsProps) {
  const linhaReceita =
    linhas.find((linha) => linha.codigo === receitaCodigo) ??
    findLinhaPorNome(linhas, "receita") ??
    linhas[0] ??
    null;
  const linhaDespesa =
    linhas.find((linha) => linha.codigo === despesaCodigo) ??
    findLinhaPorNome(linhas, "despesa") ??
    linhas[1] ??
    null;
  const linhaEvolucao =
    linhas.find((linha) => linha.codigo === linhaSelecionada) ?? linhas[0];

  const receitaDespesaSeries = meses.map((mes) => ({
    mes: formatMes(mes),
    receitas: linhaReceita?.valoresPorMes[mes]?.valor ?? 0,
    despesas: linhaDespesa?.valoresPorMes[mes]?.valor ?? 0,
  }));

  const evolucaoSeries = meses.map((mes) => ({
    mes: formatMes(mes),
    valor: linhaEvolucao?.valoresPorMes[mes]?.valor ?? 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="kpi-card h-80">
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="text-sm font-medium text-foreground">
            Receita vs Despesa (mensal)
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={receitaCodigo} onValueChange={onReceitaCodigo}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Linha de Receita" />
              </SelectTrigger>
              <SelectContent>
                {linhas.map((linha) => (
                  <SelectItem key={linha.codigo} value={linha.codigo}>
                    {linha.codigo} - {linha.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={despesaCodigo} onValueChange={onDespesaCodigo}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder="Linha de Despesa" />
              </SelectTrigger>
              <SelectContent>
                {linhas.map((linha) => (
                  <SelectItem key={linha.codigo} value={linha.codigo}>
                    {linha.codigo} - {linha.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={receitaDespesaSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend />
            <Bar dataKey="receitas" name="Receitas" fill="hsl(var(--success))" />
            <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--destructive))" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="kpi-card h-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">
            Evolução mensal
          </h3>
          <Select value={linhaSelecionada} onValueChange={onLinhaSelecionada}>
            <SelectTrigger className="w-56 bg-background">
              <SelectValue placeholder="Linha do DFC" />
            </SelectTrigger>
            <SelectContent>
              {linhas.map((linha) => (
                <SelectItem key={linha.codigo} value={linha.codigo}>
                  {linha.codigo} - {linha.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={evolucaoSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
