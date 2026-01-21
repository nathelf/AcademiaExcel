export function DfcLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
        Valores negativos
      </span>
      <span className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded bg-muted/60 border border-border" />
        Subtotais/Totais
      </span>
      <span>AV% = análise vertical</span>
      <span>AH% = análise horizontal</span>
    </div>
  );
}
