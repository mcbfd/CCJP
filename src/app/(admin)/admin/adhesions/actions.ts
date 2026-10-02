"use server";

/**
 * Server Actions — module Adhésions (PLAN §10.2, P4.8)
 *
 * Table `adhesions`. Les politiques RLS donnent aux administrateurs le droit
 * de lire et de mettre à jour (P4.8 = « accepter / refuser »), mais pas
 * d'insérer : l'insertion est réservée au formulaire public /rejoindre.
 *
 * Chaque action commence par `exigerAdmin()` : une Server Action est un
 * point d'entrée HTTP public, invisible du middleware.
 */

import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";
import { STATUTS_ADHESION, type StatutAdhesion } from "./constantes";

/** Résultat renvoyé au formulaire client. */
export type ResultatAction = {
  succes?: boolean;
  erreur?: string;
};


/**
 * Change le statut d'une demande d'adhésion.
 *
 * `nouveauStatut` est validé contre la liste blanche : ne jamais faire
 * confiance à une valeur qui vient du client, même quand l'appelant a déjà
 * été authentifié.
 */
export async function changerStatutAdhesion(
  id: string,
  nouveauStatut: string,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  if (!(STATUTS_ADHESION as readonly string[]).includes(nouveauStatut)) {
    return { erreur: "Statut inconnu." };
  }

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("adhesions")
      .update({ statut: nouveauStatut as StatutAdhesion })
      .eq("id", id);

    if (error) {
      console.error("[admin/adhesions] changement de statut :", error.message);
      return { erreur: `Mise à jour impossible : ${error.message}` };
    }

    return { succes: true };
  } catch (e) {
    console.error("[admin/adhesions] changement de statut exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/** Accepte une demande. */
export async function accepterAdhesion(id: string): Promise<ResultatAction> {
  return changerStatutAdhesion(id, "accepte");
}

/** Refuse une demande. */
export async function refuserAdhesion(id: string): Promise<ResultatAction> {
  return changerStatutAdhesion(id, "refuse");
}

/** Remet une demande en attente (utile en cas d'erreur de manipulation). */
export async function remettreEnAttente(id: string): Promise<ResultatAction> {
  return changerStatutAdhesion(id, "en_attente");
}

/** Supprime définitivement une demande. */
export async function supprimerAdhesion(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { error } = await supabase.from("adhesions").delete().eq("id", id);

    if (error) {
      console.error("[admin/adhesions] suppression :", error.message);
      return { erreur: `Suppression impossible : ${error.message}` };
    }

    return { succes: true };
  } catch (e) {
    console.error("[admin/adhesions] suppression exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la suppression." };
  }
}

/* ------------------------------------------------------------------ */
/* Enveloppes pour <form action>                                       */
/* ------------------------------------------------------------------ */

export async function actionAccepter(formData: FormData): Promise<void> {
  await accepterAdhesion(String(formData.get("id") ?? ""));
}

export async function actionRefuser(formData: FormData): Promise<void> {
  await refuserAdhesion(String(formData.get("id") ?? ""));
}

export async function actionRemettreEnAttente(formData: FormData): Promise<void> {
  await remettreEnAttente(String(formData.get("id") ?? ""));
}

export async function actionSupprimer(formData: FormData): Promise<void> {
  await supprimerAdhesion(String(formData.get("id") ?? ""));
}
