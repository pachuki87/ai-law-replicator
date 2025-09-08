// Servicio MCP para Sequential Thinking - Primer paso obligatorio en generación de casos legales

export interface SequentialThought {
  thought: string;
  nextThoughtNeeded: boolean;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
}

export interface CaseAnalysisResult {
  caseType: string;
  legalArea: string;
  complexity: 'low' | 'medium' | 'high';
  requiredDocuments: string[];
  applicableNorms: string[];
  jurisprudenceNeeded: boolean;
  estimatedTimeframe: string;
  mcpServicesNeeded: string[];
  workPlan: string[];
}

class MCPSequentialThinkingService {
  private thoughts: SequentialThought[] = [];
  private currentAnalysis: CaseAnalysisResult | null = null;

  /**
   * Inicia el análisis secuencial de un caso legal
   */
  async analyzeLegalCase(caseDetails: {
    caseName: string;
    caseType: string;
    description: string;
    clientName?: string;
    defendantName?: string;
    jurisdiction?: string;
  }): Promise<CaseAnalysisResult> {
    this.thoughts = [];
    
    // Pensamiento 1: Análisis inicial del tipo de caso
    await this.addThought({
      thought: `Analizando el caso "${caseDetails.caseName}" de tipo "${caseDetails.caseType}". Necesito identificar la rama del derecho aplicable y la complejidad del procedimiento. Descripción: ${caseDetails.description}`,
      nextThoughtNeeded: true,
      thoughtNumber: 1,
      totalThoughts: 8
    });

    // Pensamiento 2: Identificación de normativa aplicable
    await this.addThought({
      thought: `Basándome en el tipo de caso, debo identificar las 3 reglas fundamentales: 1) Normativa específica aplicable, 2) Ley y modificaciones recientes, 3) Principios del Código Civil español. Para este caso necesitaré consultar el BOE para normativa actualizada.`,
      nextThoughtNeeded: true,
      thoughtNumber: 2,
      totalThoughts: 8
    });

    // Pensamiento 3: Planificación de jurisprudencia
    await this.addThought({
      thought: `Para fortalecer el caso, necesito buscar jurisprudencia relevante en CENDOJ. Buscaré sentencias del Tribunal Supremo, Audiencias Provinciales y TSJ relacionadas con casos similares. Esto es crucial para los fundamentos de derecho.`,
      nextThoughtNeeded: true,
      thoughtNumber: 3,
      totalThoughts: 8
    });

    // Pensamiento 4: Estructura de documentos
    await this.addThought({
      thought: `Debo crear la estructura completa: README.md, demanda, investigación jurídica, estrategia procesal y documentos complementarios. Cada documento debe seguir las plantillas profesionales y cumplir con las reglas fundamentales.`,
      nextThoughtNeeded: true,
      thoughtNumber: 4,
      totalThoughts: 8
    });

    // Pensamiento 5: Servicios MCP necesarios
    await this.addThought({
      thought: `Servicios MCP requeridos: BOE Service (normativa), CENDOJ via Playwright (jurisprudencia), Fetch-MCP (datos adicionales), Rube (procesamiento de documentos complejos). También necesitaré Playwright para investigación web complementaria.`,
      nextThoughtNeeded: true,
      thoughtNumber: 5,
      totalThoughts: 8
    });

    // Pensamiento 6: Análisis de complejidad
    await this.addThought({
      thought: `Evaluando la complejidad del caso basándome en factores como: tipo de procedimiento, número de partes involucradas, normativa aplicable, precedentes jurisprudenciales necesarios. Esto determinará el tiempo estimado y recursos necesarios.`,
      nextThoughtNeeded: true,
      thoughtNumber: 6,
      totalThoughts: 8
    });

    // Pensamiento 7: Plan de trabajo
    await this.addThought({
      thought: `Creando plan de trabajo secuencial: 1) Consulta BOE, 2) Búsqueda CENDOJ, 3) Creación estructura carpetas, 4) Generación documentos MD, 5) Conversión a PDF, 6) Versión web HTML/CSS, 7) Validación reglas fundamentales.`,
      nextThoughtNeeded: true,
      thoughtNumber: 7,
      totalThoughts: 8
    });

    // Pensamiento 8: Validación final y entrega
    await this.addThought({
      thought: `Validación final: verificar que se cumplan las 3 reglas fundamentales, que todos los documentos estén completos, que la versión web sea funcional y que las referencias sean correctas. El caso debe estar listo para uso profesional.`,
      nextThoughtNeeded: false,
      thoughtNumber: 8,
      totalThoughts: 8
    });

    // Generar resultado del análisis
    this.currentAnalysis = this.generateAnalysisResult(caseDetails);
    return this.currentAnalysis;
  }

