"use client";

import { useFormStatus } from "react-dom";
import { useId } from "react";
import { LogIn, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { connexion } from "@/lib/actions/auth";

/**
 * Formulaire de connexion (§7.2)
 *
 * L'envoi est délégué à la Server Action `connexion` (`src/lib/actions/auth.ts`,
 * exclusivement serveur). Ce composant ne gère que l'affichage : bascule de
 * visibilité du mot de passe, indicateur d'envoi, message d'erreur.
 *
 * Les messages d'erreur sont volontairement vagues (« identifiants invalides »)
 * afin de ne pas révéler si une adresse e-mail existe dans l'annuaire.
 */

export interface FormulaireConnexionProps {
  /** Code d'erreur transmis en paramètre d'URL par la Server Action. */
  erreur?: string;
  /** Page à rejoindre après connexion (validée côté serveur). */
  destination?: string;
}

/** Message associé à chaque code d'erreur. */
const MESSAGES: Record<string, string> = {
  champs: "Merci de renseigner votre e-mail et votre mot de passe.",
  identifiants: "E-mail ou mot de passe incorrect.",
  nonautorise:
    "Ce compte existe mais n'est pas habilité à administrer le site. " +
    "Contactez le secrétariat du CCJP.",
  inconnu: "Votre session a expiré. Merci de vous reconnecter.",
};

function BoutonConnexion() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variante="accent"
      taille="lg"
      pleineLargeur
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Connexion en cours…
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Se connecter
        </>
      )}
    </Button>
  );
}

export function FormulaireConnexion({ erreur, destination }: FormulaireConnexionProps) {
  const idEmail = useId();
  const idMotDePasse = useId();
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  return (
    <form action={connexion} className="space-y-5">
      {/* Destination après connexion — validée côté serveur. */}
      {destination && <input type="hidden" name="next" value={destination} />}

      {erreur && MESSAGES[erreur] && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/40 bg-ccjp-rouge/10 p-3 text-sm text-white"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {MESSAGES[erreur]}
        </p>
      )}

      <div>
        <label
          htmlFor={idEmail}
          className="mb-1.5 block text-sm font-semibold text-white"
        >
          Adresse e-mail
        </label>
        <input
          id={idEmail}
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="president@ccjp-podor.sn"
          className={cn(
            "w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-white",
            "placeholder:text-white/40",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-2 focus-visible:ring-offset-ccjp-marine",
          )}
        />
      </div>

      <div>
        <label
          htmlFor={idMotDePasse}
          className="mb-1.5 block text-sm font-semibold text-white"
        >
          Mot de passe
        </label>
        <div className="relative">
          <input
            id={idMotDePasse}
            name="motdepasse"
            type={motDePasseVisible ? "text" : "password"}
            required
            autoComplete="current-password"
            className={cn(
              "w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 pr-11 text-white",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-2 focus-visible:ring-offset-ccjp-marine",
            )}
          />
          <button
            type="button"
            onClick={() => setMotDePasseVisible((v) => !v)}
            aria-label={
              motDePasseVisible
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
          >
            {motDePasseVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <BoutonConnexion />

      <p className="text-center text-xs text-white/50">
        Accès réservé aux membres habilités du Bureau Exécutif. Aucune
        inscription publique.
      </p>
    </form>
  );
}
