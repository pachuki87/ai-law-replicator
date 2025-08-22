import { useState } from "react";
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
  FileDown
} from "lucide-react";
import documentAutomation from "@/assets/document-automation.jpg";
import { useToast } from "@/components/ui/use-toast";
import { aiDocumentService, type GeneratedDocument } from "@/services/aiDocumentService";
import { documentDownloadService } from "@/services/documentDownloadService";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    clientName: "",
    caseNumber: "",
    details: "",
    urgency: "normal"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedType || !formData.clientName) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedDocType = documentTypes.find(d => d.id === selectedType);
      if (!selectedDocType) {
        throw new Error("Tipo de documento no encontrado");
      }

      const document = await aiDocumentService.generateDocument({
        typeName: selectedDocType.name,
        clientName: formData.clientName,
        caseNumber: formData.caseNumber || `AUTO-${Date.now()}`,
        details: formData.details,
        urgency: formData.urgency as 'low' | 'normal' | 'high' | 'urgent'
      });

      setGeneratedDocument(document);
      toast({
        title: "Documento Generado",
        description: `${selectedDocType.name} creado exitosamente con ${document.provider.toUpperCase()}`,
      });
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
      const selectedDocType = documentTypes.find(type => type.id === selectedType);
      const fileName = `${selectedDocType?.name || 'Documento'}_${formData.clientName || 'Cliente'}_${new Date().toISOString().split('T')[0]}`;
      
      await documentDownloadService.downloadAsPDF(
        generatedDocument.content,
        fileName,
        {
          title: selectedDocType?.name || 'Documento Legal',
          clientName: formData.clientName,
          caseNumber: formData.caseNumber,
          date: new Date().toLocaleDateString('es-ES')
        }
      );
      
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
      const selectedDocType = documentTypes.find(type => type.id === selectedType);
      const fileName = `${selectedDocType?.name || 'Documento'}_${formData.clientName || 'Cliente'}_${new Date().toISOString().split('T')[0]}`;
      
      await documentDownloadService.downloadAsWord(
        generatedDocument.content,
        fileName,
        {
          title: selectedDocType?.name || 'Documento Legal',
          clientName: formData.clientName,
          caseNumber: formData.caseNumber,
          date: new Date().toLocaleDateString('es-ES')
        }
      );
      
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
                <Label htmlFor="document-type">Tipo de Documento *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Nombre del Cliente *</Label>
                  <Input
                    id="client-name"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    placeholder="Ej: María García López"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="case-number">Número de Caso</Label>
                  <Input
                    id="case-number"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                    placeholder="Ej: CIV-2024-001"
                  />
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="details">Detalles Específicos</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  placeholder="Describe los aspectos específicos del documento que necesitas..."
                  rows={4}
                />
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
            <CardContent className="space-y-3">
              {recentDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-legal-neutral transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.type} • {doc.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === "Completado" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};