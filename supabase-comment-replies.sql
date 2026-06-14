-- ============================================
-- Réponses aux commentaires
-- À exécuter dans Supabase > SQL Editor > Run
-- ============================================

alter table comments add column parent_id bigint references comments(id) on delete cascade;
