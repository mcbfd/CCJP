# Cahier des Charges — Plateforme Numérique CCJP

> **Source :** document original `cahier-des-charges-ccjp.html` fourni par le CCJP
> (version 1.0, 2025). Ce fichier en est la transcription Markdown fidèle, destinée
> à être lue par les développeurs et les agents de développement.
>
> **Autorité :** en cas de divergence, le document HTML original prévaut.

| | |
|---|---|
| **Organisation** | Conseil Consultatif des Jeunes de Podor (CCJP) |
| **Projet** | Plateforme Web Officielle — ccjp-podor.sn |
| **Stack** | Next.js 14 · Supabase · Tailwind CSS · Vercel |
| **Mandat** | Programme Triennal 2026–2029 |
| **Commissions** | 14 commissions techniques |
| **Territoire** | Commune de Podor, région de Saint-Louis, Sénégal |
| **Devise** | Écoute · Participation · Impact |
| **Version** | 1.0 — Document Initial |

---

## 1. Présentation du projet et contexte

### 1.1 À propos du CCJP

Le CCJP est un cadre institutionnel de concertation, de proposition et d'action au
service de la jeunesse de la **commune de Podor**, région de Saint-Louis, au Sénégal.
Structuré autour de **14 commissions techniques** et d'un **Bureau Exécutif élu**, il
opère sur un mandat triennal **2026–2029** articulé en trois phases :

| Année | Phase | Contenu |
|---|---|---|
| **2026-2027** | Structuration & renforcement des capacités | Diagnostics, mise en place des cadres, formation des jeunes, lancement des programmes fondateurs |
| **2028** | Consolidation & développement | Déploiement des réseaux, forums et campagnes, montée en puissance des actions communautaires |
| **2029** | Pérennisation, plaidoyer & héritage | Assises, livres blancs, prix et rapports pour ancrer durablement les acquis du mandat |

### 1.2 Objectifs de la plateforme numérique

La **Commission 02 — Communication & Relations Publiques**, dans son axe
*« Plateformes numériques officielles »*, mandate le développement d'une plateforme
web officielle permettant de :

| # | Objectif | Description |
|---|---|---|
| **1** | **Informer** | Diffuser les actualités du CCJP, les comptes rendus des commissions, les décisions du Bureau Exécutif et le programme triennal à toute la jeunesse podoroise et à la diaspora |
| **2** | **Rassembler** | Créer un point de ralliement numérique pour la jeunesse de Podor, faciliter les adhésions et renforcer le sentiment d'appartenance à la communauté CCJP |
| **3** | **Vulgariser** | Rendre accessibles et compréhensibles les activités de chacune des 14 commissions, leurs projets phares, leurs axes stratégiques et leurs résultats concrets |
| **4** | **Administrer** | Offrir un espace sécurisé aux administrateurs pour publier du contenu, gérer les adhésions, les événements et les informations institutionnelles |

### 1.3 Utilisateurs cibles

| Profil | Description | Accès | Besoins principaux |
|---|---|---|---|
| **Jeunes de Podor** | 15–35 ans, résidents de la commune | Public | S'informer, rejoindre le CCJP, suivre les événements |
| **Diaspora podoroise** | Communauté à l'international | Public | Rester connecté, soutenir les initiatives |
| **Partenaires & institutionnels** | Mairie, ONG, entreprises | Public | Découvrir le programme, établir des partenariats |
| **Administrateurs CCJP** | Bureau Exécutif, responsables de commissions | Admin sécurisé | Publier du contenu, gérer les adhésions et messages |

---

## 2. Architecture technique

### 2.1 Stack technologique

| Technologie | Rôle | Points clés |
|---|---|---|
| **Next.js 14** | Frontend & Backend | App Router, rendu hybride (SSR / ISR / SSG), routes API intégrées |
| **Supabase** | Backend as a Service | PostgreSQL, authentification intégrée, Storage, Row Level Security |
| **Tailwind CSS** | Design System | CSS utilitaire, mobile first, thème personnalisé aux couleurs CCJP |
| **Vercel** | Déploiement & Hosting | CI/CD automatique depuis GitHub, CDN mondial, HTTPS, domaine personnalisé |

