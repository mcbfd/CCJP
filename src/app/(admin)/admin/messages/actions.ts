"use server";

/**
 * Server Actions — module Messages (PLAN §10.2, P4.9)
 *
 * Table `contacts`. Les politiques RLS donnent aux administrateurs le droit
 * de lire et de mettre à jour (marquer lu / non lu), mais pas d'insérer :
 * l'insertion est réservée au formulaire public /contact.
 *
 * Chaque action commence par `exigerAdmin()` : une Server Action est un
 * point d'entrée HTTP public, invisible du middleware.
 */

import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";

/** Résultat renvoyé au formulaire client. */
export type ResultatAction = {
  succes?: boolean;
  erreur?: string;
};

/** Marque un message comme lu. */
export async function marquerLu(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("contacts")
      .update({ lu: true })
      .eq("id", id);

    if (error) {
      console.error("[admin/messages] marquage lu :", error.message);
      return { erreur: `Mise à jour impossible : ${error.message}` };
    }

    return { succes: true };
  } catch (e) {
    console.error("[admin/messages] marquage lu exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/** Remet un message en non lu. */
export async function marquerNonLu(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("contacts")
      .update({ lu: false })
      .eq("id", id);

    if (error) {
      console.error("[admin/messages] marquage non lu :", error.message);
      return { erreur: `Mise à jour impossible : ${error.message}` };
    }

    return { succes: true };
  } catch (e) {
    console.error("[admin/messages] marquage non lu exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/** Supprime définitivement un message. */
export async function supprimerMessage(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
      console.error("[admin/messages] suppression :", error.message);
      return { erreur: `Suppression impossible : ${error.message}` };
    }

    return { succes: true };
  } catch (e) {
    console.error("[admin/messages] suppression exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la suppression." };
  }
}

/* ------------------------------------------------------------------ */
/* Enveloppes pour <form action>                                       */
/* ------------------------------------------------------------------ */

export async function actionMarquerLu(formData: FormData): Promise<void> {
  await marquerLu(String(formData.get("id") ?? ""));
}

export async function actionMarquerNonLu(formData: FormData): Promise<void> {
  await marquerNonLu(String(formData.get("id") ?? ""));
}

export async function actionSupprimer(formData: FormData): Promise<void> {
  await supprimerMessage(String(formData.get("id") ?? ""));
}
