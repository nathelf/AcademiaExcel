import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileDown, FileUp, Users, Building2, BarChart3, Settings, CreditCard, LogOut, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  return <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Lucra +</h1>
            <p className="text-xs text-muted-foreground">Controle Financeiro</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={`nav-item ${isActive ? "nav-item-active" : ""}`}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>;
        })}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">João Demo</p>
              <p className="text-xs text-muted-foreground truncate">Empresa Demo</p>
            </div>
          </div>
          <button
            className="nav-item w-full text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
            type="button"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>;
}