Langage : **TypeScript**.

### 2.2 Charte graphique

| Nom | Hex | Usage |
|---|---|---|
| **Vert Foncé** | `#1B5E20` | Couleur principale |
| **Or / Jaune** | `#F9A825` | Accent principal |
| **Rouge** | `#C62828` | Accent secondaire |
| **Bleu Marine** | `#1A3A5C` | Textes et fonds |
| **Crème** | `#F5F0E8` | Fonds de sections |
| **Beige** | `#FAF7F2` | Fonds alternés |

### 2.3 Arborescence du projet

```
ccjp-podor/
├── app/
│   ├── (public)/                          # Routes publiques (visiteurs)
│   │   ├── page.tsx                       # Page d'accueil
│   │   ├── a-propos/page.tsx              # À propos du CCJP
│   │   ├── commissions/
│   │   │   ├── page.tsx                   # Liste des 14 commissions
│   │   │   └── [slug]/page.tsx            # Détail d'une commission
│   │   ├── actualites/
│   │   │   ├── page.tsx                   # Liste des actualités
│   │   │   └── [slug]/page.tsx            # Article complet
│   │   ├── evenements/
│   │   │   ├── page.tsx                   # Calendrier événements
│   │   │   └── [id]/page.tsx              # Détail événement
│   │   ├── programme/page.tsx             # Programme Triennal 2026-2029
│   │   ├── bureau-executif/page.tsx       # Membres du Bureau
│   │   ├── contact/page.tsx               # Formulaire de contact
│   │   └── rejoindre/page.tsx             # Formulaire d'adhésion
│   │
│   ├── (admin)/admin/                     # Routes protégées
│   │   ├── layout.tsx                     # Layout admin avec sidebar
│   │   ├── page.tsx                       # Dashboard principal
│   │   ├── actualites/                    # CRUD actualités
│   │   ├── evenements/                    # CRUD événements
│   │   ├── commissions/                   # Gestion commissions
│   │   ├── membres/                       # Bureau Exécutif
│   │   ├── adhesions/                     # Demandes d'adhésion
│   │   ├── messages/                      # Messages de contact
│   │   ├── media/                         # Médiathèque
│   │   └── parametres/                    # Configuration site
│   │
│   ├── auth/login/                        # Page de connexion admin
│   └── api/                               # Routes API serveur
│
├── components/
│   ├── layout/                            # Navbar, Footer, Sidebar
│   ├── sections/                          # Sections de la homepage
│   ├── ui/                                # Composants réutilisables
│   └── admin/                             # Composants admin
│
├── lib/
│   ├── supabase/client.ts                 # Client Supabase navigateur
│   ├── supabase/server.ts                 # Client Supabase serveur
│   └── constants.ts                       # Données des 14 commissions
│
├── types/index.ts                         # Types TypeScript
├── middleware.ts                          # Protection routes admin
└── .env.local                             # Variables d'environnement
```

---

## 3. Les 14 commissions du CCJP

Chaque commission dispose d'une page dédiée sur la plateforme, avec sa vision,
ses axes stratégiques et ses projets phares.

| N° | Commission | Icône | Couleur |
|---|---|---|---|
| **01** | Gouvernance, Paix & Sécurité | ⚖️ | `#1A3A5C` |
| **02** | Communication & Relations Publiques | 📢 | `#1B5E20` |
| **03** | Emploi & Entrepreneuriat | 💼 | `#1A3A5C` |
| **04** | Éducation & Formation | 📚 | `#7B3F00` |
| **05** | Numérique & Innovation | 💻 | `#1A3A5C` |
| **06** | Santé & Bien-être | 🏥 | `#7B3F00` |
| **07** | Genre, Inclusion & Équité | 🤝 | `#7B3F00` |
| **08** | Environnement & Développement Durable | 🌿 | `#1B5E20` |
| **09** | Diaspora & Coopération | 🌍 | `#1B5E20` |
| **10** | Citoyenneté & Vie Associative | 🏛️ | `#1A3A5C` |
| **11** | Sports | ⚽ | `#1B5E20` |
| **12** | Culture | 🎭 | `#1B5E20` |
| **13** | Diagnostic, Suivi & Évaluation | 📊 | `#1A3A5C` |
| **14** | Tourisme & Patrimoine | 🏰 | `#1A3A5C` |

