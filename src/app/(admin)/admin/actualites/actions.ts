"use server";

/**
 * Server Actions — module Actualités (PLAN §10.2, P4.4)
 *
 * Chaque action commence par `exigerAdmin()`. C'est indispensable : une
 * Server Action est un point d'entrée HTTP public, et le middleware ne
 * protège que la navigation vers `/admin`.
 *
 * Toutes les écritures passent par le client serveur (clé ANON + session
 * utilisateur), donc par les politiques RLS « Admins gèrent les actualités ».
 * Le client privilégié (service_role) n'est pas utilisé : il rendrait la
 * vérification d'habilitation inutile en contournant la RLS.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";
import { revaliderActualites } from "@/lib/revalidation";

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
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
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

/** Lit les tags séparés par des virgules. */
function lireTags(formData: FormData): string[] {
  return texte(formData, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, 10);
}

/**
 * Vérifie qu'un slug est libre, en excluant éventuellement l'article courant.
 * La contrainte `unique` de la base attraperait un doublon, mais un message
 * clair vaut mieux qu'une erreur SQL brute.
 */
async function slugLibre(
  supabase: ReturnType<typeof createClient>,
  slug: string,
  saufId?: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("actualites")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return !data || data.id === saufId;
}

/* ------------------------------------------------------------------ */
/* Création                                                            */
/* ------------------------------------------------------------------ */

export async function creerActualite(
  formData: FormData,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const titre = texte(formData, "titre");
  const slugBrut = texte(formData, "slug");
  const extrait = texte(formData, "extrait");
  const contenu = texte(formData, "contenu");
  const imageUrl = texte(formData, "image_url");
  const commissionId = texte(formData, "commission_id");
  const statut = texte(formData, "statut") === "publie" ? "publie" : "brouillon";
  const epingle = formData.get("epingle") === "on";
  const tags = lireTags(formData);
  const datePublication = texte(formData, "date_publication");

  const champs: Record<string, string> = {};
  if (titre.length < 3) champs.titre = "Le titre doit faire au moins 3 caractères.";
  if (titre.length > 200) champs.titre = "Le titre ne peut pas dépasser 200 caractères.";
  if (Object.keys(champs).length > 0) return { champs };

  // Slug : celui saisi, ou déduit du titre. Doit être unique.
  let slug = slugBrut ? slugifier(slugBrut) : slugifier(titre);
  if (slug.length === 0) slug = `article-${Date.now()}`;

  try {
    const supabase = createClient();

    if (!(await slugLibre(supabase, slug))) {
      // Conflit : on suffixe jusqu'à trouver un slug libre.
      let suffixe = 2;
      while (!(await slugLibre(supabase, `${slug}-${suffixe}`))) suffixe += 1;
      slug = `${slug}-${suffixe}`;
    }

    const { data, error } = await supabase
      .from("actualites")
      .insert({
        titre,
        slug,
        extrait: extrait || null,
        contenu: contenu || null,
        image_url: imageUrl || null,
        commission_id: commissionId || null,
        statut,
        epingle,
        tags,
        // Un article publié reçoit une date de publication s'il n'en a pas.
        date_publication:
          statut === "publie"
            ? datePublication || new Date().toISOString()
            : datePublication || null,
      })
      .select("id, slug")
      .single();

    if (error) {
      console.error("[admin/actualites] création :", error.message);
      return { erreur: `Création impossible : ${error.message}` };
    }

    revaliderActualites(data.slug);
    return { succes: true, id: data.id };
  } catch (e) {
    console.error("[admin/actualites] création exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la création." };
  }
}

/* ------------------------------------------------------------------ */
/* Modification                                                        */
/* ------------------------------------------------------------------ */

