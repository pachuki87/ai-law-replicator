// Servicio para integración con bases de datos jurídicas públicas y comerciales

export interface SearchQuery {
  query: string;
  filters?: {
    court?: string;
    dateFrom?: string;
    dateTo?: string;
    jurisdiction?: string;
    documentType?: 'sentence' | 'auto' | 'resolution' | 'law' | 'regulation';
    tags?: string[];
  };
  operators?: {
    and?: string[];
    or?: string[];
    not?: string[];
  };
}

export interface LegalDocument {
  id: string;
  title: string;
  court: string;
  date: string;
  reference: string;
  summary: string;
  fullText?: string;
  relevance: number;
  tags: string[];
  jurisdiction: string;
  documentType: string;
  source: 'CENDOJ' | 'BOE' | 'EUR-Lex' | 'Aranzadi' | 'LaLey' | 'vLex' | 'Iustel';
  url?: string;
}

export interface SearchResult {
  documents: LegalDocument[];
  totalResults: number;
  searchTime: number;
  source: string;
}

// Servicio base para bases de datos jurídicas
export abstract class LegalDatabaseService {
  abstract search(query: SearchQuery): Promise<SearchResult>;
  abstract getDocument(id: string): Promise<LegalDocument | null>;
  
  protected buildSearchUrl(baseUrl: string, query: SearchQuery): string {
    const params = new URLSearchParams();
    params.append('q', query.query);
    
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  protected parseDate(dateString: string): string {
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  }
}

// Servicio para CENDOJ (Centro de Documentación Judicial)
export class CENDOJService extends LegalDatabaseService {
  private readonly baseUrl = 'https://www.poderjudicial.es/search/indexAN.jsp';
  
  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Simulación de búsqueda en CENDOJ
      // En implementación real, aquí iría la llamada a la API de CENDOJ
      const mockResults = this.generateMockResults(query, 'CENDOJ');
      
      return {
        documents: mockResults,
        totalResults: mockResults.length,
        searchTime: Date.now() - startTime,
        source: 'CENDOJ'
      };
    } catch (error) {
      console.error('Error searching CENDOJ:', error);
      return {
        documents: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        source: 'CENDOJ'
      };
    }
  }
  
  async getDocument(id: string): Promise<LegalDocument | null> {
    try {
      // Implementación para obtener documento completo de CENDOJ
      return null;
    } catch (error) {
      console.error('Error getting document from CENDOJ:', error);
      return null;
    }
  }
  
  private generateMockResults(query: SearchQuery, source: 'CENDOJ'): LegalDocument[] {
    return [
      {
        id: `${source.toLowerCase()}_1`,
        title: `Sentencia sobre ${query.query} - Tribunal Supremo`,
        court: 'Tribunal Supremo',
        date: '2024-01-15',
        reference: 'STS 001/2024',
        summary: `Resolución judicial relacionada con ${query.query}. El tribunal establece criterios claros sobre la materia objeto de consulta...`,
        relevance: 95,
        tags: ['Civil', 'Contractual', 'Jurisprudencia'],
        jurisdiction: 'Nacional',
        documentType: 'sentence',
        source,
        url: `https://www.poderjudicial.es/search/documento/${source.toLowerCase()}_1`
      },
      {
        id: `${source.toLowerCase()}_2`,
        title: `Auto sobre ${query.query} - Audiencia Nacional`,
        court: 'Audiencia Nacional',
        date: '2024-01-10',
        reference: 'AN 002/2024',
        summary: `Auto judicial que clarifica aspectos importantes sobre ${query.query}...`,
        relevance: 88,
        tags: ['Procesal', 'Medidas Cautelares'],
        jurisdiction: 'Nacional',
        documentType: 'auto',
        source,
        url: `https://www.poderjudicial.es/search/documento/${source.toLowerCase()}_2`
      }
    ];
  }
}

