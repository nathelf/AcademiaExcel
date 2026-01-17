import {
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowDownUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { FluxoCaixaChart } from "@/components/dashboard/FluxoCaixaChart";
import { StatusContasChart } from "@/components/dashboard/StatusContasChart";
import { TopList } from "@/components/dashboard/TopList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const topClientes = [
  { name: "Empresa ABC Ltda", value: 45000 },
  { name: "Tech Solutions", value: 38000 },
  { name: "Comércio Delta", value: 32000 },
  { name: "Indústria Beta", value: 28000 },
  { name: "Serviços Gama", value: 22000 },
];

const topFornecedores = [
  { name: "Distribuidor XYZ", value: 28000 },
  { name: "Materiais Prime", value: 24000 },
  { name: "Logística Express", value: 19000 },
  { name: "Insumos Tech", value: 15000 },
  { name: "Energia Plus", value: 12000 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral financeira</p>
        </div>
        <Select defaultValue="mes">
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Esta Semana</SelectItem>
            <SelectItem value="mes">Este Mês</SelectItem>
            <SelectItem value="trimestre">Este Trimestre</SelectItem>
            <SelectItem value="ano">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="A Pagar"
          value="R$ 45.230"
          change="+12% vs mês anterior"
          changeType="negative"
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <KPICard
          title="A Receber"
          value="R$ 78.450"
          change="+8% vs mês anterior"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <KPICard
          title="Saldo Previsto"
          value="R$ 33.220"
          change="Positivo"
          changeType="positive"
          icon={ArrowDownUp}
          iconColor="text-accent"
        />
        <KPICard
          title="Saldo Realizado"
          value="R$ 28.150"
          icon={Wallet}
          iconColor="text-primary"
        />
        <KPICard
          title="Receita Total"
          value="R$ 125.800"
          change="+15% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-primary"
        />
        <KPICard
          title="Inadimplência"
          value="8.5%"
          change="-2% vs mês anterior"
          changeType="positive"
          icon={AlertTriangle}
          iconColor="text-warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FluxoCaixaChart />
        </div>
        <StatusContasChart />
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopList
          title="Top 5 Clientes"
          items={topClientes}
          type="client"
        />
        <TopList
          title="Top 5 Fornecedores"
          items={topFornecedores}
          type="supplier"
        />
      </div>
    </div>
  );
}
