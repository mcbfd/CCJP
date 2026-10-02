"use client";

/**
 * Formulaire de création / modification d'un membre du bureau (§10.2, P4.6)
 */

import { useFormState, useFormStatus } from "react-dom";
import { useId } from "react";
import { Save, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { creerMembre, modifierMembre, type ResultatAction } from "./actions";
import type { Database } from "@/lib/types";

type CommissionRow = Database["public"]["Tables"]["commissions"]["Row"];

export interface ValeursInitiales {
  id: string;
  prenom: string;
  nom: string;
  poste: string;
  commission_id: string;
  biographie: string;
  photo_url: string;
  email: string;
  telephone: string;
  ordre: number;
}

export interface FormulaireMembreProps {
  commissions: CommissionRow[];
  valeurs?: ValeursInitiales;
}

/* ------------------------------------------------------------------ */
/* Petit composant de champ                                            */
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
/* Formulaire                                                          */
/* ------------------------------------------------------------------ */

export function FormulaireMembre({
  commissions,
  valeurs,
}: FormulaireMembreProps) {
  const creerAvecEtat = (_etatPrecedent: ResultatAction, formData: FormData) =>
    creerMembre(formData);
  const modifierAvecEtat = (
    _etatPrecedent: ResultatAction,
    formData: FormData,
  ) => modifierMembre(valeurs!.id, formData);

  const [etat, actionForm] = useFormState(
    valeurs ? modifierAvecEtat : creerAvecEtat,
    {} as ResultatAction,
  );

  const champs = etat.champs ?? {};

  return (
    <form action={actionForm} className="space-y-6">
      {etat.succes && (
        <div className="rounded-lg border border-ccjp-vert/30 bg-ccjp-vert/10 px-4 py-3 text-sm font-semibold text-ccjp-vert">
          Membre enregistré.
        </div>
      )}

      {etat.erreur && (
        <div className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/30 bg-ccjp-rouge/10 px-4 py-3 text-sm text-ccjp-rouge">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span className="font-semibold">{etat.erreur}</span>
        </div>
      )}

      {valeurs && <input type="hidden" name="id" value={valeurs.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Champ label="Prénom" obligatoire erreur={champs.prenom}>
          <input
            name="prenom"
            defaultValue={valeurs?.prenom}
            required
            minLength={2}
            className={cn(CLASS_CHAMP, champs.prenom && "border-ccjp-rouge")}
          />
        </Champ>

        <Champ label="Nom" obligatoire erreur={champs.nom}>
          <input
            name="nom"
            defaultValue={valeurs?.nom}
            required
            minLength={2}
            className={cn(CLASS_CHAMP, champs.nom && "border-ccjp-rouge")}
          />
        </Champ>
      </div>

      <Champ
        label="Poste"
        obligatoire
        aide="Ex. « Président », « Secrétaire exécutif », « Chargé de la communication »."
        erreur={champs.poste}
      >
        <input
          name="poste"
          defaultValue={valeurs?.poste}
          required
          minLength={2}
          className={cn(CLASS_CHAMP, champs.poste && "border-ccjp-rouge")}
        />
      </Champ>

      <Champ
        label="Commission de rattachement"
        aide="Optionnel. Utilisez-le si le membre préside une commission."
        erreur={champs.commission_id}
      >
        <div className="relative">
          <select
            name="commission_id"
            defaultValue={valeurs?.commission_id ?? ""}
            className={cn(CLASS_CHAMP, "appearance-none pr-10")}
          >
            <option value="">— Aucune —</option>
            {commissions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.numero}. {c.nom}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ccjp-marine/50"
            aria-hidden="true"
          />
        </div>
      </Champ>

      <div className="grid gap-5 sm:grid-cols-2">
        <Champ label="E-mail" erreur={champs.email}>
          <input
            name="email"
            type="email"
            defaultValue={valeurs?.email}
            className={cn(CLASS_CHAMP, champs.email && "border-ccjp-rouge")}
            placeholder="prenom.nom@ccjp-podor.sn"
          />
        </Champ>

        <Champ label="Téléphone" erreur={champs.telephone}>
          <input
            name="telephone"
            type="tel"
            defaultValue={valeurs?.telephone}
            className={CLASS_CHAMP}
            placeholder="+221 …"
          />
        </Champ>
      </div>

      <Champ
        label="Photo (URL)"
        aide="Adresse d'une image déjà en ligne. La médiathèque (P4.10) fournira ces adresses."
        erreur={champs.photo_url}
      >
        <input
          name="photo_url"
          type="url"
          defaultValue={valeurs?.photo_url}
          className={CLASS_CHAMP}
          placeholder="https://..."
        />
      </Champ>

      <Champ
        label="Ordre d'affichage"
        aide="Plus le nombre est petit, plus le membre apparaît haut sur la page publique. Vous pouvez aussi utiliser le bouton « Monter » dans la liste."
        erreur={champs.ordre}
      >
        <input
          name="ordre"
          type="number"
          min={0}
          step={1}
          defaultValue={valeurs?.ordre ?? 0}
          className={CLASS_CHAMP}
        />
      </Champ>

      <Champ label="Biographie" erreur={champs.biographie}>
        <textarea
          name="biographie"
          defaultValue={valeurs?.biographie}
          rows={6}
          className={cn(CLASS_CHAMP, "resize-y")}
          placeholder="Parcours, engagements, motivations…"
        />
      </Champ>

      <BoutonEnregistrer />
    </form>
  );
}

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
        {pending ? "Enregistrement…" : "Enregistrer le membre"}
      </Button>
    </div>
  );
}
