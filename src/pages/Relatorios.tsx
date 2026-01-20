import { Calendar, Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reports = [
  {
    id: "financial",
    title: "Relatório Financeiro Geral",
    description: "Visão consolidada de contas a pagar e receber",
    icon: FileText,
  },
  {
    id: "cashflow",
    title: "Fluxo de Caixa",
    description: "Entradas e saídas por período",
    icon: FileSpreadsheet,
  },
  {
    id: "clients",
    title: "Relatório de Clientes",
    description: "Faturamento e inadimplência por cliente",
    icon: FileText,
  },
  {
    id: "suppliers",
    title: "Relatório de Fornecedores",
    description: "Gastos e pagamentos por fornecedor",
    icon: FileSpreadsheet,
  },
];

export default function Relatorios() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios financeiros detalhados
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="mes">
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Este Trimestre</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pago">Pagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="atrasado">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              <SelectItem value="1">Empresa ABC Ltda</SelectItem>
              <SelectItem value="2">Tech Solutions</SelectItem>
              <SelectItem value="3">Comércio Delta</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Fornecedores</SelectItem>
              <SelectItem value="1">Distribuidor XYZ</SelectItem>
              <SelectItem value="2">Materiais Prime</SelectItem>
              <SelectItem value="3">Logística Express</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="p-6 bg-card border-border hover:border-primary/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {report.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => toast.info(`Exportar ${report.title} em Excel`)}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => toast.info(`Exportar ${report.title} em PDF`)}
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Preview */}
      <Card className="p-6 bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">
          Prévia do Período Selecionado
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-2xl font-semibold text-primary">R$ 125.800</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-2xl font-semibold text-destructive">R$ 78.450</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="text-2xl font-semibold text-foreground">R$ 47.350</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Transações</p>
            <p className="text-2xl font-semibold text-accent">142</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
