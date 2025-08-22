// Servicio de configuración para las APIs de bases de datos jurídicas

export interface DatabaseConfig {
  aranzadi?: {
    apiKey?: string;
    baseUrl: string;
  };
  laley?: {
    apiKey?: string;
    baseUrl: string;
  };
  vlex?: {
    apiKey?: string;
    baseUrl: string;
  };
  iustel?: {
    apiKey?: string;
    baseUrl: string;
  };
  cendoj: {
    baseUrl: string;
  };
  boe: {
    baseUrl: string;
  };
  eurlex: {
    baseUrl: string;
  };
}

export interface AppConfig {
  databases: DatabaseConfig;
  cache: {
    enabled: boolean;
    duration: number;
  };
  search: {
    maxResultsPerSource: number;
    timeout: number;
  };
  rateLimit: {
    requests: number;
    window: number;
  };
}

class ConfigService {
  private config: AppConfig;
  
  constructor() {
    this.config = this.loadConfig();
  }
  
  private loadConfig(): AppConfig {
    return {
      databases: {
        // Bases de datos comerciales
        aranzadi: {
          apiKey: import.meta.env.VITE_ARANZADI_API_KEY,
          baseUrl: import.meta.env.VITE_ARANZADI_BASE_URL || 'https://insignis.aranzadidigital.es'
        },
        laley: {
          apiKey: import.meta.env.VITE_LALEY_API_KEY,
          baseUrl: import.meta.env.VITE_LALEY_BASE_URL || 'https://laleydigital.wolterskluwer.es'
        },
        vlex: {
          apiKey: import.meta.env.VITE_VLEX_API_KEY,
          baseUrl: import.meta.env.VITE_VLEX_BASE_URL || 'https://vlex.es/search'
        },
        iustel: {
          apiKey: import.meta.env.VITE_IUSTEL_API_KEY,
          baseUrl: import.meta.env.VITE_IUSTEL_BASE_URL || 'https://www.iustel.com'
        },
        // Bases de datos públicas
        cendoj: {
          baseUrl: import.meta.env.VITE_CENDOJ_BASE_URL || 'https://www.poderjudicial.es/search/indexAN.jsp'
        },
        boe: {
          baseUrl: import.meta.env.VITE_BOE_BASE_URL || 'https://www.boe.es/buscar/act.php'
        },
        eurlex: {
          baseUrl: import.meta.env.VITE_EUR_LEX_BASE_URL || 'https://eur-lex.europa.eu/search.html'
        }
      },
      cache: {
        enabled: import.meta.env.VITE_CACHE_ENABLED === 'true',
        duration: parseInt(import.meta.env.VITE_CACHE_DURATION || '3600000') // 1 hora por defecto
      },
      search: {
        maxResultsPerSource: parseInt(import.meta.env.VITE_MAX_RESULTS_PER_SOURCE || '50'),
        timeout: parseInt(import.meta.env.VITE_SEARCH_TIMEOUT || '30000') // 30 segundos
      },
      rateLimit: {
        requests: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS || '100'),
        window: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '3600000') // 1 hora
      }
    };
  }
  
  getConfig(): AppConfig {
    return this.config;
  }
  
  getDatabaseConfig(): DatabaseConfig {
    return this.config.databases;
  }
  
  isCommercialDatabaseConfigured(database: 'aranzadi' | 'laley' | 'vlex' | 'iustel'): boolean {
    const dbConfig = this.config.databases[database];
    return !!(dbConfig && dbConfig.apiKey);
  }
  
  getAvailableDatabases(): string[] {
    const available = ['cendoj', 'boe', 'eurlex']; // Públicas siempre disponibles
    
    if (this.isCommercialDatabaseConfigured('aranzadi')) available.push('aranzadi');
    if (this.isCommercialDatabaseConfigured('laley')) available.push('laley');
    if (this.isCommercialDatabaseConfigured('vlex')) available.push('vlex');
    if (this.isCommercialDatabaseConfigured('iustel')) available.push('iustel');
    
    return available;
  }
  
  isCacheEnabled(): boolean {
    return this.config.cache.enabled;
  }
  
  getCacheDuration(): number {
    return this.config.cache.duration;
  }
  
  getSearchTimeout(): number {
    return this.config.search.timeout;
  }
  
  getMaxResultsPerSource(): number {
    return this.config.search.maxResultsPerSource;
  }
}

// Instancia singleton del servicio de configuración
export const configService = new ConfigService();