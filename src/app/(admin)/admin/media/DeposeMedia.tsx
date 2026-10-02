"use client";

/**
 * DeposeMedia — formulaire de dépôt d'un fichier (§10.2, P4.10)
 *
 * La validation côté client double celle de la Server Action : elle évite
 * d'envoyer 20 Mo pour les voir refuser ensuite. Ce n'est pas une mesure de
 * sécurité — c'est du confort.
 */

import { useFormState, useFormStatus } from "react-dom";
import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { deposerMedia, type ResultatAction } from "./actions";
import { BUCKETS, bucketParId, extensionsAcceptees } from "./constantes";

export function DeposeMedia() {
  // `useFormState` impose la signature `(étatPrécédent, formData) => état` ;
  // l'action métier ne prend que `formData`, on l'adapte ici.
  const deposerAvecEtat = (_etatPrecedent: ResultatAction, formData: FormData) =>
    deposerMedia(formData);

  const [etat, actionForm] = useFormState(deposerAvecEtat, {} as ResultatAction);
  const [bucketChoisi, setBucketChoisi] = useState(BUCKETS[0].id);
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const champFichier = useRef<HTMLInputElement>(null);
  const idBucket = useId();

  const bucket = bucketParId(bucketChoisi) ?? BUCKETS[0];
  const limiteMo = Math.round(bucket.tailleMax / 1024 / 1024);

  /** Validation immédiate, avant tout envoi réseau. */
  function verifierFichier(fichier: File | null) {
    setErreurFichier(null);
    if (!fichier) return;
    if (fichier.size > bucket.tailleMax) {
      setErreurFichier(
        `Fichier trop volumineux : ${(fichier.size / 1024 / 1024).toFixed(1)} Mo. Limite : ${limiteMo} Mo.`,
      );
      if (champFichier.current) champFichier.current.value = "";
      return;
    }
    if (fichier.type && !bucket.types.includes(fichier.type)) {
      setErreurFichier(
        `Format refusé ici. Formats acceptés : ${extensionsAcceptees(bucket)}.`,
      );
      if (champFichier.current) champFichier.current.value = "";
    }
  }

  return (
    <form action={actionForm} className="space-y-4">
      {etat.succes && (
        <div className="flex items-start gap-2 rounded-lg border border-ccjp-vert/30 bg-ccjp-vert/10 px-4 py-3 text-sm text-ccjp-vert">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span className="font-semibold">
            Fichier déposé. Son adresse est visible dans la liste ci-dessous.
          </span>
        </div>
      )}

      {etat.erreur && (
        <div className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/30 bg-ccjp-rouge/10 px-4 py-3 text-sm text-ccjp-rouge">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span className="font-semibold">{etat.erreur}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={idBucket}
            className="block text-sm font-semibold text-ccjp-marine"
          >
            Destination
          </label>
          <select
            id={idBucket}
            name="bucket"
            value={bucketChoisi}
            onChange={(e) => {
              setBucketChoisi(e.target.value);
              setErreurFichier(null);
            }}
            className="mt-1.5 w-full rounded-lg border border-ccjp-marine/20 bg-white px-3 py-2 text-sm text-ccjp-marine shadow-sm focus:border-ccjp-vert focus:outline-none focus:ring-2 focus:ring-ccjp-vert/30"
          >
            {BUCKETS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.libelle}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-ccjp-marine/60">
            {extensionsAcceptees(bucket)} · {limiteMo} Mo maximum
          </p>
        </div>

        <div>
          <label
            htmlFor={`${idBucket}-fichier`}
            className="block text-sm font-semibold text-ccjp-marine"
          >
            Fichier
          </label>
          <input
            ref={champFichier}
            id={`${idBucket}-fichier`}
            name="fichier"
            type="file"
            accept={bucket.types.join(",")}
            onChange={(e) => verifierFichier(e.target.files?.[0] ?? null)}
            className={cn(
              "mt-1.5 w-full cursor-pointer rounded-lg border border-ccjp-marine/20 bg-white px-3 py-2 text-sm text-ccjp-marine file:mr-3 file:rounded file:border-0 file:bg-ccjp-creme file:px-3 file:py-1 file:text-sm file:font-semibold file:text-ccjp-marine",
              erreurFichier && "border-ccjp-rouge",
            )}
          />
          {(erreurFichier || etat.champs?.fichier) && (
            <p className="mt-1 text-xs font-semibold text-ccjp-rouge">
              {erreurFichier ?? etat.champs?.fichier}
            </p>
          )}
        </div>
      </div>

      <BoutonDepot desactive={erreurFichier !== null} />
    </form>
  );
}

function BoutonDepot({ desactive }: { desactive: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variante="primaire" disabled={pending || desactive}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Upload className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Dépôt en cours…" : "Déposer le fichier"}
    </Button>
  );
}
