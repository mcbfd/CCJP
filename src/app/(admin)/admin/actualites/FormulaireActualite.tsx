"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useId, useRef, useState } from "react";
import {
  Save,
  AlertCircle,
  Loader2,
  Bold,
  Italic,
  Heading2,
  List,
  Link2,
  Eye,
  Code,
} from "lucide-react";
import slugify from "slugify";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { creerActualite, modifierActualite, type ResultatAction } from "./actions";
import type { Database } from "@/lib/types";

/**
 * Formulaire de création / modification d'un article (§10.2, P4.4)
 *
 * L'envoi est délégué à une Server Action (`actions.ts`, exclusivement
 * serveur). Ce composant gère l'affichage : état de succès, erreurs par
 * champ, aperçu du HTML.
 *
 * Éditeur de contenu : la charte impose un champ HTML. Plutôt que d'ajouter
 * une dépendance lourde de traitement de texte, on propose une barre
 * d'outils qui insère les balises autour de la sélection, doublée d'un
 * aperçu réel du rendu. Le champ reste du HTML brut, donc compatible avec ce
 * que stocke la base (`contenu text`).
 */

type CommissionRow = Database["public"]["Tables"]["commissions"]["Row"];

export interface ValeursInitiales {
  id?: string;
  titre: string;
  slug: string;
  extrait: string;
  contenu: string;
  image_url: string;
  commission_id: string;
  statut: "brouillon" | "publie";
  epingle: boolean;
  tags: string; // chaîne séparée par des virgules
  date_publication: string; // format yyyy-mm-dd pour <input type="date">
}

export interface FormulaireActualiteProps {
  commissions: CommissionRow[];
  valeurs?: ValeursInitiales;
}

const VIDE: ValeursInitiales = {
  titre: "",
  slug: "",
  extrait: "",
  contenu: "",
  image_url: "",
  commission_id: "",
  statut: "brouillon",
  epingle: false,
  tags: "",
  date_publication: "",
};

const ETAT_INITIAL: ResultatAction = {};

/* ------------------------------------------------------------------ */
/* Barre d'outils de l'éditeur                                         */
/* ------------------------------------------------------------------ */

/**
 * Insère une balise autour de la sélection courante dans le textarea.
 * Si rien n'est sélectionné, insère un exemple de balise.
 */
