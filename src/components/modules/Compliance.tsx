import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  FileCheck, 
  AlertTriangle,
  CheckCircle,
  Scan,
  Upload,
  Calendar,
  Target,
  BookOpen,
  Search
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ComplianceIssue {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  deadline?: string;
  status: 'pending' | 'in-progress' | 'resolved';
}

interface ComplianceArea {
  name: string;
  score: number;
  issues: number;
  lastReview: string;
}

const mockIssues: ComplianceIssue[] = [
  {
    id: '1',
    title: 'Actualización de política GDPR requerida',
    severity: 'high',
    description: 'Las políticas de privacidad necesitan actualizarse según las nuevas regulaciones',
    recommendation: 'Revisar y actualizar las cláusulas de consentimiento y derechos del interesado',
    deadline: '2024-02-15',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Registro de actividades de tratamiento incompleto',
    severity: 'medium',
    description: 'Faltan detalles en el registro de actividades de tratamiento de datos',
    recommendation: 'Completar la información sobre finalidades y bases legales',
    deadline: '2024-02-28',
    status: 'in-progress'
  },
  {
    id: '3',
    title: 'Contratos con proveedores sin cláusulas DPO',
    severity: 'medium',
    description: 'Algunos contratos no incluyen las cláusulas del Delegado de Protección de Datos',
    recommendation: 'Revisar y actualizar contratos con terceros procesadores',
    status: 'pending'
  }
];

const complianceAreas: ComplianceArea[] = [
  { name: 'Protección de Datos (GDPR)', score: 75, issues: 3, lastReview: '2024-01-10' },
  { name: 'Normativa Laboral', score: 92, issues: 1, lastReview: '2024-01-15' },
  { name: 'Compliance Financiero', score: 88, issues: 2, lastReview: '2024-01-08' },
  { name: 'Normativa Sectorial', score: 95, issues: 0, lastReview: '2024-01-12' },
];

export const Compliance = () => {
  const [issues, setIssues] = useState<ComplianceIssue[]>(mockIssues);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const getSeverityColor = (severity: ComplianceIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ComplianceIssue['status']) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Target className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const handleScan = async () => {
    setIsScanning(true);
    
    // Simular escaneo
    setTimeout(() => {
      setIsScanning(false);
      toast({
        title: "Escaneo Completado",
        description: "Se han identificado nuevos puntos de compliance para revisar",
      });
    }, 4000);
  };

  const overallScore = Math.round(complianceAreas.reduce((acc, area) => acc + area.score, 0) / complianceAreas.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Compliance y Normativa</h1>
        <p className="text-primary-foreground/90">
          Gestiona el cumplimiento normativo y detecta riesgos legales automáticamente
        </p>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Puntuación General de Compliance</h3>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}/100
                </div>
                <div className="flex-1">
                  <Progress value={overallScore} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {issues.filter(i => i.status === 'pending').length} problemas pendientes
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleScan} disabled={isScanning} variant="legal">
                {isScanning ? (
                  <>
                    <Scan className="mr-2 h-4 w-4 animate-spin" />
                    Escaneando...
                  </>
                ) : (
                  <>
                    <Scan className="mr-2 h-4 w-4" />
                    Escanear Compliance
                  </>
                )}
              </Button>
              <Button variant="legalOutline">
                <Upload className="mr-2 h-4 w-4" />
                Cargar Documentos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="issues" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Problemas
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="regulations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Normativas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceAreas.map((area, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                    <Badge variant={area.issues > 0 ? "destructive" : "default"}>
                      {area.issues} problemas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Puntuación</span>
                      <span className={`font-bold ${getScoreColor(area.score)}`}>
                        {area.score}/100
                      </span>
                    </div>
                    <Progress value={area.score} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Última revisión</span>
                      <span>{area.lastReview}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Problemas de Compliance Detectados</h3>
            <Badge variant="outline">{issues.length} total</Badge>
          </div>
          
          {issues.map((issue) => (
            <Card key={issue.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>{issue.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(issue.status)}
                    <span className="text-sm capitalize">{issue.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Recomendación:</h4>
                    <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                  </div>
                  
                  {issue.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span>Plazo límite: {issue.deadline}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="legal">Resolver</Button>
                    <Button size="sm" variant="outline">Más detalles</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos de Compliance</CardTitle>
              <CardDescription>
                Gestiona políticas, procedimientos y documentación normativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Política de Privacidad", status: "Actualizada", date: "2024-01-15" },
                  { name: "Manual de Compliance", status: "Pendiente", date: "2023-12-20" },
                  { name: "Registro de Actividades", status: "En Revisión", date: "2024-01-10" },
                  { name: "Contratos DPO", status: "Actualizada", date: "2024-01-08" },
                  { name: "Política de Cookies", status: "Pendiente", date: "2023-11-30" },
                  { name: "Procedimientos GDPR", status: "Actualizada", date: "2024-01-12" }
                ].map((doc, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-legal-neutral transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <FileCheck className="h-5 w-5 text-legal-primary" />
                      <Badge 
                        variant={doc.status === "Actualizada" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{doc.name}</h4>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-legal-primary" />
                Búsqueda de Normativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input placeholder="Buscar normativas, reglamentos, directivas..." className="flex-1" />
                <Button variant="legal">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {[
                  { title: "RGPD - Reglamento General de Protección de Datos", type: "UE", updated: "2024-01-15" },
                  { title: "LOPDGDD - Ley Orgánica de Protección de Datos", type: "Nacional", updated: "2024-01-10" },
                  { title: "Estatuto de los Trabajadores", type: "Nacional", updated: "2024-01-08" },
                  { title: "Ley de Prevención de Blanqueo de Capitales", type: "Nacional", updated: "2024-01-05" }
                ].map((regulation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{regulation.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{regulation.type}</Badge>
                        <span className="text-xs text-muted-foreground">Actualizado: {regulation.updated}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};