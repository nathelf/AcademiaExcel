import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <main
        className={cn(
          "min-h-screen transition-[margin] duration-200",
          "ml-0 md:ml-64",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
