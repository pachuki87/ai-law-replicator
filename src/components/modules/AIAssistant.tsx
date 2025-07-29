import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Lightbulb,
  FileText,
  Scale,
  Clock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Initialize Google AI
const genAI = new GoogleGenerativeAI("AIzaSyCnA6rpPRXqxoBEsAv-IhR_6oy_Z0iuDoU");

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'legal-advice' | 'document-help' | 'research' | 'general';
}

const quickQuestions = [
  "¿Cómo redacto una demanda por incumplimiento contractual?",
  "¿Cuáles son los plazos para recurrir una sentencia?",
  "¿Qué documentos necesito para un despido disciplinario?",
  "¿Cómo calculo la indemnización por accidente laboral?",
  "¿Cuándo prescribe una deuda civil?",
  "¿Qué es el procedimiento monitorio?"
];

const initialMessages: Message[] = [
  {
    id: '1',
    content: '¡Hola! Soy tu asistente jurídico de IA. Puedo ayudarte con consultas legales, redacción de documentos, investigación jurídica y análisis de casos. ¿En qué puedo asistirte hoy?',
    sender: 'ai',
    timestamp: new Date(),
    type: 'general'
  }
];

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'general'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      // Get AI response from Google Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Eres un asistente jurídico especializado en derecho español. Responde de manera profesional y precisa a la siguiente consulta legal: ${currentInput}
      
      Proporciona respuestas estructuradas, cita la normativa aplicable cuando sea relevante, y ofrece consejos prácticos. Si la consulta requiere asesoramiento específico, recomienda consultar con un abogado especializado.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
        sender: 'ai',
        timestamp: new Date(),
        type: detectMessageType(currentInput)
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "No se pudo obtener respuesta de la IA. Inténtalo de nuevo.",
        variant: "destructive"
      });
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Disculpa, no pude procesar tu consulta en este momento. Por favor, inténtalo de nuevo.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'general'
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (query: string): string => {
    if (query.toLowerCase().includes('demanda')) {
      return `Para redactar una demanda por incumplimiento contractual, debes incluir:

1. **Encabezamiento**: Identificación del juzgado, partes y representación procesal
2. **Antecedentes de hecho**: Descripción cronológica de los hechos relevantes
3. **Fundamentos de derecho**: Base legal de la pretensión
4. **Petitum**: Solicitudes concretas al juzgado

¿Necesitas ayuda con alguna sección específica?`;
    }
    
    if (query.toLowerCase().includes('plazo')) {
      return `Los plazos procesales más importantes son:

- **Recurso de apelación**: 20 días desde la notificación
- **Recurso de casación**: 20 días desde la notificación  
- **Oposición a monitorio**: 20 días desde el requerimiento
- **Contestación demanda**: 20 días desde el emplazamiento

¿Sobre qué procedimiento específico necesitas información?`;
    }

    return `Entiendo tu consulta. Basándome en la normativa vigente, te recomiendo:

1. Revisar la documentación pertinente
2. Analizar la jurisprudencia aplicable  
3. Considerar los plazos procesales
4. Evaluar las posibles alternativas

¿Podrías proporcionar más detalles específicos sobre tu caso?`;
  };

  const detectMessageType = (message: string): Message['type'] => {
    if (message.toLowerCase().includes('demanda') || message.toLowerCase().includes('contrato')) {
      return 'document-help';
    }
    if (message.toLowerCase().includes('jurisprudencia') || message.toLowerCase().includes('sentencia')) {
      return 'research';
    }
    if (message.toLowerCase().includes('derecho') || message.toLowerCase().includes('legal')) {
      return 'legal-advice';
    }
    return 'general';
  };

  const getMessageTypeIcon = (type?: Message['type']) => {
    switch (type) {
      case 'legal-advice': return <Scale className="h-4 w-4" />;
      case 'document-help': return <FileText className="h-4 w-4" />;
      case 'research': return <Lightbulb className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeBadge = (type?: Message['type']) => {
    switch (type) {
      case 'legal-advice': return 'Asesoría Legal';
      case 'document-help': return 'Documentos';
      case 'research': return 'Investigación';
      default: return 'General';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Asistente Jurídico IA</h1>
        <p className="text-primary-foreground/90">
          Tu asesor legal inteligente disponible 24/7
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-legal-primary" />
                Conversación con IA
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-legal-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-md ${message.sender === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-legal-primary text-primary-foreground ml-auto' 
                          : 'bg-legal-neutral'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {message.timestamp.toLocaleTimeString()}
                        {message.type && (
                          <>
                            {getMessageTypeIcon(message.type)}
                            <span>{getMessageTypeBadge(message.type)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {message.sender === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-legal-accent">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-legal-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-legal-neutral rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-legal-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-legal-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-legal-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu consulta legal aquí..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim()} variant="legal">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-legal-primary" />
                Consultas Frecuentes
              </CardTitle>
              <CardDescription>
                Haz clic para enviar una pregunta rápida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full text-left h-auto p-3 justify-start"
                  onClick={() => {
                    setInputMessage(question);
                    setTimeout(handleSendMessage, 100);
                  }}
                >
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Capacidades de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Scale, text: "Asesoría jurídica especializada" },
                { icon: FileText, text: "Redacción de documentos" },
                { icon: Lightbulb, text: "Análisis de casos complejos" },
                { icon: MessageSquare, text: "Consultas en tiempo real" }
              ].map((capability, index) => {
                const Icon = capability.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-legal-primary" />
                    <span className="text-sm">{capability.text}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};