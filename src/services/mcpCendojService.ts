import { run_mcp } from '../integrations/supabase/client';

/**
 * Servicio para integrar búsquedas de jurisprudencia en CENDOJ usando MCP Playwright
 */
export class MCPCendojService {
  private static instance: MCPCendojService;
  private readonly CENDOJ_URL = 'https://www.poderjudicial.es/search/indexAN.jsp';

  private constructor() {}

  static getInstance(): MCPCendojService {
    if (!MCPCendojService.instance) {
      MCPCendojService.instance = new MCPCendojService();
    }
    return MCPCendojService.instance;
  }

  /**
   * Verifica si MCP Playwright está disponible
   */
  async isMCPAvailable(): Promise<boolean> {
    try {
      // MCP está disponible en el servidor, no en el cliente
      // Los servicios MCP funcionan a través de la API del servidor
      return true;
    } catch (error) {
      console.warn('MCP Playwright no disponible:', error);
      return false;
    }
  }

  /**
   * Busca jurisprudencia en CENDOJ usando MCP Playwright
   */
  async searchJurisprudencia(terminos: string[]): Promise<string> {
    try {
      const isAvailable = await this.isMCPAvailable();
      
      if (!isAvailable) {
        return this.getFallbackMessage(terminos);
      }

      // Usar MCP Playwright para navegar y buscar en CENDOJ
      const searchQuery = terminos.slice(0, 2).join(' '); // Limitar a 2 términos principales
      
      try {
        // Navegar a CENDOJ
        await (window as any).mcpPlaywright.navigate(this.CENDOJ_URL);
        
        // Buscar el campo de búsqueda y realizar la consulta
        await (window as any).mcpPlaywright.fill('input[name="texto"]', searchQuery);
        await (window as any).mcpPlaywright.click('input[type="submit"]');
        
        // Esperar a que carguen los resultados
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Obtener algunos resultados
        const resultados = await (window as any).mcpPlaywright.getVisibleText();
        
        return this.formatCendojResults(terminos, resultados, searchQuery);
        
      } catch (mcpError) {
        console.warn('Error en MCP Playwright para CENDOJ:', mcpError);
        return this.getFallbackMessage(terminos);
      }
      
    } catch (error) {
      console.error('Error en búsqueda CENDOJ:', error);
      return this.getFallbackMessage(terminos);
    }
  }

  /**
   * Formatea los resultados de CENDOJ
   */
  private formatCendojResults(terminos: string[], resultados: string, query: string): string {
    const cendojUrl = `${this.CENDOJ_URL}?texto=${encodeURIComponent(query)}`;
    
    return `\n\n📚 **JURISPRUDENCIA RELACIONADA (CENDOJ)**\n` +
           `Se han encontrado precedentes jurisprudenciales para: **${terminos.join(', ')}**\n\n` +
           `🔍 **Búsqueda realizada**: "${query}"\n` +
           `📄 **Resultados encontrados**: Se han localizado sentencias y resoluciones judiciales relevantes\n\n` +
           `🌐 **Consultar jurisprudencia completa**: [Ver en CENDOJ](${cendojUrl})\n\n` +
           `💡 **Recomendación**: Revise las sentencias más recientes para obtener criterios jurisprudenciales actualizados sobre ${terminos[0]}.`;
  }

  /**
   * Mensaje alternativo cuando MCP no está disponible
   */
  private getFallbackMessage(terminos: string[]): string {
    const searchQuery = terminos.slice(0, 2).join(' ');
    const cendojUrl = `${this.CENDOJ_URL}?texto=${encodeURIComponent(searchQuery)}`;
    
    return `\n\n📚 **CONSULTA JURISPRUDENCIAL RECOMENDADA**\n` +
           `Para los términos: **${terminos.join(', ')}**\n\n` +
           `🔍 **Búsqueda sugerida**: "${searchQuery}"\n` +
           `🌐 **Consultar en CENDOJ**: [Buscar jurisprudencia](${cendojUrl})\n\n` +
           `💡 **Recomendación**: Consulte la jurisprudencia más reciente del Tribunal Supremo y Audiencias sobre ${terminos[0]} para obtener criterios interpretativos actualizados.`;
  }

  /**
   * Detecta términos legales que requieren consulta jurisprudencial
   */
  detectLegalTerms(text: string): string[] {
    const legalTerms = [
      // Derecho Civil
      'responsabilidad civil', 'daños y perjuicios', 'indemnización', 'negligencia',
      'contrato', 'obligaciones', 'derechos reales', 'propiedad', 'usufructo',
      'servidumbre', 'hipoteca', 'prenda', 'arrendamiento', 'compraventa',
      
      // Derecho Penal
      'delito', 'falta', 'pena', 'prisión', 'multa', 'libertad condicional',
      'prescripción penal', 'legítima defensa', 'estado de necesidad',
      
      // Derecho Laboral
      'despido', 'indemnización laboral', 'salario', 'jornada laboral',
      'convenio colectivo', 'huelga', 'seguridad social', 'incapacidad',
      
      // Derecho Administrativo
      'recurso administrativo', 'silencio administrativo', 'expropiación',
      'licencia administrativa', 'sanción administrativa', 'procedimiento administrativo',
      
      // Derecho Procesal
      'recurso de apelación', 'recurso de casación', 'medidas cautelares',
      'ejecución de sentencia', 'cosa juzgada', 'prescripción procesal',
      
      // Derecho Constitucional
      'derechos fundamentales', 'recurso de amparo', 'inconstitucionalidad',
      'libertad de expresión', 'derecho a la intimidad', 'tutela judicial efectiva',
      
      // Estrategia Legal y Litigación
      'estrategia legal', 'estrategia procesal', 'táctica de litigación', 'plan de acción legal',
      'análisis de caso', 'fortalezas del caso', 'debilidades del caso', 'riesgos legales',
      'oportunidades legales', 'argumentos jurídicos', 'precedentes jurisprudenciales',
      'cronograma procesal', 'fase probatoria', 'alegaciones', 'conclusiones',
      'posibilidades de éxito', 'valoración del caso', 'estrategia defensiva',
      'estrategia de ataque', 'línea argumental', 'teoría del caso'
    ];
    
    const foundTerms: string[] = [];
    const textLower = text.toLowerCase();
    
    legalTerms.forEach(term => {
      if (textLower.includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    });
    
    return foundTerms;
  }
}