### 3.2 Axes thématiques

| Axe thématique | Commissions | Focus |
|---|---|---|
| **Gouvernance & Engagement Citoyen** | 01, 02, 10 | Gouvernance locale, communication institutionnelle, vie associative |
| **Éducation, Santé & Inclusion** | 04, 06, 07 | Réussite scolaire, bien-être, équité de genre |
| **Emploi, Entrepreneuriat & Numérique** | 03, 05 | Employabilité, innovation, transformation digitale |
| **Environnement, Culture, Sport & Ouverture** | 08, 09, 11, 12 | Développement durable, diaspora, sports, culture |
| **Pilotage, Patrimoine & Développement Territorial** | 13, 14 | Suivi-évaluation, tourisme, promotion de Podor |

### 3.3 Objectifs d'impact à horizon 2029

| Indicateur | Valeur |
|---|---|
| Élèves bénéficiaires des actions éducatives | **2 000+** |
| Jeunes formés aux compétences numériques | **1 000+** |
| Arbres plantés pour un Podor plus vert | **5 000+** |
| Participants aux compétitions sportives | **6 000+** |
| Projets entrepreneurs accompagnés | **100+** |
| Associations recensées | **300+** |
| Partenariats nationaux et internationaux | **20+** |
| Commissions suivies et évaluées chaque année | **14** |

---

## 4. Base de données Supabase

### 4.1 Schéma des tables (10 tables)

| Table | Description | Colonnes clés | Accès |
|---|---|---|---|
| **commissions** | Les 14 commissions techniques | `numero`, `slug`, `nom`, `description`, `vision`, `axes_strategiques[]`, `couleur`, `icone` | Lecture publique / Admin complet |
| **membres_bureau** | Membres du Bureau Exécutif | `prenom`, `nom`, `poste`, `commission_id`, `biographie`, `photo_url`, `ordre` | Lecture publique / Admin complet |
| **actualites** | Articles et actualités du CCJP | `titre`, `slug`, `extrait`, `contenu`, `image_url`, `commission_id`, `statut`, `epingle`, `tags[]` | Lecture publique (publiées) / Admin complet |
| **evenements** | Événements et activités | `titre`, `slug`, `description`, `lieu`, `date_debut`, `date_fin`, `type_evenement`, `statut` | Lecture publique / Admin complet |
| **projets_phares** | Projets des commissions | `commission_id`, `titre`, `description`, `annee`, `statut`, `ordre` | Lecture publique / Admin complet |
| **adhesions** | Demandes d'adhésion des jeunes | `prenom`, `nom`, `email`, `telephone`, `quartier`, `commission_id`, `motivation`, `statut` | Insert public / Lecture Admin |
| **contacts** | Messages de contact | `nom`, `email`, `sujet`, `message`, `lu` | Insert public / Lecture Admin |
| **medias** | Photothèque et vidéothèque | `nom`, `url`, `type`, `taille`, `commission_id`, `evenement_id` | Lecture publique / Admin complet |
| **statistiques_indicateurs** | Indicateurs d'impact affichés sur le site | `libelle`, `valeur`, `unite`, `icone`, `ordre`, `actif` | Lecture publique / Admin complet |
| **parametres** | Configuration du site | `cle` (PRIMARY KEY), `valeur`, `description` | Admin complet |

### 4.2 Row Level Security

