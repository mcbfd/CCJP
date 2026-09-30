-- =====================================================================
-- CCJP — Migration 0004 : buckets de stockage (Supabase Storage)
--
-- Source : Cahier des Charges v1.0 §4.3
--          PLAN_IMPLEMENTATION.md §7.4
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('actualites-images', 'actualites-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('membres-photos', 'membres-photos', true, 2097152,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('evenements-images', 'evenements-images', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', true, 20971520,
   array['application/pdf',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);

-- =====================================================================
-- Lecture publique sur tous les buckets
-- =====================================================================
create policy "Lecture publique actualites-images"
  on storage.objects for select using (bucket_id = 'actualites-images');

create policy "Lecture publique membres-photos"
  on storage.objects for select using (bucket_id = 'membres-photos');

create policy "Lecture publique evenements-images"
  on storage.objects for select using (bucket_id = 'evenements-images');

create policy "Lecture publique documents"
  on storage.objects for select using (bucket_id = 'documents');

-- =====================================================================
-- Écriture réservée aux administrateurs habilités
-- =====================================================================
create policy "Admins déposent des fichiers"
  on storage.objects for insert with check (public.is_admin());

create policy "Admins mettent à jour des fichiers"
  on storage.objects for update using (public.is_admin());

create policy "Admins suppriment des fichiers"
  on storage.objects for delete using (public.is_admin());

-- =====================================================================
-- NOTE — le format AVIF est volontairement absent des types autorisés.
--
-- L'avis de sécurité GHSA-2xp9-vwfh-vxw4 (« Unauthenticated Remote Code
-- Execution in Image Optimization API when AVIF files are used ») affecte
-- toutes les versions de Next.js antérieures à 15.5.24, donc toute la ligne
-- 14.x utilisée par ce projet. Voir docs/SECURITE.md §2.
-- =====================================================================
