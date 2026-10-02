"use client";

/**
 * Formulaire de création / modification d'un événement (§10.2, P4.5)
 *
 * Même principe que le formulaire d'article : l'envoi est délégué à une
 * Server Action, ce composant ne fait que l'affichage.
 *
 * Point d'attention sur les dates : les champs `datetime-local` attendent la
 * forme `yyyy-MM-ddTHH:mm` SANS fuseau horaire, alors que la base stocke des
 * `timestamptz` en ISO. Les deux fonctions de conversion ci-dessous font le
 * pont en utilisant explicitement l'heure locale du poste, sinon un événement
 * saisi à 18h30 apparaîtrait décalé de plusieurs heures sur le site.
 */

import { useFormState, useFormStatus } from "react-dom";
import { useId, useState } from "react";
import { Save, AlertCircle, Loader2, CalendarClock } from "lucide-react";
import slugify from "slugify";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { creerEvenement, modifierEvenement, type ResultatAction } from "./actions";
import {
  LIBELLES_STATUT_EVENEMENT,
  STATUTS_EVENEMENT,
  TYPES_EVENEMENT,
  type StatutEvenement,
} from "./constantes";

export interface ValeursInitiales {
  id: string;
  titre: string;
  slug: string;
  description: string;
  lieu: string;
  date_debut: string;
  date_fin: string;
  type_evenement: string;
  lien_inscription: string;
  image_url: string;
  statut: StatutEvenement;
}

export interface FormulaireEvenementProps {
  valeurs?: ValeursInitiales;
}

/** Convertit un ISO `timestamptz` en valeur pour `<input type="datetime-local">`. */
function isoVersChampDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/* ------------------------------------------------------------------ */
/* Petits composants de champ                                           */
/* ------------------------------------------------------------------ */

function Champ({
  label,
  erreur,
  obligatoire,
  aide,
  children,
}: {
  label: string;
  erreur?: string;
  obligatoire?: boolean;
  aide?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ccjp-marine">
        {label}
        {obligatoire && <span className="ml-1 text-ccjp-rouge">*</span>}
      </label>
      {aide && <p className="mt-0.5 text-xs text-ccjp-marine/60">{aide}</p>}
      <div className="mt-1.5">{children}</div>
      {erreur && (
        <p className="mt-1 text-xs font-semibold text-ccjp-rouge">{erreur}</p>
      )}
    </div>
  );
}

const CLASS_CHAMP =
  "w-full rounded-lg border border-ccjp-marine/20 bg-white px-3 py-2 text-sm text-ccjp-marine shadow-sm transition-colors focus:border-ccjp-vert focus:outline-none focus:ring-2 focus:ring-ccjp-vert/30";

/* ------------------------------------------------------------------ */
/* Formulaire                                                           */
/* ------------------------------------------------------------------ */

