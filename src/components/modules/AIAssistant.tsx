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
import { pdfProcessingService } from "@/services/pdfProcessingService";
import MCPBoeService from "@/services/mcpBoeService";
import { MCPCendojService } from "@/services/mcpCendojService";
import MCPStatus from "@/components/MCPStatus";
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

  // Función para consultar el BOE usando MCP Playwright automáticamente
  const consultarBOEAutomatico = async (terminos: string[]): Promise<string> => {
    if (terminos.length === 0) return '';
    
    try {
      // Usar MCP para buscar automáticamente en BOE
      const terminosPrincipales = terminos.slice(0, 2);
      
      // Intentar usar el servicio MCP BOE
       try {
         const mcpBoeService = MCPBoeService.getInstance();
         const mcpResult = await mcpBoeService.searchBOE(terminosPrincipales[0]);
         
         if (mcpResult && mcpResult.success) {
           return `\n\n📋 **CONSULTA BOE (MCP)**:\n` +
                  `🔍 Resultado para: ${terminosPrincipales[0]}\n` +
                  `📄 ${mcpResult.data || 'Consulta realizada exitosamente'}\n` +
                  `🔗 ${mcpResult.url || 'https://www.boe.es'}`;
         }
       } catch (mcpError) {
         console.log('MCP no disponible, usando método alternativo:', mcpError);
       }
      
      // Método alternativo si MCP no está disponible
      return `\n\n📋 **ANÁLISIS LEGAL AUTOMÁTICO**:\n` +
             `🔍 Términos detectados: ${terminosPrincipales.join(', ')}\n` +
             `⚖️ Verificar normativa vigente en BOE para estos términos\n` +
             `🔗 Consultar: https://www.boe.es/buscar/`;
             
    } catch (error) {
      console.error('Error en consulta BOE automática:', error);
      return `\n\n📋 **BOE**: Verificar normativa vigente en https://www.boe.es`;
    }
  };

  // Función para consultar jurisprudencia en CENDOJ usando MCP Playwright automáticamente
  const consultarCENDOJAutomatico = async (terminos: string[]): Promise<string> => {
    if (terminos.length === 0) return '';
    
    try {
      const mcpCendojService = MCPCendojService.getInstance();
      const resultado = await mcpCendojService.searchJurisprudencia(terminos);
      return resultado;
    } catch (error) {
      console.error('Error en consulta CENDOJ automática:', error);
      const terminosPrincipales = terminos.slice(0, 2);
      const searchQuery = terminosPrincipales.join(' ');
      const cendojUrl = `https://www.poderjudicial.es/search/indexAN.jsp?texto=${encodeURIComponent(searchQuery)}`;
      
      return `\n\n📚 **JURISPRUDENCIA RECOMENDADA**:\n` +
             `🔍 Términos detectados: ${terminosPrincipales.join(', ')}\n` +
             `⚖️ Consultar precedentes jurisprudenciales relevantes\n` +
             `🔗 Buscar en CENDOJ: ${cendojUrl}`;
    }
  };

  // Función para detectar términos legales que requieren consulta BOE
  const detectarTerminosLegales = (texto: string): string[] => {
    const terminosLegales = [
      'código civil', 'ley orgánica', 'real decreto', 'orden ministerial',
      'constitución', 'estatuto', 'reglamento', 'directiva europea',
      'jurisprudencia', 'tribunal supremo', 'audiencia nacional'
    ];
    
    return terminosLegales.filter(termino => 
      texto.toLowerCase().includes(termino.toLowerCase())
    );
  };

  const generateAIResponse = async (prompt: string, maxRetries: number = 3): Promise<string> => {
    if (!genAI) {
      throw new Error('Google AI no está configurado');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let aiResponse = response.text();
        
        // Detectar términos legales en la consulta original
        const terminosDetectados = detectarTerminosLegales(prompt);
        
        // Detectar términos que requieren consulta jurisprudencial
        const mcpCendojService = MCPCendojService.getInstance();
        const terminosJurisprudenciales = mcpCendojService.detectLegalTerms(prompt);
        
        // Validar que la respuesta incluye las 3 reglas fundamentales
        const hasNormativa = aiResponse.toLowerCase().includes('normativa') || aiResponse.toLowerCase().includes('ley') || aiResponse.toLowerCase().includes('reglamento');
        const hasLegislacion = aiResponse.toLowerCase().includes('legislación') || aiResponse.toLowerCase().includes('vigente') || aiResponse.toLowerCase().includes('modificación');
        const hasCodivoCivil = aiResponse.toLowerCase().includes('código civil') || aiResponse.toLowerCase().includes('artículo');
        
        // Consulta automática al BOE si se detectaron términos legales
        if (terminosDetectados.length > 0) {
          const consultaBOE = await consultarBOEAutomatico(terminosDetectados);
          aiResponse += consultaBOE;
        }
        
        // Consulta automática a CENDOJ si se detectaron términos jurisprudenciales
        if (terminosJurisprudenciales.length > 0) {
          const consultaCENDOJ = await consultarCENDOJAutomatico(terminosJurisprudenciales);
          aiResponse += consultaCENDOJ;
        }
        
        // Si falta alguna regla, agregar recordatorio
        if (!hasNormativa || !hasLegislacion || !hasCodivoCivil) {
          aiResponse += "\n\n⚖️ **RECORDATORIO LEGAL**: Recuerda verificar la normativa específica aplicable, la legislación vigente y los artículos del Código Civil relevantes para este caso.";
        }
        
        return aiResponse;
      } catch (error: any) {
        console.error(`Intento ${attempt} fallido:`, error);
        
        // Si es el último intento, lanzar el error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Si es error de sobrecarga, esperar más tiempo
        if (error.message?.includes('overloaded') || error.message?.includes('503')) {
          const waitTime = Math.pow(2, attempt) * 1000; // Backoff exponencial
          console.log(`API sobrecargada, esperando ${waitTime}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // Para otros errores, esperar menos tiempo
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw new Error('No se pudo generar respuesta después de varios intentos');
  };

  // Función para detectar solicitudes específicas de MCP
  const detectMCPRequest = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    const mcpPatterns = [
      'mcp',
      'playwright',
      'rube',
      'fetch-mcp',
      'sequential thinking',
      'usar mcp',
      'utilizar mcp',
      'mcp playwright',
      'mcp service',
      'servicios mcp'
    ];
    
    return mcpPatterns.some(pattern => lowerMessage.includes(pattern));
  };

  // Función para generar respuesta sobre servicios MCP disponibles
  const generateMCPResponse = (): string => {
    return `🤖 **Servicios MCP Disponibles**

Actualmente tengo acceso a los siguientes servicios MCP que se utilizan automáticamente según tu consulta:

🔍 **MCP Playwright** - Para consultas al BOE y CENDOJ
• Se activa automáticamente cuando detecto términos legales
• Busca normativa actualizada en el BOE
• Consulta jurisprudencia en CENDOJ

📄 **BOE Service** - Consultas específicas al Boletín Oficial del Estado
• Búsqueda de leyes, decretos y normativas
• Información actualizada de legislación

⚖️ **CENDOJ Service** - Centro de Documentación Judicial
• Búsqueda de jurisprudencia
• Sentencias del Tribunal Supremo y otros tribunales

🔧 **Otros servicios configurados:**
• Rube - Procesamiento avanzado
• Fetch-MCP - Obtención de datos externos
• Sequential Thinking - Análisis secuencial

**¿Cómo funcionan?**
Estos servicios se activan automáticamente cuando:
- Haces consultas sobre normativa legal
- Preguntas sobre jurisprudencia
- Necesitas información actualizada del BOE
- Solicitas análisis de casos legales

¡Simplemente haz tu consulta legal y los servicios MCP apropiados se activarán automáticamente! 🚀`;
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
      // Detectar si es una solicitud específica sobre MCP
      if (detectMCPRequest(messageContent)) {
        // Save user message
        const userMessage = await aiService.addMessage({
          conversationId: currentConversation,
          content: messageContent,
          sender: 'user'
        });
        setMessages(prev => [...prev, userMessage]);

        // Generate MCP information response
        const mcpResponse = generateMCPResponse();
        const aiMessage = await aiService.addMessage({
          conversationId: currentConversation,
          content: mcpResponse,
          sender: 'ai'
        });
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      // Save user message
      const userMessage = await aiService.addMessage({
        conversationId: currentConversation,
        content: messageContent,
        sender: 'user'
      });

      // Update messages state
      setMessages(prev => [...prev, userMessage]);

      // Search for information in case PDFs if a case is selected
      let documentContext = '';
      if (selectedCase) {
        try {
          const searchResults = await pdfProcessingService.searchInCaseDocuments(
            selectedCase, 
            messageContent
          );
          
          if (searchResults.length > 0) {
            documentContext = '\n\nInformación encontrada en los documentos del caso:\n';
            searchResults.slice(0, 3).forEach((result, index) => {
              documentContext += `\n📄 **${result.fileName}**:\n${result.matchedText}\n`;
            });
            documentContext += '\n---\n';
          }
        } catch (error) {
          console.error('Error searching in documents:', error);
        }
      }

      // Legal context for the prompt with 3 fundamental rules
      const legalContext = `Eres un asistente jurídico especializado en derecho español que SIEMPRE debe seguir estas 3 REGLAS FUNDAMENTALES:
      
      🔹 REGLA 1 - NORMATIVA APLICABLE: En cada consulta o caso, identifica y cita la normativa específica aplicable (leyes, reglamentos, decretos, órdenes ministeriales).
      
      🔹 REGLA 2 - LEGISLACIÓN Y MODIFICACIONES: Siempre verifica y menciona la legislación vigente, incluyendo cualquier modificación reciente que pueda afectar el caso.
      
      🔹 REGLA 3 - CÓDIGO CIVIL: Cuando sea relevante, referencia los artículos específicos del Código Civil español que apliquen al caso.
      
      INSTRUCCIONES ADICIONALES:
      - Proporciona respuestas precisas, profesionales y basadas en principios legales
      - Si la consulta requiere asesoría legal específica, recomienda consultar con un abogado
      - Siempre incluye referencias normativas específicas (artículos, leyes, fechas de entrada en vigor)
      - Menciona si existe jurisprudencia relevante del Tribunal Supremo o Tribunales Superiores
      - Si hay dudas sobre la vigencia de una norma, recomienda consultar el BOE
      
      Tipo de conversación: ${conversationType}
      ${selectedCase ? `Caso relacionado: ${cases.find(c => c.id === selectedCase)?.title}` : ''}
      ${documentContext ? 'Tienes acceso a información específica de los documentos del caso.' : ''}
      
      Consulta del usuario: ${messageContent}${documentContext}`;

      // Generate AI response with retry logic
      const aiResponse = await generateAIResponse(legalContext);

      // Save AI response
      const aiMessage = await aiService.addMessage({
        conversationId: currentConversation,
        content: aiResponse,
        sender: 'ai'
      });

      // Update messages state
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error('Error al generar respuesta:', error);
      
      let errorMessage = "No se pudo generar una respuesta. Intenta nuevamente.";
      
      if (error.message?.includes('overloaded') || error.message?.includes('503')) {
        errorMessage = "El servicio de IA está temporalmente sobrecargado. Por favor, intenta nuevamente en unos momentos.";
      } else if (error.message?.includes('quota')) {
        errorMessage = "Se ha alcanzado el límite de uso de la API. Intenta más tarde.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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

  // Función para mostrar información de documentos disponibles
  const showDocumentsInfo = async () => {
    if (!selectedCase) return;
    
    try {
      const summary = await pdfProcessingService.getCaseDocumentsSummary(selectedCase);
      const infoMessage = await aiService.addMessage({
        conversationId: currentConversation,
        content: `📋 **Documentos disponibles para análisis:**\n\n${summary}\n\n*Puedes hacerme preguntas específicas sobre el contenido de estos documentos.*`,
        sender: 'ai'
      });
      setMessages(prev => [...prev, infoMessage]);
    } catch (error) {
      console.error('Error showing documents info:', error);
    }
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
        
        <div className="flex gap-2">
          <Button onClick={createNewConversation} className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Conversación
          </Button>
          {selectedCase && selectedCase !== 'none' && (
            <Button 
              onClick={showDocumentsInfo} 
              variant="outline" 
              className="flex-1"
              disabled={!currentConversation}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Documentos
            </Button>
          )}
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

          {/* MCP Status */}
          <MCPStatus />
        </div>
      </div>
    </div>
  );
};