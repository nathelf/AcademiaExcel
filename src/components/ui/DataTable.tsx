import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  onAdd?: () => void;
  onExport?: (data: T[]) => void;
  searchPlaceholder?: string;
  filterKey?: keyof T | string;
  filterOptions?: { value: string; label: string }[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  filterAllValue?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  title,
  onAdd,
  onExport,
  searchPlaceholder = "Buscar...",
  filterKey,
  filterOptions,
  filterValue,
  onFilterChange,
  filterPlaceholder = "Filtrar...",
  filterAllValue = "all",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const baseData =
    filterKey && filterValue && filterValue !== filterAllValue
      ? data.filter((item) => String(item[filterKey as keyof T]) === filterValue)
      : data;

  const filteredData = baseData.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn as keyof T];
    const bValue = b[sortColumn as keyof T];
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64 bg-background"
            />
          </div>
          {filterOptions && filterValue !== undefined && onFilterChange && (
            <Select value={filterValue} onValueChange={onFilterChange}>
              <SelectTrigger className="w-48 bg-background">
                <SelectValue placeholder={filterPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          {onExport && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onExport(sortedData)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-excel">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  style={{ width: column.width }}
                  className={cn(column.sortable && "cursor-pointer select-none")}
                  onClick={() =>
                    column.sortable && handleSort(String(column.key))
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={String(column.key)}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
        <span>
          Mostrando {sortedData.length} de {data.length} registros
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
