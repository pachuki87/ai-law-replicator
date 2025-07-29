import { useState } from "react";
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
  TrendingUp
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CaseData {
  id: string;
  number: string;
  title: string;
  client: string;
  status: 'active' | 'pending' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: string;
  openDate: string;
  nextHearing?: string;
  description: string;
  documents: number;
  value?: string;
}

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cases: number;
  lastContact: string;
}

const mockCases: CaseData[] = [
  {
    id: '1',
    number: 'CIV-2024-001',
    title: 'Demanda por incumplimiento contractual',
    client: 'María García López',
    status: 'active',
    priority: 'high',
    type: 'Civil',
    openDate: '2024-01-15',
    nextHearing: '2024-02-20',
    description: 'Incumplimiento de contrato de arrendamiento comercial',
    documents: 15,
    value: '€25,000'
  },
  {
    id: '2',
    number: 'LAB-2024-002',
    title: 'Despido improcedente',
    client: 'Juan Pérez Martín',
    status: 'pending',
    priority: 'medium',
    type: 'Laboral',
    openDate: '2024-01-10',
    description: 'Reclamación por despido sin causa justificada',
    documents: 8,
    value: '€18,500'
  },
  {
    id: '3',
    number: 'MER-2024-003',
    title: 'Disolución societaria',
    client: 'Constructora ABC S.L.',
    status: 'completed',
    priority: 'low',
    type: 'Mercantil',
    openDate: '2023-12-05',
    description: 'Proceso de disolución y liquidación de sociedad',
    documents: 22,
    value: '€45,000'
  }
];

const mockClients: ClientData[] = [
  {
    id: '1',
    name: 'María García López',
    email: 'maria.garcia@email.com',
    phone: '+34 666 123 456',
    address: 'Calle Mayor 123, Madrid',
    cases: 3,
    lastContact: '2024-01-18'
  },
  {
    id: '2',
    name: 'Juan Pérez Martín',
    email: 'juan.perez@email.com',
    phone: '+34 677 789 012',
    address: 'Avenida Libertad 45, Barcelona',
    cases: 1,
    lastContact: '2024-01-15'
  }
];

export const CaseManagement = () => {
  const [cases, setCases] = useState<CaseData[]>(mockCases);
  const [clients, setClients] = useState<ClientData[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("cases");
  const { toast } = useToast();

  const getStatusColor = (status: CaseData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: CaseData['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: CaseData['status']) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      default: return <FolderOpen className="h-4 w-4" />;
    }
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-legal-secondary to-legal-primary text-primary-foreground rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Casos</h1>
        <p className="text-primary-foreground/90">
          Organiza y gestiona todos tus casos y clientes desde un solo lugar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Casos Activos", value: cases.filter(c => c.status === 'active').length, icon: TrendingUp, color: "text-green-600" },
          { title: "Casos Pendientes", value: cases.filter(c => c.status === 'pending').length, icon: Clock, color: "text-yellow-600" },
          { title: "Total Clientes", value: clients.length, icon: User, color: "text-blue-600" },
          { title: "Casos Completados", value: cases.filter(c => c.status === 'completed').length, icon: CheckCircle, color: "text-purple-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList className="grid w-auto grid-cols-2">
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Casos
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Clientes
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="legal">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo {activeTab === 'cases' ? 'Caso' : 'Cliente'}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Buscar ${activeTab === 'cases' ? 'casos' : 'clientes'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {activeTab === 'cases' && (
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
          )}
        </div>

        <TabsContent value="cases" className="space-y-4">
          {filteredCases.map((case_) => (
            <Card key={case_.id} className="hover:shadow-card transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{case_.title}</CardTitle>
                      <Badge className={getPriorityColor(case_.priority)}>
                        {case_.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {case_.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {case_.openDate}
                        </span>
                        <span className="font-mono text-sm">{case_.number}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(case_.status)}>
                      {getStatusIcon(case_.status)}
                      <span className="ml-1 capitalize">{case_.status}</span>
                    </Badge>
                    <Badge variant="outline">{case_.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{case_.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {case_.documents} documentos
                    </span>
                    {case_.value && (
                      <span className="font-semibold text-legal-primary">{case_.value}</span>
                    )}
                    {case_.nextHearing && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <AlertCircle className="h-4 w-4" />
                        Próxima audiencia: {case_.nextHearing}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Ver detalles</Button>
                    <Button size="sm" variant="ghost">Editar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-card transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </span>
                      </div>
                      <p className="text-sm">{client.address}</p>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{client.cases} casos</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Último contacto: {client.lastContact}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Ver casos</Button>
                    <Button size="sm" variant="ghost">Contactar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};