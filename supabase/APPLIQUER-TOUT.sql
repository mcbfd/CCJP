-- =====================================================================
-- CCJP — Application complète de la base (les 4 migrations d'un coup)
--
-- ⚠️  FICHIER GÉNÉRÉ — ne pas modifier à la main.
--     Régénérer avec :  npm run db:concat
--
-- Usage : Supabase → SQL Editor → New query → coller tout ce fichier →
--        Run. Les 4 migrations sont appliquées dans l'ordre, en une fois.
--
-- Contenu, dans l'ordre imposé :
--   0001_init_schema.sql     11 tables, index, triggers
--   0002_rls_policies.sql    RLS + is_admin()
--   0003_seed_data.sql       14 commissions, 8 indicateurs, 11 paramètres
--   0004_storage_buckets.sql 4 buckets + politiques Storage
--
-- Après exécution, lancez supabase/verification-apres-migration.sql pour
-- contrôler le résultat (13 vérifications, toutes doivent afficher OK).
-- =====================================================================

-- =======================================================================
-- ÉTAPE 1/4 — 0001_init_schema.sql
-- =======================================================================

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

-- =======================================================================
-- ÉTAPE 2/4 — 0002_rls_policies.sql
-- =======================================================================

-- =====================================================================
-- CCJP — Migration 0002 : Sécurité au niveau des lignes (RLS)
--
-- ⚠️ À APPLIQUER IMMÉDIATEMENT APRÈS 0001, AVANT TOUTE DONNÉE RÉELLE.
--
-- Source : PLAN_IMPLEMENTATION.md §6.5 et §7.1
-- Voir docs/SECURITE.md pour l'explication de la faille corrigée.
-- =====================================================================

-- ---------- Fonction d'habilitation -----------------------------------
-- security definer + search_path figé : évite les attaques par
-- détournement de search_path et les récursions de politiques.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid()
      and actif
  );
$$;

-- ---------- Activation RLS sur toutes les tables -----------------------
alter table public.commissions             enable row level security;
alter table public.membres_bureau          enable row level security;
alter table public.actualites              enable row level security;
alter table public.evenements              enable row level security;
alter table public.projets_phares          enable row level security;
alter table public.adhesions               enable row level security;
alter table public.contacts                enable row level security;
alter table public.medias                  enable row level security;
alter table public.statistiques_indicateurs enable row level security;
alter table public.parametres              enable row level security;
alter table public.admins                  enable row level security;

-- =====================================================================
-- LECTURE PUBLIQUE
-- =====================================================================
create policy "Commissions lisibles publiquement"
  on public.commissions for select using (true);

create policy "Membres du bureau lisibles publiquement"
  on public.membres_bureau for select using (true);

-- Seules les actualités publiées sont visibles du public.
create policy "Actualités publiées lisibles publiquement"
  on public.actualites for select using (statut = 'publie');

create policy "Événements lisibles publiquement"
  on public.evenements for select using (true);

create policy "Projets phares lisibles publiquement"
  on public.projets_phares for select using (true);

create policy "Médias lisibles publiquement"
  on public.medias for select using (true);

create policy "Indicateurs actifs lisibles publiquement"
  on public.statistiques_indicateurs for select using (actif);

-- Les paramètres non sensibles sont lisibles par le site public.
create policy "Paramètres non sensibles lisibles publiquement"
  on public.parametres for select
  using (cle not like '%secret%' and cle not like '%token%' and cle not like '%password%');

-- =====================================================================
-- ÉCRITURE — réservée aux administrateurs habilités
-- =====================================================================
create policy "Admins gèrent les commissions"
  on public.commissions for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les membres du bureau"
  on public.membres_bureau for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les actualités"
  on public.actualites for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les événements"
  on public.evenements for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les projets phares"
  on public.projets_phares for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les médias"
  on public.medias for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les indicateurs"
  on public.statistiques_indicateurs for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les paramètres"
  on public.parametres for all
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- ADHÉSIONS ET MESSAGES
-- Le public peut CRÉER, jamais lire ni modifier.
-- =====================================================================
create policy "Admins lisent les adhésions"
  on public.adhesions for select using (public.is_admin());

create policy "Admins traitent les adhésions"
  on public.adhesions for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Le public peut soumettre une adhésion"
  on public.adhesions for insert with check (true);

create policy "Admins lisent les messages"
  on public.contacts for select using (public.is_admin());

create policy "Admins gèrent les messages"
  on public.contacts for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Le public peut envoyer un message"
  on public.contacts for insert with check (true);

-- =====================================================================
-- TABLE ADMINS — auto-lecture uniquement, gestion par SQL
-- =====================================================================
create policy "Un admin voit sa propre ligne"
  on public.admins for select using (user_id = auth.uid());

create policy "Admins voient tous les admins"
  on public.admins for select using (public.is_admin());

