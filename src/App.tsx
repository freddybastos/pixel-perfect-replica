import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import NovaOS from "./pages/NovaOS";
import ListaOS from "./pages/ListaOS";
import DetalheOS from "./pages/DetalheOS";
import CompartilharOS from "./pages/CompartilharOS";
import Cobranca from "./pages/Cobranca";
import AceitePublico from "./pages/AceitePublico";
import Clientes from "./pages/Clientes";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import Fiscal from "./pages/Fiscal";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/os" element={<ListaOS />} />
            <Route path="/os/nova" element={<NovaOS />} />
            <Route path="/os/:id" element={<DetalheOS />} />
            <Route path="/os/:id/compartilhar" element={<CompartilharOS />} />
            <Route path="/os/:id/cobranca" element={<Cobranca />} />
            <Route path="/aceite/:token" element={<AceitePublico />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/fiscal" element={<Fiscal />} />
            <Route path="/privacidade" element={<PoliticaPrivacidade />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
