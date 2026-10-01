#!/usr/bin/env node
/**
 * Génère `supabase/APPLIQUER-TOUT.sql` en concaténant les 4 migrations
 * dans l'ordre documenté (0001 → 0002 → 0003 → 0004).
 *
 * Pourquoi : l'éditeur SQL de Supabase impose un copier-coller par fichier.
 * Ce script produit un fichier unique, appliqué en une seule fois, ce qui
 * supprime le risque d'oublier une migration ou de les appliquer dans le
 * désordre.
 *
 * Le fichier généré est un ARTEFACT : ne le modifiez jamais à la main,
 * régénérez-le après chaque changement de migration :
 *     npm run db:concat
 *
 * Utilisation :
 *     node scripts/concat-migrations.mjs          # génère le fichier
 *     node scripts/concat-migrations.mjs --check  # vérifie sans écrire
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS = join(RACINE, "supabase", "migrations");
const SORTIE = join(RACINE, "supabase", "APPLIQUER-TOUT.sql");

/** Ordre imposé : 0002 dépend de 0001, 0004 dépend de 0002. */
const ORDRE = [
  "0001_init_schema.sql",
  "0002_rls_policies.sql",
  "0003_seed_data.sql",
  "0004_storage_buckets.sql",
];

const modeVerification = process.argv.includes("--check");

// --- contrôles de cohérence -------------------------------------------

if (!existsSync(MIGRATIONS)) {
  console.error(`Dossier introuvable : ${MIGRATIONS}`);
  process.exit(1);
}

const presents = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql"));
for (const attendu of ORDRE) {
  if (!presents.includes(attendu)) {
    console.error(`Migration manquante : ${attendu}`);
    process.exit(1);
  }
}

const nonReferencees = presents.filter((f) => !ORDRE.includes(f));
if (nonReferencees.length > 0) {
  console.error(
    `Migration(s) présente(s) mais absente(s) de l'ordre : ${nonReferencees.join(", ")}`,
  );
  process.exit(1);
}

// --- assemblage --------------------------------------------------------

const morceaux = ORDRE.map((f, i) => {
  const contenu = readFileSync(join(MIGRATIONS, f), "utf8").trimEnd();
  return [
    "-- ".padEnd(74, "="),
    `-- ÉTAPE ${i + 1}/4 — ${f}`,
    "-- ".padEnd(74, "="),
    "",
    contenu,
    "",
  ].join("\n");
});

const entete = `-- =====================================================================
-- CCJP — Application complète de la base (les 4 migrations d'un coup)
--
-- ⚠️  FICHIER GÉNÉRÉ — ne pas modifier à la main.
--     Régénérer avec :  npm run db:concat
--
-- Usage : Supabase → SQL Editor → New query → coller tout ce fichier →
--        Run. Les 4 migrations sont appliquées dans l'ordre, en une fois.
--
-- Contenu, dans l'ordre imposé :
--   0001_init_schema.sql     11 tables, index, triggers
--   0002_rls_policies.sql    RLS + is_admin()
--   0003_seed_data.sql       14 commissions, 8 indicateurs, 11 paramètres
--   0004_storage_buckets.sql 4 buckets + politiques Storage
--
-- Après exécution, lancez supabase/verification-apres-migration.sql pour
-- contrôler le résultat (13 vérifications, toutes doivent afficher OK).
-- =====================================================================

`;

const resultat = entete + morceaux.join("\n") + "-- Fin — les 4 migrations sont appliquées.\n";

if (modeVerification) {
  const actuel = existsSync(SORTIE) ? readFileSync(SORTIE, "utf8") : null;
  if (actuel === resultat) {
    console.log("APPLIQUER-TOUT.sql est à jour.");
  } else {
    console.error("APPLIQUER-TOUT.sql est OBSOLÈTE — lancez `npm run db:concat`.");
    process.exit(1);
  }
} else {
  writeFileSync(SORTIE, resultat);
  const lignes = resultat.split("\n").length;
  const octets = Buffer.byteLength(resultat, "utf8");
  console.log(
    `Écrit : supabase/APPLIQUER-TOUT.sql (${ORDRE.length} migrations, ${lignes} lignes, ${octets} octets)`,
  );
}
