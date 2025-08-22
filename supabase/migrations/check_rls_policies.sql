-- Verificar políticas RLS existentes para case_documents
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'case_documents';

-- Verificar permisos de tabla para roles anon y authenticated
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'case_documents'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;