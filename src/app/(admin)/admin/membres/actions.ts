"use server";

/**
 * Server Actions — module Membres du bureau exécutif (PLAN §10.2, P4.6)
 *
 * Table `membres_bureau`. Chaque action commence par `exigerAdmin()` : une
 * Server Action est un point d'entrée HTTP public que le middleware ne voit
 * pas, et les écritures passent par les politiques RLS.
 *
 * Champ notable : `ordre` (int) pilote l'affichage sur la page publique
 * /bureau-executif. Plus il est petit, plus le membre remonte.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";
import { revaliderMembres } from "@/lib/revalidation";

/** Résultat renvoyé au formulaire client. */
export type ResultatAction = {
  succes?: boolean;
  erreur?: string;
  champs?: Record<string, string>;
  id?: string;
};

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function texte(formData: FormData, nom: string): string {
  const v = formData.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

/** Lit un entier positif, ou 0 si le champ est absent ou invalide. */
function lireEntier(formData: FormData, nom: string): number {
  const n = Number(texte(formData, nom));
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

/** Valide une adresse e-mail de façon simple mais stricte. */
function courrielValide(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/* ------------------------------------------------------------------ */
/* Création                                                            */
/* ------------------------------------------------------------------ */

export async function creerMembre(formData: FormData): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const prenom = texte(formData, "prenom");
  const nom = texte(formData, "nom");
  const poste = texte(formData, "poste");
  const commissionId = texte(formData, "commission_id");
  const biographie = texte(formData, "biographie");
  const photoUrl = texte(formData, "photo_url");
  const email = texte(formData, "email");
  const telephone = texte(formData, "telephone");
  const ordre = lireEntier(formData, "ordre");

  const champs: Record<string, string> = {};
  if (prenom.length < 2) champs.prenom = "Le prénom doit faire au moins 2 caractères.";
  if (nom.length < 2) champs.nom = "Le nom doit faire au moins 2 caractères.";
  if (poste.length < 2) champs.poste = "Le poste est obligatoire.";
  if (email && !courrielValide(email)) champs.email = "Cette adresse e-mail n'est pas valide.";
  if (Object.keys(champs).length > 0) return { champs };

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("membres_bureau")
      .insert({
        prenom,
        nom,
        poste,
        commission_id: commissionId || null,
        biographie: biographie || null,
        photo_url: photoUrl || null,
        email: email || null,
        telephone: telephone || null,
        ordre,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[admin/membres] création :", error.message);
      return { erreur: `Création impossible : ${error.message}` };
    }

    revaliderMembres();
    return { succes: true, id: data.id };
  } catch (e) {
    console.error("[admin/membres] création exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la création." };
  }
}

/* ------------------------------------------------------------------ */
/* Modification                                                        */
/* ------------------------------------------------------------------ */

export async function modifierMembre(
  id: string,
  formData: FormData,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const prenom = texte(formData, "prenom");
  const nom = texte(formData, "nom");
  const poste = texte(formData, "poste");
  const commissionId = texte(formData, "commission_id");
  const biographie = texte(formData, "biographie");
  const photoUrl = texte(formData, "photo_url");
  const email = texte(formData, "email");
  const telephone = texte(formData, "telephone");
  const ordre = lireEntier(formData, "ordre");

  const champs: Record<string, string> = {};
  if (prenom.length < 2) champs.prenom = "Le prénom doit faire au moins 2 caractères.";
  if (nom.length < 2) champs.nom = "Le nom doit faire au moins 2 caractères.";
  if (poste.length < 2) champs.poste = "Le poste est obligatoire.";
  if (email && !courrielValide(email)) champs.email = "Cette adresse e-mail n'est pas valide.";
  if (Object.keys(champs).length > 0) return { champs };

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("membres_bureau")
      .update({
        prenom,
        nom,
        poste,
        commission_id: commissionId || null,
        biographie: biographie || null,
        photo_url: photoUrl || null,
        email: email || null,
        telephone: telephone || null,
        ordre,
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/membres] modification :", error.message);
      return { erreur: `Modification impossible : ${error.message}` };
    }

    revaliderMembres();
    return { succes: true, id };
  } catch (e) {
    console.error("[admin/membres] modification exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la modification." };
  }
}

/* ------------------------------------------------------------------ */
/* Suppression                                                         */
/* ------------------------------------------------------------------ */

export async function supprimerMembre(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { error } = await supabase.from("membres_bureau").delete().eq("id", id);

    if (error) {
      console.error("[admin/membres] suppression :", error.message);
      return { erreur: `Suppression impossible : ${error.message}` };
    }

    revaliderMembres();
    return { succes: true };
  } catch (e) {
    console.error("[admin/membres] suppression exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la suppression." };
  }
}

/* ------------------------------------------------------------------ */
/* Déplacement dans l'ordre d'affichage                                */
/* ------------------------------------------------------------------ */

/**
 * Fait monter un membre d'un rang dans la liste d'affichage.
 *
 * On échange simplement le champ `ordre` avec le voisin du dessus : c'est
 * atomique côté base et évite de renuméroter toute la table à chaque fois.
 */
export async function monterMembre(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { data: courant } = await supabase
      .from("membres_bureau")
      .select("id, ordre")
      .eq("id", id)
      .maybeSingle();
    if (!courant) return { erreur: "Membre introuvable." };

    const { data: voisin } = await supabase
      .from("membres_bureau")
      .select("id, ordre")
      .lt("ordre", courant.ordre)
      .order("ordre", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!voisin) return { succes: true }; // déjà en tête

    // Permutation des deux ordres.
    await supabase.from("membres_bureau").update({ ordre: voisin.ordre }).eq("id", courant.id);
    await supabase.from("membres_bureau").update({ ordre: courant.ordre }).eq("id", voisin.id);

    revalidatePath("/admin/membres");
    revaliderMembres();
    return { succes: true };
  } catch (e) {
    console.error("[admin/membres] monter exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/** Enveloppe `<form action>` pour la remontée d'un membre. */
export async function actionMonter(formData: FormData): Promise<void> {
  await monterMembre(String(formData.get("id") ?? ""));
}

/** Enveloppe `<form action>` pour la suppression d'un membre. */
export async function actionSupprimer(formData: FormData): Promise<void> {
  await supprimerMembre(String(formData.get("id") ?? ""));
}
