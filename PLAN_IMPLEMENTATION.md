# Plan d'implémentation — Plateforme CCJP
### Conseil Consultatif de la Jeunesse de Podor

| | |
|---|---|
| **Projet** | Site institutionnel + back-office du Conseil Consultatif de la Jeunesse de Podor (CCJP) |
| **Stack** | Next.js (App Router) · Supabase (PostgreSQL + Auth + Storage) · Tailwind CSS · Vercel |
| **IDE / exécution** | Google Antigravity (agents Gemini 3) |
| **Périmètre V1** | Site vitrine institutionnel + page d'administration |
| **Version du document** | 1.0 |
| **Date** | 30 septembre 2026 |
| **Statut** | À valider par le Bureau du CCJP |

---

## Table des matières

1. [Vision, objectifs et contexte](#1-vision-objectifs-et-contexte)
2. [Périmètre fonctionnel](#2-périmètre-fonctionnel)
3. [Architecture technique](#3-architecture-technique)
4. [Modèle de données Supabase](#4-modèle-de-données-supabase)
5. [Rôles, authentification et habilitations](#5-rôles-authentification-et-habilitations)
6. [Spécifications fonctionnelles par module](#6-spécifications-fonctionnelles-par-module)
7. [Design system et interface](#7-design-system-et-interface)
8. [Contraintes réseau, performance et accessibilité](#8-contraintes-réseau-performance-et-accessibilité)
9. [SEO, référencement et mesure d'audience](#9-seo-référencement-et-mesure-daudience)
10. [Sécurité et conformité](#10-sécurité-et-conformité)
11. [Découpage en sprints (backlog de réalisation)](#11-découpage-en-sprints-backlog-de-réalisation)
12. [Méthode d'exécution sur Google Antigravity](#12-méthode-dexécution-sur-google-antigravity)
13. [Configuration et variables d'environnement](#13-configuration-et-variables-denvironnement)
14. [Déploiement et CI/CD sur Vercel](#14-déploiement-et-cicd-sur-vercel)
15. [Recette, mise en production et reprise des contenus](#15-recette-mise-en-production-et-reprise-des-contenus)
16. [Maintenance et exploitation](#16-maintenance-et-exploitation)
17. [Annexes](#17-annexes)

---

## 1. Vision, objectifs et contexte

### 1.1 Contexte

Le **Conseil Consultatif de la Jeunesse de Podor (CCJP)** est l'instance de consultation et de proposition de la jeunesse du département de **Podor**, dans la région de **Saint-Louis** (Sénégal), au cœur du **Fouta Toro**.

Repères territoriaux à intégrer dans la plateforme :

| Élément | Valeur |
|---|---|
| Département | Podor (chef-lieu : Podor) |
| Région | Saint-Louis |
| Arrondissements | Thillé Boubacar · Gamadji Saré · Cas-Cas · Saldé |
| Communes (12) | Aéré Lao, Bodé Lao, Démètte, Galoya Toucouleur, Golléré, Guédé Chantier, Mboumba, Ndiandane, Ndioum, Pété, Podor, Walaldé |
| Communautés rurales (10) | Doumga Lao, Madina Diathbé, Méry, Dodel, Gamadji Saré, Guédé Village, Boké Dialloubé, Mbolo Birane, Fanaye, Ndiayène Peindao |
| Population | ≈ 486 000 habitants (RGPH 2023) |
| Langues locales | Pulaar (dominant), Wolof, Français, Maure |

**Rattachement institutionnel.** Au niveau national, le *Conseil consultatif des Jeunes du Sénégal (CCJS)* a été créé par le **décret n° 2025-1962 du 5 décembre 2025** et installé officiellement le **29 septembre 2026**. Son architecture prévoit une représentation territoriale fine : **2 conseillers par commune, 2 par département, 2 par région**, avec un bureau élu au niveau national. Le CCJP s'inscrit donc dans cette chaîne de légitimité : **terrain → département → région → national**. La plateforme doit rendre visible cette articulation et non fonctionner en vase clos.

### 1.2 Les trois objectifs de la plateforme

| # | Objectif formulé par le CCJP | Traduction fonctionnelle |
|---|---|---|
| **O1** | **Informer** | Publier des actualités, communiqués, notes de réflexion et décisions du Conseil, accessibles au plus grand nombre, y compris hors connexion stable |
| **O2** | **Réunir la jeunesse podoroise** | Donner à voir une structure vivante : bureau, conseillers par commune, commissions, agenda, moyens de contact et de contribution |
| **O3** | **Vulgariser les activités de chaque commission** | Un espace dédié par commission, avec ses activités, ses réalisations, ses rapports et ses indicateurs, compréhensible par un jeune de 15 ans comme par un partenaire technique |

### 1.3 Personas

| Persona | Besoin | Attente clé |
|---|---|---|
| **Jeune Podorois (15–35 ans)** | « Que fait le CCJP pour moi ? » | Comprendre vite, trouver où et quand ont lieu les activités, pouvoir proposer |
| **Conseiller / membre du CCJP** | « Où en est ma commission ? » | Retrouver les comptes rendus, les dates de réunion, les membres de sa commission |
| **Responsable de commission** | « Comment rendre visible mon travail ? » | Publier lui-même les activités de sa commission, sans passer par un informaticien |
| **Secrétaire exécutif / Bureau** | « Comment piloter ? » | Tableau de bord, état des publications, messages reçus, statistiques |
| **Partenaire / autorité (MJS, conseil départemental, ONG, presse)** | « Quelle est la légitimité et la traçabilité ? » | Documents officiels, rapports d'activité, historique daté |
| **Administrateur du site** | « Je ne suis pas développeur » | Interface d'administration 100 % en français, simple, sans code |

### 1.4 Indicateurs de succès (KPI)

| Indicateur | Cible à 6 mois |
|---|---|
| Articles publiés / mois | ≥ 4 |
| Délai de publication après une activité | ≤ 72 h |
| Commissions avec au moins une activité publiée | 100 % |
| Taux de remplissage de la fiche « Activité » | ≥ 90 % |
| Visiteurs uniques mensuels | ≥ 5 000 |
| Temps de chargement mobile (LCP) | ≤ 2,5 s |
| Messages reçus via le formulaire | ≥ 30 / mois |

---

## 2. Périmètre fonctionnel

### 2.1 Dans le périmètre V1 (ce plan)

**Espace public**
- Page d'accueil éditoriale (à la une, dernières actualités, agenda, bloc « réunir la jeunesse », accès commissions)
- Actualités : liste filtrable + fiche article
- Présentation du CCJP : missions, organisation, historique, lien avec le CCJS
- Bureau exécutif et conseillers (annuaire, filtrable par commune)
- **Commissions** : liste + page dédiée par commission
- **Activités** : liste filtrable (par commission, par type, par commune, par période) + fiche activité avec compte rendu, indicateurs et galerie
- Agenda / événements à venir
- Ressources documentaires (PV, statuts, rapports, communiqués) — téléchargement
- Galerie photos
- Formulaire de contact + formulaire « Propose ton idée au CCJP »
- Recherche plein texte
- Newsletter (inscription simple)
- Mentions légales, politique de confidentialité, accessibilité

**Back-office (`/admin`)**
- Authentification sécurisée, tableau de bord
- CRUD complet : actualités, activités, événements, commissions, membres, documents, médias
- Modération des messages reçus (statut, réponse type)
- Paramètres du site (nom, logo, coordonnées, réseaux sociaux, textes d'accueil)
- Gestion des comptes administrateurs et de leurs rôles
- Brouillons / planification de publication / archivage

### 2.2 Hors périmètre V1 (feuille de route V2 / V3)

| Version | Fonctionnalités |
|---|---|
| **V2** | Espace membre connecté ; dépôt de propositions par commission ; suivi de projet ; commentaires modérés ; sondages/consultations en ligne ; notifications e-mail ; version **Pulaar** et **Wolof** du site |
| **V3** | Application mobile (PWA) ; diffusion hors-ligne ; tableau de bord analytique avancé ; intégration Open Data ; module budget/projets |

### 2.3 Hypothèses et points à valider

> Ces points doivent être confirmés par le Bureau du CCJP avant le lancement du Sprint 1. Voir aussi §17.4.

- La liste exacte des **commissions** du CCJP n'est pas encore arrêtée dans ce document. Les 7 commissions proposées en §6.4 sont un **modèle par défaut** à ajuster.
- Le nombre de conseillers, la durée du mandat et la composition du bureau sont à fournir.
- Le CCJP dispose (ou disposera) d'un compte **Supabase** et d'un compte **Vercel** — sinon, ils seront créés en phase 0.
- L'hébergement des documents officiels reste sur le bucket Supabase (V1) ; un archivage externe peut être envisagé si les volumes deviennent importants.

### 2.4 Ce que j'attends de vos documents

Vous avez indiqué vouloir coller vos documents dans le chat. Pour transformer ce plan en spécification définitive et compléter les §§ 2.3, 4.7 et 6.4, merci de me transmettre :

| Document | Ce qu'il permet de figer |
|---|---|
| Statuts / règlement intérieur du CCJP | Dénomination exacte, missions, commissions officielles, règles de décision |
| Décret / arrêté ou texte créant le CCJP | Base légale, champ de compétences, rattachement au CCJS |
| Liste du bureau et des conseillers | Modèle `members`, filtres par commune, ordre d'affichage |
| Liste et périmètre des commissions | Table `commissions`, `activity_type`, gabarits de pages |
| Comptes rendus / rapports d'activité existants | Modèle `activities`, catégories de documents |
| Charte graphique (logo, couleurs, polices) | §7 Design system |
| Contenus rédigés (textes de présentation, discours) | §6.1 et §6.3, reprise de contenus |

---

## 3. Architecture technique

### 3.1 Stack retenue et justification

| Couche | Technologie | Justification pour le CCJP |
|---|---|---|
| **Framework** | **Next.js 15** (App Router, React 19, TypeScript) | Rendu serveur = pages rapides même en 3G ; routage par fichiers ; image optimisation intégrée ; Server Actions pour le back-office sans API REST à écrire |
| **Base de données** | **Supabase** (PostgreSQL hébergé) | Base relationnelle robuste, **Row Level Security** native, Auth intégrée, Storage pour les fichiers, génération automatique des types TypeScript, sauvegardes |
| **Authentification** | **Supabase Auth** | E-mail + mot de passe pour l'équipe ; zéro serveur à maintenir ; sessions sécurisées par cookie httpOnly |
| **Stockage fichiers** | **Supabase Storage** | Images d'actualités, galerie, PDF ; CDN ; politiques d'accès par bucket |
| **Styles** | **Tailwind CSS v4** | Rapide, cohérent, peu de CSS custom ; design tokens en CSS-first (`@theme`) |
| **Composants UI** | **shadcn/ui** + **lucide-react** | Composants accessibles, non verrouillés dans une dépendance opaque |
| **Éditeur de texte** | **Tiptap** (ou `@blocknote/...`) | Éditeur WYSIWYG français pour les rédacteurs non techniques |
| **Hébergement** | **Vercel** | Déploiement Git automatique, preview par branche, CDN mondial, analytics, domaine `.sn` gérable |
| **Qualité** | ESLint, Prettier, `tsc --noEmit`, Playwright | Filet de sécurité avant chaque mise en production |

**Pourquoi pas WordPress ?** Un CMS classique aurait été plus rapide à installer, mais génère du code serveur étatique, des plugins de sécurité à patcher et une expérience d'administration frustrante. La stack choisie donne un site **statique généré + rafraîchi à la demande** (ISR) : coût d'hébergement quasi nul, sécurité forte, et une base de données relationnelle qui rendra les évolutions V2 (espace membre) naturelles.

### 3.2 Vue d'ensemble

```
                          ┌──────────────────────────────┐
   Jeune Podorois  ──────▶│  VERCEL  (CDN + Edge)        │
   Conseiller      ──────▶│  ┌────────────────────────┐  │
   Partenaire      ──────▶│  │  Next.js 15 App Router │  │
                          │  │  ───────────────────   │  │
                          │  │  RSC / SSR / ISR       │  │
                          │  │  Server Actions        │  │
                          │  └───────────┬────────────┘  │
                          └──────────────┼───────────────┘
                                         │ HTTPS (clé service_role côté serveur uniquement)
                          ┌──────────────▼───────────────┐
                          │  SUPABASE                    │
                          │  ┌───────────┐ ┌──────────┐  │
                          │  │ PostgreSQL│ │  Storage │  │
                          │  │  + RLS    │ │ (images, │  │
                          │  │  + pg_trgm│ │  PDF)    │  │
                          │  └───────────┘ └──────────┘  │
                          │  ┌───────────┐ ┌──────────┐  │
                          │  │   Auth    │ │ Realtime │  │
                          │  └───────────┘ └──────────┘  │
                          └──────────────────────────────┘
```

Flux de données :
1. Les visiteurs lisent des pages **prérendues** (ISR) servies par le CDN Vercel.
2. Toute écriture passe par une **Server Action** protégée, qui utilise le client Supabase **serveur** avec la session de l'utilisateur.
3. La **RLS PostgreSQL** est le dernier rempart : même si le code applicatif avait une faille, la base refuse l'accès.
4. À chaque publication, on **revalide le cache** (`revalidatePath` / `revalidateTag`) pour une mise en ligne immédiate.

### 3.3 Environnements

| Environnement | Branche Git | URL | Base Supabase | Usage |
|---|---|---|---|---|
| **Local** | feature/* | `localhost:3000` | Projet Supabase de dev | Développement agent Antigravity |
| **Preview** | PR / branche | `*.vercel.app` | Projet de dev | Recette par le Bureau |
| **Production** | `main` | `www.ccjp-podor.sn` | Projet Supabase de prod | Public |

Règle stricte : **jamais de clé `service_role` dans un projet Vercel de preview**, et jamais dans du code client.

### 3.4 Arborescence du projet

```
ccjp/
├── .env.local.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── middleware.ts                    # protection des routes /admin
├── README.md
├── PLAN_IMPLEMENTATION.md
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_init_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   └── 0003_seed_data.sql
│   └── seed.sql
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   ├── illustrations/
│   └── documents/                   # PDF statiques (mentions légales…)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Accueil
│   │   ├── globals.css
│   │   ├── (site)/                  # Groupe de routes publiques
│   │   │   ├── actualites/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── ccjp/
│   │   │   │   ├── page.tsx         # Missions & organisation
│   │   │   │   ├── bureau/page.tsx
│   │   │   │   └── commissions/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [slug]/page.tsx
│   │   │   ├── activites/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── agenda/page.tsx
│   │   │   ├── ressources/page.tsx
│   │   │   ├── galerie/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── proposer/page.tsx
│   │   │   └── recherche/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx           # sidebar + garde de session
│   │   │   ├── page.tsx             # tableau de bord
│   │   │   ├── connexion/page.tsx
│   │   │   ├── actualites/page.tsx
│   │   │   ├── actualites/nouveau/page.tsx
│   │   │   ├── actualites/[id]/page.tsx
│   │   │   ├── activites/...
│   │   │   ├── agenda/...
│   │   │   ├── commissions/...
│   │   │   ├── membres/...
│   │   │   ├── documents/...
│   │   │   ├── galerie/...
│   │   │   ├── messages/...
│   │   │   └── parametres/page.tsx
│   │   ├── api/
│   │   │   ├── revalidate/route.ts
│   │   │   └── upload/route.ts
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── mentions-legales/page.tsx
│   │   └── confidentialite/page.tsx
│   ├── components/
│   │   ├── ui/                      # shadcn/ui
│   │   ├── site/                    # Header, Footer, Hero, NewsCard…
│   │   ├── admin/                   # AdminShell, DataTable, ImageUpload…
│   │   └── shared/                  # Badge, Stat, EmptyState…
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # client navigateur
│   │   │   ├── server.ts            # client serveur (cookies)
│   │   │   └── admin.ts             # client service_role (serveur only)
│   │   ├── types.ts                 # types générés
│   │   ├── constants.ts
│   │   ├── utils.ts                 # cn(), formatDateFr(), slugify()
│   │   └── validations.ts           # schémas Zod
│   ├── actions/                     # Server Actions
│   │   ├── posts.ts
│   │   ├── activities.ts
│   │   ├── commissions.ts
│   │   ├── members.ts
│   │   ├── documents.ts
│   │   ├── media.ts
│   │   ├── messages.ts
│   │   ├── settings.ts
│   │   └── auth.ts
│   └── middleware-helpers.ts
└── tests/
    ├── e2e/                         # Playwright
    └── unit/
```

---

## 4. Modèle de données Supabase

### 4.1 Diagramme entité-association

```mermaid
erDiagram
    commissions ||--o{ members        : "regroupe"
    commissions ||--o{ activities     : "pilote"
    commissions ||--o{ posts          : "peut-etre-auteur"
    profiles    }o--|| commissions    : "responsable de"
    categories  ||--o{ posts          : "classe"
    activities  ||--o{ media          : "illustre"
    activities  ||--o{ documents      : "archive"
    posts       ||--o{ media          : "illustre"

    commissions {
        uuid id PK
        text name
        text slug UK
        text description
        text mission
        text icon
        text color
        int sort_order
        bool is_active
    }
    profiles {
        uuid id PK_FK
        text full_name
        text email
        user_role role
        uuid commission_id FK
        bool is_active
    }
    members {
        uuid id PK
        text full_name
        text function_title
        uuid commission_id FK
        text commune
        text photo_url
        text bio
        date mandate_start
        date mandate_end
        int sort_order
        bool is_published
    }
    categories {
        uuid id PK
        text name
        text slug UK
        text scope
        text color
    }
    posts {
        uuid id PK
        text title
        text slug UK
        text excerpt
        text content
        uuid category_id FK
        uuid commission_id FK
        uuid author_id FK
        post_status status
        timestamptz published_at
        bool is_featured
        int views
    }
    activities {
        uuid id PK
        text title
        text slug UK
        uuid commission_id FK
        activity_type type
        date activity_date
        text location
        text commune
        int participants_count
        text report_url
        text summary
        text content
        bool is_published
    }
    events {
        uuid id PK
        text title
        text slug UK
        text description
        timestamptz start_at
        timestamptz end_at
        text location
        text event_type
        bool is_published
    }
    documents {
        uuid id PK
        text title
        text description
        document_category category
        text file_url
        int file_size
        date document_date
        bool is_public
    }
    media {
        uuid id PK
        text url
        text caption
        text album
        uuid post_id FK
        uuid activity_id FK
    }
    messages {
        uuid id PK
        text sender_name
        text sender_email
        text sender_phone
        text commune
        text subject
        text body
        message_status status
        text response
    }
    newsletter_subscribers {
        uuid id PK
        text email UK
        bool is_confirmed
    }
    site_settings {
        text key PK
        jsonb value
    }
```

### 4.2 Dictionnaire des tables

| Table | Rôle | Visibilité publique |
|---|---|---|
| `commissions` | Commissions du CCJP | Oui (si `is_active`) |
| `profiles` | Comptes d'administration | Non |
| `members` | Bureau et conseillers | Oui (si `is_published`) |
| `categories` | Thématiques des actualités | Oui |
| `posts` | Actualités, communiqués, notes | Oui (si `status='publie'`) |
| `activities` | Activités du Conseil et des commissions | Oui (si `is_published`) |
| `events` | Agenda | Oui (si `is_published`) |
| `documents` | PV, statuts, rapports | Oui (si `is_public`) |
| `media` | Photos de galerie | Oui |
| `messages` | Messages et propositions reçus | Non |
| `newsletter_subscribers` | Inscrits à la lettre d'information | Non |
| `site_settings` | Paramètres éditables du site | Oui (lecture seule, valeurs non sensibles) |

### 4.3 Schéma SQL complet

```sql
-- =====================================================================
-- CCJP — Plateforme du Conseil Consultatif de la Jeunesse de Podor
-- Migration 0001 : schéma initial
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- recherche tolérante aux fautes

-- ---------- Types énumérés -------------------------------------------
create type user_role as enum
  ('admin', 'editeur', 'responsable_commission', 'lecteur');

create type post_status as enum ('brouillon', 'publie', 'archive');

create type activity_type as enum (
  'reunion_commission',
  'seance_pleniere',
  'formation',
  'sensibilisation',
  'projet_terrain',
  'rencontre_partenaire',
  'conference',
  'mission',
  'autre'
);

create type message_status as enum ('nouveau', 'lu', 'traite', 'archive');

create type document_category as enum (
  'statuts_reglement',
  'proces_verbal',
  'rapport_activite',
  'communique',
  'note_de_reflexion',
  'formation',
  'autre'
);

-- ---------- 1. Commissions -------------------------------------------
create table public.commissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  mission     text,
  icon        text,                       -- nom d'icône lucide
  color       text default '#0C4A6E',
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- 2. Profils (liés à auth.users) ---------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  email         text not null,
  role          user_role not null default 'lecteur',
  commission_id uuid references public.commissions(id) on delete set null,
  phone         text,
  avatar_url    text,
  is_active     boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- ---------- 3. Membres (bureau & conseillers) ------------------------
create table public.members (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  function_title text not null,             -- ex. « Président », « Rapporteur »
  commission_id  uuid references public.commissions(id) on delete set null,
  commune        text,                      -- Podor, Ndioum, Aéré Lao…
  photo_url      text,
  bio            text,
  mandate_start  date,
  mandate_end    date,
  email          text,
  phone          text,
  sort_order     int  not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index members_commission_idx on public.members(commission_id);

-- ---------- 4. Catégories -------------------------------------------
create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  scope      text not null default 'post',   -- 'post' | 'document' | 'event'
  color      text default '#0C4A6E',
  created_at timestamptz not null default now()
);

-- ---------- Recherche plein texte ------------------------------------
-- PIEGE TECHNIQUE A CONNAITRE :
--   * to_tsvector(regconfig, text)  -> IMMUTABLE  -> utilisable dans un index
--   * to_tsvector(text)             -> STABLE     -> erreur « functions in
--     index expression must be marked IMMUTABLE »
--   * coalesce(text, text)          -> STABLE     -> meme erreur
-- On enveloppe donc l'expression dans une fonction declaree IMMUTABLE.
create or replace function public.posts_search_vector(p_title text, p_excerpt text)
returns tsvector
language sql
immutable
parallel safe
set search_path = public
as $$
  select to_tsvector('french',
                     coalesce(p_title, '') || ' ' || coalesce(p_excerpt, ''));
$$;

-- Requete de recherche correspondante (a utiliser dans src/actions/posts.ts) :
--   select *
--   from public.posts
--   where public.posts_search_vector(title, excerpt)
--         @@ websearch_to_tsquery('french', :terme)
--   order by ts_rank(public.posts_search_vector(title, excerpt),
--                    websearch_to_tsquery('french', :terme)) desc;

-- ---------- 5. Actualités -------------------------------------------
create table public.posts (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  excerpt        text,
  content        text,                        -- HTML issu de l'éditeur
  cover_image    text,
  category_id    uuid references public.categories(id) on delete set null,
  commission_id  uuid references public.commissions(id) on delete set null,
  author_id      uuid references public.profiles(id) on delete set null,
  status         post_status not null default 'brouillon',
  is_featured    boolean not null default false,
  published_at   timestamptz,
  views          int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index posts_status_idx    on public.posts(status, published_at desc);
create index posts_featured_idx  on public.posts(is_featured) where is_featured;
-- Index de recherche plein texte : s'appuie sur la fonction dédiée
-- déclarée IMMUTABLE plus haut (voir section « Recherche plein texte »).
create index posts_search_idx on public.posts
  using gin (public.posts_search_vector(title, excerpt));

-- ---------- 6. Activités --------------------------------------------
create table public.activities (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  commission_id     uuid references public.commissions(id) on delete set null,
  type              activity_type not null default 'autre',
  activity_date     date not null,
  end_date          date,
  location          text,
  commune           text,
  participants_count int,
  budget            numeric(12,2),
  summary           text,
  content           text,                     -- compte rendu détaillé
  report_url        text,                     -- PDF du compte rendu
  cover_image       text,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index activities_commission_idx on public.activities(commission_id);
create index activities_date_idx       on public.activities(activity_date desc);
create index activities_type_idx       on public.activities(type);

-- ---------- 7. Agenda ------------------------------------------------
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  description  text,
  start_at     timestamptz not null,
  end_at       timestamptz,
  location     text,
  event_type   text,                          -- 'reunion', 'formation', 'ceremonie'…
  cover_image  text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index events_start_idx on public.events(start_at);

-- ---------- 8. Documents ---------------------------------------------
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  category      document_category not null default 'autre',
  file_url      text not null,
  file_size     int,                          -- octets
  file_type     text default 'application/pdf',
  document_date date,
  activity_id   uuid references public.activities(id) on delete set null,
  is_public     boolean not null default true,
  downloads     int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index documents_category_idx on public.documents(category, document_date desc);

-- ---------- 9. Médias ------------------------------------------------
create table public.media (
  id           uuid primary key default gen_random_uuid(),
  url          text not null,
  caption      text,
  album        text,
  post_id      uuid references public.posts(id) on delete cascade,
  activity_id  uuid references public.activities(id) on delete cascade,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------- 10. Messages & propositions ------------------------------
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_name  text not null,
  sender_email text not null,
  sender_phone text,
  commune      text,
  subject      text not null,
  body         text not null,
  kind         text not null default 'contact',  -- 'contact' | 'proposition'
  status       message_status not null default 'nouveau',
  response     text,
  responded_at timestamptz,
  created_at   timestamptz not null default now()
);

create index messages_status_idx on public.messages(status, created_at desc);

-- ---------- 11. Newsletter -------------------------------------------
create table public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  is_confirmed boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------- 12. Paramètres du site -----------------------------------
create table public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  label       text,
  updated_at  timestamptz not null default now()
);


-- ---------- Trigger updated_at ---------------------------------------
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
create trigger profiles_set_updated_at    before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger members_set_updated_at     before update on public.members
  for each row execute function public.set_updated_at();
create trigger posts_set_updated_at       before update on public.posts
  for each row execute function public.set_updated_at();
create trigger activities_set_updated_at  before update on public.activities
  for each row execute function public.set_updated_at();
create trigger events_set_updated_at      before update on public.events
  for each row execute function public.set_updated_at();
create trigger documents_set_updated_at   before update on public.documents
  for each row execute function public.set_updated_at();

-- ---------- Création automatique du profil ---------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Utilisateur'),
    new.email,
    'lecteur'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 4.4 Fonctions d'habilitation et Row Level Security

```sql
-- =====================================================================
-- Migration 0002 : sécurité au niveau des lignes (RLS)
-- =====================================================================

-- ---------- Fonctions d'habilitation ---------------------------------
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
    select 1 from public.profiles
    where id = auth.uid()
      and is_active
      and role = 'admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active
      and role in ('admin', 'editeur', 'responsable_commission')
  );
$$;

-- Un responsable de commission ne peut écrire que sur SA commission.
create or replace function public.can_manage_commission(target uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.profiles
      where id = auth.uid()
        and is_active
        and role = 'responsable_commission'
        and commission_id = target
    );
$$;

-- ---------- Activation RLS sur toutes les tables ----------------------
alter table public.commissions           enable row level security;
alter table public.profiles              enable row level security;
alter table public.members               enable row level security;
alter table public.categories            enable row level security;
alter table public.posts                 enable row level security;
alter table public.activities            enable row level security;
alter table public.events                enable row level security;
alter table public.documents             enable row level security;
alter table public.media                 enable row level security;
alter table public.messages              enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.site_settings         enable row level security;

-- =====================================================================
-- Politiques : LECTURE PUBLIQUE
-- =====================================================================
create policy "Commissions visibles publiquement"
  on public.commissions for select
  using (is_active);

create policy "Membres publiés visibles publiquement"
  on public.members for select
  using (is_published);

create policy "Catégories visibles publiquement"
  on public.categories for select
  using (true);

create policy "Actualités publiées visibles publiquement"
  on public.posts for select
  using (status = 'publie' and published_at is not null and published_at <= now());

create policy "Activités publiées visibles publiquement"
  on public.activities for select
  using (is_published);

create policy "Événements publiés visibles publiquement"
  on public.events for select
  using (is_published);

create policy "Documents publics visibles publiquement"
  on public.documents for select
  using (is_public);

create policy "Médias visibles publiquement"
  on public.media for select
  using (true);

create policy "Paramètres non sensibles visibles publiquement"
  on public.site_settings for select
  using (key not like '%secret%' and key not like '%token%');

-- =====================================================================
-- Politiques : ÉCRITURE (réservée à l'équipe)
-- =====================================================================
create policy "Staff gère les commissions"
  on public.commissions for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Admin gère les profils"
  on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Chacun lit son propre profil"
  on public.profiles for select
  using (id = auth.uid());

create policy "Staff gère les membres"
  on public.members for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff gère les catégories"
  on public.categories for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff gère les actualités"
  on public.posts for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff gère les activités"
  on public.activities for all
  using (public.can_manage_commission(commission_id))
  with check (public.can_manage_commission(commission_id));

create policy "Staff gère l'agenda"
  on public.events for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff gère les documents"
  on public.documents for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Staff gère les médias"
  on public.media for all
  using (public.is_staff()) with check (public.is_staff());

create policy "Admin lit les messages"
  on public.messages for select
  using (public.is_staff());

create policy "Admin répond aux messages"
  on public.messages for update
  using (public.is_staff()) with check (public.is_staff());

-- =====================================================================
-- Politiques : INSERTION PUBLIQUE (formulaires)
-- Le public ne peut QUE créer, jamais lire ni modifier.
-- =====================================================================
create policy "Le public peut envoyer un message"
  on public.messages for insert
  with check (true);

create policy "Le public peut s'inscrire à la newsletter"
  on public.newsletter_subscribers for insert
  with check (true);
```

> **Note de sécurité.** Les politiques `for insert with check (true)` sont volontairement ouvertes pour permettre au public d'écrire. Elles sont compensées par :
> 1. une **limitation de débit** côté Vercel Edge Middleware (voir §10.3) ;
> 2. l'absence totale de politique `select`/`update`/`delete` publique sur ces tables ;
> 3. une modération obligatoire dans le back-office.

### 4.5 Stockage (buckets Supabase)

| Bucket | Contenu | Public | Taille max | Types |
|---|---|---|---|---|
| `covers` | Images de une des actualités et activités | Oui | 5 Mo | JPEG, PNG, WebP, AVIF |
| `gallery` | Photos d'activités et galerie | Oui | 5 Mo | JPEG, PNG, WebP, AVIF |
| `documents` | PV, rapports, statuts | Oui (lectre seule) | 20 Mo | PDF, DOCX, XLSX |
| `avatars` | Photos des membres et profils | Oui | 2 Mo | JPEG, PNG, WebP |
| `branding` | Logo, visuels institutionnels | Oui | 2 Mo | SVG, PNG |

```sql
-- Politiques de stockage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers',    'covers',    true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('gallery',   'gallery',   true, 5242880, array['image/jpeg','image/png','image/webp','image/avif']),
  ('documents', 'documents', true, 20971520, array['application/pdf','application/msw-word','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
  ('avatars',   'avatars',   true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('branding',  'branding',  true, 2097152, array['image/svg+xml','image/png']);

create policy "Lecture publique des couvertures"
  on storage.objects for select using (bucket_id = 'covers');
create policy "Staff dépose des couvertures"
  on storage.objects for insert
  with check (bucket_id = 'covers' and public.is_staff());
create policy "Staff supprime des couvertures"
  on storage.objects for delete
  using (bucket_id = 'covers' and public.is_staff());
-- … même triptyque pour gallery / documents / avatars / branding
```

### 4.6 Types TypeScript générés

```bash
# À exécuter après chaque migration (à intégrer dans package.json)
npx supabase gen types typescript --project-id <id> > src/lib/types.ts
```

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > src/lib/types.ts",
    "db:diff": "supabase db diff -f",
    "db:reset": "supabase db reset"
  }
}
```

### 4.7 Données d'amorçage (seed)

```sql
-- =====================================================================
-- Migration 0003 : données d'amorçage
-- ⚠ À COMPLÉTER avec les données réelles du CCJP (voir §2.4)
-- =====================================================================

insert into public.commissions (name, slug, description, mission, icon, color, sort_order) values
  ('Communication, Information et Relations Publiques',
   'communication-information',
   'Faire connaître le CCJP, ses travaux et ses positions auprès de la jeunesse et du grand public.',
   'Produire et diffuser l''information du Conseil ; animer les réseaux sociaux ; assurer la couverture médiatique des activités.',
   'megaphone', '#0C4A6E', 1),
  ('Éducation, Formation Professionnelle et Employabilité',
   'education-formation-employabilite',
   'Réfléchir aux solutions pour l''orientation, la formation et l''insertion professionnelle des jeunes de Podor.',
   'Analyser l''offre de formation locale ; proposer des dispositifs d''apprentissage ; faciliter le lien avec les employeurs.',
   'graduation-cap', '#B45309', 2),
  ('Entrepreneuriat, Économie et Emploi des Jeunes',
   'entrepreneuriat-economie-emploi',
   'Promouvoir l''initiative économique des jeunes et l''accès au financement.',
   'Recenser les initiatives locales ; sensibiliser au financement ; appuyer le montage de projets.',
   'briefcase', '#15803D', 3),
  ('Santé, Environnement et Cadre de Vie',
   'sante-environnement-cadre-de-vie',
   'Contribuer à l''amélioration de la santé des jeunes et à la protection de l''environnement dans le département.',
   'Sensibiliser à la santé de la reproduction ; porter des actions de salubrité et de reboisement.',
   'leaf', '#0F766E', 4),
  ('Culture, Sport et Citoyenneté',
   'culture-sport-citoynete',
   'Valoriser la culture pulaar et wolof, promouvoir le sport et la citoyenneté active.',
   'Organiser des activités culturelles et sportives ; promouvoir la paix et la cohésion sociale.',
   'trophy', '#7C3AED', 5),
  ('Genre, Équité et Inclusion',
   'genre-equite-inclusion',
   'Œuvrer à l''égalité des chances et à la participation pleine et entière des jeunes filles et des jeunes en situation de handicap.',
   'Promouvoir la parité dans les instances ; lutter contre les violences basées sur le genre.',
   'users', '#BE185D', 6),
  ('Coopération, Partenariats et Suivi-Évaluation',
   'cooperation-partenariats-suivi',
   'Structurer les relations avec les partenaires et assurer le suivi des engagements du Conseil.',
   'Négocier et suivre les partenariats ; évaluer la mise en œuvre du plan d''action.',
   'handshake', '#1D4ED8', 7);

insert into public.categories (name, slug, scope, color) values
  ('Actualité générale',    'actualite-generale',   'post', '#0C4A6E'),
  ('Communiqué',            'communique',           'post', '#B45309'),
  ('Vie des commissions',   'vie-des-commissions',  'post', '#15803D'),
  ('Note de réflexion',     'note-de-reflexion',    'post', '#7C3AED'),
  ('Partenariat',           'partenariat',          'post', '#1D4ED8'),
  ('Procès-verbal',         'proces-verbal',        'document', '#334155'),
  ('Rapport d''activité',   'rapport-activite',     'document', '#0F766E'),
  ('Statuts & règlement',   'statuts-reglement',    'document', '#7C3AED');

insert into public.site_settings (key, value, label) values
  ('site_name',    '{"value": "CCJP — Conseil Consultatif de la Jeunesse de Podor"}', 'Nom du site'),
  ('tagline',      '{"value": "La voix de la jeunesse podoroise"}', 'Slogan'),
  ('description',  '{"value": "Instance de consultation et de proposition de la jeunesse du département de Podor."}', 'Description'),
  ('email',        '{"value": "contact@ccjp-podor.sn"}', 'E-mail de contact'),
  ('phone',        '{"value": "+221 XX XXX XX XX"}', 'Téléphone'),
  ('address',      '{"value": "Podor, Région de Saint-Louis, Sénégal"}', 'Adresse'),
  ('social',       '{"value": {"facebook": "", "instagram": "", "x": "", "whatsapp": "", "tiktok": ""}}', 'Réseaux sociaux'),
  ('home_hero',    '{"value": {"title": "", "subtitle": "", "cta_label": "", "cta_url": ""}}', 'Bandeau d''accueil');
```

---

## 5. Rôles, authentification et habilitations

### 5.1 Modèle de rôles

| Rôle | Peut faire | Ne peut pas faire |
|---|---|---|
| **`admin`** | Tout : publier, gérer les comptes, modifier les paramètres du site, supprimer | — |
| **`editeur`** | Publier et modifier tous les contenus, modérer les messages | Gérer les comptes, modifier les paramètres sensibles |
| **`responsable_commission`** | Publier/modifier **uniquement** les activités et actualités de **sa** commission ; gérer les membres de sa commission | Toucher aux autres commissions, aux paramètres, aux comptes |
| **`lecteur`** | Se connecter et voir le tableau de bord (préparatoire V2) | Toute écriture |

### 5.2 Parcours d'authentification

```
/admin/*  ──▶ middleware.ts ──▶ session Supabase valide ?
                                   │
                    non ◀─────────┴────────▶ oui
                     │                        │
              /admin/connexion          profil.is_active ?
                     │                        │
              formulaire e-mail          non ──▶ déconnexion + message
              + mot de passe                     │
                     │                        oui
              Supabase Auth                     │
                     └──────────▶ /admin (tableau de bord)
```

Décisions :
- **Connexion par e-mail + mot de passe.** C'est le mécanisme le plus fiable dans le contexte sénégalais (les liens magiques dépendent de la délivrabilité e-mail, parfois aléatoire).
- Politique de mot de passe : **minimum 10 caractères**, avec complexité recommandée.
- **Aucune inscription publique** : les comptes sont créés uniquement par un `admin` depuis `/admin/parametres/utilisateurs`.
- Session persistante 30 jours, rafraîchissement automatique par cookie `httpOnly` + `Secure` + `SameSite=Lax`.
- Protection anti-brute-force : limitation Vercel + `auth.rate_limit` Supabase.
- **2FA (TOTP)** à activer obligatoirement pour les comptes `admin` (désactivable par projet Supabase).

### 5.3 Middleware de protection

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value }) =>
          response.cookies.set(name, value)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/connexion'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

---

## 6. Spécifications fonctionnelles par module

### 6.1 Page d'accueil (`/`)

**Objectif** : en 5 secondes, un jeune podorois doit comprendre *qui est le CCJP*, *ce qu'il fait*, et *comment rejoindre ou contacter*.

Blocs, dans l'ordre :

| # | Bloc | Contenu | Source |
|---|---|---|---|
| 1 | **Bandeau principal (Hero)** | Nom du CCJP, slogan éditable, photo du département / illustration, 2 CTA : « Rejoindre le CCJP » → `/proposer`, « Nos activités » → `/activites` | `site_settings.home_hero` |
| 2 | **Le CCJP en bref** | 3 chiffres clés (commissions, conseillers, activités réalisées) + 3 lignes de mission | compteurs calculés |
| 3 | **À la une** | 1 actualité mise en avant (`is_featured`), grande carte | `posts` |
| 4 | **Dernières actualités** | 6 cartes (titre, date, catégorie, extrait, image) | `posts` |
| 5 | **Agenda** | 3 prochains événements | `events` |
| 6 | **Les commissions** | Grille des commissions actives avec icône et couleur | `commissions` |
| 7 | **Réunir la jeunesse** | Bandeau d'appel : « Ta voix compte » + CTA vers le formulaire de proposition | statique |
| 8 | **Ressources récentes** | 3 derniers documents publiés | `documents` |
| 9 | **Galerie** | Bandeau de 6 photos | `media` |
| 10 | **Newsletter + Contact** | Inscription e-mail et coordonnées | formulaire |

Rendu : **ISR** (`export const revalidate = 300`) + revalidation ciblée à la publication via `revalidateTag('home')`.

### 6.2 Actualités — « Informer » (`/actualites`)

- **Liste** : pagination (12 par page), filtres par catégorie, recherche, tri (récent / ancien / populaire).
- **Fiche** (`/actualites/[slug]`) : image de une, titre, date, auteur, catégorie, corps de l'article, galerie associée, documents liés, boutons de partage (WhatsApp, Facebook, X, copie du lien), articles liés de la même catégorie.
- **Vues** : compteur incrémenté via Server Action (dans la limite du raisonnable pour éviter le gonflement).
- **Statuts** : `brouillon` → `publie` → `archive`. Les brouillons ne sont **jamais** visibles publiquement, pas même via URL directe (garanti par la RLS).

### 6.3 Le CCJP (`/ccjp`)

Sous-pages :

| Route | Contenu |
|---|---|
| `/ccjp` | Missions, vision, ce qu'est un conseil consultatif, historique, rattachement au CCJS national (décret n° 2025-1962 du 5 décembre 2025) |
| `/ccjp/bureau` | Bureau exécutif : cartes avec photo, fonction, commune, biographie |
| `/ccjp/conseillers` | Annuaire filtrable par commission et par commune |
| `/ccjp/commissions` | Grille des 7 (à confirmer) commissions |
| `/ccjp/commissions/[slug]` | Fiche commission : mission, responsable, membres, activités réalisées, actualités liées, documents, indicateurs |
| `/ccjp/fonctionnement` | Comment on devient conseiller, le mandat, les séances plénières, le calendrier |

### 6.4 Activités par commission — « Vulgariser » (`/activites`)

C'est **le module différenciant** de la plateforme. Il répond directement à l'objectif O3.

**Filtres** : commission · type d'activité · commune · période (année / trimestre) · mot-clé.

**Types d'activité** : réunion de commission, séance plénière, formation, sensibilisation, projet de terrain, rencontre partenaire, conférence, mission.

**Fiche activité** (`/activites/[slug]`) :

```
┌─────────────────────────────────────────────────┐
│ [Commission] [Type]            [Date]            │
│ Titre de l'activité                              │
│ Photo de couverture                              │
├──────────────────────┬──────────────────────────┤
│ Résumé exécutif      │  Fiche signalétique      │
│ (lisible en 30 s)    │  • Date & lieu           │
│                      │  • Commune               │
│ Compte rendu détaillé│  • Nb de participants    │
│ (sections, listes)   │  • Budget engagé         │
│                      │  • Partenaires           │
│ Galerie photos       │  • Lien vers le PDF      │
│                      │                          │
│ Enseignements /      │  Autres activités de     │
│ suites à donner      │  la même commission      │
└──────────────────────┴──────────────────────────┘
```

**Objectif de vulgarisation** : chaque fiche doit contenir, au minimum, un **résumé exécutif de 3 phrases** rédigé pour être compris sans connaissance préalable. Un indicateur de complétude s'affiche dans le back-office pour inciter les rédacteurs à remplir la fiche.

**Page de synthèse par commission** (`/ccjp/commissions/[slug]`) : nombre d'activités, participants cumulés, budget total, frise chronologique des 12 derniers mois.

### 6.5 Agenda (`/agenda`)

- Vue **liste** et vue **calendrier mensuel**.
- Distinction visuelle entre « passé » et « à venir ».
- Export `.ics` par événement (bouton « Ajouter à mon calendrier »).
- Aucun événement à venir → message « Aucune activité programmée pour le moment ».

### 6.6 Ressources documentaires (`/ressources`)

- Filtres : catégorie, année, mot-clé.
- Affichage : titre, description, date, type, taille du fichier, nombre de téléchargements.
- Téléchargement direct depuis le bucket `documents`.
- Les documents liés à une activité apparaissent automatiquement sur la fiche de cette activité.

### 6.7 Galerie (`/galerie`)

- Albums thématiques (par commission ou par événement).
- Lightbox accessible au clavier, navigation précédent/suivant.
- Images servies via `next/image` en WebP/AVIF, dimensions multiples générées par Vercel.

### 6.8 Contact et propositions — « Réunir la jeunesse » (`/contact`, `/proposer`)

**Formulaire de contact** : nom, e-mail, téléphone (optionnel), commune (liste déroulante), objet, message. Case anti-spam (honeypot + contrainte de temps de saisie). Accusé de réception affiché.

**Formulaire « Propose ton idée »** : nom, âge, commune, commission concernée, titre de la proposition, description, « es-tu disponible pour la défendre en séance ? ». Ces messages sont étiquetés `kind = 'proposition'` et remontés dans le back-office avec un statut dédié.

**Modération** (`/admin/messages`) : liste, filtre par statut et par type, vue détail, réponse type enregistrable, changement de statut (`nouveau` → `lu` → `traite` → `archive`).

### 6.9 Recherche et newsletter

- **Recherche** (`/recherche`) : plein texte sur `posts` et `activities` via `ilike` + index GIN `pg_trgm`, résultats groupés par type, mise en évidence des termes.
- **Newsletter** : inscription e-mail simple, stockage en base, désinscription par lien unique. *L'envoi effectif des lettres est en V2* (via Resend ou Brevet) ; en V1, la base d'abonnés est simplement constituée.

### 6.10 Back-office (`/admin`)

| Page | Contenu |
|---|---|
| `/admin` | **Tableau de bord** : compteurs (articles publiés, brouillons, activités, messages non lus), derniers contenus modifiés, agenda des 7 prochains jours, alertes de complétude |
| `/admin/actualites` | Liste + création + édition ; éditeur riche ; image de une ; catégorie ; commission ; planification ; mise en avant |
| `/admin/activites` | Liste + CRUD ; tous les champs de la fiche activité ; upload multiple de photos ; association de documents |
| `/admin/agenda` | CRUD des événements |
| `/admin/commissions` | CRUD des commissions (nom, slug, description, mission, icône, couleur, ordre, actif) |
| `/admin/membres` | CRUD des membres ; photo ; fonction ; commune ; mandat ; ordre d'affichage |
| `/admin/documents` | Upload et classement des documents |
| `/admin/galerie` | Albums, upload multiple, légendes, ordre |
| `/admin/messages` | Modération |
| `/admin/parametres` | Identité du site, coordonnées, réseaux sociaux, textes d'accueil, gestion des utilisateurs et des rôles |

**Principes d'interface du back-office** :
1. Tout en **français**, sans jargon technique.
2. Chaque formulaire affiche une **aide contextuelle** en dessous du champ concerné.
3. **Brouillon automatique** (localStorage) pendant la saisie longue.
4. **Aperçu** avant publication pour les actualités.
5. Confirmation explicite avant toute suppression.
6. Messages de succès/erreur clairs, en français.

---

## 7. Design system et interface

### 7.1 Palette (à ajuster selon la charte CCJP)

Proposée à partir des couleurs nationales sénégalaises et de l'identité fluviale du département :

| Token | Nom | Hex | Usage |
|---|---|---|---|
| `--color-fleuve-900` | Bleu Fleuve profond | `#082F49` | Texte principal, en-têtes |
| `--color-fleuve-700` | Bleu Fleuve | `#0C4A6E` | **Couleur primaire** : boutons, liens, en-tête |
| `--color-fleuve-500` | Bleu Fleuve clair | `#0284C7` | Survol, accents |
| `--color-sahel-500` | Or Sahel | `#F59E0B` | **Accent** : badges, mises en avant, CTA secondaire |
| `--color-espoir-600` | Vert Espoir | `#15803D` | Succès, environnement, actions validées |
| `--color-terre-500` | Terre de Podor | `#B45309` | Alertes douces, catégories |
| `--color-sable-50` | Sable | `#FAFAF9` | Fond de page |
| `--color-sable-200` | Sable bordure | `#E7E5E4` | Bordures, séparateurs |

```css
/* src/app/globals.css — Tailwind v4, config CSS-first */
@import "tailwindcss";

@theme {
  --color-fleuve-50:  #F0F9FF;
  --color-fleuve-700: #0C4A6E;
  --color-fleuve-900: #082F49;
  --color-sahel-500:  #F59E0B;
  --color-espoir-600: #15803D;
  --color-terre-500:  #B45309;
  --color-sable-50:   #FAFAF9;
  --color-sable-200:  #E7E5E4;

  --font-sans: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-display: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
}
```

### 7.2 Typographie

- **Titres** : `Plus Jakarta Sans` (ou `Outfit`), poids 700/800.
- **Corps** : `Inter`, 16 px, interlignage 1.65.
- Polices **auto-hébergées** via `next/font/google` (évite un appel CDN externe bloquant, améliore nettement les performances au Sénégal).

### 7.3 Composants et gabarits

| Composant | Description |
|---|---|
| `SiteHeader` | Logo, navigation principale (Accueil, Le CCJP ▾, Commissions ▾, Activités, Agenda, Ressources, Galerie, Contact), bouton « Proposer », recherche, menu mobile en tiroir |
| `SiteFooter` | Coordonnées, plan du site, réseaux sociaux, mentions légales, « Fait avec ❤ à Podor » |
| `Card` | Carte générique (article, activité, membre, document) |
| `Badge` | Étiquette de catégorie / commission / statut, colorée |
| `StatBlock` | Bloc chiffre clé (nombre + libellé) |
| `Timeline` | Frise chronologique des activités |
| `FilterBar` | Barre de filtres (sélecteurs + recherche), synchro avec l'URL |
| `DataTable` | Tableau du back-office (tri, pagination, actions) |
| `ImageUpload` | Glisser-déposer, aperçu, compression côté client avant envoi |
| `RichTextEditor` | Éditeur Tiptap : gras, italique, titres, listes, lien, citation, image, alignement |
| `EmptyState` | État vide explicite (« Aucune actualité pour l'instant ») |

### 7.4 Règles visuelles

- **Mobile-first** : la maquette est conçue pour 360 px puis enrichie.
- Grille 12 colonnes, conteneur max 1200 px, gouttière 16 px (mobile) / 24 px (desktop).
- Rayons : 8 px (petits éléments), 12 px (cartes), 16 px (sections).
- Ombres très discrètes ; profondeur portée par les bordures et les fonds.
- Aucun dégradé agressif ; préférer des aplats et des Filets de couleur.
- **Pas de carrousel automatique** sur les actualités (mauvais pour l'accessibilité et la performance).

---

## 8. Contraintes réseau, performance et accessibilité

### 8.1 Contexte réseau sénégalais

La majorité des visiteurs consulteront le site depuis un **téléphone Android en 3G/4G**, avec une facturation de données réelle. Chaque octet compte.

| Mesure | Mise en œuvre |
|---|---|
| Images | `next/image` en **AVIF/WebP**, dimensions `srcset` adaptatives, `priority` sur l'image de une uniquement |
| JS client | Server Components par défaut ; `"use client"` uniquement là où c'est nécessaire (filtres, éditeur, lightbox) |
| Polices | auto-hébergées, `display: swap`, sous-ensemble latin |
| PDF | compression avant dépôt (objectif < 2 Mo) ; affichage de la taille |
| Chargement | `<link rel="preload">` sur les ressources critiques ; polices système en repli |
| Cache | ISR 5 min sur les listes, 1 h sur les fiches ; CDN Vercel |
| Tiers | **Aucun script tiers** en V1 sauf analytics léger (Vercel Analytics, < 2 Ko) |

**Cibles** : LCP ≤ 2,5 s sur 4G, CLS ≤ 0,1, première requête ≤ 200 Ko de HTML+JS.

### 8.2 Accessibilité (WCAG 2.1 AA)

- Contrastes vérifiés (≥ 4,5:1 pour le texte courant).
- Navigation **100 % au clavier**, avec un lien d'évitement (« Aller au contenu »).
- Attributs `alt` obligatoires sur les images (validé côté back-office).
- Libellés de formulaire explicites, messages d'erreur associés via `aria-describedby`.
- Structure de titres `h1` → `h2` → `h3` respectée, un seul `h1` par page.
- Langue `fr` déclarée ; attributs `lang` sur les passages en pulaar/wolof.
- Respect de `prefers-reduced-motion`.

### 8.3 Robustesse

- Pages d'erreur 404 et 500 personnalisées, en français.
- `loading.tsx` (squelettes) sur chaque route dynamique.
- Gestion des cas vides sur toutes les listes.
- Repli si Supabase est injoignable : message explicite plutôt qu'un écran blanc.

---

## 9. SEO, référencement et mesure d'audience

| Élément | Mise en œuvre |
|---|---|
| Métadonnées | `generateMetadata()` sur chaque page : titre, description, Open Graph, Twitter Card |
| `sitemap.xml` | `app/sitemap.ts` — actualités, activités, commissions, membres |
| `robots.txt` | `app/robots.ts` — autorise tout sauf `/admin`, `/api` |
| URL | Slugs lisibles, en français, stables (jamais renommés après publication) |
| Données structurées | JSON-LD `Organization`, `NewsArticle`, `Event`, `Person` |
| Langue | `<html lang="fr">` ; balises `hreflang` préparées pour le pulaar/wolof en V2 |
| Maillage interne | Fil d'Ariane sur les fiches ; articles liés ; liens vers la commission concernée |
| Analytics | **Vercel Analytics** + événements personnalisés (`telechargement`, `proposition_envoyee`, `clic_whatsapp`) |

---

## 10. Sécurité et conformité

### 10.1 Principes

1. **La base est le dernier rempart** : la RLS est activée sur toutes les tables, y compris celles en lecture seule publique.
2. **La clé `service_role` n'existe que côté serveur**, dans des variables d'environnement Vercel non exposées au client (`SUPABASE_SERVICE_ROLE_KEY` sans préfixe `NEXT_PUBLIC_`).
3. **Toute écriture est validée par Zod** côté serveur, même si le formulaire client valide déjà.
4. **Aucun secret dans Git** : `.env.local` est ignoré, `.env.local.example` documente les variables.
5. **En-têtes de sécurité** dans `next.config.ts` : CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

```ts
// next.config.ts (extrait)
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]
```

### 10.2 Gestion des contenus sensibles

- Les **brouillons** ne sont jamais exposés (RLS + filtre applicatif).
- Les documents non publics (`is_public = false`) sont inaccessibles publiquement.
- Les **données personnelles** des membres et des conseillers sont limitées au nécessaire ; les e-mails et téléphones ne sont publiés que sur décision explicite du Bureau.
- Suppression en cascade : supprimer une activité supprime ses médias liés.

### 10.3 Lutte contre le spam et les abus

- Champ **honeypot** caché sur tous les formulaires publics.
- Contrainte de **temps de saisie minimal** (rejet si soumission < 3 s).
- **Limitation de débit** au middleware Vercel : 5 soumissions / IP / heure sur `/api/*` et les Server Actions de formulaire.
- Échappement systématique du HTML des entrées utilisateur (React le fait par défaut ; l'éditeur riche est réservé au personnel authentifié).
- Sauvegarde quotidienne automatique par Supabase + export hebdomadaire manuel des données.

### 10.4 Conformité

- Page **mentions légales** et **politique de confidentialité** obligatoires, y compris le droit à l'effacement des données personnelles.
- Bandeau de consentement analytics si un cookie tiers est ajouté (V1 : Vercel Analytics ne dépose pas de cookie → pas de bandeau nécessaire).

---

## 11. Découpage en sprints (backlog de réalisation)

Durée estimée : **8 à 10 semaines** pour une équipe de 1 à 2 personnes assistées par un agent Antigravity.

### Sprint 0 — Fondations (semaine 1)

| ID | Tâche | Critère d'acceptation |
|---|---|---|
| S0.1 | Créer le projet Next.js 15 + TypeScript + Tailwind v4 | `npm run dev` répond sur `:3000` |
| S0.2 | Initialiser Git, configurer ESLint/Prettier | `npm run lint` passe sans erreur |
| S0.3 | Créer le projet Supabase (dev + prod) | URL et clés disponibles |
| S0.4 | Écrire et appliquer les migrations 0001–0003 | Toutes les tables et politiques existent |
| S0.5 | Configurer les buckets Storage et leurs politiques | Upload test réussi |
| S0.6 | Écrire `.env.local.example` et documenter | Aucun secret commité |
| S0.7 | Créer le compte `admin` initial et vérifier la RLS | Un `lecteur` anonyme ne voit que le contenu publié |
| S0.8 | Déployer une coquille sur Vercel | L'URL de preview répond |

### Sprint 1 — Socle applicatif (semaine 2)

| ID | Tâche | Critère d'acceptation |
|---|---|---|
| S1.1 | Configurer les clients Supabase (navigateur / serveur / admin) | Connexion établie des deux côtés |
| S1.2 | Générer les types TypeScript | `src/lib/types.ts` à jour |
| S1.3 | Implémenter le design system (`globals.css`, tokens, composants UI) | Palette et typo conformes |
| S1.4 | Construire `SiteHeader` + `SiteFooter` + navigation mobile | Navigation complète, responsive |
| S1.5 | Mettre en place le `middleware.ts` de protection `/admin` | Redirection vers connexion si non authentifié |
| S1.6 | Page `/admin/connexion` + Server Action d'authentification | Connexion/déconnexion fonctionnelles |
| S1.7 | `AdminShell` (sidebar, en-tête, indicateur de rôle) | Layout admin rendu |
| S1.8 | Helpers : `slugify`, `formatDateFr`, `cn`, pagination | Tests unitaires passent |

### Sprint 2 — Contenus (semaines 3–4)

| ID | Tâche | Critère d'acceptation |
|---|---|---|
| S2.1 | Module Catégories + Commissions (CRUD back-office) | Création/édition/suppression OK |
| S2.2 | Module Actualités : formulaire + éditeur Tiptap + image de une | Publication effective |
| S2.3 | Page liste actualités avec filtres et pagination | Filtres synchronisés avec l'URL |
| S2.4 | Page fiche actualité + métadonnées + JSON-LD | Page complète et partageable |
| S2.5 | Revalidation ISR à la publication | Contenu en ligne en < 1 min |
| S2.6 | Module Activités : formulaire complet + galerie | Tous les champs renseignables |
| S2.7 | Page liste activités (filtres commission/type/commune) | Filtres combinables |
| S2.8 | Page fiche activité (résumé, compte rendu, indicateurs) | Gabarit conforme §6.4 |
| S2.9 | Page synthèse par commission + frise chronologique | Chiffres corrects |
| S2.10 | Module Membres + pages bureau/conseillers | Annuaire filtrable |

### Sprint 3 — Institutionnel et interactions (semaine 5)

| ID | Tâche | Critère d'acceptation |
|---|---|---|
| S3.1 | Page `/ccjp` (missions, organisation, rattachement CCJS) | Contenu conforme |
| S3.2 | Page `/ccjp/fonctionnement` | Contenu conforme |
| S3.3 | Module Agenda + vue liste et calendrier + export `.ics` | Événements gérables |
| S3.4 | Module Documents + upload + page ressources | Téléchargement fonctionnel |
| S3.5 | Galerie publique + lightbox accessible | Navigation clavier OK |
| S3.6 | Formulaire de contact + modération back-office | Message reçu et traitable |
| S3.7 | Formulaire « Propose ton idée » | Message étiqueté `proposition` |
| S3.8 | Newsletter (inscription + désinscription) | Adresse enregistrée |
| S3.9 | Page recherche plein texte | Résultats pertinents |

### Sprint 4 — Accueil, tableau de bord et paramètres (semaine 6)

| ID | Tâche | Critère d'acceptation |
|---|---|---|
| S4.1 | Assemblage de la page d'accueil (10 blocs) | Rendu conforme §6.1 |
| S4.2 | Compteurs dynamiques (commissions, conseillers, activités) | Chiffres justes |
| S4.3 | Tableau de bord `/admin` | Compteurs et alertes affichés |
| S4.4 | Indicateur de complétude des fiches activité | Alerte si champs manquants |
| S4.5 | Paramètres du site (identité, contacts, réseaux, textes) | Modifications répercutées |
| S4.6 | Gestion des utilisateurs et des rôles | Création et changement de rôle OK |
| S4.7 | Brouillon automatique et aperçu avant publication | Sauvegarde locale fonctionnelle |

### Sprint 5 — Qualité, performance, conformité (semaine 7)

| ID | Tâche | Critère d'acceptation |
|---|---|---|
| S5.1 | En-têtes de sécurité + CSP | En-têtes présents en réponse |
| S5.2 | Limitation de débit + honeypot sur les formulaires | Requêtes excessives bloquées |
| S5.3 | Sitemap, robots, métadonnées, JSON-LD | Fichiers valides |
| S5.4 | Mentions légales + politique de confidentialité | Pages publiées |
| S5.5 | Audit accessibilité (clavier, contrastes, ARIA) | WCAG 2.1 AA |
| S5.6 | Audit Lighthouse mobile | Score ≥ 90 (perf, a11y, SEO) |
| S5.7 | Tests Playwright des parcours critiques | Connexion admin, publication, contact |
| S5.8 | Pages 404/500 + squelettes de chargement | Aucun écran blanc |

### Sprint 6 — Contenus, recette et mise en production (semaines 8–9)

| ID | Tâche | Critère d'acceptation |
|---|---|---|
| S6.1 | Reprise des contenus réels (textes, photos, documents) | Aucun contenu de démonstration |
| S6.2 | Vérification des données territoire (communes, commissions) | Données exactes |
| S6.3 | Formation des administrateurs (2 h, en français) | Chacun publie une actualité seul |
| S6.4 | Guide d'utilisation remis au Bureau | Document écrit livré |
| S6.5 | Recette complète par le Bureau | PV de recette signé |
| S6.6 | Configuration du domaine `.sn` et HTTPS | Site accessible |
| S6.7 | Mise en production sur Vercel (branche `main`) | Site en ligne |
| S6.8 | Sauvegarde initiale et vérification | Export réalisé |

---

## 12. Méthode d'exécution sur Google Antigravity

Antigravity est un IDE agentique (Gemini 3) avec **Agent Manager**, **Plan Mode / Fast Mode**, **Artifacts** et un **navigateur intégré**. Voici comment l'utiliser efficacement pour ce projet.

### 12.1 Configuration initiale

1. **Ouvrir le dépôt** `CCJP` dans Antigravity.
2. **Déposer ce plan** (`PLAN_IMPLEMENTATION.md`) à la racine : il servira de mémoire persistante pour les agents.
3. Activer le mode **« Agent-assisted »** (recommandé) : l'agent demande confirmation avant chaque action sensible.
4. Autoriser dans la allow-list : `npm`, `npx`, `node`, `git`, `supabase`.
5. **Refuser** par défaut toute commande touchant à `rm -rf`, aux variables d'environnement de production, ou au déploiement direct.

### 12.2 Règles de prompting

| Règle | Pourquoi |
|---|---|
| **Une tâche = un prompt** | Reprendre un ID de sprint (S2.2) et le coller tel quel dans le prompt |
| **Toujours joindre le contexte** | « Réfère-toi à PLAN_IMPLEMENTATION.md §4.3 pour le schéma et §6.4 pour le gabarit » |
| **Travailler en Plan Mode pour le structurel** | Schéma de base, routes, layout : laisser l'agent produire son plan, le relire, puis l'approuver |
| **Fast Mode pour le correctif** | Une couleur à changer, un libellé à corriger |
| **Vérifier via Artifacts** | Accepter une tâche seulement après avoir vu la capture d'écran du navigateur intégré |
| **Un commit par tâche** | Facilite le retour arrière ; message de commit reprenant l'ID du sprint |

### 12.3 Modèle de prompt (à copier)

```
Contexte : projet CCJP, plateforme Next.js 15 + Supabase + Tailwind + Vercel.
Réfère-toi à PLAN_IMPLEMENTATION.md, sections [X] et [Y].

Tâche [ID] : [intitulé exact du tableau de sprint]

Exigences :
- [exigence 1]
- [exigence 2]

Contraintes :
- Server Components par défaut, "use client" seulement si nécessaire
- Textes et messages en français
- Validation Zod côté serveur
- Pas de secret en dur
- Mobile-first, accessible au clavier

Livrable attendu :
- [fichiers créés/modifiés]
- Vérification : [commande ou capture d'écran]

Ne fais rien d'autre que cette tâche. Ne modifie pas [fichiers exclus].
```

### 12.4 Parallélisation possible

L'Agent Manager permet de lancer plusieurs agents en parallèle. Les lots indépendants :

| Lot | Tâches simultanables |
|---|---|
| **A** | S1.3 (design system) + S1.4 (header/footer) |
| **B** | S2.2 (actualités) + S2.6 (activités) — *après* S2.1 |
| **C** | S3.4 (documents) + S3.5 (galerie) |
| **D** | S5.3 (SEO) + S5.4 (pages légales) |

À ne **pas** paralléliser : tout ce qui touche au schéma de base de données ou au layout racine (conflits garantis).

### 12.5 Points de vigilance avec les agents

- Un agent peut « inventer » une table ou un champ absent du schéma : **toujours recouper avec §4.3**.
- Un agent peut utiliser la clé `service_role` côté client : **vérifier chaque fichier** contenant `createClient`.
- Un agent peut oublier la RLS sur une nouvelle table : **toute nouvelle table doit avoir `enable row level security`** dès sa création.
- Un agent peut écrire les textes en anglais : exiger le français dans chaque prompt.

---

## 13. Configuration et variables d'environnement

### 13.1 `.env.local.example`

```bash
# ---------- Supabase ----------
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
# ⚠ Serveur uniquement — ne JAMAIS préfixer par NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# ---------- Site ----------
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="CCJP Podor"

# ---------- Revalidation ----------
# Secret partagé avec Supabase (webhook) pour invalider le cache Vercel
REVALIDATE_SECRET="un-secret-long-et-aleatoire"
```

### 13.2 `package.json` — dépendances principales

```json
{
  "name": "ccjp-podor",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "playwright test",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > src/lib/types.ts"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.454.0",
    "zod": "^3.23.0",
    "@tiptap/react": "^2.10.0",
    "@tiptap/starter-kit": "^2.10.0",
    "@tiptap/extension-image": "^2.10.0",
    "@tiptap/extension-link": "^2.10.0",
    "date-fns": "^4.1.0",
    "slugify": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "@playwright/test": "^1.48.0"
  }
}
```

---

## 14. Déploiement et CI/CD sur Vercel

### 14.1 Étapes

1. **Connecter le dépôt GitHub** `mcbfd/CCJP` à Vercel.
2. **Configuration du projet** :
   - Framework preset : *Next.js*
   - Branche de production : `main`
   - Commande de build : `next build` (par défaut)
   - Répertoire de sortie : `.next`
3. **Variables d'environnement** : renseigner celles du §13.1 pour les trois environnements (Production, Preview, Development).
4. **Domaine** : ajouter `ccjp-podor.sn` (ou le domaine retenu), configurer les enregistrements DNS.
5. **Preview deployments** : activés pour chaque PR — sert d'environnement de recette.
6. **Webhook Supabase → Vercel** : appeler `/api/revalidate` à chaque modification de contenu pour rafraîchir le cache immédiatement.

### 14.2 Stratégie de branches

```
main                ──●──────────────●──────────▶  production
                     │              │
feature/s2-actualites ──●──●──●       │             (PR + preview)
feature/s4-dashboard ──────────●──●   │             (PR + preview)
                                   └── merge ──▶ main
```

- Interdiction de pousser directement sur `main` (protection de branche GitHub).
- Toute PR doit passer `lint`, `typecheck` et les tests Playwright.

### 14.3 Plan de secours

| Incident | Action |
|---|---|
| Build cassé sur `main` | Rollback immédiat vers le déploiement précédent depuis l'interface Vercel |
| Supabase injoignable | Pages d'erreur explicites ; ISR continue de servir le cache CDN |
| Suppression accidentelle de contenu | Restauration depuis la sauvegarde quotidienne Supabase |
| Compromission d'un compte admin | Désactivation immédiate du compte, révocation des sessions, régénération des clés |

---

## 15. Recette, mise en production et reprise des contenus

### 15.1 Grille de recette (extrait)

| # | Vérification | Attendu |
|---|---|---|
| 1 | Un brouillon est-il invisible publiquement ? | Oui (URL directe = 404) |
| 2 | Un `responsable_commission` peut-il modifier une autre commission ? | Non |
| 3 | Un visiteur anonyme peut-il insérer une actualité ? | Non |
| 4 | Un visiteur anonyme peut-il lire les messages ? | Non |
| 5 | Le formulaire de contact enregistre-t-il bien ? | Oui, visible en back-office |
| 6 | Une image de 5 Mo est-elle refusée ? | Oui, message en français |
| 7 | Le site est-il utilisable au clavier seul ? | Oui |
| 8 | Le site est-il lisible sur 360 px de large ? | Oui |
| 9 | Le sitemap est-il valide ? | Oui |
| 10 | Les contenus réels remplacent-ils les contenus de démo ? | Oui |

### 15.2 Reprise des contenus

1. **Inventaire** : lister tous les contenus existants (textes, photos, PV, rapports).
2. **Numérisation** : scanner les documents papier en PDF, compressés.
3. **Saisie** : par lot — d'abord les 5 actualités les plus importantes, puis les activités des 3 derniers mois, puis l'historique.
4. **Validation** : relecture par le Secrétaire exécutif avant publication.
5. **Objectif de lancement** : au moins **10 actualités**, **15 activités**, **5 documents** et **20 photos** en ligne le jour J.

### 15.3 Formation

| Public | Durée | Contenu |
|---|---|---|
| Administrateurs | 2 × 2 h | Publier une actualité, créer une activité, déposer un document, répondre à un message |
| Responsables de commission | 1 × 2 h | Publier une activité de leur commission uniquement |
| Bureau | 1 h | Lecture du tableau de bord |

Un **guide d'utilisation en français** (PDF, 10–15 pages avec captures d'écran) sera remis.

---

## 16. Maintenance et exploitation

| Périodicité | Action |
|---|---|
| Quotidienne | Consultation des messages, modération |
| Hebdomadaire | Mise à jour des dépendances (`npm audit`), export des données |
| Mensuelle | Vérification des sauvegardes Supabase, revue des statistiques |
| Trimestrielle | Revue du plan d'action des commissions, purge des archives |
| Annuelle | Renouvellement du mandat (mise à jour des membres), audit de sécurité |

**Coûts estimés** :

| Poste | Coût |
|---|---|
| Supabase (offre Pro) | ≈ 25 $/mois |
| Vercel (offre Pro, ou Hobby pour démarrer) | 0 à 20 $/mois |
| Domaine `.sn` | ≈ 15 000 – 25 000 FCFA/an |
| **Total** | **≈ 20 000 – 30 000 FCFA/mois** |

---

## 17. Annexes

### 17.1 Glossaire

| Terme | Définition |
|---|---|
| **CCJP** | Conseil Consultatif de la Jeunesse de Podor |
| **CCJS** | Conseil Consultatif des Jeunes du Sénégal (instance nationale, décret n° 2025-1962 du 5 décembre 2025) |
| **RLS** | *Row Level Security* — sécurité au niveau des lignes dans PostgreSQL |
| **ISR** | *Incremental Static Regeneration* — régénération statique incrémentale de Next.js |
| **RSC** | *React Server Components* — composants rendus côté serveur |
| **Bucket** | Espace de stockage de fichiers dans Supabase Storage |
| **Séance plénière** | Réunion de l'ensemble des conseillers |
| **Pénc / Penc** | Lieu traditionnel de concertation, référence culturelle de la délibération au Sénégal |

### 17.2 Liste des routes

**Publiques**
```
/                              Accueil
/actualites                    Liste des actualités
/actualites/[slug]             Fiche actualité
/ccjp                          Présentation, missions, organisation
/ccjp/fonctionnement           Mandat, séances plénières, devenir conseiller
/ccjp/bureau                   Bureau exécutif
/ccjp/conseillers              Annuaire des conseillers
/ccjp/commissions              Grille des commissions
/ccjp/commissions/[slug]       Fiche commission
/activites                     Activités (filtrables)
/activites/[slug]              Fiche activité
/agenda                        Agenda / calendrier
/ressources                    Documents téléchargeables
/galerie                       Galerie photo
/contact                       Contact
/proposer                      Proposer une idée
/recherche                     Recherche
/mentions-legales              Mentions légales
/confidentialite               Politique de confidentialité
/sitemap.xml                   Plan du site
/robots.txt                    Directives robots
```

**Administration**
```
/admin                         Tableau de bord
/admin/connexion               Connexion
/admin/actualites              Gestion des actualités
/admin/activites               Gestion des activités
/admin/agenda                  Gestion de l'agenda
/admin/commissions             Gestion des commissions
/admin/membres                 Gestion des membres
/admin/documents               Gestion des documents
/admin/galerie                 Gestion de la galerie
/admin/messages                Modération
/admin/parametres              Paramètres du site
/admin/parametres/utilisateurs Gestion des comptes
```

### 17.3 Checklist de lancement

- [ ] Migrations appliquées sur le projet Supabase de production
- [ ] Buckets Storage créés et politiques en place
- [ ] Compte `admin` créé, 2FA activé
- [ ] Toutes les variables d'environnement renseignées sur Vercel
- [ ] Domaine configuré, HTTPS actif
- [ ] Aucun secret dans le dépôt Git
- [ ] Contenus réels saisis et validés
- [ ] Mentions légales et politique de confidentialité publiées
- [ ] Sitemap et robots valides
- [ ] Audit Lighthouse ≥ 90 sur mobile
- [ ] Tests Playwright passent
- [ ] Administrateurs formés, guide remis
- [ ] Sauvegarde initiale effectuée
- [ ] PV de recette signé par le Bureau

### 17.4 Questions ouvertes pour le Bureau du CCJP

1. Quelle est la **liste définitive des commissions** ? (7 proposées par défaut)
2. Combien de **conseillers** et quelle est la **durée du mandat** ?
3. Le CCJP dispose-t-il déjà d'un **logo** et d'une **charte graphique** ?
4. Quel **nom de domaine** sera retenu ? (`ccjp-podor.sn` ?)
5. Quels **réseaux sociaux** doivent être reliés ?
6. Souhaite-vous une **version en pulaar et/ou en wolof** dès la V1 ou en V2 ?
7. Les **documents officiels** (PV, statuts) sont-ils tous publics ou certains réservés ?
8. Qui seront les **administrateurs** de la plateforme, et avec quel rôle ?

---

## 18. Prochaines étapes immédiates

| Étape | Responsable | Échéance |
|---|---|---|
| 1. Valider ce plan (périmètre, commissions, calendrier) | Bureau du CCJP | Semaine 1 |
| 2. Fournir les documents de cadrage (statuts, liste des commissions, membres, logo) | Secrétariat | Semaine 1 |
| 3. Créer les comptes Supabase et Vercel | Administrateur | Semaine 1 |
| 4. Lancer le Sprint 0 sur Antigravity | Équipe technique | Semaine 1 |
| 5. Première recette (Sprint 3) | Bureau | Semaine 6 |
| 6. Mise en production | Équipe technique | Semaine 9 |

---

*Document préparé pour le Conseil Consultatif de la Jeunesse de Podor. À compléter avec les documents officiels de l'organisation (voir §2.4).*
*
l'organisation (voir §2.4).*
