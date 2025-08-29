import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Clock,
  Sparkles,
  Zap,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Hash,
  Calendar,
  Eye,
  ArrowUp,
  ArrowDown,
  X,
  Menu
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { aiService } from "@/services/aiService";
import caseService from "@/services/caseService";
import { Database, Case } from "@/types/database";

type AIConversation = Database['public']['Tables']['ai_conversations']['Row'];
type AIMessage = Database['public']['Tables']['ai_messages']['Row'];

// Initialize Google AI
const GOOGLE_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
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
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);
  const [showConversationHistory, setShowConversationHistory] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle scroll progress tracking
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && messages.length > 0) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  // Setup scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial calculation
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);

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

  const deleteConversation = async (conversationId: string) => {
    try {
      await aiService.deleteConversation(conversationId);
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      if (currentConversation === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      toast({
        title: "Conversación eliminada",
        description: "La conversación ha sido eliminada exitosamente"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la conversación",
        variant: "destructive"
      });
    }
  };

  const scrollToMessage = (index: number) => {
    const messageElement = messageRefs.current[index];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setSelectedMessageIndex(index);
      setTimeout(() => setSelectedMessageIndex(null), 2000);
    }
  };

  // Handle progress bar click navigation
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const barWidth = rect.width;
    const clickPercentage = (clickX / barWidth) * 100;
    
    // Calculate which message corresponds to this percentage
    const targetMessageIndex = Math.floor((clickPercentage / 100) * messages.length);
    const clampedIndex = Math.max(0, Math.min(targetMessageIndex, messages.length - 1));
    
    // Navigate to the calculated message
    scrollToMessage(clampedIndex);
    
    // Update scroll progress immediately to provide visual feedback
    setTimeout(() => {
      handleScroll();
    }, 100);
  };

  const getLastMessage = (conversationId: string) => {
    // This would ideally come from the backend, but for now we'll use a placeholder
    return "Última consulta sobre...";
  };

  const getConversationMessageCount = (conversationId: string) => {
    // This would ideally come from the backend
    return messages.length;
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
      const userMessage = await aiService.addMessage({
        conversationId: currentConversation,
        content: messageContent,
        sender: 'user'
      });

      // Update messages state
      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      if (!genAI) {
        throw new Error('Google AI no está configurado');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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
      const aiMessage = await aiService.addMessage({
        conversationId: currentConversation,
        content: aiResponse,
        sender: 'ai'
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
          <Select value={selectedCase || "none"} onValueChange={(value) => setSelectedCase(value === "none" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar caso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin caso específico</SelectItem>
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

      <div className="flex gap-6 w-full max-w-full min-w-0">
        {/* Chat Interface */}
        <div className="flex-1 min-w-0 w-full max-w-full">
          <Card className="h-[600px] flex flex-col w-full max-w-full min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-legal-primary" />
                Conversación con IA
              </CardTitle>
              {/* Progress Bar */}
              {currentConversation && messages.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progreso de conversación</span>
                    <span>{Math.round(scrollProgress)}%</span>
                  </div>
                  <div 
                    className="w-full bg-muted rounded-full h-3 overflow-hidden cursor-pointer hover:bg-muted/80 transition-colors duration-200 relative group"
                    onClick={handleProgressBarClick}
                    title="Haz clic para navegar a cualquier punto de la conversación"
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-legal-primary to-legal-accent transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${scrollProgress}%` }}
                    />
                    {/* Hover indicator */}
                    <div className="absolute inset-0 bg-legal-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Inicio</span>
                    <span>{messages.length} mensajes</span>
                    <span>Final</span>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-w-0 w-full max-w-full">
              {/* Messages */}
              <ScrollArea 
                ref={messagesContainerRef}
                className="flex-1 space-y-4 mb-4 px-2"
              >
                <div className="min-w-0 w-full max-w-full">
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
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          ref={(el) => messageRefs.current[index] = el}
                          className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${
                            selectedMessageIndex === index ? 'bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-2 -m-2' : ''
                          }`}
                        >
                          {message.sender === 'ai' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-legal-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] min-w-0 w-0 flex-1 ${message.sender === 'user' ? 'order-first' : ''}`}>
                            <div className={`rounded-lg p-3 ${
                              message.sender === 'user' 
                                ? 'bg-legal-primary text-primary-foreground ml-auto' 
                                : 'bg-legal-neutral'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">{message.content}</p>
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

                          {message.sender === 'user' && (
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
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>

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

        {/* Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50 lg:hidden"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Enhanced Sidebar */}
        <div className={`${showSidebar ? 'block' : 'hidden lg:block'} w-80 flex-shrink-0 space-y-4 bg-muted/30 border-l-2 border-legal-primary/30 pl-4 py-4 shadow-lg`}>
          <div className="bg-legal-primary/10 p-4 rounded-lg border-2 border-legal-primary/30 shadow-sm">
            <h2 className="text-xl font-bold text-legal-primary flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Panel de Control
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              🔧 Gestiona tus conversaciones y navega por los mensajes
            </p>
          </div>
          {/* Conversation History Panel */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-legal-primary" />
                  Historial de Conversaciones
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConversationHistory(!showConversationHistory)}
                  aria-label={showConversationHistory ? "Ocultar historial" : "Mostrar historial"}
                  aria-expanded={showConversationHistory}
                >
                  {showConversationHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showConversationHistory && (
              <CardContent className="pt-0">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay conversaciones</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                           key={conv.id}
                           className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md group ${
                             currentConversation === conv.id 
                               ? 'bg-legal-primary/10 border-legal-primary ring-2 ring-legal-primary/20' 
                               : 'bg-background hover:bg-muted/50 hover:border-legal-primary/30'
                           }`}
                           onClick={() => setCurrentConversation(conv.id)}
                           role="button"
                           tabIndex={0}
                           aria-label={`Seleccionar conversación: ${conv.title}`}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' || e.key === ' ') {
                               e.preventDefault();
                               setCurrentConversation(conv.id);
                             }
                           }}
                         >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">{conv.title}</h4>
                                {currentConversation === conv.id && (
                                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                    Activa
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mb-2">
                                {getLastMessage(conv.id)}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(conv.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  {conv.type}
                                </div>
                              </div>
                            </div>
                            <Button
                               variant="ghost"
                               size="sm"
                               className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 deleteConversation(conv.id);
                               }}
                               aria-label={`Eliminar conversación: ${conv.title}`}
                             >
                               <Trash2 className="h-3 w-3" />
                             </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            )}
          </Card>

          {/* Message Navigation Panel */}
          {currentConversation && messages.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-legal-primary" />
                  Navegación de Mensajes
                </CardTitle>
                <CardDescription className="text-xs">
                  {messages.length} mensaje{messages.length !== 1 ? 's' : ''} en esta conversación
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {messages.map((message, index) => (
                      <div
                         key={message.id}
                         className={`p-2 rounded border cursor-pointer transition-all hover:bg-muted/50 ${
                           selectedMessageIndex === index ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 ring-1 ring-yellow-400' : 'hover:border-legal-primary/30'
                         }`}
                         onClick={() => scrollToMessage(index)}
                         role="button"
                         tabIndex={0}
                         aria-label={`Ir al mensaje ${index + 1} de ${message.sender === 'ai' ? 'IA' : 'Usuario'}`}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             scrollToMessage(index);
                           }
                         }}
                       >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === 'ai' ? (
                            <Bot className="h-3 w-3 text-legal-primary" />
                          ) : (
                            <User className="h-3 w-3 text-legal-accent" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === 'ai' ? 'IA' : 'Usuario'}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {message.content.substring(0, 80)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => scrollToMessage(0)}
                    disabled={messages.length === 0}
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Inicio
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => scrollToMessage(messages.length - 1)}
                    disabled={messages.length === 0}
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Final
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-legal-primary" />
                Consultas Frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[150px]">
                <div className="space-y-1">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full text-left h-auto p-2 justify-start text-xs"
                      onClick={() => {
                        setInputMessage(question);
                        setTimeout(handleSendMessage, 100);
                      }}
                    >
                      <span>{question}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Capacidades de IA</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {[
                  { icon: Scale, text: "Asesoría jurídica" },
                  { icon: FileText, text: "Redacción de documentos" },
                  { icon: Lightbulb, text: "Análisis de casos" },
                  { icon: MessageSquare, text: "Consultas en tiempo real" }
                ].map((capability, index) => {
                  const Icon = capability.icon;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-legal-primary" />
                      <span className="text-xs">{capability.text}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};