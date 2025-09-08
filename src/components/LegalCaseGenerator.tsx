import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, FileText, Folder, AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CaseGenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  description: string;
}

interface GeneratedCase {
  caseName: string;
  caseType: string;
  structure: {
    folders: string[];
    files: string[];
  };
  documents: {
    readme: string;
    demanda: string;
    investigacion: string;
    estrategia: string;
    complementarios: string;
  };
  webVersion: {
    html: string;
    css: string;
  };
}

const LegalCaseGenerator: React.FC = () => {
  const [caseDetails, setCaseDetails] = useState({
    caseName: '',
    caseType: '',
    description: '',
    clientName: '',
    defendantName: '',
    jurisdiction: ''
  });

  const [generationSteps, setGenerationSteps] = useState<CaseGenerationStep[]>([
    {
      id: 'sequential-thinking',
      name: 'Sequential Thinking MCP',
      status: 'pending',
      description: 'Análisis inicial y planificación del caso'
    },
    {
      id: 'boe-consultation',
      name: 'Consulta BOE',
      status: 'pending',
      description: 'Búsqueda de normativa actualizada'
    },
    {
      id: 'cendoj-search',
      name: 'Búsqueda CENDOJ',
      status: 'pending',
      description: 'Investigación de jurisprudencia relevante'
    },
    {
      id: 'folder-structure',
      name: 'Estructura de Carpetas',
      status: 'pending',
      description: 'Creación de carpetas y archivos'
    },
    {
      id: 'document-generation',
      name: 'Generación de Documentos',
      status: 'pending',
      description: 'Creación de plantillas legales'
    },
    {
      id: 'web-version',
      name: 'Versión Web',
      status: 'pending',
      description: 'Generación de presentación HTML'
    },
    {
      id: 'validation',
      name: 'Validación Legal',
      status: 'pending',
      description: 'Verificación de reglas fundamentales'
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCase, setGeneratedCase] = useState<GeneratedCase | null>(null);
  const [progress, setProgress] = useState(0);

  const caseTypes = [
    'Civil - Responsabilidad Civil',
    'Civil - Contratos',
    'Civil - Propiedad',
    'Laboral - Despido',
    'Laboral - Incapacidad',
    'Penal - Delitos Menores',
    'Administrativo - Sanciones',
    'Mercantil - Sociedades',
    'Familia - Divorcio',
    'Familia - Custodia'
  ];

  const updateStepStatus = (stepId: string, status: CaseGenerationStep['status']) => {
    setGenerationSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const simulateSequentialThinking = async () => {
    updateStepStatus('sequential-thinking', 'in_progress');
    
    // Simular llamada a Sequential Thinking MCP
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateStepStatus('sequential-thinking', 'completed');
    setProgress(14);
  };

  const simulateBOEConsultation = async () => {
    updateStepStatus('boe-consultation', 'in_progress');
    
    // Simular consulta al BOE
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateStepStatus('boe-consultation', 'completed');
    setProgress(28);
  };

  const simulateCENDOJSearch = async () => {
    updateStepStatus('cendoj-search', 'in_progress');
    
    // Simular búsqueda en CENDOJ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    updateStepStatus('cendoj-search', 'completed');
    setProgress(42);
  };

  const generateFolderStructure = async () => {
    updateStepStatus('folder-structure', 'in_progress');
    
    // Simular creación de estructura
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateStepStatus('folder-structure', 'completed');
    setProgress(56);
  };

  const generateDocuments = async () => {
    updateStepStatus('document-generation', 'in_progress');
    
    // Simular generación de documentos
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    updateStepStatus('document-generation', 'completed');
    setProgress(70);
  };

  const generateWebVersion = async () => {
    updateStepStatus('web-version', 'in_progress');
    
    // Simular generación web
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateStepStatus('web-version', 'completed');
    setProgress(84);
  };

  const validateLegalRules = async () => {
    updateStepStatus('validation', 'in_progress');
    
    // Simular validación
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateStepStatus('validation', 'completed');
    setProgress(100);
  };

  const generateCase = async () => {
    if (!caseDetails.caseName || !caseDetails.caseType) {
      alert('Por favor, completa los campos obligatorios');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Ejecutar pasos secuencialmente
      await simulateSequentialThinking();
      await simulateBOEConsultation();
      await simulateCENDOJSearch();
      await generateFolderStructure();
      await generateDocuments();
      await generateWebVersion();
      await validateLegalRules();

      // Generar caso completo
      const newCase: GeneratedCase = {
        caseName: caseDetails.caseName,
        caseType: caseDetails.caseType,
        structure: {
          folders: [
            `${caseDetails.caseName}/`,
            `${caseDetails.caseName}/documentos/`,
            `${caseDetails.caseName}/web_version/`,
            `${caseDetails.caseName}/web_version/assets/`,
            `${caseDetails.caseName}/recursos/`,
            `${caseDetails.caseName}/recursos/jurisprudencia/`,
            `${caseDetails.caseName}/recursos/normativa/`,
            `${caseDetails.caseName}/recursos/referencias/`
          ],
          files: [
            `${caseDetails.caseName}/README.md`,
            `${caseDetails.caseName}/documentos/01_demanda.md`,
            `${caseDetails.caseName}/documentos/01_demanda.pdf`,
            `${caseDetails.caseName}/documentos/02_investigacion_juridica.md`,
            `${caseDetails.caseName}/documentos/02_investigacion_juridica.pdf`,
            `${caseDetails.caseName}/documentos/03_estrategia_procesal.md`,
            `${caseDetails.caseName}/documentos/03_estrategia_procesal.pdf`,
            `${caseDetails.caseName}/documentos/04_documentos_complementarios.md`,
            `${caseDetails.caseName}/documentos/04_documentos_complementarios.pdf`,
            `${caseDetails.caseName}/web_version/index.html`,
            `${caseDetails.caseName}/web_version/styles.css`
          ]
        },
        documents: {
          readme: generateReadmeTemplate(),
          demanda: generateDemandaTemplate(),
          investigacion: generateInvestigacionTemplate(),
          estrategia: generateEstrategiaTemplate(),
          complementarios: generateComplementariosTemplate()
        },
        webVersion: {
          html: generateHTMLTemplate(),
          css: generateCSSTemplate()
        }
      };

      setGeneratedCase(newCase);
    } catch (error) {
      console.error('Error generando caso:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReadmeTemplate = () => {
    return `# ${caseDetails.caseName.toUpperCase()}

## Resumen Ejecutivo
${caseDetails.description}

## Tipo de Procedimiento
${caseDetails.caseType}

## Documentos Incluidos
1. Demanda
2. Investigación Jurídica
3. Estrategia Procesal
4. Documentos Complementarios

## Normativa Aplicable
- Normativa específica aplicable al caso
- Últimas modificaciones legislativas
- Principios del Código Civil español

## Jurisprudencia Relevante
- Casos similares encontrados en CENDOJ
- Sentencias del Tribunal Supremo
- Doctrina de Audiencias Provinciales

## Fecha de Creación
${new Date().toLocaleDateString('es-ES')}`;
  };

  const generateDemandaTemplate = () => {
    return `# DEMANDA - ${caseDetails.caseName.toUpperCase()}

## I. DATOS DE IDENTIFICACIÓN
### Demandante
${caseDetails.clientName}

### Demandado
${caseDetails.defendantName}

### Juzgado
${caseDetails.jurisdiction}

## II. ANTECEDENTES DE HECHO
${caseDetails.description}

## III. FUNDAMENTOS DE DERECHO
### Normativa Aplicable
[Referencias específicas a leyes y reglamentos]

### Jurisprudencia
[Casos precedentes relevantes]

## IV. PETICIONES
[Solicitudes concretas al juzgado]

## V. DOCUMENTOS ADJUNTOS
[Lista de pruebas y documentación]`;
  };

  const generateInvestigacionTemplate = () => {
    return `# INVESTIGACIÓN JURÍDICA - ${caseDetails.caseName.toUpperCase()}

## I. MARCO NORMATIVO
### Legislación Nacional
[Leyes aplicables del ordenamiento español]

### Normativa Europea
[Directivas y reglamentos UE si aplican]

### Normativa Autonómica
[Legislación específica de la comunidad autónoma]

## II. JURISPRUDENCIA RELEVANTE
### Tribunal Supremo
[Sentencias del TS]

### Audiencias Provinciales
[Sentencias de AP relevantes]

### Tribunales Superiores de Justicia
[Sentencias TSJ si aplican]

## III. DOCTRINA CIENTÍFICA
[Referencias académicas y comentarios]

## IV. ANÁLISIS COMPARATIVO
[Comparación con casos similares]`;
  };

  const generateEstrategiaTemplate = () => {
    return `# ESTRATEGIA PROCESAL - ${caseDetails.caseName.toUpperCase()}

## I. ANÁLISIS DE VIABILIDAD
### Fortalezas del Caso
[Puntos a favor]

### Debilidades y Riesgos
[Puntos en contra y cómo mitigarlos]

## II. ESTRATEGIA DE ALEGACIONES
### Línea Argumental Principal
[Argumento central]

### Líneas Argumentales Subsidiarias
[Argumentos alternativos]

## III. ESTRATEGIA PROBATORIA
### Pruebas Disponibles
[Documentos, testigos, periciales]

### Pruebas a Solicitar
[Diligencias de prueba necesarias]

## IV. CALENDARIO PROCESAL
[Plazos y fechas importantes]

## V. RECURSOS PREVISTOS
[Posibles recursos en caso de sentencia desfavorable]`;
  };

  const generateComplementariosTemplate = () => {
    return `# DOCUMENTOS COMPLEMENTARIOS - ${caseDetails.caseName.toUpperCase()}

## Documentación Adicional
- Contratos relevantes
- Correspondencia
- Informes técnicos
- Documentación médica (si aplica)

## Recursos Procesales
- Modelos de escritos
- Formularios oficiales
- Plantillas de recursos

## Referencias Normativas
- Textos legales completos
- Modificaciones recientes
- Jurisprudencia complementaria`;
  };

  const generateHTMLTemplate = () => {
    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${caseDetails.caseName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>${caseDetails.caseName}</h1>
        <p class="case-type">${caseDetails.caseType}</p>
    </header>
    
    <main>
        <section class="summary">
            <h2>Resumen Ejecutivo</h2>
            <p>${caseDetails.description}</p>
        </section>
        
        <section class="documents">
            <h2>Documentos del Caso</h2>
            <div class="document-grid">
                <div class="document-card">
                    <h3>Demanda</h3>
                    <p>Documento principal del procedimiento</p>
                </div>
                <div class="document-card">
                    <h3>Investigación Jurídica</h3>
                    <p>Marco normativo y jurisprudencia</p>
                </div>
                <div class="document-card">
                    <h3>Estrategia Procesal</h3>
                    <p>Plan de actuación legal</p>
                </div>
                <div class="document-card">
                    <h3>Documentos Complementarios</h3>
                    <p>Recursos adicionales</p>
                </div>
            </div>
        </section>
    </main>
    
    <footer>
        <p>Generado el ${new Date().toLocaleDateString('es-ES')}</p>
    </footer>
</body>
</html>`;
  };

  const generateCSSTemplate = () => {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

header {
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    color: white;
    padding: 2rem;
    text-align: center;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.case-type {
    font-size: 1.2rem;
    opacity: 0.9;
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

section {
    background: white;
    margin-bottom: 2rem;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
    color: #1e3a8a;
    margin-bottom: 1rem;
    font-size: 1.8rem;
}

.document-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.document-card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 6px;
    border-left: 4px solid #3b82f6;
}

.document-card h3 {
    color: #1e3a8a;
    margin-bottom: 0.5rem;
}

footer {
    text-align: center;
    padding: 2rem;
    color: #666;
    background: white;
    margin-top: 2rem;
}`;
  };

  const downloadCase = () => {
    if (!generatedCase) return;
    
    // Crear archivo ZIP con toda la estructura
    const caseData = {
      structure: generatedCase.structure,
      documents: generatedCase.documents,
      webVersion: generatedCase.webVersion
    };
    
    const dataStr = JSON.stringify(caseData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedCase.caseName}_estructura.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const getStepIcon = (status: CaseGenerationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Generador de Casos Legales
          </CardTitle>
          <CardDescription>
            Crea casos legales completos siguiendo el flujo estructurado con Sequential Thinking MCP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseName">Nombre del Caso *</Label>
              <Input
                id="caseName"
                value={caseDetails.caseName}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, caseName: e.target.value }))}
                placeholder="Ej: Demanda_Responsabilidad_Civil_Accidente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caseType">Tipo de Caso *</Label>
              <Select onValueChange={(value) => setCaseDetails(prev => ({ ...prev, caseType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de caso" />
                </SelectTrigger>
                <SelectContent>
                  {caseTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientName">Nombre del Cliente</Label>
              <Input
                id="clientName"
                value={caseDetails.clientName}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Nombre completo del demandante"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defendantName">Nombre del Demandado</Label>
              <Input
                id="defendantName"
                value={caseDetails.defendantName}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, defendantName: e.target.value }))}
                placeholder="Nombre de la parte contraria"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdicción</Label>
              <Input
                id="jurisdiction"
                value={caseDetails.jurisdiction}
                onChange={(e) => setCaseDetails(prev => ({ ...prev, jurisdiction: e.target.value }))}
                placeholder="Juzgado competente"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Caso</Label>
            <Textarea
              id="description"
              value={caseDetails.description}
              onChange={(e) => setCaseDetails(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe brevemente los hechos y circunstancias del caso..."
              rows={4}
            />
          </div>
          
          <Button 
            onClick={generateCase} 
            disabled={isGenerating || !caseDetails.caseName || !caseDetails.caseType}
            className="w-full"
          >
            {isGenerating ? 'Generando Caso...' : 'Generar Caso Legal Completo'}
          </Button>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Generación</CardTitle>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generationSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="font-medium">{step.name}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {generatedCase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-6 h-6" />
              Caso Generado: {generatedCase.caseName}
            </CardTitle>
            <CardDescription>
              Estructura completa del caso legal con todos los documentos y versión web
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Sequential Thinking MCP utilizado | ✅ Normativa BOE consultada | ✅ Jurisprudencia CENDOJ incluida | ✅ 3 Reglas fundamentales aplicadas
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Estructura de Carpetas:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  {generatedCase.structure.folders.map((folder, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <Folder className="w-4 h-4 text-blue-500" />
                      {folder}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Archivos Generados:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  {generatedCase.structure.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-green-500" />
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Button onClick={downloadCase} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Descargar Estructura del Caso
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LegalCaseGenerator;