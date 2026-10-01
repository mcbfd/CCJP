import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — carte générique (PLAN_IMPLEMENTATION.md §4.4)
 *
 * Bordure colorée optionnelle à gauche (filet aux couleurs des 14
 * commissions), fond blanc, ombre douce de la charte.
 */

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "style"> {
  /** Couleur du filet de gauche (hex) — ex. "#1B5E20" */
  bordureCouleur?: string;
  /** Remplace la balise racine (pour les listes de cartes) */
  as?: "div" | "li" | "article";
  /** Rend la carte entièrement cliquable (effet de survol) */
  interactive?: boolean;
  /** Styles inline supplémentaires */
  style?: React.CSSProperties;
}

export function Card({
  bordureCouleur,
  as = "div",
  interactive = false,
  className,
  style,
  children,
  ...props
}: CardProps) {
  // `React.ElementType` évite le conflit de typage entre div / li / article.
  const Balise = as as React.ElementType;

  return (
    <Balise
      className={cn(
        "rounded-card border border-ccjp-marine/10 bg-white p-5 shadow-card",
        bordureCouleur && "border-l-4",
        interactive &&
          "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-hover",
        className,
      )}
      style={{
        ...(bordureCouleur ? { borderLeftColor: bordureCouleur } : null),
        ...style,
      }}
      {...props}
    >
      {children}
    </Balise>
  );
}

/** En-tête de carte : titre + contenu optionnel à droite (badge, date…) */
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-3 flex items-start justify-between gap-3", className)}
      {...props}
    />
  );
}

/** Titre de carte */
export function CardTitle({
  className,
  as: Balise = "h3",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }) {
  return (
    <Balise
      className={cn("font-display text-lg font-bold text-ccjp-marine", className)}
      {...props}
    />
  );
}

/** Corps de texte de la carte */
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-ccjp-marine/75", className)}
      {...props}
    />
  );
}

/** Pied de carte (actions, métadonnées) */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center gap-2 border-t border-ccjp-marine/10 pt-3",
        className,
      )}
      {...props}
    />
  );
}