```sql
-- Activation RLS sur toutes les tables
ALTER TABLE actualites ENABLE ROW LEVEL SECURITY;
ALTER TABLE evenements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE adhesions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts    ENABLE ROW LEVEL SECURITY;

-- Lecture publique des actualités publiées
CREATE POLICY "Lecture publique actualités" ON actualites
  FOR SELECT USING (statut = 'publie');

-- Accès complet pour les admins authentifiés
CREATE POLICY "Admin full access" ON actualites
  FOR ALL USING (auth.role() = 'authenticated');

-- Les visiteurs peuvent soumettre des adhésions
CREATE POLICY "Insert public adhésions" ON adhesions
  FOR INSERT WITH CHECK (TRUE);
```

### 4.3 Storage Supabase

**Buckets :**

| Bucket | Contenu |
|---|---|
| `actualites-images` | Images des articles |
| `membres-photos` | Photos du Bureau Exécutif |
| `evenements-images` | Images des événements |
| `documents` | Rapports, PDF, documents officiels |

**Politiques Storage :**
- Lecture publique sur tous les buckets
- Upload limité aux administrateurs authentifiés
- Suppression réservée aux admins
- Taille maximale par fichier : 50 MB

---

## 5. Pages publiques (12 pages)

### 5.1 Page d'accueil — structure des sections

| # | Section | Contenu |
|---|---|---|
| 1 | **Navbar** | Logo CCJP · Menu de navigation · Bouton « Rejoindre le CCJP » |
| 2 | **Hero Section** | Photo de Podor (fleuve Sénégal) · Titre · Devise · Boutons CTA |
| 3 | **Bande statistiques** | 2 000+ élèves · 1 000+ formés · 5 000+ arbres · 6 000+ sportifs · … |
| 4 | **À propos du CCJP** | Mission · Vision · Valeurs (Écoute, Participation, Impact) · Photo jeunesse Podor |
| 5 | **Programme Triennal 2026–2029** | 3 cartes : Année 1 (Structuration) · Année 2 (Consolidation) · Année 3 (Héritage) |
| 6 | **Nos 14 Commissions** | Grille de 14 cartes colorées cliquables avec icône, numéro et nom |
| 7 | **Actualités récentes** | 3 dernières actualités publiées · Bouton « Voir toutes les actualités » |
| 8 | **Prochains événements** | 3 prochains événements · Date · Lieu · Commission · Lien d'inscription |
| 9 | **CTA — Rejoindre le CCJP** | « Fais entendre ta voix pour Podor » · Bouton formulaire d'adhésion |
| 10 | **Footer** | Logo · Navigation · Commissions · Contact · Réseaux sociaux · © CCJP |

### 5.2 Tableau récapitulatif des pages publiques

| Page | URL | Données Supabase | Rendu |
|---|---|---|---|
| Accueil | `/` | `actualites` (3), `evenements` (3) | ISR 60s |
| À Propos | `/a-propos` | Statique + `parametres` | SSG |
| Commissions (liste) | `/commissions` | `commissions` (14) | ISR 3600s |
| Commission (détail) | `/commissions/[slug]` | `commissions`, `projets_phares`, `actualites` | ISR 1800s |
| Actualités (liste) | `/actualites` | `actualites` (paginé, `statut='publie'`) | ISR 120s |
| Actualité (détail) | `/actualites/[slug]` | `actualites` (une), vues++ | ISR 300s |
| Événements (liste) | `/evenements` | `evenements` (filtré par date) | ISR 300s |
| Événement (détail) | `/evenements/[id]` | `evenements` (un) | ISR 600s |
| Programme Triennal | `/programme` | `projets_phares` (par commission) | SSG |
| Bureau Exécutif | `/bureau-executif` | `membres_bureau` (trié par `ordre`) | ISR 3600s |
| Contact | `/contact` | `INSERT contacts` | Client |
| Rejoindre le CCJP | `/rejoindre` | `INSERT adhesions` | Client |

---

## 6. Espace administration (9 modules)

### 6.1 Authentification et sécurité

