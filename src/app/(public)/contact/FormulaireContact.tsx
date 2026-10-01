"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useId } from "react";
import { CheckCircle2, Send, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { envoyerMessage } from "./actions";
import { ETAT_INITIAL } from "./types";

/**
 * Formulaire de contact public (§9.2)
 *
 * L'envoi est délégué à la Server Action `envoyerMessage` (fichier
 * `actions.ts`, exclusivement serveur). Ce composant ne fait que gérer
 * l'affichage : état de succès, erreurs par champ, indicateur d'envoi.
 */

/* ------------------------------------------------------------------ */
/* Champ texte                                                        */
/* ------------------------------------------------------------------ */

interface ChampTexteProps {
  nom: string;
  label: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  maxLength: number;
  erreur?: string;
  autoComplete?: string;
  placeholder?: string;
}

function ChampTexte({
  nom,
  label,
  type = "text",
  required = false,
  maxLength,
  erreur,
  autoComplete,
  placeholder,
}: ChampTexteProps) {
  const id = useId();
  const idErreur = `${id}-erreur`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
      >
        {label}
        {required && (
          <span className="ml-1 text-ccjp-rouge" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={nom}
        type={type}
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? idErreur : undefined}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-ccjp-marine",
          "placeholder:text-ccjp-marine/40",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1",
          erreur ? "border-ccjp-rouge" : "border-ccjp-marine/20",
        )}
      />
      {erreur && (
        <p
          id={idErreur}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-sm text-ccjp-rouge"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {erreur}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bouton d'envoi                                                     */
/* ------------------------------------------------------------------ */

function BoutonEnvoyer() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variante="primaire" taille="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Envoi en cours…
        </>
      ) : (
        <>
          <Send className="h-4 w-4" aria-hidden="true" />
          Envoyer le message
        </>
      )}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire                                                         */
/* ------------------------------------------------------------------ */

export interface FormulaireContactProps {
  /** Sujets proposés — généralement les 14 commissions. */
  sujets: string[];
}

export function FormulaireContact({ sujets }: FormulaireContactProps) {
  const [etat, action] = useFormState(envoyerMessage, ETAT_INITIAL);

  if (etat.succes) {
    return (
      <div
        role="status"
        className="rounded-card border border-ccjp-vert/25 bg-ccjp-vert/5 p-8 text-center"
      >
        <CheckCircle2
          className="mx-auto mb-3 h-12 w-12 text-ccjp-vert"
          aria-hidden="true"
        />
        <h3 className="mb-2 font-display text-xl font-extrabold text-ccjp-marine">
          Message envoyé
        </h3>
        <p className="mx-auto max-w-md text-ccjp-marine/75">
          Merci pour votre message. Le secrétariat du CCJP vous répondra dans
          les meilleurs délais.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      {etat.erreur && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/30 bg-ccjp-rouge/5 p-3 text-sm text-ccjp-rouge"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {etat.erreur}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <ChampTexte
          nom="nom"
          label="Nom et prénom"
          required
          maxLength={120}
          autoComplete="name"
          placeholder="Aïssatou Ndiaye"
          erreur={etat.champs?.nom}
        />
        <ChampTexte
          nom="email"
          label="Adresse e-mail"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          placeholder="vous@exemple.sn"
          erreur={etat.champs?.email}
        />
      </div>

      <div>
        <label
          htmlFor="sujet"
          className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
        >
          Sujet
          <span className="ml-1 text-ccjp-rouge" aria-hidden="true">
            *
          </span>
        </label>
        <select
          id="sujet"
          name="sujet"
          required
          defaultValue=""
          aria-invalid={etat.champs?.sujet ? true : undefined}
          className={cn(
            "w-full rounded-lg border bg-white px-3.5 py-2.5 text-ccjp-marine",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1",
            etat.champs?.sujet
              ? "border-ccjp-rouge"
              : "border-ccjp-marine/20",
          )}
        >
          <option value="" disabled>
            Choisissez une commission…
          </option>
          {sujets.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="Autre demande">Autre demande</option>
        </select>
        {etat.champs?.sujet && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-sm text-ccjp-rouge"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {etat.champs.sujet}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
        >
          Message
          <span className="ml-1 text-ccjp-rouge" aria-hidden="true">
            *
          </span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          placeholder="Votre message au CCJP…"
          aria-invalid={etat.champs?.message ? true : undefined}
          className={cn(
            "w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-ccjp-marine",
            "placeholder:text-ccjp-marine/40",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1",
            etat.champs?.message
              ? "border-ccjp-rouge"
              : "border-ccjp-marine/20",
          )}
        />
        {etat.champs?.message && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-sm text-ccjp-rouge"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {etat.champs.message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <BoutonEnvoyer />
        <p className="text-xs text-ccjp-marine/60">
          Les champs marqués d’un astérisque sont obligatoires.
        </p>
      </div>
    </form>
  );
}
