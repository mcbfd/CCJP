-- =====================================================================
-- CCJP — Schéma d'authentification LOCAL (développement uniquement)
--
-- ⚠️  CE FICHIER N'EST JAMAIS APPLIQUÉ À SUPABASE.
--
-- Sur Supabase, `auth.users` et GoTrue sont fournis par la plateforme.
-- En local, on émule le minimum nécessaire pour que le VRAI code de
-- l'application (supabase-js) fonctionne sans modification :
--   - auth.users avec un mot de passe haché (bcrypt)
--   - auth.uid() / auth.role() lis le JWT posé par le serveur local
--
-- Les migrations du dépôt (supabase/migrations/) restent intactes et
-- conformes à Supabase : elles ne sont pas modifiées par ce fichier.
-- =====================================================================

create schema if not exists auth;
create table if not exists auth.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  -- bcrypt : compatible avec le format attendu par GoTrue
  encrypted_password text,
  role          text not null default 'authenticated',
  confirmed_at  timestamptz default now(),
  created_at    timestamptz not null default now()
);

-- auth.uid() lit le JWT posé par PostgREST (ou par notre serveur local)
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- auth.role() lit le rôle du JWT, 'anon' par défaut
create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    'anon'
  )
$$;

-- ---------------------------------------------------------------------
-- Supabase Storage (émulation locale)
--
-- Sur Supabase, `storage.buckets` et `storage.objects` sont fournis par la
-- plateforme, avec la RLS activée par défaut sur `storage.objects`. On
-- reproduit ce comportement pour que les politiques de la migration 0004
-- s'appliquent réellement en local.
-- ---------------------------------------------------------------------
create schema if not exists storage;

create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean not null default false,
  file_size_limit    bigint,
  allowed_mime_types text[],
  created_at         timestamptz not null default now()
);

create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text references storage.buckets(id),
  name       text,
  owner      uuid,
  created_at timestamptz not null default now()
);

alter table storage.objects enable row level security;
