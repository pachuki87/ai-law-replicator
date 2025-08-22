import { useState } from "react";
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

export const LegalApp = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onModuleChange={setActiveModule} />;
      case "documents":
        return <DocumentAutomation />;
      case "research":
        return <LegalResearch />;
      case "databases":
        return <DatabasesDirectory />;
      case "assistant":
        return <AIAssistant />;
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
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          activeModule={activeModule}
          onModuleChange={(module) => {
            setActiveModule(module);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
        />
        
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 overflow-auto p-6">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};