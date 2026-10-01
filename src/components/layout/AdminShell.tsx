"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

/**
 * AdminShell — enveloppe du back-office (PLAN_IMPLEMENTATION.md §10.3)
 *
 * Maintient la navigation des 9 modules accessible sur toutes les tailles
 * d'écran. Les responsables de commission publient souvent depuis leur
 * téléphone (§10.3 point 7), donc sur mobile la sidebar devient un panneau
 * escamotable ouvert par le bouton de la barre supérieure.
 *
 * La vérification d'authentification et la protection des routes sont
 * traitées en Phase 4 (P4.1 / P4.2), pas ici.
 */

export interface AdminShellProps {
  children: React.ReactNode;
  /** Email de l'administrateur connecté */
  email?: string | null;
  /** Action de déconnexion (Server Action fournie par le layout) */
  actionDeconnexion?: () => void;
}

export function AdminShell({ children, email, actionDeconnexion }: AdminShellProps) {
  const [menuOuvert, setMenuOuvert] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-ccjp-beige">
      <AdminSidebar
        email={email}
        onDeconnexion={actionDeconnexion}
        ouvert={menuOuvert}
        onFermer={() => setMenuOuvert(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre supérieure — mobile / tablette uniquement */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ccjp-marine/10 bg-white px-4 py-3 shadow-card lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOuvert(true)}
            aria-label="Ouvrir le menu d'administration"
            aria-expanded={menuOuvert}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ccjp-marine transition-colors hover:bg-ccjp-marine/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <Link href="/admin" className="font-display text-base font-extrabold text-ccjp-marine">
            Administration CCJP
          </Link>
        </header>

        {/* Contenu de la page */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
