"use server";

/**
 * Server Actions — module Événements (PLAN §10.2, P4.5)
 *
 * Même discipline que pour les Actualités : chaque action commence par
 * `exigerAdmin()`, car une Server Action est un point d'entrée HTTP public
 * que le middleware ne protège pas. Toutes les écritures passent par le
 * client serveur (clé ANON + session), donc par les politiques RLS.
 *
 * Particularités des événements :
 *   - `date_debut` est OBLIGATOIRE (not null) : c'est le seul champ dont
 *     l'absence rend l'enregistrement impossible ;
 *   - `date_fin` est optionnelle mais ne peut pas précéder `date_debut` ;
 *   - pas de colonne « épinglé » ici, contrairement aux Actualités.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";
import { revaliderEvenements } from "@/lib/revalidation";
import {
  STATUTS_EVENEMENT,
  type StatutEvenement,
} from "./constantes";

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

/** Transforme un titre en slug URL-friendly. */
function slugifier(titre: string): string {
  return titre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Lit un champ texte de `FormData`, nettoyé. */
function texte(formData: FormData, nom: string): string {
  const v = formData.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Convertit la valeur d'un `<input type="datetime-local">` en horodatage ISO.
 *
 * Le navigateur envoie `2026-11-14T18:30` SANS fuseau horaire. PostgreSQL
 * l'interpréterait dans le fuseau du serveur, ce qui décalerait l'événement
 * de plusieurs heures. On précise donc explicitement le fuseau local.
 */
function lireDate(formData: FormData, nom: string): string | null {
  const brut = texte(formData, nom);
  if (!brut) return null;
  const d = new Date(brut);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Vérifie qu'un slug est libre, en excluant éventuellement l'événement courant. */
async function slugLibre(
  supabase: ReturnType<typeof createClient>,
  slug: string,
  saufId?: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("evenements")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return !data || data.id === saufId;
}

/** Assainit un type d'événement : on garde le texte, borné en longueur. */
function lireType(formData: FormData): string | null {
  const t = texte(formData, "type_evenement");
  return t.length > 0 ? t.slice(0, 60) : null;
}

/* ------------------------------------------------------------------ */
/* Création                                                            */
/* ------------------------------------------------------------------ */

export async function creerEvenement(formData: FormData): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const titre = texte(formData, "titre");
  const slugBrut = texte(formData, "slug");
  const description = texte(formData, "description");
  const lieu = texte(formData, "lieu");
  const lienInscription = texte(formData, "lien_inscription");
  const imageUrl = texte(formData, "image_url");
  const typeEvenement = lireType(formData);
  const statut = STATUTS_EVENEMENT.includes(texte(formData, "statut") as StatutEvenement)
    ? (texte(formData, "statut") as StatutEvenement)
    : "a_venir";
  const dateDebut = lireDate(formData, "date_debut");
  const dateFin = lireDate(formData, "date_fin");

  const champs: Record<string, string> = {};
  if (titre.length < 3) champs.titre = "Le titre doit faire au moins 3 caractères.";
  if (titre.length > 200) champs.titre = "Le titre ne peut pas dépasser 200 caractères.";
  if (!dateDebut) champs.date_debut = "La date de début est obligatoire.";
  if (dateDebut && dateFin && dateFin < dateDebut) {
    champs.date_fin = "La date de fin ne peut pas précéder la date de début.";
  }
  if (lienInscription && !/^https?:\/\//i.test(lienInscription)) {
    champs.lien_inscription = "Le lien doit commencer par http:// ou https://";
  }
  if (Object.keys(champs).length > 0) return { champs };

  let slug = slugBrut ? slugifier(slugBrut) : slugifier(titre);
  if (slug.length === 0) slug = `evenement-${Date.now()}`;

  try {
    const supabase = createClient();

    if (!(await slugLibre(supabase, slug))) {
      let suffixe = 2;
      while (!(await slugLibre(supabase, `${slug}-${suffixe}`))) suffixe += 1;
      slug = `${slug}-${suffixe}`;
    }

    const { data, error } = await supabase
      .from("evenements")
      .insert({
        titre,
        slug,
        description: description || null,
        lieu: lieu || null,
        date_debut: dateDebut!,
        date_fin: dateFin,
        type_evenement: typeEvenement,
        lien_inscription: lienInscription || null,
        image_url: imageUrl || null,
        statut,
      })
      .select("id, slug")
      .single();

    if (error) {
      console.error("[admin/evenements] création :", error.message);
      return { erreur: `Création impossible : ${error.message}` };
    }

    revaliderEvenements(data.id);
    return { succes: true, id: data.id };
  } catch (e) {
    console.error("[admin/evenements] création exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la création." };
  }
}

/* ------------------------------------------------------------------ */
/* Modification                                                        */
/* ------------------------------------------------------------------ */

export async function modifierEvenement(
  id: string,
  formData: FormData,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const titre = texte(formData, "titre");
  const slugBrut = texte(formData, "slug");
  const description = texte(formData, "description");
  const lieu = texte(formData, "lieu");
  const lienInscription = texte(formData, "lien_inscription");
  const imageUrl = texte(formData, "image_url");
  const typeEvenement = lireType(formData);
  const statut = STATUTS_EVENEMENT.includes(texte(formData, "statut") as StatutEvenement)
    ? (texte(formData, "statut") as StatutEvenement)
    : "a_venir";
  const dateDebut = lireDate(formData, "date_debut");
  const dateFin = lireDate(formData, "date_fin");

  const champs: Record<string, string> = {};
  if (titre.length < 3) champs.titre = "Le titre doit faire au moins 3 caractères.";
  if (titre.length > 200) champs.titre = "Le titre ne peut pas dépasser 200 caractères.";
  if (!dateDebut) champs.date_debut = "La date de début est obligatoire.";
  if (dateDebut && dateFin && dateFin < dateDebut) {
    champs.date_fin = "La date de fin ne peut pas précéder la date de début.";
  }
  if (lienInscription && !/^https?:\/\//i.test(lienInscription)) {
    champs.lien_inscription = "Le lien doit commencer par http:// ou https://";
  }
  if (Object.keys(champs).length > 0) return { champs };

  let slug = slugBrut ? slugifier(slugBrut) : slugifier(titre);

  try {
    const supabase = createClient();

    if (!(await slugLibre(supabase, slug, id))) {
      let suffixe = 2;
      while (!(await slugLibre(supabase, `${slug}-${suffixe}`, id))) suffixe += 1;
      slug = `${slug}-${suffixe}`;
    }

    const { error } = await supabase
      .from("evenements")
      .update({
        titre,
        slug,
        description: description || null,
        lieu: lieu || null,
        date_debut: dateDebut!,
        date_fin: dateFin,
        type_evenement: typeEvenement,
        lien_inscription: lienInscription || null,
        image_url: imageUrl || null,
        statut,
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/evenements] modification :", error.message);
      return { erreur: `Modification impossible : ${error.message}` };
    }

    revaliderEvenements(id);
    return { succes: true, id };
  } catch (e) {
    console.error("[admin/evenements] modification exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la modification." };
  }
}

/* ------------------------------------------------------------------ */
/* Suppression                                                         */
/* ------------------------------------------------------------------ */

export async function supprimerEvenement(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { error } = await supabase.from("evenements").delete().eq("id", id);

    if (error) {
      console.error("[admin/evenements] suppression :", error.message);
      return { erreur: `Suppression impossible : ${error.message}` };
    }

    revaliderEvenements();
    return { succes: true };
  } catch (e) {
    console.error("[admin/evenements] suppression exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la suppression." };
  }
}

/* ------------------------------------------------------------------ */
/* Bascule de statut                                                   */
/* ------------------------------------------------------------------ */

/**
 * Fait passer un événement au statut suivant : à venir → terminé → à venir.
 * « Annulé » est réservé au formulaire, car il demande une explication.
 */
export async function basculerStatutEvenement(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { data: evenement } = await supabase
      .from("evenements")
      .select("statut")
      .eq("id", id)
      .maybeSingle();

    if (!evenement) return { erreur: "Événement introuvable." };

    const nouveauStatut: StatutEvenement =
      evenement.statut === "a_venir" ? "termine" : "a_venir";

    const { error } = await supabase
      .from("evenements")
      .update({ statut: nouveauStatut })
      .eq("id", id);

    if (error) {
      console.error("[admin/evenements] bascule statut :", error.message);
      return { erreur: `Changement de statut impossible : ${error.message}` };
    }

    revalidatePath("/admin/evenements");
    revaliderEvenements();
    return { succes: true };
  } catch (e) {
    console.error("[admin/evenements] bascule statut exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/* ------------------------------------------------------------------ */
/* Enveloppes pour <form action>                                       */
/* ------------------------------------------------------------------ */

export async function actionTerminer(formData: FormData): Promise<void> {
  await basculerStatutEvenement(String(formData.get("id") ?? ""));
}

export async function actionSupprimer(formData: FormData): Promise<void> {
  await supprimerEvenement(String(formData.get("id") ?? ""));
}
