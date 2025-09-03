-- Supabase Permissions Setup Script
-- Run this in Supabase SQL Editor AFTER running database_schema.sql
-- This ensures the service_role has all necessary permissions

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT CREATE ON SCHEMA public TO service_role;

-- Grant table permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant future object permissions (for any new objects created)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- Ensure service_role can bypass RLS
ALTER ROLE service_role SET row_security = off;

-- Verify service_role permissions
SELECT 
    schemaname,
    tablename,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
