-- =====================================================================
-- CCJP — Migration 0002 : Sécurité au niveau des lignes (RLS)
--
-- ⚠️ À APPLIQUER IMMÉDIATEMENT APRÈS 0001, AVANT TOUTE DONNÉE RÉELLE.
--
-- Source : PLAN_IMPLEMENTATION.md §6.5 et §7.1
-- Voir docs/SECURITE.md pour l'explication de la faille corrigée.
-- =====================================================================

-- ---------- Fonction d'habilitation -----------------------------------
-- security definer + search_path figé : évite les attaques par
-- détournement de search_path et les récursions de politiques.
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

-- ---------- Activation RLS sur toutes les tables -----------------------
alter table public.commissions             enable row level security;
alter table public.membres_bureau          enable row level security;
alter table public.actualites              enable row level security;
alter table public.evenements              enable row level security;
alter table public.projets_phares          enable row level security;
alter table public.adhesions               enable row level security;
alter table public.contacts                enable row level security;
alter table public.medias                  enable row level security;
alter table public.statistiques_indicateurs enable row level security;
alter table public.parametres              enable row level security;
alter table public.admins                  enable row level security;

-- =====================================================================
-- LECTURE PUBLIQUE
-- =====================================================================
create policy "Commissions lisibles publiquement"
  on public.commissions for select using (true);

create policy "Membres du bureau lisibles publiquement"
  on public.membres_bureau for select using (true);

-- Seules les actualités publiées sont visibles du public.
create policy "Actualités publiées lisibles publiquement"
  on public.actualites for select using (statut = 'publie');

create policy "Événements lisibles publiquement"
  on public.evenements for select using (true);

create policy "Projets phares lisibles publiquement"
  on public.projets_phares for select using (true);

create policy "Médias lisibles publiquement"
  on public.medias for select using (true);

create policy "Indicateurs actifs lisibles publiquement"
  on public.statistiques_indicateurs for select using (actif);

-- Les paramètres non sensibles sont lisibles par le site public.
create policy "Paramètres non sensibles lisibles publiquement"
  on public.parametres for select
  using (cle not like '%secret%' and cle not like '%token%' and cle not like '%password%');

-- =====================================================================
-- ÉCRITURE — réservée aux administrateurs habilités
-- =====================================================================
create policy "Admins gèrent les commissions"
  on public.commissions for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les membres du bureau"
  on public.membres_bureau for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les actualités"
  on public.actualites for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les événements"
  on public.evenements for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les projets phares"
  on public.projets_phares for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les médias"
  on public.medias for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les indicateurs"
  on public.statistiques_indicateurs for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins gèrent les paramètres"
  on public.parametres for all
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- ADHÉSIONS ET MESSAGES
-- Le public peut CRÉER, jamais lire ni modifier.
-- =====================================================================
create policy "Admins lisent les adhésions"
  on public.adhesions for select using (public.is_admin());

create policy "Admins traitent les adhésions"
  on public.adhesions for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Le public peut soumettre une adhésion"
  on public.adhesions for insert with check (true);

create policy "Admins lisent les messages"
  on public.contacts for select using (public.is_admin());

create policy "Admins gèrent les messages"
  on public.contacts for update
  using (public.is_admin()) with check (public.is_admin());

create policy "Le public peut envoyer un message"
  on public.contacts for insert with check (true);

-- =====================================================================
-- TABLE ADMINS — auto-lecture uniquement, gestion par SQL
-- =====================================================================
create policy "Un admin voit sa propre ligne"
  on public.admins for select using (user_id = auth.uid());

create policy "Admins voient tous les admins"
  on public.admins for select using (public.is_admin());

-- =====================================================================
-- CRÉATION DU PREMIER ADMINISTRATEUR
--
-- 1. Dans Supabase Dashboard → Authentication → Users → « Add user »
--    Créer l'utilisateur (email + mot de passe, cocher « Auto Confirm »).
--    Relever son UUID.
--
-- 2. Puis exécuter, en remplaçant l'UUID :
--
--    insert into public.admins (user_id, email, nom)
--    values ('UUID-DU-PREMIER-ADMIN', 'president@ccjp-podor.sn', 'Président du CCJP');
--
-- Répéter l'opération pour chaque administrateur. Un compte par responsable
-- de commission est recommandé (CDC §6.1).
-- =====================================================================
