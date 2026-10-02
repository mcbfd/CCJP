"use client";

/**
 * CopieUrlBouton — copie l'adresse d'un média dans le presse-papiers
 * (§10.2, P4.10)
 *
 * Le presse-papiers est une API du navigateur : ce bouton doit vivre dans un
 * composant client. `navigator.clipboard` n'existe que dans un contexte
 * sécurisé (https ou localhost) ; on retombe sur une sélection manuelle du
 * champ texte si l'API n'est pas disponible.
 */

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CopieUrlBoutonProps {
  url: string;
  libelle?: string;
}

export function CopieUrlBouton({ url, libelle = "Copier l'adresse" }: CopieUrlBoutonProps) {
  const [copie, setCopie] = React.useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      window.setTimeout(() => setCopie(false), 2000);
    } catch {
      // Contexte non sécurisé ou permission refusée : on sélectionne le texte
      // affiché pour que l'administrateur puisse copier à la main.
      const champ = document.querySelector<HTMLInputElement>(
        `input[data-url="${CSS.escape(url)}"]`,
      );
      champ?.select();
    }
  }

  return (
    <>
      <Button type="button" variante="fantome" taille="sm" onClick={copier}>
        {copie ? (
          <Check className="h-4 w-4 text-ccjp-vert" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copie ? "Copiée" : libelle}
      </Button>
      {/* Champ caché servant de repli pour la copie manuelle */}
      <input
        type="text"
        readOnly
        value={url}
        data-url={url}
        aria-label="Adresse du fichier"
        className="sr-only"
        tabIndex={-1}
      />
    </>
  );
}
