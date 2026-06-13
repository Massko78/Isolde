-- ============================================
-- Correction du système de likes + avatars
-- sur les commentaires
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

-- Remettre les compteurs corrompus (négatifs) à 0
update poems set likes_count = 0 where likes_count < 0;

-- Table des likes individuels (un par poème + "votant")
create table likes (
  id bigint generated always as identity primary key,
  poem_id bigint references poems(id) on delete cascade,
  voter_id text not null,
  created_at timestamptz default now(),
  unique (poem_id, voter_id)
);

alter table likes enable row level security;
create policy "lecture publique likes" on likes for select using (true);
create policy "ajout likes" on likes for insert with check (true);
create policy "suppression likes" on likes for delete using (true);

-- Garder poems.likes_count synchronisé automatiquement
create or replace function update_likes_count() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update poems set likes_count = likes_count + 1 where id = new.poem_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update poems set likes_count = greatest(likes_count - 1, 0) where id = old.poem_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists likes_count_trigger on likes;
create trigger likes_count_trigger
after insert or delete on likes
for each row execute function update_likes_count();

-- Lier les commentaires à un profil pour afficher l'avatar
alter table comments add column author_id uuid references auth.users(id);
