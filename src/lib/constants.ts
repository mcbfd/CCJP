/**
 * Constantes du CCJP — Conseil Consultatif des Jeunes de Podor
 *
 * Source : Cahier des Charges v1.0 §3 « Les 14 Commissions »
 * Ces données sont aussi insérées en base (table `commissions`) par la
 * migration 0003. Ce fichier sert de référence côté application pour
 * l'affichage statique (icônes, couleurs) avant que la base ne soit peuplée.
 */

export type CommissionCouleur = "marine" | "vert" | "brun";

export interface Commission {
  numero: number;
  slug: string;
  nom: string;
  icone: string;
  couleur: CommissionCouleur;
  couleurHex: string;
  axe: string;
}

/** Les 5 axes thématiques du CCJP (CDC §3.2) */
export const AXES_THEMATIQUES = [
  "Gouvernance & Engagement Citoyen",
  "Éducation, Santé & Inclusion",
  "Emploi, Entrepreneuriat & Numérique",
  "Environnement, Culture, Sport & Ouverture",
  "Pilotage, Patrimoine & Développement Territorial",
] as const;

export type AxeThematique = (typeof AXES_THEMATIQUES)[number];

/** Les 14 commissions officielles (CDC §3.1) */
export const COMMISSIONS: Commission[] = [
  {
    numero: 1,
    slug: "gouvernance-paix-securite",
    nom: "Gouvernance, Paix & Sécurité",
    icone: "⚖️",
    couleur: "marine",
    couleurHex: "#1A3A5C",
    axe: "Gouvernance & Engagement Citoyen",
  },
  {
    numero: 2,
    slug: "communication-relations-publiques",
    nom: "Communication & Relations Publiques",
    icone: "📢",
    couleur: "vert",
    couleurHex: "#1B5E20",
    axe: "Gouvernance & Engagement Citoyen",
  },
  {
    numero: 3,
    slug: "emploi-entrepreneuriat",
    nom: "Emploi & Entrepreneuriat",
    icone: "💼",
    couleur: "marine",
    couleurHex: "#1A3A5C",
    axe: "Emploi, Entrepreneuriat & Numérique",
  },
  {
    numero: 4,
    slug: "education-formation",
    nom: "Éducation & Formation",
    icone: "📚",
    couleur: "brun",
    couleurHex: "#7B3F00",
    axe: "Éducation, Santé & Inclusion",
  },
  {
    numero: 5,
    slug: "numerique-innovation",
    nom: "Numérique & Innovation",
    icone: "💻",
    couleur: "marine",
    couleurHex: "#1A3A5C",
    axe: "Emploi, Entrepreneuriat & Numérique",
  },
  {
    numero: 6,
    slug: "sante-bien-etre",
    nom: "Santé & Bien-être",
    icone: "🏥",
    couleur: "brun",
    couleurHex: "#7B3F00",
    axe: "Éducation, Santé & Inclusion",
  },
  {
    numero: 7,
    slug: "genre-inclusion-equite",
    nom: "Genre, Inclusion & Équité",
    icone: "🤝",
    couleur: "brun",
    couleurHex: "#7B3F00",
    axe: "Éducation, Santé & Inclusion",
  },
  {
    numero: 8,
    slug: "environnement-developpement-durable",
    nom: "Environnement & Développement Durable",
    icone: "🌿",
    couleur: "vert",
    couleurHex: "#1B5E20",
    axe: "Environnement, Culture, Sport & Ouverture",
  },
  {
    numero: 9,
    slug: "diaspora-cooperation",
    nom: "Diaspora & Coopération",
    icone: "🌍",
    couleur: "vert",
    couleurHex: "#1B5E20",
    axe: "Environnement, Culture, Sport & Ouverture",
  },
  {
    numero: 10,
    slug: "citoyennete-vie-associative",
    nom: "Citoyenneté & Vie Associative",
    icone: "🏛️",
    couleur: "marine",
    couleurHex: "#1A3A5C",
    axe: "Gouvernance & Engagement Citoyen",
  },
  {
    numero: 11,
    slug: "sports",
    nom: "Sports",
    icone: "⚽",
    couleur: "vert",
    couleurHex: "#1B5E20",
    axe: "Environnement, Culture, Sport & Ouverture",
  },
  {
    numero: 12,
    slug: "culture",
    nom: "Culture",
    icone: "🎭",
    couleur: "vert",
    couleurHex: "#1B5E20",
    axe: "Environnement, Culture, Sport & Ouverture",
  },
  {
    numero: 13,
    slug: "diagnostic-suivi-evaluation",
    nom: "Diagnostic, Suivi & Évaluation",
    icone: "📊",
    couleur: "marine",
    couleurHex: "#1A3A5C",
    axe: "Pilotage, Patrimoine & Développement Territorial",
  },
  {
    numero: 14,
    slug: "tourisme-patrimoine",
    nom: "Tourisme & Patrimoine",
    icone: "🏰",
    couleur: "marine",
    couleurHex: "#1A3A5C",
    axe: "Pilotage, Patrimoine & Développement Territorial",
  },
];

/** Les 3 phases du mandat triennal 2026–2029 (CDC §1.1) */
export const PHASES_MANDAT = [
  {
    annee: "2026-2027",
    titre: "Structuration & renforcement des capacités",
    description:
      "Diagnostics, mise en place des cadres, formation des jeunes et lancement des programmes fondateurs.",
  },
  {
    annee: "2028",
    titre: "Consolidation & développement",
    description:
      "Déploiement des réseaux, forums et campagnes, montée en puissance des actions communautaires.",
  },
  {
    annee: "2029",
    titre: "Pérennisation, plaidoyer & héritage",
    description:
      "Assises, livres blancs, prix et rapports pour ancrer durablement les acquis du mandat.",
  },
] as const;

/** Devise officielle (CDC §1) */
export const DEVISE_CCJP = "Écoute · Participation · Impact";

/** Nom officiel de l'organisation */
export const NOM_CCJP = "Conseil Consultatif des Jeunes de Podor";

/** Retrouve une commission par son slug */
export function getCommissionBySlug(slug: string): Commission | undefined {
  return COMMISSIONS.find((c) => c.slug === slug);
}
