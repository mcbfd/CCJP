"use server";

/**
 * Server Actions — module Médiathèque (PLAN §10.2, P4.10)
 *
 * Le dépôt de fichier passe par Supabase Storage. Deux niveaux de garde :
 *   1. `exigerAdmin()` ici, car une Server Action est un point d'entrée HTTP
 *      public que le middleware ne voit pas ;
 *   2. la politique RLS « Admins déposent des fichiers » (migration 0004),
 *      qui vérifie `is_admin()` côté base.
 *
 * Les limites (taille, types MIME) sont revalidées ici plutôt que de faire
 * confiance au client : même si le formulaire refuse un fichier trop gros,
 * un appel direct à l'action ne doit pas pouvoir contourner cette règle.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerAdmin } from "@/lib/actions/garde";
import { MESSAGE_ACCES_REFUSE } from "@/lib/actions/messages";
import { bucketParId, extensionsAcceptees } from "./constantes";

/** Résultat renvoyé au formulaire client. */
export type ResultatAction = {
  succes?: boolean;
  erreur?: string;
  champs?: Record<string, string>;
  url?: string;
};

/** Nettoie un nom de fichier pour en faire un chemin Storage sûr. */
function nomSecurise(nom: string): string {
  return (
    nom
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "fichier"
  );
}

/* ------------------------------------------------------------------ */
/* Dépôt d'un fichier                                                  */
/* ------------------------------------------------------------------ */

export async function deposerMedia(formData: FormData): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  const bucketId = String(formData.get("bucket") ?? "");
  const bucket = bucketParId(bucketId);
  if (!bucket) {
    return { erreur: "Destination inconnue. Choisissez un emplacement valide." };
  }

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { champs: { fichier: "Sélectionnez un fichier à déposer." } };
  }

  // Revalidation serveur des limites, indépendante du formulaire.
  if (fichier.size > bucket.tailleMax) {
    return {
      champs: {
        fichier: `Fichier trop volumineux : ${Math.round(fichier.size / 1024 / 1024)} Mo, alors que la limite est de ${Math.round(bucket.tailleMax / 1024 / 1024)} Mo.`,
      },
    };
  }
  if (fichier.type && !bucket.types.includes(fichier.type)) {
    return {
      champs: {
        fichier: `Format non accepté ici. Formats autorisés : ${extensionsAcceptees(bucket)}.`,
      },
    };
  }

  // Chemin unique : deux fichiers peuvent porter le même nom.
  const chemin = `${Date.now()}-${nomSecurise(fichier.name)}`;

  try {
    const supabase = createClient();

    const { error: erreurDepot } = await supabase.storage
      .from(bucket.id)
      .upload(chemin, fichier, {
        contentType: fichier.type || "application/octet-stream",
        upsert: false,
      });

    if (erreurDepot) {
      console.error("[admin/media] dépôt :", erreurDepot.message);
      return { erreur: `Dépôt impossible : ${erreurDepot.message}` };
    }

    // URL publique : les 4 buckets sont déclarés publics (migration 0004).
    const { data: urlData } = supabase.storage
      .from(bucket.id)
      .getPublicUrl(chemin);
    const url = urlData.publicUrl;

    // Traçabilité dans la table `medias`.
    const { error: erreurTable } = await supabase.from("medias").insert({
      nom: fichier.name,
      url,
      type: bucket.typeMedia,
      taille: fichier.size,
    });

    if (erreurTable) {
      // Le fichier est déposé mais non répertorié : on le signale sans le
      // supprimer, car la suppression pourrait échouer à son tour et laisser
      // l'administrateur sans aucune trace de ce qui s'est passé.
      console.error("[admin/media] répertoriage :", erreurTable.message);
      revalidatePath("/admin/media");
      return {
        succes: true,
        url,
        erreur:
          "Fichier déposé, mais son enregistrement dans la médiathèque a échoué. Il reste accessible à son adresse.",
      };
    }

    revalidatePath("/admin/media");
    return { succes: true, url };
  } catch (e) {
    console.error("[admin/media] dépôt exception :", e);
    return { erreur: "Une erreur technique est survenue lors du dépôt." };
  }
}

/* ------------------------------------------------------------------ */
/* Suppression                                                         */
/* ------------------------------------------------------------------ */

export async function supprimerMedia(id: string): Promise<ResultatAction> {
  if (!(await exigerAdmin())) return { erreur: MESSAGE_ACCES_REFUSE };

  try {
    const supabase = createClient();

    // On relit l'URL pour en déduire le bucket et le chemin du fichier.
    const { data: media } = await supabase
      .from("medias")
      .select("url")
      .eq("id", id)
      .maybeSingle();

    if (!media) return { erreur: "Fichier introuvable dans la médiathèque." };

    // Suppression de la ligne : si elle échoue, on s'arrête là.
    const { error: erreurLigne } = await supabase.from("medias").delete().eq("id", id);
    if (erreurLigne) {
      console.error("[admin/media] suppression ligne :", erreurLigne.message);
      return { erreur: `Suppression impossible : ${erreurLigne.message}` };
    }

    // Puis suppression du fichier lui-même. Un échec ici laisse un fichier
    // orphelin : ce n'est pas grave, il n'est plus référencé nulle part.
    const bucket = bucketDepuisUrl(media.url);
    if (bucket) {
      const chemin = media.url.split(`/object/public/${bucket}/`)[1] ?? "";
      if (chemin) {
        const { error: erreurFichier } = await supabase.storage
          .from(bucket)
          .remove([decodeURIComponent(chemin)]);
        if (erreurFichier) {
          console.error("[admin/media] suppression fichier :", erreurFichier.message);
        }
      }
    }

    revalidatePath("/admin/media");
    return { succes: true };
  } catch (e) {
    console.error("[admin/media] suppression exception :", e);
    return { erreur: "Une erreur technique est survenue lors de la suppression." };
  }
}

/** Déduit le bucket d'une URL Storage publique. */
function bucketDepuisUrl(url: string): string | null {
  for (const b of ["actualites-images", "membres-photos", "evenements-images", "documents"]) {
    if (url.includes(`/object/public/${b}/`)) return b;
  }
  return null;
}

/** Enveloppe `<form action>` pour la suppression. */
export async function actionSupprimer(formData: FormData): Promise<void> {
  await supprimerMedia(String(formData.get("id") ?? ""));
}
