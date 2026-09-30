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

Next.js 14 (App Router) · Supabase (PostgreSQL + Auth + Storage) · Tailwind CSS · Vercel
· TypeScript

## Documents du dépôt

| Fichier | Rôle |
|---|---|
| [`docs/cahier-des-charges-ccjp.md`](docs/cahier-des-charges-ccjp.md) | **Spécifications officielles** — transcription Markdown du cahier des charges v1.0 fourni par le CCJP |
| [`PLAN_IMPLEMENTATION.md`](PLAN_IMPLEMENTATION.md) | **Plan d'exécution** — architecture, schéma SQL complet, politiques RLS, tâches par phase, méthode Antigravity |

Le plan opérationnalise le cahier des charges : il apporte le SQL exécutable, les
politiques de sécurité détaillées, les critères d'acceptation de chaque tâche, et
les corrections de sécurité à appliquer (notamment sur la politique RLS
`auth.role() = 'authenticated'` — voir §18.1 du plan).

## Périmètre

- **Public** — 12 pages : accueil, à propos, 14 commissions, actualités,
  événements, programme triennal, bureau exécutif, contact, adhésion.
- **Administration** — 9 modules : dashboard, actualités, événements, commissions,
  membres, adhésions, messages, médiathèque, paramètres.
- **Base de données** — 10 tables (CDC) + 1 table `admins` (sécurité), avec
  Row Level Security sur l'ensemble.

## Statut

| | |
|---|---|
| Phase | Planification terminée, prête pour le développement |
| Délai estimé | 5 semaines (35 jours ouvrables) |
| Coût infrastructure | 0 €/mois (Vercel Hobby + Supabase Free) + ~5 000 FCFA/an pour le domaine `.sn` |
| Prochaine étape | Validation du plan par le Bureau Exécutif, puis Phase 0 |

## Développement

Le projet sera développé sur **Google Antigravity** (IDE agentique, Gemini 3).
Voir la section 17 du plan pour la configuration, les règles de prompting et
l'organisation des tâches par phase.

---

*Conseil Consultatif des Jeunes de Podor — Écoute · Participation · Impact*
