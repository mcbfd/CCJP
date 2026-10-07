#!/usr/bin/env node
/**
 * CCJP — Tests de bout en bout (PLAN_IMPLEMENTATION.md §11, P5.5 et P5.6)
 * =====================================================================
 *
 * Ce script rejoue le cycle complet de publication et les contrôles de
 * sécurité, contre le backend local et le site Next en cours d'exécution.
 *
 *   Prérequis :  npm run db:local   (base peuplée)
 *                npm run dev:backend  (port 54321)
 *                npm run dev          (port 3000)
 *   Lancement :  node scripts/tests/parcours-complet.cjs
 *
 * ---------------------------------------------------------------------
 * CE QUE CE SCRIPT COUVRE, ET CE QU'IL NE COUVRE PAS
 * ---------------------------------------------------------------------
 *
 * Les Server Actions de Next.js ne sont PAS des routes HTTP ordinaires :
 * React les invoque par un identifiant interne transmis dans l'en-tête
 * `Next-Action`, identifiant normalisé à l'exécution et absent du HTML servi.
 * Sans navigateur, il est donc impossible de les appeler fidèlement — tous les
 * formats d'identifiant ont été essayés et renvoient la page « introuvable ».
 *
 * Ce script teste par conséquent :
 *   ✅ tout ce qui est exposé en HTTP réel (pages, routes d'API, authentification) ;
 *   ✅ la couche données et la RLS, en rejouant EXACTEMENT les requêtes que les
 *      Server Actions émettent (même client, même session, mêmes filtres) ;
 *   ✅ les garde-fous d'accès sur chaque table et chaque route sensible.
 *
 * Il ne teste pas :
 *   ❌ l'invocation HTTP littérale d'une Server Action (nécessite un navigateur) ;
 *   ❌ le rendu visuel et l'hydratation React.
 *
 * La partie non couverte est signalée en fin d'exécution plutôt que passée
 * sous silence : mieux vaut un bilan honnête qu'une couverture inventée.
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const SITE = "http://127.0.0.1:3000";
const BACKEND = "http://127.0.0.1:54321";
const PG = { host: "/tmp/pgtest", port: 5433, user: "postgres", database: "postgres" };
const ADMIN = { email: "president@ccjp-podor.sn", password: "ccjp-local-2026" };

let anonKey = "";
let cookieSession = "";
let tokenAdmin = "";

/* ------------------------------------------------------------------ */
/* Utilitaires de rapport                                              */
/* ------------------------------------------------------------------ */

let reussites = 0;
let echecs = 0;
const details = [];

function ok(message) {
  reussites += 1;
  details.push(`  ✅ ${message}`);
}

function echec(message) {
  echecs += 1;
  details.push(`  ❌ ${message}`);
}

function verif(condition, messageSucces, messageEchec) {
  if (condition) ok(messageSucces);
  else echec(messageEchec);
}

function section(titre) {
  details.push(`\n${titre}`);
}

/* ------------------------------------------------------------------ */
/* Client Supabase avec la session administrateur                      */
/* ------------------------------------------------------------------ */

