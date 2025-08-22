// Configuración de APIs usando variables de entorno
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Tipos de datos
export interface DocumentFormData {
  clientName: string;
  caseNumber: string;
  details: string;
  urgency: 'low' | 'medium' | 'high';
  [key: string]: string | number | boolean;
}

export interface GeneratedDocument {
  id: string;
  type: string;
  typeName: string;
  clientName: string;
  caseNumber: string;
  details: string;
  urgency: string;
  content: string;
  createdAt: string;
  provider: 'gemini' | 'openai' | 'mock';
}

export type AIProvider = 'gemini' | 'openai' | 'auto';

// Prompts para diferentes tipos de documentos
const documentPrompts = {
  contract: (data: DocumentFormData) => `
Genera un contrato de arrendamiento profesional y detallado con la siguiente información:

Cliente: ${data.clientName}
Número de caso: ${data.caseNumber}
Detalles específicos: ${data.details}
Urgencia: ${data.urgency}

El contrato debe incluir:
1. Encabezado con datos de las partes
2. Objeto del contrato
3. Duración y condiciones
4. Obligaciones del arrendador
5. Obligaciones del arrendatario
6. Renta y forma de pago
7. Garantías
8. Causas de terminación
9. Cláusulas adicionales
10. Firmas

Formato: Documento legal formal en español, bien estructurado y profesional.
`,

  demand: (data: DocumentFormData) => `
Genera una demanda civil profesional y detallada con la siguiente información:

Demandante: ${data.clientName}
Número de expediente: ${data.caseNumber}
Hechos y fundamentos: ${data.details}
Urgencia: ${data.urgency}

La demanda debe incluir:
1. Encabezado con datos del juzgado
2. Datos del demandante y demandado
3. Exposición de hechos
4. Fundamentos de derecho
5. Petitorio
6. Anexos
7. Lugar y fecha
8. Firma del abogado

Formato: Documento legal formal en español, siguiendo la estructura procesal civil.
`,

  appeal: (data: DocumentFormData) => `
Genera un recurso de apelación profesional y detallado con la siguiente información:

Apelante: ${data.clientName}
Número de expediente: ${data.caseNumber}
Motivos de apelación: ${data.details}
Urgencia: ${data.urgency}

El recurso debe incluir:
1. Encabezado con datos del tribunal
2. Identificación de la resolución apelada
3. Legitimación del apelante
4. Agravios
5. Fundamentos de derecho
6. Petitorio
7. Anexos
8. Lugar y fecha
9. Firma del abogado

Formato: Documento legal formal en español, siguiendo la estructura procesal.
`,

  agreement: (data: DocumentFormData) => `
Genera un convenio de colaboración profesional y detallado con la siguiente información:

Parte interesada: ${data.clientName}
Referencia: ${data.caseNumber}
Objetivo del convenio: ${data.details}
Urgencia: ${data.urgency}

El convenio debe incluir:
1. Encabezado con identificación de las partes
2. Antecedentes
3. Objeto del convenio
4. Obligaciones de cada parte
5. Duración
6. Financiamiento (si aplica)
7. Causas de terminación
8. Resolución de controversias
9. Cláusulas finales
10. Firmas

Formato: Documento legal formal en español, bien estructurado.
`,

  power: (data: DocumentFormData) => `
Genera un poder notarial profesional y detallado con la siguiente información:

Otorgante: ${data.clientName}
Referencia: ${data.caseNumber}
Facultades específicas: ${data.details}
Urgencia: ${data.urgency}

El poder debe incluir:
1. Comparecencia del otorgante
2. Identificación del apoderado
3. Facultades otorgadas
4. Limitaciones (si las hay)
5. Duración del poder
6. Revocabilidad
7. Aceptación del apoderado
8. Cláusulas adicionales
9. Firmas y ratificación notarial

Formato: Documento notarial formal en español.
`,

  complaint: (data: DocumentFormData) => `
Genera una denuncia penal profesional y detallada con la siguiente información:

Denunciante: ${data.clientName}
Referencia: ${data.caseNumber}
Hechos denunciados: ${data.details}
Urgencia: ${data.urgency}

La denuncia debe incluir:
1. Datos del denunciante
2. Autoridad competente
3. Relación de hechos
4. Posible delito cometido
5. Identificación del presunto responsable
6. Pruebas disponibles
7. Peticiones
8. Lugar y fecha
9. Firma del denunciante

Formato: Documento legal formal en español, siguiendo la estructura penal.
`
};

