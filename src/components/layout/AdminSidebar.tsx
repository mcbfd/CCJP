"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULES_ADMIN, estActifAdmin } from "@/lib/modules-admin";

/**
 * AdminSidebar — navigation des 9 modules du back-office
 * (PLAN_IMPLEMENTATION.md §4.4, §10.2)
 *
 * Principes d'interface (§10.3) : tout en français, utilisable sur
 * téléphone. Sur mobile la sidebar devient un panneau escamotable piloté
 * par un bouton dans la barre supérieure.
 *
 * La liste des modules vit dans `@/lib/modules-admin` (module neutre, sans
 * « use client ») afin d'être réutilisable par les pages serveur.
 */

export { MODULES_ADMIN } from "@/lib/modules-admin";

export interface AdminSidebarProps {
  /** Email de l'administrateur connecté, affiché en bas de sidebar */
  email?: string | null;
  /** Appelé quand l'utilisateur demande la déconnexion */
  onDeconnexion?: () => void;
  /** Contrôlé par le layout : le panneau mobile est ouvert */
  ouvert?: boolean;
  /** Ferme le panneau mobile */
  onFermer?: () => void;
}

export function AdminSidebar({
  email,
  onDeconnexion,
  ouvert = false,
  onFermer,
}: AdminSidebarProps) {
  const chemin = usePathname();

  const contenu = (
    <div className="flex h-full flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ccjp-or bg-white text-lg"
          >
            🏛️
          </span>
          <span>
            <span className="block font-display text-base font-extrabold leading-none text-white">
              CCJP
            </span>
            <span className="block text-[11px] leading-tight text-white/60">
              Administration
            </span>
          </span>
        </Link>

        {/* Croix de fermeture — mobile seulement */}
        {onFermer && (
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer le menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Modules */}
      <nav aria-label="Modules d'administration" className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {MODULES_ADMIN.map((m) => {
            const actif = estActifAdmin(m.href, chemin);
            return (
              <li key={m.href}>
                <Link
                  href={m.href}
                  aria-current={actif ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or",
                    actif
                      ? "bg-ccjp-or text-ccjp-marine"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <m.Icone
                    className={cn("mt-0.5 h-5 w-5 shrink-0", actif && "text-ccjp-marine")}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">
                      {m.libelle}
                    </span>
                    <span
                      className={cn(
                        "block text-[11px] leading-tight",
                        actif ? "text-ccjp-marine/70" : "text-white/50",
                      )}
                    >
                      {m.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Pied de sidebar : compte + déconnexion */}
      <div className="border-t border-white/10 p-3">
        {email && (
          <p className="mb-2 truncate px-1 text-[11px] text-white/50" title={email}>
            Connecté : {email}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            Voir le site public
          </Link>
          {onDeconnexion && (
            <button
              type="button"
              onClick={onDeconnexion}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-ccjp-rouge hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Se déconnecter
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fixe — écrans larges */}
      <aside className="hidden w-64 shrink-0 bg-ccjp-marine lg:block">
        <div className="sticky top-0 h-screen">{contenu}</div>
      </aside>

      {/* Panneau escamotable — mobile / tablette */}
      {ouvert && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ccjp-marine/60"
            onClick={onFermer}
            aria-hidden="true"
          />
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ccjp-marine shadow-hover"
            role="dialog"
            aria-modal="true"
            aria-label="Menu d'administration"
          >
            {contenu}
          </aside>
        </div>
      )}
    </>
  );
}
