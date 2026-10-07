"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useId } from "react";
import { CheckCircle2, UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { envoyerAdhesion } from "./actions";
import { ChampsAntiRobot } from "@/components/forms/ChampsAntiRobot";
import { ETAT_INITIAL, type OptionCommission } from "./types";

/**
 * Formulaire d'adhésion public (§9.2)
 *
 * L'envoi est délégué à la Server Action `envoyerAdhesion` (fichier
 * `actions.ts`, exclusivement serveur). Ce composant ne fait que gérer
 * l'affichage : état de succès, erreurs par champ, indicateur d'envoi.
 */

export type { OptionCommission };

/* ------------------------------------------------------------------ */
/* Champ texte                                                        */
/* ------------------------------------------------------------------ */

interface ChampProps {
  nom: string;
  label: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  maxLength: number;
  erreur?: string;
  autoComplete?: string;
  placeholder?: string;
  aide?: string;
}

function Champ({
  nom,
  label,
  type = "text",
  required = false,
  maxLength,
  erreur,
  autoComplete,
  placeholder,
  aide,
}: ChampProps) {
  const id = useId();

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
        {aide && (
          <span className="ml-2 font-normal text-ccjp-marine/50">{aide}</span>
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
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-ccjp-marine",
          "placeholder:text-ccjp-marine/40",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1",
          erreur ? "border-ccjp-rouge" : "border-ccjp-marine/20",
        )}
      />
      {erreur && (
        <p
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
    <Button type="submit" variante="accent" taille="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Envoi en cours…
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Envoyer ma demande
        </>
      )}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire                                                         */
/* ------------------------------------------------------------------ */

export function FormulaireRejoindre({
  commissions,
}: {
  commissions: OptionCommission[];
}) {
  const [etat, action] = useFormState(envoyerAdhesion, ETAT_INITIAL);

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
          Demande enregistrée
        </h3>
        <p className="mx-auto max-w-md text-ccjp-marine/75">
          Votre demande d’adhésion a bien été transmise au secrétariat du CCJP.
          Vous serez contacté(e) par e-mail dès qu’elle aura été étudiée.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      <ChampsAntiRobot />
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
        <Champ
          nom="prenom"
          label="Prénom"
          required
          maxLength={120}
          autoComplete="given-name"
          placeholder="Aïssatou"
          erreur={etat.champs?.prenom}
        />
        <Champ
          nom="nom"
          label="Nom"
          required
          maxLength={120}
          autoComplete="family-name"
          placeholder="Ndiaye"
          erreur={etat.champs?.nom}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Champ
          nom="email"
          label="Adresse e-mail"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          placeholder="vous@exemple.sn"
          erreur={etat.champs?.email}
        />
        <Champ
          nom="telephone"
          label="Téléphone"
          type="tel"
          maxLength={32}
          autoComplete="tel"
          placeholder="77 123 45 67"
          aide="(facultatif)"
          erreur={etat.champs?.telephone}
        />
      </div>

      <Champ
        nom="quartier"
        label="Quartier"
        maxLength={120}
        autoComplete="address-level3"
        placeholder="Ex. Douet Bali"
        aide="(facultatif)"
        erreur={etat.champs?.quartier}
      />

      <div>
        <label
          htmlFor="commission_id"
          className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
        >
          Commission souhaitée
          <span className="ml-2 font-normal text-ccjp-marine/50">
            (facultatif)
          </span>
        </label>
        <select
          id="commission_id"
          name="commission_id"
          defaultValue=""
          className={cn(
            "w-full rounded-lg border border-ccjp-marine/20 bg-white px-3.5 py-2.5 text-ccjp-marine",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1",
          )}
        >
          <option value="">Aucune préférence pour le moment</option>
          {commissions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="motivation"
          className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
        >
          Votre motivation
          <span className="ml-2 font-normal text-ccjp-marine/50">
            (facultatif)
          </span>
        </label>
        <textarea
          id="motivation"
          name="motivation"
          rows={5}
          maxLength={2000}
          placeholder="Pourquoi souhaitez-vous rejoindre le CCJP ?"
          className={cn(
            "w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-ccjp-marine",
            "placeholder:text-ccjp-marine/40",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1",
            etat.champs?.motivation
              ? "border-ccjp-rouge"
              : "border-ccjp-marine/20",
          )}
        />
        {etat.champs?.motivation && (
          <p
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-sm text-ccjp-rouge"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {etat.champs.motivation}
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
