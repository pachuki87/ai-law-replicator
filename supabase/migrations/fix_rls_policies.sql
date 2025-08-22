-- Eliminar políticas RLS existentes si las hay
DROP POLICY IF EXISTS "case_documents_select_policy" ON case_documents;
DROP POLICY IF EXISTS "case_documents_insert_policy" ON case_documents;
DROP POLICY IF EXISTS "case_documents_update_policy" ON case_documents;
DROP POLICY IF EXISTS "case_documents_delete_policy" ON case_documents;

-- Crear políticas RLS que permitan operaciones anónimas
CREATE POLICY "case_documents_select_policy" ON case_documents
    FOR SELECT USING (true);

CREATE POLICY "case_documents_insert_policy" ON case_documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "case_documents_update_policy" ON case_documents
    FOR UPDATE USING (true);

CREATE POLICY "case_documents_delete_policy" ON case_documents
    FOR DELETE USING (true);

-- Otorgar permisos a los roles anon y authenticated
GRANT ALL PRIVILEGES ON case_documents TO anon;
GRANT ALL PRIVILEGES ON case_documents TO authenticated;

-- Asegurar que RLS esté habilitado
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;