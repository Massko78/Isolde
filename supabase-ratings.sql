-- ============================================
-- Système de notes (étoiles) sur les poèmes
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

create table ratings (
  id bigint generated always as identity primary key,
  poem_id bigint references poems(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  created_at timestamptz default now(),
  unique (poem_id, user_id)
);

alter table ratings enable row level security;

create policy "lecture publique notes" on ratings for select using (true);
create policy "notation connectee insert" on ratings for insert with check (auth.uid() = user_id);
create policy "notation connectee update" on ratings for update using (auth.uid() = user_id);
