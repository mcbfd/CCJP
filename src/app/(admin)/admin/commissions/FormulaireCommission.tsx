"use client";

/**
 * Formulaire de création / modification d'une commission (§10.2, P4.7)
 */

import { useFormState, useFormStatus } from "react-dom";
import { useId } from "react";
import { Save, AlertCircle, Loader2 } from "lucide-react";
import slugify from "slugify";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { creerCommission, modifierCommission, type ResultatAction } from "./actions";
import { COULEURS_COMMISSION } from "./constantes";

export interface ValeursInitiales {
  id: string;
  numero: number;
  nom: string;
  slug: string;
  description: string;
  vision: string;
  axes_strategiques: string;
  couleur: string;
  icone: string;
  ordre: number;
}

export interface FormulaireCommissionProps {
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

export function FormulaireCommission({ valeurs }: FormulaireCommissionProps) {
  const creerAvecEtat = (_e: ResultatAction, formData: FormData) =>
    creerCommission(formData);
  const modifierAvecEtat = (_e: ResultatAction, formData: FormData) =>
    modifierCommission(valeurs!.id, formData);

  const [etat, actionForm] = useFormState(
    valeurs ? modifierAvecEtat : creerAvecEtat,
    {} as ResultatAction,
  );

  const champs = etat.champs ?? {};

  return (
    <form action={actionForm} className="space-y-6">
      {etat.succes && (
        <div className="rounded-lg border border-ccjp-vert/30 bg-ccjp-vert/10 px-4 py-3 text-sm font-semibold text-ccjp-vert">
          Commission enregistrée.
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
        <Champ
          label="Numéro"
          obligatoire
          aide="Entre 1 et 14, conformément au cahier des charges."
          erreur={champs.numero}
        >
          <input
            name="numero"
            type="number"
            min={1}
            max={14}
            defaultValue={valeurs?.numero ?? ""}
            required
            className={cn(CLASS_CHAMP, champs.numero && "border-ccjp-rouge")}
          />
        </Champ>

        <Champ label="Ordre d'affichage" erreur={champs.ordre}>
          <input
            name="ordre"
            type="number"
            defaultValue={valeurs?.ordre ?? 0}
            className={CLASS_CHAMP}
          />
        </Champ>
      </div>

      <Champ label="Nom" obligatoire erreur={champs.nom}>
        <input
          name="nom"
          defaultValue={valeurs?.nom}
          required
          minLength={3}
          className={cn(CLASS_CHAMP, champs.nom && "border-ccjp-rouge")}
        />
      </Champ>

      <Champ
        label="Adresse web (slug)"
        aide="Laisser vide pour la déduire du nom. Attention : changer le slug d'une commission existante casse les liens déjà publiés."
        erreur={champs.slug}
      >
        <input
          name="slug"
          defaultValue={valeurs?.slug}
          className={CLASS_CHAMP}
          onChange={(e) => {
            e.target.value = slugify(e.target.value, { lower: true, strict: true });
          }}
        />
      </Champ>

      <Champ label="Description" erreur={champs.description}>
        <textarea
          name="description"
          defaultValue={valeurs?.description}
          rows={4}
          className={cn(CLASS_CHAMP, "resize-y")}
        />
      </Champ>

      <Champ label="Vision" erreur={champs.vision}>
        <textarea
          name="vision"
          defaultValue={valeurs?.vision}
          rows={3}
          className={cn(CLASS_CHAMP, "resize-y")}
          placeholder="La vision à long terme portée par cette commission."
        />
      </Champ>

      <Champ
        label="Axes stratégiques"
        aide="Un axe par ligne. Maximum 8."
        erreur={champs.axes_strategiques}
      >
        <textarea
          name="axes_strategiques"
          defaultValue={valeurs?.axes_strategiques}
          rows={5}
          className={cn(CLASS_CHAMP, "resize-y font-mono text-xs")}
          placeholder={"Éducation à la citoyenneté\nParticipation des jeunes aux instances"}
        />
      </Champ>

      <div className="grid gap-5 sm:grid-cols-2">
        <Champ
          label="Couleur"
          aide="Sert à identifier la commission sur le site."
          erreur={champs.couleur}
        >
          <div className="flex items-center gap-3">
            <input
              name="couleur"
              type="color"
              defaultValue={valeurs?.couleur ?? "#1B5E20"}
              className="h-10 w-16 cursor-pointer rounded-lg border border-ccjp-marine/20 bg-white"
            />
            <input
              name="couleur_texte"
              type="text"
              defaultValue={valeurs?.couleur ?? "#1B5E20"}
              className={cn(CLASS_CHAMP, "font-mono")}
              onChange={(e) => {
                // Maintient le sélecteur de couleur synchronisé avec le texte.
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                  const frere = e.target.form?.querySelector<HTMLInputElement>(
                    'input[name="couleur"]',
                  );
                  if (frere) frere.value = e.target.value;
                }
              }}
            />
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {COULEURS_COMMISSION.map((c) => (
              <li key={c.valeur}>
                <button
                  type="button"
                  title={c.nom}
                  onClick={(e) => {
                    const form = e.currentTarget.form;
                    if (!form) return;
                    const couleur = form.querySelector<HTMLInputElement>('input[name="couleur"]');
                    const texte = form.querySelector<HTMLInputElement>('input[name="couleur_texte"]');
                    if (couleur) couleur.value = c.valeur;
                    if (texte) texte.value = c.valeur;
                  }}
                  className="h-6 w-6 rounded border border-ccjp-marine/20"
                  style={{ backgroundColor: c.valeur }}
                >
                  <span className="sr-only">{c.nom}</span>
                </button>
              </li>
            ))}
          </ul>
        </Champ>

        <Champ
          label="Icône"
          aide="Nom d'une icône Lucide, ex. « GraduationCap ». Laisser vide pour l'icône par défaut."
          erreur={champs.icone}
        >
          <input
            name="icone"
            defaultValue={valeurs?.icone}
            className={CLASS_CHAMP}
            placeholder="GraduationCap"
          />
        </Champ>
      </div>

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
        {pending ? "Enregistrement…" : "Enregistrer la commission"}
      </Button>
    </div>
  );
}
