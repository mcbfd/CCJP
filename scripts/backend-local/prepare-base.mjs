#!/usr/bin/env node
/**
 * ⚠️⚠️⚠  DÉVELOPPEMENT LOCAL UNIQUEMENT — NE JAMAIS DÉPLOYER  ⚠️⚠️⚠
 *
 * Ce script et le backend qu'il accompagne existent pour travailler hors
 * ligne, sans projet Supabase. Ils ne sont PAS une implémentation de
 * production :
 *   - les identifiants (`president@ccjp-podor.sn` / `ccjp-local-2026`) et les
 *     clés JWT sont des valeurs de test écrites en clair dans ce dépôt ;
 *   - le backend local n'est pas PostgREST : il ne gère qu'un sous-ensemble
 *     de sa syntaxe et de ses en-têtes.
 *
 * En production, tout passe par Supabase et les vraies variables
 * d'environnement de Vercel.
 *
 * ---------------------------------------------------------------------
 *
 * CCJP — Préparation de la base locale de développement
 */

/**
 * CCJP — Préparation de la base locale de développement
 *
 * Enchaîne, dans l'ordre :
 *   1. démarre PostgreSQL 18 local s'il ne tourne pas (initdb au besoin)
 *   2. crée les rôles applicatifs `anon` et `authenticated`
 *   3. applique le schéma d'auth local (stubs.sql) — jamais poussé à Supabase
 *   4. applique les 4 VRAIES migrations du dépôt, dans l'ordre documenté
 *   5. crée un administrateur de développement et son compte de connexion
 *
 * Ce script est idempotent : le relancer remet la base à zéro.
 *
 * Usage :  npm run db:local
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..", "..");
const MIGRATIONS = join(RACINE, "supabase", "migrations");

const PGDATA = process.env.PGDATA ?? "/tmp/pgtest/pgdata";
const SOCKET = process.env.PGHOST ?? "/tmp/pgtest";
const PORT = Number(process.env.PGPORT ?? 5433);
const BASE = process.env.PGDATABASE ?? "postgres";
const PORT_BACKEND = Number(process.env.BACKEND_PORT ?? 54321);

/** Binaires PostgreSQL livrés par le paquet npm embedded-postgres. */
const BIN = join(
  RACINE,
  "node_modules",
  "@embedded-postgres",
  "linux-x64",
  "native",
  "bin",
);

const ORDRE = [
  "0001_init_schema.sql",
  "0002_rls_policies.sql",
  "0003_seed_data.sql",
  "0004_storage_buckets.sql",
];

/** Administrateur de développement — mot de passe à usage local uniquement. */
const ADMIN_DEV = {
  email: "president@ccjp-podor.sn",
  motDePasse: "ccjp-local-2026",
  nom: "Président du CCJP (développement)",
};

const log = (m) => console.log(`\n▶ ${m}`);
const ok = (m) => console.log(`  ✓ ${m}`);

async function joignable() {
  const c = new pg.Client({ host: SOCKET, port: PORT, user: "postgres", database: BASE });
  try {
    await c.connect();
    await c.end();
    return true;
  } catch {
    return false;
  }
}

function demarrerServeur() {
  log("Démarrage de PostgreSQL local…");
  if (!existsSync(PGDATA)) {
    mkdirSync(dirname(PGDATA), { recursive: true });
    const r = spawnSync(join(BIN, "initdb"), [
      "-D", PGDATA, "-U", "postgres", "--auth=trust", "-E", "UTF8",
    ], { stdio: "inherit" });
    if (r.status !== 0) throw new Error("initdb a échoué");
  }
  const r = spawnSync(
    join(BIN, "pg_ctl"),
    ["-D", PGDATA, "-l", join(dirname(PGDATA), "pg.log"), "-o", `-p ${PORT} -k ${SOCKET}`, "start"],
    { stdio: "inherit" },
  );
  // pg_ctl renvoie 1 si le serveur tourne déjà : ce n'est pas une erreur.
  if (r.status !== 0 && !joignable()) throw new Error("pg_ctl start a échoué");
}

async function attendreServeur(tentatives = 30) {
  for (let i = 0; i < tentatives; i++) {
    if (await joignable()) return true;
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

/**
 * Provisionne `.env.local` pour le développement local.
 *
 * Pourquoi : `.env.local` est ignoré par Git (il ne doit JAMAIS être commité),
 * donc il disparaît à chaque réinitialisation de l'environnement de travail.
 * Sans lui, `createClient()` de supabase-js lève « Your project's URL and Key
 * are required » et TOUTES les lectures base échouent silencieusement — les
 * sections alimentées par la base restent vides sans erreur visible.
 *
 * Ce script recrée donc le fichier automatiquement. Un `.env.local` existant
 * n'est JAMAIS écrasé : il peut contenir les vraies valeurs Supabase.
 */
function provisionnerEnvLocal() {
  const cible = join(RACINE, ".env.local");

  if (existsSync(cible)) {
    ok(".env.local existant conservé (valeurs Supabase réelles préservées)");
    return;
  }

  const contenu = `# =====================================================================
# CCJP — Variables d'environnement LOCALES (développement)
#
# ⚠️  CE FICHIER EST IGNORÉ PAR GIT. Ne le committez jamais.
#     Régénéré automatiquement par \`npm run db:local\`.
#
# Ces valeurs pointent vers le backend local de développement
# (npm run dev:backend), qui reproduit Supabase sur un PostgreSQL local.
# Remplacez-les par les vraies valeurs Supabase le jour où le projet cloud
# sera créé — voir PLAN_IMPLEMENTATION.md §11 et §22.
# =====================================================================

NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:${PORT_BACKEND}
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6ImNjanAtbG9jYWwifQ.local-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoiY2NqcC1sb2NhbCJ9.local-dev-service-key

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=CCJP - Conseil Consultatif des Jeunes de Podor

REVALIDATE_SECRET=secret-local-developpement-a-changer
SUPABASE_PROJECT_ID=local
`;

  writeFileSync(cible, contenu, "utf8");
  ok(`.env.local créé (pointe vers http://127.0.0.1:${PORT_BACKEND})`);
}

(async () => {
  if (!existsSync(BIN)) {
    console.error(
      "Binaires PostgreSQL introuvables.\n" +
        "Installez-les avec :  npm install --save-dev embedded-postgres@17.5.0-beta.15 @embedded-postgres/linux-x64",
    );
    process.exit(1);
  }

  if (!(await joignable())) demarrerServeur();
  if (!(await attendreServeur())) {
    console.error("PostgreSQL ne répond pas.");
    process.exit(1);
  }
  ok(`PostgreSQL joignable sur ${SOCKET}:${PORT}`);

  const c = new pg.Client({ host: SOCKET, port: PORT, user: "postgres", database: BASE });
  await c.connect();

  // ---- rôles applicatifs ----
  for (const role of ["anon", "authenticated"]) {
    await c.query(
      `do $$ begin
         if not exists (select from pg_roles where rolname = '${role}') then
           create role ${role};
         end if;
       end $$;`,
    );
  }
  ok("rôles anon / authenticated présents");

  // ---- base vierge ----
  await c.query(
    "drop schema if exists public cascade; drop schema if exists auth cascade;" +
      " drop schema if exists storage cascade; drop schema if exists extensions cascade;",
  );
  await c.query("create schema if not exists public;");
  await c.query("create schema if not exists extensions;");
  await c.query('create extension if not exists "uuid-ossp" with schema extensions;');
  await c.query("create extension if not exists pgcrypto;");
  ok("schéma réinitialisé");

  // ---- schéma d'auth local ----
  await c.query(
    (await import("node:fs")).readFileSync(join(ICI, "stubs.sql"), "utf8"),
  );
  ok("schéma d'authentification local appliqué (stubs.sql)");

  // ---- les 4 VRAIES migrations, dans l'ordre ----
  for (const [i, f] of ORDRE.entries()) {
    const t0 = Date.now();
    await c.query((await import("node:fs")).readFileSync(join(MIGRATIONS, f), "utf8"));
    ok(`[${i + 1}/4] ${f} (${Date.now() - t0} ms)`);
  }

  // ---- droits pour les rôles applicatifs ----
  await c.query("grant usage on schema public, extensions to anon, authenticated;");
  await c.query("grant select, insert, update, delete on all tables in schema public to anon, authenticated;");

  // ---- administrateur de développement ----
  const email = ADMIN_DEV.email;
  const user = await c.query(
    `insert into auth.users (email, encrypted_password, role)
     values ($1, crypt($2, gen_salt('bf')), 'authenticated')
     on conflict (email) do update set encrypted_password = excluded.encrypted_password
     returning id`,
    [email, ADMIN_DEV.motDePasse],
  );
  const userId = user.rows[0].id;

  await c.query(
    `insert into public.admins (user_id, email, nom)
     values ($1, $2, $3)
     on conflict (user_id) do update set email = excluded.email, nom = excluded.nom`,
    [userId, email, ADMIN_DEV.nom],
  );
  ok(`administrateur de développement créé : ${email}`);

  // ---- contrôle final ----
  const verif = await c.query(
    `select
       (select count(*) from information_schema.tables
          where table_schema='public' and table_type='BASE TABLE') as tables,
       (select count(*) from pg_policies where schemaname='public') as politiques,
       (select count(*) from public.commissions) as commissions`,
  );
  const v = verif.rows[0];
  ok(`contrôle : ${v.tables} tables · ${v.politiques} politiques · ${v.commissions} commissions`);

  await c.end();

  provisionnerEnvLocal();

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base locale prête.

  Connexion back-office :
    email      ${ADMIN_DEV.email}
    mot de passe  ${ADMIN_DEV.motDePasse}

  Lancez ensuite :
    npm run dev:backend    (terminal 1)
    npm run dev            (terminal 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
})().catch((e) => {
  console.error("\n✗ ÉCHEC :", e.message);
  process.exit(1);
});
