import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

interface ConfirmPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: "pagar" | "receber";
  contaId: string;
  descricao: string;
  valor: number;
}

export function ConfirmPaymentModal({
  open,
  onClose,
  onSuccess,
  type,
  contaId,
  descricao,
  valor,
}: ConfirmPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dataPayment, setDataPayment] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const handleConfirm = async () => {
    setIsLoading(true);

    const table = type === "pagar" ? "contas_pagar" : "contas_receber";
    const dateField = type === "pagar" ? "data_pagamento" : "data_recebimento";

    const { error } = await supabase
      .from(table)
      .update({
        status: "pago",
        [dateField]: dataPayment,
      })
      .eq("id", contaId);

    setIsLoading(false);

    if (error) {
      toast.error("Erro ao confirmar: " + error.message);
      return;
    }

    toast.success(
      type === "pagar" 
        ? "Pagamento confirmado com sucesso!" 
        : "Recebimento confirmado com sucesso!"
    );
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {type === "pagar" ? "Confirmar Pagamento" : "Confirmar Recebimento"}
          </DialogTitle>
          <DialogDescription>
            {type === "pagar"
              ? "Confirme que esta conta foi paga."
              : "Confirme que este valor foi recebido."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Descrição</p>
            <p className="font-medium text-foreground">{descricao}</p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="text-xl font-semibold text-primary">
              {formatCurrency(valor)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-payment">
              {type === "pagar" ? "Data do Pagamento" : "Data do Recebimento"}
            </Label>
            <Input
              id="data-payment"
              type="date"
              value={dataPayment}
              onChange={(e) => setDataPayment(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirmando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
