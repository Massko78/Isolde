-- ============================================
-- Challenges + Collections collaboratives
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

-- 1. Challenges hebdomadaires
create table if not exists challenges (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  week_number int not null,
  year int not null,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique (week_number, year)
);

alter table challenges enable row level security;
create policy "lecture publique challenges" on challenges for select using (true);
create policy "creation challenge moderateur" on challenges for insert with check (
  exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);
create policy "maj challenge moderateur" on challenges for update using (
  exists (select 1 from profiles where id = auth.uid() and is_moderator = true)
);

-- Lien poème → challenge
alter table poems add column if not exists challenge_id bigint references challenges(id);

-- 2. Collections collaboratives
alter table collections add column if not exists is_collab boolean default false;

create table if not exists collab_invites (
  id bigint generated always as identity primary key,
  collection_id bigint references collections(id) on delete cascade,
  invitee_id uuid references auth.users(id) on delete cascade,
  invited_by uuid references auth.users(id),
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  unique (collection_id, invitee_id)
);

alter table collab_invites enable row level security;
create policy "lecture invitations propres" on collab_invites for select using (
  invitee_id = auth.uid()
  or invited_by = auth.uid()
  or exists (select 1 from collections c where c.id = collection_id and c.author_id = auth.uid())
);
create policy "creation invitation" on collab_invites for insert with check (
  exists (select 1 from collections c where c.id = collection_id and c.author_id = auth.uid())
);
create policy "maj invitation" on collab_invites for update using (invitee_id = auth.uid());

-- Permettre aux collaborateurs d'ajouter des poèmes
drop policy if exists "ajout poemes connecte" on poems;
create policy "ajout poemes connecte" on poems for insert with check (
  auth.uid() is not null
  and (
    -- poème dans un recueil dont on est auteur
    (collection_id is not null and exists (
      select 1 from collections c where c.id = collection_id and c.author_id = auth.uid()
    ))
    -- poème dans un recueil collaboratif où on est invité accepté
    or (collection_id is not null and exists (
      select 1 from collab_invites ci
      where ci.collection_id = collection_id
        and ci.invitee_id = auth.uid()
        and ci.status = 'accepted'
    ))
    -- poème libre
    or (collection_id is null and author_id = auth.uid())
  )
);
