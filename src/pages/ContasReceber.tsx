import { useState } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle } from "lucide-react";

interface ContaReceber {
  id: string;
  dataEmissao: string;
  dataVencimento: string;
  cliente: string;
  descricao: string;
  categoria: string;
  valor: number;
  formaRecebimento: string;
  status: "pago" | "pendente" | "atrasado";
  dataRecebimento: string | null;
  observacoes: string;
}

const mockData: ContaReceber[] = [
  {
    id: "1",
    dataEmissao: "2024-01-03",
    dataVencimento: "2024-01-18",
    cliente: "Empresa ABC Ltda",
    descricao: "Serviços de consultoria",
    categoria: "Serviços",
    valor: 15000.0,
    formaRecebimento: "Transferência",
    status: "pago",
    dataRecebimento: "2024-01-17",
    observacoes: "",
  },
  {
    id: "2",
    dataEmissao: "2024-01-05",
    dataVencimento: "2024-01-20",
    cliente: "Tech Solutions",
    descricao: "Venda de produtos",
    categoria: "Produtos",
    valor: 8500.0,
    formaRecebimento: "Boleto",
    status: "pendente",
    dataRecebimento: null,
    observacoes: "Cliente pediu 3 dias de prazo",
  },
  {
    id: "3",
    dataEmissao: "2024-01-01",
    dataVencimento: "2024-01-10",
    cliente: "Comércio Delta",
    descricao: "Manutenção mensal",
    categoria: "Manutenção",
    valor: 3200.0,
    formaRecebimento: "PIX",
    status: "atrasado",
    dataRecebimento: null,
    observacoes: "Entrar em contato",
  },
  {
    id: "4",
    dataEmissao: "2024-01-10",
    dataVencimento: "2024-01-25",
    cliente: "Indústria Beta",
    descricao: "Projeto customizado",
    categoria: "Projetos",
    valor: 25000.0,
    formaRecebimento: "Transferência",
    status: "pendente",
    dataRecebimento: null,
    observacoes: "Pagamento parcelado 2x",
  },
  {
    id: "5",
    dataEmissao: "2024-01-12",
    dataVencimento: "2024-01-27",
    cliente: "Serviços Gama",
    descricao: "Licença de software",
    categoria: "Software",
    valor: 4800.0,
    formaRecebimento: "Cartão de Crédito",
    status: "pago",
    dataRecebimento: "2024-01-26",
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

export default function ContasReceber() {
  const [data] = useState<ContaReceber[]>(mockData);

  const columns: Column<ContaReceber>[] = [
    {
      key: "dataEmissao",
      header: "Emissão",
      sortable: true,
      render: (item) => formatDate(item.dataEmissao),
    },
    {
      key: "dataVencimento",
      header: "Vencimento",
      sortable: true,
      render: (item) => formatDate(item.dataVencimento),
    },
    { key: "cliente", header: "Cliente", sortable: true },
    { key: "descricao", header: "Descrição" },
    { key: "categoria", header: "Categoria", sortable: true },
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
    { key: "formaRecebimento", header: "Recebimento" },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "dataRecebimento",
      header: "Dt. Recebimento",
      render: (item) =>
        item.dataRecebimento ? formatDate(item.dataRecebimento) : "-",
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

  const totalAReceber = data
    .filter((item) => item.status !== "pago")
    .reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Contas a Receber
          </h1>
          <p className="text-muted-foreground">
            Acompanhe suas receitas e recebimentos
          </p>
        </div>
        <div className="kpi-card px-6">
          <p className="text-sm text-muted-foreground">Total a Receber</p>
          <p className="text-xl font-semibold text-primary">
            {formatCurrency(totalAReceber)}
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
        searchPlaceholder="Buscar por cliente, descrição..."
      />
    </div>
  );
}
