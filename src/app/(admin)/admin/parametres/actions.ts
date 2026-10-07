"use server";

/**
 * Server Actions — module Paramètres (§10.2, P4.11)
 *
 * Chaque action commence par `exigerAdmin()` : une Server Action est un point
 * d'entrée HTTP public que le middleware ne voit pas.
 *
 * L'écriture utilise `upsert` plutôt qu'`update` : si un paramètre du seed
 * manque (base ancienne, clé ajoutée après coup), l'enregistrement le crée
 * au lieu d'échouer silencieusement. C'est aussi ce qui rend la page utile
 * lors d'une première mise en service.
 */

import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";
import { revaliderParametres } from "@/lib/revalidation";
import { CHAMPS_PARAMETRES, type TypeChamp } from "./constantes";

/** Résultat renvoyé au formulaire client. */
export type ResultatAction = {
  succes?: boolean;
  erreur?: string;
  champs?: Record<string, string>;
};

/** Les seules clés que l'action accepte d'écrire. */
const CLES_AUTORISEES = new Set(CHAMPS_PARAMETRES.map((c) => c.cle));

/** Validation par type de champ. Renvoie un message d'erreur, ou null. */
function valider(type: TypeChamp, valeur: string): string | null {
  if (type === "email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur)) {
      return "Cette adresse e-mail n'est pas valide.";
    }
    return null;
  }
  if (type === "url") {
    // Une URL vide est autorisée (elle masque l'icône correspondante).
    if (valeur.length === 0) return null;
    if (!/^https?:\/\/[^\s]+\.[^\s]+$/.test(valeur)) {
      return "Le lien doit commencer par http:// ou https:// et être une adresse complète.";
    }
    return null;
  }
  if (type === "texte" && valeur.length > 200) {
    return "200 caractères maximum.";
  }
  if (type === "zone" && valeur.length > 500) {
    return "500 caractères maximum.";
  }
  return null;
}

export async function enregistrerParametres(
  formData: FormData,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  // --- Lecture et validation de chaque champ connu ---
  const champs: Record<string, string> = {};
  const lignes: Array<{ cle: string; valeur: string }> = [];

  for (const champ of CHAMPS_PARAMETRES) {
    const brut = formData.get(champ.cle);
    const valeur = typeof brut === "string" ? brut.trim() : "";

    if (champ.obligatoire && valeur.length === 0) {
      champs[champ.cle] = "Ce champ est obligatoire.";
      continue;
    }

    const probleme = valider(champ.type, valeur);
    if (probleme) {
      champs[champ.cle] = probleme;
      continue;
    }

    lignes.push({ cle: champ.cle, valeur });
  }

  if (Object.keys(champs).length > 0) return { champs };

  // Garde-fou : aucune clé hors de la liste blanche ne doit être écrite,
  // même si un appel direct à l'action en fournit une.
  const sures = lignes.filter((l) => CLES_AUTORISEES.has(l.cle));
  if (sures.length !== lignes.length) {
    return { erreur: "Un paramètre non reconnu a été ignoré." };
  }

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("parametres")
      .upsert(sures, { onConflict: "cle" });

    if (error) {
      console.error("[admin/parametres] enregistrement :", error.message);
      return { erreur: `Enregistrement impossible : ${error.message}` };
    }

    // Les paramètres alimentent l'en-tête, le pied de page et les métadonnées
    // de toutes les pages : on invalide donc l'ensemble du layout.
    revaliderParametres();
    return { succes: true };
  } catch (e) {
    console.error("[admin/parametres] enregistrement exception :", e);
    return { erreur: "Une erreur technique est survenue lors de l'enregistrement." };
  }
}
