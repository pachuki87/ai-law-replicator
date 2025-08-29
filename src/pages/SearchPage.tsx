import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, FileText, Briefcase, ChevronDown, ChevronUp, Loader2, AlertCircle, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

interface SearchResult {
  id: string;
  type: 'client' | 'case' | 'document';
  title: string;
  subtitle?: string;
  description: string;
  status?: string;
  priority?: string;
  date?: string;
  tags?: string[];
}

interface SearchFilters {
  type: string;
  status: string;
  priority: string;
  dateRange: string;
  sortBy: string;
}

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const resultsPerPage = 10;

  const handleModuleChange = (module: string) => {
    console.log('Navigating to module:', module);
    switch (module) {
      case 'dashboard':
        navigate('/');
        break;
      case 'clients':
        navigate('/clients');
        break;
      case 'cases':
        navigate('/cases');
        break;
      case 'documents':
        navigate('/documents');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'search':
        // Ya estamos en search, no hacer nada
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        console.warn('Unknown module:', module);
    }
    setSidebarOpen(false);
  };

  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    sortBy: 'relevance'
  });

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim() || filters.type !== 'all') {
        performSearch();
      } else {
        setResults([]);
        setTotalResults(0);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters, currentPage]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];
      
      // Search clients
      if (filters.type === 'all' || filters.type === 'client') {
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
          .limit(resultsPerPage);

        if (clients) {
          clients.forEach(client => {
            searchResults.push({
              id: client.id,
              type: 'client',
              title: client.name,
              subtitle: client.email,
              description: `Teléfono: ${client.phone || 'No especificado'}`,
              date: new Date(client.created_at).toLocaleDateString('es-ES'),
              tags: ['Cliente']
            });
          });
        }
      }

      // Search cases
      if (filters.type === 'all' || filters.type === 'case') {
        const { data: cases } = await supabase
          .from('cases')
          .select(`
            *,
            clients(name)
          `)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(resultsPerPage);

        if (cases) {
          cases.forEach(caseItem => {
            searchResults.push({
              id: caseItem.id,
              type: 'case',
              title: caseItem.title,
              subtitle: `Cliente: ${caseItem.clients?.name || 'No asignado'}`,
              description: caseItem.description || 'Sin descripción',
              status: caseItem.status,
              priority: caseItem.priority,
              date: new Date(caseItem.created_at).toLocaleDateString('es-ES'),
              tags: [caseItem.case_type || 'Caso', caseItem.status]
            });
          });
        }
      }

      // Search documents
      if (filters.type === 'all' || filters.type === 'document') {
        const { data: documents } = await supabase
          .from('case_documents')
          .select(`
            *,
            cases(title)
          `)
          .or(`file_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(resultsPerPage);

        if (documents) {
          documents.forEach(doc => {
            searchResults.push({
              id: doc.id,
              type: 'document',
              title: doc.file_name,
              subtitle: `Caso: ${doc.cases?.title || 'No asignado'}`,
              description: doc.description || 'Sin descripción',
              date: new Date(doc.created_at).toLocaleDateString('es-ES'),
              tags: ['Documento', doc.document_type || 'General']
            });
          });
        }
      }

      // Apply additional filters
      let filteredResults = searchResults;
      
      if (filters.status !== 'all') {
        filteredResults = filteredResults.filter(result => result.status === filters.status);
      }
      
      if (filters.priority !== 'all') {
        filteredResults = filteredResults.filter(result => result.priority === filters.priority);
      }

      // Sort results
      if (filters.sortBy === 'date') {
        filteredResults.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
      } else if (filters.sortBy === 'title') {
        filteredResults.sort((a, b) => a.title.localeCompare(b.title));
      }

      setResults(filteredResults);
      setTotalResults(filteredResults.length);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'client': return <Users className="w-4 h-4" />;
      case 'case': return <Briefcase className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      sortBy: 'relevance'
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          activeModule="search"
          onModuleChange={handleModuleChange}
          isOpen={sidebarOpen}
        />
        
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Búsqueda Avanzada</h1>
              <p className="text-gray-600">Encuentra clientes, casos y documentos de manera eficiente</p>
            </div>

            {/* Search Bar */}
            <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Buscar clientes, casos, documentos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg border-0 focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Type Filter */}
                  <Select value={filters.type} onValueChange={(value: any) => setFilters({...filters, type: value})}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tipo de búsqueda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="client">Clientes</SelectItem>
                      <SelectItem value="case">Casos</SelectItem>
                      <SelectItem value="document">Documentos</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Filter */}
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevancia</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="title">Título</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Advanced Filters Toggle */}
                  <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filtros avanzados
                        {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="w-full mt-4">
                      <div className="flex flex-wrap gap-4">
                        <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="closed">Cerrado</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={filters.priority} onValueChange={(value) => setFilters({...filters, priority: value})}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Prioridad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las prioridades</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="low">Baja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Clear Filters */}
                  <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              {loading ? (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Buscando...</p>
                  </CardContent>
                </Card>
              ) : results.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-gray-600">
                      {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {results.map((result) => (
                    <Card key={result.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{result.title}</h3>
                                <p className="text-gray-600 mb-2">{result.subtitle}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {result.date && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    {result.date}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{result.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {result.tags?.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {result.status && (
                                <Badge className={`text-xs ${getStatusColor(result.status)}`}>
                                  {result.status}
                                </Badge>
                              )}
                              {result.priority && (
                                <Badge className={`text-xs ${getStatusColor(result.priority)}`}>
                                  Prioridad: {result.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </>
              ) : searchQuery.trim() || filters.type !== 'all' ? (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
                    <p className="text-gray-600 mb-4">
                      No se encontraron resultados para tu búsqueda. Intenta con otros términos o ajusta los filtros.
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Limpiar filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Comienza tu búsqueda</h3>
                    <p className="text-gray-600">
                      Ingresa términos de búsqueda o selecciona filtros para encontrar clientes, casos y documentos.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;