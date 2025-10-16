import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthSessionMissingError } from '@supabase/supabase-js';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Primero, intentamos procesar el callback de OAuth
    const processAuthCallback = async () => {
      try {
        // Verificar si hay un hash con parámetros de OAuth en la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasAuthParams = hashParams.has('access_token') || hashParams.has('code');
        
        if (hasAuthParams) {
          // Si hay parámetros de OAuth, dejar que Supabase los procese
          // El listener onAuthStateChange manejará esto
          console.log('Procesando callback de OAuth...');
        }
        
        // Verificar si ya hay una sesión activa
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Si el error es AuthSessionMissingError, significa que aún no hay sesión
        // lo cual es esperado en un callback de OAuth
        if (error && !(error instanceof AuthSessionMissingError)) {
          throw error;
        }
        
        if (session) {
          // Si ya hay una sesión, redirigir al dashboard
          if (isMounted) {
            toast({
              title: "¡Bienvenido!",
              description: "Has iniciado sesión exitosamente con Google.",
            });
            navigate('/', { replace: true });
          }
        }
      } catch (error: any) {
        console.error('Error en callback de autenticación:', error);
        
        if (isMounted) {
          toast({
            title: "Error de autenticación",
            description: error.message || "No se pudo completar el inicio de sesión con Google.",
            variant: "destructive",
          });

          navigate('/', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    // Configurar un listener para los cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Estado de autenticación cambiado:', event);
        
        if (event === 'SIGNED_IN' && session) {
          // El usuario ha iniciado sesión correctamente
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión exitosamente con Google.",
          });

          // Redirigir al dashboard
          navigate('/', { replace: true });
          setIsProcessing(false);
        } else if (event === 'SIGNED_OUT') {
          // El usuario ha cerrado sesión
          navigate('/', { replace: true });
          setIsProcessing(false);
        }
      }
    );

    // Iniciar el procesamiento
    processAuthCallback();

    // Configurar un timeout para manejar casos donde el proceso de OAuth falla
    const timeoutId = setTimeout(() => {
      if (isMounted && isProcessing) {
        toast({
          title: "Error de autenticación",
          description: "No se pudo completar el inicio de sesión con Google. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
        navigate('/', { replace: true });
        setIsProcessing(false);
      }
    }, 10000); // 10 segundos máximo

    // Limpiar cuando el componente se desmonte
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate, toast, isProcessing]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-legal-primary/5 to-legal-secondary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-legal-primary" />
          <h2 className="text-xl font-semibold text-gray-900">
            Completando autenticación...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras procesamos tu inicio de sesión.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;