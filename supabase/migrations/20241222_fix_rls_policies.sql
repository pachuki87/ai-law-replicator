-- Habilitar RLS en la tabla case_documents
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- Política para permitir a usuarios autenticados insertar documentos
CREATE POLICY "Users can insert their own case documents" ON case_documents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para permitir a usuarios autenticados leer documentos
CREATE POLICY "Users can view case documents" ON case_documents
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Política para permitir a usuarios autenticados actualizar documentos
CREATE POLICY "Users can update case documents" ON case_documents
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política para permitir a usuarios autenticados eliminar documentos
CREATE POLICY "Users can delete case documents" ON case_documents
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Crear bucket para documentos si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-documents', 'case-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir a usuarios autenticados subir archivos al bucket
CREATE POLICY "Users can upload case documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'case-documents' AND
    auth.uid() IS NOT NULL
  );

-- Política para permitir a usuarios autenticados leer archivos del bucket
CREATE POLICY "Users can view case documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'case-documents' AND
    auth.uid() IS NOT NULL
  );

-- Política para permitir a usuarios autenticados actualizar archivos del bucket
CREATE POLICY "Users can update case documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'case-documents' AND
    auth.uid() IS NOT NULL
  );

-- Política para permitir a usuarios autenticados eliminar archivos del bucket
CREATE POLICY "Users can delete case documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'case-documents' AND
    auth.uid() IS NOT NULL
  );

-- Otorgar permisos básicos a los roles anon y authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON case_documents TO authenticated;
GRANT SELECT ON case_documents TO anon;