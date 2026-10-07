"use client";

/**
 * Champs anti-robot des formulaires publics (§7.5)
 * ================================================
 *
 * Deux champs sont ajoutés à chaque formulaire public. Tous deux sont
 * transmis au serveur, qui seul décide de ce qu'il en fait :
 *
 *   1. **Le champ piège** — visible dans le code HTML, mais déporté hors de
 *      l'écran et retiré de l'ordre de tabulation. Une personne qui navigue au
 *      clavier ou à la voix ne le rencontre jamais. Un automate qui remplit
 *      mécaniquement tous les `input` qu'il trouve, si.
 *
 *   2. **L'horodatage de saisie** — inscrit au montage du formulaire. Le
 *      serveur compare cette valeur à l'heure d'arrivée de la soumission et
 *      écarte tout envoi survenu moins de trois secondes après l'affichage.
 *
 * Ce composant est marqué `"use client"` parce qu'il lit l'horloge du
 * navigateur au montage. S'il était rendu côté serveur, une page mise en cache
 * porterait une date figée au moment du build, et toutes les soumissions
 * ultérieures paraîtraient suspectes.
 */

import { useEffect, useState } from "react";
import { CHAMP_DEBUT, CHAMP_PIEGE } from "@/lib/anti-bot";

export function ChampsAntiRobot() {
  // L'horodatee n'est connu qu'après l'hydratation : on affiche d'abord un
  // champ vide, puis on le renseigne. La fenêtre est de quelques millisecondes,
  // et un envoi pendant cette fenêtre est de toute façon écarté par le serveur.
  const [debutSaisie, setDebutSaisie] = useState("");

  useEffect(() => {
    setDebutSaisie(String(Date.now()));
  }, []);

  return (
    <>
      {/*
        Champ piège. Positionné hors écran plutôt que masqué par `display:none`
        ou `type=hidden` : certains robots ignorent délibérément les champs
        qu'ils savent invisibles. Le libellé « Société » est plausible — un
        formulaire professionnel en demanderait un — et le champ reste
        atteignable au clavier pour personne.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
      >
        <label htmlFor={CHAMP_PIEGE}>Société</label>
        <input
          id={CHAMP_PIEGE}
          name={CHAMP_PIEGE}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Horodatage de début de saisie, lu par la Server Action. */}
      <input type="hidden" name={CHAMP_DEBUT} value={debutSaisie} readOnly />
    </>
  );
}
