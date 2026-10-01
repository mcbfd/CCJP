"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEVISE_CCJP, NOM_CCJP } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Navbar — en-tête public (PLAN_IMPLEMENTATION.md §4.4, §9.1 section 1)
 *
 * Comportement :
 *   - à partir de `lg` : navigation horizontale + bouton « Rejoindre le CCJP » ;
 *   - en dessous       : logo + bouton burger ouvrant un panneau plein écran.
 *
 * Accessibilité :
 *   - `aria-expanded` / `aria-controls` sur le bouton burger ;
 *   - fermeture à la touche Échap et à chaque changement de route ;
 *   - défilement de la page bloqué tant que le menu est ouvert ;
 *   - lien actif signalé par `aria-current="page"` et non par la seule couleur.
 */

const NAVIGATION = [
  { href: "/", libelle: "Accueil" },
  { href: "/a-propos", libelle: "Le CCJP" },
  { href: "/commissions", libelle: "Commissions" },
  { href: "/actualites", libelle: "Actualités" },
  { href: "/evenements", libelle: "Événements" },
  { href: "/programme", libelle: "Programme" },
  { href: "/bureau-executif", libelle: "Bureau" },
  { href: "/contact", libelle: "Contact" },
] as const;

/** Un lien est actif s'il correspond exactement, ou s'il est un préfixe
 *  de la route courante (pour `/commissions/[slug]`). */
function estActif(chemin: string, courant: string): boolean {
  if (chemin === "/") return courant === "/";
  return courant === chemin || courant.startsWith(`${chemin}/`);
}

export function Navbar() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = React.useState(false);

  // Fermeture automatique à chaque navigation
  React.useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  // Fermeture à la touche Échap
  React.useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  // Blocage du défilement de l'arrière-plan menu ouvert
  React.useEffect(() => {
    if (!ouvert) return;
    const precedente = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = precedente;
    };
  }, [ouvert]);

  return (
    <header className="sticky top-0 z-40 bg-ccjp-marine shadow-card">
      {/* Bandeau devise — rappel institutionnel, masqué à l'impression */}
      <div className="hidden border-b border-white/10 bg-ccjp-marine/95 py-1 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-ccjp-or sm:block">
        {DEVISE_CCJP}
      </div>

      <nav
        aria-label="Navigation principale"
        className="ccjp-container flex h-16 items-center justify-between gap-4"
      >
        {/* ---- Logo ---- */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ccjp-or bg-white text-xl"
          >
            🏛️
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-extrabold leading-none text-white">
              CCJP
            </span>
            <span className="block truncate text-[11px] leading-tight text-white/70">
              Conseil des Jeunes de Podor
            </span>
          </span>
        </Link>

        {/* ---- Navigation bureau (lg et +) ---- */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAVIGATION.map((item) => {
            const actif = estActif(item.href, chemin);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-2.5 py-2 text-sm font-semibold transition-colors",
                    actif
                      ? "bg-white/10 text-ccjp-or"
                      : "text-white/85 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.libelle}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {/* CTA bureau */}
          <ButtonLink
            href="/rejoindre"
            taille="sm"
            variante="accent"
            className="hidden sm:inline-flex"
          >
            Rejoindre le CCJP
          </ButtonLink>

          {/* ---- Bouton burger (mobile / tablette) ---- */}
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or lg:hidden"
          >
            {ouvert ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* ---- Panneau mobile ---- */}
      <div
        id="menu-mobile"
        hidden={!ouvert}
        className="border-t border-white/10 bg-ccjp-marine lg:hidden"
      >
        <ul className="ccjp-container flex flex-col py-2">
          {NAVIGATION.map((item) => {
            const actif = estActif(item.href, chemin);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-3 py-3 text-base font-semibold transition-colors",
                    actif
                      ? "bg-white/10 text-ccjp-or"
                      : "text-white/90 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.libelle}
                </Link>
              </li>
            );
          })}
          <li className="mt-2 px-3 pb-2">
            <ButtonLink
              href="/rejoindre"
              variante="accent"
              pleineLargeur
              tabIndex={ouvert ? undefined : -1}
            >
              Rejoindre le CCJP
            </ButtonLink>
          </li>
        </ul>
      </div>

      {/* Nom accessible de l'organisation, lu par les lecteurs d'écran */}
      <span className="sr-only">{NOM_CCJP}</span>
    </header>
  );
}
