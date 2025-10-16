import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/modules/Dashboard";
import { DocumentAutomation } from "@/components/modules/DocumentAutomation";
import { LegalResearch } from "@/components/modules/LegalResearch";
import { DatabasesDirectory } from "@/components/modules/DatabasesDirectory";
import { AIAssistant } from "@/components/modules/AIAssistant";
import CaseManagement from "@/components/modules/CaseManagement";
import { ResultsPrediction } from "@/components/modules/ResultsPrediction";
import { Compliance } from "@/components/modules/Compliance";
import { AgentZero } from "@/components/modules/AgentZero";
import { LandingPage } from "@/components/LandingPage";
import { authService } from "@/services/authService";

export const LegalApp = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-legal-primary/5 to-primary-glow/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-legal-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onAuthenticated={handleAuthenticated} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onModuleChange={setActiveModule} />;
      case "documents":
        return <DocumentAutomation />;
      case "search":
        return (
          <div className="bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Búsqueda Avanzada</h1>
            <p className="text-primary-foreground/90">
              Redirigiendo a la página de búsqueda...
            </p>
          </div>
        );
      case "research":
        return <LegalResearch />;
      case "databases":
        return <DatabasesDirectory />;
      case "assistant":
        return <AIAssistant />;
      case "agent-zero":
        return <AgentZero />;
      case "cases":
        return <CaseManagement />;
      case "predictions":
        return <ResultsPrediction />;
      case "compliance":
        return <Compliance />;
      case "settings":
        return (
          <div className="bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground rounded-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Configuración</h1>
            <p className="text-primary-foreground/90">
              Próximamente: Configuración de la aplicación
            </p>
          </div>
        );
      default:
        return <Dashboard onModuleChange={setActiveModule} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onHomeClick={() => setActiveModule("dashboard")}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR TEMPORALMENTE OCULTO - DESCOMENTAR PARA RESTAURAR */}
        {/* 
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <Sidebar 
          activeModule={activeModule}
          onModuleChange={(module) => {
            console.log('🔥 LegalApp onModuleChange called with:', module);
            setActiveModule(module);
            // No cerrar sidebar inmediatamente para evitar interferencia
            setTimeout(() => setSidebarOpen(false), 100);
          }}
          isOpen={sidebarOpen}
        />
        */}
        
        <main className="flex-1 overflow-auto p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};