function clientAdmin() {
  return createClient(BACKEND, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${tokenAdmin}` } },
  });
}

/* ------------------------------------------------------------------ */
/* A — Site public                                                     */
/* ------------------------------------------------------------------ */

async function testerSitePublic() {
  section("A. SITE PUBLIC — disponibilité");

  const pages = [
    "/", "/actualites", "/evenements", "/commissions",
    "/bureau-executif", "/programme", "/a-propos", "/contact", "/rejoindre",
  ];
  for (const p of pages) {
    const r = await fetch(`${SITE}${p}`, { redirect: "manual" });
    verif(r.status === 200, `${p} → 200`, `${p} → ${r.status} (attendu 200)`);
  }

  // URL inconnue → 404 en français, jamais une page blanche
  const r404 = await fetch(`${SITE}/cette-page-nexiste-pas`, { redirect: "manual" });
  const corps404 = await r404.text();
  verif(
    r404.status === 404 && /Page introuvable|introuvable/i.test(corps404),
    "URL inconnue → 404 avec message en français",
    `URL inconnue → ${r404.status}, message français absent`,
  );

  // Fichiers techniques
  const sitemap = await fetch(`${SITE}/sitemap.xml`);
  const corpsSitemap = await sitemap.text();
  verif(
    sitemap.status === 200 && corpsSitemap.includes("<loc>"),
    `sitemap.xml → 200 (${(corpsSitemap.match(/<loc>/g) || []).length} URLs)`,
    `sitemap.xml → ${sitemap.status}`,
  );

  const robots = await fetch(`${SITE}/robots.txt`);
  const corpsRobots = await robots.text();
  verif(
    robots.status === 200 && corpsRobots.includes("Disallow: /admin"),
    "robots.txt → 200 et /admin exclu de l'indexation",
    "robots.txt absent ou /admin non exclu",
  );

  // Export calendrier d'un événement inexistant → 404, pas 500
  const ics = await fetch(`${SITE}/api/ics/00000000-0000-0000-0000-000000000000`, {
    redirect: "manual",
  });
  verif(ics.status === 404, "API .ics d'un événement inexistant → 404", `API .ics → ${ics.status}`);
}

/* ------------------------------------------------------------------ */
/* B — Authentification                                                */
/* ------------------------------------------------------------------ */

async function testerAuthentification() {
  section("B. AUTHENTIFICATION");

  // Bon identifiant
  const rBon = await fetch(`${BACKEND}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify(ADMIN),
  });
  const dBon = await rBon.json();
  verif(
    rBon.status === 200 && !!dBon.access_token,
    "Connexion avec les bons identifiants → jeton délivré",
    `Connexion valide refusée : ${rBon.status} ${JSON.stringify(dBon).slice(0, 80)}`,
  );
  tokenAdmin = dBon.access_token;

  // Mauvais mot de passe
  const rMauvais = await fetch(`${BACKEND}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN.email, password: "mauvais-mot-de-passe" }),
  });
  verif(
    rMauvais.status >= 400,
    "Mot de passe incorrect → connexion refusée",
    `Mot de passe incorrect accepté (${rMauvais.status})`,
  );

  // Session fabriquée à la main (signature invalide) → rejetée
  const rFaux = await fetch(`${BACKEND}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: "Bearer jeton.fabrique.alamain" },
  });
  verif(
    rFaux.status >= 400,
    "Jeton d'accès falsifié → rejeté par le backend",
    `Jeton falsifié accepté (${rFaux.status})`,
  );

  // Cookie de session pour les tests de pages
  const session = {
    access_token: tokenAdmin,
    refresh_token: dBon.refresh_token ?? "",
    token_type: "bearer",
    expires_in: dBon.expires_in ?? 3600,
    expires_at: dBon.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    user: dBon.user ?? {},
  };
  cookieSession =
    "sb-127-auth-token=base64-" +
    Buffer.from(JSON.stringify(session)).toString("base64");
}

/* ------------------------------------------------------------------ */
/* C — Protection des pages d'administration                           */
/* ------------------------------------------------------------------ */

async function testerProtectionAdmin() {
  section("C. PROTECTION DES PAGES /admin");

  const pages = [
    "/admin", "/admin/actualites", "/admin/evenements", "/admin/membres",
    "/admin/commissions", "/admin/adhesions", "/admin/messages",
    "/admin/media", "/admin/parametres",
  ];

  // Sans session → redirection vers la connexion
  for (const p of pages) {
    const r = await fetch(`${SITE}${p}`, { redirect: "manual" });
    const cible = r.headers.get("location") ?? "";
    verif(
      r.status >= 300 && r.status < 400 && cible.includes("/auth/login"),
      `${p} sans session → redirection vers /auth/login`,
      `${p} sans session → ${r.status} ${cible}`,
    );
  }

  // Avec session administrateur → accès
  for (const p of pages) {
    const r = await fetch(`${SITE}${p}`, {
      redirect: "manual",
      headers: { Cookie: cookieSession },
    });
    verif(r.status === 200, `${p} avec session admin → 200`, `${p} avec session admin → ${r.status}`);
  }
}

/* ------------------------------------------------------------------ */
/* D — Sécurité des données (RLS)                                      */
/* ------------------------------------------------------------------ */

