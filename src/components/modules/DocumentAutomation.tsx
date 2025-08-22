import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Eye, 
  Wand2,
  Plus,
  Clock,
  CheckCircle,
  FileDown,
  Loader2
} from "lucide-react";
import documentAutomation from "@/assets/document-automation.jpg";
import { useToast } from "@/components/ui/use-toast";
import { aiDocumentService, type GeneratedDocument } from "@/services/aiDocumentService";
import { documentDownloadService } from "@/services/documentDownloadService";
import { documentService } from "@/services/documentService";
import caseService from "@/services/caseService";
import { toast } from "sonner";
import { Database, Case } from "@/types/database";

type GeneratedDoc = Database['public']['Tables']['generated_documents']['Row'];
type DocumentTemplate = Database['public']['Tables']['document_templates']['Row'];

const documentTypes = [
  { id: "contract", name: "Contrato de Arrendamiento", description: "Contrato estándar de alquiler" },
  { id: "demand", name: "Demanda Civil", description: "Demanda por incumplimiento contractual" },
  { id: "appeal", name: "Recurso de Apelación", description: "Recurso contra sentencia" },
  { id: "agreement", name: "Convenio de Colaboración", description: "Acuerdo entre empresas" },
  { id: "power", name: "Poder Notarial", description: "Autorización legal" },
  { id: "complaint", name: "Denuncia Penal", description: "Denuncia por delito" },
];

const recentDocuments = [
  { name: "Contrato_Arrendamiento_001.pdf", type: "Contrato", date: "2024-01-15", status: "Completado" },
  { name: "Demanda_Civil_Garcia.pdf", type: "Demanda", date: "2024-01-14", status: "En Revisión" },
  { name: "Recurso_Apelacion_002.pdf", type: "Recurso", date: "2024-01-13", status: "Completado" },
];

export const DocumentAutomation = () => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedCase, setSelectedCase] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    variables: "{}",
    urgency: "normal"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<GeneratedDoc[]>([]);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [casesData, templatesData, recentDocsData] = await Promise.all([
        caseService.getCases(),
        documentService.getPublicTemplates(),
        documentService.getRecentDocuments(10)
      ]);
      setCases(casesData);
      setTemplates(templatesData);
      setRecentDocuments(recentDocsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedType || !formData.title || !selectedCase) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Create document in Supabase
      const newDocument = await documentService.createDocument({
        case_id: selectedCase,
        template_id: selectedType,
        title: formData.title,
        content: formData.content,
        variables: JSON.parse(formData.variables || '{}'),
        status: 'draft',
        version: 1
      });
      
      // Generate AI content if needed
      if (formData.content) {
        const document = await aiDocumentService.generateDocument(
          selectedType,
          {
            clientName: cases.find(c => c.id === selectedCase)?.title || '',
            caseNumber: selectedCase,
            details: formData.content,
            urgency: formData.urgency
          }
        );
        setGeneratedDocument(document);
      }
      
      // Reload recent documents
      await loadData();
      
      toast({
        title: "Documento creado",
        description: "El documento se ha creado exitosamente"
      });
      
      // Reset form
      setFormData({
        title: "",
        content: "",
        variables: "{}",
        urgency: "normal"
      });
      setSelectedType("");
      setSelectedCase("");
    } catch (error) {
      console.error('Error generando documento:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al generar el documento",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedDocument) return;
    
    setIsDownloading(true);
    try {
      await documentDownloadService.downloadAsPDF(generatedDocument);
      
      toast.success('Documento PDF descargado exitosamente');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error al descargar PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!generatedDocument) return;
    
    setIsDownloading(true);
    try {
      await documentDownloadService.downloadAsWord(generatedDocument);
      
      toast.success('Documento Word descargado exitosamente');
    } catch (error) {
      console.error('Error downloading Word:', error);
      toast.error('Error al descargar Word');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black/10" />
        <img 
          src={documentAutomation} 
          alt="Document Automation" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        <div className="relative p-8">
          <h1 className="text-3xl font-bold mb-2">Automatización de Documentos</h1>
          <p className="text-primary-foreground/90">
            Genera documentos legales profesionales con inteligencia artificial
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Generation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-legal-primary" />
                Generar Nuevo Documento
              </CardTitle>
              <CardDescription>
                Selecciona el tipo de documento y completa la información requerida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case-select">Caso *</Label>
                <Select value={selectedCase} onValueChange={setSelectedCase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un caso" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((case_) => (
                      <SelectItem key={case_.id} value={case_.id}>
                        {case_.title} - {case_.case_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-type">Plantilla de Documento *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-title">Título del Documento *</Label>
                <Input
                  id="document-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ingresa el título del documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido del Documento</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Describe el contenido específico que debe incluir el documento..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variables">Variables (JSON)</Label>
                <Textarea
                  id="variables"
                  value={formData.variables}
                  onChange={(e) => setFormData({...formData, variables: e.target.value})}
                  placeholder='{"variable1": "valor1", "variable2": "valor2"}'
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgencia</Label>
                <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                  variant="legal"
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Generar Documento
                    </>
                  )}
                </Button>
                {generatedDocument && (
                  <>
                    <Button 
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      variant="legalOutline"
                    >
                      {isDownloading ? (
                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileDown className="mr-2 h-4 w-4" />
                      )}
                      PDF
                    </Button>
                    <Button 
                      onClick={handleDownloadWord}
                      disabled={isDownloading}
                      variant="legalOutline"
                    >
                      {isDownloading ? (
                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileDown className="mr-2 h-4 w-4" />
                      )}
                      Word
                    </Button>
                  </>
                )}
              </div>
              
              {/* Mostrar documento generado */}
              {generatedDocument && (
                <div className="mt-6 p-4 border rounded-lg bg-legal-neutral/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-legal-primary">Documento Generado</h3>
                    <div className="text-xs text-muted-foreground">
                      Generado con {generatedDocument.provider.toUpperCase()} • {generatedDocument.createdAt}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto bg-white p-4 rounded border text-sm">
                    <pre className="whitespace-pre-wrap font-sans">{generatedDocument.content}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Templates and Recent Documents */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-legal-primary" />
                Plantillas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentTypes.slice(0, 4).map((type) => (
                <Button
                  key={type.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setSelectedType(type.id)}
                >
                  <div>
                    <div className="font-medium text-sm">{type.name}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-legal-primary" />
                Documentos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando documentos...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocuments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No hay documentos recientes
                    </p>
                  ) : (
                    recentDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-legal-neutral transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{doc.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {doc.status} • {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              toast({
                                title: "Función en desarrollo",
                                description: "La descarga de documentos estará disponible pronto"
                              });
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};