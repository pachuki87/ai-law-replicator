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
  CheckCircle
} from "lucide-react";
import documentAutomation from "@/assets/document-automation.jpg";
import { useToast } from "@/components/ui/use-toast";

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
    
    // Simular generación de documento
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Documento Generado",
        description: `${documentTypes.find(d => d.id === selectedType)?.name} creado exitosamente`,
      });
    }, 3000);
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
                <Button variant="legalOutline">
                  <Eye className="mr-2 h-4 w-4" />
                  Vista Previa
                </Button>
              </div>
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