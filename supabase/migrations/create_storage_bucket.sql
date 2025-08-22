-- Crear bucket para documentos de casos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-documents',
  'case-documents',
  true,
  10485760, -- 10MB en bytes
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;