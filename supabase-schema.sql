-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA AI LAW REPLICATOR
-- Supabase PostgreSQL Database Schema
-- =====================================================

-- =====================================================
-- 1. AUTENTICACIÓN Y USUARIOS
-- =====================================================

-- Tabla de perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'lawyer' CHECK (role IN ('admin', 'lawyer', 'assistant', 'client')),
  law_firm TEXT,
  specialization TEXT[],
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles y permisos
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuraciones de usuario
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  api_keys JSONB DEFAULT '{}', -- Encriptado
  preferences JSONB DEFAULT '{}',
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'es',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. GESTIÓN DE CLIENTES Y CASOS
-- =====================================================

-- Tabla de clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  company TEXT,
  tax_id TEXT,
  client_type TEXT DEFAULT 'individual' CHECK (client_type IN ('individual', 'company', 'organization')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de casos
CREATE TABLE cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  case_type TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'suspended', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  court TEXT,
  judge TEXT,
  opposing_party TEXT,
  case_value DECIMAL(15,2),
  open_date DATE NOT NULL,
  close_date DATE,
  next_hearing TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividades del caso
CREATE TABLE case_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. DOCUMENTOS GENERADOS Y PLANTILLAS
-- =====================================================

-- Tabla de documentos generados
CREATE TABLE generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ai_provider TEXT, -- 'gemini', 'openai', 'mock'
  generation_prompt TEXT,
  file_url TEXT, -- URL del archivo en Supabase Storage
  file_size INTEGER,
  file_format TEXT DEFAULT 'pdf',
  version INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de plantillas de documentos
CREATE TABLE document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Variables que se pueden personalizar
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de documentos
CREATE TABLE document_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  changes_summary TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. INVESTIGACIÓN JURÍDICA
-- =====================================================

-- Tabla de historial de búsquedas legales
CREATE TABLE search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  search_type TEXT DEFAULT 'all' CHECK (search_type IN ('all', 'public', 'commercial')),
  results_count INTEGER DEFAULT 0,
  search_time INTEGER, -- en milisegundos
  databases_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de búsquedas guardadas
CREATE TABLE saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  search_type TEXT DEFAULT 'all',
  alert_enabled BOOLEAN DEFAULT FALSE,
  last_executed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. ASISTENTE IA
-- =====================================================

-- Tabla de conversaciones con IA
CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  title TEXT,
  conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'legal-advice', 'document-help', 'research')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes de IA
CREATE TABLE ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  ai_provider TEXT, -- 'gemini', 'openai'
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. COMPLIANCE
-- =====================================================

-- Tabla de áreas de compliance
CREATE TABLE compliance_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  regulations JSONB DEFAULT '[]',
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de issues de compliance
CREATE TABLE compliance_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  area_id UUID REFERENCES compliance_areas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  due_date DATE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. PREDICCIONES
-- =====================================================

-- Tabla de predicciones de casos
CREATE TABLE case_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  outcome_probability DECIMAL(5,2), -- 0.00 a 100.00
  confidence_level DECIMAL(5,2),
  factors JSONB DEFAULT '[]',
  similar_cases JSONB DEFAULT '[]',
  ai_model_used TEXT,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actual_outcome TEXT,
  accuracy_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de factores de predicción
CREATE TABLE prediction_factors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.00,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices básicos
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_case_type ON cases(case_type);
CREATE INDEX idx_case_activities_case_id ON case_activities(case_id);
CREATE INDEX idx_case_activities_due_date ON case_activities(due_date);
CREATE INDEX idx_generated_documents_user_id ON generated_documents(user_id);
CREATE INDEX idx_generated_documents_case_id ON generated_documents(case_id);
CREATE INDEX idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_compliance_issues_user_id ON compliance_issues(user_id);
CREATE INDEX idx_compliance_issues_status ON compliance_issues(status);
CREATE INDEX idx_case_predictions_case_id ON case_predictions(case_id);

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_cases_user_status ON cases(user_id, status);
CREATE INDEX idx_documents_user_type ON generated_documents(user_id, document_type);
CREATE INDEX idx_activities_case_status ON case_activities(case_id, status);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_predictions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. POLÍTICAS DE SEGURIDAD
-- =====================================================

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para user_settings
CREATE POLICY "Users can view own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Políticas para clients
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- Políticas para cases
CREATE POLICY "Users can manage own cases" ON cases FOR ALL USING (auth.uid() = user_id);

-- Políticas para case_activities
CREATE POLICY "Users can manage own case activities" ON case_activities FOR ALL USING (auth.uid() = user_id);

-- Políticas para generated_documents
CREATE POLICY "Users can manage own documents" ON generated_documents FOR ALL USING (auth.uid() = user_id);

-- Políticas para document_templates
CREATE POLICY "Users can view public templates" ON document_templates FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON document_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON document_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON document_templates FOR DELETE USING (auth.uid() = user_id);

-- Políticas para document_history
CREATE POLICY "Users can view own document history" ON document_history FOR SELECT USING (
  document_id IN (SELECT id FROM generated_documents WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own document history" ON document_history FOR INSERT WITH CHECK (
  document_id IN (SELECT id FROM generated_documents WHERE user_id = auth.uid())
);

-- Políticas para search_history
CREATE POLICY "Users can view own search history" ON search_history FOR ALL USING (auth.uid() = user_id);

-- Políticas para saved_searches
CREATE POLICY "Users can manage own saved searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_conversations
CREATE POLICY "Users can manage own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_messages
CREATE POLICY "Users can view messages from own conversations" ON ai_messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert messages to own conversations" ON ai_messages FOR INSERT WITH CHECK (
  conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
);

-- Políticas para compliance_issues
CREATE POLICY "Users can manage own compliance issues" ON compliance_issues FOR ALL USING (auth.uid() = user_id);

-- Políticas para case_predictions
CREATE POLICY "Users can manage own predictions" ON case_predictions FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 11. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_documents_updated_at BEFORE UPDATE ON generated_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_issues_updated_at BEFORE UPDATE ON compliance_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. DATOS INICIALES
-- =====================================================

-- Insertar roles básicos
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrador del sistema', '{"all": true}'),
('lawyer', 'Abogado', '{"cases": true, "documents": true, "clients": true, "research": true}'),
('assistant', 'Asistente legal', '{"documents": true, "research": true}'),
('client', 'Cliente', '{"view_own_cases": true}');

-- Insertar áreas de compliance básicas
INSERT INTO compliance_areas (name, description, risk_level) VALUES
('GDPR', 'Reglamento General de Protección de Datos', 'high'),
('LOPD', 'Ley Orgánica de Protección de Datos', 'high'),
('Blanqueo de Capitales', 'Prevención del blanqueo de capitales', 'critical'),
('Código Deontológico', 'Cumplimiento del código deontológico profesional', 'medium'),
('Fiscalidad', 'Cumplimiento de obligaciones fiscales', 'high');

-- Insertar factores de predicción básicos
INSERT INTO prediction_factors (name, category, weight, description) VALUES
('Tipo de caso', 'case_type', 1.5, 'El tipo de caso legal influye significativamente en el resultado'),
('Experiencia del juez', 'court', 1.3, 'La experiencia y tendencias del juez asignado'),
('Jurisdicción', 'location', 1.2, 'La jurisdicción donde se lleva el caso'),
('Complejidad', 'complexity', 1.4, 'Nivel de complejidad del caso'),
('Precedentes', 'precedents', 1.6, 'Casos similares y sus resultados'),
('Evidencia', 'evidence', 1.8, 'Calidad y cantidad de evidencia disponible'),
('Representación legal', 'representation', 1.1, 'Calidad de la representación legal');

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================