// Función para generar contenido mock cuando no hay APIs disponibles
function generateMockDocument(documentType: string, formData: DocumentFormData): string {
  const documentTypeNames: Record<string, string> = {
    contract: 'Contrato de Arrendamiento',
    demand: 'Demanda Civil',
    appeal: 'Recurso de Apelación',
    agreement: 'Convenio de Colaboración',
    power: 'Poder Notarial',
    complaint: 'Denuncia Penal'
  };

  const typeName = documentTypeNames[documentType] || 'Documento Legal';
  const currentDate = new Date().toLocaleDateString('es-ES');

  return `
# ${typeName}

**Cliente:** ${formData.clientName}
**Número de Caso:** ${formData.caseNumber}
**Fecha:** ${currentDate}
**Urgencia:** ${formData.urgency}

## Detalles del Documento

${formData.details}

## Contenido Generado

Este es un documento de ejemplo generado para demostrar la funcionalidad del sistema. En un entorno de producción, este contenido sería generado por inteligencia artificial utilizando las APIs de OpenAI o Google Gemini.

### Estructura del Documento

1. **Encabezado Legal**
   - Identificación de las partes
   - Número de expediente: ${formData.caseNumber}
   - Fecha de elaboración: ${currentDate}

2. **Cuerpo Principal**
   - Antecedentes y consideraciones
   - Cláusulas específicas según el tipo de documento
   - Detalles proporcionados: ${formData.details}

3. **Disposiciones Finales**
   - Vigencia y aplicación
   - Firmas y ratificaciones
   - Anexos (si corresponde)

### Información Adicional

- **Tipo de Documento:** ${typeName}
- **Cliente:** ${formData.clientName}
- **Nivel de Urgencia:** ${formData.urgency}
- **Estado:** Borrador para revisión

---

*Documento generado automáticamente por el Sistema de Automatización Legal*
*Fecha de generación: ${currentDate}*
*Versión: 1.0*

**NOTA IMPORTANTE:** Este es un documento de ejemplo. Para obtener documentos legales reales generados por IA, configure las variables de entorno VITE_OPENAI_API_KEY o VITE_GOOGLE_API_KEY en su archivo .env
  `;
}

// Clase principal del servicio
class AIDocumentService {
  private preferredProvider: AIProvider = 'auto';

  constructor() {
    // La inicialización se hará de forma lazy cuando sea necesaria
  }

  // Cambiar proveedor preferido
  setPreferredProvider(provider: AIProvider): void {
    this.preferredProvider = provider;
  }

  // Generar documento con APIs reales o contenido mock
  async generateDocument(
    documentType: string,
    formData: DocumentFormData,
    preferredProvider?: AIProvider
  ): Promise<GeneratedDocument> {
    const provider = preferredProvider || this.preferredProvider;
    let content: string;
    let usedProvider: 'gemini' | 'openai' | 'mock' = 'mock';

    try {
      // Intentar con APIs reales si están disponibles
      if (GEMINI_API_KEY && (provider === 'gemini' || provider === 'auto')) {
        content = await this.generateWithGemini(documentType, formData);
        usedProvider = 'gemini';
      } else if (OPENAI_API_KEY && (provider === 'openai' || provider === 'auto')) {
        content = await this.generateWithOpenAI(documentType, formData);
        usedProvider = 'openai';
      } else {
        // Usar contenido mock si no hay APIs disponibles
        content = generateMockDocument(documentType, formData);
        usedProvider = 'mock';
      }
    } catch (error) {
      console.warn('Error al generar con IA, usando contenido mock:', error);
      content = generateMockDocument(documentType, formData);
      usedProvider = 'mock';
    }

    const documentTypeNames: Record<string, string> = {
      contract: 'Contrato de Arrendamiento',
      demand: 'Demanda Civil',
      appeal: 'Recurso de Apelación',
      agreement: 'Convenio de Colaboración',
      power: 'Poder Notarial',
      complaint: 'Denuncia Penal'
    };

    return {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: documentType,
      typeName: documentTypeNames[documentType] || 'Documento Legal',
      clientName: formData.clientName,
      caseNumber: formData.caseNumber,
      details: formData.details,
      urgency: formData.urgency,
      content,
      createdAt: new Date().toISOString(),
      provider: usedProvider
    };
  }

  // Generar documento con Gemini (implementación futura)
  private async generateWithGemini(
    documentType: string,
    formData: DocumentFormData
  ): Promise<string> {
    // Por ahora, usar contenido mock
    // En el futuro, aquí se implementará la llamada real a Gemini
    throw new Error('Gemini API no implementada aún');
  }

  // Generar documento con OpenAI (implementación futura)
  private async generateWithOpenAI(
    documentType: string,
    formData: DocumentFormData
  ): Promise<string> {
    // Por ahora, usar contenido mock
    // En el futuro, aquí se implementará la llamada real a OpenAI
    throw new Error('OpenAI API no implementada aún');
  }

  // Obtener tipos de documento disponibles
  getAvailableDocumentTypes(): string[] {
    return Object.keys(documentPrompts);
  }

  // Obtener proveedor preferido actual
  getPreferredProvider(): AIProvider {
    return this.preferredProvider;
  }

  // Obtener estado de los proveedores
  async getProvidersStatus(): Promise<{
    preferred: AIProvider;
    available: { gemini: boolean; openai: boolean };
  }> {
    return {
      preferred: this.preferredProvider,
      available: {
        gemini: !!GEMINI_API_KEY,
        openai: !!OPENAI_API_KEY
      }
    };
  }
}

// Exportar instancia singleton
export const aiDocumentService = new AIDocumentService();
export default aiDocumentService;