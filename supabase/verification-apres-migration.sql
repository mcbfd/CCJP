-- =====================================================================
-- CCJP — Vérification après application des 4 migrations
--
-- À exécuter dans Supabase → SQL Editor, APRÈS avoir appliqué dans l'ordre :
--   0001_init_schema.sql → 0002_rls_policies.sql → 0003_seed_data.sql
--   → 0004_storage_buckets.sql
--
-- Script en LECTURE SEULE : il ne modifie rien. Il affiche un tableau
-- « contrôle / résultat / attendu ». Toutes les lignes doivent indiquer OK.
-- =====================================================================

with verifications as (
  -- Structure : 11 tables attendues
  select 'Tables créées' as controle,
         (select count(*)::text from information_schema.tables
           where table_schema = 'public' and table_type = 'BASE TABLE') as resultat,
         '11' as attendu
  union all
  -- Sécurité : RLS activée sur les 11 tables
  select 'RLS activée',
         (select count(*)::text from pg_class cl
           join pg_namespace n on n.oid = cl.relnamespace
           where n.nspname = 'public' and cl.relkind = 'r' and cl.relrowsecurity),
         '11'
  union all
  -- Politiques de sécurité
  select 'Politiques RLS',
         (select count(*)::text from pg_policies where schemaname = 'public'),
         '24'
  union all
  -- Données d'amorçage
  select 'Commissions',
         (select count(*)::text from public.commissions),
         '14'
  union all
  select 'Indicateurs',
         (select count(*)::text from public.statistiques_indicateurs),
         '8'
  union all
  select 'Paramètres',
         (select count(*)::text from public.parametres),
         '11'
  union all
  -- Numérotation des commissions
  select 'Numéros des commissions',
         (select min(numero)::text || ' à ' || max(numero)::text from public.commissions),
         '1 à 14'
  union all
  -- Stockage
  select 'Buckets Storage',
         (select count(*)::text from storage.buckets),
         '4'
  union all
  -- Recherche plein texte
  select 'Index de recherche',
         (select count(*)::text from pg_indexes
           where schemaname = 'public' and indexname = 'actualites_search_idx'),
         '1'
  union all
  -- Fonction d'habilitation, en security definer
  select 'is_admin() security definer',
         (select case when prosecdef then 'oui' else 'NON' end
            from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname = 'is_admin'),
         'oui'
  union all
  -- Trigger de mise à jour automatique
  select 'Triggers updated_at',
         (select count(*)::text from information_schema.triggers
           where trigger_schema = 'public'
             and trigger_name like '%set_updated_at'),
         '6'
  union all
  -- Cohérence des icônes avec l'application
  select 'Commissions avec icône',
         (select count(*)::text from public.commissions where icone is not null),
         '14'
  union all
  -- Cohérence des couleurs avec la charte graphique
  select 'Couleurs de commission valides',
         (select count(*)::text from public.commissions
           where couleur in ('#1A3A5C', '#1B5E20', '#7B3F00')),
         '14'
)
select
  case when resultat = attendu then 'OK   ' else 'ÉCHEC' end as statut,
  controle,
  resultat,
  attendu
from verifications
order by statut, controle;
