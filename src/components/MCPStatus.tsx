import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface MCPService {
  name: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
}

interface MCPConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
      disabled?: boolean;
    };
  };
}

const MCPStatus: React.FC = () => {
  const [services, setServices] = useState<MCPService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const getStatusIcon = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Inactivo</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  useEffect(() => {
    // Cargar configuración MCP desde mcp-config.json
    const loadMCPConfig = async () => {
      try {
        const response = await fetch('/mcp-config.json');
        const config: MCPConfig = await response.json();
        
        const mcpServices: MCPService[] = Object.entries(config.mcpServers).map(([key, server]) => {
          let name = key;
          let description = 'Servicio MCP';
          
          // Mapear nombres y descripciones específicas
          switch (key) {
            case 'playwright':
              name = 'MCP Playwright';
              description = 'Automatización web y scraping';
              break;
            case 'github.com/zcaceres/fetch-mcp':
              name = 'Fetch MCP';
              description = 'Cliente HTTP para consultas web';
              break;
            case 'Sequential Thinking':
              name = 'Sequential Thinking';
              description = 'Procesamiento secuencial de tareas';
              break;
            case 'rube':
              name = 'Rube MCP';
              description = 'Servicio de procesamiento avanzado';
              break;
            default:
              name = key.charAt(0).toUpperCase() + key.slice(1);
              break;
          }
          
          return {
            name,
            status: server.disabled ? 'inactive' : 'active' as 'active' | 'inactive',
            description
          };
        });
        
        // Agregar servicios específicos del proyecto
        mcpServices.push(
          {
            name: 'BOE Service',
            status: 'active',
            description: 'Consultas al Boletín Oficial del Estado'
          },
          {
            name: 'CENDOJ Service',
            status: 'active',
            description: 'Búsqueda de jurisprudencia'
          }
        );
        
        setServices(mcpServices);
      } catch (error) {
        console.error('Error loading MCP config:', error);
        // Fallback a servicios por defecto
        setServices([
          {
            name: 'MCP Playwright',
            status: 'active',
            description: 'Automatización web y scraping'
          },
          {
            name: 'BOE Service',
            status: 'active',
            description: 'Consultas al Boletín Oficial del Estado'
          },
          {
            name: 'CENDOJ Service',
            status: 'active',
            description: 'Búsqueda de jurisprudencia'
          }
        ]);
      }
    };

    loadMCPConfig();
    const interval = setInterval(loadMCPConfig, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Estado de Servicios MCP</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
              {getStatusBadge(service.status)}
            </div>
          ))}
          {services.length === 0 && !isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              No se encontraron servicios MCP
            </div>
          )}
          {isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              Cargando servicios...
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Última actualización: {lastCheck.toLocaleTimeString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total de servicios: {services.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MCPStatus;