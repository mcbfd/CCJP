-- =====================================================================
-- CCJP — Plateforme Numérique Officielle
-- Migration 0001 : schéma initial
--
-- 10 tables conformes au Cahier des Charges v1.0 §4.1
--   + 1 table `admins` (ajout de sécurité — voir 0002 et docs/SECURITE.md)
--
-- Source : PLAN_IMPLEMENTATION.md §6.2
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- recherche tolérante aux fautes

-- ---------- Types énumérés -------------------------------------------
create type actualite_statut as enum ('brouillon', 'publie');
create type evenement_statut as enum ('a_venir', 'termine', 'annule');
create type projet_statut    as enum ('planifie', 'en_cours', 'realise');
create type adhesion_statut  as enum ('en_attente', 'accepte', 'refuse');
create type media_type       as enum ('image', 'video', 'document');

-- =====================================================================
-- TABLE 1 — commissions (CDC)
-- =====================================================================
create table public.commissions (
  id                uuid primary key default gen_random_uuid(),
  numero            int  not null unique check (numero between 1 and 14),
  slug              text not null unique,
  nom               text not null,
  description       text,
  vision            text,
  axes_strategiques text[] not null default '{}',
  couleur           text not null default '#1B5E20',
  icone             text,                        -- nom d'icône lucide
  ordre             int  not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- =====================================================================
-- TABLE 2 — membres_bureau (CDC)
-- =====================================================================
create table public.membres_bureau (
  id             uuid primary key default gen_random_uuid(),
  prenom         text not null,
  nom            text not null,
  poste          text not null,                  -- ex. « Président »
  commission_id  uuid references public.commissions(id) on delete set null,
  biographie     text,
  photo_url      text,
  email          text,
  telephone      text,
  ordre          int  not null default 0,        -- ordre d'affichage
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index membres_bureau_ordre_idx      on public.membres_bureau(ordre);
create index membres_bureau_commission_idx on public.membres_bureau(commission_id);

-- =====================================================================
-- TABLE 3 — actualites (CDC)
-- =====================================================================
create table public.actualites (
  id               uuid primary key default gen_random_uuid(),
  titre            text not null,
  slug             text not null unique,
  extrait          text,
  contenu          text,                         -- HTML de l'éditeur riche
  image_url        text,
  commission_id    uuid references public.commissions(id) on delete set null,
  auteur_id        uuid references auth.users(id) on delete set null,
  statut           actualite_statut not null default 'brouillon',
  epingle          boolean not null default false,
  tags             text[] not null default '{}',
  date_publication timestamptz,
  vues             int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index actualites_statut_idx  on public.actualites(statut, date_publication desc);
create index actualites_epingle_idx on public.actualites(epingle) where epingle;
create index actualites_tags_idx    on public.actualites using gin (tags);

-- =====================================================================
-- TABLE 4 — evenements (CDC)
-- =====================================================================
create table public.evenements (
  id               uuid primary key default gen_random_uuid(),
  titre            text not null,
  slug             text not null unique,
  description      text,
  lieu             text,
  date_debut       timestamptz not null,
  date_fin         timestamptz,
  type_evenement   text,                         -- 'reunion','formation','ceremonie'…
  lien_inscription text,
  image_url        text,
  statut           evenement_statut not null default 'a_venir',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index evenements_date_idx   on public.evenements(date_debut);
create index evenements_statut_idx on public.evenements(statut, date_debut);

-- =====================================================================
-- TABLE 5 — projets_phares (CDC)
-- =====================================================================
create table public.projets_phares (
  id             uuid primary key default gen_random_uuid(),
  commission_id  uuid not null references public.commissions(id) on delete cascade,
  titre          text not null,
  description    text,
  annee          int,                            -- 2026, 2027, 2028 ou 2029
  statut         projet_statut not null default 'planifie',
  ordre          int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index projets_commission_idx on public.projets_phares(commission_id, ordre);

-- =====================================================================
-- TABLE 6 — adhesions (CDC)
-- =====================================================================
create table public.adhesions (
  id             uuid primary key default gen_random_uuid(),
  prenom         text not null,
  nom            text not null,
  email          text not null,
  telephone      text,
  quartier       text,                           -- quartier de la commune de Podor
  commission_id  uuid references public.commissions(id) on delete set null,
  motivation     text,
  statut         adhesion_statut not null default 'en_attente',
  created_at     timestamptz not null default now()
);

create index adhesions_statut_idx on public.adhesions(statut, created_at desc);

-- =====================================================================
-- TABLE 7 — contacts (CDC)
-- =====================================================================
create table public.contacts (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  email      text not null,
  sujet      text not null,
  message    text not null,
  lu         boolean not null default false,
  created_at timestamptz not null default now()
);

create index contacts_lu_idx on public.contacts(lu, created_at desc);

-- =====================================================================
-- TABLE 8 — medias (CDC)
-- =====================================================================
create table public.medias (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  url           text not null,
  type          media_type not null default 'image',
  taille        bigint,                          -- octets
  commission_id uuid references public.commissions(id) on delete set null,
  evenement_id  uuid references public.evenements(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create index medias_commission_idx on public.medias(commission_id);
create index medias_evenement_idx   on public.medias(evenement_id);

-- =====================================================================
-- TABLE 9 — statistiques_indicateurs (CDC)
-- =====================================================================
create table public.statistiques_indicateurs (
  id         uuid primary key default gen_random_uuid(),
  libelle    text not null,                      -- ex. « Jeunes formés »
  valeur     text not null,                      -- ex. « 1 000+ »
  unite      text,
  icone      text,
  ordre      int  not null default 0,
  actif      boolean not null default true,
  created_at timestamptz not null default now()
);

create index statistiques_ordre_idx on public.statistiques_indicateurs(ordre) where actif;

-- =====================================================================
-- TABLE 10 — parametres (CDC)
-- =====================================================================
create table public.parametres (
  cle         text primary key,
  valeur      text not null,
  description text,
  updated_at  timestamptz not null default now()
);

-- =====================================================================
-- TABLE 11 — admins (AJOUT DE SÉCURITÉ)
--
-- Corrige la faille de la politique RLS proposée par le cahier des charges
-- (`auth.role() = 'authenticated'`), qui donnait un accès complet à tout
-- utilisateur authentifié. Voir docs/SECURITE.md §1.
-- =====================================================================
create table public.admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  email      text not null,
  nom        text,
  actif      boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Recherche plein texte sur les actualités
--
-- PIÈGE TECHNIQUE :
--   * to_tsvector(regconfig, text) -> IMMUTABLE -> utilisable dans un index
--   * to_tsvector(text)            -> STABLE    -> erreur « functions in
--     index expression must be marked IMMUTABLE »
--   * coalesce(text, text)         -> STABLE    -> même erreur
-- On enveloppe donc l'expression dans une fonction déclarée IMMUTABLE.
-- =====================================================================
create or replace function public.actualites_search_vector(p_titre text, p_extrait text)
returns tsvector
language sql
immutable
parallel safe
set search_path = public
as $$
  select to_tsvector('french',
                     coalesce(p_titre, '') || ' ' || coalesce(p_extrait, ''));
$$;

create index actualites_search_idx on public.actualites
  using gin (public.actualites_search_vector(titre, extrait));

-- Requête correspondante :
--   select *
--   from public.actualites
--   where statut = 'publie'
--     and public.actualites_search_vector(titre, extrait)
--         @@ websearch_to_tsquery('french', :terme);

-- =====================================================================
-- Trigger : mise à jour automatique de updated_at
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger commissions_set_updated_at before update on public.commissions
  for each row execute function public.set_updated_at();
create trigger membres_bureau_set_updated_at before update on public.membres_bureau
  for each row execute function public.set_updated_at();
create trigger actualites_set_updated_at before update on public.actualites
  for each row execute function public.set_updated_at();
create trigger evenements_set_updated_at before update on public.evenements
  for each row execute function public.set_updated_at();
create trigger projets_phares_set_updated_at before update on public.projets_phares
  for each row execute function public.set_updated_at();
create trigger parametres_set_updated_at before update on public.parametres
  for each row execute function public.set_updated_at();