// Servicio para BOE (Boletín Oficial del Estado)
export class BOEService extends LegalDatabaseService {
  private readonly baseUrl = 'https://www.boe.es/buscar/act.php';
  
  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const mockResults = this.generateMockResults(query, 'BOE');
      
      return {
        documents: mockResults,
        totalResults: mockResults.length,
        searchTime: Date.now() - startTime,
        source: 'BOE'
      };
    } catch (error) {
      console.error('Error searching BOE:', error);
      return {
        documents: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        source: 'BOE'
      };
    }
  }
  
  async getDocument(id: string): Promise<LegalDocument | null> {
    try {
      return null;
    } catch (error) {
      console.error('Error getting document from BOE:', error);
      return null;
    }
  }
  
  private generateMockResults(query: SearchQuery, source: 'BOE'): LegalDocument[] {
    return [
      {
        id: `${source.toLowerCase()}_1`,
        title: `Ley relacionada con ${query.query}`,
        court: 'Congreso de los Diputados',
        date: '2024-01-01',
        reference: 'BOE-A-2024-001',
        summary: `Normativa legal que regula aspectos relacionados con ${query.query}...`,
        relevance: 92,
        tags: ['Legislación', 'Normativa'],
        jurisdiction: 'Nacional',
        documentType: 'law',
        source,
        url: `https://www.boe.es/eli/es/l/2024/01/01/1`
      }
    ];
  }
}

// Servicio para EUR-Lex (Derecho de la Unión Europea)
export class EURLexService extends LegalDatabaseService {
  private readonly baseUrl = 'https://eur-lex.europa.eu/search.html';
  
  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      const mockResults = this.generateMockResults(query, 'EUR-Lex');
      
      return {
        documents: mockResults,
        totalResults: mockResults.length,
        searchTime: Date.now() - startTime,
        source: 'EUR-Lex'
      };
    } catch (error) {
      console.error('Error searching EUR-Lex:', error);
      return {
        documents: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        source: 'EUR-Lex'
      };
    }
  }
  
  async getDocument(id: string): Promise<LegalDocument | null> {
    try {
      return null;
    } catch (error) {
      console.error('Error getting document from EUR-Lex:', error);
      return null;
    }
  }
  
  private generateMockResults(query: SearchQuery, source: 'EUR-Lex'): LegalDocument[] {
    return [
      {
        id: `${source.toLowerCase().replace('-', '_')}_1`,
        title: `Directiva UE sobre ${query.query}`,
        court: 'Tribunal de Justicia de la UE',
        date: '2024-01-05',
        reference: 'C-001/24',
        summary: `Directiva europea que establece el marco normativo para ${query.query}...`,
        relevance: 90,
        tags: ['Derecho UE', 'Directiva'],
        jurisdiction: 'Europea',
        documentType: 'regulation',
        source,
        url: `https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024L0001`
      }
    ];
  }
}

// Servicio agregador que combina múltiples fuentes
export class AggregatedLegalSearchService {
  private services: LegalDatabaseService[];
  
  constructor() {
    this.services = [
      new CENDOJService(),
      new BOEService(),
      new EURLexService()
    ];
  }
  
  async searchAll(query: SearchQuery): Promise<SearchResult[]> {
    const searchPromises = this.services.map(service => 
      service.search(query).catch(error => {
        console.error('Service search failed:', error);
        return {
          documents: [],
          totalResults: 0,
          searchTime: 0,
          source: 'Unknown'
        };
      })
    );
    
    return Promise.all(searchPromises);
  }
  
  async searchCombined(query: SearchQuery): Promise<SearchResult> {
    const results = await this.searchAll(query);
    const allDocuments = results.flatMap(result => result.documents);
    
    // Ordenar por relevancia
    allDocuments.sort((a, b) => b.relevance - a.relevance);
    
    return {
      documents: allDocuments,
      totalResults: allDocuments.length,
      searchTime: Math.max(...results.map(r => r.searchTime)),
      source: 'Agregado'
    };
  }
}

// Instancia singleton del servicio agregado
export const legalSearchService = new AggregatedLegalSearchService();