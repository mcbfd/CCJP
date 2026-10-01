import Link from "next/link";
import { cn } from "@/lib/utils";
import { getIconeCommission } from "@/lib/commission-icons";

/**
 * CommissionCard — carte d'une des 14 commissions
 * (PLAN_IMPLEMENTATION.md §4.4, §8)
 *
 * Affiche : icône, numéro (01–14), nom, et le cas échéant l'axe
 * thématique. La carte entière est un lien vers `/commissions/[slug]`.
 *
 * `commission` accepte indifféremment une ligne de la base (`Row`) ou une
 * entrée de `COMMISSIONS` : seuls `numero`, `slug`, `nom`, `couleur` et
 * `icone` sont utilisés.
 */

export interface CommissionCardProps {
  /**
   * Accepte indifféremment une ligne de la table `commissions` (où `couleur`
   * est un hexadécimal libre) ou une entrée de `COMMISSIONS`. `couleur` est
   * donc typé `string` et non `CommissionCouleur`.
   */
  commission: {
    numero: number;
    slug: string;
    nom: string;
    couleur: string;
    icone: string | null;
    couleurHex?: string;
    axe?: string | null;
  };
  /** Affiche l'axe thématique sous le nom */
  avecAxe?: boolean;
  /** Taille de la carte */
  taille?: "sm" | "md";
  className?: string;
}

export function CommissionCard({
  commission,
  avecAxe = false,
  taille = "md",
  className,
}: CommissionCardProps) {
  const Icone = getIconeCommission(commission.icone);
  const couleur = commission.couleurHex ?? COMMISSION_HEX[commission.couleur];

  return (
    <Link
      href={`/commissions/${commission.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-card border border-ccjp-marine/10 border-l-4 bg-white p-4 shadow-card",
        "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or",
        taille === "sm" ? "p-3" : "p-4",
        className,
      )}
      style={{ borderLeftColor: couleur }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${couleur}1A` }}
        >
          <Icone className="h-5 w-5" style={{ color: couleur }} aria-hidden="true" />
        </span>

        <span className="text-xs font-bold tabular-nums text-ccjp-marine/35">
          {String(commission.numero).padStart(2, "0")}
        </span>
      </div>

      <h3
        className={cn(
          "font-display font-bold leading-snug text-ccjp-marine",
          taille === "sm" ? "text-sm" : "text-base",
        )}
      >
        {commission.nom}
      </h3>

      {avecAxe && commission.axe && (
        <p className="mt-1 text-xs leading-snug text-ccjp-marine/55">{commission.axe}</p>
      )}

      <span
        aria-hidden="true"
        className="mt-auto pt-2 text-xs font-semibold text-ccjp-vert opacity-0 transition group-hover:opacity-100"
      >
        Découvrir →
      </span>
    </Link>
  );
}

/** Couleurs hex des 3 teintes de commission (CDC §3.3 / plan §4.3). */
const COMMISSION_HEX: Record<string, string> = {
  marine: "#1A3A5C",
  vert: "#1B5E20",
  brun: "#7B3F00",
};
