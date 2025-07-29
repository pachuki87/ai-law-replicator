import { 
  FileText, 
  Search, 
  MessageSquare, 
  FolderOpen, 
  TrendingUp, 
  Shield, 
  Home,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
  isOpen: boolean;
  className?: string;
}

const modules = [
  { id: "dashboard", name: "Dashboard", icon: Home },
  { id: "documents", name: "Automatización de Documentos", icon: FileText },
  { id: "research", name: "Investigación Jurídica", icon: Search },
  { id: "assistant", name: "Asistente IA", icon: MessageSquare },
  { id: "cases", name: "Gestión de Casos", icon: FolderOpen },
  { id: "predictions", name: "Predicción de Resultados", icon: TrendingUp },
  { id: "compliance", name: "Compliance", icon: Shield },
  { id: "settings", name: "Configuración", icon: Settings }
];

export const Sidebar = ({ activeModule, onModuleChange, isOpen, className }: SidebarProps) => {
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
              onClick={() => onModuleChange(module.id)}
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