export function FormulaireEvenement({ valeurs }: FormulaireEvenementProps) {
  // `useFormState` impose la signature `(étatPrécédent, formData) => état`.
  // Les actions métier ne prennent que `formData` (et un id pour la
  // modification) : on les adapte ici.
  const creerAvecEtat = (_etatPrecedent: ResultatAction, formData: FormData) =>
    creerEvenement(formData);
  const modifierAvecEtat = (
    _etatPrecedent: ResultatAction,
    formData: FormData,
  ) => modifierEvenement(valeurs!.id, formData);

  const [etat, actionForm] = useFormState(
    valeurs ? modifierAvecEtat : creerAvecEtat,
    {} as ResultatAction,
  );
  const [apercuDates, setApercuDates] = useState(false);

  const champs = etat.champs ?? {};

  return (
    <form action={actionForm} className="space-y-6">
      {/* Rappel de succès */}
      {etat.succes && (
        <div className="rounded-lg border border-ccjp-vert/30 bg-ccjp-vert/10 px-4 py-3 text-sm font-semibold text-ccjp-vert">
          Événement enregistré.
        </div>
      )}

      {/* Erreur générale */}
      {etat.erreur && (
        <div className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/30 bg-ccjp-rouge/10 px-4 py-3 text-sm text-ccjp-rouge">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span className="font-semibold">{etat.erreur}</span>
        </div>
      )}

      {valeurs && <input type="hidden" name="id" value={valeurs.id} />}

      {/* Titre */}
      <Champ label="Titre" obligatoire erreur={champs.titre}>
        <input
          name="titre"
          defaultValue={valeurs?.titre}
          required
          minLength={3}
          maxLength={200}
          className={cn(CLASS_CHAMP, champs.titre && "border-ccjp-rouge")}
          placeholder="Assemblée générale ordinaire"
        />
      </Champ>

      {/* Slug */}
      <Champ
        label="Adresse web (slug)"
        aide="Laisser vide pour la déduire du titre."
        erreur={champs.slug}
      >
        <input
          name="slug"
          defaultValue={valeurs?.slug}
          className={CLASS_CHAMP}
          placeholder="assemblee-generale-ordinaire"
          onChange={(e) => {
            e.target.value = slugify(e.target.value, { lower: true, strict: true });
          }}
        />
      </Champ>

      {/* Dates */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ
          label="Date et heure de début"
          obligatoire
          erreur={champs.date_debut}
        >
          <input
            type="datetime-local"
            name="date_debut"
            defaultValue={isoVersChampDate(valeurs?.date_debut ?? null)}
            required
            className={cn(CLASS_CHAMP, champs.date_debut && "border-ccjp-rouge")}
          />
        </Champ>

        <Champ
          label="Date et heure de fin"
          aide="Optionnel. Laissez vide si l'événement n'a pas de fin précise."
          erreur={champs.date_fin}
        >
          <input
            type="datetime-local"
            name="date_fin"
            defaultValue={isoVersChampDate(valeurs?.date_fin ?? null)}
            className={cn(CLASS_CHAMP, champs.date_fin && "border-ccjp-rouge")}
          />
        </Champ>
      </div>

      {/* Aperçu lisible des dates saisies */}
      <button
        type="button"
        onClick={() => setApercuDates((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ccjp-marine/70 underline-offset-2 hover:text-ccjp-vert hover:underline"
      >
        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
        {apercuDates ? "Masquer l'aperçu des dates" : "Vérifier les dates saisies"}
      </button>
      {apercuDates && (
        <div className="rounded-lg bg-ccjp-creme px-4 py-3 text-xs text-ccjp-marine/80">
          <p>
            Début :{" "}
            <strong>
              {isoVersChampDate(valeurs?.date_debut ?? null) || "—"}
            </strong>
          </p>
          <p>
            Fin : <strong>{isoVersChampDate(valeurs?.date_fin ?? null) || "—"}</strong>
          </p>
          <p className="mt-1 italic">
            Les heures sont interprétées dans le fuseau de votre poste (Afrique de
            l&apos;Ouest, GMT).
          </p>
        </div>
      )}

      {/* Lieu + type */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ label="Lieu" erreur={champs.lieu}>
          <input
            name="lieu"
            defaultValue={valeurs?.lieu}
            className={CLASS_CHAMP}
            placeholder="Salle de réunion de la mairie, Podor"
          />
        </Champ>

        <Champ label="Type d'événement" erreur={champs.type_evenement}>
          <input
            name="type_evenement"
            list="types-evenement"
            defaultValue={valeurs?.type_evenement}
            className={CLASS_CHAMP}
            placeholder="Réunion"
          />
          <datalist id="types-evenement">
            {TYPES_EVENEMENT.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Champ>
      </div>

      {/* Statut */}
      <Champ label="Statut" erreur={champs.statut}>
        <select
          name="statut"
          defaultValue={valeurs?.statut ?? "a_venir"}
          className={CLASS_CHAMP}
        >
          {STATUTS_EVENEMENT.map((s) => (
            <option key={s} value={s}>
              {LIBELLES_STATUT_EVENEMENT[s]}
            </option>
          ))}
        </select>
      </Champ>

      {/* Description */}
      <Champ label="Description" erreur={champs.description}>
        <textarea
          name="description"
          defaultValue={valeurs?.description}
          rows={7}
          className={cn(CLASS_CHAMP, "resize-y font-mono text-xs")}
          placeholder={"<p>Programme de la réunion...</p>"}
        />
        <p className="mt-1 text-xs text-ccjp-marine/55">
          Accepte du HTML simple (&lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;a&gt;).
        </p>
      </Champ>

      {/* Lien d'inscription */}
      <Champ
        label="Lien d'inscription"
        aide="URL d'un formulaire externe, si l'événement en demande une."
        erreur={champs.lien_inscription}
      >
        <input
          name="lien_inscription"
          type="url"
          defaultValue={valeurs?.lien_inscription}
          className={cn(CLASS_CHAMP, champs.lien_inscription && "border-ccjp-rouge")}
          placeholder="https://..."
        />
      </Champ>

      {/* Image */}
      <Champ
        label="Image (URL)"
        aide="Adresse d'une image déjà en ligne. La médiathèque (P4.10) fournira ces adresses."
        erreur={champs.image_url}
      >
        <input
          name="image_url"
          type="url"
          defaultValue={valeurs?.image_url}
          className={CLASS_CHAMP}
          placeholder="https://..."
        />
      </Champ>

      <BoutonEnregistrer />
    </form>
  );
}

/** Bouton d'envoi, désactivé pendant la requête. */
function BoutonEnregistrer() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center gap-3 border-t border-ccjp-marine/10 pt-5">
      <Button type="submit" variante="primaire" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="h-4 w-4" aria-hidden="true" />
        )}
        {pending ? "Enregistrement…" : "Enregistrer l'événement"}
      </Button>
    </div>
  );
}