- **Supabase Auth** avec email / mot de passe.
- Sessions gérées via cookies sécurisés (`httpOnly`).
- Le **middleware Next.js** intercepte toutes les requêtes vers `/admin/*` et
  redirige vers la page de connexion si aucune session valide n'est détectée.
- Les routes API sensibles utilisent le client serveur Supabase avec la
  **Service Role Key**, jamais exposée côté client.

### 6.2 Dashboard administrateur (`/admin`)

Quatre compteurs : actualités publiées · événements à venir · adhésions en
attente · messages non lus. Plus les actions rapides (+ Nouvelle actualité,
+ Nouvel événement, Gérer les adhésions), les 5 dernières actualités avec leur
statut, et les 5 derniers messages de contact.

### 6.3 Modules de gestion du contenu

| Module | URL | Fonctionnalités |
|---|---|---|
| **📰 Actualités** | `/admin/actualites` | Liste paginée · Créer · Modifier · Supprimer · Changer le statut (brouillon / publié) · Épingler · Upload image · Tags · Lier à une commission |
| **📆 Événements** | `/admin/evenements` | Liste · Créer · Modifier · Supprimer · Définir date / lieu / type · Lien d'inscription · Statut (à venir / terminé / annulé) |
| **🏛️ Commissions** | `/admin/commissions` | Modifier description / vision / axes · Gérer les projets phares · Statut des projets (planifié / en cours / réalisé) |
| **👥 Bureau Exécutif** | `/admin/membres` | Ajouter / modifier / supprimer des membres · Upload photo · Poste · Commission · Biographie · Ordre d'affichage |
| **🖼️ Médiathèque** | `/admin/media` | Upload images / vidéos / documents · Organisation par commission · Galerie photo · Copier l'URL |
| **📋 Adhésions** | `/admin/adhesions` | Liste des demandes · Filtrer par statut · Accepter / Refuser · Voir les détails complets · Export CSV |
| **✉️ Messages** | `/admin/messages` | Liste des messages · Marquer comme lu · Filtrer · Répondre (mailto) · Supprimer |
| **⚙️ Paramètres** | `/admin/parametres` | Nom du site · Description · Email de contact · URLs des réseaux sociaux · Indicateurs d'impact |

> **Note du cahier des charges :** l'accès à l'espace d'administration est
> strictement réservé aux membres autorisés du Bureau Exécutif. Les identifiants
> sont créés directement dans le tableau de bord Supabase (Authentication →
> Users). Il est recommandé de créer un compte admin par responsable de commission.

---

## 7. Plan d'implémentation par phases (5 phases)

### Phase 0 — Préparation & Configuration · 2 jours

Projet Next.js initialisé · Supabase configuré · Tailwind avec thème CCJP ·
Variables d'environnement.

```bash
npx create-next-app@latest ccjp-podor --typescript --tailwind --eslint --app
npm install @supabase/supabase-js @supabase/ssr lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install date-fns slugify sonner recharts
```

### Phase 1 — Base de données & Seed CCJP · 2 jours

10 tables créées avec RLS · 4 buckets Storage · Seeding des 14 commissions et
projets phares · Script `seed.ts`.

- Créer les tables dans Supabase (SQL Editor)
- Activer Row Level Security sur chaque table
- Créer les buckets de stockage
- Exécuter le script de seed pour les commissions CCJP
- Créer le premier compte administrateur dans Supabase Auth

### Phase 2 — Composants UI & Layout · 3 jours

Navbar responsive · Footer complet · Composants Card / Button / Badge ·
Layout public et admin.

- Navbar avec logo CCJP, navigation et menu burger mobile
- Footer avec liens, réseaux sociaux, devise CCJP
- Composants réutilisables : Button, Card, Badge, Modal, Toast
- Sidebar admin avec liens de navigation
- Configuration des polices (Inter + Playfair Display)

### Phase 3 — Pages publiques · 5 jours

12 pages publiques complètes · Formulaires adhésion et contact · SEO et metadata.

