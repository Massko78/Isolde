-- ============================================
-- Édition, couvertures, poèmes libres
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

-- Couverture de recueil
alter table collections add column cover_url text;

-- Poèmes libres : un poème peut ne pas appartenir à un recueil
-- (collection_id était déjà nullable). On ajoute un auteur direct
-- pour ces poèmes-là.
alter table poems add column author_id uuid references auth.users(id);
alter table poems add column author text;

-- Mise à jour des policies pour gérer les poèmes libres
drop policy if exists "lecture poemes" on poems;
create policy "lecture poemes" on poems for select using (
  status = 'published'
  or author_id = auth.uid()
  or exists (select 1 from collections c where c.id = collection_id and c.author_id = auth.uid())
);

drop policy if exists "ajout poemes connecte" on poems;
create policy "ajout poemes connecte" on poems for insert with check (
  auth.uid() is not null
  and (
    (collection_id is not null and exists (select 1 from collections c where c.id = collection_id and c.author_id = auth.uid()))
    or (collection_id is null and author_id = auth.uid())
  )
);

drop policy if exists "maj poemes propres" on poems;
create policy "maj poemes propres" on poems for update using (
  author_id = auth.uid()
  or exists (select 1 from collections c where c.id = collection_id and c.author_id = auth.uid())
);

drop policy if exists "suppression poemes" on poems;
create policy "suppression poemes" on poems for delete using (
  author_id = auth.uid()
  or exists (
    select 1 from collections c
    where c.id = collection_id
      and (c.author_id = auth.uid()
           or exists (select 1 from profiles where id = auth.uid() and is_moderator = true))
  )
  or exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);
