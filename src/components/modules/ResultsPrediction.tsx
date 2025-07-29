import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Target, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Calculator,
  Scale,
  Brain
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PredictionResult {
  overallProbability: number;
  factors: {
    name: string;
    impact: number;
    description: string;
    positive: boolean;
  }[];
  recommendations: string[];
  similarCases: number;
  confidence: number;
}

const caseTypes = [
  { id: "civil", name: "Civil - Incumplimiento Contractual" },
  { id: "labor", name: "Laboral - Despido Improcedente" },
  { id: "commercial", name: "Mercantil - Disolución Societaria" },
  { id: "family", name: "Familia - Custodia Compartida" },
  { id: "criminal", name: "Penal - Delito Menor" },
  { id: "administrative", name: "Administrativo - Recurso" }
];

const courts = [
  { id: "ts", name: "Tribunal Supremo" },
  { id: "an", name: "Audiencia Nacional" },
  { id: "tsjm", name: "TSJ Madrid" },
  { id: "ap", name: "Audiencia Provincial" },
  { id: "jpi", name: "Juzgado Primera Instancia" },
  { id: "jm", name: "Juzgado Mercantil" }
];

const mockPrediction: PredictionResult = {
  overallProbability: 78,
  factors: [
    {
      name: "Jurisprudencia Similar",
      impact: 85,
      description: "Se encontraron 127 casos similares con resolución favorable",
      positive: true
    },
    {
      name: "Pruebas Documentales",
      impact: 92,
      description: "Documentación completa y convincente",
      positive: true
    },
    {
      name: "Perfil del Juez",
      impact: 65,
      description: "Historial de resoluciones en casos similares",
      positive: true
    },
    {
      name: "Cuantía Reclamada",
      impact: 45,
      description: "La cuantía es elevada para este tipo de procedimiento",
      positive: false
    },
    {
      name: "Tiempo Transcurrido",
      impact: 30,
      description: "El tiempo puede afectar la validez de algunas pruebas",
      positive: false
    }
  ],
  recommendations: [
    "Reforzar la argumentación sobre la cuantía solicitada",
    "Presentar testigos adicionales para fortalecer el caso",
    "Considerar mediación como alternativa",
    "Revisar jurisprudencia más reciente del tribunal específico"
  ],
  similarCases: 127,
  confidence: 87
};

export const ResultsPrediction = () => {
  const [formData, setFormData] = useState({
    caseType: "",
    court: "",
    amount: "",
    description: "",
    evidence: "",
    timeframe: ""
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!formData.caseType || !formData.court || !formData.description) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simular análisis
    setTimeout(() => {
      setPrediction(mockPrediction);
      setIsAnalyzing(false);
      toast({
        title: "Análisis Completado",
        description: "Predicción de resultados generada exitosamente",
      });
    }, 3000);
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return "text-green-600";
    if (prob >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProbabilityBgColor = (prob: number) => {
    if (prob >= 75) return "bg-green-100";
    if (prob >= 50) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Predicción de Resultados</h1>
        <p className="text-primary-foreground/90">
          Analiza la probabilidad de éxito de tus casos basándose en IA y jurisprudencia
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-legal-primary" />
                Datos del Caso para Análisis
              </CardTitle>
              <CardDescription>
                Proporciona información detallada para obtener una predicción precisa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case-type">Tipo de Caso *</Label>
                  <Select value={formData.caseType} onValueChange={(value) => setFormData({...formData, caseType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de caso" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="court">Tribunal *</Label>
                  <Select value={formData.court} onValueChange={(value) => setFormData({...formData, court: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tribunal" />
                    </SelectTrigger>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id}>
                          {court.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Cuantía (€)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="25000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Tiempo transcurrido</Label>
                  <Select value={formData.timeframe} onValueChange={(value) => setFormData({...formData, timeframe: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Menos de 6 meses</SelectItem>
                      <SelectItem value="medium">6 meses - 2 años</SelectItem>
                      <SelectItem value="old">Más de 2 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción del Caso *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe los hechos principales, las circunstancias y los aspectos clave del caso..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">Pruebas Disponibles</Label>
                <Textarea
                  id="evidence"
                  value={formData.evidence}
                  onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                  placeholder="Lista las pruebas documentales, testificales y periciales disponibles..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full"
                variant="legal"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Calculator className="mr-2 h-5 w-5 animate-spin" />
                    Analizando caso...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Analizar Probabilidad de Éxito
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {prediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-legal-primary" />
                  Resultados del Análisis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Probability */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getProbabilityBgColor(prediction.overallProbability)} mb-4`}>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getProbabilityColor(prediction.overallProbability)}`}>
                        {prediction.overallProbability}%
                      </div>
                      <div className="text-sm text-muted-foreground">Probabilidad</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Probabilidad de Éxito</h3>
                  <p className="text-muted-foreground">
                    Basado en {prediction.similarCases} casos similares analizados
                  </p>
                </div>

                {/* Factors Analysis */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Factores de Análisis</h4>
                  <div className="space-y-4">
                    {prediction.factors.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium flex items-center gap-2">
                            {factor.positive ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                            {factor.name}
                          </span>
                          <Badge variant={factor.positive ? "default" : "secondary"}>
                            {factor.impact}% impacto
                          </Badge>
                        </div>
                        <Progress 
                          value={factor.impact} 
                          className={`h-2 ${factor.positive ? 'bg-green-100' : 'bg-yellow-100'}`}
                        />
                        <p className="text-sm text-muted-foreground">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Recomendaciones</h4>
                  <div className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-legal-neutral rounded-lg">
                        <div className="w-2 h-2 bg-legal-primary rounded-full mt-2" />
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Confidence Meter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-legal-primary" />
                Confianza del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prediction ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-legal-primary">{prediction.confidence}%</div>
                    <p className="text-sm text-muted-foreground">Nivel de confianza</p>
                  </div>
                  <Progress value={prediction.confidence} className="h-3" />
                  <div className="text-xs text-muted-foreground">
                    Basado en {prediction.similarCases} casos similares del último año
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  Completa el formulario para ver el análisis
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historical Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-legal-primary" />
                Rendimiento Histórico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Predicciones Realizadas", value: "1,247" },
                { label: "Precisión Promedio", value: "89.3%" },
                { label: "Casos Analizados", value: "45,692" },
                { label: "Actualización de Base", value: "Diaria" }
              ].map((stat, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="font-medium">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Consejos para Mejores Predicciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Proporciona toda la información disponible",
                "Incluye detalles específicos del caso",
                "Menciona precedentes conocidos",
                "Actualiza el análisis con nueva información"
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-legal-accent rounded-full mt-2" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};