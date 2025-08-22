import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  BookOpen, 
  Scale, 
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  Star,
  Download,
  FileText,
  Clock,
  Tag,
  Share2,
  Database,
  Loader2
} from "lucide-react";
import { unifiedSearchService } from '@/services/unifiedSearchService';
import { SearchQuery, LegalDocument, SearchResult } from '@/services/legalDatabaseService';
import legalResearch from "@/assets/legal-research.jpg";
import { useToast } from "@/components/ui/use-toast";

const searchResults = [
  {
    id: 1,
    title: "Sentencia sobre incumplimiento contractual en arrendamientos",
    court: "Tribunal Supremo",
    date: "2024-01-10",
    reference: "STS 123/2024",
    summary: "El Tribunal establece criterios claros sobre las consecuencias del incumplimiento de obligaciones contractuales en contratos de arrendamiento urbano...",
    relevance: 95,
    tags: ["Arrendamiento", "Incumplimiento", "Civil"],
    jurisdiction: "Nacional"
  },
  {
    id: 2,
    title: "Resolución sobre despido improcedente en periodo de prueba",
    court: "Audiencia Nacional",
    date: "2024-01-08",
    reference: "AN 456/2024",
    summary: "La resolución clarifica las condiciones bajo las cuales un despido durante el periodo de prueba puede considerarse improcedente...",
    relevance: 88,
    tags: ["Laboral", "Despido", "Periodo Prueba"],
    jurisdiction: "Nacional"
  },
  {
    id: 3,
    title: "Auto sobre medidas cautelares en procedimiento mercantil",
    court: "Juzgado Mercantil Nº 1 Madrid",
    date: "2024-01-05",
    reference: "JM1M 789/2024",
    summary: "Establece los requisitos necesarios para la adopción de medidas cautelares en procedimientos mercantiles de especial complejidad...",
    relevance: 82,
    tags: ["Mercantil", "Medidas Cautelares", "Procedimiento"],
    jurisdiction: "Madrid"
  }
];

const quickSearches = [
  "Incumplimiento contractual",
  "Despido improcedente",
  "Medidas cautelares",
  "Custodia compartida",
  "Responsabilidad civil",
  "Derecho laboral"
];

