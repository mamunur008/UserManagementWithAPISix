CREATE SCHEMA IF NOT EXISTS accounts;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- EF Core EnsureCreated creates the object model for local development.
-- This seed is safe to keep as your starting PostgreSQL database bootstrap.
INSERT INTO accounts.organization_type ("Id", "Name", "Code", "CreatedAt", "Active")
SELECT uuid_generate_v4(), 'Head Office', 'HO', now(), true
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='accounts' AND table_name='organization_type')
  AND NOT EXISTS (SELECT 1 FROM accounts.organization_type WHERE "Code"='HO');