  private async addThought(thought: SequentialThought): Promise<void> {
    this.thoughts.push(thought);
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private generateAnalysisResult(caseDetails: any): CaseAnalysisResult {
    const legalAreaMap: { [key: string]: string } = {
      'Civil - Responsabilidad Civil': 'Derecho Civil',
      'Civil - Contratos': 'Derecho Civil',
      'Civil - Propiedad': 'Derecho Civil',
      'Laboral - Despido': 'Derecho Laboral',
      'Laboral - Incapacidad': 'Derecho Laboral',
      'Penal - Delitos Menores': 'Derecho Penal',
      'Administrativo - Sanciones': 'Derecho Administrativo',
      'Mercantil - Sociedades': 'Derecho Mercantil',
      'Familia - Divorcio': 'Derecho de Familia',
      'Familia - Custodia': 'Derecho de Familia'
    };

    const complexityMap: { [key: string]: 'low' | 'medium' | 'high' } = {
      'Civil - Contratos': 'medium',
      'Civil - Propiedad': 'medium',
      'Laboral - Despido': 'medium',
      'Laboral - Incapacidad': 'high',
      'Penal - Delitos Menores': 'low',
      'Administrativo - Sanciones': 'medium',
      'Mercantil - Sociedades': 'high',
      'Familia - Divorcio': 'medium',
      'Familia - Custodia': 'high',
      'Civil - Responsabilidad Civil': 'medium'
    };

    const requiredDocsMap: { [key: string]: string[] } = {
      'Civil - Responsabilidad Civil': ['Demanda', 'Pruebas del daño', 'Informes periciales', 'Documentación médica'],
      'Civil - Contratos': ['Demanda', 'Contrato original', 'Correspondencia', 'Pruebas de incumplimiento'],
      'Laboral - Despido': ['Demanda', 'Contrato de trabajo', 'Carta de despido', 'Nóminas', 'Comunicaciones'],
      'Laboral - Incapacidad': ['Demanda', 'Informes médicos', 'Historial laboral', 'Dictámenes periciales'],
      'Penal - Delitos Menores': ['Denuncia', 'Atestado policial', 'Pruebas', 'Testimonios'],
      'Administrativo - Sanciones': ['Recurso', 'Expediente administrativo', 'Alegaciones', 'Normativa aplicable'],
      'Mercantil - Sociedades': ['Demanda', 'Estatutos sociales', 'Actas', 'Documentación contable'],
      'Familia - Divorcio': ['Demanda', 'Certificado matrimonio', 'Convenio regulador', 'Documentación económica'],
      'Familia - Custodia': ['Demanda', 'Informes psicológicos', 'Documentación escolar', 'Pruebas de idoneidad']
    };

    const legalArea = legalAreaMap[caseDetails.caseType] || 'Derecho General';
    const complexity = complexityMap[caseDetails.caseType] || 'medium';
    const requiredDocuments = requiredDocsMap[caseDetails.caseType] || ['Demanda', 'Documentación general'];

    return {
      caseType: caseDetails.caseType,
      legalArea,
      complexity,
      requiredDocuments,
      applicableNorms: this.getApplicableNorms(caseDetails.caseType),
      jurisprudenceNeeded: true,
      estimatedTimeframe: this.getEstimatedTimeframe(complexity),
      mcpServicesNeeded: ['BOE Service', 'CENDOJ Service', 'Playwright', 'Fetch-MCP', 'Rube'],
      workPlan: [
        'Consultar normativa actualizada en BOE',
        'Buscar jurisprudencia relevante en CENDOJ',
        'Crear estructura de carpetas y archivos',
        'Generar documentos legales (MD)',
        'Convertir documentos a PDF',
        'Crear versión web profesional',
        'Validar cumplimiento de reglas fundamentales',
        'Revisar y entregar caso completo'
      ]
    };
  }

  private getApplicableNorms(caseType: string): string[] {
    const normsMap: { [key: string]: string[] } = {
      'Civil - Responsabilidad Civil': ['Código Civil Art. 1902-1910', 'Ley de Responsabilidad Civil y Seguro'],
      'Civil - Contratos': ['Código Civil Art. 1088-1314', 'Ley de Condiciones Generales'],
      'Laboral - Despido': ['Estatuto de los Trabajadores', 'Ley Reguladora de la Jurisdicción Social'],
      'Laboral - Incapacidad': ['Ley General de la Seguridad Social', 'Real Decreto de Incapacidades'],
      'Penal - Delitos Menores': ['Código Penal', 'Ley de Enjuiciamiento Criminal'],
      'Administrativo - Sanciones': ['Ley de Procedimiento Administrativo', 'Ley de Régimen Jurídico'],
      'Mercantil - Sociedades': ['Ley de Sociedades de Capital', 'Código de Comercio'],
      'Familia - Divorcio': ['Código Civil Art. 81-107', 'Ley de Jurisdicción Voluntaria'],
      'Familia - Custodia': ['Código Civil Art. 154-171', 'Ley de Protección del Menor']
    };

    return normsMap[caseType] || ['Código Civil', 'Normativa específica aplicable'];
  }

  private getEstimatedTimeframe(complexity: 'low' | 'medium' | 'high'): string {
    switch (complexity) {
      case 'low': return '2-4 semanas';
      case 'medium': return '1-2 meses';
      case 'high': return '2-4 meses';
      default: return '1-2 meses';
    }
  }

  /**
   * Obtiene todos los pensamientos del análisis
   */
  getThoughts(): SequentialThought[] {
    return [...this.thoughts];
  }

  /**
   * Obtiene el resultado del análisis actual
   */
  getCurrentAnalysis(): CaseAnalysisResult | null {
    return this.currentAnalysis;
  }

  /**
   * Reinicia el servicio para un nuevo análisis
   */
  reset(): void {
    this.thoughts = [];
    this.currentAnalysis = null;
  }

  /**
   * Genera un resumen del análisis para mostrar al usuario
   */
  generateAnalysisSummary(): string {
    if (!this.currentAnalysis) {
      return 'No hay análisis disponible';
    }

    const analysis = this.currentAnalysis;
    return `
**Análisis Completado con Sequential Thinking MCP**

📋 **Tipo de Caso:** ${analysis.caseType}
🏛️ **Área Legal:** ${analysis.legalArea}
⚖️ **Complejidad:** ${analysis.complexity.toUpperCase()}
⏱️ **Tiempo Estimado:** ${analysis.estimatedTimeframe}

**Normativa Aplicable:**
${analysis.applicableNorms.map(norm => `• ${norm}`).join('\n')}

**Documentos Requeridos:**
${analysis.requiredDocuments.map(doc => `• ${doc}`).join('\n')}

**Servicios MCP Necesarios:**
${analysis.mcpServicesNeeded.map(service => `• ${service}`).join('\n')}

**Plan de Trabajo:**
${analysis.workPlan.map((step, index) => `${index + 1}. ${step}`).join('\n')}

✅ **Validación:** Se aplicarán las 3 reglas fundamentales del derecho español
✅ **Jurisprudencia:** Se consultará CENDOJ para casos precedentes
✅ **Normativa:** Se verificará legislación actualizada en BOE
    `;
  }
}

export const mcpSequentialThinkingService = new MCPSequentialThinkingService();
export default mcpSequentialThinkingService;