-- ============================================
-- Brouillons : à exécuter dans Supabase >
-- SQL Editor > New query > Run
-- ============================================

alter table poems add column status text not null default 'published' check (status in ('draft', 'published'));

-- Les brouillons ne sont visibles que par leur auteur
drop policy if exists "lecture publique poems" on poems;
create policy "lecture poemes" on poems for select using (
  status = 'published'
  or exists (select 1 from collections c where c.id = collection_id and c.author_id = auth.uid())
);

-- L'auteur peut modifier ses propres poèmes (pour éditer un brouillon)
create policy "maj poemes propres" on poems for update using (
  exists (select 1 from collections c where c.id = collection_id and c.author_id = auth.uid())
);
