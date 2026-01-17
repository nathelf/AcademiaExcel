import { useState } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle } from "lucide-react";

interface ContaPagar {
  id: string;
  dataLancamento: string;
  dataVencimento: string;
  fornecedor: string;
  descricao: string;
  categoria: string;
  centroCusto: string;
  valor: number;
  formaPagamento: string;
  numeroDocumento: string;
  status: "pago" | "pendente" | "atrasado";
  dataPagamento: string | null;
  observacoes: string;
}

const mockData: ContaPagar[] = [
  {
    id: "1",
    dataLancamento: "2024-01-05",
    dataVencimento: "2024-01-15",
    fornecedor: "Distribuidor XYZ",
    descricao: "Compra de materiais",
    categoria: "Materiais",
    centroCusto: "Operacional",
    valor: 4500.0,
    formaPagamento: "Boleto",
    numeroDocumento: "NF-001234",
    status: "pago",
    dataPagamento: "2024-01-14",
    observacoes: "",
  },
  {
    id: "2",
    dataLancamento: "2024-01-08",
    dataVencimento: "2024-01-20",
    fornecedor: "Energia Plus",
    descricao: "Conta de energia elétrica",
    categoria: "Utilidades",
    centroCusto: "Administrativo",
    valor: 2800.0,
    formaPagamento: "Débito Automático",
    numeroDocumento: "FAT-5678",
    status: "pendente",
    dataPagamento: null,
    observacoes: "Consumo acima da média",
  },
  {
    id: "3",
    dataLancamento: "2024-01-02",
    dataVencimento: "2024-01-10",
    fornecedor: "Logística Express",
    descricao: "Frete de mercadorias",
    categoria: "Transporte",
    centroCusto: "Logística",
    valor: 1200.0,
    formaPagamento: "Transferência",
    numeroDocumento: "CTE-9012",
    status: "atrasado",
    dataPagamento: null,
    observacoes: "Aguardando aprovação",
  },
  {
    id: "4",
    dataLancamento: "2024-01-10",
    dataVencimento: "2024-01-25",
    fornecedor: "Materiais Prime",
    descricao: "Insumos de produção",
    categoria: "Materiais",
    centroCusto: "Produção",
    valor: 8750.0,
    formaPagamento: "Boleto",
    numeroDocumento: "NF-003456",
    status: "pendente",
    dataPagamento: null,
    observacoes: "",
  },
  {
    id: "5",
    dataLancamento: "2024-01-12",
    dataVencimento: "2024-01-30",
    fornecedor: "Insumos Tech",
    descricao: "Componentes eletrônicos",
    categoria: "Tecnologia",
    centroCusto: "TI",
    valor: 3200.0,
    formaPagamento: "Cartão Corporativo",
    numeroDocumento: "NF-007890",
    status: "pago",
    dataPagamento: "2024-01-28",
    observacoes: "",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
};

export default function ContasPagar() {
  const [data] = useState<ContaPagar[]>(mockData);

  const columns: Column<ContaPagar>[] = [
    {
      key: "dataLancamento",
      header: "Lançamento",
      sortable: true,
      render: (item) => formatDate(item.dataLancamento),
    },
    {
      key: "dataVencimento",
      header: "Vencimento",
      sortable: true,
      render: (item) => formatDate(item.dataVencimento),
    },
    { key: "fornecedor", header: "Fornecedor", sortable: true },
    { key: "descricao", header: "Descrição" },
    { key: "categoria", header: "Categoria", sortable: true },
    { key: "centroCusto", header: "Centro de Custo" },
    {
      key: "valor",
      header: "Valor",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-foreground">
          {formatCurrency(item.valor)}
        </span>
      ),
    },
    { key: "formaPagamento", header: "Pagamento" },
    { key: "numeroDocumento", header: "Nº Doc" },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "dataPagamento",
      header: "Dt. Pagamento",
      render: (item) =>
        item.dataPagamento ? formatDate(item.dataPagamento) : "-",
    },
    {
      key: "actions",
      header: "Ações",
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.status !== "pago" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalAPagar = data
    .filter((item) => item.status !== "pago")
    .reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Contas a Pagar
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas despesas e pagamentos
          </p>
        </div>
        <div className="kpi-card px-6">
          <p className="text-sm text-muted-foreground">Total em Aberto</p>
          <p className="text-xl font-semibold text-destructive">
            {formatCurrency(totalAPagar)}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        title="Lançamentos"
        onAdd={() => console.log("Add new")}
        onExport={() => console.log("Export")}
        searchPlaceholder="Buscar por fornecedor, descrição..."
      />
    </div>
  );
}
