-- ============================================
-- Fix likes_count : autoriser la mise à jour
-- du compteur par tout le monde
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

-- Permettre à tout le monde de mettre à jour likes_count
-- (le seul champ public qui change sans authentification)
drop policy if exists "maj public likes" on poems;
create policy "maj public likes" on poems
  for update using (true)
  with check (true);

-- S'assurer que la table likes existe (au cas où)
create table if not exists likes (
  id bigint generated always as identity primary key,
  poem_id bigint references poems(id) on delete cascade,
  voter_id text not null,
  created_at timestamptz default now(),
  unique (poem_id, voter_id)
);

alter table likes enable row level security;

drop policy if exists "lecture publique likes" on likes;
create policy "lecture publique likes" on likes for select using (true);

drop policy if exists "ajout likes" on likes;
create policy "ajout likes" on likes for insert with check (true);

drop policy if exists "suppression likes" on likes;
create policy "suppression likes" on likes for delete using (true);
