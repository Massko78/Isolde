-- ============================================
-- Abonnements (suivre des auteurs)
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

create table follows (
  id bigint generated always as identity primary key,
  follower_id uuid references auth.users(id) on delete cascade,
  followed_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique (follower_id, followed_id)
);

alter table follows enable row level security;

create policy "lecture publique abonnements" on follows for select using (true);
create policy "creation abonnement" on follows for insert with check (auth.uid() = follower_id);
create policy "suppression abonnement" on follows for delete using (auth.uid() = follower_id);