- Page d'accueil avec toutes ses sections
- Pages commissions : liste et détail avec projets phares
- Pages actualités : liste paginée et article complet
- Pages événements : calendrier et détail
- Page programme triennal 2026-2029
- Page bureau exécutif avec photos et postes
- Formulaire de contact (validation + insertion Supabase)
- Formulaire d'adhésion (validation Zod + insertion + email de confirmation)

### Phase 4 — Espace Administration · 5 jours

Page de login · Dashboard · CRUD complet pour tous les modules · Médiathèque.

- Page de connexion avec authentification Supabase
- Middleware de protection des routes admin
- Dashboard avec statistiques et actions rapides
- CRUD actualités avec éditeur, upload image, tags, statut
- CRUD événements avec dates, lieu, lien d'inscription
- Gestion des membres du Bureau Exécutif
- Traitement des demandes d'adhésion (accepter / refuser)
- Interface de lecture des messages de contact
- Médiathèque pour upload et gestion des fichiers
- Page paramètres pour la configuration générale du site

### Phase 5 — Déploiement Vercel & Tests · 2 jours

Site en ligne · Domaine configuré · Tests complets · Formation des administrateurs.

- Push du code sur GitHub (dépôt privé)
- Connexion Vercel → GitHub avec déploiement automatique
- Configuration des variables d'environnement sur Vercel
- Configuration du domaine personnalisé (ccjp-podor.sn)
- Tests de toutes les pages et formulaires
- Tests de sécurité (RLS, routes protégées)
- Formation des membres du Bureau Exécutif à l'admin
- Seeding des premières données réelles (membres, commissions)

---

## 8. Planning de développement (5 semaines)

| Semaine | Jours | Thème | Tâches |
|---|---|---|---|
| **1** | 1–7 | Setup, base de données & UI de base | J1-2 : init Next.js, Tailwind CCJP, variables env · J3-4 : tables Supabase, RLS, Storage, seed · J5-6 : Navbar, Footer, Card, Button, Badge · J7 : layout public, layout admin, types TypeScript |
| **2** | 8–14 | Sections page d'accueil & pages statiques | J8-9 : HeroSection, StatsSection, AboutSection · J10-11 : CommissionsSection, ProgrammeSection · J12-13 : ActualitesSection, EvenementsSection, CTASection · J14 : pages À Propos, Programme, Bureau Exécutif |
| **3** | 15–21 | Pages commissions, actualités, événements & formulaires | J15-16 : liste + détail commissions · J17-18 : liste + article actualités · J19-20 : événements + formulaire contact + formulaire adhésion · J21 : tests pages publiques, corrections, SEO |
| **4** | 22–28 | Espace administration complet | J22-23 : login, middleware auth, layout admin, sidebar · J24-25 : dashboard + CRUD actualités · J26-27 : CRUD événements + adhésions + messages · J28 : membres Bureau + médiathèque + paramètres |
| **5** | 29–35 | Déploiement, tests & formation | J29-30 : déploiement Vercel, domaine, variables prod · J31-32 : tests end-to-end · J33-34 : seeding données réelles, corrections · J35 : formation administrateurs, documentation |

> **Mise en ligne partielle possible dès la fin de la semaine 2 :** une version
> minimale du site (homepage + pages commissions) peut être déployée sur Vercel
> pendant que le développement se poursuit.

---

## 9. Sécurité et performance

### 9.1 Mesures de sécurité

- **Row Level Security (RLS)** activé sur toutes les tables Supabase
- **Authentification Supabase** avec email / mot de passe, cookies `httpOnly`
- **Middleware Next.js** : interception des requêtes vers `/admin/*`
- **Validation des formulaires** côté client (Zod + React Hook Form) **et** côté
  base de données (contraintes SQL)
- **Variables d'environnement** : la Service Role Key n'est jamais exposée côté client
- **Upload sécurisé** : seuls les admins authentifiés peuvent uploader dans Storage
- **HTTPS forcé** via Vercel sur toutes les URLs
- **Rate limiting** sur les formulaires publics via les policies Supabase

### 9.2 Stratégies de performance

