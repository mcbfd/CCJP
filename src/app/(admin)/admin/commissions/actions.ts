"use server";

/**
 * Server Actions — module Commissions et projets phars (PLAN §10.2, P4.7)
 *
 * Deux tables liées : `commissions` (les 14 du CDC) et `projets_phares`
 * (rattachés à une commission, suppression en cascade).
 *
 * Chaque action commence par `exigerAdmin()` : une Server Action est un
 * point d'entrée HTTP public que le middleware ne voit pas.
 *
 * ⚠️ Le CDC fixe la liste des 14 commissions : leur `numero` et leur `slug`
 *    sont donc modifiables avec prudence. Renommer un slug casse les liens
 *    déjà publiés ; c'est pour cela que la page d'édition affiche un
 *    avertissement explicite.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";
import { revaliderCommissions } from "@/lib/revalidation";
import {
  STATUTS_PROJET,
  type StatutProjet,
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

function texte(formData: FormData, nom: string): string {
  const v = formData.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

function slugifier(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Lit les axes stratégiques saisis à raison d'un par ligne. */
function lireAxes(formData: FormData): string[] {
  return texte(formData, "axes_strategiques")
    .split("\n")
    .map((l) => l.replace(/^[-*\s]+/, "").trim())
    .filter((l) => l.length > 0)
    .slice(0, 8);
}

function lireEntier(formData: FormData, nom: string, defaut: number): number {
  const n = Number(texte(formData, nom));
  return Number.isFinite(n) ? Math.floor(n) : defaut;
}

function couleurValide(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

async function slugCommissionLibre(
  supabase: ReturnType<typeof createClient>,
  slug: string,
  saufId?: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("commissions")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return !data || data.id === saufId;
}

/* ================================================================== */
/* COMMISSIONS                                                         */
/* ================================================================== */

export async function creerCommission(formData: FormData): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const numero = lireEntier(formData, "numero", 0);
  const nom = texte(formData, "nom");
  const slugBrut = texte(formData, "slug");
  const description = texte(formData, "description");
  const vision = texte(formData, "vision");
  const axes = lireAxes(formData);
  const couleur = texte(formData, "couleur") || "#1B5E20";
  const icone = texte(formData, "icone");
  const ordre = lireEntier(formData, "ordre", numero);

  const champs: Record<string, string> = {};
  if (numero < 1 || numero > 14) {
    champs.numero = "Le numéro doit être compris entre 1 et 14.";
  }
  if (nom.length < 3) champs.nom = "Le nom doit faire au moins 3 caractères.";
  if (!couleurValide(couleur)) {
    champs.couleur = "La couleur doit être au format hexadécimal (#RRVVBB).";
  }
  if (Object.keys(champs).length > 0) return { champs };

  let slug = slugBrut ? slugifier(slugBrut) : slugifier(nom);

  try {
    const supabase = createClient();

    if (!(await slugCommissionLibre(supabase, slug))) {
      let suffixe = 2;
      while (!(await slugCommissionLibre(supabase, `${slug}-${suffixe}`))) suffixe += 1;
      slug = `${slug}-${suffixe}`;
    }

    const { data, error } = await supabase
      .from("commissions")
      .insert({
        numero,
        nom,
        slug,
        description: description || null,
        vision: vision || null,
        axes_strategiques: axes,
        couleur,
        icone: icone || null,
        ordre,
      })
      .select("id, slug")
      .single();

    if (error) {
      console.error("[admin/commissions] création :", error.message);
      return { erreur: `Création impossible : ${error.message}` };
    }

    revaliderCommissions(data.slug);
    return { succes: true, id: data.id };
  } catch (e) {
    console.error("[admin/commissions] création exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la création." };
  }
}

export async function modifierCommission(
  id: string,
  formData: FormData,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const numero = lireEntier(formData, "numero", 0);
  const nom = texte(formData, "nom");
  const slugBrut = texte(formData, "slug");
  const description = texte(formData, "description");
  const vision = texte(formData, "vision");
  const axes = lireAxes(formData);
  const couleur = texte(formData, "couleur") || "#1B5E20";
  const icone = texte(formData, "icone");
  const ordre = lireEntier(formData, "ordre", numero);

  const champs: Record<string, string> = {};
  if (numero < 1 || numero > 14) {
    champs.numero = "Le numéro doit être compris entre 1 et 14.";
  }
  if (nom.length < 3) champs.nom = "Le nom doit faire au moins 3 caractères.";
  if (!couleurValide(couleur)) {
    champs.couleur = "La couleur doit être au format hexadécimal (#RRVVBB).";
  }
  if (Object.keys(champs).length > 0) return { champs };

  let slug = slugBrut ? slugifier(slugBrut) : slugifier(nom);

  try {
    const supabase = createClient();

    if (!(await slugCommissionLibre(supabase, slug, id))) {
      let suffixe = 2;
      while (!(await slugCommissionLibre(supabase, `${slug}-${suffixe}`, id))) suffixe += 1;
      slug = `${slug}-${suffixe}`;
    }

    const { error } = await supabase
      .from("commissions")
      .update({
        numero,
        nom,
        slug,
        description: description || null,
        vision: vision || null,
        axes_strategiques: axes,
        couleur,
        icone: icone || null,
        ordre,
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/commissions] modification :", error.message);
      return { erreur: `Modification impossible : ${error.message}` };
    }

    revaliderCommissions(slug);
    return { succes: true, id };
  } catch (e) {
    console.error("[admin/commissions] modification exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la modification." };
  }
}

