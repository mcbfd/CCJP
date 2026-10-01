import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SectionTitle — titre de section avec filet dégradé vert → or
 * (PLAN_IMPLEMENTATION.md §4.4)
 *
 * Structure : surtitre optionnel (petit texte doré), titre principal,
 * filet tricolore, puis chapô optionnel.
 */

export interface SectionTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Petit texte au-dessus du titre (« Section 03 », « Nos commissions »…) */
  surtitre?: string;
  /** Niveau de titre — respecte la hiérarchie document */
  as?: "h1" | "h2" | "h3";
  /** Chapô affiché sous le filet */
  chapo?: React.ReactNode;
  /** Alignement du bloc */
  align?: "gauche" | "centre";
  /** Masque le filet décoratif */
  sansFilet?: boolean;
}

export function SectionTitle({
  surtitre,
  as: Balise = "h2",
  chapo,
  align = "gauche",
  sansFilet = false,
  className,
  children,
  ...props
}: SectionTitleProps) {
  const centre = align === "centre";

  return (
    <div className={cn(centre && "text-center")}>
      {surtitre && (
        <p
          className={cn(
            "mb-2 text-xs font-bold uppercase tracking-[0.2em] text-ccjp-or",
            centre && "text-center",
          )}
        >
          {surtitre}
        </p>
      )}

      <Balise
        className={cn(
          "font-display text-2xl font-extrabold leading-tight text-ccjp-marine sm:text-3xl",
          className,
        )}
        {...props}
      >
        {children}
      </Balise>

      {!sansFilet && (
        <div className={cn("ccjp-rule mt-3", centre && "mx-auto")} aria-hidden="true" />
      )}

      {chapo && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed text-ccjp-marine/75",
            centre && "mx-auto",
          )}
        >
          {chapo}
        </p>
      )}
    </div>
  );
}
