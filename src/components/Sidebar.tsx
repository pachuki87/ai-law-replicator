import { 
  FileText, 
  Search, 
  MessageSquare, 
  FolderOpen, 
  TrendingUp, 
  Shield, 
  Home,
  Settings,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  className?: string;
}

const modules = [
  { id: "dashboard", name: "Dashboard", icon: Home },
  { id: "documents", name: "Automatización de Documentos", icon: FileText },
  { id: "search", name: "Búsqueda Avanzada", icon: Search, isRoute: true },
  { id: "research", name: "Investigación Jurídica", icon: Database },
  { id: "databases", name: "Bases de Datos Jurídicas", icon: Database },
  { id: "assistant", name: "Asistente IA", icon: MessageSquare },
  { id: "cases", name: "Gestión de Casos", icon: FolderOpen },
  { id: "predictions", name: "Predicción de Resultados", icon: TrendingUp },
  { id: "compliance", name: "Compliance", icon: Shield },
  { id: "settings", name: "Configuración", icon: Settings }
];

export const Sidebar = ({ activeModule, onModuleChange, isOpen, className }: SidebarProps) => {
  const navigate = useNavigate();
  
  const handleModuleClick = (module: any) => {
    if (module.isRoute) {
      navigate(`/${module.id}`);
    } else {
      onModuleChange(module.id);
    }
  };
  
  return (
    <aside className={cn(
      "bg-card border-r border-border transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-0 lg:w-16",
      "fixed lg:relative z-40 h-full overflow-hidden",
      className
    )}>
      <div className="p-4 space-y-2">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Button
              key={module.id}
              variant={isActive ? "legal" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-200",
                isActive && "shadow-md bg-gradient-to-r from-legal-primary to-primary-glow",
                !isOpen && "lg:justify-center lg:px-2"
              )}
              onClick={() => handleModuleClick(module)}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
              {isOpen && (
                <span className={cn(
                  "truncate",
                  isActive ? "text-primary-foreground font-medium" : "text-foreground"
                )}>
                  {module.name}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </aside>
  );
};