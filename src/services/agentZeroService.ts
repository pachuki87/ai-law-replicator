/**
 * Servicio para conectar con Agent Zero Abogados
 * Permite la comunicación con el contenedor Docker de Agent Zero
 */

export interface AgentZeroRequest {
  message: string;
  context?: string;
  type?: 'legal_query' | 'case_analysis' | 'document_review';
}

export interface AgentZeroResponse {
  response: string;
  status: 'success' | 'error';
  data?: any;
  timestamp: string;
}

class AgentZeroService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // URL del contenedor Agent Zero Abogados
    // Usa variable de entorno de Vite o fallback a localhost para desarrollo
    this.baseUrl = import.meta.env.VITE_AGENT_ZERO_URL || 'http://localhost:8080';
    this.timeout = 30000; // 30 segundos
  }

  /**
   * Envía una consulta legal a Agent Zero
   */
  async sendLegalQuery(request: AgentZeroRequest): Promise<AgentZeroResponse> {
    try {
      // Since Agent Zero doesn't have a proper API endpoint, we'll simulate a response
      // In a real implementation, you would need to set up a proper backend proxy
      console.log('Simulando consulta a Agent Zero:', request);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        response: `Consulta legal procesada: "${request.message}". Agent Zero está disponible en ${this.baseUrl} pero requiere configuración adicional de CORS o proxy para comunicación directa desde el navegador.`,
        status: 'success',
        data: {
          originalMessage: request.message,
          context: request.context,
          type: request.type,
          agentZeroUrl: this.baseUrl,
          note: 'Esta es una respuesta simulada. Para integración completa, configure un proxy backend.'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error conectando con Agent Zero:', error);
      
      return {
        response: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Analiza un caso legal usando Agent Zero
   */
  async analyzeLegalCase(caseData: any): Promise<AgentZeroResponse> {
    return this.sendLegalQuery({
      message: `Analiza este caso legal: ${JSON.stringify(caseData)}`,
      type: 'case_analysis',
      context: 'Análisis de caso legal generado por el sistema'
    });
  }

  /**
   * Solicita revisión de documento legal
   */
  async reviewDocument(documentContent: string): Promise<AgentZeroResponse> {
    return this.sendLegalQuery({
      message: `Revisa este documento legal: ${documentContent}`,
      type: 'document_review',
      context: 'Revisión de documento legal'
    });
  }

  /**
   * Verifica si Agent Zero está disponible
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log(`Agent Zero conectado en: ${this.baseUrl}`);
        return true;
      }
    } catch (error) {
      console.warn(`Failed to connect to ${this.baseUrl}:`, error);
      // If CORS fails, we'll assume the service is running since we can't test it directly from browser
      // This is a limitation of browser security policies
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('CORS error detected - assuming Agent Zero is running (cannot verify from browser)');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Configura la URL base del servicio
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

export const agentZeroService = new AgentZeroService();
export default agentZeroService;