- **Rendu hybride** : SSG (pages statiques), ISR (pages semi-dynamiques,
  revalidation 60–3600 s), SSR (admin), Client (formulaires)
- **Optimisation des images** : `next/image`, lazy loading, WebP automatique,
  dimensions par breakpoint, CDN Vercel
- **SEO** : metadata dynamique par page, OpenGraph, sitemap.xml, robots.txt
- **Accessibilité** : attributs `aria`, contrastes, navigation clavier
- **Design responsive** : mobile first, navbar hamburger, grilles adaptatives
  (1 → 2 → 3 → 4 → 5 colonnes), testé sur iOS Safari et Android Chrome

---

## 10. Déploiement et variables d'environnement

### 10.1 Variables d'environnement

```bash
# ============ .env.local — JAMAIS committer sur GitHub ============

# Supabase — Obtenir depuis le dashboard Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
NEXT_PUBLIC_SITE_URL=https://ccjp-podor.vercel.app
NEXT_PUBLIC_SITE_NAME=CCJP - Conseil Consultatif des Jeunes de Podor

# Email transactionnel (optionnel — Resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=contact@ccjp-podor.sn
```

### 10.2 Étapes de déploiement Vercel

1. **GitHub** — `git init`, `git add .`, `git commit`, `git remote add origin`, `git push -u origin main`
2. **Vercel Dashboard** — « Add New Project », sélectionner le repo, Framework
   Preset : Next.js (auto-détecté), ajouter les variables d'environnement,
   « Deploy »
3. **Domaine personnalisé** — Settings → Domains, ajouter `ccjp-podor.sn`,
   ajouter le CNAME `@ → cname.vercel-dns.com` chez le registraire DNS, Vercel
   génère le certificat HTTPS automatiquement
4. **CI/CD automatique** — chaque push sur `main` déclenche un déploiement, les
   branches de développement créent des Preview URLs, rollback en un clic,
   logs en temps réel

### 10.3 Coûts d'infrastructure

| Service | Plan | Coût mensuel | Limites |
|---|---|---|---|
| Vercel | Hobby (gratuit) | 0 € | 100 GB bandwidth · déploiements illimités |
| Supabase | Free (gratuit) | 0 € | 500 MB DB · 1 GB Storage · 50 000 req/mois |
| Domaine `.sn` | Enregistrement | ~5 000 FCFA/an | Renouvellement annuel |
| **Total Phase 1** | — | **~0 €/mois** | Suffisant pour le lancement CCJP |

> Si le trafic dépasse 50 000 visiteurs/mois, passage au plan Supabase Pro
> (~25 $/mois) et Vercel Pro (~20 $/mois). Le code est 100 % compatible sans
> modification.

---

## 11. Évolutions futures — Phase 2

