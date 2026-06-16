-- ============================================
-- Auto-création du profil à l'inscription
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

-- Trigger qui crée automatiquement un profil
-- dès qu'un nouveau compte auth est créé,
-- même si l'insertion frontend a échoué
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      -- Essaie d'utiliser le pseudo passé en metadata
      new.raw_user_meta_data->>'username',
      -- Sinon, derive du mail
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
