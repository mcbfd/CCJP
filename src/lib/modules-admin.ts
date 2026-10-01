import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Landmark,
  Users,
  Image,
  ClipboardList,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Les 9 modules du back-office (PLAN_IMPLEMENTATION.md §10.2)
 *
 * ⚠️ Ce module est volontairement SANS directive « use client » : il est
 *    importé à la fois par la sidebar (composant client) et par les pages
 *    du back-office (composants serveur). Y placer des valeurs provenant
 *    d'un module client provoquerait l'erreur de build :
 *    « Attempted to call map() from the server but map is on the client ».
 */

export interface ModuleAdmin {
  href: string;
  libelle: string;
  description: string;
  Icone: LucideIcon;
}

export const MODULES_ADMIN: ModuleAdmin[] = [
  {
    href: "/admin",
    libelle: "Tableau de bord",
    description: "Vue d'ensemble",
    Icone: LayoutDashboard,
  },
  {
    href: "/admin/actualites",
    libelle: "Actualités",
    description: "Publier et gérer les articles",
    Icone: Newspaper,
  },
  {
    href: "/admin/evenements",
    libelle: "Événements",
    description: "Calendrier et inscriptions",
    Icone: CalendarDays,
  },
  {
    href: "/admin/commissions",
    libelle: "Commissions",
    description: "Les 14 commissions et leurs projets",
    Icone: Landmark,
  },
  {
    href: "/admin/membres",
    libelle: "Membres",
    description: "Bureau exécutif",
    Icone: Users,
  },
  {
    href: "/admin/media",
    libelle: "Médiathèque",
    description: "Images et documents",
    Icone: Image,
  },
  {
    href: "/admin/adhesions",
    libelle: "Adhésions",
    description: "Demandes à traiter",
    Icone: ClipboardList,
  },
  {
    href: "/admin/messages",
    libelle: "Messages",
    description: "Messages de contact",
    Icone: Mail,
  },
  {
    href: "/admin/parametres",
    libelle: "Paramètres",
    description: "Configuration du site",
    Icone: Settings,
  },
];

/**
 * Un module est actif s'il correspond exactement, ou si la route courante
 * est une de ses sous-pages (`/admin/actualites/nouveau`).
 */
export function estActifAdmin(href: string, courant: string): boolean {
  if (href === "/admin") return courant === "/admin";
  return courant === href || courant.startsWith(`${href}/`);
}
