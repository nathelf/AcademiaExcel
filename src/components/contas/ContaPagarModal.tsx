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
  data_lancamento: z.string().min(1, "Data de lançamento é obrigatória"),
  data_vencimento: z.string().min(1, "Data de vencimento é obrigatória"),
  fornecedor_id: z.string().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória").max(500),
  categoria_id: z.string().optional(),
  centro_custo_id: z.string().optional(),
  valor: z.string().min(1, "Valor é obrigatório"),
  forma_pagamento_id: z.string().optional(),
  numero_documento: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ContaPagarModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    id: string;
    data_lancamento: string;
    data_vencimento: string;
    fornecedor_id: string | null;
    descricao: string;
    categoria_id: string | null;
    centro_custo_id: string | null;
    valor: number;
    forma_pagamento_id: string | null;
    numero_documento: string | null;
    observacoes: string | null;
  } | null;
}

export function ContaPagarModal({ open, onClose, onSuccess, editData }: ContaPagarModalProps) {
  const { empresaId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fornecedores, setFornecedores] = useState<{ id: string; nome: string }[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<{ id: string; nome: string }[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<{ id: string; nome: string }[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_lancamento: new Date().toISOString().split('T')[0],
      data_vencimento: "",
      fornecedor_id: "",
      descricao: "",
      categoria_id: "",
      centro_custo_id: "",
      valor: "",
      forma_pagamento_id: "",
      numero_documento: "",
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
        data_lancamento: editData.data_lancamento,
        data_vencimento: editData.data_vencimento,
        fornecedor_id: editData.fornecedor_id || "",
        descricao: editData.descricao,
        categoria_id: editData.categoria_id || "",
        centro_custo_id: editData.centro_custo_id || "",
        valor: editData.valor.toString(),
        forma_pagamento_id: editData.forma_pagamento_id || "",
        numero_documento: editData.numero_documento || "",
        observacoes: editData.observacoes || "",
      });
    } else {
      form.reset({
        data_lancamento: new Date().toISOString().split('T')[0],
        data_vencimento: "",
        fornecedor_id: "",
        descricao: "",
        categoria_id: "",
        centro_custo_id: "",
        valor: "",
        forma_pagamento_id: "",
        numero_documento: "",
        observacoes: "",
      });
    }
  }, [editData, open]);

  const loadSelectOptions = async () => {
    const [fornecedoresRes, categoriasRes, centrosCustoRes, formasPagamentoRes] = await Promise.all([
      supabase.from('fornecedores').select('id, nome').order('nome'),
      supabase.from('categorias').select('id, nome').in('tipo', ['despesa', 'ambos']).order('nome'),
      supabase.from('centros_custo').select('id, nome').order('nome'),
      supabase.from('formas_pagamento').select('id, nome').order('nome'),
    ]);

    if (fornecedoresRes.data) setFornecedores(fornecedoresRes.data);
    if (categoriasRes.data) setCategorias(categoriasRes.data);
    if (centrosCustoRes.data) setCentrosCusto(centrosCustoRes.data);
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
      data_lancamento: data.data_lancamento,
      data_vencimento: data.data_vencimento,
      fornecedor_id: data.fornecedor_id || null,
      descricao: data.descricao,
      categoria_id: data.categoria_id || null,
      centro_custo_id: data.centro_custo_id || null,
      valor: parseFloat(data.valor.replace(',', '.')),
      forma_pagamento_id: data.forma_pagamento_id || null,
      numero_documento: data.numero_documento || null,
      observacoes: data.observacoes || null,
    };

    let error;

    if (editData) {
      const { error: updateError } = await supabase
        .from('contas_pagar')
        .update(payload)
        .eq('id', editData.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('contas_pagar')
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
            {editData ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data_lancamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Lançamento</FormLabel>
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
              name="fornecedor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fornecedores.map((f) => (
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
                name="centro_custo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centro de Custo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {centrosCusto.map((c) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="forma_pagamento_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="numero_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="NF, Boleto, etc." {...field} />
                  </FormControl>
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
