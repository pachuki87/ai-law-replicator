import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scale, 
  FileText, 
  Search, 
  Bot, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  X
} from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

interface LandingPageProps {
  onAuthenticated: () => void;
}

export const LandingPage = ({ onAuthenticated }: LandingPageProps) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onAuthenticated();
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-legal-primary" />,
      title: "Automatización de Documentos",
      description: "Genera contratos, demandas y documentos legales con IA avanzada"
    },
    {
      icon: <Search className="h-8 w-8 text-legal-primary" />,
      title: "Investigación Legal",
      description: "Búsqueda inteligente en jurisprudencia y normativa actualizada"
    },
    {
      icon: <Bot className="h-8 w-8 text-legal-primary" />,
      title: "Asistente IA",
      description: "Consulta legal instantánea con inteligencia artificial especializada"
    },
    {
      icon: <Shield className="h-8 w-8 text-legal-primary" />,
      title: "Gestión de Casos",
      description: "Organiza y gestiona todos tus casos legales en un solo lugar"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-legal-primary" />,
      title: "Predicción de Resultados",
      description: "Análisis predictivo basado en casos similares y jurisprudencia"
    },
    {
      icon: <Zap className="h-8 w-8 text-legal-primary" />,
      title: "Cumplimiento Normativo",
      description: "Mantente actualizado con las últimas regulaciones y cambios legales"
    }
  ];

  const benefits = [
    "Ahorra hasta 80% del tiempo en tareas repetitivas",
    "Acceso a base de datos legal actualizada",
    "Interfaz intuitiva y fácil de usar",
    "Seguridad y confidencialidad garantizada",
    "Soporte técnico especializado 24/7",
    "Integración con sistemas existentes"
  ];

  const stats = [
    { number: "10,000+", label: "Abogados Activos" },
    { number: "500,000+", label: "Documentos Generados" },
    { number: "99.9%", label: "Tiempo de Actividad" },
    { number: "4.9/5", label: "Calificación de Usuarios" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-primary/5 via-white to-primary-glow/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-legal-primary" />
            <span className="text-2xl font-bold text-legal-primary">LegalAI Pro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={openSignIn}>
              Iniciar Sesión
            </Button>
            <Button onClick={openSignUp} className="bg-legal-primary hover:bg-legal-primary/90">
              Registrarse Gratis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-legal-primary/10 text-legal-primary border-legal-primary/20">
            🚀 Plataforma Legal con IA Avanzada
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Revoluciona tu
            <span className="text-legal-primary block">Práctica Legal</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            La primera plataforma integral que combina inteligencia artificial, automatización 
            y gestión legal para transformar la manera en que trabajas como abogado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={openSignUp}
              className="bg-legal-primary hover:bg-legal-primary/90 text-white px-8 py-4 text-lg"
            >
              Comenzar Gratis
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={openSignIn}
              className="border-legal-primary text-legal-primary hover:bg-legal-primary/5 px-8 py-4 text-lg"
            >
              Ver Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-legal-primary mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas avanzadas diseñadas específicamente para profesionales del derecho
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-legal-primary/5 to-primary-glow/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir LegalAI Pro?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Únete a miles de abogados que ya han transformado su práctica legal 
                con nuestra plataforma de inteligencia artificial.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">4.9/5 - 2,847 reseñas</span>
                </div>
                <blockquote className="text-gray-700 mb-4">
                  "LegalAI Pro ha revolucionado mi bufete. Lo que antes me tomaba horas, 
                  ahora lo resuelvo en minutos. La calidad de los documentos generados 
                  es excepcional."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-legal-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-legal-primary" />
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold">María González</div>
                    <div className="text-gray-600 text-sm">Socia, González & Asociados</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-legal-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Comienza tu transformación legal hoy
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a la revolución de la inteligencia artificial en el derecho. 
            Prueba gratis por 14 días, sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={openSignUp}
              className="bg-white text-legal-primary hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Registrarse Gratis
              <Zap className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={openSignIn}
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Scale className="h-8 w-8 text-legal-primary" />
            <span className="text-2xl font-bold">LegalAI Pro</span>
          </div>
          <p className="text-gray-400 mb-4">
            Transformando la práctica legal con inteligencia artificial
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 LegalAI Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {authMode === 'signin' ? 'Iniciar Sesión' : 'Registrarse'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <AuthModal
                mode={authMode}
                onSuccess={handleAuthSuccess}
                onModeChange={setAuthMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};