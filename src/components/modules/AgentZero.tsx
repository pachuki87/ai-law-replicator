import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Bot, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentZeroProps {
  className?: string;
}

export const AgentZero = ({ className }: AgentZeroProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const AGENT_ZERO_URL = "http://localhost:8081";

  useEffect(() => {
    checkAgentZeroStatus();
  }, []);

  const checkAgentZeroStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(AGENT_ZERO_URL, {
        method: 'GET',
        mode: 'no-cors' // Para evitar problemas de CORS en la verificación
      });
      
      setIsConnected(true);
      toast({
        title: "Agent Zero Conectado",
        description: "La conexión con Agent Zero se ha establecido correctamente.",
      });
    } catch (err) {
      setError("No se pudo conectar con Agent Zero. Asegúrate de que esté ejecutándose en el puerto 8081.");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(AGENT_ZERO_URL, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-legal-primary" />
          <span className="ml-2 text-lg">Conectando con Agent Zero...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-legal-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agent Zero</h1>
            <p className="text-muted-foreground">Asistente de IA Avanzado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Conectado
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Desconectado
              </>
            )}
          </Badge>
          <Button onClick={checkAgentZeroStatus} variant="outline" size="sm">
            Verificar Conexión
          </Button>
          <Button onClick={openInNewTab} variant="legal" size="sm" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir en Nueva Pestaña
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {isConnected && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Agent Zero está funcionando correctamente. Puedes interactuar con él a través del iframe o abrirlo en una nueva pestaña.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card className="h-[calc(100vh-300px)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Interfaz de Agent Zero
          </CardTitle>
          <CardDescription>
            Interactúa directamente con Agent Zero desde esta interfaz integrada.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isConnected ? (
            <iframe
              src={AGENT_ZERO_URL}
              className="w-full h-full border-0 rounded-b-lg"
              title="Agent Zero Interface"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              style={{ minHeight: '600px' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Agent Zero No Disponible</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                No se pudo establecer conexión con Agent Zero. Asegúrate de que el contenedor esté ejecutándose.
              </p>
              <div className="space-y-2">
                <Button onClick={checkAgentZeroStatus} variant="legal">
                  Reintentar Conexión
                </Button>
                <p className="text-sm text-muted-foreground">
                  URL: {AGENT_ZERO_URL}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Características</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Procesamiento de lenguaje natural avanzado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Integración con múltiples modelos de IA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Memoria persistente de conversaciones
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Herramientas especializadas para abogados
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Puerto:</strong> 8081</p>
              <p><strong>Contenedor:</strong> agent-zero-abogado</p>
              <div className="flex items-center gap-2">
                <span><strong>Estado:</strong></span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                Para configuración avanzada, consulta la documentación en AGENT_ZERO_API_SETUP.md
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentZero;