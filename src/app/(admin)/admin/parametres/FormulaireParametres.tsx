"use client";

/**
 * Formulaire des paramètres du site (§10.2, P4.11)
 */

import { useFormState, useFormStatus } from "react-dom";
import { useId } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { enregistrerParametres, type ResultatAction } from "./actions";
import { champsParGroupe, type ChampParametre, type TypeChamp } from "./constantes";

export interface FormulaireParametresProps {
  /** Valeurs actuelles, indexées par clé. */
  valeurs: Record<string, string>;
}

const CLASS_CHAMP =
  "w-full rounded-lg border border-ccjp-marine/20 bg-white px-3 py-2 text-sm text-ccjp-marine shadow-sm transition-colors focus:border-ccjp-vert focus:outline-none focus:ring-2 focus:ring-ccjp-vert/30";

function ChampSaisie({
  champ,
  valeur,
  erreur,
}: {
  champ: ChampParametre;
  valeur: string;
  erreur?: string;
}) {
  const id = useId();
  const commun = {
    id,
    name: champ.cle,
    defaultValue: valeur,
    required: champ.obligatoire,
    "aria-invalid": erreur ? true : undefined,
    className: cn(CLASS_CHAMP, erreur && "border-ccjp-rouge"),
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ccjp-marine">
        {champ.label}
        {champ.obligatoire && <span className="ml-1 text-ccjp-rouge">*</span>}
      </label>
      {champ.aide && <p className="mt-0.5 text-xs text-ccjp-marine/60">{champ.aide}</p>}

      <div className="mt-1.5">
        {champ.type === "zone" ? (
          <textarea {...commun} rows={champ.lignes ?? 3} className={cn(commun.className, "resize-y")} />
        ) : (
          <input
            {...commun}
            type={TYPE_HTML[champ.type]}
            inputMode={champ.type === "email" ? "email" : undefined}
            maxLength={200}
          />
        )}
      </div>

      {erreur && <p className="mt-1 text-xs font-semibold text-ccjp-rouge">{erreur}</p>}
    </div>
  );
}

/** Correspondance type métier → attribut `type` d'un `<input>`. */
const TYPE_HTML: Record<Exclude<TypeChamp, "zone">, string> = {
  texte: "text",
  email: "email",
  url: "url",
};

export function FormulaireParametres({ valeurs }: FormulaireParametresProps) {
  // `useFormState` impose la signature `(étatPrécédent, formData) => état`.
  const enregistrerAvecEtat = (_etatPrecedent: ResultatAction, formData: FormData) =>
    enregistrerParametres(formData);

  const [etat, actionForm] = useFormState(enregistrerAvecEtat, {} as ResultatAction);
  const champs = etat.champs ?? {};
  const sections = champsParGroupe();

  return (
    <form action={actionForm} className="space-y-8">
      {etat.succes && (
        <div className="rounded-lg border border-ccjp-vert/30 bg-ccjp-vert/10 px-4 py-3 text-sm font-semibold text-ccjp-vert">
          Paramètres enregistrés. Les modifications sont visibles sur le site
          public dans la minute.
        </div>
      )}

      {etat.erreur && (
        <div className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/30 bg-ccjp-rouge/10 px-4 py-3 text-sm text-ccjp-rouge">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span className="font-semibold">{etat.erreur}</span>
        </div>
      )}

      {sections.map((section) => (
        <fieldset key={section.groupe} className="space-y-5">
          <legend className="font-display text-lg font-bold text-ccjp-marine">
            {section.groupe}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            {section.champs.map((champ) => (
              <div
                key={champ.cle}
                className={champ.type === "zone" ? "sm:col-span-2" : undefined}
              >
                <ChampSaisie
                  champ={champ}
                  valeur={valeurs[champ.cle] ?? ""}
                  erreur={champs[champ.cle]}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

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
        {pending ? "Enregistrement…" : "Enregistrer les paramètres"}
      </Button>
      <p className="text-xs text-ccjp-marine/60">
        Le cache public est invalidé automatiquement après chaque
        enregistrement.
      </p>
    </div>
  );
}