export const LegalResearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("jurisprudence");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'public' | 'commercial'>('all');
  const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    jurisdiction: '',
    dateRange: '',
    court: '',
    documentType: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Cargar bases de datos disponibles al montar el componente
    const databases = unifiedSearchService.getAvailableDatabases();
    setAvailableDatabases(databases);
  }, []);

  useEffect(() => {
    // Obtener sugerencias cuando cambia la consulta
    if (searchQuery.length > 2) {
      const newSuggestions = unifiedSearchService.getSearchSuggestions(searchQuery);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setIsSearching(true);
    try {
      const query: SearchQuery = {
        query: searchQuery,
        filters: {
          jurisdiction: selectedFilters.jurisdiction || undefined,
          dateRange: selectedFilters.dateRange || undefined,
          court: selectedFilters.court || undefined,
          documentType: selectedFilters.documentType || undefined
        },
        operators: {
          exact: false,
          synonyms: true
        }
      };

      let result: SearchResult;
      
      switch (searchType) {
        case 'public':
          result = await unifiedSearchService.searchPublicOnly(query);
          break;
        case 'commercial':
          result = await unifiedSearchService.searchCommercialOnly(query);
          break;
        default:
          const searchData = await unifiedSearchService.searchAll(query);
          result = searchData.combined;
      }

      setSearchResults(result);
      toast({
        title: "Búsqueda completada",
        description: `Se encontraron ${result.totalResults} resultados en ${result.searchTime}ms`
      });
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      toast({
        title: "Error en la búsqueda",
        description: "No se pudo completar la búsqueda. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    // Ejecutar búsqueda automáticamente
    setTimeout(() => handleSearch(), 100);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearCache = () => {
    unifiedSearchService.clearCache();
    toast({
      title: "Caché limpiado",
      description: "Se ha limpiado el caché de búsquedas."
    });
  };

  const getCacheStats = () => {
    return unifiedSearchService.getCacheStats();
  };

  // Función para renderizar los resultados de búsqueda
  const renderSearchResults = () => {
    if (!searchResults || searchResults.documents.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No se encontraron resultados. Intenta con otros términos de búsqueda.</p>
        </div>
      );
    }

    return searchResults.documents.map((doc: LegalDocument, index: number) => (
      <Card key={index} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 text-legal-primary">
                {doc.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Scale className="h-4 w-4" />
                  {doc.court}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(doc.date).toLocaleDateString('es-ES')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {doc.jurisdiction}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="h-3 w-3 mr-1" />
                {doc.relevance}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {doc.summary && (
            <p className="text-gray-700 mb-3 text-sm leading-relaxed">
              {doc.summary}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {doc.tags.map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Referencia:</span> {doc.reference}
              {doc.source && (
                <span className="ml-3">
                  <span className="font-medium">Fuente:</span> {doc.source}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {doc.url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver
                  </a>
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-1" />
                Compartir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black/10" />
        <img 
          src={legalResearch} 
          alt="Legal Research" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        <div className="relative p-8">
          <h1 className="text-3xl font-bold mb-2">Investigación Jurídica</h1>
          <p className="text-primary-foreground/90">
            Encuentra jurisprudencia, legislación y doctrina relevante con IA
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-legal-primary" />
            Búsqueda Inteligente
          </CardTitle>
          <CardDescription>
            Utiliza lenguaje natural para encontrar información jurídica relevante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Barra de búsqueda principal */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Label htmlFor="search" className="sr-only">Búsqueda</Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej: Sentencias sobre incumplimiento de contrato de arrendamiento"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              <Select value={searchType} onValueChange={(value: 'all' | 'public' | 'commercial') => setSearchType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo de búsqueda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fuentes</SelectItem>
                  <SelectItem value="public">Solo públicas</SelectItem>
                  <SelectItem value="commercial">Solo comerciales</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()} variant="legal">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            {/* Sugerencias de búsqueda */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 mr-2">Sugerencias:</span>
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            {/* Filtros avanzados */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <Select value={selectedFilters.jurisdiction} onValueChange={(value) => handleFilterChange('jurisdiction', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Jurisdicción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="penal">Penal</SelectItem>
                  <SelectItem value="laboral">Laboral</SelectItem>
                  <SelectItem value="contencioso">Contencioso-Administrativo</SelectItem>
                  <SelectItem value="mercantil">Mercantil</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilters.court} onValueChange={(value) => handleFilterChange('court', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tribunal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="supremo">Tribunal Supremo</SelectItem>
                  <SelectItem value="constitucional">Tribunal Constitucional</SelectItem>
                  <SelectItem value="audiencia_nacional">Audiencia Nacional</SelectItem>
                  <SelectItem value="tsj">Tribunal Superior de Justicia</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Cualquier fecha</SelectItem>
                  <SelectItem value="last_month">Último mes</SelectItem>
                  <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                  <SelectItem value="last_year">Último año</SelectItem>
                  <SelectItem value="last_5_years">Últimos 5 años</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFilters.documentType} onValueChange={(value) => handleFilterChange('documentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="sentencia">Sentencias</SelectItem>
                  <SelectItem value="auto">Autos</SelectItem>
                  <SelectItem value="providencia">Providencias</SelectItem>
                  <SelectItem value="ley">Leyes</SelectItem>
                  <SelectItem value="decreto">Decretos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Quick Searches */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Búsquedas rápidas:</Label>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((search, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-legal-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleQuickSearch(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>

            {/* Información de bases de datos disponibles */}
            {availableDatabases.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Bases de datos disponibles:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableDatabases.map((db, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {db.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Controles de caché */}
            <div className="flex justify-between items-center mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                Caché: {getCacheStats().size}/{getCacheStats().maxSize} entradas
              </div>
              <Button variant="outline" size="sm" onClick={clearCache}>
                Limpiar caché
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resultados de Búsqueda
            {searchResults && (
              <Badge variant="secondary" className="ml-2">
                {searchResults.totalResults} resultados
              </Badge>
            )}
          </CardTitle>
          {searchResults && (
            <CardDescription>
              Búsqueda completada en {searchResults.searchTime}ms desde {searchResults.source}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jurisprudence">Jurisprudencia</TabsTrigger>
              <TabsTrigger value="legislation">Legislación</TabsTrigger>
              <TabsTrigger value="doctrine">Doctrina</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jurisprudence" className="space-y-4">
              {renderSearchResults()}
            </TabsContent>
            
            <TabsContent value="legislation" className="space-y-4">
              {renderSearchResults()}
            </TabsContent>
            
            <TabsContent value="doctrine" className="space-y-4">
              {renderSearchResults()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};