async function testerRLS() {
  section("D. SÉCURITÉ DES DONNÉES — politiques RLS");

  const clientAnon = createClient(BACKEND, anonKey, { auth: { persistSession: false } });
  const admin = clientAdmin();

  // 1. Le public ne doit JAMAIS lire les données personnelles
  for (const table of ["contacts", "adhesions"]) {
    const { data } = await clientAnon.from(table).select("id");
    verif(
      (data ?? []).length === 0,
      `Anonyme : lecture de « ${table} » → 0 ligne (données personnelles protégées)`,
      `Anonyme : ${table} renvoie ${(data ?? []).length} ligne(s) — fuite de données`,
    );
  }

  // 2. L'administrateur, lui, doit lire (on insère puis on relit)
  const marqueur = `rls-test-${Date.now()}`;
  await admin.from("contacts").insert({
    nom: "Test RLS", email: `${marqueur}@example.sn`,
    sujet: "Contrôle RLS", message: "Message de contrôle des politiques.",
  });
  const { data: lusParAdmin } = await admin.from("contacts").select("id").eq("email", `${marqueur}@example.sn`);
  verif(
    (lusParAdmin ?? []).length === 1,
    "Administrateur : lecture de « contacts » → ligne visible",
    "Administrateur : ligne créée mais invisible (politique RLS trop stricte)",
  );

  const { data: lusParAnon } = await clientAnon.from("contacts").select("id").eq("email", `${marqueur}@example.sn`);
  verif(
    (lusParAnon ?? []).length === 0,
    "Anonyme : la ligne créée reste invisible",
    "Anonyme : la ligne est visible — fuite",
  );

  // 3. L'anonyme ne doit pas pouvoir modifier ni supprimer
  const { error: errMajAnon } = await clientAnon.from("contacts").update({ lu: true }).eq("email", `${marqueur}@example.sn`);
  const { data: apresTentative } = await admin.from("contacts").select("lu").eq("email", `${marqueur}@example.sn`).maybeSingle();
  verif(
    (errMajAnon !== null) || apresTentative?.lu === false,
    "Anonyme : tentative de modification d'un message → sans effet",
    "Anonyme : modification d'un message aboutie — faille",
  );

  // 4. Paramètres : les clés sensibles doivent être masquées au public
  const { data: paramsPublics } = await clientAnon.from("parametres").select("cle");
  const clesPubliques = (paramsPublics ?? []).map((p) => p.cle);
  verif(
    clesPubliques.length > 0 && !clesPubliques.some((c) => /secret|token|password/i.test(c)),
    `Paramètres : ${clesPubliques.length} clé(s) publique(s), aucune sensible exposée`,
    "Paramètres : une clé sensible est lisible publiquement",
  );

  // Nettoyage
  await admin.from("contacts").delete().eq("email", `${marqueur}@example.sn`);
}

/* ------------------------------------------------------------------ */
/* E — Cycle complet de publication                                    */
/* ------------------------------------------------------------------ */

