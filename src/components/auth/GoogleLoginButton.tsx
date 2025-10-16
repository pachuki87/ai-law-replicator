import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  // Obtener el client ID desde las variables de entorno
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Forzar uso del método OAuth de redirección temporalmente
  // Comentar esta línea cuando la configuración de Google OAuth esté completa
  const useOAuthRedirect = true;

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      const error = new Error('No se recibió credencial de Google');
      handleError(error);
      return;
    }

    setIsLoading(true);
    try {
      // Usar signInWithIdToken según la documentación de Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente con Google.",
      });

      onSuccess?.(data.user);
    } catch (error: any) {
      console.error('Error en login con Google:', error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    const error = new Error('Error al iniciar sesión con Google');
    handleError(error);
  };

  const handleError = (error: any) => {
    toast({
      title: "Error de autenticación",
      description: error.message || "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
      variant: "destructive",
    });
    onError?.(error);
  };

  // Método alternativo usando signInWithOAuth para redirección con PKCE
  const handleOAuthLogin = async () => {
    setIsLoading(true);
    try {
      console.log('Iniciando OAuth login con PKCE...');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          redirectTo: `${window.location.origin}/auth/callback`,
          // No necesitamos queryParams adicionales con PKCE ya que Supabase maneja el flujo
          skipBrowserRedirect: false // Importante para PKCE
        }
      });

      if (error) {
        throw error;
      }
      
      // No necesitamos establecer isLoading a false aquí porque la redirección ocurrirá
      // y el componente se desmontará
    } catch (error: any) {
      console.error('Error en OAuth login:', error);
      handleError(error);
      setIsLoading(false);
    }
  };

  // Si no hay client ID configurado o forzar OAuth redirect, usar el método OAuth de redirección
  if (!googleClientId || useOAuthRedirect) {
    return (
      <Button
        onClick={handleOAuthLogin}
        disabled={disabled || isLoading}
        variant="outline"
        className="w-full flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
      </Button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          auto_select={false}
          theme="outline"
          size="large"
          width="100%"
          text="continue_with"
          locale="es"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;