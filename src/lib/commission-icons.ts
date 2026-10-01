import {
  Scale,
  Megaphone,
  Briefcase,
  GraduationCap,
  Laptop,
  HeartPulse,
  Users,
  Leaf,
  Globe,
  Landmark,
  Trophy,
  Palette,
  BarChart3,
  Castle,
  type LucideIcon,
} from "lucide-react";

/**
 * Registre des icônes des 14 commissions.
 *
 * La table `commissions` stocke le NOM de l'icône (colonne `icone`) — voir
 * migration 0003. Ce registre fait le lien entre ce nom et le composant
 * React correspondant, afin qu'une commission créée ou modifiée depuis le
 * back-office s'affiche correctement sans toucher au code.
 *
 * ⚠️ Toute icône ajoutée en base doit être déclarée ici, sinon
 *    `getIconeCommission()` retombe sur l'icône de repli.
 */

const REGISTRE: Record<string, LucideIcon> = {
  scale: Scale,
  megaphone: Megaphone,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  laptop: Laptop,
  "heart-pulse": HeartPulse,
  users: Users,
  leaf: Leaf,
  globe: Globe,
  landmark: Landmark,
  trophy: Trophy,
  palette: Palette,
  "bar-chart-3": BarChart3,
  castle: Castle,
};

/** Icône affichée quand le nom stocké en base est inconnu. */
const REPLI: LucideIcon = Landmark;

/**
 * Retourne le composant d'icône correspondant au nom stocké en base.
 * Retombe sur une icône neutre si le nom est absent ou inconnu.
 */
export function getIconeCommission(nom: string | null | undefined): LucideIcon {
  if (!nom) return REPLI;
  return REGISTRE[nom] ?? REPLI;
}

/** Liste des noms d'icônes disponibles (utile aux sélecteurs du back-office). */
export const ICONES_DISPONIBLES = Object.keys(REGISTRE);
