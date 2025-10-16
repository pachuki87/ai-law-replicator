import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { authService } from "@/services/authService";
import { Loader2, Mail, Lock, User } from "lucide-react";

interface AuthModalProps {
  mode: 'signin' | 'signup';
  onSuccess: () => void;
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export const AuthModal = ({ mode, onSuccess, onModeChange }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Estados para los formularios
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { user, error } = await authService.signIn(signInData);
      
      if (error) {
        throw error;
      }

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente.",
      });

      onSuccess();
      
      // Limpiar formulario
      setSignInData({ email: '', password: '' });
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "No se pudo iniciar sesión. Verifica tus credenciales.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.email || !signUpData.password || !signUpData.confirmPassword) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error en contraseña",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (signUpData.password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { user, error } = await authService.signUp({
        email: signUpData.email,
        password: signUpData.password,
        fullName: signUpData.fullName
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "¡Cuenta creada!",
        description: "Revisa tu email para confirmar tu cuenta.",
      });

      // Cambiar a la pestaña de inicio de sesión
      onModeChange('signin');
      
      // Limpiar formulario
      setSignUpData({ email: '', password: '', confirmPassword: '', fullName: '' });
    } catch (error: any) {
      toast({
        title: "Error al crear cuenta",
        description: error.message || "No se pudo crear la cuenta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = () => {
    onSuccess();
  };

  const handleGoogleError = (error: any) => {
    console.error('Error en Google login:', error);
  };

  return (
    <div className="space-y-4">
      {/* Google Login Button */}
      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        disabled={isLoading}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            O continúa con
          </span>
        </div>
      </div>

      {mode === 'signin' ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signin-email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={signInData.email}
                onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signin-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={signInData.password}
                onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-legal-primary hover:bg-legal-primary/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => onModeChange('signup')}
              className="text-legal-primary"
            >
              ¿No tienes cuenta? Regístrate
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Nombre completo (opcional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-name"
                type="text"
                placeholder="Tu nombre completo"
                className="pl-10"
                value={signUpData.fullName}
                onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={signUpData.email}
                onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={signUpData.password}
                onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signup-confirm-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={signUpData.confirmPassword}
                onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full bg-legal-primary hover:bg-legal-primary/90" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => onModeChange('signin')}
              className="text-legal-primary"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};