/* ================================================================== */
/* PROJETS PHARS                                                       */
/* ================================================================== */

export async function creerProjet(formData: FormData): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const commissionId = texte(formData, "commission_id");
  const titre = texte(formData, "titre");
  const description = texte(formData, "description");
  const anneeTexte = texte(formData, "annee");
  const statut = STATUTS_PROJET.includes(texte(formData, "statut") as StatutProjet)
    ? (texte(formData, "statut") as StatutProjet)
    : "planifie";
  const ordre = lireEntier(formData, "ordre", 0);

  const champs: Record<string, string> = {};
  if (!commissionId) champs.commission_id = "La commission est obligatoire.";
  if (titre.length < 3) champs.titre = "Le titre doit faire au moins 3 caractères.";
  let annee: number | null = null;
  if (anneeTexte) {
    annee = Number(anneeTexte);
    if (!Number.isInteger(annee) || annee < 2020 || annee > 2100) {
      champs.annee = "L'année doit être un nombre entre 2020 et 2100.";
    }
  }
  if (Object.keys(champs).length > 0) return { champs };

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("projets_phares")
      .insert({
        commission_id: commissionId,
        titre,
        description: description || null,
        annee,
        statut,
        ordre,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[admin/commissions] création projet :", error.message);
      return { erreur: `Création impossible : ${error.message}` };
    }

    revaliderCommissions();
    return { succes: true, id: data.id };
  } catch (e) {
    console.error("[admin/commissions] création projet exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la création." };
  }
}

export async function modifierProjet(
  id: string,
  formData: FormData,
): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const commissionId = texte(formData, "commission_id");
  const titre = texte(formData, "titre");
  const description = texte(formData, "description");
  const anneeTexte = texte(formData, "annee");
  const statut = STATUTS_PROJET.includes(texte(formData, "statut") as StatutProjet)
    ? (texte(formData, "statut") as StatutProjet)
    : "planifie";
  const ordre = lireEntier(formData, "ordre", 0);

  const champs: Record<string, string> = {};
  if (!commissionId) champs.commission_id = "La commission est obligatoire.";
  if (titre.length < 3) champs.titre = "Le titre doit faire au moins 3 caractères.";
  let annee: number | null = null;
  if (anneeTexte) {
    annee = Number(anneeTexte);
    if (!Number.isInteger(annee) || annee < 2020 || annee > 2100) {
      champs.annee = "L'année doit être un nombre entre 2020 et 2100.";
    }
  }
  if (Object.keys(champs).length > 0) return { champs };

  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("projets_phares")
      .update({
        commission_id: commissionId,
        titre,
        description: description || null,
        annee,
        statut,
        ordre,
      })
      .eq("id", id);

    if (error) {
      console.error("[admin/commissions] modification projet :", error.message);
      return { erreur: `Modification impossible : ${error.message}` };
    }

    revaliderCommissions();
    return { succes: true, id };
  } catch (e) {
    console.error("[admin/commissions] modification projet exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la modification." };
  }
}

export async function supprimerProjet(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { error } = await supabase.from("projets_phares").delete().eq("id", id);

    if (error) {
      console.error("[admin/commissions] suppression projet :", error.message);
      return { erreur: `Suppression impossible : ${error.message}` };
    }

    revaliderCommissions();
    return { succes: true };
  } catch (e) {
    console.error("[admin/commissions] suppression projet exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la suppression." };
  }
}

/** Bascule un projet entre « planifié » et « en cours ». */
export async function basculerStatutProjet(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    const { data: projet } = await supabase
      .from("projets_phares")
      .select("statut")
      .eq("id", id)
      .maybeSingle();
    if (!projet) return { erreur: "Projet introuvable." };

    const nouveauStatut: StatutProjet =
      projet.statut === "en_cours" ? "planifie" : "en_cours";

    const { error } = await supabase
      .from("projets_phares")
      .update({ statut: nouveauStatut })
      .eq("id", id);

    if (error) {
      console.error("[admin/commissions] bascule projet :", error.message);
      return { erreur: `Changement de statut impossible : ${error.message}` };
    }

    revalidatePath("/admin/commissions");
    revaliderCommissions();
    return { succes: true };
  } catch (e) {
    console.error("[admin/commissions] bascule projet exception :", e);
    return { erreur: "Une erreur technique est survenue." };
  }
}

/* ------------------------------------------------------------------ */
/* Enveloppes pour <form action>                                       */
/* ------------------------------------------------------------------ */

export async function actionBasculerProjet(formData: FormData): Promise<void> {
  await basculerStatutProjet(String(formData.get("id") ?? ""));
}

export async function actionSupprimerProjet(formData: FormData): Promise<void> {
  await supprimerProjet(String(formData.get("id") ?? ""));
}
