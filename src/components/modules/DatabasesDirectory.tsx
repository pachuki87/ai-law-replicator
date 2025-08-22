import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, Building, Scale, BookOpen, Gavel, ArrowLeft, RefreshCw, Home } from 'lucide-react';

interface Database {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'commercial';
  url: string;
  icon: React.ComponentType<any>;
  categories: string[];
  status: 'active' | 'requires_subscription';
}

const databases: Database[] = [
  {
    id: 'cendoj',
    name: 'CENDOJ',
    description: 'Centro de Documentación Judicial - Jurisprudencia del Poder Judicial Español',
    type: 'public',
    url: 'https://www.poderjudicial.es/search/indexAN.jsp',
    icon: Scale,
    categories: ['Jurisprudencia', 'Tribunales Superiores', 'Audiencias Provinciales'],
    status: 'active'
  },
  {
    id: 'boe',
    name: 'BOE',
    description: 'Boletín Oficial del Estado - Legislación y normativa española',
    type: 'public',
    url: 'https://www.boe.es/buscar/',
    icon: BookOpen,
    categories: ['Legislación', 'Normativa', 'Disposiciones'],
    status: 'active'
  },
  {
    id: 'eurlex',
    name: 'EUR-Lex',
    description: 'Portal de acceso al derecho de la Unión Europea',
    type: 'public',
    url: 'https://eur-lex.europa.eu/search.html',
    icon: Globe,
    categories: ['Derecho UE', 'Tratados', 'Directivas', 'Reglamentos'],
    status: 'active'
  },
  {
    id: 'aranzadi',
    name: 'Aranzadi Digital',
    description: 'Base de datos jurídica integral con jurisprudencia, legislación y doctrina',
    type: 'commercial',
    url: 'https://insignis.aranzadidigital.es',
    icon: Building,
    categories: ['Jurisprudencia', 'Legislación', 'Doctrina', 'Formularios'],
    status: 'requires_subscription'
  },
  {
    id: 'laley',
    name: 'La Ley Digital',
    description: 'Plataforma jurídica de Wolters Kluwer con contenido especializado',
    type: 'commercial',
    url: 'https://laleydigital.wolterskluwer.es',
    icon: Gavel,
    categories: ['Jurisprudencia', 'Legislación', 'Doctrina', 'Comentarios'],
    status: 'requires_subscription'
  },
  {
    id: 'vlex',
    name: 'vLex',
    description: 'Portal jurídico internacional con contenido de múltiples jurisdicciones',
    type: 'commercial',
    url: 'https://vlex.es',
    icon: Globe,
    categories: ['Jurisprudencia Internacional', 'Legislación', 'Doctrina'],
    status: 'requires_subscription'
  },
  {
    id: 'iustel',
    name: 'Iustel',
    description: 'Portal del Derecho con jurisprudencia y legislación española',
    type: 'commercial',
    url: 'https://www.iustel.com',
    icon: Scale,
    categories: ['Jurisprudencia', 'Legislación', 'Revistas Jurídicas'],
    status: 'requires_subscription'
  }
];

export const DatabasesDirectory = () => {
  const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const publicDatabases = databases.filter(db => db.type === 'public');
  const commercialDatabases = databases.filter(db => db.type === 'commercial');

  const handleDatabaseAccess = (database: Database) => {
    if (database.status === 'active') {
      setSelectedDatabase(database);
    } else {
      // Aquí podrías mostrar un modal de suscripción o información
      alert(`${database.name} requiere suscripción. Contacta con el administrador para obtener acceso.`);
    }
  };

  const handleBackToList = () => {
    setSelectedDatabase(null);
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleGoHome = () => {
    if (selectedDatabase) {
      setIframeKey(prev => prev + 1);
    }
  };

  const renderDatabaseCard = (database: Database) => {
    const Icon = database.icon;
    
    return (
      <Card key={database.id} className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                database.type === 'public' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{database.name}</CardTitle>
                <Badge 
                  variant={database.type === 'public' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {database.type === 'public' ? 'Público' : 'Comercial'}
                </Badge>
              </div>
            </div>
            <Badge 
              variant={database.status === 'active' ? 'default' : 'outline'}
              className={database.status === 'active' ? 'bg-green-500' : ''}
            >
              {database.status === 'active' ? 'Activo' : 'Requiere Suscripción'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {database.description}
          </CardDescription>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Categorías:</h4>
            <div className="flex flex-wrap gap-1">
              {database.categories.map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={() => handleDatabaseAccess(database)}
              className="w-full"
              variant={database.status === 'active' ? 'default' : 'outline'}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {database.status === 'active' ? 'Acceder' : 'Información'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Si hay una base de datos seleccionada, mostrar el iframe
  if (selectedDatabase) {
    const Icon = selectedDatabase.icon;
    return (
      <div className="h-full flex flex-col">
        {/* Barra de navegación */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${
                selectedDatabase.type === 'public' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">{selectedDatabase.name}</h2>
              <Badge variant={selectedDatabase.type === 'public' ? 'default' : 'secondary'}>
                {selectedDatabase.type === 'public' ? 'Público' : 'Comercial'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>
        
        {/* Iframe container */}
        <div className="flex-1 relative">
          <iframe
            key={iframeKey}
            src={selectedDatabase.url}
            className="w-full h-full border-0"
            title={`${selectedDatabase.name} - Base de Datos Jurídica`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bases de Datos Jurídicas</h1>
        <p className="text-muted-foreground">
          Accede a las principales bases de datos jurídicas integradas en la plataforma.
          Las bases de datos públicas están disponibles de forma gratuita, mientras que las comerciales requieren suscripción.
        </p>
      </div>

      {/* Bases de Datos Públicas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <Globe className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold">Bases de Datos Públicas</h2>
          <Badge className="bg-green-500">Acceso Gratuito</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicDatabases.map(renderDatabaseCard)}
        </div>
      </div>

      {/* Bases de Datos Comerciales */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <Building className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold">Bases de Datos Comerciales</h2>
          <Badge variant="secondary">Requiere Suscripción</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commercialDatabases.map(renderDatabaseCard)}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-semibold">Información Importante</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Las bases de datos públicas están disponibles sin restricciones</li>
          <li>• Las bases de datos comerciales requieren suscripción activa</li>
          <li>• Todas las búsquedas se pueden realizar desde el módulo "Investigación Jurídica"</li>
          <li>• Los resultados se unifican automáticamente para facilitar la comparación</li>
        </ul>
      </div>
    </div>
  );
};