function appliquerBalise(
  textarea: HTMLTextAreaElement,
  balise: string,
  mode: "entoure" | "ligne" | "lien",
) {
  const debut = textarea.selectionStart;
  const fin = textarea.selectionEnd;
  const texte = textarea.value;
  const selection = texte.slice(debut, fin);

  let remplacement: string;
  if (mode === "lien") {
    const url = window.prompt("Adresse du lien :", "https://");
    if (!url) return;
    remplacement = `<a href="${url}">${selection || "texte du lien"}</a>`;
  } else if (mode === "ligne") {
    remplacement = selection
      ? selection
          .split("\n")
          .map((l) => `<${balise}>${l}</${balise}>`)
          .join("")
      : `<${balise}>Votre texte</${balise}>`;
  } else {
    remplacement = `<${balise}>${selection || "texte"}</${balise}>`;
  }

  textarea.setRangeText(remplacement, debut, fin, "end");
  // Préviens React que la valeur a changé.
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

/* ------------------------------------------------------------------ */
/* Champs                                                             */
/* ------------------------------------------------------------------ */

interface ChampProps {
  nom: string;
  label: string;
  valeur: string;
  required?: boolean;
  erreur?: string;
  aide?: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}

function Champ({
  nom,
  label,
  valeur,
  required = false,
  erreur,
  aide,
  type = "text",
  placeholder,
  maxLength,
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
        {aide && <span className="ml-2 font-normal text-ccjp-marine/50">{aide}</span>}
      </label>
      <input
        id={id}
        name={nom}
        type={type}
        defaultValue={valeur}
        required={required}
        maxLength={maxLength}
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

function BoutonEnregistrer({ creation }: { creation: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" variante="primaire" taille="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Enregistrement…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            {creation ? "Créer l'article" : "Enregistrer"}
          </>
        )}
      </Button>
      <ButtonLinkAnnuler />
    </div>
  );
}

function ButtonLinkAnnuler() {
  return (
    <a
      href="/admin/actualites"
      className="inline-flex items-center gap-2 rounded-lg border-2 border-ccjp-marine/25 px-5 py-2.5 font-semibold text-ccjp-marine transition-colors hover:border-ccjp-marine/50"
    >
      Annuler
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Formulaire                                                         */
/* ------------------------------------------------------------------ */

export function FormulaireActualite({
  commissions,
  valeurs,
}: FormulaireActualiteProps) {
  const creation = !valeurs?.id;
  const v = valeurs ?? VIDE;

  // `useFormState` impose la signature `(étatPrécédent, formData) => état`.
  // Les actions métier ne prennent que `formData` : on les adapte ici.
  const creerAvecEtat = (_etatPrecedent: ResultatAction, formData: FormData) =>
    creerActualite(formData);
  const modifierAvecEtat = (
    _etatPrecedent: ResultatAction,
    formData: FormData,
  ) => modifierActualite(v.id as string, formData);

  const [etat, dispatch] = useFormState(
    creation ? creerAvecEtat : modifierAvecEtat,
    ETAT_INITIAL,
  );

  const contenuRef = useRef<HTMLTextAreaElement>(null);
  const [aperçu, setAperçu] = useState(false);
  const [contenuAperçu, setContenuAperçu] = useState(v.contenu);

  const idTitre = useId();
  const idSlug = useId();
  const idExtrait = useId();
  const idContenu = useId();
  const idCommission = useId();
  const idStatut = useId();

  if (etat.succes) {
    return (
      <div
        role="status"
        className="rounded-card border border-ccjp-vert/25 bg-ccjp-vert/5 p-8 text-center"
      >
        <p className="mb-2 font-display text-xl font-extrabold text-ccjp-marine">
          {creation ? "Article créé" : "Article enregistré"}
        </p>
        <p className="mb-5 text-ccjp-marine/75">
          {creation
            ? "L'article est enregistré. Vous pouvez encore le publier ou le dépublier depuis la liste."
            : "Les modifications sont en ligne sur le site public."}
        </p>
        <a
          href="/admin/actualites"
          className="font-semibold text-ccjp-vert underline hover:text-ccjp-vert/80"
        >
          Retour à la liste des actualités
        </a>
      </div>
    );
  }

  return (
    <form action={dispatch} className="space-y-6">
      {etat.erreur && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-ccjp-rouge/30 bg-ccjp-rouge/5 p-3 text-sm text-ccjp-rouge"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {etat.erreur}
        </p>
      )}

      {/* Titre + slug */}
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div>
          <label
            htmlFor={idTitre}
            className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
          >
            Titre
            <span className="ml-1 text-ccjp-rouge" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id={idTitre}
            name="titre"
            defaultValue={v.titre}
            required
            maxLength={200}
            placeholder="Titre de l'article"
            aria-invalid={etat.champs?.titre ? true : undefined}
            className={cn(
              "w-full rounded-lg border bg-white px-3.5 py-2.5 text-ccjp-marine",
              "placeholder:text-ccjp-marine/40",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1",
              etat.champs?.titre
                ? "border-ccjp-rouge"
                : "border-ccjp-marine/20",
            )}
          />
          {etat.champs?.titre && (
            <p role="alert" className="mt-1.5 text-sm text-ccjp-rouge">
              {etat.champs.titre}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={idSlug}
            className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
          >
            Adresse (slug)
            <span className="ml-2 font-normal text-ccjp-marine/50">
              (facultatif)
            </span>
          </label>
          <input
            id={idSlug}
            name="slug"
            defaultValue={v.slug}
            placeholder={slugify(v.titre || "mon-article")}
            className="w-full rounded-lg border border-ccjp-marine/20 bg-white px-3.5 py-2.5 text-ccjp-marine placeholder:text-ccjp-marine/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1"
          />
          <p className="mt-1 text-xs text-ccjp-marine/55">
            Déduit du titre si laissé vide. Doit être unique.
          </p>
        </div>
      </div>

      {/* Extrait */}
      <div>
        <label
          htmlFor={idExtrait}
          className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
        >
          Extrait
          <span className="ml-2 font-normal text-ccjp-marine/50">
            (facultatif)
          </span>
        </label>
        <textarea
          id={idExtrait}
          name="extrait"
          defaultValue={v.extrait}
          rows={2}
          maxLength={500}
          placeholder="Résumé affiché dans les listes et les résultats de recherche."
          className="w-full resize-y rounded-lg border border-ccjp-marine/20 bg-white px-3.5 py-2.5 text-ccjp-marine placeholder:text-ccjp-marine/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1"
        />
      </div>

      {/* Contenu + barre d'outils + aperçu */}
      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <label
            htmlFor={idContenu}
            className="block text-sm font-semibold text-ccjp-marine"
          >
            Contenu
            <span className="ml-2 font-normal text-ccjp-marine/50">
              (HTML)
            </span>
          </label>
          <button
            type="button"
            onClick={() => setAperçu((a) => !a)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ccjp-marine/20 px-3 py-1 text-xs font-semibold text-ccjp-marine transition-colors hover:border-ccjp-vert hover:text-ccjp-vert"
          >
            {aperçu ? (
              <>
                <Code className="h-3.5 w-3.5" aria-hidden="true" />
                Éditer
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Aperçu
              </>
            )}
          </button>
        </div>

        {/* Barre d'outils */}
        <div
          className="flex flex-wrap gap-1 rounded-t-lg border border-b-0 border-ccjp-marine/20 bg-ccjp-creme p-1.5"
          role="toolbar"
          aria-label="Outils de mise en forme"
        >
          {[
            {
              label: "Gras",
              icone: <Bold className="h-4 w-4" />,
              balise: "strong",
              mode: "entoure" as const,
            },
            {
              label: "Italique",
              icone: <Italic className="h-4 w-4" />,
              balise: "em",
              mode: "entoure" as const,
            },
            {
              label: "Titre de section",
              icone: <Heading2 className="h-4 w-4" />,
              balise: "h2",
              mode: "ligne" as const,
            },
            {
              label: "Paragraphe",
              icone: <span className="text-xs font-bold">P</span>,
              balise: "p",
              mode: "ligne" as const,
            },
            {
              label: "Liste à puces",
              icone: <List className="h-4 w-4" />,
              balise: "li",
              mode: "ligne" as const,
            },
            {
              label: "Lien",
              icone: <Link2 className="h-4 w-4" />,
              balise: "a",
              mode: "lien" as const,
            },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              title={o.label}
              aria-label={o.label}
              onClick={() =>
                contenuRef.current &&
                appliquerBalise(contenuRef.current, o.balise, o.mode)
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded text-ccjp-marine transition-colors hover:bg-white hover:text-ccjp-vert focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ccjp-or"
            >
              {o.icone}
            </button>
          ))}
        </div>

        {aperçu ? (
          <div
            className="prose-ccjp min-h-[14rem] rounded-lg rounded-tl-none border border-ccjp-marine/20 bg-white px-3.5 py-2.5"
            // Aperçu du HTML saisi par un administrateur habilité, pas d'un
            // visiteur anonyme.
            dangerouslySetInnerHTML={{ __html: contenuAperçu }}
          />
        ) : (
          <textarea
            id={idContenu}
            ref={contenuRef}
            name="contenu"
            defaultValue={v.contenu}
            rows={14}
            onChange={(e) => setContenuAperçu(e.target.value)}
            placeholder="<p>Le corps de votre article…</p>"
            className="w-full resize-y rounded-lg rounded-tl-none border border-ccjp-marine/20 bg-white px-3.5 py-2.5 font-mono text-sm text-ccjp-marine placeholder:text-ccjp-marine/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1"
          />
        )}
      </div>

      {/* Image + commission */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Champ
          nom="image_url"
          label="Image de une"
          valeur={v.image_url}
          type="url"
          placeholder="https://…"
          aide="(URL)"
        />

        <div>
          <label
            htmlFor={idCommission}
            className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
          >
            Commission liée
            <span className="ml-2 font-normal text-ccjp-marine/50">
              (facultatif)
            </span>
          </label>
          <select
            id={idCommission}
            name="commission_id"
            defaultValue={v.commission_id}
            className="w-full rounded-lg border border-ccjp-marine/20 bg-white px-3.5 py-2.5 text-ccjp-marine focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1"
          >
            <option value="">Aucune</option>
            {commissions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.numero}. {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags + date */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Champ
          nom="tags"
          label="Mots-clés"
          valeur={v.tags}
          placeholder="jeunesse, podor, forum"
          aide="(séparés par des virgules)"
        />
        <Champ
          nom="date_publication"
          label="Date de publication"
          valeur={v.date_publication}
          type="date"
          aide="(facultatif)"
        />
      </div>

      {/* Statut + épingle */}
      <div className="flex flex-wrap items-center gap-6 rounded-lg border border-ccjp-marine/10 bg-ccjp-creme p-4">
        <div>
          <label
            htmlFor={idStatut}
            className="mb-1.5 block text-sm font-semibold text-ccjp-marine"
          >
            Statut
          </label>
          <select
            id={idStatut}
            name="statut"
            defaultValue={v.statut}
            className="rounded-lg border border-ccjp-marine/20 bg-white px-3.5 py-2.5 text-ccjp-marine focus:outline-none focus-visible:ring-2 focus-visible:ring-ccjp-or focus-visible:ring-offset-1"
          >
            <option value="brouillon">Brouillon (invisible)</option>
            <option value="publie">Publié (visible sur le site)</option>
          </select>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-semibold text-ccjp-marine">
          <input
            type="checkbox"
            name="epingle"
            defaultChecked={v.epingle}
            className="h-4 w-4 rounded border-ccjp-marine/30 text-ccjp-vert focus:ring-ccjp-or"
          />
          Épingler en tête de liste
        </label>
      </div>

      <BoutonEnregistrer creation={creation} />
    </form>
  );
}
