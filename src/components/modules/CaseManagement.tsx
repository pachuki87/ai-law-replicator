import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FolderOpen, 
  Plus, 
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import caseService from "@/services/caseService";
import type { Database } from "@/types/database";

type Case = Database['public']['Tables']['cases']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type CaseActivity = Database['public']['Tables']['case_activities']['Row'];

// Removed interfaces - using Database types instead

export const CaseManagement = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const { toast } = useToast();

  // Form states
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    case_type: "",
    priority: "medium" as const,
    client_id: "",
    estimated_value: ""
  });

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: ""
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [casesData, clientsData] = await Promise.all([
        caseService.getCases(),
        caseService.getClients()
      ]);
      setCases(casesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCase = async () => {
    if (!newCase.title || !newCase.client_id) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const caseData = {
        ...newCase,
        estimated_value: newCase.estimated_value ? parseFloat(newCase.estimated_value) : null
      };
      
      await caseService.createCase(caseData);
      toast({
        title: "Éxito",
        description: "Caso creado exitosamente"
      });
      setShowNewCaseForm(false);
      setNewCase({
        title: "",
        description: "",
        case_type: "",
        priority: "medium",
        client_id: "",
        estimated_value: ""
      });
      loadData();
    } catch (error) {
      console.error('Error creating case:', error);
      toast({
        title: "Error",
        description: "Error al crear el caso",
        variant: "destructive"
      });
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      await caseService.createClient(newClient);
      toast({
        title: "Éxito",
        description: "Cliente creado exitosamente"
      });
      setShowNewClientForm(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        company: ""
      });
      loadData();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "Error al crear el cliente",
        variant: "destructive"
      });
    }
  };

  // Filter cases based on search and status
  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.case_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Activo", variant: "default" as const },
      pending: { label: "Pendiente", variant: "secondary" as const },
      completed: { label: "Completado", variant: "outline" as const },
      suspended: { label: "Suspendido", variant: "destructive" as const }
    };
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "default" as const };
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: "Baja", variant: "outline" as const },
      medium: { label: "Media", variant: "secondary" as const },
      high: { label: "Alta", variant: "default" as const },
      urgent: { label: "Urgente", variant: "destructive" as const }
    };
    return priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, variant: "default" as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Casos</h2>
          <p className="text-muted-foreground">
            Administra casos, clientes y actividades legales
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewClientForm(true)} variant="outline">
            <User className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
          <Button onClick={() => setShowNewCaseForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Caso
          </Button>
        </div>
      </div>

      {/* New Case Form */}
      {showNewCaseForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Caso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="case-title">Título del Caso *</Label>
                <Input
                  id="case-title"
                  value={newCase.title}
                  onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                  placeholder="Título del caso"
                />
              </div>
              <div>
                <Label htmlFor="case-type">Tipo de Caso</Label>
                <Input
                  id="case-type"
                  value={newCase.case_type}
                  onChange={(e) => setNewCase({...newCase, case_type: e.target.value})}
                  placeholder="Tipo de caso"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="case-description">Descripción</Label>
              <Input
                id="case-description"
                value={newCase.description}
                onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                placeholder="Descripción del caso"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="case-client">Cliente *</Label>
                <Select value={newCase.client_id} onValueChange={(value) => setNewCase({...newCase, client_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="case-priority">Prioridad</Label>
                <Select value={newCase.priority} onValueChange={(value: any) => setNewCase({...newCase, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="case-value">Valor Estimado</Label>
                <Input
                  id="case-value"
                  type="number"
                  value={newCase.estimated_value}
                  onChange={(e) => setNewCase({...newCase, estimated_value: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateCase}>Crear Caso</Button>
              <Button variant="outline" onClick={() => setShowNewCaseForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Client Form */}
      {showNewClientForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-name">Nombre *</Label>
                <Input
                  id="client-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="client-email">Email *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-phone">Teléfono</Label>
                <Input
                  id="client-phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <Label htmlFor="client-company">Empresa</Label>
                <Input
                  id="client-company"
                  value={newClient.company}
                  onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="client-address">Dirección</Label>
              <Input
                id="client-address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                placeholder="Dirección completa"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateClient}>Crear Cliente</Button>
              <Button variant="outline" onClick={() => setShowNewClientForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Casos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar casos o clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="suspended">Suspendidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="cases" className="space-y-4">
          {filteredCases.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron casos</p>
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((case_) => {
              const statusBadge = getStatusBadge(case_.status);
              const priorityBadge = getPriorityBadge(case_.priority);
              const client = clients.find(c => c.id === case_.client_id);
              
              return (
                <Card key={case_.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{case_.title}</CardTitle>
                        <CardDescription>
                          {case_.case_number && (
                            <span className="font-mono text-sm">{case_.case_number}</span>
                          )}
                          {client && (
                            <span className="ml-2">Cliente: {client.name}</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        <Badge variant={priorityBadge.variant}>{priorityBadge.label}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {case_.description && (
                      <p className="text-sm text-muted-foreground mb-4">{case_.description}</p>
                    )}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex gap-4">
                        <span>Tipo: {case_.case_type || 'No especificado'}</span>
                        {case_.estimated_value && (
                          <span className="font-semibold">Valor: €{case_.estimated_value.toLocaleString()}</span>
                        )}
                      </div>
                      <span>Creado: {new Date(case_.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestión de Clientes</h3>
          </div>
          {clients.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No se encontraron clientes</p>
              </CardContent>
            </Card>
          ) : (
            clients.filter(client => 
              client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((client) => {
              const clientCases = cases.filter(c => c.client_id === client.id);
              
              return (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <CardDescription>
                          {client.company && <span>{client.company} • </span>}
                          <span>{client.email}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{clientCases.length} casos</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                      {client.address && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">📍</span>
                          <span>{client.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseManagement;