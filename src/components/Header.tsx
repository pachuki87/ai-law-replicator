import { Scale, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export const Header = ({ onMenuClick, className }: HeaderProps) => {
  return (
    <header className={cn("bg-gradient-to-r from-legal-primary to-primary-glow shadow-lg", className)}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground hover:bg-white/10"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-legal-accent" />
            <h1 className="text-2xl font-bold text-primary-foreground">LegalAI Pro</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-primary-foreground/80 text-sm">Plataforma Jurídica Integral</span>
        </div>
      </div>
    </header>
  );
};