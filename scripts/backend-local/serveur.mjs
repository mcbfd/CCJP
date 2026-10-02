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
 */

/**
 * CCJP — Backend local compatible Supabase (DÉVELOPPEMENT UNIQUEMENT)
 *
 * Pourquoi ce fichier existe
 * -------------------------
 * Le plan impose Next.js 14 + Supabase. Or un environnement de développement
 * coupé de supabase.com (pare-feu de sortie, absence de Docker) ne peut ni
 * créer un projet Supabase ni lancer `supabase start`. Sans backend, aucune
 * page ne peut lire la base et la Phase 3 est bloquée.
 *
 * Ce serveur comble le manque : il expose le sous-ensemble du dialecte
 * PostgREST + GoTrue + Storage réellement utilisé par l'application, adossé
 * à un vrai PostgreSQL local. Le code applicatif (src/) n'est PAS modifié :
 * il suffit de pointer NEXT_PUBLIC_SUPABASE_URL vers ce serveur.
 *
 * Ce qui est implémenté
 * ---------------------
 *   GET    /rest/v1/<table>            filtres, select, order, limit, count
 *   POST   /rest/v1/<table>            insertion (un objet ou un tableau)
 *   PATCH  /rest/v1/<table>            mise à jour filtrée
 *   DELETE /rest/v1/<table>            suppression filtrée
 *   POST   /auth/v1/token?grant_type=password
 *   GET    /auth/v1/user
 *   POST   /storage/v1/object/<bucket>/<chemin>
 *   GET    /storage/v1/object/public/<bucket>/<chemin>
 *
 * La RLS est APPLIQUÉE POUR DE VRAI : chaque requête s'exécute avec le rôle
 * `anon` ou `authenticated` et le JWT décodé, exactement comme le ferait
 * PostgREST. Une politique RLS absente filtre les lignes au lieu de lever
 * une erreur — c'est le comportement PostgreSQL normal.
 *
 * ⚠️  NE JAMAIS DÉPLOYER CE SERVEUR EN PRODUCTION. Il n'a pas la robustesse,
 *     la sécurité ni les performances de PostgREST.
 */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import jwt from "jsonwebtoken";

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, "..", "..");

// ---------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------

const PORT = Number(process.env.BACKEND_PORT ?? 54321);
const HOTE = "127.0.0.1";

const PG = {
  host: process.env.PGHOST ?? "/tmp/pgtest",
  port: Number(process.env.PGPORT ?? 5433),
  user: process.env.PGUSER ?? "postgres",
  database: process.env.PGDATABASE ?? "postgres",
};

/** Secret de signature des JWT locaux. En production, Supabase s'en charge. */
const JWT_SECRET = process.env.BACKEND_JWT_SECRET ?? "ccjp-secret-local-developpement";

/** Où stocker les fichiers déposés via le endpoint Storage. */
const STOCKAGE = process.env.BACKEND_STOCKAGE ?? join(RACINE, ".stockage-local");

/** Tables autorisées en lecture/écriture (miroir de public). */
const TABLES_PUBLIQUES = new Set([
  "commissions",
  "membres_bureau",
  "actualites",
  "evenements",
  "projets_phares",
  "adhesions",
  "contacts",
  "medias",
  "statistiques_indicateurs",
  "parametres",
  "admins",
]);

// ---------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------

const log = (...args) => console.log(new Date().toISOString().slice(11, 19), ...args);

function json(res, code, corps) {
  const utile = res.req.method !== "HEAD";
  const body = utile ? JSON.stringify(corps) : "";
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    ...CORS,
  });
  res.end(body);
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,HEAD,POST,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers":
    "authorization,content-type,apikey,prefer,x-client-info",
  "access-control-expose-headers": "content-range,content-profile,preference-applied",
};

