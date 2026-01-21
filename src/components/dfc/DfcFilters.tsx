import { Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DfcFiltersProps = {
  empresaId: string;
  ano: string;
  mesInicial: string;
  mesFinal: string;
  onEmpresaChange: (value: string) => void;
  onAnoChange: (value: string) => void;
  onMesInicialChange: (value: string) => void;
  onMesFinalChange: (value: string) => void;
};

const meses = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Fev" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Abr" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Ago" },
  { value: "09", label: "Set" },
  { value: "10", label: "Out" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dez" },
];

export function DfcFilters({
  empresaId,
  ano,
  mesInicial,
  mesFinal,
  onEmpresaChange,
  onAnoChange,
  onMesInicialChange,
  onMesFinalChange,
}: DfcFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="space-y-1">
          <Label htmlFor="empresa-id">Empresa</Label>
          <Input
            id="empresa-id"
            value={empresaId}
            onChange={(event) => onEmpresaChange(event.target.value)}
            className="w-72 bg-background"
            placeholder="UUID da empresa"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="dfc-ano">Ano</Label>
        <Select value={ano} onValueChange={onAnoChange}>
          <SelectTrigger id="dfc-ano" className="w-28 bg-background">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3].map((offset) => {
              const value = String(new Date().getFullYear() - offset);
              return (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div className="space-y-1">
          <Label>Período</Label>
          <div className="flex items-center gap-2">
            <Select value={mesInicial} onValueChange={onMesInicialChange}>
              <SelectTrigger className="w-24 bg-background">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">até</span>
            <Select value={mesFinal} onValueChange={onMesFinalChange}>
              <SelectTrigger className="w-24 bg-background">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
