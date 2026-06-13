-- ============================================
-- Comptes utilisateurs — à exécuter dans
-- Supabase > SQL Editor > New query > Run
-- ============================================

-- Table des profils (1 par utilisateur inscrit)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "lecture publique profils" on profiles for select using (true);
create policy "creation propre profil" on profiles for insert with check (auth.uid() = id);
create policy "maj propre profil" on profiles for update using (auth.uid() = id);

-- Relier les recueils à leur auteur (compte)
alter table collections add column author_id uuid references auth.users(id);

-- Mettre à jour la policy d'ajout de recueils :
-- seuls les utilisateurs connectés peuvent publier
drop policy if exists "ajout public recueils" on collections;
create policy "ajout recueils connecte" on collections
  for insert
  with check (auth.uid() is not null and auth.uid() = author_id);

drop policy if exists "ajout public poemes" on poems;
create policy "ajout poemes connecte" on poems
  for insert
  with check (
    auth.uid() is not null
    and exists (
      select 1 from collections c
      where c.id = collection_id and c.author_id = auth.uid()
    )
  );

-- ============================================
-- IMPORTANT : dans le dashboard Supabase,
-- va dans Authentication > Providers > Email
-- et désactive "Confirm email" pour que les
-- comptes soient utilisables immédiatement
-- après l'inscription (pas d'email à valider).
-- ============================================
