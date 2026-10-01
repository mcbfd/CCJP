import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Badge — étiquette colorée (PLAN_IMPLEMENTATION.md §4.4)
 *
 * Sert à deux choses :
 *   1. afficher un statut (publié, brouillon, à venir…),
 *   2. afficher la couleur d'une commission.
 *
 * `ton` pilote la couleur de fond ; `couleur` permet une couleur libre
 * (hex) utilisée alors que le fond est teinté et le texte assombri.
 */

export type BadgeTon =
  | "neutre"
  | "vert"
  | "or"
  | "rouge"
  | "marine"
  | "creme";

const TONS: Record<BadgeTon, string> = {
  neutre: "bg-ccjp-marine/10 text-ccjp-marine",
  vert: "bg-ccjp-vert/12 text-ccjp-vert",
  or: "bg-ccjp-or/20 text-[#8A6100]",
  rouge: "bg-ccjp-rouge/12 text-ccjp-rouge",
  marine: "bg-ccjp-marine/12 text-ccjp-marine",
  creme: "bg-ccjp-creme text-ccjp-marine",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  ton?: BadgeTon;
  /** Couleur hexadécimale libre (prioritaire sur `ton`) */
  couleur?: string;
  taille?: "sm" | "md";
}

export function Badge({
  ton = "neutre",
  couleur,
  taille = "sm",
  className,
  style,
  children,
  ...props
}: BadgeProps) {
  const styleLibre = couleur
    ? { backgroundColor: `${couleur}1F`, color: couleur, ...style }
    : style;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold leading-none",
        taille === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        !couleur && TONS[ton],
        className,
      )}
      style={styleLibre}
      {...props}
    >
      {children}
    </span>
  );
}