-- =====================================================================
-- CRÉATION DU PREMIER ADMINISTRATEUR
--
-- 1. Dans Supabase Dashboard → Authentication → Users → « Add user »
--    Créer l'utilisateur (email + mot de passe, cocher « Auto Confirm »).
--    Relever son UUID.
--
-- 2. Puis exécuter, en remplaçant l'UUID :
--
--    insert into public.admins (user_id, email, nom)
--    values ('UUID-DU-PREMIER-ADMIN', 'president@ccjp-podor.sn', 'Président du CCJP');
--
-- Répéter l'opération pour chaque administrateur. Un compte par responsable
-- de commission est recommandé (CDC §6.1).
-- =====================================================================

-- =======================================================================
-- ÉTAPE 3/4 — 0003_seed_data.sql
-- =======================================================================

-- =====================================================================
-- CCJP — Migration 0003 : données d'amorçage (seed)
--
-- Source : Cahier des Charges v1.0 §3 (14 commissions, indicateurs d'impact)
--          PLAN_IMPLEMENTATION.md §6.6
--
-- ⚠️ Ce seed contient les données officielles du CCJP. Les valeurs à
--    personnaliser par l'organisation (contacts, réseaux sociaux) sont
--    laissées vides — voir §18.3 du plan.
-- =====================================================================

-- =====================================================================
-- Les 14 commissions officielles
-- =====================================================================
insert into public.commissions
  (numero, slug, nom, description, vision, axes_strategiques, couleur, icone, ordre) values

(1, 'gouvernance-paix-securite',
 'Gouvernance, Paix & Sécurité',
 'Œuvre à la bonne gouvernance locale, à la prévention des conflits et à la sécurité des jeunes de Podor.',
 'Une jeunesse actrice de la paix et de la transparence dans la gestion des affaires locales.',
 array['Gouvernance & Engagement Citoyen'],
 '#1A3A5C', 'scale', 1),

(2, 'communication-relations-publiques',
 'Communication & Relations Publiques',
 'Porte la parole du CCJP, produit l''information institutionnelle et anime les plateformes numériques officielles.',
 'Faire du CCJP une institution visible, crédible et proche de la jeunesse podoroise.',
 array['Gouvernance & Engagement Citoyen'],
 '#1B5E20', 'megaphone', 2),

(3, 'emploi-entrepreneuriat',
 'Emploi & Entrepreneuriat',
 'Accompagne les jeunes vers l''emploi, l''auto-emploi et la création d''entreprise.',
 'Réduire le chômage des jeunes par l''employabilité et l''entrepreneuriat local.',
 array['Emploi, Entrepreneuriat & Numérique'],
 '#1A3A5C', 'briefcase', 3),

(4, 'education-formation',
 'Éducation & Formation',
 'Agit sur la réussite scolaire, l''orientation et l''accès à la formation pour tous les jeunes de Podor.',
 'Aucun jeune de Podor ne doit quitter le système éducatif faute d''accompagnement.',
 array['Éducation, Santé & Inclusion'],
 '#7B3F00', 'graduation-cap', 4),

(5, 'numerique-innovation',
 'Numérique & Innovation',
 'Développe les compétences numériques des jeunes et favorise l''innovation technologique locale.',
 'Faire de la jeunesse de Podor un acteur de la transformation digitale.',
 array['Emploi, Entrepreneuriat & Numérique'],
 '#1A3A5C', 'laptop', 5),

(6, 'sante-bien-etre',
 'Santé & Bien-être',
 'Contribue à l''amélioration de la santé physique et mentale des jeunes et à la prévention.',
 'Une jeunesse en bonne santé, informée et responsable.',
 array['Éducation, Santé & Inclusion'],
 '#7B3F00', 'heart-pulse', 6),

(7, 'genre-inclusion-equite',
 'Genre, Inclusion & Équité',
 'Œuvre à l''égalité des chances, à la participation des jeunes filles et à l''inclusion des personnes vulnérables.',
 'L''égalité de genre et l''inclusion comme conditions du développement de Podor.',
 array['Éducation, Santé & Inclusion'],
 '#7B3F00', 'users', 7),

(8, 'environnement-developpement-durable',
 'Environnement & Développement Durable',
 'Porte les actions de protection de l''environnement, de reboisement et d''adaptation au changement climatique.',
 'Un Podor plus vert et résilient face aux défis climatiques.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'leaf', 8),

(9, 'diaspora-cooperation',
 'Diaspora & Coopération',
 'Mobilise la diaspora podoroise et structure les partenariats nationaux et internationaux.',
 'Une diaspora engagée comme levier de développement de Podor.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'globe', 9),

(10, 'citoyennete-vie-associative',
 'Citoyenneté & Vie Associative',
 'Renforce l''engagement citoyen des jeunes et soutient le tissu associatif de la commune.',
 'Une jeunesse engagée et un mouvement associatif dynamique.',
 array['Gouvernance & Engagement Citoyen'],
 '#1A3A5C', 'landmark', 10),

(11, 'sports',
 'Sports',
 'Développe la pratique sportive et organise les compétitions locales.',
 'Le sport comme vecteur de cohésion, de discipline et de dépassement.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'trophy', 11),

(12, 'culture',
 'Culture',
 'Valorise le patrimoine culturel podorois et accompagne la création artistique des jeunes.',
 'Une culture vivante, fierté et moteur d''attractivité pour Podor.',
 array['Environnement, Culture, Sport & Ouverture'],
 '#1B5E20', 'palette', 12),

(13, 'diagnostic-suivi-evaluation',
 'Diagnostic, Suivi & Évaluation',
 'Produit les données sur la jeunesse et évalue la mise en œuvre du programme du CCJP.',
 'Une décision publique éclairée par des données fiables sur la jeunesse.',
 array['Pilotage, Patrimoine & Développement Territorial'],
 '#1A3A5C', 'bar-chart-3', 13),

(14, 'tourisme-patrimoine',
 'Tourisme & Patrimoine',
 'Fait connaître le patrimoine naturel, historique et culturel de Podor et promeut son attractivité.',
 'Faire de Podor une destination touristique portée par sa jeunesse.',
 array['Pilotage, Patrimoine & Développement Territorial'],
 '#1A3A5C', 'castle', 14);

-- =====================================================================
-- Les 8 indicateurs d'impact à horizon 2029 (CDC §3.3)
-- =====================================================================
insert into public.statistiques_indicateurs (libelle, valeur, unite, icone, ordre) values
('Élèves bénéficiaires des actions éducatives', '2 000', '+', 'school',    1),
('Jeunes formés aux compétences numériques',    '1 000', '+', 'laptop',    2),
('Arbres plantés pour un Podor plus vert',      '5 000', '+', 'trees',     3),
('Participants aux compétitions sportives',     '6 000', '+', 'trophy',    4),
('Projets entrepreneurs accompagnés',           '100',   '+', 'rocket',    5),
('Associations recensées',                       '300',   '+', 'building',  6),
('Partenariats nationaux et internationaux',    '20',    '+', 'handshake', 7),
('Commissions suivies et évaluées chaque année','14',    '',  'clipboard', 8);

-- =====================================================================
-- Paramètres du site (CDC §10.1)
-- Les valeurs vides sont à compléter par le CCJP — voir §18.3 du plan.
-- =====================================================================
insert into public.parametres (cle, valeur, description) values
('site_nom',         'CCJP — Conseil Consultatif des Jeunes de Podor', 'Nom du site affiché partout'),
('site_description', 'Plateforme officielle du Conseil Consultatif des Jeunes de Podor. Écoute · Participation · Impact.', 'Description pour le SEO'),
('email_contact',    'contact@ccjp-podor.sn',                          'Email de contact public — À CONFIRMER'),
('telephone',        '',                                               'Téléphone — À COMPLÉTER'),
('adresse',          'Podor, Région de Saint-Louis, Sénégal',          'Adresse postale'),
('facebook_url',     '',                                               'URL page Facebook — À COMPLÉTER'),
('instagram_url',    '',                                               'URL compte Instagram — À COMPLÉTER'),
('x_url',            '',                                               'URL compte X (Twitter) — À COMPLÉTER'),
('tiktok_url',       '',                                               'URL compte TikTok — À COMPLÉTER'),
('hero_titre',       'La voix de la jeunesse podoroise',               'Titre du bandeau d''accueil'),
('hero_sous_titre',  'Écoute · Participation · Impact',                'Sous-titre du bandeau d''accueil');

-- =======================================================================
-- ÉTAPE 4/4 — 0004_storage_buckets.sql
-- =======================================================================

-- =====================================================================
-- CCJP — Migration 0004 : buckets de stockage (Supabase Storage)
--
-- Source : Cahier des Charges v1.0 §4.3
--          PLAN_IMPLEMENTATION.md §7.4
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('actualites-images', 'actualites-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('membres-photos', 'membres-photos', true, 2097152,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('evenements-images', 'evenements-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', true, 20971520,
   array['application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);

-- =====================================================================
-- Lecture publique sur tous les buckets
-- =====================================================================
create policy "Lecture publique actualites-images"
  on storage.objects for select using (bucket_id = 'actualites-images');

create policy "Lecture publique membres-photos"
  on storage.objects for select using (bucket_id = 'membres-photos');

create policy "Lecture publique evenements-images"
  on storage.objects for select using (bucket_id = 'evenements-images');

create policy "Lecture publique documents"
  on storage.objects for select using (bucket_id = 'documents');

-- =====================================================================
-- Écriture réservée aux administrateurs habilités
-- =====================================================================
create policy "Admins déposent des fichiers"
  on storage.objects for insert with check (public.is_admin());

create policy "Admins mettent à jour des fichiers"
  on storage.objects for update using (public.is_admin());

create policy "Admins suppriment des fichiers"
  on storage.objects for delete using (public.is_admin());

-- =====================================================================
-- NOTE — le format AVIF est volontairement absent des types autorisés.
--
-- L'avis de sécurité GHSA-2xp9-vwfh-vxw4 (« Unauthenticated Remote Code
-- Execution in Image Optimization API when AVIF files are used ») affecte
-- toutes les versions de Next.js antérieures à 15.5.24, donc toute la ligne
-- 14.x utilisée par ce projet. Voir docs/SECURITE.md §2.
-- =====================================================================
-- Fin — les 4 migrations sont appliquées.