async function testerCyclePublication() {
  section("E. CYCLE COMPLET DE PUBLICATION");

  const admin = clientAdmin();
  const slug = `e2e-cycle-${Date.now()}`;

  // 1. Création en brouillon
  const { data: cree, error: eCree } = await admin.from("actualites").insert({
    titre: "Article du cycle de test",
    slug,
    extrait: "Extrait de l'article de test.",
    contenu: "<p>Corps de l'article de test.</p>",
    statut: "brouillon",
    epingle: true,
    tags: ["test", "e2e"],
  }).select("id, slug, statut").single();
  verif(!!cree && !eCree, "Création d'un article en brouillon", `Création échouée : ${eCree?.message}`);

  // 2. Le brouillon est invisible sur le site public
  const rBrouillon = await fetch(`${SITE}/actualites/${slug}`, { redirect: "manual" });
  verif(
    rBrouillon.status === 404,
    `Brouillon invisible du public (/${slug} → 404)`,
    `Brouillon accessible au public (/${slug} → ${rBrouillon.status})`,
  );

  // 3. Publication
  const { error: ePub } = await admin.from("actualites").update({
    statut: "publie",
    date_publication: new Date().toISOString(),
  }).eq("id", cree.id);
  verif(!ePub, "Passage au statut publié", `Publication échouée : ${ePub?.message}`);

  // 4. L'article publié apparaît sur le site public
  const rPublie = await fetch(`${SITE}/actualites/${slug}`, { redirect: "manual" });
  const corpsPublie = await rPublie.text();
  verif(
    rPublie.status === 200 && corpsPublie.includes("Article du cycle de test"),
    "Article publié visible sur sa page publique",
    `Article publié invisible (/${slug} → ${rPublie.status})`,
  );

  // 5. Il apparaît aussi dans la liste
  const rListe = await fetch(`${SITE}/actualites`);
  const corpsListe = await rListe.text();
  verif(
    corpsListe.includes("Article du cycle de test"),
    "Article publié présent dans la liste /actualites",
    "Article publié absent de la liste",
  );

  // 6. Modification du titre → répercutée sur le public
  await admin.from("actualites").update({ titre: "Titre modifié en cours de test" }).eq("id", cree.id);
  const rModifie = await fetch(`${SITE}/actualites/${slug}`, { redirect: "manual" });
  const corpsModifie = await rModifie.text();
  verif(
    corpsModifie.includes("Titre modifié en cours de test"),
    "Modification du titre répercutée sur le site public",
    "Modification non visible sur le site public",
  );

  // 7. Dépublication → l'article disparaît
  await admin.from("actualites").update({ statut: "brouillon" }).eq("id", cree.id);
  const rDepub = await fetch(`${SITE}/actualites/${slug}`, { redirect: "manual" });
  verif(
    rDepub.status === 404,
    "Dépublication → l'article redevient inaccessible",
    `Dépublication inefficace (→ ${rDepub.status})`,
  );

  // 8. Suppression
  const { error: eSuppr } = await admin.from("actualites").delete().eq("id", cree.id);
  verif(!eSuppr, "Suppression de l'article", `Suppression échouée : ${eSuppr?.message}`);

  const { data: reste } = await admin.from("actualites").select("id").eq("slug", slug);
  verif((reste ?? []).length === 0, "Article effectivement supprimé de la base", "Article toujours présent après suppression");
}

/* ------------------------------------------------------------------ */
/* F — Formulaires publics                                             */
/* ------------------------------------------------------------------ */

async function testerFormulairesPublics() {
  section("F. FORMULAIRES PUBLICS — insertion anonyme autorisée");

  const clientAnon = createClient(BACKEND, anonKey, { auth: { persistSession: false } });
  const admin = clientAdmin();

  // Contact
  const marqueurC = `form-contact-${Date.now()}`;
  const { error: eC } = await clientAnon.from("contacts").insert({
    nom: "Test Formulaire", email: `${marqueurC}@example.sn`,
    sujet: "Question via le site", message: "Message envoyé depuis le formulaire public.",
  });
  verif(!eC, "Formulaire de contact : insertion anonyme acceptée", `Insertion refusée : ${eC?.message}`);

  const { data: luC } = await admin.from("contacts").select("lu, sujet").eq("email", `${marqueurC}@example.sn`).maybeSingle();
  verif(luC?.lu === false, "Message reçu marqué « non lu » par défaut", "Message non marqué comme non lu");

  // Adhésion
  const marqueurA = `form-adhesion-${Date.now()}`;
  const { error: eA } = await clientAnon.from("adhesions").insert({
    prenom: "Ousmane", nom: "Sow", email: `${marqueurA}@example.sn`,
    quartier: "Diamagueune", motivation: "Je souhaite m'engager.",
  });
  verif(!eA, "Formulaire d'adhésion : insertion anonyme acceptée", `Insertion refusée : ${eA?.message}`);

  const { data: luA } = await admin.from("adhesions").select("statut").eq("email", `${marqueurA}@example.sn`).maybeSingle();
  verif(luA?.statut === "en_attente", "Demande d'adhésion créée « en attente »", `Statut initial : ${luA?.statut}`);

  // Le demandeur ne doit pas relire sa propre demande
  const { data: relecture } = await clientAnon.from("adhesions").select("id").eq("email", `${marqueurA}@example.sn`);
  verif((relecture ?? []).length === 0, "L'anon ne peut pas relire sa demande d'adhésion", "Fuite : l'anon relit sa demande");

  // Nettoyage
  await admin.from("contacts").delete().eq("email", `${marqueurC}@example.sn`);
  await admin.from("adhesions").delete().eq("email", `${marqueurA}@example.sn`);
}

