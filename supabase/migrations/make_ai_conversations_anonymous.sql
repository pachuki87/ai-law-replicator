-- Migración para hacer ai_conversations compatible con usuarios anónimos
-- Elimina la restricción de clave foránea y hace user_id nullable

-- Eliminar la restricción de clave foránea
ALTER TABLE ai_conversations DROP CONSTRAINT IF EXISTS ai_conversations_user_id_fkey;

-- Hacer user_id nullable
ALTER TABLE ai_conversations ALTER COLUMN user_id DROP NOT NULL;

-- Eliminar la política RLS que requiere autenticación
DROP POLICY IF EXISTS "Users can manage own conversations" ON ai_conversations;

-- Crear nueva política que permita acceso anónimo
CREATE POLICY "Allow anonymous access to conversations" ON ai_conversations FOR ALL USING (true);

-- También hacer lo mismo para ai_messages
CREATE POLICY "Allow anonymous access to messages" ON ai_messages FOR ALL USING (true);

-- Otorgar permisos a roles anónimos y autenticados
GRANT ALL PRIVILEGES ON ai_conversations TO anon;
GRANT ALL PRIVILEGES ON ai_conversations TO authenticated;
GRANT ALL PRIVILEGES ON ai_messages TO anon;
GRANT ALL PRIVILEGES ON ai_messages TO authenticated;