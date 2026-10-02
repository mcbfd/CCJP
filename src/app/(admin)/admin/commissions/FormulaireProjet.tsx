"use client";

/**
 * Formulaire de création / modification d'un projet phare (§10.2, P4.7)
 */

import { useFormState, useFormStatus } from "react-dom";
import { useId } from "react";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { creerProjet, modifierProjet, type ResultatAction } from "./actions";
import { LIBELLES_STATUT_PROJET, STATUTS_PROJET, type StatutProjet } from "./constantes";
import type { Database } from "@/lib/types";

type CommissionRow = Database["public"]["Tables"]["commissions"]["Row"];

export interface ValeursInitiales {
  id: string;
  commission_id: string;
  titre: string;
  description: string;
  annee: string;
  statut: StatutProjet;
  ordre: number;
}

export interface FormulaireProjetProps {
  commissions: CommissionRow[];
  /** Commission présélectionnée (quand on vient de sa fiche). */
  commissionParDefaut?: string;
  valeurs?: ValeursInitiales;
}

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
      {erreur && <p className="mt-1 text-xs font-semibold text-ccjp-rouge">{erreur}</p>}
    </div>
  );
}

const CLASS_CHAMP =
  "w-full rounded-lg border border-ccjp-marine/20 bg-white px-3 py-2 text-sm text-ccjp-marine shadow-sm transition-colors focus:border-ccjp-vert focus:outline-none focus:ring-2 focus:ring-ccjp-vert/30";

export function FormulaireProjet({
  commissions,
  commissionParDefaut,
  valeurs,
}: FormulaireProjetProps) {
  const creerAvecEtat = (_e: ResultatAction, formData: FormData) =>
    creerProjet(formData);
  const modifierAvecEtat = (_e: ResultatAction, formData: FormData) =>
    modifierProjet(valeurs!.id, formData);

  const [etat, actionForm] = useFormState(
    valeurs ? modifierAvecEtat : creerAvecEtat,
    {} as ResultatAction,
  );

  const champs = etat.champs ?? {};

  return (
    <form action={actionForm} className="space-y-6">
      {etat.succes && (
        <div className="rounded-lg border border-ccjp-vert/30 bg-ccjp-vert/10 px-4 py-3 text-sm font-semibold text-ccjp-vert">
          Projet enregistré.
        </div>
      )}

      {etat.erreur && (
        <div className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/30 bg-ccjp-rouge/10 px-4 py-3 text-sm text-ccjp-rouge">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span className="font-semibold">{etat.erreur}</span>
        </div>
      )}

      {valeurs && <input type="hidden" name="id" value={valeurs.id} />}

      <Champ label="Commission" obligatoire erreur={champs.commission_id}>
        <select
          name="commission_id"
          defaultValue={valeurs?.commission_id ?? commissionParDefaut ?? ""}
          required
          className={cn(CLASS_CHAMP, champs.commission_id && "border-ccjp-rouge")}
        >
          <option value="">— Choisir une commission —</option>
          {commissions.map((c) => (
            <option key={c.id} value={c.id}>
              {String(c.numero).padStart(2, "0")}. {c.nom}
            </option>
          ))}
        </select>
      </Champ>

      <Champ label="Titre" obligatoire erreur={champs.titre}>
        <input
          name="titre"
          defaultValue={valeurs?.titre}
          required
          minLength={3}
          className={cn(CLASS_CHAMP, champs.titre && "border-ccjp-rouge")}
        />
      </Champ>

      <div className="grid gap-5 sm:grid-cols-3">
        <Champ label="Année" aide="Optionnel." erreur={champs.annee}>
          <input
            name="annee"
            type="number"
            min={2020}
            max={2100}
            defaultValue={valeurs?.annee ?? ""}
            className={CLASS_CHAMP}
            placeholder="2026"
          />
        </Champ>

        <Champ label="Statut" erreur={champs.statut}>
          <select
            name="statut"
            defaultValue={valeurs?.statut ?? "planifie"}
            className={CLASS_CHAMP}
          >
            {STATUTS_PROJET.map((s) => (
              <option key={s} value={s}>
                {LIBELLES_STATUT_PROJET[s]}
              </option>
            ))}
          </select>
        </Champ>

        <Champ label="Ordre" erreur={champs.ordre}>
          <input
            name="ordre"
            type="number"
            min={0}
            defaultValue={valeurs?.ordre ?? 0}
            className={CLASS_CHAMP}
          />
        </Champ>
      </div>

      <Champ label="Description" erreur={champs.description}>
        <textarea
          name="description"
          defaultValue={valeurs?.description}
          rows={6}
          className={cn(CLASS_CHAMP, "resize-y")}
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
        {pending ? "Enregistrement…" : "Enregistrer le projet"}
      </Button>
    </div>
  );
}
