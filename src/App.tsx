import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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

// Wrapper para páginas que precisam do layout e proteção
function ProtectedLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/contas-pagar"
              element={
                <ProtectedLayoutWrapper>
                  <ContasPagar />
                </ProtectedLayoutWrapper>
              }
            />
            <Route
              path="/contas-receber"
              element={
                <ProtectedLayoutWrapper>
                  <ContasReceber />
                </ProtectedLayoutWrapper>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedLayoutWrapper>
                  <Clientes />
                </ProtectedLayoutWrapper>
              }
            />
            <Route
              path="/fornecedores"
              element={
                <ProtectedLayoutWrapper>
                  <Fornecedores />
                </ProtectedLayoutWrapper>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedLayoutWrapper>
                  <Relatorios />
                </ProtectedLayoutWrapper>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedLayoutWrapper>
                  <Configuracoes />
                </ProtectedLayoutWrapper>
              }
            />
            <Route
              path="/plano"
              element={
                <ProtectedLayoutWrapper>
                  <Plano />
                </ProtectedLayoutWrapper>
              }
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
