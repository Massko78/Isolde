-- Bannière de profil
alter table public.profiles add column if not exists banner_url text;
alter table public.profiles add column if not exists banner_position float default 50;
