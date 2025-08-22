import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Lightbulb,
  FileText,
  Scale,
  Clock,
  Sparkles,
  Zap,
  Loader2,
  Plus
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { aiService } from "@/services/aiService";
import caseService from "@/services/caseService";
import { Database, Case } from "@/types/database";

type AIConversation = Database['public']['Tables']['ai_conversations']['Row'];
type AIMessage = Database['public']['Tables']['ai_messages']['Row'];

// Initialize Google AI
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;

const quickQuestions = [
  "¿Cómo redacto una demanda por incumplimiento contractual?",
  "¿Cuáles son los plazos para recurrir una sentencia?",
  "¿Qué documentos necesito para un despido disciplinario?",
  "¿Cómo calculo la indemnización por accidente laboral?",
  "¿Cuándo prescribe una deuda civil?",
  "¿Qué es el procedimiento monitorio?"
];

export const AIAssistant = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [conversationType, setConversationType] = useState<'general' | 'case_analysis' | 'legal_research' | 'document_review'>('general');
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [conversationsData, casesData] = await Promise.all([
        aiService.getConversations(),
        caseService.getCases()
      ]);
      setConversations(conversationsData);
      setCases(casesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await aiService.getConversationMessages(conversationId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Error al cargar los mensajes",
        variant: "destructive"
      });
    }
  };

  const createNewConversation = async () => {
    try {
      const newConversation = await aiService.createConversation({
        title: `Nueva conversación - ${new Date().toLocaleDateString()}`,
        type: conversationType,
        case_id: selectedCase
      });
      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation.id);
      toast({
        title: "Conversación creada",
        description: "Nueva conversación iniciada"
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Error al crear la conversación",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation) {
      if (!currentConversation) {
        toast({
          title: "Error",
          description: "Selecciona o crea una conversación primero",
          variant: "destructive"
        });
      }
      return;
    }

    const messageContent = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Save user message
      const userMessage = await aiService.addMessage(currentConversation, {
        content: messageContent,
        role: 'user',
        message_type: 'text'
      });

      // Update messages state
      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      if (!genAI) {
        throw new Error('Google AI no está configurado');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Legal context for the prompt
      const legalContext = `Eres un asistente jurídico especializado en derecho español. 
      Proporciona respuestas precisas, profesionales y basadas en principios legales. 
      Si la consulta requiere asesoría legal específica, recomienda consultar con un abogado.
      Tipo de conversación: ${conversationType}
      ${selectedCase ? `Caso relacionado: ${cases.find(c => c.id === selectedCase)?.title}` : ''}
      
      Consulta del usuario: ${messageContent}`;

      const result = await model.generateContent(legalContext);
      const response = await result.response;
      const aiResponse = response.text();

      // Save AI response
      const aiMessage = await aiService.addMessage(currentConversation, {
        content: aiResponse,
        role: 'assistant',
        message_type: 'text'
      });

      // Update messages state
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error al generar respuesta:', error);
      toast({
        title: "Error",
        description: "No se pudo generar una respuesta. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInputMessage(question);
    // Auto-send the quick question
    setTimeout(() => {
      handleSendMessage();
    }, 100);
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
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-legal-primary" />
          <h1 className="text-3xl font-bold text-legal-dark">Asistente Jurídico IA</h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-legal-muted max-w-2xl mx-auto">
          Tu asistente inteligente para consultas legales, redacción de documentos y análisis jurídico
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Tipo de Conversación</label>
          <Select value={conversationType} onValueChange={(value: any) => setConversationType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="case_analysis">Análisis de Caso</SelectItem>
              <SelectItem value="legal_research">Investigación Legal</SelectItem>
              <SelectItem value="document_review">Revisión de Documentos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Caso (Opcional)</label>
          <Select value={selectedCase || ""} onValueChange={setSelectedCase}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar caso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin caso específico</SelectItem>
              {cases.map((case_) => (
                <SelectItem key={case_.id} value={case_.id}>
                  {case_.title} - {case_.case_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Conversación</label>
          <Select value={currentConversation || ""} onValueChange={setCurrentConversation}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar conversación" />
            </SelectTrigger>
            <SelectContent>
              {conversations.map((conv) => (
                <SelectItem key={conv.id} value={conv.id}>
                  {conv.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button onClick={createNewConversation} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Conversación
          </Button>
        </div>
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
                {isLoadingData ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Cargando conversaciones...</span>
                  </div>
                ) : !currentConversation ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Selecciona una conversación existente o crea una nueva para comenzar
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-legal-primary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-md ${message.role === 'user' ? 'order-first' : ''}`}>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-legal-primary text-primary-foreground ml-auto' 
                              : 'bg-legal-neutral'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(message.created_at).toLocaleTimeString()}
                            {message.message_type && (
                              <Badge variant="secondary" className="text-xs">
                                {message.message_type}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-legal-accent">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
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
                  </>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={currentConversation ? "Escribe tu consulta legal aquí..." : "Selecciona o crea una conversación primero"}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                  disabled={isLoading || !currentConversation}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputMessage.trim() || !currentConversation}
                  variant="legal"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
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