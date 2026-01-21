import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileDown,
  FileUp,
  Users,
  Building2,
  BarChart3,
  Settings,
  CreditCard,
  LogOut,
  Wallet,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
const menuItems = [{
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/"
}, {
  icon: FileDown,
  label: "Contas a Pagar",
  path: "/contas-pagar"
}, {
  icon: FileUp,
  label: "Contas a Receber",
  path: "/contas-receber"
}, {
  icon: Users,
  label: "Clientes",
  path: "/clientes"
}, {
  icon: Building2,
  label: "Fornecedores",
  path: "/fornecedores"
}, {
  icon: BarChart3,
  label: "Relatórios",
  path: "/relatorios"
}, {
  icon: Settings,
  label: "Configurações",
  path: "/configuracoes"
}, {
  icon: CreditCard,
  label: "Plano / Assinatura",
  path: "/plano"
}];
interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "md:w-20" : "md:w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className={cn(isCollapsed ? "md:hidden" : "md:block")}>
            <h1 className="font-semibold text-foreground">Lucra +</h1>
            <p className="text-xs text-muted-foreground">Controle Financeiro</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground"
              type="button"
              onClick={onCloseMobile}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item",
                isActive ? "nav-item-active" : "",
                isCollapsed ? "md:justify-center md:px-2 md:gap-0" : ""
              )}
              title={item.label}
            >
                <item.icon className="h-5 w-5" />
                <span className={cn(isCollapsed ? "md:hidden" : "md:inline")}>
                  {item.label}
                </span>
              </Link>
            );
        })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
            <div className={cn("flex-1 min-w-0", isCollapsed ? "md:hidden" : "md:block")}>
              <p className="text-sm font-medium text-foreground truncate">João Demo</p>
              <p className="text-xs text-muted-foreground truncate">Empresa Demo</p>
            </div>
          </div>
          <button
            className={cn(
              "nav-item w-full text-muted-foreground hover:text-foreground",
              isCollapsed ? "md:justify-center md:px-2 md:gap-0" : ""
            )}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            type="button"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className={cn(isCollapsed ? "md:hidden" : "md:inline")}>
              {isDark ? "Modo claro" : "Modo escuro"}
            </span>
          </button>
          <button
            className={cn(
              "nav-item w-full text-muted-foreground hover:text-destructive",
              isCollapsed ? "md:justify-center md:px-2 md:gap-0" : ""
            )}
            onClick={handleSignOut}
            type="button"
          >
            <LogOut className="h-5 w-5" />
            <span className={cn(isCollapsed ? "md:hidden" : "md:inline")}>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}