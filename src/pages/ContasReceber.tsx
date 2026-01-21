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
import { ContaReceberModal } from "@/components/contas/ContaReceberModal";
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

interface ContaReceber {
  id: string;
  data_emissao: string;
  data_vencimento: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  descricao: string;
  categoria_id: string | null;
  categoria_nome: string | null;
  subcategoria_id: string | null;
  subcategoria_nome: string | null;
  valor: number;
  forma_pagamento_id: string | null;
  forma_pagamento_nome: string | null;
  status: "pago" | "pendente" | "atrasado";
  data_recebimento: string | null;
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

export default function ContasReceber() {
  const { empresaId, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ContaReceber[]>([]);
  const [subcategorias, setSubcategorias] = useState<
    { id: string; nome: string; categoria_id: string }[]
  >([]);
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState(
    searchParams.get("subcategoria") ?? "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ContaReceber | null>(null);
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
        .from("contas_receber")
        .select(`
          *,
          clientes(nome),
          categorias(nome),
          subcategorias(nome),
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
        data_emissao: conta.data_emissao,
        data_vencimento: conta.data_vencimento,
        cliente_id: conta.cliente_id,
        cliente_nome: conta.clientes?.nome || null,
        descricao: conta.descricao,
        categoria_id: conta.categoria_id,
        categoria_nome: conta.categorias?.nome || null,
        subcategoria_id: conta.subcategoria_id,
        subcategoria_nome: conta.subcategorias?.nome || null,
        valor: Number(conta.valor),
        forma_pagamento_id: conta.forma_pagamento_id,
        forma_pagamento_nome: conta.formas_pagamento?.nome || null,
        status: status as "pago" | "pendente" | "atrasado",
        data_recebimento: conta.data_recebimento,
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

  const handleEdit = (item: ContaReceber) => {
    setEditData(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contas_receber").delete().eq("id", id);
    
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
      .from("contas_receber")
      .update(updateData)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      return;
    }

    toast.success("Atualizado com sucesso!");
    fetchData();
  };

  const columns: Column<ContaReceber>[] = [
    {
      key: "data_emissao",
      header: "Emissão",
      sortable: true,
      render: (item) => (
        <EditableCell
          value={item.data_emissao}
          type="date"
          onSave={(value) => handleInlineUpdate(item.id, "data_emissao", value)}
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
      key: "cliente_nome",
      header: "Cliente",
      sortable: true,
      render: (item) => item.cliente_nome || "-",
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
      header: "Recebimento",
      render: (item) => item.forma_pagamento_nome || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "data_recebimento",
      header: "Dt. Recebimento",
      render: (item) =>
        item.data_recebimento ? formatDate(item.data_recebimento) : "-",
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
              title="Marcar como recebido"
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

  const totalAReceber = data
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
        onAdd={() => {
          setEditData(null);
          setModalOpen(true);
        }}
        onExport={(filteredData) =>
          toast.info(`Exportação em desenvolvimento (${filteredData.length} registros)`)
        }
        searchPlaceholder="Buscar por cliente, descrição..."
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
      <ContaReceberModal
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
          type="receber"
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
