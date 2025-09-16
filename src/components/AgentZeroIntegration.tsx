import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Bot, CheckCircle, XCircle, Send } from 'lucide-react';
import { agentZeroService, AgentZeroRequest, AgentZeroResponse } from '@/services/agentZeroService';

interface AgentZeroIntegrationProps {
  caseData?: any;
  onResponse?: (response: AgentZeroResponse) => void;
}

export const AgentZeroIntegration: React.FC<AgentZeroIntegrationProps> = ({ 
  caseData, 
  onResponse 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState<AgentZeroResponse[]>([]);
  const [queryType, setQueryType] = useState<'legal_query' | 'case_analysis' | 'document_review'>('legal_query');

  // Verificar conexión al montar el componente
  useEffect(() => {
    checkAgentZeroConnection();
  }, []);

  const checkAgentZeroConnection = async () => {
    try {
      const connected = await agentZeroService.checkConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const request: AgentZeroRequest = {
        message: query,
        type: queryType,
        context: caseData ? `Contexto del caso: ${JSON.stringify(caseData)}` : undefined
      };

      const response = await agentZeroService.sendLegalQuery(request);
      
      setResponses(prev => [response, ...prev]);
      setQuery('');
      
      if (onResponse) {
        onResponse(response);
      }
    } catch (error) {
      console.error('Error enviando consulta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCase = async () => {
    if (!caseData) return;

    setIsLoading(true);
    try {
      const response = await agentZeroService.analyzeLegalCase(caseData);
      setResponses(prev => [response, ...prev]);
      
      if (onResponse) {
        onResponse(response);
      }
    } catch (error) {
      console.error('Error analizando caso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isConnected === null) {
      return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Verificando...</Badge>;
    }
    
    return isConnected ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />Conectado
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />Desconectado
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <CardTitle>Agent Zero Abogados</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Conecta con Agent Zero para análisis legal avanzado y consultas especializadas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isConnected && (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              No se puede conectar con Agent Zero. Verifica que el contenedor esté ejecutándose.
              <Button 
                variant="link" 
                size="sm" 
                onClick={checkAgentZeroConnection}
                className="ml-2 p-0 h-auto"
              >
                Reintentar conexión
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="flex items-center justify-between">
              <span>Agent Zero está conectado y funcionando correctamente.</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('http://localhost:8081', '_blank')}
                className="ml-2"
              >
                Abrir Agent Zero
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <>
            {/* Tipo de consulta */}
            <div className="flex space-x-2">
              <Button
                variant={queryType === 'legal_query' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('legal_query')}
              >
                Consulta Legal
              </Button>
              <Button
                variant={queryType === 'case_analysis' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('case_analysis')}
              >
                Análisis de Caso
              </Button>
              <Button
                variant={queryType === 'document_review' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('document_review')}
              >
                Revisión de Documento
              </Button>
            </div>

            {/* Área de consulta */}
            <div className="space-y-2">
              <Textarea
                placeholder="Escribe tu consulta legal para Agent Zero..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
              />
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSendQuery}
                  disabled={!query.trim() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Enviar Consulta
                </Button>
                
                {caseData && (
                  <Button 
                    variant="outline"
                    onClick={handleAnalyzeCase}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Bot className="w-4 h-4 mr-2" />
                    )}
                    Analizar Caso
                  </Button>
                )}
              </div>
            </div>

            {/* Respuestas */}
            {responses.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <h4 className="font-medium text-sm text-gray-700">Respuestas de Agent Zero:</h4>
                {responses.map((response, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${
                      response.status === 'success' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={response.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {response.status === 'success' ? 'Éxito' : 'Error'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(response.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{response.response}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentZeroIntegration;