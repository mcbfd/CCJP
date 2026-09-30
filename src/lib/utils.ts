import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Fusionne des classes Tailwind conditionnelles sans conflit.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date en français long.
 * Ex. « 12 mars 2026 »
 */
export function formatDateFr(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy", { locale: fr });
}

/**
 * Formate une date et une heure en français.
 * Ex. « 12 mars 2026 à 14:30 »
 */
export function formatDateTimeFr(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
}

/**
 * Formate une date courte (pour les agendas et calendriers).
 * Ex. « 12 mars 2026 »
 */
export function formatDateCourteFr(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: fr });
}

/**
 * Formate un mois et une année.
 * Ex. « mars 2026 »
 */
export function formatMoisAnneeFr(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMMM yyyy", { locale: fr });
}

/**
 * Formate un nombre à la française (espaces comme séparateurs de milliers).
 * Ex. 2000 → « 2 000 »
 */
export function formatNombreFr(valeur: number): string {
  return new Intl.NumberFormat("fr-FR").format(valeur);
}

/**
 * Formate une taille de fichier en octets vers une unité lisible.
 * Ex. 1536000 → « 1,46 Mo »
 */
export function formatTailleFichier(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(2).replace(".", ",")} Mo`;
}
