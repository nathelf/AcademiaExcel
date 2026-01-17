import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  data_emissao: z.string().min(1, "Data de emissão é obrigatória"),
  data_vencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  cliente_id: z.string().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória").max(500),
  categoria_id: z.string().optional(),
  valor: z.string().min(1, "Valor é obrigatório"),
  forma_pagamento_id: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ContaReceberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    id: string;
    data_emissao: string;
    data_vencimento: string;
    cliente_id: string | null;
    descricao: string;
    categoria_id: string | null;
    valor: number;
    forma_pagamento_id: string | null;
    observacoes: string | null;
  } | null;
}

export function ContaReceberModal({ open, onClose, onSuccess, editData }: ContaReceberModalProps) {
  const { empresaId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clientes, setClientes] = useState<{ id: string; nome: string }[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<{ id: string; nome: string }[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_emissao: new Date().toISOString().split('T')[0],
      data_vencimento: "",
      cliente_id: "",
      descricao: "",
      categoria_id: "",
      valor: "",
      forma_pagamento_id: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (open && empresaId) {
      loadSelectOptions();
    }
  }, [open, empresaId]);

  useEffect(() => {
    if (editData) {
      form.reset({
        data_emissao: editData.data_emissao,
        data_vencimento: editData.data_vencimento,
        cliente_id: editData.cliente_id || "",
        descricao: editData.descricao,
        categoria_id: editData.categoria_id || "",
        valor: editData.valor.toString(),
        forma_pagamento_id: editData.forma_pagamento_id || "",
        observacoes: editData.observacoes || "",
      });
    } else {
      form.reset({
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: "",
        cliente_id: "",
        descricao: "",
        categoria_id: "",
        valor: "",
        forma_pagamento_id: "",
        observacoes: "",
      });
    }
  }, [editData, open]);

  const loadSelectOptions = async () => {
    const [clientesRes, categoriasRes, formasPagamentoRes] = await Promise.all([
      supabase.from('clientes').select('id, nome').order('nome'),
      supabase.from('categorias').select('id, nome').in('tipo', ['receita', 'ambos']).order('nome'),
      supabase.from('formas_pagamento').select('id, nome').order('nome'),
    ]);

    if (clientesRes.data) setClientes(clientesRes.data);
    if (categoriasRes.data) setCategorias(categoriasRes.data);
    if (formasPagamentoRes.data) setFormasPagamento(formasPagamentoRes.data);
  };

  const onSubmit = async (data: FormData) => {
    if (!empresaId) {
      toast.error("Erro: empresa não identificada");
      return;
    }

    setIsLoading(true);

    const payload = {
      empresa_id: empresaId,
      data_emissao: data.data_emissao,
      data_vencimento: data.data_vencimento,
      cliente_id: data.cliente_id || null,
      descricao: data.descricao,
      categoria_id: data.categoria_id || null,
      valor: parseFloat(data.valor.replace(',', '.')),
      forma_pagamento_id: data.forma_pagamento_id || null,
      observacoes: data.observacoes || null,
    };

    let error;

    if (editData) {
      const { error: updateError } = await supabase
        .from('contas_receber')
        .update(payload)
        .eq('id', editData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('contas_receber')
        .insert(payload);
      error = insertError;
    }

    setIsLoading(false);

    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }

    toast.success(editData ? "Conta atualizada com sucesso!" : "Conta criada com sucesso!");
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Editar Conta a Receber" : "Nova Conta a Receber"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_emissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Emissão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_vencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cliente_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição da conta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="0,00" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="forma_pagamento_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Recebimento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formasPagamento.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
