"use server";

/**
 * Server Action du formulaire d'adhésion (§9.2)
 *
 * Insère une demande dans la table `adhesions` avec le statut par défaut
 * `en_attente`. La politique RLS « Adhésions insérables publiquement »
 * (migration 0002) autorise l'INSERT anonyme mais interdit la lecture :
 * personne ne peut consulter les demandes des autres depuis le site public.
 *
 * La commission choisie est transmise par son identifiant (`commission_id`),
 * qui référence `commissions(id)`. PostgreSQL rejette une chaîne qui n'est
 * pas un UUID : on ne fait donc confiance qu'aux identifiants fournis par le
 * serveur, jamais à une valeur libre du navigateur.
 *
 * Ce fichier est séparé du composant client : la directive `"use server"` en
 * fait un module exclusivement serveur. Le placer dans un fichier
 * `"use client"` ferait bundler `next/headers` côté navigateur et casserait
 * le build.
 */

import { createClient } from "@/lib/supabase/server";
import { getParametresSite } from "@/lib/parametres";
import {
  MESSAGE_TROP_RAPIDE,
  examinerSoumission,
} from "@/lib/anti-bot";
import {
  champ,
  estEmailValide,
  estTelephoneValide,
  nettoyerOptionnel,
  nettoyerRequis,
} from "@/lib/validation";
import type { EtatAdhesion } from "./types";

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

export async function envoyerAdhesion(
  _etatPrecedent: EtatAdhesion,
  formData: FormData,
): Promise<EtatAdhesion> {
  const prenom = nettoyerRequis(formData.get("prenom"), 120);
  const nom = nettoyerRequis(formData.get("nom"), 120);
  const email = champ(formData, "email").trim();
  const telephone = champ(formData, "telephone").trim();
  const quartier = nettoyerOptionnel(formData.get("quartier"), 120);
  const commissionId = champ(formData, "commission_id").trim();
  const motivation = nettoyerOptionnel(formData.get("motivation"), 2000);

  const champs: Record<string, string> = {};

  if (!prenom) champs.prenom = "Merci d’indiquer votre prénom.";
  if (!nom) champs.nom = "Merci d’indiquer votre nom.";
  if (!estEmailValide(email)) champs.email = "Adresse e-mail invalide.";

  // Le téléphone est facultatif, mais s'il est rempli il doit être plausible.
  if (telephone.length > 0 && !estTelephoneValide(telephone)) {
    champs.telephone = "Numéro de téléphone invalide (ex. 77 123 45 67).";
  }

  if (quartier === null) {
    champs.quartier = "Nom de quartier trop long.";
  }
  if (motivation === null) {
    champs.motivation = "Votre texte ne peut pas dépasser 2000 caractères.";
  }

  if (Object.keys(champs).length > 0) return { champs };

  // Garde-fous anti-robot (§7.5) — voir contact/actions.ts pour le détail du
  // raisonnement. Ils ne s'appliquent qu'aux soumissions par ailleurs valides.
  const verdict = examinerSoumission(formData);

  if (verdict.issue === "silencieux") {
    return { succes: true };
  }

  if (verdict.issue === "tropRapide" || verdict.issue === "horlogeInvalide") {
    return { erreur: MESSAGE_TROP_RAPIDE };
  }

  try {
    const supabase = createClient();

    const { error } = await supabase.from("adhesions").insert({
      prenom: prenom!,
      nom: nom!,
      email,
      telephone: telephone.length > 0 ? telephone : null,
      quartier: quartier && quartier.length > 0 ? quartier : null,
      commission_id:
        commissionId.length > 0 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(commissionId)
          ? commissionId
          : null,
      motivation: motivation && motivation.length > 0 ? motivation : null,
    });

    // Adresse de contact courante, pour le message d'erreur ci-dessous.
  const emailContact = await adresseContact();

  if (error) {
      console.error("[rejoindre] insertion échouée :", error.message);
      return {
        erreur:
          "Votre demande n’a pas pu être enregistrée. Réessayez plus tard ou " +
          `écrivez-nous à ${emailContact}.`,
      };
    }

    return { succes: true };
  } catch (e) {
    console.error("[rejoindre] exception :", e);
    // Même adresse de contact pour ce message d'erreur.
    const emailContact = await adresseContact();
    return {
      erreur:
        "Une erreur technique est survenue. Réessayez plus tard ou écrivez-nous " +
        `à ${emailContact}.`,
    };
  }
}
