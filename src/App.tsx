import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Entradas from "./pages/Entradas";
import Saidas from "./pages/Saidas";
import Categorias from "./pages/Categorias";
import Tarefas from "./pages/Tarefas";
import Cartoes from "./pages/Cartoes";
import ContasPagar from "./pages/ContasPagar";
import ContasReceber from "./pages/ContasReceber";
import Configuracoes from "./pages/Configuracoes";
import ConfiguracoesContas from "./pages/ConfiguracoesContas";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/entradas" element={<Layout><Entradas /></Layout>} />
          <Route path="/saidas" element={<Layout><Saidas /></Layout>} />
          <Route path="/categorias" element={<Layout><Categorias /></Layout>} />
          <Route path="/tarefas" element={<Layout><Tarefas /></Layout>} />
          <Route path="/configuracoes/cartoes" element={<Layout><Cartoes /></Layout>} />
          <Route path="/contas/pagar" element={<Layout><ContasPagar /></Layout>} />
          <Route path="/contas/receber" element={<Layout><ContasReceber /></Layout>} />

          <Route path="/configuracoes/contas" element={<Layout><ConfiguracoesContas /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
