import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Pago", value: 45, color: "hsl(150, 70%, 50%)" },
  { name: "Em Aberto", value: 35, color: "hsl(40, 90%, 50%)" },
  { name: "Atrasado", value: 20, color: "hsl(0, 70%, 55%)" },
];

export function StatusContasChart() {
  return (
    <div className="kpi-card h-80">
      <h3 className="text-sm font-medium text-foreground mb-4">
        Status das Contas
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(220, 18%, 10%)",
              border: "1px solid hsl(220, 15%, 18%)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ color: "hsl(210, 20%, 95%)", fontSize: "12px" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
