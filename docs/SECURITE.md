# Sécurité — CCJP

Document de référence sur les deux décisions de sécurité prises lors de la
Phase 0. À lire par tout développeur intervenant sur le projet.

---

## 1. La faille de la politique RLS du cahier des charges

### Le problème

Le cahier des charges v1.0 (§4.2) propose cette politique :

```sql
CREATE POLICY "Admin full access" ON actualites
  FOR ALL USING (auth.role() = 'authenticated');
```

**`auth.role() = 'authenticated'` est vrai pour n'importe quel utilisateur
connecté à Supabase**, pas seulement pour les administrateurs du CCJP.

Or Supabase Auth permet de créer autant d'utilisateurs que l'on veut. Un
visiteur parvenant à créer un compte — volontairement ou par erreur lors de la
création des comptes — aurait alors le droit de :

- **modifier** toutes les actualités du CCJP ;
- **supprimer** toutes les actualités du CCJP ;
- et faire de même sur `evenements`, `commissions`, `membres_bureau`, etc.

Pour un site institutionnel portant la parole d'une organisation, c'est une
faille critique.

### La correction appliquée

Une table `admins` listant **nominativement** les administrateurs habilités,
et une fonction `is_admin()` utilisée par toutes les politiques d'écriture.

```sql
-- Table (migration 0001)
create table public.admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  email      text not null,
  nom        text,
  actif      boolean not null default true,
  created_at timestamptz not null default now()
);

-- Fonction (migration 0002)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where user_id = auth.uid()
      and actif
  );
$$;

-- Politique (migration 0002)
create policy "Admins gèrent les actualités"
  on public.actualites for all
  using (public.is_admin()) with check (public.is_admin());
```

**Coût de la correction :** 1 table et 1 fonction.
**Bénéfice :** cloisonnement réel des droits — un utilisateur authentifié non
habilité obtient `false` et se voit refuser l'écriture par la base elle-même.

### Pourquoi `security definer` et `search_path`

- `security definer` : la fonction s'exécute avec les privilèges de son
  propriétaire, ce qui lui permet de lire `admins` même si l'appelant n'y a pas
  directement accès.
- `set search_path = public` : sans cela, un attaquant pourrait créer un schéma
  homonyme et détourner la résolution des noms. C'est une attaque connue sur
  les fonctions `security definer`.

### Habilitation d'un administrateur

Les comptes sont créés dans Supabase Dashboard → Authentication → Users, puis
habilités par SQL :

```sql
insert into public.admins (user_id, email, nom)
values ('UUID-DU-COMPTE', 'president@ccjp-podor.sn', 'Président du CCJP');
```

Pour révoquer un accès sans supprimer le compte :

```sql
update public.admins set actif = false where email = 'ancien-admin@ccjp-podor.sn';
```

---

## 2. La version de Next.js et les avis de sécurité

### Décision retenue : Next.js 14.2.35

Le cahier des charges spécifie **Next.js 14**. La Phase 0 a installé la
**14.2.35**, qui est la version la plus à jour de la ligne 14.x et qui corrige
les avis de décembre 2025 sur le protocole React Server Components :

| Avis | Sévérité | Description | Corrigé en |
|---|---|---|---|
| CVE-2025-55183 | Moyenne | Fuite du code source des Server Functions | 14.2.35 |
| CVE-2025-55184 / CVE-2025-67779 | Haute | Déni de service par boucle infinie | 14.2.35 |

### Ce qui reste non corrigé sur la ligne 14.x

L'équipe Next.js **ne rétroporte plus les correctifs de sécurité sur la branche
14.x**. `npm audit` remonte encore 5 vulnérabilités (4 hautes, 1 critique) dont
les correctifs n'existent qu'à partir de la **15.5.x** :

| Avis | Sévérité | Corrigé en | Impact pour le CCJP |
|---|---|---|---|
| GHSA-955p-x3mx-jcvp | Haute | 15.5.21 | Divulgation d'endpoints Server Function |
| GHSA-4c39-4ccg-62r3 | Haute | 15.5.21 | Charge utile Server Action non bornée |
| GHSA-p9j2-gv94-2wf4 | Haute | 15.5.21 | SSRF via les rewrites |
| **GHSA-2xp9-vwfh-vxw4** | **Critique** | 15.5.24 | **RCE via l'API d'optimisation d'image avec AVIF** |
| GHSA-p293-qw3h-jr36 | Critique | 15.5.24 | RCE sur serveurs Windows |

### Mitigations appliquées en restant sur Next.js 14

**1. AVIF désactivé dans `next.config.mjs`** — c'est la mitigation la plus
importante, car l'avis GHSA-2xp9-vwfh-vxw4 est critique et directement lié à une
fonctionnalité que nous utilisons (l'optimisation d'images) :

```js
images: {
  // AVIF volontairement absent — voir docs/SECURITE.md §2
  formats: ["image/webp"],
}
```

Le format AVIF est également retiré de la liste des types MIME autorisés dans
le bucket Storage (migration 0004). WebP offre une compression quasi équivalente.

**2. Aucun `rewrites` ni `redirects` personnalisé** dans `next.config.mjs`, ce
qui neutralise GHSA-p9j2-gv94-2wf4 (SSRF via les rewrites).

**3. Server Actions limitées et validées** : toutes les entrées sont validées
par Zod côté serveur avant tout accès à la base (Phase 4).

**4. Serveurs Linux/Vercel uniquement** : GHSA-p293-qw3h-jr36 ne concerne que
les serveurs Windows auto-hébergés, ce qui n'est pas notre cas.

**5. Vulnérabilités de build uniquement** : `postcss`, `glob`,
`eslint-config-next` et `@next/eslint-plugin-next` sont des dépendances de
développement, sollicitées au moment du build et non exposées en production.
Risque résiduel faible, à revoir lors de la montée de version.

### Marche à suivre si le Bureau décide de monter en version

Le code produit est compatible Next.js 15/16 sans réécriture (l'App Router et
les Server Actions sont identiques). La migration se limite à :

```bash
npm install next@15.5.9 eslint-config-next@15.5.9
# puis réactiver AVIF dans next.config.mjs si souhaité
npm run build   # vérification
```

**Recommandation :** prévoir cette montée de version dans les 3 mois suivant la
mise en production. Elle ne demande aucun changement de code applicatif.

---

## 3. Règles permanentes du projet

| # | Règle |
|---|---|
| 1 | La clé `SUPABASE_SERVICE_ROLE_KEY` n'a **jamais** le préfixe `NEXT_PUBLIC_` |
| 2 | `src/lib/supabase/admin.ts` n'est **jamais** importé par un composant client |
| 3 | Toute nouvelle table reçoit `enable row level security` dès sa création |
| 4 | Toute nouvelle table publique reçoit au moins une politique `select` |
| 5 | Aucun secret n'est commité ; `.env.local` est ignoré par Git |
| 6 | Toute entrée utilisateur est validée par Zod côté serveur |
| 7 | Les 7 tests de sécurité du plan (§16.1) sont repassés avant chaque mise en production |

---

*CCJP — Conseil Consultatif des Jeunes de Podor · Écoute · Participation · Impact*
