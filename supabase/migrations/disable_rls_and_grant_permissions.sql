-- Deshabilitar RLS en todas las tablas que lo tienen habilitado
ALTER TABLE public.ai_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_predictions DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos completos a los roles anon y authenticated en todas las tablas
GRANT ALL PRIVILEGES ON public.ai_conversations TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.document_history TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.clients TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.compliance_issues TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.search_history TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.document_templates TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.case_activities TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.profiles TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.cases TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.ai_messages TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.generated_documents TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.user_settings TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.saved_searches TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.case_predictions TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.roles TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.compliance_areas TO anon, authenticated;
GRANT ALL PRIVILEGES ON public.prediction_factors TO anon, authenticated;

-- Otorgar permisos de uso en secuencias (para campos auto-incrementales)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;