| Fonctionnalité | Description | Technologies |
|---|---|---|
| **Tableau de bord analytique** | Vercel Analytics, graphiques d'engagement par commission, rapport mensuel automatique pour le Bureau Exécutif | Vercel Analytics, Recharts |
| **Notifications & Newsletter** | Emails transactionnels (confirmation d'adhésion, nouveaux événements), newsletter trimestrielle | Resend API |
| **Notifications temps réel** | Notifier les admins dès qu'une adhésion ou un message est soumis, badge dans la sidebar | Supabase Realtime, WebSocket |
| **Multilinguisme** | Traduction en **Pulaar** (langue locale de Podor) et en anglais pour la diaspora | next-intl |
| **Application mobile (PWA)** | PWA installable, notifications push, fonctionnement hors ligne partiel | Service Worker, Push |
| **Carte interactive de Podor** | Cartographie des projets par commission, filtrage | Mapbox / Leaflet.js |
| **Génération PDF** | Rapports d'activité, bulletins d'adhésion, rapport annuel sur l'état de la jeunesse (Commission 13) | react-pdf / Puppeteer |
| **Médiathèque enrichie** | Galerie interactive, intégration YouTube, documentaire de fin de mandat | YouTube API |

---

## 12. Checklist de mise en production

### Avant le lancement

**🗄️ Base de données**
- [ ] Toutes les tables créées avec les bons types de colonnes
- [ ] Row Level Security activé sur chaque table
- [ ] Policies RLS testées (lecture publique, insert public, admin complet)
- [ ] Buckets Storage créés (`actualites-images`, `membres-photos`, `evenements-images`, `documents`)
- [ ] Script seed exécuté — 14 commissions et projets phares dans la base
- [ ] Premier compte administrateur créé dans Supabase Auth

**🌐 Pages publiques**
- [ ] Page d'accueil correcte sur mobile et desktop
- [ ] Les 14 pages de commissions accessibles avec les bonnes données
- [ ] Formulaire de contact fonctionnel (insertion en base)
- [ ] Formulaire d'adhésion fonctionnel (validation complète)
- [ ] Navigation mobile (hamburger) testée sur iOS et Android
- [ ] Logo CCJP correct dans la Navbar et le Footer
- [ ] Metadata SEO configurée pour toutes les pages

**🔐 Administration**
- [ ] Page de connexion fonctionnelle
- [ ] Routes `/admin` redirigées vers `/auth/login` si non connecté
- [ ] Création d'une actualité (image, statut, commission) fonctionnelle
- [ ] Publication d'un événement fonctionnelle
- [ ] Adhésions soumises visibles dans `/admin/adhesions`
- [ ] Messages de contact visibles dans `/admin/messages`
- [ ] Upload d'images fonctionnel (Storage Supabase)
- [ ] Déconnexion redirige vers `/auth/login`

**🚀 Déploiement Vercel**
- [ ] Build Next.js réussi sans erreurs (`npm run build`)
- [ ] Les 5 variables d'environnement configurées sur Vercel
- [ ] Déploiement Vercel vert (aucune erreur)
- [ ] Site accessible via l'URL Vercel
- [ ] HTTPS actif sur toutes les URLs
- [ ] Domaine personnalisé configuré et pointant correctement
- [ ] Vercel Analytics activé

**📋 Données et contenu initial**
- [ ] Photos de tous les membres du Bureau Exécutif uploadées
- [ ] Postes et biographies de tous les membres renseignés
- [ ] Au moins 3 actualités publiées au lancement
- [ ] Au moins 2 événements créés (à venir)
- [ ] Indicateurs d'impact configurés dans les paramètres
- [ ] Email de contact et réseaux sociaux configurés
- [ ] Logo CCJP haute résolution uploadé

---

## 13. Récapitulatif exécutif

| Élément | Détail |
|---|---|
| **Nom du projet** | Plateforme Numérique Officielle du CCJP |
| **URL cible** | ccjp-podor.sn (ou ccjp-podor.vercel.app en développement) |
| **Stack technique** | Next.js 14 (App Router) · Supabase · Tailwind CSS · Vercel |
| **Langage** | TypeScript |
| **Pages publiques** | 12 pages |
| **Pages admin** | 9 modules |
| **Tables base de données** | 10 tables avec Row Level Security |
| **Commissions documentées** | 14 commissions avec projets phares, axes stratégiques, vision |
| **Programme couvert** | Triennal 2026–2029 (3 phases) |
| **Délai de développement** | 5 semaines (35 jours ouvrables) |
| **Coût infrastructure** | 0 €/mois (Vercel Hobby + Supabase Free) + ~5 000 FCFA/an pour le domaine `.sn` |
| **Responsive** | Mobile first — iOS, Android, tablette, desktop |
| **SEO** | Metadata dynamique, OpenGraph, sitemap.xml, robots.txt |
| **Sécurité** | RLS Supabase, Auth JWT, Middleware Next.js, Validation Zod, HTTPS Vercel |
| **Évolutions Phase 2** | Analytics, Newsletter, Notifications temps réel, Pulaar, PWA, Carte interactive |

---

*Conseil Consultatif des Jeunes de Podor — Écoute · Participation · Impact*