/**
 * Lit l'en-tête `Prefer` et indique si la représentation des lignes
 * modifiées doit être renvoyée.
 *
 * PostgREST n'ajoute une clause `RETURNING` que si le client demande
 * explicitement `return=representation`. Par défaut, un INSERT/PATCH/DELETE
 * renvoie un corps vide (statut 201/204).
 *
 * Ce détail est décisif pour la RLS : la clause `RETURNING` est soumise à la
 * politique SELECT de la table. Sur `contacts` et `adhesions`, la lecture est
 * réservée aux administrateurs — un INSERT anonyme suivi d'un `RETURNING *`
 * échoue donc avec l'erreur 42501, alors que le même INSERT sans `RETURNING`
 * aboutit. C'est exactement le comportement de Supabase en production.
 */
/**
 * L'en-tête `Prefer` demande-t-il un décompte exact (`count=exact`) ?
 *
 * PostgREST renvoie alors le nombre TOTAL de lignes correspondant au filtre,
 * indépendamment de `limit`/`offset`, dans l'en-tête `content-range` sous la
 * forme `0-<dernière ligne>/<total>`. C'est ce que lit supabase-js pour
 * renseigner `count` — indispensable aux compteurs du back-office.
 */
/**
 * Le client demande-t-il un OBJET NU plutôt qu'un tableau ?
 *
 * supabase-js envoie `Accept: application/vnd.pgrst.object+json` quand on
 * enchaîne `.single()` ou `.maybeSingle()`. PostgREST répond alors :
 *   - 1 ligne    → 200 avec l'objet lui-même (pas un tableau) ;
 *   - 0 ligne    → 406 Not Acceptable (supabase-js traduit ça en `null`) ;
 *   - plusieurs  → 406 également.
 *
 * Sans ce support, `.single()` et `.maybeSingle()` renvoient un tableau :
 * `data.id` vaudrait alors `undefined` alors que la requête a réussi. C'est un
 * piège silencieux qui touche toutes les lectures unitaires du projet.
 */
function veutObjetNu(req) {
  const accept = String(req.headers.accept ?? "");
  return accept.includes("application/vnd.pgrst.object+json");
}

/**
 * Sérialise le résultat d'une écriture (INSERT/UPDATE/DELETE) en respectant
 * l'en-tête `Accept`, exactement comme PostgREST.
 *
 * - `Prefer: return=representation` absent → corps vide (201/200) ;
 * - présent + `Accept: …pgrst.object+json` → l'unique ligne en objet nu,
 *   ce qu'attend `.single()` après un `.insert().select()` ;
 * - présent sans cet Accept → le tableau des lignes.
 */
function serialiserEcriture(req, rows) {
  if (!veutRepresentation(req)) return { corps: [], nu: false };
  if (veutObjetNu(req)) {
    if (rows.length === 0) return { corps: null, nu: true, vide: true };
    return { corps: rows[0], nu: true };
  }
  return { corps: rows, nu: false };
}

function veutCompteExact(req) {
  const prefer = String(req.headers.prefer ?? req.headers["prefer"] ?? "");
  return /(^|,\s*)count=exact/i.test(prefer);
}

function veutRepresentation(req) {
  const prefer = String(req.headers.prefer ?? req.headers["prefer"] ?? "");
  return /(^|,\s*)return=representation/i.test(prefer);
}

/** Décode le JWT sans lever : renvoie { sub, role } ou null. */
function lireJwt(entete) {
  if (!entete || !entete.toLowerCase().startsWith("bearer ")) return null;
  const brut = entete.slice(7).trim();
  try {
    const charge = jwt.verify(brut, JWT_SECRET);
    return { sub: charge.sub ?? null, role: charge.role ?? "authenticated" };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// Traduction des filtres PostgREST en SQL paramétré
// ---------------------------------------------------------------------

const OPERATEURS = {
  eq: "=",
  neq: "<>",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  like: "like",
  ilike: "ilike",
};

/**
 * Traduit `?col=eq.valeur&autre=gte.3` en SQL sûr.
 * Les valeurs passent TOUJOURS par des paramètres ($1, $2…) : aucune
 * concaténation de valeur utilisateur dans le SQL.
 */
function traduireFiltres(recherche, params) {
  const clauses = [];
  for (const [cle, valeur] of recherche) {
    // on ignore les paramètres de contrôle de supabase-js
    if (["select", "order", "limit", "offset", "count"].includes(cle)) continue;

    const point = valeur.indexOf(".");
    if (point === -1) continue;
    const operateur = valeur.slice(0, point);
    const brut = valeur.slice(point + 1);

    if (operateur === "is") {
      if (brut === "null") clauses.push(`"${cle}" is null`);
      else if (brut === "true") clauses.push(`"${cle}" is true`);
      else if (brut === "false") clauses.push(`"${cle}" is false`);
      continue;
    }

    if (operateur === "in") {
      const liste = brut.replace(/^\(|\)$/g, "").split(",").filter(Boolean);
      if (liste.length) {
        clauses.push(`"${cle}" = any($${params.length + 1})`);
        params.push(liste);
      }
      continue;
    }

    const sql = OPERATEURS[operateur];
    if (!sql) continue; // opérateur inconnu : ignoré (comme PostgREST en mode permissif)

    // like/ilike : les jokers * deviennent %
    let valeurSql = brut;
    if (operateur === "like" || operateur === "ilike") {
      valeurSql = brut.replace(/\*/g, "%");
    }
    clauses.push(`"${cle}" ${sql} $${params.length + 1}`);
    params.push(valeurSql);
  }
  return clauses;
}

/** Traduit `?select=a,b` en liste de colonnes validées. */
function colonnesSelection(select, valides) {
  if (!select || select === "*") return "*";
  const demandees = select
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c && !c.includes("(")); // les embeddings ne sont pas gérés
  if (demandees.length === 0) return "*";
  const sures = demandees.filter((c) => valides.has(c));
  return sures.length ? sures.map((c) => `"${c}"`).join(", ") : "*";
}

// ---------------------------------------------------------------------
// Exécution d'une requête sous le rôle et le JWT du appelant
// ---------------------------------------------------------------------

const pool = new pg.Pool({ ...PG, max: 10 });

/**
 * Exécute `sql` avec le rôle applicatif et le JWT de la requête, afin que
 * les politiques RLS s'appliquent réellement.
 *
 * Détail crucial : `set local` exige un bloc de transaction, et une
 * instruction rejetée par la RLS empoisonne la transaction entière
 * (erreur 25P02). On utilise donc un SAVEPOINT par exécution.
 */
async function executer({ sql, params = [], role, sub }) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(`set local role ${role === "authenticated" ? "authenticated" : "anon"}`);
    if (sub) {
      await client.query(`set local request.jwt.claim.sub = '${sub}'`);
      await client.query(`set local request.jwt.claim.role = '${role}'`);
    } else {
      await client.query(`set local request.jwt.claim.role = 'anon'`);
    }

    const nom = `sp_${Math.random().toString(36).slice(2, 10)}`;
    await client.query(`savepoint ${nom}`);
    let resultat;
    try {
      resultat = await client.query(sql, params);
      await client.query(`release savepoint ${nom}`);
    } catch (e) {
      await client.query(`rollback to savepoint ${nom}`);
      throw e;
    }

    await client.query("commit");
    return resultat;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

/** Charge les colonnes réelles d'une table (pour valider `select`). */
const cacheColonnes = new Map();
async function colonnesDe(table) {
  if (cacheColonnes.has(table)) return cacheColonnes.get(table);
  const r = await pool.query(
    `select column_name from information_schema.columns
      where table_schema = 'public' and table_name = $1`,
    [table],
  );
  const ens = new Set(r.rows.map((x) => x.column_name));
  cacheColonnes.set(table, ens);
  return ens;
}

// ---------------------------------------------------------------------
// Handlers REST
// ---------------------------------------------------------------------

async function handlerRest(req, res, table, auth) {
  if (!TABLES_PUBLIQUES.has(table)) {
    return json(res, 404, {
      code: "PGRST202",
      message: `Table « ${table} » inconnue ou non exposée.`,
      hint: "Tables disponibles : " + [...TABLES_PUBLIQUES].join(", "),
    });
  }

  const url = new URL(req.url, `http://${HOTE}:${PORT}`);
  const valides = await colonnesDe(table);
  const params = [];
  const clauses = traduireFiltres(url.searchParams, params);
  const ou = clauses.length ? ` where ${clauses.join(" and ")}` : "";

  // ---- GET : lecture ----
  // HEAD est traité exactement comme GET, seul le corps de réponse diffère
  // (vide). C'est le mécanisme qu'utilise supabase-js pour les requêtes de
  // décompte (`head: true`) : sans ce support, tous les compteurs du
  // back-office renverraient 405.
  if (req.method === "GET" || req.method === "HEAD") {
    const select = colonnesSelection(url.searchParams.get("select"), valides);
    const order = url.searchParams.get("order");
    const limite = url.searchParams.get("limit");
    const décalage = url.searchParams.get("offset");

    let sql = `select ${select} from public."${table}"${ou}`;
    if (order) {
      // format PostgREST : col.asc / col.desc
      const [col, sens] = order.split(".");
      if (valides.has(col)) {
        sql += ` order by "${col}" ${sens === "desc" ? "desc" : "asc"}`;
      }
    }
    // `limit` et `offset` sont ajoutés SÉPARÉMENT, avec leur propre
    // placeholder : PostgreSQL exige que le nombre de paramètres fournis
    // corresponde exactement au nombre de $n utilisés dans la requête.
    // Les paramètres de la clause WHERE, figés AVANT l'ajout de limit/offset :
    // le décompte exact réutilise la même clause WHERE et n'a donc besoin que
    // de ceux-là. Réutiliser `params` tel quel ferait échouer la requête avec
    // « bind message supplies N parameters, but prepared statement requires 0 ».
    const paramsFiltre = [...params];

    if (limite) {
      sql += ` limit $${params.length + 1}`;
      params.push(Number(limite));
    }
    if (décalage) {
      sql += ` offset $${params.length + 1}`;
      params.push(Number(décalage));
    }

    try {
      const r = await executer({ sql, params, role: auth.role, sub: auth.sub });

      // Total réel (hors limit/offset) quand le client le demande.
      let total = r.rowCount;
      if (veutCompteExact(req)) {
        try {
          const compte = await executer({
            sql: `select count(*)::int as n from public."${table}"${ou}`,
            params: paramsFiltre,
            role: auth.role,
            sub: auth.sub,
          });
          total = Number(compte.rows[0]?.n ?? r.rowCount);
        } catch (eCompte) {
          console.error("[rest] décompte exact échoué :", eCompte.message);
        }
      }

      const derniere = r.rowCount === 0 ? "*" : String(r.rowCount - 1);

      // Réponse en objet nu quand le client l'a demandé (.single/.maybeSingle)
      if (veutObjetNu(req)) {
        if (r.rowCount !== 1) {
          // PostgREST renvoie 406 ; supabase-js le transforme en `null` pour
          // `.maybeSingle()` et en erreur pour `.single()`.
          return json(res, 406, {
            code: "PGRST116",
            message:
              r.rowCount === 0
                ? "Aucune ligne trouvée."
                : "Plusieurs lignes trouvées.",
          });
        }
        const corps = JSON.stringify(r.rows[0]);
        res.writeHead(200, {
          "content-type": "application/json; charset=utf-8",
          "content-range": `${derniere}/${total}`,
          ...CORS,
        });
        return res.end(req.method === "HEAD" ? "" : corps);
      }

      const corps = JSON.stringify(r.rows);
      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "content-range": `${derniere}/${total}`,
        ...CORS,
      });
      // HEAD : en-têtes seuls, corps vide.
      return res.end(req.method === "HEAD" ? "" : corps);
    } catch (e) {
      return json(res, 400, { code: e.code ?? "PGRST100", message: e.message });
    }
  }

  // ---- POST : insertion ----
  if (req.method === "POST") {
    const corps = await lireCorps(req);
    if (corps === null) return json(res, 400, { message: "Corps JSON invalide." });

    const lignes = Array.isArray(corps) ? corps : [corps];
    if (lignes.length === 0) return json(res, 200, []);

    const cles = [...new Set(lignes.flatMap((l) => Object.keys(l)))].filter((c) =>
      valides.has(c),
    );
    if (cles.length === 0) {
      return json(res, 400, { message: "Aucune colonne valide à insérer." });
    }

    const valeurs = [];
    const placeholders = lignes.map((ligne) => {
      const tuple = cles.map((c) => {
        if (!(c in ligne)) return "default";
        valeurs.push(ligne[c]);
        return `$${valeurs.length}`;
      });
      return `(${tuple.join(", ")})`;
    });

    // `returning *` uniquement si le client le demande : sinon l'INSERT
    // anonyme sur `contacts`/`adhesions` serait rejeté par la politique SELECT.
    const retour = veutRepresentation(req) ? " returning *" : "";
    const sql = `insert into public."${table}" (${cles
      .map((c) => `"${c}"`)
      .join(", ")}) values ${placeholders.join(", ")}${retour}`;

    try {
      const r = await executer({ sql, params: valeurs, role: auth.role, sub: auth.sub });
      const rep = serialiserEcriture(req, r.rows);
      if (rep.vide) return json(res, 406, { code: "PGRST116", message: "Aucune ligne renvoyée." });
      return json(res, 201, rep.corps);
    } catch (e) {
      return json(res, 400, {
        code: e.code ?? "PGRST100",
        message: e.message,
        details: e.detail,
      });
    }
  }

  // ---- PATCH : mise à jour ----
  if (req.method === "PATCH") {
    const corps = await lireCorps(req);
    if (corps === null || typeof corps !== "object" || Array.isArray(corps)) {
      return json(res, 400, { message: "Corps JSON objet attendu." });
    }

    const cles = Object.keys(corps).filter((c) => valides.has(c));
    if (cles.length === 0) return json(res, 400, { message: "Aucune colonne valide." });

    // ⚠️ Les placeholders du SET doivent être décalés APRÈS ceux du WHERE.
    // La clause WHERE est déjà construite avec $1…$n dans `params` ; si le SET
    // reprenait à $1, les deux se chevaucheraient et PostgreSQL recevrait la
    // valeur du SET là où il attend un UUID de filtre :
    // « invalid input syntax for type uuid: "Titre modifié" ».
    const valeursSet = cles.map((c) => corps[c]);
    const assignations = cles.map(
      (c, i) => `"${c}" = $${params.length + i + 1}`,
    );
    const valeurs = [...params, ...valeursSet];
    // Même règle que pour l'INSERT : `returning` seulement si demandé,
    // car la clause RETURNING est soumise à la politique SELECT.
    const retour = veutRepresentation(req) ? " returning *" : "";
    const sql = `update public."${table}" set ${assignations.join(", ")}${ou}${retour}`;

    try {
      const r = await executer({ sql, params: valeurs, role: auth.role, sub: auth.sub });
      const rep = serialiserEcriture(req, r.rows);
      if (rep.vide) return json(res, 406, { code: "PGRST116", message: "Aucune ligne renvoyée." });
      return json(res, 200, rep.corps);
    } catch (e) {
      return json(res, 400, { code: e.code ?? "PGRST100", message: e.message });
    }
  }

  // ---- DELETE : suppression ----
  if (req.method === "DELETE") {
    // Même règle : `returning` seulement si le client le demande.
    const retour = veutRepresentation(req) ? " returning *" : "";
    const sql = `delete from public."${table}"${ou}${retour}`;
    try {
      const r = await executer({ sql, params, role: auth.role, sub: auth.sub });
      const rep = serialiserEcriture(req, r.rows);
      if (rep.vide) return json(res, 406, { code: "PGRST116", message: "Aucune ligne renvoyée." });
      return json(res, 200, rep.corps);
    } catch (e) {
      return json(res, 400, { code: e.code ?? "PGRST100", message: e.message });
    }
  }

  return json(res, 405, { message: `Méthode ${req.method} non gérée.` });
}

