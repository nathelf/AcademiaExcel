import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import ContasPagar from "./pages/ContasPagar";
import ContasReceber from "./pages/ContasReceber";
import Clientes from "./pages/Clientes";
import Fornecedores from "./pages/Fornecedores";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Plano from "./pages/Plano";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper para páginas que precisam do layout
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/contas-pagar"
            element={
              <LayoutWrapper>
                <ContasPagar />
              </LayoutWrapper>
            }
          />
          <Route
            path="/contas-receber"
            element={
              <LayoutWrapper>
                <ContasReceber />
              </LayoutWrapper>
            }
          />
          <Route
            path="/clientes"
            element={
              <LayoutWrapper>
                <Clientes />
              </LayoutWrapper>
            }
          />
          <Route
            path="/fornecedores"
            element={
              <LayoutWrapper>
                <Fornecedores />
              </LayoutWrapper>
            }
          />
          <Route
            path="/relatorios"
            element={
              <LayoutWrapper>
                <Relatorios />
              </LayoutWrapper>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <LayoutWrapper>
                <Configuracoes />
              </LayoutWrapper>
            }
          />
          <Route
            path="/plano"
            element={
              <LayoutWrapper>
                <Plano />
              </LayoutWrapper>
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