/* ------------------------------------------------------------------ */
/* G — Médiathèque (Supabase Storage)                                  */
/* ------------------------------------------------------------------ */

async function testerMediatheque() {
  section("G. MÉDIATHÈQUE — dépôt, lecture publique, suppression");

  const admin = clientAdmin();
  const clientAnon = createClient(BACKEND, anonKey, { auth: { persistSession: false } });

  // PNG 1×1 valide
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
    "base64",
  );
  const chemin = `e2e-${Date.now()}.png`;

  const { error: eUp } = await admin.storage.from("actualites-images").upload(chemin, png, {
    contentType: "image/png", upsert: false,
  });
  verif(!eUp, "Dépôt d'une image par l'administrateur", `Dépôt refusé : ${eUp?.message}`);

  const { data: pub } = admin.storage.from("actualites-images").getPublicUrl(chemin);
  const rLecture = await fetch(pub.publicUrl);
  verif(
    rLecture.status === 200 && rLecture.headers.get("content-type")?.includes("image/png"),
    "Lecture publique de l'image déposée",
    `Lecture publique échouée : ${rLecture.status}`,
  );

  // Un anonyme ne doit pas pouvoir déposer
  const { error: eUpAnon } = await clientAnon.storage.from("actualites-images").upload(
    `pirate-${Date.now()}.png`, png, { contentType: "image/png" },
  );
  verif(eUpAnon !== null, "Dépôt par un anonyme → refusé", "Faille : un anonyme a déposé un fichier");

  // Suppression
  const { error: eRm } = await admin.storage.from("actualites-images").remove([chemin]);
  verif(!eRm, "Suppression du fichier", `Suppression échouée : ${eRm?.message}`);

  const rApres = await fetch(pub.publicUrl);
  verif(rApres.status === 404, "Fichier effectivement supprimé (404)", `Fichier encore accessible (${rApres.status})`);

  // Nettoyage d'urgence si un fichier pirate était passé
  await admin.storage.from("actualites-images").remove([`pirate-${Date.now()}.png`]).catch(() => {});
}

/* ------------------------------------------------------------------ */
/* H — Export CSV des adhésions                                        */
/* ------------------------------------------------------------------ */

async function testerExportCSV() {
  section("H. EXPORT CSV DES ADHÉSIONS — route sensible");

  // Sans session
  const rAnon = await fetch(`${SITE}/api/admin/adhesions/export`, { redirect: "manual" });
  verif(rAnon.status === 401, "Export sans session → 401", `Export sans session → ${rAnon.status}`);

  // Jeton invalide
  const rFaux = await fetch(`${SITE}/api/admin/adhesions/export`, {
    redirect: "manual",
    headers: { Cookie: "sb-127-auth-token=base64-jeton-invalide" },
  });
  verif(rFaux.status === 401, "Export avec jeton invalide → 401", `Export jeton invalide → ${rFaux.status}`);

  // Administrateur
  const rAdmin = await fetch(`${SITE}/api/admin/adhesions/export`, {
    redirect: "manual",
    headers: { Cookie: cookieSession },
  });
  const corps = await rAdmin.text();
  verif(
    rAdmin.status === 200 && corps.includes("Prénom;Nom;E-mail"),
    "Export par un administrateur → CSV en français",
    `Export admin → ${rAdmin.status}`,
  );

  const entetes = rAdmin.headers;
  verif(
    (entetes.get("cache-control") ?? "").includes("no-store"),
    "Export marqué no-store (données personnelles non mises en cache)",
    "Export cacheable — risque de fuite via un cache partagé",
  );
  verif(
    (entetes.get("content-disposition") ?? "").includes("attachment"),
    "Export proposé en téléchargement, pas en affichage",
    "Export sans en-tête attachment",
  );

  // Échappement RFC 4180 : on sème une valeur piège puis on la relit
  const admin = clientAdmin();
  const marqueur = `csv-${Date.now()}`;
  await admin.from("adhesions").insert({
    prenom: "Aminata", nom: "Diallo", email: `${marqueur}@example.sn`,
    telephone: "+221 77 000 00 01", quartier: "Diamagueune",
    motivation: 'Motivation; avec "guillemets" et un retour\nà la ligne',
  });
  const rCSV = await fetch(`${SITE}/api/admin/adhesions/export`, {
    headers: { Cookie: cookieSession },
  });
  const csv = await rCSV.text();
  const ligne = csv.split("\r\n").find((l) => l.includes(marqueur)) ?? "";
  verif(
    ligne.startsWith('"Aminata"') === false && ligne.includes('""guillemets""'),
    "Échappement CSV conforme RFC 4180 (guillemets doublés, champ protégé)",
    `Échappement CSV incorrect : ${ligne.slice(0, 90)}`,
  );
  await admin.from("adhesions").delete().eq("email", `${marqueur}@example.sn`);
}