export async function modifierActualite(
  id: string,
  formData: FormData,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const titre = texte(formData, "titre");
  const slugBrut = texte(formData, "slug");
  const extrait = texte(formData, "extrait");
  const contenu = texte(formData, "contenu");
  const imageUrl = texte(formData, "image_url");
  const commissionId = texte(formData, "commission_id");
  const statut = texte(formData, "statut") === "publie" ? "publie" : "brouillon";
  const epingle = formData.get("epingle") === "on";
  const tags = lireTags(formData);
  const datePublication = texte(formData, "date_publication");

  const champs: Record<string, string> = {};
  if (titre.length < 3) champs.titre = "Le titre doit faire au moins 3 caractères.";
  if (titre.length > 200) champs.titre = "Le titre ne peut pas dépasser 200 caractères.";
  if (Object.keys(champs).length > 0) return { champs };

  let slug = slugBrut ? slugifier(slugBrut) : slugifier(titre);

  try {
    const supabase = createClient();

    if (!(await slugLibre(supabase, slug, id))) {
      let suffixe = 2;
      while (!(await slugLibre(supabase, `${slug}-${suffixe}`, id))) suffixe += 1;
      slug = `${slug}-${suffixe}`;
    }

    // Si l'article passe en publié sans date, on en pose une maintenant.
    let dateFinale = datePublication || null;
    if (statut === "publie" && !dateFinale) dateFinale = new Date().toISOString();

    const { error } = await supabase
      .from("actualites")
      .update({
        titre,
        slug,
        extrait: extrait || null,
        contenu: contenu || null,
        image_url: imageUrl || null,
        commission_id: commissionId || null,
        statut,
        epingle,
        tags,
        date_publication: dateFinale,
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/actualites] modification :", error.message);
      return { erreur: `Modification impossible : ${error.message}` };
    }

    revaliderActualites(slug);
    return { succes: true, id };
  } catch (e) {
    console.error("[admin/actualites] modification exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la modification." };
  }
}

/* ------------------------------------------------------------------ */
/* Suppression                                                         */
/* ------------------------------------------------------------------ */

export async function supprimerActualite(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    // On relit le slug avant suppression pour pouvoir invalider sa page.
    const { data: article } = await supabase
      .from("actualites")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("actualites").delete().eq("id", id);

    if (error) {
      console.error("[admin/actualites] suppression :", error.message);
      return { erreur: `Suppression impossible : ${error.message}` };
    }

    revaliderActualites(article?.slug ?? null);
    return { succes: true };
  } catch (e) {
    console.error("[admin/actualites] suppression exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la suppression." };
  }
}

/* ------------------------------------------------------------------ */
/* Bascule rapide de statut                                            */
/* ------------------------------------------------------------------ */

export async function basculerStatutActualite(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { data: article } = await supabase
      .from("actualites")
      .select("statut, date_publication")
      .eq("id", id)
      .maybeSingle();

    if (!article) return { erreur: "Article introuvable." };

    const nouveauStatut = article.statut === "publie" ? "brouillon" : "publie";

    const { error } = await supabase
      .from("actualites")
      .update({
        statut: nouveauStatut,
        // Passer en publié sans date existante : on date la publication.
        date_publication:
          nouveauStatut === "publie" && !article.date_publication
            ? new Date().toISOString()
            : article.date_publication,
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/actualites] bascule statut :", error.message);
      return { erreur: `Changement de statut impossible : ${error.message}` };
    }

    revalidatePath("/admin/actualites");
    revaliderActualites();
    return { succes: true };
  } catch (e) {
    console.error("[admin/actualites] bascule statut exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/* ------------------------------------------------------------------ */
/* Épingle                                                             */
/* ------------------------------------------------------------------ */

export async function basculerEpingléActualite(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { data: article } = await supabase
      .from("actualites")
      .select("epingle")
      .eq("id", id)
      .maybeSingle();

    if (!article) return { erreur: "Article introuvable." };

    const { error } = await supabase
      .from("actualites")
      .update({ epingle: !article.epingle })
      .eq("id", id);

    if (error) {
      console.error("[admin/actualites] bascule épingle :", error.message);
      return { erreur: `Modification impossible : ${error.message}` };
    }

    revalidatePath("/admin/actualites");
    revaliderActualites();
    return { succes: true };
  } catch (e) {
    console.error("[admin/actualites] bascule épingle exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/* ------------------------------------------------------------------ */
/* Enveloppes pour <form action>                                       */
/* ------------------------------------------------------------------ */

/**
 * Une action passée directement à `<form action={...}>` doit avoir la
 * signature `(formData: FormData) => void | Promise<void>` — React ne sait
 * pas quoi faire d'une valeur de retour.
 *
 * Ces enveloppes lisent l'identifiant depuis un champ caché du formulaire et
 * se contentent de déclencher l'action métier. Le retour visuel vient de la
 * revalidation de la page, pas d'une valeur renvoyée.
 */

export async function actionPublier(formData: FormData): Promise<void> {
  await basculerStatutActualite(String(formData.get("id") ?? ""));
}

export async function actionEpingler(formData: FormData): Promise<void> {
  await basculerEpingléActualite(String(formData.get("id") ?? ""));
}

export async function actionSupprimer(formData: FormData): Promise<void> {
  await supprimerActualite(String(formData.get("id") ?? ""));
}