function lireCorps(req) {
  return new Promise((resoudre) => {
    let brut = "";
    req.on("data", (c) => {
      brut += c;
      if (brut.length > 5_000_000) req.destroy(); // garde-fou
    });
    req.on("end", () => {
      if (!brut) return resoudre({});
      try {
        resoudre(JSON.parse(brut));
      } catch {
        resoudre(null);
      }
    });
    req.on("error", () => resoudre(null));
  });
}

// ---------------------------------------------------------------------
// Handlers Auth
// ---------------------------------------------------------------------

async function handlerAuth(req, res, chemin, auth) {
  const url = new URL(req.url, `http://${HOTE}:${PORT}`);

  // Connexion par mot de passe
  if (chemin === "/token" && req.method === "POST") {
    if (url.searchParams.get("grant_type") !== "password") {
      return json(res, 400, { error: "unsupported_grant_type" });
    }
    const corps = await lireCorps(req);
    if (!corps?.email || !corps?.password) {
      return json(res, 400, { error: "invalid_grant", error_description: "Email et mot de passe requis." });
    }

    const r = await pool.query(
      `select id, email, encrypted_password, role from auth.users where email = $1`,
      [corps.email],
    );
    const user = r.rows[0];
    if (!user || !user.encrypted_password) {
      return json(res, 400, { error: "invalid_grant", error_description: "Identifiants invalides." });
    }

    // Vérification bcrypt sans dépendance supplémentaire : on compare via
    // la fonction crypt() de PostgreSQL (module pgcrypto).
    const verif = await pool.query(
      `select crypt($1, $2) = $2 as ok`,
      [corps.password, user.encrypted_password],
    );
    if (!verif.rows[0]?.ok) {
      return json(res, 400, { error: "invalid_grant", error_description: "Identifiants invalides." });
    }

    const maintenant = Math.floor(Date.now() / 1000);
    const access = jwt.sign(
      { sub: user.id, role: "authenticated", email: user.email, iat: maintenant },
      JWT_SECRET,
      { expiresIn: "1h" },
    );
    return json(res, 200, {
      access_token: access,
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: access,
      user: { id: user.id, email: user.email, role: "authenticated" },
    });
  }

  // Utilisateur courant (utilisé par supabase.auth.getUser())
  if (chemin === "/user" && req.method === "GET") {
    if (!auth.sub) {
      return json(res, 401, { message: "JWT manquant ou invalide." });
    }
    const r = await pool.query(
      `select id, email, role from auth.users where id = $1`,
      [auth.sub],
    );
    if (!r.rows[0]) return json(res, 401, { message: "Utilisateur inconnu." });
    return json(res, 200, r.rows[0]);
  }

  return json(res, 404, { message: `Route auth « ${chemin} » non gérée.` });
}

