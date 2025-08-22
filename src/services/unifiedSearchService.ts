// Servicio unificado que combina todas las fuentes de bases de datos jurídicas

import { 
  AggregatedLegalSearchService, 
  SearchQuery, 
  SearchResult, 
  LegalDocument 
} from './legalDatabaseService';
import { CommercialLegalSearchService } from './commercialDatabaseService';
import { configService } from './configService';

// Interfaz para el caché
interface CacheEntry {
  data: SearchResult;
  timestamp: number;
  query: string;
}

// Servicio de caché simple
class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize = 100; // Máximo 100 entradas en caché
  
  private generateKey(query: SearchQuery): string {
    return JSON.stringify({
      query: query.query,
      filters: query.filters,
      operators: query.operators
    });
  }
  
  get(query: SearchQuery): SearchResult | null {
    if (!configService.isCacheEnabled()) {
      return null;
    }
    
    const key = this.generateKey(query);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const now = Date.now();
    const isExpired = (now - entry.timestamp) > configService.getCacheDuration();
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(query: SearchQuery, data: SearchResult): void {
    if (!configService.isCacheEnabled()) {
      return;
    }
    
    const key = this.generateKey(query);
    
    // Si el caché está lleno, eliminar la entrada más antigua
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      query: query.query
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// Servicio de rate limiting
class RateLimitService {
  private requests = new Map<string, number[]>();
  
  canMakeRequest(source: string): boolean {
    const config = configService.getConfig();
    const now = Date.now();
    const windowStart = now - config.rateLimit.window;
    
    if (!this.requests.has(source)) {
      this.requests.set(source, []);
    }
    
    const sourceRequests = this.requests.get(source)!;
    
    // Filtrar requests dentro de la ventana de tiempo
    const recentRequests = sourceRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(source, recentRequests);
    
    return recentRequests.length < config.rateLimit.requests;
  }
  
  recordRequest(source: string): void {
    const now = Date.now();
    
    if (!this.requests.has(source)) {
      this.requests.set(source, []);
    }
    
    this.requests.get(source)!.push(now);
  }
}

// Servicio unificado principal
export class UnifiedLegalSearchService {
  private publicSearchService: AggregatedLegalSearchService;
  private commercialSearchService: CommercialLegalSearchService;
  private cacheService: CacheService;
  private rateLimitService: RateLimitService;
  
  constructor() {
    this.publicSearchService = new AggregatedLegalSearchService();
    
    const dbConfig = configService.getDatabaseConfig();
    this.commercialSearchService = new CommercialLegalSearchService({
      aranzadi: dbConfig.aranzadi?.apiKey,
      laley: dbConfig.laley?.apiKey,
      vlex: dbConfig.vlex?.apiKey,
      iustel: dbConfig.iustel?.apiKey
    });
    
    this.cacheService = new CacheService();
    this.rateLimitService = new RateLimitService();
  }
  
  async searchAll(query: SearchQuery): Promise<{
    public: SearchResult[];
    commercial: SearchResult[];
    combined: SearchResult;
    fromCache: boolean;
  }> {
    // Verificar caché primero
    const cachedResult = this.cacheService.get(query);
    if (cachedResult) {
      return {
        public: [],
        commercial: [],
        combined: cachedResult,
        fromCache: true
      };
    }
    
    const startTime = Date.now();
    
    try {
      // Ejecutar búsquedas en paralelo con timeout
      const searchPromises = [];
      
      // Búsquedas públicas (siempre disponibles)
      if (this.rateLimitService.canMakeRequest('public')) {
        this.rateLimitService.recordRequest('public');
        searchPromises.push(
          Promise.race([
            this.publicSearchService.searchAll(query),
            this.createTimeoutPromise('public')
          ])
        );
      }
      
      // Búsquedas comerciales (solo si están configuradas)
      const availableDatabases = configService.getAvailableDatabases();
      const hasCommercialDatabases = availableDatabases.some(db => 
        ['aranzadi', 'laley', 'vlex', 'iustel'].includes(db)
      );
      
      if (hasCommercialDatabases && this.rateLimitService.canMakeRequest('commercial')) {
        this.rateLimitService.recordRequest('commercial');
        searchPromises.push(
          Promise.race([
            this.commercialSearchService.searchAll(query),
            this.createTimeoutPromise('commercial')
          ])
        );
      }
      
      const results = await Promise.allSettled(searchPromises);
      
      let publicResults: SearchResult[] = [];
      let commercialResults: SearchResult[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
          if (index === 0) {
            publicResults = result.value;
          } else {
            commercialResults = result.value;
          }
        }
      });
      
      // Combinar todos los resultados
      const allDocuments = [
        ...publicResults.flatMap(r => r.documents),
        ...commercialResults.flatMap(r => r.documents)
      ];
      
      // Eliminar duplicados basados en título y referencia
      const uniqueDocuments = this.removeDuplicates(allDocuments);
      
      // Ordenar por relevancia
      uniqueDocuments.sort((a, b) => b.relevance - a.relevance);
      
      // Limitar resultados según configuración
      const maxResults = configService.getMaxResultsPerSource() * 2; // Doble para fuentes combinadas
      const limitedDocuments = uniqueDocuments.slice(0, maxResults);
      
      const combinedResult: SearchResult = {
        documents: limitedDocuments,
        totalResults: limitedDocuments.length,
        searchTime: Date.now() - startTime,
        source: 'Unificado'
      };
      
      // Guardar en caché
      this.cacheService.set(query, combinedResult);
      
      return {
        public: publicResults,
        commercial: commercialResults,
        combined: combinedResult,
        fromCache: false
      };
      
    } catch (error) {
      console.error('Error in unified search:', error);
      
      return {
        public: [],
        commercial: [],
        combined: {
          documents: [],
          totalResults: 0,
          searchTime: Date.now() - startTime,
          source: 'Unificado'
        },
        fromCache: false
      };
    }
  }
  
  async searchPublicOnly(query: SearchQuery): Promise<SearchResult> {
    const cachedResult = this.cacheService.get({ ...query, query: `public_${query.query}` });
    if (cachedResult) {
      return cachedResult;
    }
    
    if (!this.rateLimitService.canMakeRequest('public')) {
      throw new Error('Rate limit exceeded for public databases');
    }
    
    this.rateLimitService.recordRequest('public');
    const result = await this.publicSearchService.searchCombined(query);
    
    this.cacheService.set({ ...query, query: `public_${query.query}` }, result);
    return result;
  }
  
  async searchCommercialOnly(query: SearchQuery): Promise<SearchResult> {
    const cachedResult = this.cacheService.get({ ...query, query: `commercial_${query.query}` });
    if (cachedResult) {
      return cachedResult;
    }
    
    if (!this.rateLimitService.canMakeRequest('commercial')) {
      throw new Error('Rate limit exceeded for commercial databases');
    }
    
    this.rateLimitService.recordRequest('commercial');
    const result = await this.commercialSearchService.searchCombined(query);
    
    this.cacheService.set({ ...query, query: `commercial_${query.query}` }, result);
    return result;
  }
  
  private createTimeoutPromise(source: string): Promise<SearchResult[]> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Search timeout for ${source} databases`));
      }, configService.getSearchTimeout());
    });
  }
  
  private removeDuplicates(documents: LegalDocument[]): LegalDocument[] {
    const seen = new Set<string>();
    return documents.filter(doc => {
      const key = `${doc.title}_${doc.reference}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  // Métodos de utilidad
  getAvailableDatabases(): string[] {
    return configService.getAvailableDatabases();
  }
  
  getCacheStats(): { size: number; maxSize: number } {
    return this.cacheService.getStats();
  }
  
  clearCache(): void {
    this.cacheService.clear();
  }
  
  getSearchSuggestions(partialQuery: string): string[] {
    // Sugerencias básicas basadas en términos legales comunes
    const suggestions = [
      'incumplimiento contractual',
      'despido improcedente',
      'medidas cautelares',
      'custodia compartida',
      'responsabilidad civil',
      'derecho laboral',
      'arrendamiento urbano',
      'procedimiento penal',
      'derecho administrativo',
      'derecho mercantil',
      'derecho constitucional',
      'derecho fiscal',
      'propiedad intelectual',
      'protección de datos',
      'derecho de familia'
    ];
    
    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(partialQuery.toLowerCase())
    ).slice(0, 5);
  }
}

// Instancia singleton del servicio unificado
export const unifiedSearchService = new UnifiedLegalSearchService();