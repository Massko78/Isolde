-- À exécuter dans Supabase > SQL Editor > New query > Run
-- Autorise la publication de nouveaux recueils et poèmes depuis le site

create policy "ajout public recueils" on collections for insert with check (true);
create policy "ajout public poemes" on poems for insert with check (true);
