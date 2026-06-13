-- ============================================
-- Stockage des images uploadées (avatars, couvertures, illustrations)
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "Lecture publique images" on storage.objects;
create policy "Lecture publique images" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "Upload images connecte" on storage.objects;
create policy "Upload images connecte" on storage.objects
  for insert with check (bucket_id = 'images' and auth.uid() is not null);

drop policy if exists "Maj images proprietaire" on storage.objects;
create policy "Maj images proprietaire" on storage.objects
  for update using (bucket_id = 'images' and owner = auth.uid());

drop policy if exists "Suppression images proprietaire" on storage.objects;
create policy "Suppression images proprietaire" on storage.objects
  for delete using (bucket_id = 'images' and owner = auth.uid());
