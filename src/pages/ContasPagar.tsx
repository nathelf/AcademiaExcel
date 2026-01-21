import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EditableCell } from "@/components/ui/EditableCell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ContaPagarModal } from "@/components/contas/ContaPagarModal";
import { ConfirmPaymentModal } from "@/components/contas/ConfirmPaymentModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContaPagar {
  id: string;
  data_lancamento: string;
  data_vencimento: string;
  fornecedor_id: string | null;
  fornecedor_nome: string | null;
  descricao: string;
  categoria_id: string | null;
  categoria_nome: string | null;
  subcategoria_id: string | null;
  subcategoria_nome: string | null;
  centro_custo_id: string | null;
  centro_custo_nome: string | null;
  valor: number;
  forma_pagamento_id: string | null;
  forma_pagamento_nome: string | null;
  numero_documento: string | null;
  status: "pago" | "pendente" | "atrasado";
  data_pagamento: string | null;
  observacoes: string | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString("pt-BR");
};

export default function ContasPagar() {
  const { empresaId, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ContaPagar[]>([]);
  const [subcategorias, setSubcategorias] = useState<
    { id: string; nome: string; categoria_id: string }[]
  >([]);
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState(
    searchParams.get("subcategoria") ?? "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ContaPagar | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    contaId: string;
    descricao: string;
    valor: number;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string } | null>(null);

  const fetchData = async () => {
    if (!empresaId) return;

    setIsLoading(true);
    const [contasRes, subcategoriasRes] = await Promise.all([
      supabase
        .from("contas_pagar")
        .select(`
          *,
          fornecedores(nome),
          categorias(nome),
          subcategorias(nome),
          centros_custo(nome),
          formas_pagamento(nome)
        `)
        .order("data_vencimento", { ascending: true }),
      supabase
        .from("subcategorias")
        .select("id, nome, categoria_id")
        .eq("empresa_id", empresaId)
        .order("nome"),
    ]);

    if (contasRes.error) {
      toast.error("Erro ao carregar dados: " + contasRes.error.message);
      setIsLoading(false);
      return;
    }

    if (subcategoriasRes.error) {
      toast.error("Erro ao carregar subcategorias: " + subcategoriasRes.error.message);
    } else if (subcategoriasRes.data) {
      setSubcategorias(subcategoriasRes.data);
    }

    // Check for overdue status
    const today = new Date().toISOString().split('T')[0];
    const processedData = (contasRes.data || []).map((conta) => {
      let status = conta.status;
      if (status === 'pendente' && conta.data_vencimento < today) {
        status = 'atrasado';
      }
      return {
        id: conta.id,
        data_lancamento: conta.data_lancamento,
        data_vencimento: conta.data_vencimento,
        fornecedor_id: conta.fornecedor_id,
        fornecedor_nome: conta.fornecedores?.nome || null,
        descricao: conta.descricao,
        categoria_id: conta.categoria_id,
        categoria_nome: conta.categorias?.nome || null,
        subcategoria_id: conta.subcategoria_id,
        subcategoria_nome: conta.subcategorias?.nome || null,
        centro_custo_id: conta.centro_custo_id,
        centro_custo_nome: conta.centros_custo?.nome || null,
        valor: Number(conta.valor),
        forma_pagamento_id: conta.forma_pagamento_id,
        forma_pagamento_nome: conta.formas_pagamento?.nome || null,
        numero_documento: conta.numero_documento,
        status: status as "pago" | "pendente" | "atrasado",
        data_pagamento: conta.data_pagamento,
        observacoes: conta.observacoes,
      };
    });

    setData(processedData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (empresaId) {
      fetchData();
    }
  }, [empresaId]);

  useEffect(() => {
    if (!authLoading && !empresaId) {
      setIsLoading(false);
    }
  }, [authLoading, empresaId]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (subcategoriaFiltro === "all") {
      params.delete("subcategoria");
    } else {
      params.set("subcategoria", subcategoriaFiltro);
    }
    setSearchParams(params, { replace: true });
  }, [subcategoriaFiltro, searchParams, setSearchParams]);

  const handleEdit = (item: ContaPagar) => {
    setEditData(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contas_pagar").delete().eq("id", id);
    
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    
    toast.success("Conta excluída com sucesso!");
    fetchData();
    setDeleteDialog(null);
  };

  const handleInlineUpdate = async (id: string, field: string, value: string) => {
    const updateData: Record<string, unknown> = {};
    
    if (field === 'valor') {
      updateData[field] = parseFloat(value.replace(',', '.'));
    } else if (field === "subcategoria_id") {
      updateData[field] = value === "none" ? null : value;
    } else {
      updateData[field] = value;
    }

    const { error } = await supabase
      .from("contas_pagar")
      .update(updateData)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      return;
    }

    toast.success("Atualizado com sucesso!");
    fetchData();
  };

  const columns: Column<ContaPagar>[] = [
    {
      key: "data_lancamento",
      header: "Lançamento",
      sortable: true,
      render: (item) => (
        <EditableCell
          value={item.data_lancamento}
          type="date"
          onSave={(value) => handleInlineUpdate(item.id, "data_lancamento", value)}
        />
      ),
    },
    {
      key: "data_vencimento",
      header: "Vencimento",
      sortable: true,
      render: (item) => (
        <EditableCell
          value={item.data_vencimento}
          type="date"
          onSave={(value) => handleInlineUpdate(item.id, "data_vencimento", value)}
        />
      ),
    },
    {
      key: "fornecedor_nome",
      header: "Fornecedor",
      sortable: true,
      render: (item) => item.fornecedor_nome || "-",
    },
    {
      key: "descricao",
      header: "Descrição",
      render: (item) => (
        <EditableCell
          value={item.descricao}
          onSave={(value) => handleInlineUpdate(item.id, "descricao", value)}
        />
      ),
    },
    {
      key: "categoria_nome",
      header: "Categoria",
      sortable: true,
      render: (item) => item.categoria_nome || "-",
    },
    {
      key: "subcategoria_nome",
      header: "Subcategoria",
      sortable: true,
      render: (item) => {
        const options = subcategorias.filter(
          (sub) => sub.categoria_id === item.categoria_id
        );
        return (
          <Select
            value={item.subcategoria_id || "none"}
            onValueChange={(value) => handleInlineUpdate(item.id, "subcategoria_id", value)}
            disabled={!item.categoria_id}
          >
            <SelectTrigger className="h-8 bg-background">
              <SelectValue
                placeholder={item.categoria_id ? "Selecione" : "Sem categoria"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem subcategoria</SelectItem>
              {options.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      key: "centro_custo_nome",
      header: "Centro de Custo",
      render: (item) => item.centro_custo_nome || "-",
    },
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
    {
      key: "forma_pagamento_nome",
      header: "Pagamento",
      render: (item) => item.forma_pagamento_nome || "-",
    },
    {
      key: "numero_documento",
      header: "Nº Doc",
      render: (item) => (
        <EditableCell
          value={item.numero_documento || ""}
          onSave={(value) => handleInlineUpdate(item.id, "numero_documento", value)}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "data_pagamento",
      header: "Dt. Pagamento",
      render: (item) =>
        item.data_pagamento ? formatDate(item.data_pagamento) : "-",
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
              onClick={() =>
                setPaymentModal({
                  open: true,
                  contaId: item.id,
                  descricao: item.descricao,
                  valor: item.valor,
                })
              }
              title="Marcar como pago"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => handleEdit(item)}
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteDialog({ open: true, id: item.id })}
            title="Excluir"
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

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!empresaId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          Empresa não identificada. Verifique o cadastro do usuário.
        </div>
      </div>
    );
  }

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
        onAdd={() => {
          setEditData(null);
          setModalOpen(true);
        }}
        onExport={(filteredData) =>
          toast.info(`Exportação em desenvolvimento (${filteredData.length} registros)`)
        }
        searchPlaceholder="Buscar por fornecedor, descrição..."
        filterKey="subcategoria_id"
        filterValue={subcategoriaFiltro}
        onFilterChange={setSubcategoriaFiltro}
        filterPlaceholder="Subcategoria"
        filterOptions={[
          { value: "all", label: "Todas as Subcategorias" },
          ...subcategorias.map((sub) => ({
            value: sub.id,
            label: sub.nome,
          })),
        ]}
      />

      {/* Modal */}
      <ContaPagarModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSuccess={fetchData}
        editData={editData}
      />

      {/* Confirm Payment Modal */}
      {paymentModal && (
        <ConfirmPaymentModal
          open={paymentModal.open}
          onClose={() => setPaymentModal(null)}
          onSuccess={fetchData}
          type="pagar"
          contaId={paymentModal.contaId}
          descricao={paymentModal.descricao}
          valor={paymentModal.valor}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog?.open}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