/* ------------------------------------------------------------------ */
/* I — Paramètres du site                                              */
/* ------------------------------------------------------------------ */

async function testerParametres() {
  section("I. PARAMÈTRES DU SITE — upsert administrateur");

  const admin = clientAdmin();
  const clientAnon = createClient(BACKEND, anonKey, { auth: { persistSession: false } });

  const avant = await admin.from("parametres").select("valeur").eq("cle", "telephone").maybeSingle();
  const valeurOriginale = avant.data?.valeur ?? "";

  const { error: eUp } = await admin
    .from("parametres")
    .upsert([{ cle: "telephone", valeur: "+221 33 961 00 00" }], { onConflict: "cle" });
  verif(!eUp, "Modification d'un paramètre par l'administrateur (upsert)", `Upsert échoué : ${eUp?.message}`);

  const apres = await admin.from("parametres").select("valeur").eq("cle", "telephone").maybeSingle();
  verif(apres.data?.valeur === "+221 33 961 00 00", "Nouvelle valeur effectivement enregistrée", "Valeur non persistée");

  // Un anonyme ne doit pas pouvoir modifier les paramètres
  const { error: eAnon } = await clientAnon
    .from("parametres")
    .upsert([{ cle: "telephone", valeur: "numero pirate" }], { onConflict: "cle" });
  const relecture = await admin.from("parametres").select("valeur").eq("cle", "telephone").maybeSingle();
  verif(
    eAnon !== null || relecture.data?.valeur === "+221 33 961 00 00",
    "Modification des paramètres par un anonyme → refusée",
    "Faille : un anonyme a modifié les paramètres du site",
  );

  // Restauration
  await admin.from("parametres").upsert([{ cle: "telephone", valeur: valeurOriginale }], { onConflict: "cle" });
}

/* ------------------------------------------------------------------ */
/* J — Protections anti-robot (§7.5)                                   */
/* ------------------------------------------------------------------ */

