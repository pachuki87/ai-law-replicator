import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  MessageSquare, 
  FolderOpen, 
  TrendingUp, 
  Shield,
  Clock,
  Users,
  BarChart3,
  Award
} from "lucide-react";
import legalHero from "@/assets/legal-hero.jpg";

interface DashboardProps {
  onModuleChange: (module: string) => void;
}

const quickActions = [
  { id: "documents", name: "Crear Documento", icon: FileText, description: "Generar contratos y escritos automáticamente" },
  { id: "research", name: "Buscar Jurisprudencia", icon: Search, description: "Investigación legal inteligente" },
  { id: "assistant", name: "Consultar IA", icon: MessageSquare, description: "Asistente jurídico especializado" },
  { id: "cases", name: "Gestionar Casos", icon: FolderOpen, description: "Organizar expedientes y clientes" },
];

const stats = [
  { title: "Documentos Generados", value: "2,547", icon: FileText, trend: "+12%" },
  { title: "Casos Activos", value: "89", icon: FolderOpen, trend: "+5%" },
  { title: "Consultas IA", value: "1,234", icon: MessageSquare, trend: "+23%" },
  { title: "Éxito Predictivo", value: "94%", icon: TrendingUp, trend: "+2%" },
];

export const Dashboard = ({ onModuleChange }: DashboardProps) => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-legal-primary to-primary-glow text-primary-foreground">
        <div className="absolute inset-0 bg-black/20" />
        <img 
          src={legalHero} 
          alt="Legal AI Platform" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative p-8 lg:p-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Bienvenido a LegalAI Pro
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-6 max-w-2xl">
            La plataforma de inteligencia artificial más completa para profesionales del derecho.
            Automatiza documentos, investiga jurisprudencia y optimiza tu práctica legal.
          </p>
          <Button 
            variant="accent" 
            size="lg"
            onClick={() => onModuleChange("assistant")}
            className="shadow-lg hover:shadow-xl"
          >
            Comenzar Ahora
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-card transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-legal-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-legal-accent font-medium">
                  {stat.trend} vs mes anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.id} 
                className="hover:shadow-card transition-all duration-300 cursor-pointer group hover:scale-105"
                onClick={() => onModuleChange(action.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-legal-neutral rounded-full w-fit group-hover:bg-legal-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="h-8 w-8 text-legal-primary group-hover:text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{action.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-legal-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: "Contrato de Arrendamiento generado", time: "Hace 2 horas", type: "document" },
              { action: "Consulta sobre derecho laboral", time: "Hace 4 horas", type: "assistant" },
              { action: "Búsqueda jurisprudencial completada", time: "Hace 1 día", type: "research" },
              { action: "Caso 'García vs. López' actualizado", time: "Hace 2 días", type: "case" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-legal-neutral transition-colors">
                <div className="w-2 h-2 bg-legal-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-legal-primary" />
              Rendimiento Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Documentos Generados", value: 45, max: 50 },
                { label: "Consultas IA", value: 128, max: 150 },
                { label: "Casos Gestionados", value: 12, max: 15 },
                { label: "Precisión Predictiva", value: 94, max: 100 },
              ].map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{metric.label}</span>
                    <span className="font-medium">{metric.value}/{metric.max}</span>
                  </div>
                  <div className="w-full bg-legal-neutral rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-legal-primary to-primary-glow h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(metric.value / metric.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};