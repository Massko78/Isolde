-- Réponses aux commentaires dans Inspiration
alter table classic_comments add column if not exists parent_id bigint references classic_comments(id) on delete cascade;
