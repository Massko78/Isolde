-- ============================================
-- Schéma "Vers" — à exécuter dans Supabase :
-- Dashboard > SQL Editor > New query > coller > Run
-- ============================================

create table collections (
  id bigint generated always as identity primary key,
  title text not null,
  author text not null,
  theme text not null,
  seal text not null,
  seal_color text not null,
  created_at timestamptz default now()
);

create table poems (
  id bigint generated always as identity primary key,
  collection_id bigint references collections(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  position int not null default 0,
  likes_count int not null default 0,
  created_at timestamptz default now()
);

create table comments (
  id bigint generated always as identity primary key,
  poem_id bigint references poems(id) on delete cascade,
  author text,
  anonymous boolean not null default false,
  content text not null,
  created_at timestamptz default now()
);

-- Sécurité : lecture publique pour tout le monde,
-- et écriture publique pour les likes/commentaires
-- (pas de comptes utilisateurs pour l'instant)
alter table collections enable row level security;
alter table poems enable row level security;
alter table comments enable row level security;

create policy "lecture publique collections" on collections for select using (true);
create policy "lecture publique poems" on poems for select using (true);
create policy "lecture publique comments" on comments for select using (true);

create policy "ajout public commentaires" on comments for insert with check (true);
create policy "maj public likes" on poems for update using (true);

-- ============================================
-- Données de départ
-- ============================================

insert into collections (title, author, theme, seal, seal_color) values
('Marées basses', 'Inès Carrier', 'Nature & solitude', 'M', '#8B3A4A'),
('Les heures creuses', 'Tom Iyer', 'Ville & nuit', 'H', '#6E7F5C'),
('Petites guerres', 'Aïcha Belmont', 'Famille & mémoire', 'G', '#7C8194'),
('Cartographies', 'Lou Janvier', 'Voyage & départs', 'C', '#8B3A4A');

insert into poems (collection_id, title, content, image_url, position) values
(1, 'Marée basse', 'La mer a reculé sans bruit,
laissant sur le sable
la forme exacte de son absence.

Je marche dans ce creux
comme on entre dans une pièce
où quelqu''un vient de partir.

Tout est encore tiède.
Rien n''est encore parti pour de bon.', 'https://picsum.photos/seed/maree-basse/900/500', 0),

(1, 'Coquillage', 'Je porte la mer à mon oreille
et j''entends ma propre maison.

Le bruit du large
n''est jamais que le bruit du sang
qui cherche une sortie.', null, 1),

(1, 'Brouillard', 'Le matin efface les bateaux
un à un, comme des noms
qu''on oublie poliment.

Je reste sur la jetée
à attendre que la mer
me rende quelque chose.', null, 2),

(2, '3h12', 'La ville dort à moitié,
un œil ouvert sur le frigo,
l''autre sur rien du tout.

Je pourrais écrire quelque chose de beau
mais j''écris juste l''heure
pour me prouver que j''étais là.', null, 0),

(2, 'Distributeur', 'Il avale ma carte
et hésite,
comme tout le monde ce mois-ci.', null, 1),

(3, 'Table de cuisine', 'On ne se dit jamais je t''aime,
on se ressert du café
jusqu''à ce que ça veuille dire ça.

Ma mère range les assiettes
comme on range une dispute :
vite, et au bon endroit.', null, 0),

(3, 'Héritage', 'J''ai hérité de sa façon
de fermer les portes trop fort
quand tout va bien.', null, 1),

(3, 'Dimanche', 'Le dimanche soir a un goût précis :
celui du linge encore humide
qu''on n''a pas eu le courage d''étendre.', null, 2),

(4, 'Frontière', 'Sur la carte, une ligne fine
sépare deux pays.
Sur le terrain, il y a juste de l''herbe,
et un panneau que personne ne lit.', null, 0),

(4, 'Valise', 'Je referme la valise
sur tout ce que je n''ai pas pris
— c''est toujours le plus lourd.', null, 1);

-- Quelques commentaires de départ sur "Marée basse"
insert into comments (poem_id, author, anonymous, content) values
(1, 'Léa M.', false, 'Le dernier vers m''a retourné l''estomac.'),
(1, null, true, '« la forme exacte de son absence » — j''y pense depuis ce matin.');
