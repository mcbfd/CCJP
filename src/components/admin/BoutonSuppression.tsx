"use client";

/**
 * BoutonSuppression — formulaire de suppression avec confirmation
 * (back-office, PLAN §10.2)
 *
 * La confirmation `confirm()` DOIT vivre dans un composant client : c'est une
 * interaction du navigateur. Un composant serveur ne peut pas porter de
 * gestionnaire d'événement, et un `onSubmit` posé directement sur le `<form>`
 * d'une page serveur serait simplement ignoré à l'hydratation — la boîte de
 * dialogue n'apparaîtrait jamais et la suppression partirait sans confirmation.
 *
 * Le `confirm` est intentionnellement synchrone et direct : il ne dépend
 * d'aucun état, donc rien à rejouer si l'utilisateur annule.
 */

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface BoutonSuppressionProps {
  /** Server Action appelée à la validation. */
  action: (formData: FormData) => void | Promise<void>;
  /** Identifiant transmis à l'action via un champ caché. */
  id: string;
  /** Message de confirmation, déjà rédigé en français. */
  confirmation: string;
  /** Libellé accessible du bouton (ex. « Supprimer »). */
  libelle?: string;
}

export function BoutonSuppression({
  action,
  id,
  confirmation,
  libelle = "Supprimer",
}: BoutonSuppressionProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmation)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variante="fantome" taille="sm">
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{libelle}</span>
      </Button>
    </form>
  );
}
