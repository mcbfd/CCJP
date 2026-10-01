import * as React from "react";
import { cn } from "@/lib/utils";
import { formatNombreFr } from "@/lib/utils";

/**
 * StatCard — bloc « chiffre clé » (valeur + libellé)
 * (PLAN_IMPLEMENTATION.md §4.4 et §9.1)
 *
 * Utilisé par la section « Le CCJP en chiffres » de la page d'accueil.
 * La valeur est formatée à la française (espaces insécables comme
 * séparateurs de milliers).
 */

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Libellé affiché sous le chiffre — ex. « Jeunes accompagnés » */
  libelle: string;
  /**
   * Valeur affichée. Un nombre est formaté à la française ;
   * une chaîne est affichée telle quelle (ex. « 1 000+ », « 3 ans »).
   */
  valeur: number | string;
  /** Unité optionnelle affichée après la valeur */
  unite?: string;
  /** Nom d'icône lucide ou emoji, affiché au-dessus du chiffre */
  icone?: React.ReactNode;
  /** Teinte d'accent du bloc */
  ton?: "vert" | "or" | "marine";
}

const FILETS: Record<NonNullable<StatCardProps["ton"]>, string> = {
  vert: "border-l-ccjp-vert",
  or: "border-l-ccjp-or",
  marine: "border-l-ccjp-marine",
};

export function StatCard({
  libelle,
  valeur,
  unite,
  icone,
  ton = "vert",
  className,
  ...props
}: StatCardProps) {
  const affichage = typeof valeur === "number" ? formatNombreFr(valeur) : valeur;

  return (
    <div
      className={cn(
        "rounded-card border border-ccjp-marine/10 border-l-4 bg-white p-5 text-center shadow-card",
        FILETS[ton],
        className,
      )}
      {...props}
    >
      {icone && (
        <div aria-hidden="true" className="mb-2 text-3xl leading-none">
          {icone}
        </div>
      )}

      <div className="font-display text-3xl font-extrabold leading-none text-ccjp-marine sm:text-4xl">
        {affichage}
        {unite && (
          <span className="ml-1 text-lg font-bold text-ccjp-vert">{unite}</span>
        )}
      </div>

      <div className="mt-2 text-sm font-semibold leading-snug text-ccjp-marine/70">
        {libelle}
      </div>
    </div>
  );
}
