-- Create case_documents table for storing PDF files associated with cases
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by case_id
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);

-- Create index for faster queries by uploaded_at
CREATE INDEX IF NOT EXISTS idx_case_documents_uploaded_at ON case_documents(uploaded_at);

-- Grant permissions to anon and authenticated roles
GRANT ALL PRIVILEGES ON case_documents TO authenticated;
GRANT SELECT ON case_documents TO anon;

-- Add RLS policy (disabled for now to match current setup)
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (matching current no-auth setup)
CREATE POLICY "Allow all operations on case_documents" ON case_documents
  FOR ALL USING (true) WITH CHECK (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_case_documents_updated_at
    BEFORE UPDATE ON case_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();