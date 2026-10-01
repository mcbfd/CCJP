"use server";

/**
 * Server Action du formulaire de contact (§9.2)
 *
 * Insère le message dans la table `contacts`. La politique RLS
 * « Contacts insérables publiquement » (migration 0002) autorise l'INSERT
 * anonyme mais interdit la lecture : personne ne peut consulter les messages
 * des autres depuis le site public.
 *
 * On n'utilise jamais `.select()` après l'insertion, le rôle anonyme n'ayant
 * pas le droit de relire la ligne fraîchement créée.
 *
 * Ce fichier est séparé du composant client : la directive `"use server"` en
 * fait un module exclusivement serveur. Le placer dans un fichier
 * `"use client"` ferait bundler `next/headers` côté navigateur et casserait
 * le build.
 */

import { createClient } from "@/lib/supabase/server";
import { getParametresSite } from "@/lib/parametres";
import {
  MESSAGE_MIN,
  champ,
  estEmailValide,
  nettoyerOptionnel,
  nettoyerRequis,
} from "@/lib/validation";
import type { EtatContact } from "./types";

/**
 * Adresse e-mail de contact à afficher dans les messages d'erreur.
 *
 * Elle est lue dans la table `parametres` (éditable depuis le back-office) et
 * non codée en dur, afin qu'un changement d'adresse se répercute partout.
 * `getParametresSite` a déjà son propre repli sur la valeur du seed.
 */
async function adresseContact(): Promise<string> {
  const { emailContact } = await getParametresSite();
  return emailContact;
}

export async function envoyerMessage(
  _etatPrecedent: EtatContact,
  formData: FormData,
): Promise<EtatContact> {
  const nom = nettoyerRequis(formData.get("nom"), 120);
  const email = champ(formData, "email").trim();
  const sujet = nettoyerRequis(formData.get("sujet"), 160);
  const message = nettoyerOptionnel(formData.get("message"), 4000);

  const champs: Record<string, string> = {};

  if (!nom) champs.nom = "Merci d’indiquer votre nom.";
  if (!estEmailValide(email)) champs.email = "Adresse e-mail invalide.";
  if (!sujet) champs.sujet = "Merci de choisir un sujet.";

  if (message === null) {
    champs.message = "Votre message ne peut pas dépasser 4000 caractères.";
  } else if (message.length < MESSAGE_MIN) {
    champs.message = `Merci de détailler un peu (au moins ${MESSAGE_MIN} caractères).`;
  }

  if (Object.keys(champs).length > 0) return { champs };

  try {
    const supabase = createClient();

    const { error } = await supabase.from("contacts").insert({
      nom: nom!,
      email,
      sujet: sujet!,
      message: message!,
    });

    // Adresse de contact courante, pour le message d'erreur ci-dessous.
  const emailContact = await adresseContact();

  if (error) {
      console.error("[contact] insertion échouée :", error.message);
      return {
        erreur:
          "L’envoi a échoué. Vous pouvez nous écrire directement à " +
          `${emailContact}.`,
      };
    }

    return { succes: true };
  } catch (e) {
    console.error("[contact] exception :", e);
    // Même adresse de contact pour ce message d'erreur.
    const emailContact = await adresseContact();
    return {
      erreur:
        "Une erreur technique est survenue. Réessayez plus tard ou écrivez-nous " +
        `à ${emailContact}.`,
    };
  }
}
