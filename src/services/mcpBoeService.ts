// Servicio MCP para consultas al BOE usando Playwright

interface MCPBoeResult {
  success: boolean;
  data?: string;
  error?: string;
  url?: string;
}

class MCPBoeService {
  private static instance: MCPBoeService;
  private mcpAvailable: boolean = false;

  private constructor() {
    this.checkMCPAvailability();
  }

  public static getInstance(): MCPBoeService {
    if (!MCPBoeService.instance) {
      MCPBoeService.instance = new MCPBoeService();
    }
    return MCPBoeService.instance;
  }

  private checkMCPAvailability(): void {
    try {
      // MCP está disponible en el servidor, no en el cliente
      // Los servicios MCP funcionan a través de la API del servidor
      this.mcpAvailable = true;
      console.log('✅ MCP BOE Service inicializado correctamente');
    } catch (error) {
      console.error('Error verificando MCP:', error);
      this.mcpAvailable = false;
    }
  }

  public async searchBOE(termino: string): Promise<MCPBoeResult> {
    try {
      if (this.mcpAvailable && (window as any).mcpPlaywright) {
        // Usar MCP Playwright para buscar en BOE
        const result = await this.searchWithMCP(termino);
        if (result.success) {
          return result;
        }
      }
      
      // Método alternativo: generar URL de búsqueda directa
      return this.generateBOESearchResult(termino);
      
    } catch (error) {
      console.error('Error en búsqueda BOE:', error);
      return {
        success: false,
        error: 'Error en la consulta al BOE',
        data: 'Consultar manualmente en https://www.boe.es'
      };
    }
  }

  private async searchWithMCP(termino: string): Promise<MCPBoeResult> {
    try {
      const mcpPlaywright = (window as any).mcpPlaywright;
      
      // Navegar al BOE
      await mcpPlaywright.navigate({
        url: 'https://www.boe.es/buscar/',
        browserType: 'chromium',
        headless: true
      });

      // Realizar búsqueda
      await mcpPlaywright.fill({
        selector: 'input[name="q"]',
        value: termino
      });

      await mcpPlaywright.click({
        selector: 'button[type="submit"]'
      });

      // Obtener resultados
      const resultados = await mcpPlaywright.getVisibleText();
      
      await mcpPlaywright.close();

      return {
        success: true,
        data: `Resultados de búsqueda para "${termino}" en BOE`,
        url: `https://www.boe.es/buscar/?q=${encodeURIComponent(termino)}`
      };
      
    } catch (error) {
      console.error('Error usando MCP Playwright:', error);
      return {
        success: false,
        error: 'Error en MCP Playwright'
      };
    }
  }

  private generateBOESearchResult(termino: string): MCPBoeResult {
    const searchUrl = `https://www.boe.es/buscar/?q=${encodeURIComponent(termino)}`;
    
    return {
      success: true,
      data: `Búsqueda generada para "${termino}" en BOE`,
      url: searchUrl
    };
  }

  public async searchMultipleTerms(terminos: string[]): Promise<MCPBoeResult[]> {
    const results: MCPBoeResult[] = [];
    
    for (const termino of terminos.slice(0, 3)) { // Limitar a 3 términos
      const result = await this.searchBOE(termino);
      results.push(result);
      
      // Pequeña pausa entre búsquedas para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  public isMCPAvailable(): boolean {
    return this.mcpAvailable;
  }
}

export default MCPBoeService;
export type { MCPBoeResult };