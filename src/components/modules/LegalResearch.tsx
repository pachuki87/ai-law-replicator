import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  BookOpen, 
  Scale, 
  Filter,
  Calendar,
  MapPin,
  ExternalLink,
  Star,
  Download
} from "lucide-react";
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
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un término de búsqueda",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simular búsqueda
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Búsqueda Completada",
        description: `Se encontraron ${searchResults.length} resultados para "${searchQuery}"`,
      });
    }, 2000);
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
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Búsqueda</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Sentencias sobre incumplimiento de contrato de arrendamiento"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} variant="legal">
              {isSearching ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
            <Button variant="legalOutline">
              <Filter className="h-4 w-4" />
            </Button>
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
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jurisprudence" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Jurisprudencia
          </TabsTrigger>
          <TabsTrigger value="legislation" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Legislación
          </TabsTrigger>
          <TabsTrigger value="doctrine" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Doctrina
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jurisprudence" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Resultados de Jurisprudencia</h3>
            <span className="text-sm text-muted-foreground">{searchResults.length} resultados encontrados</span>
          </div>
          
          {searchResults.map((result) => (
            <Card key={result.id} className="hover:shadow-card transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-legal-primary hover:text-primary-glow cursor-pointer">
                      {result.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Scale className="h-4 w-4" />
                        {result.court}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {result.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {result.jurisdiction}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-legal-accent/20 text-legal-accent">
                      {result.relevance}% relevancia
                    </Badge>
                    <span className="font-mono text-sm text-muted-foreground">{result.reference}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{result.summary}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="legislation" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Resultados de legislación aparecerán aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctrine" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <div className="text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Resultados de doctrina aparecerán aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};