import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import FileUpload from "../FileUpload";
import DocumentList from "../DocumentList";
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
  Loader2,
  X,
  Building,
  DollarSign
} from "lucide-react";

import caseService from "../../services/caseService";
import { Case, Client, CaseActivity } from "../../types/database";

const CaseManagement = () => {
  const [casesList, setCasesList] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  // Form states
  const [newCase, setNewCase] = useState({
    title: "",
    description: "",
    case_type: "",
    priority: "medium" as const,
    client_id: "",
    case_value: ""
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
      setCasesList(casesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async () => {
    try {
      if (!newClient.name || !newClient.email) {
        toast.error("Por favor completa los campos obligatorios");
        return;
      }

      await caseService.createClient(newClient);
      toast.success("Cliente creado exitosamente");
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
      toast.error("Error al crear el cliente");
    }
  };

  const handleCreateCase = async () => {
    try {
      if (!newCase.title || !newCase.case_type || !newCase.client_id) {
        toast.error("Por favor completa los campos obligatorios");
        return;
      }

      await caseService.createCase(newCase);
      toast.success("Caso creado exitosamente");
      setShowNewCaseForm(false);
      setNewCase({
        title: "",
        description: "",
        case_type: "",
        priority: "medium",
        client_id: "",
        case_value: ""
      });
      loadData();
    } catch (error) {
      console.error('Error creating case:', error);
      toast.error("Error al crear el caso");
    }
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Casos</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewClientForm(true)}>
            <User className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
          <Button onClick={() => setShowNewCaseForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Caso
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Casos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{casesList.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {casesList.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {casesList.filter(c => c.priority === 'urgent').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar casos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="suspended">Suspendido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {casesList.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay casos</h3>
              <p className="text-muted-foreground text-center mb-4">
                Comienza creando tu primer caso para gestionar tus asuntos legales.
              </p>
              <Button onClick={() => setShowNewCaseForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Caso
              </Button>
            </CardContent>
          </Card>
        ) : (
          casesList.map((case_) => (
            <Card key={case_.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{case_.title}</CardTitle>
                    <CardDescription>
                      {case_.case_number && `Caso #${case_.case_number} • `}
                      {case_.case_type}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {case_.status}
                    </Badge>
                    <Badge variant="secondary">
                      {case_.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {case_.description}
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(case_.created_at).toLocaleDateString()}
                    </div>
                    {case_.case_value && (
                      <div className="flex items-center gap-1">
                        <span>Valor: ${case_.case_value}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600"
                    size="sm"
                    onClick={() => setSelectedCase(case_)}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalles del Caso */}
      <Dialog open={selectedCase !== null} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="case-details-description">
          {selectedCase && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold">
                    {selectedCase.title}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCase(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div id="case-details-description" className="sr-only">
                  Detalles completos del caso incluyendo información del cliente, documentos y opciones de gestión
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Información básica del caso */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Información del Caso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Número de Caso</Label>
                        <p className="text-sm">{selectedCase.case_number || 'No asignado'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tipo de Caso</Label>
                        <p className="text-sm">{selectedCase.case_type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                        <p className="text-sm">{selectedCase.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{selectedCase.status}</Badge>
                        <Badge variant="secondary">{selectedCase.priority}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Información del Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(() => {
                        const client = clients.find(c => c.id === selectedCase.client_id);
                        return client ? (
                          <>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                              <p className="text-sm">{client.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                              <p className="text-sm flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                              <p className="text-sm flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </p>
                            </div>
                            {client.company && (
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
                                <p className="text-sm flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {client.company}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Cliente no encontrado</p>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* Información adicional */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Fecha de Creación</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedCase.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedCase.case_value && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Valor del Caso</p>
                            <p className="text-sm text-muted-foreground">
                              ${selectedCase.case_value}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Última Actualización</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedCase.updated_at).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gestión de Documentos */}
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Subir Documentos</TabsTrigger>
                    <TabsTrigger value="documents">Documentos del Caso</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Subir Nuevo Documento</CardTitle>
                        <CardDescription>
                          Sube documentos PDF relacionados con este caso
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <FileUpload 
                          caseId={selectedCase.id} 
                          onUploadComplete={loadData}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Documentos del Caso</CardTitle>
                        <CardDescription>
                          Todos los documentos asociados a este caso
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DocumentList caseId={selectedCase.id} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Nuevo Cliente */}
      <Dialog open={showNewClientForm} onOpenChange={setShowNewClientForm}>
        <DialogContent className="max-w-md" aria-describedby="new-client-description">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <div id="new-client-description" className="sr-only">
              Formulario para crear un nuevo cliente con información de contacto
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-name">Nombre *</Label>
              <Input
                id="client-name"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                placeholder="Nombre completo del cliente"
              />
            </div>
            <div>
              <Label htmlFor="client-email">Email *</Label>
              <Input
                id="client-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="client-phone">Teléfono</Label>
              <Input
                id="client-phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="Número de teléfono"
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
            <div>
              <Label htmlFor="client-address">Dirección</Label>
              <Input
                id="client-address"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                placeholder="Dirección completa"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewClientForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClient}>
                Crear Cliente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Nuevo Caso */}
      <Dialog open={showNewCaseForm} onOpenChange={setShowNewCaseForm}>
        <DialogContent className="max-w-md" aria-describedby="new-case-description">
          <DialogHeader>
            <DialogTitle>Nuevo Caso</DialogTitle>
            <div id="new-case-description" className="sr-only">
              Formulario para crear un nuevo caso legal con detalles y asignación de cliente
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="case-title">Título del Caso *</Label>
              <Input
                id="case-title"
                value={newCase.title}
                onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                placeholder="Título descriptivo del caso"
              />
            </div>
            <div>
              <Label htmlFor="case-type">Tipo de Caso *</Label>
              <Select value={newCase.case_type} onValueChange={(value) => setNewCase({...newCase, case_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="penal">Penal</SelectItem>
                  <SelectItem value="laboral">Laboral</SelectItem>
                  <SelectItem value="mercantil">Mercantil</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="familiar">Familiar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="case-client">Cliente *</Label>
              <Select value={newCase.client_id} onValueChange={(value) => setNewCase({...newCase, client_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
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
              <Select value={newCase.priority} onValueChange={(value) => setNewCase({...newCase, priority: value as 'low' | 'medium' | 'high' | 'urgent'})}>
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
              <Label htmlFor="case-value">Valor del Caso</Label>
              <Input
                id="case-value"
                type="number"
                value={newCase.case_value}
                onChange={(e) => setNewCase({...newCase, case_value: e.target.value})}
                placeholder="Valor monetario del caso"
              />
            </div>
            <div>
              <Label htmlFor="case-description">Descripción</Label>
              <Input
                id="case-description"
                value={newCase.description}
                onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                placeholder="Descripción detallada del caso"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewCaseForm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCase}>
                Crear Caso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CaseManagement;