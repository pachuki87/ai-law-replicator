import { Scale, Menu, Home, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  onMenuClick?: () => void;
  onHomeClick?: () => void;
  className?: string;
}

export const Header = ({ onMenuClick, onHomeClick, className }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar el estado de autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (authUser: any) => {
    setUser(authUser);
    toast({
      title: "¡Bienvenido!",
      description: "Has iniciado sesión exitosamente.",
    });
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  };

  const handleHomeClick = () => {
    console.log('🏠 Botón Inicio clickeado - Navegando a dashboard');
    console.log('🔍 onHomeClick function:', onHomeClick);

    // If we have a custom home click handler, use it (to reset to dashboard)
    if (onHomeClick) {
      onHomeClick();
    } else {
      // Fallback to navigation if no handler is provided
      navigate('/');
    }
    console.log('✅ Navegación ejecutada');
  };

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
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-primary-foreground/80 text-sm">Plataforma Jurídica Integral</span>
          </div>
          
          {/* Botones de autenticación */}
          {isLoading ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/80 text-sm hidden sm:block">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/20 bg-white/10 border border-white/20"
                onClick={handleSignOut}
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <AuthModal onAuthSuccess={handleAuthSuccess} />
          )}
          
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-white/20 bg-white/10 border border-white/20 transition-colors shadow-sm flex items-center gap-2 px-3 py-2"
            onClick={handleHomeClick}
            title="Ir al inicio"
          >
            <Home className="h-5 w-5" />
            <span className="text-sm font-medium">Inicio</span>
          </Button>
        </div>
      </div>
    </header>
  );
};