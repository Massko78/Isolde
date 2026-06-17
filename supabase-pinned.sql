-- Poème épinglé sur le profil
alter table public.profiles add column if not exists pinned_poem_id bigint;
alter table public.profiles add column if not exists pinned_is_free boolean default false;

-- Zoom et position de la photo de profil
alter table public.profiles add column if not exists avatar_x float default 50;
alter table public.profiles add column if not exists avatar_y float default 50;
alter table public.profiles add column if not exists avatar_zoom float default 1;
