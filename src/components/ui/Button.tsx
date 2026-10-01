import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Button — bouton de base (PLAN_IMPLEMENTATION.md §4.4)
 *
 * 4 variantes conformes à la charte :
 *   primaire   → vert CCJP    (action principale)
 *   accent     → or CCJP      (CTA, mise en avant)
 *   secondaire → marine CCJP  (action neutre)
 *   fantome    → transparent  (action tertiaire)
 *
 * Deux formes d'utilisation :
 *   <Button onClick={...}>Envoyer</Button>
 *   <ButtonLink href="/rejoindre">Rejoindre</ButtonLink>
 */

export type ButtonVariante = "primaire" | "accent" | "secondaire" | "fantome";
export type ButtonTaille = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-[background-color,color,box-shadow,transform] duration-200 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "active:translate-y-px select-none";

const VARIANTES: Record<ButtonVariante, string> = {
  primaire:
    "bg-ccjp-vert text-white shadow-card hover:bg-ccjp-vert/90 hover:shadow-hover",
  accent:
    "bg-ccjp-or text-ccjp-marine shadow-card hover:bg-ccjp-or/90 hover:shadow-hover",
  secondaire:
    "bg-ccjp-marine text-white shadow-card hover:bg-ccjp-marine/90 hover:shadow-hover",
  fantome:
    "bg-transparent text-ccjp-marine border-2 border-ccjp-marine/25 " +
      "hover:border-ccjp-vert hover:bg-ccjp-vert/5 hover:text-ccjp-vert",
};

const TAILLES: Record<ButtonTaille, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

function classes(variante: ButtonVariante, taille: ButtonTaille, extra?: string) {
  return cn(BASE, VARIANTES[variante], TAILLES[taille], extra);
}

/* ------------------------------------------------------------------ */
/* Bouton <button>                                                     */
/* ------------------------------------------------------------------ */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: ButtonVariante;
  taille?: ButtonTaille;
  /** Occupe toute la largeur disponible (utile sur mobile) */
  pleineLargeur?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variante = "primaire",
      taille = "md",
      pleineLargeur = false,
      className,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={classes(
          variante,
          taille,
          cn(pleineLargeur && "w-full", className),
        )}
        {...props}
      />
    );
  },
);

/* ------------------------------------------------------------------ */
/* Bouton-lien <a>                                                      */
/* ------------------------------------------------------------------ */

export interface ButtonLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  variante?: ButtonVariante;
  taille?: ButtonTaille;
  pleineLargeur?: boolean;
}

export function ButtonLink({
  variante = "primaire",
  taille = "md",
  pleineLargeur = false,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={classes(
        variante,
        taille,
        cn(pleineLargeur && "w-full", className),
      )}
      {...props}
    />
  );
}
