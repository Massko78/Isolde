-- ============================================
-- Modération : à exécuter dans Supabase >
-- SQL Editor > New query > Run
--
-- IMPORTANT : exécute ceci APRÈS qu'Issam ait
-- créé son compte avec issamlol12@gmail.com,
-- sinon la mise à jour ne trouvera personne.
-- ============================================

-- Marqueur "modérateur" sur le profil
alter table profiles add column is_moderator boolean not null default false;

-- Donne le rôle modérateur au compte d'Issam
update profiles set is_moderator = true
where id = (select id from auth.users where email = 'issamlol12@gmail.com');

-- Table des signalements
create table reports (
  id bigint generated always as identity primary key,
  target_type text not null check (target_type in ('poem', 'comment')),
  target_id bigint not null,
  reason text,
  created_at timestamptz default now()
);

alter table reports enable row level security;

create policy "ajout public signalements" on reports for insert with check (true);

create policy "lecture moderateur signalements" on reports for select using (
  exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);

create policy "suppression moderateur signalements" on reports for delete using (
  exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);

-- Droits de suppression : auteur de son propre contenu,
-- ou modérateur sur tout
create policy "suppression recueils" on collections for delete using (
  auth.uid() = author_id
  or exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);

create policy "suppression poemes" on poems for delete using (
  exists (
    select 1 from collections c
    where c.id = collection_id
      and (c.author_id = auth.uid()
           or exists (select 1 from profiles where id = auth.uid() and is_moderator = true))
  )
);

create policy "suppression commentaires" on comments for delete using (
  exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);
