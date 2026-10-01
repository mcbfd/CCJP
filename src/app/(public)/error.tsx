"use client";

import { useEffect } from "react";
import { ServerCrash, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Page d'erreur du site public (ajout labellisé v2.0 — pages 404/500 en
 * français).
 *
 * Attrape les exceptions non gérées levées pendant le rendu d'une page
 * publique et propose une relance ou un retour à l'accueil. Les détails
 * techniques restent dans la console du navigateur et dans les logs Vercel,
 * jamais affichés au visiteur.
 */

export default function ErreurPublique({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CCJP] erreur de rendu :", error);
  }, [error]);

  return (
    <section className="px-4 py-20">
      <div className="ccjp-container max-w-2xl text-center">
        <ServerCrash
          className="mx-auto mb-5 h-14 w-14 text-ccjp-rouge"
          aria-hidden="true"
        />

        <h1 className="mb-4 font-display text-3xl font-extrabold leading-tight text-ccjp-marine sm:text-4xl">
          Une erreur est survenue
        </h1>

        <div className="ccjp-rule mx-auto mb-6" aria-hidden="true" />

        <p className="mx-auto mb-8 text-lg leading-relaxed text-ccjp-marine/75">
          La page n’a pas pu être affichée. Le problème est probablement
          temporaire — vous pouvez réessayer. Si l’erreur persiste,
          prévenez-nous via la page de contact.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variante="primaire" taille="lg">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Réessayer
          </Button>
          <Button
            variante="fantome"
            taille="lg"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Retour à l’accueil
          </Button>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-ccjp-marine/50">
            Référence de l’erreur : <code>{error.digest}</code>
          </p>
        )}
      </div>
    </section>
  );
}
