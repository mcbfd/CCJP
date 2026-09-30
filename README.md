# CCJP — Plateforme Numérique du Conseil Consultatif des Jeunes de Podor

Plateforme institutionnelle (site public + espace d'administration) du
**Conseil Consultatif des Jeunes de Podor (CCJP)** — commune de Podor,
région de Saint-Louis, Sénégal.

**Mandat :** Programme Triennal 2026–2029 · **14 commissions techniques** ·
**Devise :** Écoute · Participation · Impact

## Objectifs de la plateforme

| # | Objectif | Traduction |
|---|---|---|
| 1 | **Informer** | Actualités, comptes rendus des commissions, décisions du Bureau Exécutif |
| 2 | **Rassembler** | Point de ralliement numérique, formulaire d'adhésion |
| 3 | **Vulgariser** | Rendre accessibles les activités de chacune des 14 commissions |
| 4 | **Administrer** | Espace sécurisé de publication et de gestion |

## Stack

Next.js 14.2.35 (App Router) · Supabase (PostgreSQL + Auth + Storage) ·
Tailwind CSS 3.4 · Vercel · TypeScript

> ⚠️ Next.js est volontairement maintenu sur la ligne 14.x, conformément au
> cahier des charges. Voir **[`docs/SECURITE.md`](docs/SECURITE.md)** pour les
> avis de sécurité restants et les mitigations appliquées.

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.local.example .env.local
#    puis renseigner les clés Supabase dans .env.local

# 3. Appliquer les migrations dans Supabase (SQL Editor, dans l'ordre)
#    supabase/migrations/0001_init_schema.sql
#    supabase/migrations/0002_rls_policies.sql
#    supabase/migrations/0003_seed_data.sql
#    supabase/migrations/0004_storage_buckets.sql

# 4. Générer les types TypeScript depuis la base
npm run db:types

# 5. Lancer le serveur de développement
npm run dev            # http://localhost:3000
```

### Scripts disponibles

| Commande | Usage |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run lint` | Vérification ESLint |
| `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run format` | Formatage Prettier |
| `npm run db:types` | Génère `src/lib/types.ts` depuis le schéma Supabase |

## Documentation du dépôt

| Fichier | Rôle |
|---|---|
| [`docs/cahier-des-charges-ccjp.md`](docs/cahier-des-charges-ccjp.md) | **Spécifications officielles** — transcription du cahier des charges v1.0 |
| [`PLAN_IMPLEMENTATION.md`](PLAN_IMPLEMENTATION.md) | **Plan d'exécution** — architecture, schéma SQL, tâches par phase, méthode Antigravity |
| [`docs/SECURITE.md`](docs/SECURITE.md) | **Sécurité** — faille RLS corrigée, avis Next.js, mitigations, règles permanentes |

## Structure du projet

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── layout.tsx          # Layout racine, métadonnées SEO, polices
│   ├── page.tsx            # Accueil provisoire (Phase 0)
│   └── globals.css         # Styles de base + palette CCJP
├── lib/
│   ├── constants.ts        # Les 14 commissions, phases du mandat, devise
│   ├── utils.ts            # cn(), formatage des dates et nombres en français
│   └── supabase/
│       ├── client.ts       # Client navigateur (clé ANON)
│       ├── server.ts       # Client serveur (session, cookies)
│       └── admin.ts        # Client privilégié (service_role) — serveur only
supabase/
└── migrations/             # 0001 schéma · 0002 RLS · 0003 seed · 0004 storage
```

## Périmètre

- **Public** — 12 pages : accueil, à propos, 14 commissions, actualités,
  événements, programme triennal, bureau exécutif, contact, adhésion.
- **Administration** — 9 modules : dashboard, actualités, événements, commissions,
  membres, adhésions, messages, médiathèque, paramètres.
- **Base de données** — 10 tables (cahier des charges) + 1 table `admins`
  (sécurité), avec Row Level Security sur l'ensemble.

## Avancement

| Phase | Contenu | Statut |
|---|---|---|
| **0** | Setup, base de données, UI de base | ✅ **Terminée** |
| **1** | Base de données & seed CCJP | ⏳ Migrations écrites, à appliquer dans Supabase |
| **2** | Composants UI & layout | ⬜ À faire |
| **3** | Pages publiques (12 pages) | ⬜ À faire |
| **4** | Espace d'administration (9 modules) | ⬜ À faire |
| **5** | Déploiement Vercel & tests | ⬜ À faire |

**Délai estimé restant :** 4 à 5 semaines.

## Ce qui reste à faire par le CCJP

1. **Créer le projet Supabase** (gratuit) et récupérer l'URL et les clés API.
2. **Appliquer les 4 migrations** dans le SQL Editor Supabase.
3. **Créer le premier compte administrateur** et l'habiliter (procédure en fin de
   fichier `0002_rls_policies.sql`).
4. **Fournir les données réelles** : membres du Bureau Exécutif, projets phares
   par commission, liste des quartiers de Podor, logo.

---

*Conseil Consultatif des Jeunes de Podor — Écoute · Participation · Impact*