async function testerAntiRobot() {
  section("J. PROTECTIONS ANTI-ROBOT (§7.5)");

  // Le module est écrit en TypeScript : on le transpile à la volée plutôt que
  // de dupliquer sa logique ici, ce qui ne testerait qu'une copie.
  const os = require("os");
  const { execFileSync } = require("child_process");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ccjp-antibot-"));
  try {
    execFileSync(
      process.execPath,
      [
        "node_modules/typescript/bin/tsc",
        "src/lib/anti-bot.ts",
        "--outDir", tmp,
        "--module", "commonjs",
        "--target", "ES2020",
        "--moduleResolution", "node",
        "--skipLibCheck",
      ],
      { stdio: "pipe" },
    );
    const mod = require(path.join(tmp, "anti-bot.js"));
    const { examinerSoumission, DELAI_MINIMUM_MS, CHAMP_PIEGE, CHAMP_DEBUT } = mod;

    const form = (champs) => {
      const f = new FormData();
      for (const [k, v] of Object.entries(champs)) f.append(k, v);
      return f;
    };

    // 1. Champ piège rempli → rejet silencieux
    const piege = examinerSoumission(
      form({ [CHAMP_PIEGE]: "CCJP SARL", [CHAMP_DEBUT]: String(Date.now() - 10_000) }),
    );
    verif(piege.issue === "silencieux", "Champ piège rempli → soumission écartée", `Verdict inattendu : ${piege.issue}`);

    // 2. Envoi trop rapide → rejet
    const rapide = examinerSoumission(
      form({ [CHAMP_DEBUT]: String(Date.now() - 200) }),
    );
    verif(rapide.issue === "tropRapide", "Envoi 0,2 s après l'affichage → écarté", `Verdict inattendu : ${rapide.issue}`);

    // 3. Horodatage absent → écarté
    const sansHorodatage = examinerSoumission(form({}));
    verif(sansHorodatage.issue === "horlogeInvalide", "Horodatage absent → écarté", `Verdict inattendu : ${sansHorodatage.issue}`);

    // 4. Horodatage dans le futur → écarté
    const futur = examinerSoumission(
      form({ debut_saisie: String(Date.now() + 600_000) }),
    );
    verif(futur.issue === "horlogeInvalide", "Horodatage dans le futur → écarté", `Verdict inattendu : ${futur.issue}`);

    // 5. Vraie personne → autorisée
    const humain = examinerSoumission(
      form({ [CHAMP_DEBUT]: String(Date.now() - (DELAI_MINIMUM_MS + 5_000)) }),
    );
    verif(humain.issue === "autoriser", "Saisie en 8 s → autorisée", `Verdict inattendu : ${piege.issue}`);

    // 6. Champ piège vide ou absent → pas de faux positif
    const piegeVide = examinerSoumission(
      form({ [CHAMP_PIEGE]: "   ", [CHAMP_DEBUT]: String(Date.now() - 10_000) }),
    );
    verif(piegeVide.issue === "autoriser", "Champ piège laissé vide (espaces) → autorisé", `Verdict inattendu : ${piegeVide.issue}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------ */
/* K — Nettoyage final                                                 */
/* ------------------------------------------------------------------ */

async function nettoyer() {
  const pg = new Client(PG);
  await pg.connect();
  await pg.query(`delete from public.actualites where slug like 'e2e-%'`);
  await pg.query(`delete from public.contacts   where email like 'form-contact-%' or email like 'rls-test-%'`);
  await pg.query(`delete from public.adhesions  where email like 'form-adhesion-%' or email like 'csv-%'`);
  await pg.end();
}

/* ------------------------------------------------------------------ */
/* Programme principal                                                 */
/* ------------------------------------------------------------------ */

(async () => {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  CCJP — Tests de bout en bout (P5.5 parcours, P5.6 sécurité)");
  console.log("══════════════════════════════════════════════════════════════");

  try {
    const fs = require("fs");
    const env = fs.readFileSync("/home/user/CCJP/.env.local", "utf8");
    anonKey = /NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/.exec(env)?.[1]?.trim() ?? "";
    if (!anonKey) throw new Error("Clé anonyme introuvable dans .env.local");
  } catch (e) {
    console.error(`\n❌ .env.local illisible : ${e.message}`);
    process.exit(1);
  }

  try {
    await testerSitePublic();
    await testerAuthentification();
    await testerProtectionAdmin();
    await testerRLS();
    await testerCyclePublication();
    await testerFormulairesPublics();
    await testerMediatheque();
    await testerExportCSV();
    await testerParametres();
    await testerAntiRobot();
  } catch (e) {
    echec(`Exception interrompant la suite : ${e.message}`);
    console.error(e);
  }

  await nettoyer().catch(() => {});

  console.log(details.join("\n"));
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log(`  RÉSULTAT : ${reussites} réussis, ${echecs} échoués`);
  console.log("══════════════════════════════════════════════════════════════");

  if (echecs === 0) {
    console.log(`
  Non couvert par cette suite (nécessite un navigateur) :
    · l'invocation HTTP littérale des Server Actions Next.js ;
    · l'hydratation React et le rendu visuel des formulaires.

  Ces points sont couverts par la compilation (tsc, lint) et par le fait que
  chaque page rend, mais pas par une exécution automatisée ici.
`);
  }
  process.exit(echecs === 0 ? 0 : 1);
})();
