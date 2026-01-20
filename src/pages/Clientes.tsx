import { useState } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  totalFaturado: number;
  totalRecebido: number;
  emAberto: number;
  observacoes: string;
}

const mockData: Cliente[] = [
  {
    id: "1",
    nome: "Empresa ABC Ltda",
    cpfCnpj: "12.345.678/0001-90",
    email: "contato@empresaabc.com.br",
    telefone: "(11) 3456-7890",
    endereco: "Av. Paulista, 1000 - São Paulo/SP",
    totalFaturado: 125000,
    totalRecebido: 98000,
    emAberto: 27000,
    observacoes: "Cliente desde 2020",
  },
  {
    id: "2",
    nome: "Tech Solutions",
    cpfCnpj: "23.456.789/0001-01",
    email: "financeiro@techsolutions.com",
    telefone: "(21) 2345-6789",
    endereco: "Rua Rio Branco, 500 - Rio de Janeiro/RJ",
    totalFaturado: 89000,
    totalRecebido: 89000,
    emAberto: 0,
    observacoes: "",
  },
  {
    id: "3",
    nome: "Comércio Delta",
    cpfCnpj: "34.567.890/0001-12",
    email: "compras@comerciodelta.com.br",
    telefone: "(31) 4567-8901",
    endereco: "Av. Amazonas, 750 - Belo Horizonte/MG",
    totalFaturado: 67000,
    totalRecebido: 52000,
    emAberto: 15000,
    observacoes: "Pagamento com 15 dias de atraso",
  },
  {
    id: "4",
    nome: "Indústria Beta",
    cpfCnpj: "45.678.901/0001-23",
    email: "financeiro@industriabeta.ind.br",
    telefone: "(41) 5678-9012",
    endereco: "Rod. BR-116, Km 50 - Curitiba/PR",
    totalFaturado: 210000,
    totalRecebido: 185000,
    emAberto: 25000,
    observacoes: "Contrato anual renovado",
  },
  {
    id: "5",
    nome: "Serviços Gama",
    cpfCnpj: "56.789.012/0001-34",
    email: "atendimento@servicosgama.com",
    telefone: "(51) 6789-0123",
    endereco: "Rua dos Andradas, 200 - Porto Alegre/RS",
    totalFaturado: 45000,
    totalRecebido: 45000,
    emAberto: 0,
    observacoes: "",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function Clientes() {
  const [data] = useState<Cliente[]>(mockData);

  const columns: Column<Cliente>[] = [
    { key: "nome", header: "Nome / Razão Social", sortable: true },
    { key: "cpfCnpj", header: "CPF / CNPJ" },
    {
      key: "email",
      header: "Email",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{item.email}</span>
        </div>
      ),
    },
    {
      key: "telefone",
      header: "Telefone",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{item.telefone}</span>
        </div>
      ),
    },
    {
      key: "totalFaturado",
      header: "Total Faturado",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-foreground">
          {formatCurrency(item.totalFaturado)}
        </span>
      ),
    },
    {
      key: "totalRecebido",
      header: "Total Recebido",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-primary">
          {formatCurrency(item.totalRecebido)}
        </span>
      ),
    },
    {
      key: "emAberto",
      header: "Em Aberto",
      sortable: true,
      render: (item) => (
        <span
          className={`font-mono ${
            item.emAberto > 0 ? "text-warning" : "text-muted-foreground"
          }`}
        >
          {formatCurrency(item.emAberto)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-accent hover:text-accent"
            onClick={() => toast.info(`Visualizando cliente: ${item.nome}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => toast.message(`Editar cliente: ${item.nome}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => toast.message(`Remover cliente: ${item.nome}`)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalEmAberto = data.reduce((sum, item) => sum + item.emAberto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">
            Cadastro e histórico de clientes
          </p>
        </div>
        <div className="flex gap-4">
          <div className="kpi-card px-6">
            <p className="text-sm text-muted-foreground">Total Clientes</p>
            <p className="text-xl font-semibold text-foreground">{data.length}</p>
          </div>
          <div className="kpi-card px-6">
            <p className="text-sm text-muted-foreground">Total em Aberto</p>
            <p className="text-xl font-semibold text-warning">
              {formatCurrency(totalEmAberto)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        title="Cadastro de Clientes"
        onAdd={() => toast.info("Cadastro de cliente em desenvolvimento")}
        onExport={() => toast.info("Exportação em desenvolvimento")}
        searchPlaceholder="Buscar por nome, CNPJ, email..."
      />
    </div>
  );
}
