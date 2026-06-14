-- ============================================
-- Remontée recueils + poèmes libres + DM
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

-- 1. Colonne updated_at sur collections
alter table collections add column if not exists updated_at timestamptz default now();
update collections set updated_at = created_at where updated_at is null;

-- Trigger : quand un poème est ajouté/modifié dans un recueil,
-- updated_at du recueil se met à jour automatiquement
create or replace function touch_collection() returns trigger as $$
begin
  if new.collection_id is not null then
    update collections set updated_at = now() where id = new.collection_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists poem_touches_collection on poems;
create trigger poem_touches_collection
after insert or update on poems
for each row execute function touch_collection();

-- 2. Colonne updated_at sur les poèmes libres
alter table poems add column if not exists updated_at timestamptz default now();
update poems set updated_at = created_at where updated_at is null;

-- 3. Table conversations DM
create table if not exists conversations (
  id bigint generated always as identity primary key,
  participant_a uuid references auth.users(id) on delete cascade,
  participant_b uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  last_message_at timestamptz default now(),
  unique (participant_a, participant_b)
);

alter table conversations enable row level security;
create policy "lecture propre conversations" on conversations for select using (
  auth.uid() = participant_a or auth.uid() = participant_b
);
create policy "creation conversation" on conversations for insert with check (
  auth.uid() = participant_a or auth.uid() = participant_b
);
create policy "maj conversation" on conversations for update using (
  auth.uid() = participant_a or auth.uid() = participant_b
);

-- 4. Table messages DM
create table if not exists messages (
  id bigint generated always as identity primary key,
  conversation_id bigint references conversations(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  read_at timestamptz
);

alter table messages enable row level security;
create policy "lecture messages conversation" on messages for select using (
  exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
  )
);
create policy "envoi messages" on messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from conversations c
    where c.id = conversation_id
    and (c.participant_a = auth.uid() or c.participant_b = auth.uid())
  )
);

-- Trigger : mettre à jour last_message_at de la conversation
create or replace function touch_conversation() returns trigger as $$
begin
  update conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists message_touches_conversation on messages;
create trigger message_touches_conversation
after insert on messages
for each row execute function touch_conversation();
