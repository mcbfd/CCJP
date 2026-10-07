/**
 * Protections anti-robot des formulaires publics (PLAN §7.5)
 * =========================================================
 *
 * Les tables `contacts` et `adhesions` acceptent les insertions anonymes :
 * c'est indispensable pour que le public puisse écrire au CCJP. Cette ouverture
 * est aussi une cible : les robots de spam balaient ce type de formulaire.
 *
 * Trois garde-fous sont posés ici, tous évalués CÔTÉ SERVEUR. Une vérification
 * faite dans le navigateur n'est qu'un confort : elle se contourne d'une requête
 * `curl`.
 *
 *   1. Champ piège (« honeypot ») — un champ invisible que seul un automate
 *      remplit, parce qu'il renseigne mécaniquement tous les `input` trouvés.
 *   2. Contrainte de temps de saisie — un formulaire rempli en moins de trois
 *      secondes n'a pas été lu par un être humain.
 *   3. Journalisation — chaque rejet est tracé côté serveur pour que l'équipe
 *      puisse repérer une vague de spam.
 *
 * ---------------------------------------------------------------------------
 * POURQUOI CES VÉRIFICATIONS SONT « DOUCES »
 * ---------------------------------------------------------------------------
 * Elles doivent arrêter le balayage automatisé de masse, pas un attaquant
 * déterminé. Une protection réellement robuste reposerait sur un service
 * dédié (Cloudflare Turnstile, hCaptcha) ou sur la limitation de débit au
 * middleware Vercel — cette dernière est prévue au §7.5 point 4.
 *
 * Surtout, un rejet ne doit JAMAIS expliquer au robot pourquoi il a échoué :
 * sinon il corrige son coup. Le champ piège déclenche donc un rejet silencieux
 * (on fait croire au succès), tandis que le trop-rapide renvoie un message
 * neutre, compréhensible pour une vraie personne qui aurait été surprise.
 *
 * La sécurité réelle reste portée par les politiques RLS : même si un robot
 * passait ces contrôles, il ne pourrait ni relire les messages des autres,
 * ni modifier quoi que ce soit.
 */

/**
 * Nom du champ piège.
 *
 * Il est délibérément anodin (« société ») : un robot qui remplit tout croit
 * renseigner un champ légitime. Ne pas le renommer en « honeypot » ou
 * « antispam », ce qui le rendrait inutile.
 */
export const CHAMP_PIEGE = "societe";

/**
 * Nom du champ portant l'horodatage d'affichage du formulaire.
 *
 * Le composant client y inscrit `Date.now()` au montage. Le serveur compare
 * cette valeur à l'heure d'arrivée de la soumission.
 */
export const CHAMP_DEBUT = "debut_saisie";

/**
 * Durée minimale, en millisecondes, entre l'affichage du formulaire et son
 * envoi. Trois secondes est largement suffisant pour lire et remplir les
 * champs demandés ; c'est très court pour un automate.
 */
export const DELAI_MINIMUM_MS = 3_000;

/**
 * Tolérance sur l'horodatage.
 *
 * Les horloges du navigateur et du serveur peuvent diverger légèrement, et un
 * formulaire rechargé depuis un cache peut porter une date antérieure. On
 * accepte donc une petite marge : un envoi daté d'avant est suspect, mais pas
 * condamné pour quelques centaines de millisecondes.
 */
export const TOLERANCE_HORLOGE_MS = 1_000;

/* ------------------------------------------------------------------ */
/* Résultat                                                             */
/* ------------------------------------------------------------------ */

/**
 * Issue du contrôle anti-robot.
 *
 *   - `autoriser`  : la soumission est plausiblement humaine, on l'enregistre.
 *   - `silencieux` : champ piège rempli. On fait croire au succès et on
 *                    n'insère rien — le robot pense avoir réussi et s'en va.
 *   - `tropRapide` : formulaire envoyé trop vite. Message neutre à l'écran.
 *   - `horlogeInvalide` : horodatage absent ou incohérent. Même traitement que
 *                    `tropRapide`, car la cause peut être un cache agressif.
 */
export type VerdictAntiRobot =
  | { issue: "autoriser" }
  | { issue: "silencieux" }
  | { issue: "tropRapide"; delaiMs: number }
  | { issue: "horlogeInvalide" };

/* ------------------------------------------------------------------ */
/* Contrôle                                                            */
/* ------------------------------------------------------------------ */

/**
 * Examine une soumission et rend son verdict.
 *
 * Cette fonction ne rejette rien elle-même : c'est à la Server Action
 * appelante de décider quoi faire du verdict, afin que chaque formulaire
 * puisse adapter son message.
 */
export function examinerSoumission(formData: FormData): VerdictAntiRobot {
  /* 1. Champ piège ------------------------------------------------- */

  const piege = formData.get(CHAMP_PIEGE);
  if (typeof piege === "string" && piege.trim().length > 0) {
    console.warn(
      `[anti-robot] champ piège « ${CHAMP_PIEGE} » rempli — soumission écartée.`,
    );
    return { issue: "silencieux" };
  }

  /* 2. Temps de saisie -------------------------------------------- */

  const brut = formData.get(CHAMP_DEBUT);
  const debut = typeof brut === "string" ? Number.parseInt(brut, 10) : Number.NaN;

  if (!Number.isFinite(debut) || debut <= 0) {
    // Horodatage manquant : soit un robot qui ne l'a pas transmis, soit un
    // navigateur trop zélé. On traite comme un envoi suspect mais récupérable.
    console.warn("[anti-robot] horodatage de saisie absent.");
    return { issue: "horlogeInvalide" };
  }

  const delaiMs = Date.now() - debut;

  if (delaiMs < -TOLERANCE_HORLOGE_MS) {
    // Date postérieure à maintenant : horloge du navigateur déréglée, ou
    // horodatage forgé. Dans les deux cas on refuse poliment.
    console.warn(`[anti-robot] horodatage dans le futur (${delaiMs} ms).`);
    return { issue: "horlogeInvalide" };
  }

  if (delaiMs < DELAI_MINIMUM_MS) {
    console.warn(`[anti-robot] saisie trop rapide (${delaiMs} ms).`);
    return { issue: "tropRapide", delaiMs };
  }

  return { issue: "autoriser" };
}

/**
 * Message affiché pour un envoi écarté pour cause de rapidité.
 *
 * Volontairement vague : il ne mentionne ni « robot » ni « spam », afin de ne
 * pas renseigner un automate sur la règle qu'il vient d'enfreindre.
 */
export const MESSAGE_TROP_RAPIDE =
  "Votre message est parti un peu vite. Merci de relire le formulaire et de " +
  "le renvoyer.";
