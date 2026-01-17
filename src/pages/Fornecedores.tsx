import { useState } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Mail, Phone } from "lucide-react";

interface Fornecedor {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  totalGasto: number;
  totalPago: number;
  emAberto: number;
  observacoes: string;
}

const mockData: Fornecedor[] = [
  {
    id: "1",
    nome: "Distribuidor XYZ",
    cpfCnpj: "11.222.333/0001-44",
    email: "vendas@distribuidorxyz.com.br",
    telefone: "(11) 2222-3333",
    endereco: "Rua Industrial, 500 - Guarulhos/SP",
    totalGasto: 85000,
    totalPago: 72000,
    emAberto: 13000,
    observacoes: "Fornecedor principal de materiais",
  },
  {
    id: "2",
    nome: "Materiais Prime",
    cpfCnpj: "22.333.444/0001-55",
    email: "contato@materiasprime.com",
    telefone: "(11) 3333-4444",
    endereco: "Av. Industrial, 1500 - Osasco/SP",
    totalGasto: 62000,
    totalPago: 62000,
    emAberto: 0,
    observacoes: "",
  },
  {
    id: "3",
    nome: "Logística Express",
    cpfCnpj: "33.444.555/0001-66",
    email: "operacoes@logisticaexpress.com.br",
    telefone: "(21) 4444-5555",
    endereco: "Rod. Presidente Dutra, Km 200 - Resende/RJ",
    totalGasto: 45000,
    totalPago: 38000,
    emAberto: 7000,
    observacoes: "Contrato de frete mensal",
  },
  {
    id: "4",
    nome: "Insumos Tech",
    cpfCnpj: "44.555.666/0001-77",
    email: "comercial@insumostech.com.br",
    telefone: "(19) 5555-6666",
    endereco: "Parque Tecnológico, 100 - Campinas/SP",
    totalGasto: 38000,
    totalPago: 38000,
    emAberto: 0,
    observacoes: "Componentes eletrônicos",
  },
  {
    id: "5",
    nome: "Energia Plus",
    cpfCnpj: "55.666.777/0001-88",
    email: "atendimento@energiaplus.com.br",
    telefone: "(11) 6666-7777",
    endereco: "Av. Energia, 2000 - São Paulo/SP",
    totalGasto: 34000,
    totalPago: 28000,
    emAberto: 6000,
    observacoes: "Conta de energia + solar",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function Fornecedores() {
  const [data] = useState<Fornecedor[]>(mockData);

  const columns: Column<Fornecedor>[] = [
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
      key: "totalGasto",
      header: "Total Gasto",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-foreground">
          {formatCurrency(item.totalGasto)}
        </span>
      ),
    },
    {
      key: "totalPago",
      header: "Total Pago",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-primary">
          {formatCurrency(item.totalPago)}
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
            item.emAberto > 0 ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {formatCurrency(item.emAberto)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: () => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-accent hover:text-accent"
          >
            <Eye className="h-4 w-4" />
          </Button>
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

  const totalEmAberto = data.reduce((sum, item) => sum + item.emAberto, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Fornecedores
          </h1>
          <p className="text-muted-foreground">
            Cadastro e histórico de fornecedores
          </p>
        </div>
        <div className="flex gap-4">
          <div className="kpi-card px-6">
            <p className="text-sm text-muted-foreground">Total Fornecedores</p>
            <p className="text-xl font-semibold text-foreground">{data.length}</p>
          </div>
          <div className="kpi-card px-6">
            <p className="text-sm text-muted-foreground">Total a Pagar</p>
            <p className="text-xl font-semibold text-destructive">
              {formatCurrency(totalEmAberto)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        title="Cadastro de Fornecedores"
        onAdd={() => console.log("Add new supplier")}
        onExport={() => console.log("Export suppliers")}
        searchPlaceholder="Buscar por nome, CNPJ, email..."
      />
    </div>
  );
}
