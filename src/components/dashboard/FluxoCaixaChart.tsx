import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { mes: "Jan", receitas: 45000, despesas: 32000 },
  { mes: "Fev", receitas: 52000, despesas: 38000 },
  { mes: "Mar", receitas: 48000, despesas: 35000 },
  { mes: "Abr", receitas: 61000, despesas: 42000 },
  { mes: "Mai", receitas: 55000, despesas: 39000 },
  { mes: "Jun", receitas: 67000, despesas: 45000 },
];

export function FluxoCaixaChart() {
  return (
    <div className="kpi-card h-80">
      <h3 className="text-sm font-medium text-foreground mb-4">
        Fluxo de Caixa Mensal
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(150, 70%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(150, 70%, 50%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0, 70%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis
            dataKey="mes"
            stroke="hsl(215, 15%, 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(215, 15%, 55%)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 15%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(value)
            }
          />
          <Area
            type="monotone"
            dataKey="receitas"
            stroke="hsl(150, 70%, 50%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReceitas)"
            name="Receitas"
          />
          <Area
            type="monotone"
            dataKey="despesas"
            stroke="hsl(0, 70%, 55%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDespesas)"
            name="Despesas"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