// ---------------------------------------------------------------------
// Handlers Storage
// ---------------------------------------------------------------------

const TYPES_MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".pdf": "application/pdf", ".ico": "image/x-icon",
};

async function handlerStorage(req, res, reste, auth) {
  // Deux formes d'URL existent selon l'appelant :
  //   POST/PUT/DELETE : /object/<bucket>/<chemin…>
  //   GET (publique)  : /object/public/<bucket>/<chemin…>
  // Le segment « public » est donc facultatif et doit être retiré avant
  // d'extraire le bucket, sinon le bucket vaudrait « public » et le chemin
  // « <bucket>/<fichier> » — d'où des 404 sur des fichiers pourtant déposés.
  let morceaux = reste.split("/").filter(Boolean);
  if (morceaux[0] !== "object") {
    return json(res, 404, { message: "Chemin Storage invalide." });
  }
  morceaux = morceaux.slice(1);
  if (morceaux[0] === "public") morceaux = morceaux.slice(1);

  // Pour DELETE, l'URL ne porte que le bucket : les chemins des fichiers à
  // supprimer sont dans le corps JSON de la requête. Exiger un chemin ici
  // rejetterait donc toute suppression avec « Chemin Storage invalide ».
  const exigeChemin = req.method !== "DELETE";
  if (morceaux.length < 1 || (exigeChemin && morceaux.length < 2)) {
    return json(res, 404, { message: "Chemin Storage invalide." });
  }
  const [bucket, ...chemin] = morceaux;
  const fichier = chemin.join("/");

  if (req.method === "POST" || req.method === "PUT") {
    // Écriture réservée aux admins habilités (comme la vraie politique RLS)
    if (!auth.sub) {
      return json(res, 401, { message: "Authentification requise pour déposer un fichier." });
    }
    const r = await pool.query(
      `select exists(select 1 from public.admins where user_id = $1 and actif) as admin`,
      [auth.sub],
    );
    if (!r.rows[0]?.admin) {
      return json(res, 403, { message: "Seul un administrateur habilité peut déposer un fichier." });
    }

    const morceauxFichier = [];
    for await (const c of req) morceauxFichier.push(c);
    const contenu = Buffer.concat(morceauxFichier);
    const destination = join(STOCKAGE, bucket, fichier);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, contenu);

    return json(res, 200, {
      Key: `${bucket}/${fichier}`,
      Id: cryptoRandomId(),
    });
  }

  if (req.method === "DELETE") {
    // supabase-js envoie DELETE /object/<bucket> avec un corps JSON
    // { prefixes: ["chemin1", "chemin2"] }. Le bucket est donc dans l'URL et
    // les chemins dans le corps — pas l'inverse.
    if (!auth.sub) {
      return json(res, 401, { message: "Authentification requise pour supprimer un fichier." });
    }
    const r = await pool.query(
      `select exists(select 1 from public.admins where user_id = $1 and actif) as admin`,
      [auth.sub],
    );
    if (!r.rows[0]?.admin) {
      return json(res, 403, { message: "Seul un administrateur habilité peut supprimer un fichier." });
    }

    const corps = await lireCorps(req);
    const prefixes = Array.isArray(corps?.prefixes) ? corps.prefixes : [];
    if (prefixes.length === 0) {
      return json(res, 400, { message: "Aucun fichier à supprimer." });
    }

    const supprimes = [];
    for (const prefixe of prefixes) {
      if (typeof prefixe !== "string" || !prefixe) continue;
      // Garde-fou : le chemin ne doit jamais s'échapper du bucket.
      if (prefixe.split("/").includes("..")) continue;
      const cible = join(STOCKAGE, bucket, prefixe);
      if (existsSync(cible)) {
        rmSync(cible, { recursive: true, force: true });
        supprimes.push(prefixe);
      }
    }

    return json(res, 200, supprimes.map((p) => ({ name: p, bucket })));
  }

  if (req.method === "GET") {
    // Lecture publique : les 4 buckets sont publics (migration 0004)
    const source = join(STOCKAGE, bucket, fichier);
    if (!existsSync(source)) {
      return json(res, 404, { message: "Fichier introuvable." });
    }
    const contenu = readFileSync(source);
    res.writeHead(200, {
      "content-type": TYPES_MIME[extname(fichier).toLowerCase()] ?? "application/octet-stream",
      "content-length": contenu.length,
      "cache-control": "public, max-age=3600",
      ...CORS,
    });
    return res.end(contenu);
  }

  return json(res, 405, { message: `Méthode ${req.method} non gérée.` });
}

function cryptoRandomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ---------------------------------------------------------------------
// Serveur
// ---------------------------------------------------------------------

const serveur = createServer(async (req, res) => {
  // Préflight CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  try {
    const url = new URL(req.url, `http://${HOTE}:${PORT}`);
    const auth = lireJwt(req.headers.authorization) ?? { sub: null, role: "anon" };
    const chemin = url.pathname;

    if (chemin.startsWith("/rest/v1/")) {
      const table = chemin.slice("/rest/v1/".length).split("/")[0];
      return await handlerRest(req, res, table, auth);
    }
    if (chemin.startsWith("/auth/v1")) {
      return await handlerAuth(req, res, chemin.slice("/auth/v1".length), auth);
    }
    if (chemin.startsWith("/storage/v1/")) {
      return await handlerStorage(req, res, chemin.slice("/storage/v1/".length), auth);
    }

    return json(res, 404, { message: `Route « ${chemin} » non gérée.` });
  } catch (e) {
    log("ERREUR", e.message);
    return json(res, 500, { message: "Erreur interne du backend local.", detail: e.message });
  }
});

serveur.listen(PORT, HOTE, () => {
  log(`Backend local compatible Supabase à l'écoute sur http://${HOTE}:${PORT}`);
  log(`PostgreSQL : ${PG.host}:${PG.port}/${PG.database}`);
  log(`Stockage local : ${STOCKAGE}`);
  log("⚠️  DÉVELOPPEMENT UNIQUEMENT — ne jamais déployer.");
});
