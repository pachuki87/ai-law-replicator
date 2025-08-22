-- =====================================================
-- MIGRACIÓN: ÍNDICES, POLÍTICAS RLS Y DATOS INICIALES
-- =====================================================

-- =====================================================
-- 1. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_case_type ON cases(case_type);
CREATE INDEX IF NOT EXISTS idx_case_activities_case_id ON case_activities(case_id);
CREATE INDEX IF NOT EXISTS idx_case_activities_due_date ON case_activities(due_date);
CREATE INDEX IF NOT EXISTS idx_generated_documents_user_id ON generated_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_case_id ON generated_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_user_id ON compliance_issues(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_issues_status ON compliance_issues(status);
CREATE INDEX IF NOT EXISTS idx_case_predictions_case_id ON case_predictions(case_id);

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_cases_user_status ON cases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_user_type ON generated_documents(user_id, document_type);
CREATE INDEX IF NOT EXISTS idx_activities_case_status ON case_activities(case_id, status);

-- =====================================================
-- 2. ROW LEVEL SECURITY (RLS)
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
-- 3. POLÍTICAS DE SEGURIDAD
-- =====================================================

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para user_settings
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Políticas para clients
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

-- Políticas para cases
DROP POLICY IF EXISTS "Users can manage own cases" ON cases;
CREATE POLICY "Users can manage own cases" ON cases FOR ALL USING (auth.uid() = user_id);

-- Políticas para case_activities
DROP POLICY IF EXISTS "Users can manage own case activities" ON case_activities;
CREATE POLICY "Users can manage own case activities" ON case_activities FOR ALL USING (auth.uid() = user_id);

-- Políticas para generated_documents
DROP POLICY IF EXISTS "Users can manage own documents" ON generated_documents;
CREATE POLICY "Users can manage own documents" ON generated_documents FOR ALL USING (auth.uid() = user_id);

-- Políticas para document_templates
DROP POLICY IF EXISTS "Users can view public templates" ON document_templates;
CREATE POLICY "Users can view public templates" ON document_templates FOR SELECT USING (is_public = true OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own templates" ON document_templates;
CREATE POLICY "Users can insert own templates" ON document_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own templates" ON document_templates;
CREATE POLICY "Users can update own templates" ON document_templates FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own templates" ON document_templates;
CREATE POLICY "Users can delete own templates" ON document_templates FOR DELETE USING (auth.uid() = user_id);

-- Políticas para document_history
DROP POLICY IF EXISTS "Users can view own document history" ON document_history;
CREATE POLICY "Users can view own document history" ON document_history FOR SELECT USING (
  document_id IN (SELECT id FROM generated_documents WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert own document history" ON document_history;
CREATE POLICY "Users can insert own document history" ON document_history FOR INSERT WITH CHECK (
  document_id IN (SELECT id FROM generated_documents WHERE user_id = auth.uid())
);

-- Políticas para search_history
DROP POLICY IF EXISTS "Users can view own search history" ON search_history;
CREATE POLICY "Users can view own search history" ON search_history FOR ALL USING (auth.uid() = user_id);

-- Políticas para saved_searches
DROP POLICY IF EXISTS "Users can manage own saved searches" ON saved_searches;
CREATE POLICY "Users can manage own saved searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_conversations
DROP POLICY IF EXISTS "Users can manage own conversations" ON ai_conversations;
CREATE POLICY "Users can manage own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);

-- Políticas para ai_messages
DROP POLICY IF EXISTS "Users can view messages from own conversations" ON ai_messages;
CREATE POLICY "Users can view messages from own conversations" ON ai_messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can insert messages to own conversations" ON ai_messages;
CREATE POLICY "Users can insert messages to own conversations" ON ai_messages FOR INSERT WITH CHECK (
  conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
);

-- Políticas para compliance_issues
DROP POLICY IF EXISTS "Users can manage own compliance issues" ON compliance_issues;
CREATE POLICY "Users can manage own compliance issues" ON compliance_issues FOR ALL USING (auth.uid() = user_id);

-- Políticas para case_predictions
DROP POLICY IF EXISTS "Users can manage own predictions" ON case_predictions;
CREATE POLICY "Users can manage own predictions" ON case_predictions FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 4. FUNCIONES Y TRIGGERS
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_generated_documents_updated_at ON generated_documents;
CREATE TRIGGER update_generated_documents_updated_at BEFORE UPDATE ON generated_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_document_templates_updated_at ON document_templates;
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_compliance_issues_updated_at ON compliance_issues;
CREATE TRIGGER update_compliance_issues_updated_at BEFORE UPDATE ON compliance_issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. DATOS INICIALES
-- =====================================================

-- Insertar roles básicos (solo si no existen)
INSERT INTO roles (name, description, permissions) 
SELECT 'admin', 'Administrador del sistema', '{"all": true}'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');

INSERT INTO roles (name, description, permissions) 
SELECT 'lawyer', 'Abogado', '{"cases": true, "documents": true, "clients": true, "research": true}'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'lawyer');

INSERT INTO roles (name, description, permissions) 
SELECT 'assistant', 'Asistente legal', '{"documents": true, "research": true}'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'assistant');

INSERT INTO roles (name, description, permissions) 
SELECT 'client', 'Cliente', '{"view_own_cases": true}'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'client');

-- Insertar áreas de compliance básicas (solo si no existen)
INSERT INTO compliance_areas (name, description, risk_level) 
SELECT 'GDPR', 'Reglamento General de Protección de Datos', 'high'
WHERE NOT EXISTS (SELECT 1 FROM compliance_areas WHERE name = 'GDPR');

INSERT INTO compliance_areas (name, description, risk_level) 
SELECT 'LOPD', 'Ley Orgánica de Protección de Datos', 'high'
WHERE NOT EXISTS (SELECT 1 FROM compliance_areas WHERE name = 'LOPD');

INSERT INTO compliance_areas (name, description, risk_level) 
SELECT 'Blanqueo de Capitales', 'Prevención del blanqueo de capitales', 'critical'
WHERE NOT EXISTS (SELECT 1 FROM compliance_areas WHERE name = 'Blanqueo de Capitales');

INSERT INTO compliance_areas (name, description, risk_level) 
SELECT 'Código Deontológico', 'Cumplimiento del código deontológico profesional', 'medium'
WHERE NOT EXISTS (SELECT 1 FROM compliance_areas WHERE name = 'Código Deontológico');

INSERT INTO compliance_areas (name, description, risk_level) 
SELECT 'Fiscalidad', 'Cumplimiento de obligaciones fiscales', 'high'
WHERE NOT EXISTS (SELECT 1 FROM compliance_areas WHERE name = 'Fiscalidad');

-- Insertar factores de predicción básicos (solo si no existen)
INSERT INTO prediction_factors (name, category, weight, description) 
SELECT 'Tipo de caso', 'case_type', 1.5, 'El tipo de caso legal influye significativamente en el resultado'
WHERE NOT EXISTS (SELECT 1 FROM prediction_factors WHERE name = 'Tipo de caso');

INSERT INTO prediction_factors (name, category, weight, description) 
SELECT 'Experiencia del juez', 'court', 1.3, 'La experiencia y tendencias del juez asignado'
WHERE NOT EXISTS (SELECT 1 FROM prediction_factors WHERE name = 'Experiencia del juez');

INSERT INTO prediction_factors (name, category, weight, description) 
SELECT 'Jurisdicción', 'location', 1.2, 'La jurisdicción donde se lleva el caso'
WHERE NOT EXISTS (SELECT 1 FROM prediction_factors WHERE name = 'Jurisdicción');

INSERT INTO prediction_factors (name, category, weight, description) 
SELECT 'Complejidad', 'complexity', 1.4, 'Nivel de complejidad del caso'
WHERE NOT EXISTS (SELECT 1 FROM prediction_factors WHERE name = 'Complejidad');

INSERT INTO prediction_factors (name, category, weight, description) 
SELECT 'Precedentes', 'precedents', 1.6, 'Casos similares y sus resultados'
WHERE NOT EXISTS (SELECT 1 FROM prediction_factors WHERE name = 'Precedentes');

INSERT INTO prediction_factors (name, category, weight, description) 
SELECT 'Evidencia', 'evidence', 1.8, 'Calidad y cantidad de evidencia disponible'
WHERE NOT EXISTS (SELECT 1 FROM prediction_factors WHERE name = 'Evidencia');

INSERT INTO prediction_factors (name, category, weight, description) 
SELECT 'Representación legal', 'representation', 1.1, 'Calidad de la representación legal'
WHERE NOT EXISTS (SELECT 1 FROM prediction_factors WHERE name = 'Representación legal');

-- =====================================================
-- 6. PERMISOS PARA ROLES ANON Y AUTHENTICATED
-- =====================================================

-- Otorgar permisos básicos al rol anon (usuarios no autenticados)
GRANT USAGE ON SCHEMA public TO anon;

-- Otorgar permisos completos al rol authenticated (usuarios autenticados)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================